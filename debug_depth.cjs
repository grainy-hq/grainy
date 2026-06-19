const fs = require('fs');
const file = process.argv[2] || 'feed-client.tsx';
const content = fs.readFileSync(
  'C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\' + file,
  'utf-8'
);
const lines = content.split('\n');
let depth = 0;
let inBlockComment = false;
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let j = 0;
  let inString = null;
  let prevDepth = depth;
  
  while (j < line.length) {
    const ch = line[j];
    
    // Block comments
    if (!inString && !inBlockComment && ch === '/' && j + 1 < line.length && line[j + 1] === '*') {
      inBlockComment = true;
      j += 2;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && j + 1 < line.length && line[j + 1] === '/') {
        inBlockComment = false;
        j += 2;
        continue;
      }
      j++;
      continue;
    }
    
    // Line comments
    if (!inString && ch === '/' && j + 1 < line.length && line[j + 1] === '/') {
      break; // rest of line is comment
    }
    
    // Strings
    if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
      inString = ch;
      j++;
      continue;
    }
    if (inString) {
      if (ch === '\\') { j += 2; continue; }
      if (ch === inString) inString = null;
      j++;
      continue;
    }
    
    // Braces
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    
    j++;
  }
  
  if (depth !== prevDepth) {
    const marker = depth > prevDepth ? '+' : '-';
    const change = Math.abs(depth - prevDepth);
    const indent = depth > 0 ? '| '.repeat(Math.min(depth, 20)) : '';
    console.log('L' + String(i+1).padStart(2) + ' ' + indent + marker.repeat(change) + ' depth=' + depth + ' | ' + line.substring(0, 100));
  }
}
console.log('\nFINAL DEPTH:', depth);
console.log(depth === 0 ? '✓ BALANCED' : '✗ IMBALANCED');
