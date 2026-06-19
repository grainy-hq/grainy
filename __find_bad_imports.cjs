const fs = require('fs');
const path = require('path');

const root = 'C:/Users/VIJAY GANESH S/Downloads/Programs/new/grainy/src';
const reactHooks = new Set([
  'useState','useEffect','useRef','useCallback','useMemo','useReducer',
  'useContext','createContext','Fragment','StrictMode','Suspense','lazy',
  'memo','forwardRef','useImperativeHandle','useLayoutEffect','useDebugValue',
  'useTransition','useDeferredValue','useId','useSyncExternalStore',
  'useInsertionEffect','Children','cloneElement','createElement',
  'isValidElement','createRef','Component','PureComponent'
]);

function walk(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules') walk(p);
    } else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) {
      const c = fs.readFileSync(p, 'utf-8');
      const lines = c.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/import\s+\{([^}]+)\}\s+from\s+"react"/);
        if (m) {
          const names = m[1].split(',').map(s => s.trim().replace(/\s+as\s+\w+$/, ''));
          const invalid = names.filter(n => !reactHooks.has(n));
          if (invalid.length > 0) {
            console.log(p.substring(root.length+1) + ':' + (i+1) + '  invalid: ' + invalid.join(', '));
          }
        }
      }
    }
  }
}
walk(root);
console.log('Done');
