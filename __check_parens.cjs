const fs = require('fs');

function checkParens(file) {
  const c = fs.readFileSync(file, 'utf-8');
  let paren = 0;
  let str = null;
  let line = false;
  let interp = 0;

  for (let i = 0; i < c.length; i++) {
    const ch = c[i];
    const n = c[i + 1];
    if (line) { if (ch === '\n') line = false; continue; }
    if (ch === '/' && n === '/') { line = true; i++; continue; }

    if (str) {
      if (ch === '\\' && n) { i++; continue; }
      if (str === '`') {
        if (ch === '`' && interp === 0) { str = null; continue; }
        if (ch === '$' && n === '{' && interp === 0) { interp = 1; i++; continue; }
        if (interp > 0) {
          if (ch === '{') { interp++; continue; }
          if (ch === '}') { interp--; continue; }
        }
        continue;
      }
      if (ch === str) { str = null; continue; }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') { str = ch; interp = 0; continue; }
    if (ch === '(') { paren++; }
    if (ch === ')') { paren--; if (paren < 0) console.log('EXTRA ) at', i); }
  }

  console.log(`${file.substring(file.lastIndexOf('\\')+1)}: paren depth=${paren}`);
}

checkParens('C:/Users/VIJAY GANESH S/Downloads/Programs/new/grainy/src/components/explore-post-card.tsx');
