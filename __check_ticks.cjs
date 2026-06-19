const fs = require('fs');
const c = fs.readFileSync('C:/Users/VIJAY GANESH S/Downloads/Programs/new/grainy/src/components/explore-post-card.tsx', 'utf-8');
const backtick = '`';
const positions = [];
for (let i = 0; i < c.length; i++) {
  if (c[i] === backtick) positions.push(i);
}
console.log('Backtick count:', positions.length);
if (positions.length % 2 === 0) {
  for (let i = 0; i < positions.length; i += 2) {
    const snippet = c.substring(positions[i], positions[i+1]+1);
    console.log('Template', i/2, 'length:', snippet.length, 'preview:', JSON.stringify(snippet.substring(0, 60)));
  }
} else {
  console.log('Unbalanced templates!');
}
