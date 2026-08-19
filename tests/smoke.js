#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/sxbs.js', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

const logo = run('--no-color', 'logo');
assert.equal(logo.status, 0);
assert.match(logo.stdout, /SXBS/);

const list = run('--no-color', 'list');
assert.equal(list.status, 0);
assert.match(list.stdout, /ll/);
assert.match(list.stdout, /git status/);

const expansion = run('--no-color', 'expand', 'gs');
assert.equal(expansion.status, 0);
assert.match(expansion.stdout, /git status/);

const suggestion = run('--no-color', 'suggest', 'show git status');
assert.equal(suggestion.status, 0);
assert.match(suggestion.stdout, /gs/);

console.log('SXBS smoke checks passed.');
