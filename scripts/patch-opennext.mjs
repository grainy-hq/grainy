import { readFileSync, writeFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

const fp = resolve(
  root,
  "node_modules/@opennextjs/cloudflare/dist/cli/build/utils/middleware.js",
)
try {
  let content = readFileSync(fp, "utf-8")
  // Replace the real check with `return false`
  const original =
    'return Boolean(functionsConfigManifest?.functions["/_middleware"]);'
  const replacement = "return false;"
  if (content.includes(original)) {
    content = content.replace(original, replacement)
    writeFileSync(fp, content, "utf-8")
    console.log("Patched OpenNext middleware check")
  }
} catch {
  // package not installed yet, skip silently
}
