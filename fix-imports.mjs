import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

const src = "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src"

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walk(full))
    } else if (entry.endsWith(".tsx")) {
      files.push(full)
    }
  }
  return files
}

const files = walk(src)

for (const file of files) {
  let content = readFileSync(file, "utf-8")
  const orig = content
  let changed = false

  // Fix: from "  ->  from "react"
  // This reverses the corruption where "react" was dropped
  content = content.replace(/from\s+"\s*;/g, 'from "react";')
  if (content !== orig) { changed = true; console.log("Fixed react in:", file.substring(src.length)) }

  // Fix: import { x } from "type  -> this is wrong too
  // Restore "react" before type
  content = content.replace(/from\s+"(type\s)/g, 'from "react";\n$1')

  // Also fix: from ";\ntype  that might remain
  content = content.replace(/from\s+"(;\n*type\s)/g, 'from "react"$1')

  // Fix $1 corruption 
  if (content.includes('"$1"')) {
    content = content.replaceAll('"$1"', '"use client"')
    changed = true
  }

  if (changed) {
    writeFileSync(file, content, "utf-8")
  }
}
console.log("Done fixing react imports")
