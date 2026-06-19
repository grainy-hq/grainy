const fs = require('fs');

function check(file) {
  const c = fs.readFileSync(file, 'utf-8');
  let depth = 0;
  let str = null;
  let line = false;

  // Inside backtick template: interpDepth tracks ${...} nesting.
  // interpDepth = 0 means we're in literal text; >0 means inside expression.
  let interp = 0;

  for (let i = 0; i < c.length; i++) {
    const ch = c[i];
    const n = c[i + 1];

    if (line) { if (ch === '\n') line = false; continue; }
    if (ch === '/' && n === '/') { line = true; i++; continue; }

    if (str) {
      if (ch === '\\' && n) { i++; continue; }

      if (str === '`') {
        // Handle template literal
        if (ch === '`' && interp === 0) { str = null; continue; }

        if (ch === '$' && n === '{' && interp === 0) {
          // Enter interpolation — the { is a real brace
          interp = 1;  // counting the { we're about to skip
          depth++;
          i++; // skip the {
          continue;
        }

        if (interp > 0) {
          if (ch === '{') { depth++; interp++; continue; }
          if (ch === '}') {
            depth--;
            interp--;
            if (interp === 0) {
              // Back to literal text; don't continue (already counted)
            }
            continue;
          }
        }
        continue; // literal text in template
      }

      // Regular string
      if (ch === str) { str = null; continue; }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      str = ch;
      interp = 0;
      continue;
    }

    if (ch === '{') { depth++; }
    if (ch === '}') {
      depth--;
      if (depth < 0) {
        console.log(`EXTRA } at byte ${i}  near: ${JSON.stringify(c.substring(Math.max(0,i-15), i+15))}`);
      }
    }
  }

  const status = depth === 0 ? 'OK' : `MISMATCH depth=${depth}`;
  console.log(`${file.substring(file.lastIndexOf('\\')+1)}: ${status}`);
  if (depth > 0) console.log('  Extra opens at brace depth peaks');
  return depth;
}

const files = [
  'feed-client.tsx',
  'comment-modal.tsx',
  'explore-post-card.tsx',
  'post-list.tsx',
  'post-card.tsx',
];

for (const f of files) {
  check('C:/Users/VIJAY GANESH S/Downloads/Programs/new/grainy/src/components/' + f);
}
