const fs = require('fs');
const path = process.argv[2] || 'feed-client.tsx';
const fullPath = 'C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\' + path;
const content = fs.readFileSync(fullPath, 'utf-8');
const lines = content.split('\n');
let depth = 0;
let lastNonZeroLine = 0;
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
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
  if (depth !== 0) lastNonZeroLine = i;
  const marker = depth === 0 ? '  ' : (depth > 0 ? '+'.repeat(Math.min(depth, 30)) : '-'.repeat(Math.min(Math.abs(depth), 30)));
  console.log(String(i+1).padStart(2), marker, '|', lines[i].substring(0, 120));
}
console.log('Final depth:', depth, 'Last non-zero line:', lastNonZeroLine + 1);
