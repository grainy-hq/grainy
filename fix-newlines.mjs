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

function fixCollapsed(content) {
  // Fix "$1" corruptions
  content = content.replaceAll('"$1"', '"use client"')

  // -----------------------
  // Fix import boundaries: after an import statement string `"react"` followed by
  // a type/interface/const/function/export, add a newline
  // -----------------------
  content = content.replace(/"(react|next\/\w+|@\/\w+(?:\/\w+)*)"/g, (match) => match)

  // The real fix: after a closing `"` that ends an import path, if not followed by newline or `)` 
  // and followed by `[a-zA-Z`], insert `;\n`
  // This is tricky without false positives in JSX className="..."
  // Safe approach: match `"react"type`, `"react"const`, `"react"export` etc.
  content = content.replace(/"\)\s*\n?\s*(type |interface |const |function |export )/g, '");\n$1')

  // Also: "react" directly followed by word (no space after ")
  content = content.replace(/"(react|next|@)\S*"(?!\))(?:\s*)(type |interface |const |function |export )/g, (m, p1, p2) => {
    return m[0] === '"' ? m : m  // no-op for now, handled below
  })

  // Simpler: Add newline before any top-level keyword that follows an import ending
  content = content.replace(/"(react|next\/\w+|@\/\w+(?:\/\w+)*)"\s*(type |interface |const |function |export )/g, '";\n$2')

  // After "react" etc directly followed by word without closing ) 
  // This handles: from "react"type Foo  ->  from "react";\ntype Foo
  content = content.replace(/from\s+"[^"]*"\s*(type |interface |const |function |export )/g, 'from "react";\n$1')

  // After any import statement that's missing its closing - handle generic case
  // "react"type  ->  "react";\ntype  (with or without space between)
  content = content.replace(/"\s*(type |interface |const |function |export )/g, '";\n$1')

  // -----------------------
  // Fix collapsed type/interface bodies: property values followed by next property
  // e.g. `id: string  name:` -> `id: string;\n  name:`
  // -----------------------
  
  // After type value keywords followed by 2+ spaces and another property
  const typeValues = [
    "string", "number", "boolean", "null", "undefined", "void", "any", "never",
    "string\\[\\]", "number\\[\\]", "boolean\\[\\]", "Date", "File", "Blob",
    "React\\.ReactNode", "ReactNode", "JSX\\.Element", "Element",
    "Record<[^>]+>", "Partial<[^>]+>", "Pick<[^>]+>", "Omit<[^>]+>"
  ]
  
  // Generic: after a word that looks like a type followed by 2+ spaces and a property name with colon
  // This handles: string  name:  ->  string;\n  name:
  // Be careful not to match string | null (has | between spaces)
  content = content.replace(
    /(}}\s*)/g, 
    (m) => m
  )

  // Fix: type property value followed by 2+ spaces then property-name: 
  // Pattern: a word not containing special chars, followed by 2+ spaces, followed by word+":"
  // Only inside type/interface bodies (heuristic: preceded by type/interface keyword)
  // We'll run a multi-pass approach
  
  // Pass 1: after primitive types  
  const primitives = /(string|number|boolean|null|undefined|void|any|never|unknown)(\s{2,})(\w+)(\s*:)/g
  content = content.replace(primitives, (match, type, spaces, propName, colon, offset) => {
    // Don't break `string | null` - that has `|` before `null`
    const before = content.substring(Math.max(0, offset - 20), offset)
    if (before.includes("|")) return match // likely a union type, skip
    return type + ";\n" + propName + colon
  })
  
  // Pass 2: after array types like string[]
  const arrTypes = /(\w+\[\])(\s{2,})(\w+)(\s*:)/g
  content = content.replace(arrTypes, (match, type, spaces, propName, colon) => {
    return type + ";\n" + propName + colon
  })

  // Pass 3: closing `}` inside types: after a type property value followed by 2+ spaces and `}`
  // e.g. `isVerified: boolean  }}`  ->  `isVerified: boolean;\n  }}`
  const closingType = /(string|number|boolean|null|undefined|void|any|never)(\s{2,})(\})/g
  content = content.replace(closingType, (match, type, spaces, close) => {
    return type + ";\n" + close
  })

  // Pass 4: After { that opens type/interface body, followed by 2+ spaces and a property name
  content = content.replace(/(\{)\s{2,}(\w+)(\s*:)/g, '{\n$2$3')

  // Pass 5: Handle type-like patterns inside the opening line of type definitions
  // e.g. `type Foo = {  id: string  name: string}` 
  // Already mostly handled by passes above. But the opening `{` might not be on its own line.
  
  // Fix "type Foo = {  id:" -> "type Foo = {\n  id:"
  content = content.replace(/(type\s+\w+\s*=\s*\{)\s{2,}(\w+\s*:)/g, '$1\n$2')

  // Fix "interface Foo {  id:" -> "interface Foo {\n  id:"  
  content = content.replace(/(interface\s+\w+\s*\{)\s{2,}(\w+\s*:)/g, '$1\n$2')

  // Fix after `author: {` (nested object/type) with 2+ spaces before property
  content = content.replace(/(\w+\s*:\s*\{)\s{2,}(\w+\s*:)/g, '$1\n$2')

  // -----------------------
  // Fix statement boundaries in function bodies
  // -----------------------
  
  // After `{` that opens function body: `function foo() {  if  ->  function foo() {\n  if`
  content = content.replace(/(\{)\s{2,}(if|for|while|switch|try|const|let|var|return|async|function|this\.|await)\s/g, '{\n$2 ')

  // After `;` followed by 2+ spaces and statement start  
  content = content.replace(/;\s{2,}(if|for|while|switch|try|const|let|var|return|async|function|this\.|await)\s/g, ';\n$1 ')

  // After `) {` that has code immediately after
  // `) {  const` -> `) {\n  const`
  content = content.replace(/\)\s*\{\s{2,}(const|let|var|if|for|while|switch|try|return|async|function|this\.)/g, ') {\n$1')

  // Fix: after `}  const` -> `}\nconst`
  content = content.replace(/\}\s{2,}(const|let|var|function|async function|export)/g, '}\n$1')

  // Fix: after `});` or `});` followed by `const` etc
  content = content.replace(/\)\);\s{2,}(const|let|var|function|async|export)/g, '));\n$1')

  // -----------------------
  // Fix: function signatures with collapsed return type/body
  // -----------------------
  // `function foo() {  if` -> `function foo() {\n  if`
  // This is a broad pattern that catches many cases
  
  // Fix: arrow function bodies collapsed
  // `=> {  const` -> `=> {\n  const`
  content = content.replace(/=>\s*\{\s{2,}(const|let|var|if|for|while|switch|try|return|async|function|this\.)/g, '=> {\n$1')

  // Fix: double-space before closing brace in control flow
  // `}  }` -> `}\n}` (closing nested blocks)
  content = content.replace(/\}\s{3,\}/g, '}\n}')

  return content
}

for (const file of files) {
  let content = readFileSync(file, "utf-8")
  const orig = content

  content = fixCollapsed(content)

  // Remove blank lines at start
  content = content.replace(/^\s*\n/, "")
  // Collapse multiple blank lines  
  content = content.replace(/\n{3,}/g, "\n\n")

  if (content !== orig) {
    writeFileSync(file, content, "utf-8")
    console.log("Fixed:", file.substring(src.length))
  }
}
console.log("Done")
