const fs = require('fs');
const path = require('path');

const pat = /if\s*\([^)]*\)\s*;\s*$/m;

function walk(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules') walk(p);
    } else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) {
      const c = fs.readFileSync(p, 'utf-8');
      if (pat.test(c)) {
        const lines = c.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const m = lines[i].match(/if\s*\([^)]*\)\s*;\s*$/);
          if (m) {
            console.log(p.substring(p.lastIndexOf('src\\')) + ':' + (i+1) + ': ' + m[0]);
          }
        }
      }
    }
  }
}
walk('C:/Users/VIJAY GANESH S/Downloads/Programs/new/grainy/src');
