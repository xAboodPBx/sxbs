import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizeShell, renderHook, platformSummary } from './core.js';
import { managedBlock, removeManagedBlock, startupFile } from './paths.js';

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function install({ shell = normalizeShell(), platform = process.platform, dryRun = false } = {}) {
  const file = startupFile(shell, platform);
  const hook = renderHook(shell, platform);
  const previous = await exists(file) ? await fs.readFile(file, 'utf8') : '';
  const cleaned = removeManagedBlock(previous);
  const next = `${cleaned.trimEnd()}${managedBlock(hook)}`;

  if (!dryRun) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    if (previous && previous !== next) {
      const backup = `${file}.sxbs-backup-${Date.now()}`;
      await fs.copyFile(file, backup);
    }
    await fs.writeFile(file, next, 'utf8');
  }

  return { file, shell, platform, changed: previous !== next, backupCreated: Boolean(previous && previous !== next), hook };
}

export async function uninstall({ shell = normalizeShell(), platform = process.platform, dryRun = false } = {}) {
  const file = startupFile(shell, platform);
  if (!(await exists(file))) return { file, removed: false };
  const previous = await fs.readFile(file, 'utf8');
  const next = removeManagedBlock(previous);
  if (!dryRun && previous !== next) await fs.writeFile(file, next, 'utf8');
  return { file, removed: previous !== next };
}

export async function status({ shell = normalizeShell(), platform = process.platform } = {}) {
  const file = startupFile(shell, platform);
  const content = await exists(file) ? await fs.readFile(file, 'utf8') : '';
  return {
    ...platformSummary(),
    file,
    installed: content.includes('# >>> sxbs initialize >>>') && content.includes('# <<< sxbs initialize <<<')
  };
}
