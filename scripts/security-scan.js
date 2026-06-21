#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const targets = [
  path.join(root, 'public/app.js'),
  path.join(root, 'public/js/platform/facilities.js')
];
const failures = [];
let innerHtmlWrites = 0;
let innerHtmlReads = 0;
let inlineHandlers = 0;
let inlineStyles = 0;

for (const file of targets) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  const lines = source.split(/\r?\n/);
  innerHtmlWrites += (source.match(/\.innerHTML\s*=/g) || []).length;
  innerHtmlReads += (source.match(/\.innerHTML(?:\.trim\(\))?/g) || []).length - (source.match(/\.innerHTML\s*=/g) || []).length;
  inlineHandlers += (source.match(/\son(?:click|change|submit|input|keyup|keydown|load|error)=/g) || []).length;
  inlineStyles += (source.match(/\sstyle=/g) || []).length;

  lines.forEach((line, index) => {
    if (/\.innerHTML\s*=.*\$\{\s*(?:error|err|e)\.message/.test(line) && !/esc\(|escapeHtml\(/.test(line)) {
      failures.push(`${relative}:${index + 1}: unescaped error message written with innerHTML`);
    }
    if (/\.innerHTML\s*=.*\$\{\s*msg\s*\}/.test(line)) {
      failures.push(`${relative}:${index + 1}: unescaped message written with innerHTML`);
    }
  });
}

const appSource = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
if (!/function escapeHtml\(value\)/.test(appSource)) failures.push('public/app.js: shared escapeHtml helper missing');
if (!/text\.textContent\s*=\s*String\(msg/.test(appSource)) failures.push('public/app.js: toast message must use textContent');
if (/\beval\s*\(/.test(appSource) || /\bnew\s+Function\b/.test(appSource)) failures.push('public/app.js: executable string evaluation is forbidden');
if (!/data-ui-args="\$\{esc\(JSON\.stringify\(args\)\)\}/.test(appSource)) failures.push('public/app.js: delegated UI action arguments must be HTML escaped');
if (inlineHandlers) failures.push(`first-party inline event attributes remain: ${inlineHandlers}`);

const result = { innerHtmlWrites, innerHtmlReads, inlineHandlers, inlineStyles, failures };
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
