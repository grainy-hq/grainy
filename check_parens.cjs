const fs = require('fs');
const content = fs.readFileSync(
  'C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\explore-post-card.tsx',
  'utf-8'
);
const lines = content.split('\n');
let braceDepth = 0;
let parenDepth = 0;
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let cleaned = '';
  let inString = null;
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (inString) {
      if (ch === '\\') { j++; continue; }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
    cleaned += ch;
  }
  for (const ch of cleaned) {
    if (ch === '{') braceDepth++;
    if (ch === '}') braceDepth--;
    if (ch === '(') parenDepth++;
    if (ch === ')') parenDepth--;
  }
  if (braceDepth !== 0 || parenDepth !== 0) {
    console.log('L' + (i+1) + ': b=' + braceDepth + ' p=' + parenDepth + ' | ' + line.substring(0, 120));
  }
}
console.log('Final: braces=' + braceDepth + ' parens=' + parenDepth);
