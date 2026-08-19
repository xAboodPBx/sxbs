import os from 'node:os';

export const VERSION = '1.0.0';
export const MARKER_BEGIN = '# >>> sxbs initialize >>>';
export const MARKER_END = '# <<< sxbs initialize <<<';

export const LOGO = [
  '  ███████╗██╗  ██╗██████╗ ███████╗',
  '  ██╔════╝╚██╗██╔╝██╔══██╗██╔════╝',
  '  ███████╗ ╚███╔╝ ██████╔╝███████╗',
  '  ╚════██║ ██╔██╗ ██╔══██╗╚════██║',
  '  ███████║██╔╝ ██╗██████╔╝███████║',
  '  ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝'
].join('\n');

const colors = {
  cyan: '\u001b[36m',
  blue: '\u001b[94m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  gray: '\u001b[90m',
  reset: '\u001b[0m'
};

export function color(text, tone = 'cyan', enabled = true) {
  return enabled ? `${colors[tone] ?? ''}${text}${colors.reset}` : text;
}

export function colorsEnabled({ noColor = false, platform = process.platform } = {}) {
  return !noColor && !process.env.NO_COLOR && process.env.TERM !== 'dumb' && (Boolean(process.stdout.isTTY) || platform === 'win32');
}

export function renderBanner({ colorOutput = colorsEnabled() } = {}) {
  const lines = LOGO.split('\n').map((line) => color(line, 'cyan', colorOutput));
  return `${lines.join('\n')}\n${color('  SXBS — Smart eXecutable Bash Shortcuts', 'blue', colorOutput)}\n${color(`  v${VERSION} • Your shell, simplified.`, 'gray', colorOutput)}`;
}

export const COMMANDS = [
  { name: 'c', command: 'clear', windows: 'Clear-Host', description: 'Clear the terminal screen.' },
  { name: 'll', command: 'ls -lah', windows: 'Get-ChildItem -Force', description: 'List all files with details, including hidden files.' },
  { name: 'la', command: 'ls -A', windows: 'Get-ChildItem -Force', description: 'List files, including hidden files.' },
  { name: '..', command: 'cd ..', windows: 'Set-Location ..', description: 'Move to the parent directory.' },
  { name: '...', command: 'cd ../..', windows: 'Set-Location ../..', description: 'Move up two directory levels.' },
  { name: 'g', command: 'git', windows: 'git', description: 'Short prefix for Git commands.' },
  { name: 'gs', command: 'git status --short --branch', windows: 'git status --short --branch', description: 'Show a compact Git status and branch.' },
  { name: 'ga', command: 'git add', windows: 'git add', description: 'Stage files for the next commit.' },
  { name: 'gc', command: 'git commit', windows: 'git commit', description: 'Create a Git commit.' },
  { name: 'gp', command: 'git push', windows: 'git push', description: 'Push local commits to the remote.' },
  { name: 'gl', command: 'git log --oneline --decorate --graph -12', windows: 'git log --oneline --decorate --graph -12', description: 'Show a concise visual commit history.' },
  { name: 'dps', command: 'docker ps', windows: 'docker ps', description: 'List running Docker containers.' },
  { name: 'dcu', command: 'docker compose up -d', windows: 'docker compose up -d', description: 'Start a Compose stack in the background.' },
  { name: 'dcd', command: 'docker compose down', windows: 'docker compose down', description: 'Stop a Compose stack.' },
  { name: 'serve', command: 'npx serve .', windows: 'npx serve .', description: 'Serve the current directory locally.' },
  { name: 'path', command: 'printf "%s\\n" "$PATH"', windows: '[Environment]::GetEnvironmentVariable("Path")', description: 'Print the current executable path.' },
  { name: 'which', command: 'command -v', windows: 'Get-Command', description: 'Find an executable on the current PATH.' },
  { name: 'q', command: 'exit', windows: 'exit', description: 'Exit the current shell session.' }
];

export function commandFor(name, platform = process.platform) {
  const item = COMMANDS.find((entry) => entry.name === name);
  if (!item) return null;
  return platform === 'win32' ? item.windows : item.command;
}

export function findCommand(name) {
  return COMMANDS.find((entry) => entry.name === name) ?? null;
}

function tokenize(value) {
  return new Set(String(value).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

export function suggest(input, limit = 5) {
  const query = tokenize(input);
  return COMMANDS.map((entry) => {
    const haystack = tokenize(`${entry.name} ${entry.command} ${entry.windows} ${entry.description}`);
    let score = 0;
    for (const token of query) {
      if (haystack.has(token)) score += 3;
      else if ([...haystack].some((candidate) => candidate.startsWith(token) || token.startsWith(candidate))) score += 1;
    }
    const normalizedInput = String(input).toLowerCase();
    if (entry.name.toLowerCase() === normalizedInput.trim()) score += 20;
    if (/hidden|detailed|permissions|long format/.test(normalizedInput) && entry.name === 'll') score += 4;
    if (/hidden/.test(normalizedInput) && entry.name === 'la') score += 1;
    if (/start|up|background/.test(normalizedInput) && entry.name === 'dcu') score += 4;
    if (/status|working tree/.test(normalizedInput) && entry.name === 'gs') score += 4;
    return { ...entry, score };
  }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, limit);
}

export function listCommands(platform = process.platform) {
  return COMMANDS.map((entry) => ({
    ...entry,
    expansion: commandFor(entry.name, platform)
  }));
}

export function normalizeShell(shellName = process.env.SXBS_SHELL || process.env.SHELL || '') {
  const value = String(shellName).toLowerCase();
  if (process.platform === 'win32' && (value.includes('powershell') || value.includes('pwsh'))) return 'powershell';
  if (value.includes('fish')) return 'fish';
  if (value.includes('zsh')) return 'zsh';
  if (value.includes('bash')) return 'bash';
  return process.platform === 'win32' ? 'powershell' : 'bash';
}

export function shellAliases(shell, platform = process.platform) {
  const entries = listCommands(platform);
  if (shell === 'powershell') {
    return entries
      .filter((entry) => /^[A-Za-z_][A-Za-z0-9_-]*$/.test(entry.name))
      .map((entry) => `function ${entry.name.replaceAll('-', '_')} { ${entry.expansion} @args }`)
      .join('\n');
  }
  if (shell === 'fish') {
    return entries.map((entry) => `alias ${entry.name} '${entry.expansion.replaceAll("'", "\\'")}'`).join('\n');
  }
  return entries.map((entry) => `alias ${entry.name}='${entry.expansion.replaceAll("'", "'\\''")}'`).join('\n');
}

export function renderHook(shell = normalizeShell(), platform = process.platform) {
  const aliases = shellAliases(shell, platform);
  if (shell === 'powershell') {
    return [
      '$env:SXBS_ACTIVE = "1"',
      'function prompt { "SXBS$ " }',
      aliases
    ].join('\n');
  }
  if (shell === 'fish') {
    return [
      'set -gx SXBS_ACTIVE 1',
      'function fish_prompt',
      '  printf "SXBS$ "',
      'end',
      aliases
    ].join('\n');
  }
  return [
    'export SXBS_ACTIVE=1',
    "PS1='SXBS$ '",
    "PROMPT='SXBS$ '",
    aliases
  ].join('\n');
}

export function platformSummary() {
  return {
    platform: process.platform,
    architecture: process.arch,
    node: process.version,
    shell: normalizeShell(),
    home: os.homedir()
  };
}
