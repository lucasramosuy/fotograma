import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const fonts = [
  ['space-grotesk', 'space-grotesk-latin-400-normal.woff2', 'space-grotesk-400.woff2'],
  ['space-grotesk', 'space-grotesk-latin-700-normal.woff2', 'space-grotesk-700.woff2'],
  ['dm-mono', 'dm-mono-latin-400-normal.woff2', 'dm-mono-400.woff2'],
  ['source-serif-4', 'source-serif-4-latin-400-normal.woff2', 'source-serif-4-400.woff2'],
];
const target = join('public', 'fotograma', 'fonts');
mkdirSync(target, { recursive: true });
for (const [family, source, name] of fonts) {
  const packageRoot = new URL(`../node_modules/@fontsource/${family}/`, import.meta.url).pathname;
  copyFileSync(join(packageRoot, 'files', source), join(target, name));
}
console.log('4 fuentes copiadas a public/fotograma/fonts');
