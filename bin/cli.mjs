#!/usr/bin/env node
// @rokoai/arch-diagram: installs the skill into Claude Code and runs its scripts.
//   npx @rokoai/arch-diagram install [--project] [--dir <path>]
//   npx @rokoai/arch-diagram uninstall [--project] [--dir <path>]
//   npx @rokoai/arch-diagram build|check|export <args…>
import { cpSync, existsSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'arch-diagram');
const [cmd, ...args] = process.argv.slice(2);

function target() {
  const i = args.indexOf('--dir');
  if (i >= 0 && args[i + 1]) return resolve(args[i + 1], 'arch-diagram');
  const base = args.includes('--project') ? join(process.cwd(), '.claude') : join(homedir(), '.claude');
  return join(base, 'skills', 'arch-diagram');
}

switch (cmd) {
  case 'install': {
    const to = target();
    const had = existsSync(to);
    if (had) rmSync(to, { recursive: true, force: true });
    cpSync(SRC, to, { recursive: true });
    console.log(`✓ ${had ? 'updated' : 'installed'} arch-diagram skill → ${to}`);
    console.log('  Restart Claude Code, then ask: "draw the architecture of <repo or article URL>" or run /arch-diagram');
    console.log('  Needs Chrome/Chromium/Edge; ffmpeg only for MP4/GIF output.');
    break;
  }
  case 'uninstall': {
    const to = target();
    if (!existsSync(to)) { console.log(`nothing at ${to}`); break; }
    rmSync(to, { recursive: true, force: true });
    console.log(`✓ removed ${to}`);
    break;
  }
  case 'build': case 'check': case 'export': {
    const r = spawnSync(process.execPath, [join(SRC, 'scripts', cmd + '.mjs'), ...args], { stdio: 'inherit' });
    process.exit(r.status ?? 1);
  }
  default:
    console.log(`@rokoai/arch-diagram — animated architecture diagrams for Claude Code

  install    [--project | --dir <skills dir>]   copy the skill into ~/.claude/skills (or ./.claude/skills)
  uninstall  [--project | --dir <skills dir>]   remove it
  build  <spec.json> <out.html>                 render a spec
  check  <out.html> [shot.png]                  self-check layout + screenshot
  export <out.html> <out.png|.mp4|.gif|.mmd|.md> [--seconds N] [--scale K]`);
    process.exit(cmd ? 1 : 0);
}
