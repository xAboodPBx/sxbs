#!/usr/bin/env node
import { color, commandFor, findCommand, listCommands, normalizeShell, renderBanner, renderHook, suggest, VERSION } from '../src/core.js';
import { install, status, uninstall } from '../src/manager.js';

const rawArgs = process.argv.slice(2);
const noColor = rawArgs.includes('--no-color');
const args = rawArgs.filter((item) => item !== '--no-color');
const command = args[0] || 'start';
const rest = args.slice(1);
const colorOutput = !noColor && Boolean(process.stdout.isTTY) && process.env.NO_COLOR === undefined;

function printBanner() {
  console.log(renderBanner({ colorOutput }));
}

function printHelp() {
  console.log(`
SXBS — Smart eXecutable Bash Shortcuts

Usage:
  sxbs                         Show the logo and quick-start information.
  sxbs install [--shell NAME]  Install the SXBS$ prompt and shortcuts.
  sxbs uninstall               Remove the SXBS shell integration.
  sxbs status                  Show installation and platform status.
  sxbs list                    List all built-in shortcuts.
  sxbs expand <shortcut>       Show the full command behind a shortcut.
  sxbs suggest <text>          Find a shorter command for a task description.
  sxbs hook [shell]            Print the shell integration script.
  sxbs logo                    Print the SXBS logo.
  sxbs doctor                  Print diagnostics.
  sxbs version                 Print the installed version.
  sxbs help                    Show this help.

After installation, open a new terminal. Your prompt becomes:
  SXBS$ 

Regular commands such as ls, cd, git, npm, python, and docker remain unchanged.
SXBS only adds optional shortcuts; it does not replace existing commands.
`);
}

function parseOption(name, fallback = undefined) {
  const index = rest.indexOf(name);
  return index >= 0 ? rest[index + 1] ?? fallback : fallback;
}

function printList() {
  const rows = listCommands(process.platform);
  console.log('Shortcut  Expansion                              Description');
  console.log('--------  -------------------------------------  -----------------------------------------------');
  for (const row of rows) {
    console.log(`${row.name.padEnd(8)}  ${row.expansion.padEnd(37)}  ${row.description}`);
  }
}

function printSuggestions(input) {
  const matches = suggest(input);
  if (!matches.length) {
    console.log('No shortcut matched that request. Try: git, docker, files, clear, parent, serve.');
    return;
  }
  console.log(`Suggestions for: ${input}`);
  for (const match of matches) {
    console.log(`  ${color(match.name, 'green', colorOutput).padEnd(16)} ${match.description}  ${color(`→ ${match.command}`, 'gray', colorOutput)}`);
  }
}

async function main() {
  switch (command) {
    case 'start':
      printBanner();
      printHelp();
      break;
    case 'logo':
      printBanner();
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    case 'version':
    case '--version':
    case '-v':
      console.log(`SXBS ${VERSION}`);
      break;
    case 'list':
    case 'shortcuts':
      printList();
      break;
    case 'expand': {
      const name = rest.find((item) => !item.startsWith('-'));
      const item = name ? findCommand(name) : null;
      if (!item) {
        console.error('Unknown or missing shortcut. Run: sxbs list');
        process.exitCode = 2;
        break;
      }
      console.log(`${item.name} → ${commandFor(item.name, process.platform)}`);
      break;
    }
    case 'suggest': {
      const input = rest.filter((item) => !item.startsWith('-')).join(' ').trim();
      if (!input) {
        console.error('Usage: sxbs suggest <description>');
        process.exitCode = 2;
        break;
      }
      printSuggestions(input);
      break;
    }
    case 'hook': {
      const requestedShell = rest.find((item) => !item.startsWith('-')) || normalizeShell();
      console.log(renderHook(requestedShell, process.platform));
      break;
    }
    case 'install': {
      const requestedShell = parseOption('--shell', normalizeShell());
      const result = await install({ shell: requestedShell, dryRun: rest.includes('--dry-run') });
      printBanner();
      console.log(`\n${result.changed ? 'SXBS integration installed' : 'SXBS integration is already installed'} for ${result.shell}.`);
      console.log(`Startup file: ${result.file}`);
      if (result.backupCreated) console.log('A backup of the previous startup file was created.');
      console.log('Open a new terminal to activate the SXBS$ prompt.');
      break;
    }
    case 'uninstall': {
      const result = await uninstall({ shell: parseOption('--shell', normalizeShell()) });
      console.log(result.removed ? `SXBS removed from ${result.file}` : `SXBS was not installed in ${result.file}`);
      break;
    }
    case 'status': {
      const result = await status();
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'doctor': {
      const result = await status();
      console.log(renderBanner({ colorOutput }));
      console.log(JSON.stringify(result, null, 2));
      console.log('\nBuilt-in commands stay available. SXBS adds shortcuts without overwriting command binaries.');
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(`SXBS error: ${error.message}`);
  process.exitCode = 1;
});
