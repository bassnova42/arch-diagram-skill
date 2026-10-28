#!/usr/bin/env node
// @rokoai/arch-diagram: installs the skill into Claude Code and Codex, and runs its scripts.
//   npx @rokoai/arch-diagram install   [--claude] [--codex] [--project] [--dir <path>]
//   npx @rokoai/arch-diagram uninstall [--claude] [--codex] [--project] [--dir <path>]
//   npx @rokoai/arch-diagram build|check|export <args…>
import { cpSync, existsSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'arch-diagram');
const [cmd, ...args] = process.argv.slice(2);
const has = f => args.includes(f);

// where the skill goes: --dir wins; otherwise each selected agent's skills folder.
// With no agent flag, Claude Code is always included and Codex is added when ~/.codex exists.
function targets() {
  const i = args.indexOf('--dir');
  if (i >= 0 && args[i + 1]) return [{ agent: 'custom', dir: resolve(args[i + 1], 'arch-diagram') }];
  const base = has('--project') ? process.cwd() : homedir();
  const codexHome = has('--project') ? join(base, '.codex') : (process.env.CODEX_HOME || join(base, '.codex'));
  const pick = has('--claude') || has('--codex');
  const out = [];
  if (!pick || has('--claude')) out.push({ agent: 'Claude Code', dir: join(base, '.claude', 'skills', 'arch-diagram') });
  if (has('--codex') || (!pick && existsSync(has('--project') ? codexHome : (process.env.CODEX_HOME || join(homedir(), '.codex')))))
    out.push({ agent: 'Codex', dir: join(codexHome, 'skills', 'arch-diagram') });
  return out;
}

switch (cmd) {
  case 'install': {
    for (const { agent, dir } of targets()) {
      const had = existsSync(dir);
      if (had) rmSync(dir, { recursive: true, force: true });
      cpSync(SRC, dir, { recursive: true });
      console.log(`✓ ${had ? 'updated' : 'installed'} for ${agent} → ${dir}`);
    }
    console.log('  Restart Claude Code / Codex, then ask: "draw the architecture of <repo or article URL>"');
    console.log('  Needs Chrome/Chromium/Edge; ffmpeg only for MP4/GIF output.');
    break;
  }
  case 'uninstall': {
    for (const { agent, dir } of targets()) {
      if (!existsSync(dir)) { console.log(`- nothing for ${agent} at ${dir}`); continue; }
      rmSync(dir, { recursive: true, force: true });
      console.log(`✓ removed for ${agent}: ${dir}`);
    }
    break;
  }
  case 'build': case 'check': case 'export': {
    const r = spawnSync(process.execPath, [join(SRC, 'scripts', cmd + '.mjs'), ...args], { stdio: 'inherit' });
    process.exit(r.status ?? 1);
  }
  default:
    console.log(`@rokoai/arch-diagram — animated architecture diagrams for Claude Code and Codex

  install    [--claude] [--codex] [--project | --dir <skills dir>]
             copy the skill into ~/.claude/skills and ~/.codex/skills (Codex when installed)
  uninstall  [same flags]                       remove it
  build  <spec.json> <out.html>                 render a spec
  check  <out.html> [shot.png]                  self-check layout + screenshot
  export <out.html> <out.png|.mp4|.gif|.mmd|.md> [--seconds N] [--scale K]`);
    process.exit(cmd ? 1 : 0);
}
