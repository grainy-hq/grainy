const fs = require('fs');
const c = fs.readFileSync(
  'C:/Users/VIJAY GANESH S/Downloads/Programs/new/grainy/src/components/feed-client.tsx',
  'utf-8'
);

let depth = 0;
let inString = false;
let stringChar = '';
let inLineComment = false;

for (let i = 0; i < c.length; i++) {
  const ch = c[i];
  const next = c[i + 1];

  if (inLineComment) {
    if (ch === '\n') inLineComment = false;
    continue;
  }

  if (ch === '/' && next === '/') {
    inLineComment = true;
    i++;
    continue;
  }

  if (inString) {
    if (ch === '\\' && next) {
      i++;
      continue;
    }
    if (ch === stringChar) {
      inString = false;
    }
    continue;
  }

  if (ch === '"' || ch === "'") {
    inString = true;
    stringChar = ch;
    continue;
  }

  if (ch === '`') {
    inString = true;
    stringChar = ch;
    continue;
  }

  if (ch === '{') {
    depth++;
    if (i < 60 || i > c.length - 40) console.log('{ at', i, 'depth:', depth);
  }
  if (ch === '}') {
    depth--;
    if (i < 60 || i > c.length - 40) console.log('} at', i, 'depth:', depth);
  }
}

console.log('Final depth:', depth);
