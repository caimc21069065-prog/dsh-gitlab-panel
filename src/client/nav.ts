import type { ItemKind } from "../shared/types"

export type MainPage = "inbox" | "activity" | "runs"

export interface MainParams {
  page?: "main"
  view?: "changes" | "history" | "mrs" | "issues"
  show?: MainPage
  repo?: string
  cwd?: string
}

export interface ItemParams {
  page: "item"
  repo: string
  kind: ItemKind
  number: number
}

export interface RunParams {
  page: "run"
  repo: string
  id: number
}

export interface CommitParams {
  page: "commit"
  repo: string
  sha: string
}

export type PanelParams = MainParams | ItemParams | RunParams | CommitParams

export const nav = {
  openMain(_params: MainParams = {}): void {},
  openItem(_input: { repo: string; kind: ItemKind; number: number }): void {},
  openRun(_input: { repo: string; id: number }): void {},
  openCommit(_input: { repo: string; sha: string }): void {},
  openActivity(): void {},
  openInbox(): void {},
  openRuns(): void {},
}

export function isItemParams(params: unknown): params is ItemParams {
  return typeof params === "object" && params !== null && (params as ItemParams).page === "item"
}

export function itemTitle(kind: ItemKind, number: number) {
  return `${kind === "mr" ? "!" : "#"}${number}`
}
