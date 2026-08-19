import os from 'node:os';
import path from 'node:path';
import { normalizeShell } from './core.js';

export function expandHome(value) {
  if (!value) return value;
  return value.startsWith('~') ? path.join(os.homedir(), value.slice(1)) : value;
}

export function startupFile(shell = normalizeShell(), platform = process.platform) {
  if (process.env.SXBS_RC_FILE) return expandHome(process.env.SXBS_RC_FILE);
  if (platform === 'win32' || shell === 'powershell') {
    const documents = process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'Documents') : path.join(os.homedir(), 'Documents');
    return path.join(documents, 'PowerShell', 'Microsoft.PowerShell_profile.ps1');
  }
  if (shell === 'fish') return path.join(os.homedir(), '.config', 'fish', 'config.fish');
  if (shell === 'zsh') return path.join(os.homedir(), '.zshrc');
  return path.join(os.homedir(), '.bashrc');
}

export function block(hook) {
  return `${hook}\n`;
}

export function managedBlock(hook) {
  return [
    '',
    '# >>> sxbs initialize >>>',
    hook,
    '# <<< sxbs initialize <<<',
    ''
  ].join('\n');
}

export function removeManagedBlock(content) {
  const escapedBegin = '# >>> sxbs initialize >>>'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedEnd = '# <<< sxbs initialize <<<'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\n?${escapedBegin}[\\s\\S]*?${escapedEnd}\\n?`, 'g');
  return content.replace(pattern, '\n').replace(/\n{3,}/g, '\n\n');
}
