const fs = require("fs");
const c = fs.readFileSync(
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\explore-post-card.tsx",
  "utf-8",
);

let depth = 0;
let str = null;
let interp = 0;
for (let i = 0; i < c.length; i++) {
  const ch = c[i];
  if (str) {
    if (str === "`" && ch === "$" && c[i + 1] === "{" && interp === 0) {
      str = "`";
      i++;
      interp++;
      depth++;
      continue;
    }
    if (str === "`" && interp > 0 && ch === "{") {
      depth++;
      interp++;
      continue;
    }
    if (str === "`" && interp > 0 && ch === "}") {
      depth--;
      interp--;
      continue;
    }
    if (ch === "\\") {
      i++;
      continue;
    }
    if (ch === str && (str !== "`" || interp === 0)) {
      str = null;
      continue;
    }
    continue;
  }

  if (ch === "/" && c[i + 1] === "/") {
    while (c[i] !== "\n") i++;
    continue;
  }
  if (ch === "/" && c[i + 1] === "*") {
    while (!(c[i] === "*" && c[i + 1] === "/")) i++;
    i++;
    continue;
  }

  if (ch === '"' || ch === "'" || ch === "`") {
    str = ch;
    continue;
  }

  if (ch === "{") {
    depth++;
  }
  if (ch === "}") {
    depth--;
  }
}
console.log("Final depth:", depth);
