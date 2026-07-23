import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(frontendRoot, '..');
const productRoot = path.join(frontendRoot, 'projects');
const tokensPath = path.join(repositoryRoot, 'desigh-system', 'assets', 'tokens.css');
const componentsPath = path.join(repositoryRoot, 'desigh-system', 'assets', 'components.css');
const stylesPath = path.join(productRoot, 'repofluent-app', 'src', 'styles.scss');
const failures = [];
const rawColorPattern = /#[0-9a-f]{3,8}\b|(?:rgb|hsl)a?\(/gi;

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function recordRawColors(file) {
  const relativePath = path.relative(repositoryRoot, file);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (rawColorPattern.test(line)) {
      failures.push(`${relativePath}:${index + 1} contains a raw color`);
    }
    rawColorPattern.lastIndex = 0;
  });
}

const productFiles = walk(productRoot);
productFiles.filter((file) => file.endsWith('.scss')).forEach(recordRawColors);
recordRawColors(componentsPath);

for (const file of productFiles.filter((candidate) => candidate.endsWith('.html'))) {
  if (/\bds-[a-z0-9_-]+/i.test(fs.readFileSync(file, 'utf8'))) {
    failures.push(
      `${path.relative(repositoryRoot, file)} consumes a documentation-only ds-* class`,
    );
  }
}

const styles = fs.readFileSync(stylesPath, 'utf8');
for (const contractImport of [
  '../../../../desigh-system/assets/tokens.css',
  '../../../../desigh-system/assets/components.css',
]) {
  if (!styles.includes(contractImport)) {
    failures.push(`frontend application styles do not import ${contractImport}`);
  }
}

const tokens = fs.readFileSync(tokensPath, 'utf8');
for (const requiredToken of [
  '--rf-color-canvas',
  '--rf-color-ink',
  '--rf-color-line',
  '--rf-color-focus',
  '--rf-color-primary',
  '--rf-chart-1',
  '--rf-font-sans',
  '--rf-space-1',
  '--rf-size-control',
  '--rf-radius-small',
  '--rf-shadow-1',
  '--rf-motion-fast',
  '--rf-z-overlay',
]) {
  if (!tokens.includes(requiredToken)) {
    failures.push(`design token contract is missing ${requiredToken}`);
  }
}

if (!tokens.includes(':root[data-rf-theme="tenant"]')) {
  failures.push('design token contract is missing the tenant theme');
}

if (!tokens.includes('@media (prefers-reduced-motion: reduce)')) {
  failures.push('design token contract is missing reduced-motion media handling');
}

if (failures.length > 0) {
  failures.forEach((failure) => process.stderr.write(`${failure}\n`));
  process.exitCode = 1;
} else {
  process.stdout.write('Design-system consumer contract verified.\n');
}
