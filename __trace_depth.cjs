const fs = require("fs");
const c = fs.readFileSync(
  "C:\\Users\\VIJAY GANESH S\\Downloads\\Programs\\new\\grainy\\src\\components\\explore-post-card.tsx",
  "utf-8",
);

let depth = 0;
let str = null;
let interp = 0;
let line = 1;
let col = 1;
let depthLog = [];

function getLineStart(c, i) {
  let start = i;
  while (start > 0 && c[start - 1] !== "\n") start--;
  return start;
}

for (let i = 0; i < c.length; i++) {
  const ch = c[i];
  col++;
  if (ch === "\n") {
    line++;
    col = 1;
  }

  if (str) {
    if (str === "`" && ch === "$" && c[i + 1] === "{" && interp === 0) {
      i++;
      interp++;
      depth++;
      depthLog.push({ line, col, ch: "${", depth, action: "template_interp_open" });
      continue;
    }
    if (str === "`" && interp > 0 && ch === "{") {
      depth++;
      interp++;
      depthLog.push({ line, col, ch: "{", depth, action: "nested_template_brace_open" });
      continue;
    }
    if (str === "`" && interp > 0 && ch === "}") {
      depth--;
      interp--;
      depthLog.push({ line, col, ch: "}", depth, action: "nested_template_brace_close" });
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
    line++;
    col = 1;
    continue;
  }
  if (ch === "/" && c[i + 1] === "*") {
    while (!(c[i] === "*" && c[i + 1] === "/")) {
      if (c[i] === "\n") { line++; col = 1; }
      i++;
    }
    i++;
    col += 2;
    continue;
  }

  if (ch === '"' || ch === "'" || ch === "`") {
    str = ch;
    continue;
  }

  if (ch === "{") {
    depth++;
    depthLog.push({ line, col, ch: "{", depth, action: "open" });
  }
  if (ch === "}") {
    depth--;
    depthLog.push({ line, col, ch: "}", depth, action: "close" });
  }
}

console.log("Final depth:", depth);

// Show depth at end of each line
let lines = c.split("\n");
let currentDepth = 0;
str = null;
interp = 0;
for (let l = 0; l < lines.length; l++) {
  const lineText = lines[l];
  for (let i = 0; i < lineText.length; i++) {
    const ch = lineText[i];
    if (str) {
      if (str === "`" && ch === "$" && lineText[i + 1] === "{" && interp === 0) {
        i++;
        interp++;
        currentDepth++;
        continue;
      }
      if (str === "`" && interp > 0 && ch === "{") {
        currentDepth++;
        interp++;
        continue;
      }
      if (str === "`" && interp > 0 && ch === "}") {
        currentDepth--;
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
    if (ch === "/" && lineText[i + 1] === "/") break;
    if (ch === "/" && lineText[i + 1] === "*") {
      while (i < lineText.length - 1 && !(lineText[i] === "*" && lineText[i + 1] === "/")) i++;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      str = ch;
      continue;
    }
    if (ch === "{") currentDepth++;
    if (ch === "}") currentDepth--;
  }
  if (lineText.trim()) {
    console.log(`Line ${l + 1}: depth=${currentDepth}  ${lineText.substring(0, 70)}`);
  }
}
console.log("Final depth:", currentDepth);
