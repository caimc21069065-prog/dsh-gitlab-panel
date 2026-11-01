import { build, context } from "esbuild"
import { rm } from "node:fs/promises"

const watch = process.argv.includes("--watch")
const pkg = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("../package.json", import.meta.url), "utf8"))

const SHARED = [
  "react",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "@deepseek-ai/cordis",
  "zod",
  "@tanstack/react-virtual",
  "@deepseek-ai/dsh-client-store",
  "@deepseek-ai/dsh-client-ui-slots",
  "@deepseek-ai/dsh-client-ui-primitives",
  "@deepseek-ai/dsh-client-ui-dockkit",
]

const host = {
  entryPoints: ["src/host/index.ts"],
  outfile: "lib/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  external: ["node:*"],
}

const client = {
  entryPoints: ["src/client/index.tsx"],
  outfile: "lib/client.js",
  bundle: true,
  platform: "browser",
  format: "cjs",
  target: "es2022",
  jsx: "automatic",
  external: SHARED,
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.MODE": '"production"',
  },
  banner: {
    js: `var module = { exports: {} }; var exports = module.exports;\nwindow.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => {`,
  },
  footer: {
    js: "return module.exports; } });",
  },
  logLevel: "info",
}

if (!watch) await rm("lib", { recursive: true, force: true })

if (watch) {
  const a = await context(host)
  const b = await context(client)
  await Promise.all([a.watch(), b.watch()])
  console.log("[dsh-gitlab-panel] watching")
} else {
  await Promise.all([build(host), build(client)])
  console.log("[dsh-gitlab-panel] built lib/index.js and lib/client.js")
}
