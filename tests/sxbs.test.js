import test from 'node:test';
import assert from 'node:assert/strict';
import { COMMANDS, commandFor, renderBanner, renderHook, suggest } from '../src/core.js';

 test('renders the SXBS logo and prompt identity', () => {
  const banner = renderBanner({ colorOutput: false });
  assert.match(banner, /SXBS/);
  assert.match(banner, /Smart eXecutable Bash Shortcuts/);
});

test('keeps standard command behavior available through optional aliases', () => {
  assert.equal(commandFor('ll', 'linux'), 'ls -lah');
  assert.equal(commandFor('gs', 'darwin'), 'git status --short --branch');
  assert.equal(commandFor('ll', 'win32'), 'Get-ChildItem -Force');
  assert.equal(commandFor('missing', 'linux'), null);
  assert.ok(COMMANDS.length >= 15);
});

test('suggests useful shortcuts from natural task words', () => {
  assert.equal(suggest('show git status')[0].name, 'gs');
  assert.equal(suggest('start docker compose')[0].name, 'dcu');
  assert.equal(suggest('list hidden files')[0].name, 'll');
});

test('renders shell hooks for supported environments', () => {
  assert.match(renderHook('bash', 'linux'), /SXBS_ACTIVE/);
  assert.match(renderHook('zsh', 'darwin'), /PS1='SXBS\$ '/);
  assert.match(renderHook('fish', 'linux'), /fish_prompt/);
  assert.match(renderHook('powershell', 'win32'), /function prompt/);
});
