# SXBS

SXBS is a cross-platform command-line companion for Linux, macOS, Windows, and other environments that can run Node.js. It adds a recognizable `SXBS$` prompt, prints the SXBS logo when launched, and provides short optional aliases for repetitive or long developer commands.

> Standard commands remain standard. SXBS adds shortcuts without replacing `ls`, `cd`, `git`, `npm`, `python`, `docker`, or other command binaries.

## Requirements

Install [Node.js 18 or newer](https://nodejs.org/) and npm. SXBS works with Bash, Zsh, Fish, and PowerShell. On Windows, the recommended shell integration is PowerShell. On Unix-like systems, Bash and Zsh are supported directly, while Fish is supported through its own prompt function.

## Install

Install globally from npm after publishing:

```bash
npm install --global sxbs
sxbs install
```

Or install directly from this repository:

```bash
git clone https://github.com/xAboodPBx/sxbs.git
cd sxbs
npm install
npm link
sxbs install
```

The installer writes a small managed block into the detected shell startup file. It creates a timestamped backup before changing an existing startup file. Open a new terminal after installation. The prompt will become:

```text
SXBS$
```

For a specific shell, use:

```bash
sxbs install --shell bash
sxbs install --shell zsh
sxbs install --shell fish
```

In PowerShell:

```powershell
sxbs install --shell powershell
```

## What SXBS Adds

SXBS includes short names for common multi-word workflows. The aliases are intentionally optional and are loaded only through the startup integration created by `sxbs install`.

| Shortcut | Unix expansion | Windows expansion | Purpose |
|---|---|---|---|
| `ll` | `ls -lah` | `Get-ChildItem -Force` | Show detailed files, including hidden files |
| `la` | `ls -A` | `Get-ChildItem -Force` | Show hidden files |
| `c` | `clear` | `Clear-Host` | Clear the terminal |
| `..` | `cd ..` | — | Move to the parent directory |
| `...` | `cd ../..` | — | Move up two directories |
| `gs` | `git status --short --branch` | same | Compact Git status |
| `gl` | `git log --oneline --decorate --graph -12` | same | Short visual Git history |
| `ga` | `git add` | same | Stage files |
| `gc` | `git commit` | same | Create a commit |
| `gp` | `git push` | same | Push commits |
| `dps` | `docker ps` | same | List running containers |
| `dcu` | `docker compose up -d` | same | Start a Compose stack in the background |
| `dcd` | `docker compose down` | same | Stop a Compose stack |
| `serve` | `npx serve .` | same | Serve the current directory locally |
| `q` | `exit` | `exit` | Exit the shell |

The aliases are plain shell functions or aliases, so they remain transparent and easy to inspect. Run `sxbs list` to see the exact expansion for the current platform.

## Smart Suggestions

When you remember the task but not the shortcut, ask SXBS for a suggestion:

```bash
sxbs suggest "show git status"
sxbs suggest "start docker compose"
sxbs suggest "list hidden files"
```

SXBS returns the closest built-in shortcut without changing or executing your command. To inspect one expansion directly:

```bash
sxbs expand gs
```

## Commands

```text
sxbs                         Show the logo and quick-start help.
sxbs logo                    Print the logo only.
sxbs install                 Add the SXBS$ prompt and optional shortcuts.
sxbs uninstall               Remove the managed shell integration.
sxbs status                  Show installation and platform status.
sxbs list                    List all shortcuts and expansions.
sxbs expand <shortcut>       Show one full command expansion.
sxbs suggest <description>   Find the closest shortcut.
sxbs hook [shell]            Print a hook for inspection or manual sourcing.
sxbs doctor                  Print diagnostics.
sxbs version                 Print the installed version.
sxbs help                    Show help.
```

## Safe Removal

Run the following command to remove only the SXBS-managed block:

```bash
sxbs uninstall
```

Existing startup-file backups are preserved. SXBS does not remove user-created aliases, command binaries, or project files.

## Development

```bash
npm install
npm test
npm run smoke
node bin/sxbs.js --no-color
```

The package uses only Node.js built-in modules. There are no runtime dependencies, no telemetry, and no network calls when the command is running.

## Project Layout

```text
sxbs/
├── bin/sxbs.js        CLI entry point
├── src/core.js        Logo, shortcuts, suggestions, and shell hooks
├── src/manager.js     Cross-platform install and uninstall logic
├── src/paths.js       Startup-file path handling
├── tests/             Node.js test suite
├── package.json       npm package metadata
├── VERSION            Release version
└── README.md          Project documentation
```

## License

MIT License.
