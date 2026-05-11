import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, '..', 'package.json');
const indexPath = resolve(__dirname, '..', 'dist', 'frontend', 'browser', 'index.html');

const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const buildTime = new Date().toISOString();

const tag = `<!-- ${pkg.name} v${pkg.version} · ${buildTime} -->\n`;

let html = readFileSync(indexPath, 'utf-8');
html = html.replace('</head>', tag + '</head>');
writeFileSync(indexPath, html, 'utf-8');
console.log(`✅  Version v${pkg.version} injected into dist index.html  (${buildTime})`);
