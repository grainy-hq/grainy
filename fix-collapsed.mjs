import { readFileSync, writeFileSync } from "fs"

// Only fix files that still have errors
const files = [
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\feed-client.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\explore-post-card.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\comment-modal.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\comment-section.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\create-post.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\create-explore-post.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\image-lightbox.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\itunes-picker.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\profile-music-player.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\app\\(app)\\u\\[username]\\page.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\app\\adminpage\\page.tsx",
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\app\\onboarding\\page.tsx",
]

for (const file of files) {
  let c = readFileSync(file, "utf-8")
  const orig = c
  let changed = false

  // --- SAFE FIXES ONLY ---

  // 1. Fix "$1" corruption (from sed)
  if (c.includes('"$1"')) { c = c.replaceAll('"$1"', '"use client"'); changed = true }

  // 2. Within type/interface bodies: add newline before each property name that follows
  //    After a type word and 2+ spaces. This restores newlines that were collapsed.
  //    Pattern: after `: ` followed by TYPE_VALUE then 2+ spaces then PROP_NAME:
  //    We need to avoid breaking `string | null` unions.
  
  // Strategy: after any `:` that looks like it's in a type body, followed by the value
  // which ends with a word/`]`/`}`, then 2+ spaces, then a word followed by `:` — add newline
  
  // Safer approach: inside each type definition, for each line that has multiple properties
  // on one line, split them.
  
  // Match: inside `type | interface`, after a property value (word at end of line),
  // followed by 2+ spaces, followed by a word that's a property name (word+:)
  
  // The easiest: add newline before each `\n  ` within type bodies for specific patterns
  
  // Fix common: `value  nextProp:` (two spaces between)
  // This regex matches a word (the type value) then 2+ spaces then a word+":"
  // We need to be careful not to match unions like `string | null`
  // Check: if the word before the spaces is a known type-terminal, or there's no | nearby
  
  // Simple approach: do multiple passes, each fixing one pattern
  
  // Fix: After "null" (not as part of union end) → but we DO want to split after union end
  // Actually, `null  createdAt:` -> we want to add newline here
  // `string | null` has `|` between string and null. We want to split after null.
  // So: after `null` followed by 2+ spaces then word + ":" — always split.
  c = c.replace(/null\s{2,}([a-zA-Z]\w*\s*:)/g, "null;\n$1")
  
  // Fix: after `string` at end of type value, 2+ spaces then word+"":"
  // But DON'T match `string | null` — check that there's no | before
  c = c.replace(/([^|])\bstring\s{2,}([a-zA-Z]\w*\s*:)/g, "$1string;\n$2")

  // Fix: after `boolean` 2+ spaces then word+":"
  c = c.replace(/([^|])\bboolean\s{2,}([a-zA-Z]\w*\s*:)/g, "$1boolean;\n$2")
  
  // Fix: after `number` 2+ spaces then word+:"
  c = c.replace(/([^|])\bnumber\s{2,}([a-zA-Z]\w*\s*:)/g, "$1number;\n$2")
  
  // Fix: after `Date` 2+ spaces then word+":"
  c = c.replace(/([^|])\bDate\s{2,}([a-zA-Z]\w*\s*:)/g, "$1Date;\n$2")
  
  // Fix: after `File` 2+ spaces then word+":"
  c = c.replace(/([^|])\bFile\s{2,}([a-zA-Z]\w*\s*:)/g, "$1File;\n$2")
  
  // Fix: after `string[]` 2+ spaces then word+":"
  c = c.replace(/string\[\]\s{2,}([a-zA-Z]\w*\s*:)/g, "string[];\n$1")
  
  // Fix: after `number[]` 2+ spaces then word+":"
  c = c.replace(/number\[\]\s{2,}([a-zA-Z]\w*\s*:)/g, "number[];\n$1")

  // Fix: after `}` closing a sub-object in type, 2+ spaces then word+":"
  c = c.replace(/}\s{2,}([a-zA-Z]\w*\s*:)/g, "}\n$1")
  
  // Fix: after `}[]` in type (array of objects), 2+ spaces then word+":"
  c = c.replace(/}\[\]\s{2,}([a-zA-Z]\w*\s*:)/g, "}[]\n$1")

  // Fix: after closing of Record<K, V>, 2+ spaces then word+":"
  c = c.replace(/>>\s{2,}([a-zA-Z]\w*\s*:)/g, ">>\n$1")
  c = c.replace(/>>;\s{2,}([a-zA-Z]\w*\s*:)/g, ">>;\n$1")

  // --- FUNCTION BODY FIXES ---
  // After `{` in function body: `function x() {  const` -> `function x() {\n  const`
  c = c.replace(/(\{)\s{2,}(const|let|var|if|for|while|switch|try|return|async|function\s)/g, '{\n$2')
  
  // After `;` 2+ spaces then statement: `x;\n  const` is correct, but `x;  const` is not
  c = c.replace(/;\s{3,}(const|let|var|if|for|while|switch|try|return|async|function\s)/g, ';\n$1')
  
  // After `{` that's within an arrow body or function body, 2+ spaces then statement
  // `=> {  const` -> `=> {\n  const`
  c = c.replace(/=\>\s*\{\s{2,}(const|let|var|if|for|while|switch|try|return|async|function)/g, '=> {\n$1')
  
  // After `]` 4+ spaces then `if` etc
  c = c.replace(/\]\s{4,}(if|for|while|switch|try|const|let|var|return|async|function)/g, ']\n$1')
  
  // After `}  async function` -> `}\n  async function`
  c = c.replace(/}\s{2,}async\s+function/g, '}\nasync function')
  
  // After `}  useEffect(`
  c = c.replace(/}\s{2,}(useEffect|useCallback)\s*\(/g, '}\n$1(')

  // Fix: `).length)     }` -> `).length)\n       }`
  c = c.replace(/\)\.length\s*\)\s{5,}(\})/g, ').length)\n$1')

  // 3. Blank line cleanup
  c = c.replace(/^\s*\n/, "")
  c = c.replace(/\n{3,}/g, "\n\n")

  if (c !== orig) {
    writeFileSync(file, c, "utf-8")
    console.log("Fixed:", file.substring(file.indexOf("src\\")))
    changed = true
  }
}
console.log("Done")
