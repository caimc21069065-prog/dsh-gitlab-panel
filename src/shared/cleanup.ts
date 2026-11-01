import type { Branch, MergeRequest } from "./types"

export type CleanupReason =
  | { readonly kind: "merged-mr" | "closed-mr"; readonly number: number }
  | { readonly kind: "gone" }
  | { readonly kind: "merged"; readonly base: string }

export interface CleanupCandidate {
  readonly name: string
  readonly reasons: readonly CleanupReason[]
  readonly risk: "unpushed" | "moved" | "unmerged" | null
}

/** Local branches that look done with: merged/closed MR, deleted upstream, or merged into the default branch. */
export function cleanupCandidates(input: {
  readonly branches: readonly Branch[]
  readonly current: string | null
  readonly base: string | null
  readonly merged: readonly string[]
  readonly mrFor: (name: string) => MergeRequest | undefined
}): CleanupCandidate[] {
  return input.branches.flatMap((branch): CleanupCandidate[] => {
    if (branch.remote || branch.current || branch.worktree || branch.name === input.current || branch.name === input.base) return []
    const mr = input.mrFor(branch.name)
    if (mr?.state === "OPEN") return []
    const merged = input.merged.includes(branch.name)
    const reasons: CleanupReason[] = [
      ...(mr ? [{ kind: mr.state === "MERGED" ? ("merged-mr" as const) : ("closed-mr" as const), number: mr.number }] : []),
      ...(branch.gone ? [{ kind: "gone" as const }] : []),
      ...(merged && input.base ? [{ kind: "merged" as const, base: input.base }] : []),
    ]
    if (reasons.length === 0) return []
    return [{ name: branch.name, reasons, risk: merged ? null : risk(branch, mr) }]
  })
}

function risk(branch: Branch, mr: MergeRequest | undefined): CleanupCandidate["risk"] {
  if (branch.ahead > 0) return "unpushed"
  const published = !!branch.upstream && !branch.gone
  if (mr) return !published && mr.sha && !mr.sha.startsWith(branch.sha) ? "moved" : null
  return published ? null : "unmerged"
}
