import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const resumeDir = root;
const htmlPath = path.join(resumeDir, 'index.html');
const cssPath = path.join(resumeDir, 'style.css');
// The entry point, every effect module (fx-*.js) and the Kosmo mascot modules (kosmo/*.js).
const scripts = [
  'index.js',
  ...readdirSync(root).filter((file) => /^fx-[\w-]+\.js$/.test(file)).sort(),
  ...(existsSync(path.join(root, 'kosmo')) ? readdirSync(path.join(root, 'kosmo')).filter((file) => file.endsWith('.js')).sort().map((file) => `kosmo/${file}`) : []),
];
const failures = [];

function fail(message) {
  failures.push(message);
}

function checkFiles() {
  for (const file of ['index.html', 'style.css', 'photo.jpg', 'kosmo/brain.js', 'kosmo/kosmo.js', 'kosmo/art.js', ...scripts]) {
    if (!existsSync(path.join(resumeDir, file))) fail(`Missing ${file}`);
  }
  // Kosmo Gaea replaced the peeking alien.
  if (existsSync(path.join(resumeDir, 'fx-peek.js'))) fail('fx-peek.js should be removed: Kosmo replaced the peeker');
}

function checkHtml() {
  if (!existsSync(htmlPath)) return;
  const html = readFileSync(htmlPath, 'utf8');
  if (!/^<!doctype html>/i.test(html.trim())) fail('index.html must begin with a doctype');
  if (!/<title>[^<]+<\/title>/i.test(html)) fail('index.html must include a non-empty title');

  if (/data-peek/.test(html)) fail('index.html still contains the old peeker (data-peek)');
  if (!/<div class="paper" data-paper>/.test(html)) fail('index.html must wrap the resume in <div class="paper" data-paper>');

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) fail(`Duplicate HTML ids: ${[...new Set(duplicateIds)].join(', ')}`);

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[1])) fail('Every image must have an alt attribute');
  }

  for (const match of html.matchAll(/<script\b([^>]*)>/gi)) {
    if (/src=["'](?:index)\.js["']/i.test(match[1]) && !/\btype=["']module["']/i.test(match[1])) {
      fail('Portfolio JavaScript entry must use type="module"');
    }
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^#][^"']+)["']/gi)) {
    const asset = match[1].split('?')[0];
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(asset)) continue;
    if (!existsSync(path.join(resumeDir, asset))) fail(`Missing local asset: ${asset}`);
  }
}

function checkCss() {
  if (!existsSync(cssPath)) return;
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0;
  for (const character of css) {
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    if (depth < 0) return fail('style.css contains an unmatched closing brace');
  }
  if (depth !== 0) fail('style.css contains unmatched braces');
}

function checkJavaScript() {
  for (const script of scripts) {
    const scriptPath = path.join(resumeDir, script);
    if (!existsSync(scriptPath)) continue;
    try {
      execFileSync(process.execPath, ['--check', scriptPath], { stdio: 'pipe' });
    } catch {
      fail(`JavaScript syntax check failed: ${script}`);
    }
  }
}

checkFiles();
checkHtml();
checkCss();
checkJavaScript();

if (failures.length) {
  console.error('Resume quality checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Resume quality checks passed.');
}
