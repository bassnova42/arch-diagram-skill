<p align="center">[简体中文](README.md) · [English](README.en.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [ไทย](README.th.md)</p>

# arch-diagram · Architecture diagram skill for Claude Code

Give it a GitHub repo, a technical article, a PDF or a local project. Claude reads the structure and draws a dark "terminal blueprint" architecture diagram. Packets flow along the wires, and the log at the bottom adds a line in real time whenever two modules exchange data.

![REA architecture diagram](docs/rea.png)

## What it does

- **Structure fitted to the content**: layered system, pipeline, process with loops, hub and spoke, swimlanes or hierarchy. No fixed template.
- **Colors that mean something**: boxes are colored by kind; wires are colored and dashed by flow type (request, write, callback, async…); group frames show containment.
- **Live trace log**: when a packet reaches the end of a wire, a line `time · type · A → B · detail` is added at the bottom.
- **Self-check**: headless Chrome checks for overlapping boxes, overflowing text, wires through boxes and covered labels, and Claude fixes them until the layout is clean.
- **Many outputs**:
  - Interactive single-file HTML
  - PNG (2× resolution)
  - MP4: 20 seconds by default, any length on request, a seamless 4-second loop
  - GIF: one loop
  - Mermaid flowchart

![Animated example](docs/elephant-goldfish.gif)

## The diagram speaks your prompt's language

The diagram is written in the language you use to ask for it:

- Write the prompt in **English** and the whole diagram is in English
- Write it in **Chinese** and titles, descriptions, labels and the log are in Chinese
- Write it in **Japanese** and all of the content is in Japanese

This holds even when the source article or code is in another language. Code identifiers, paths and commands stay as they are. Interface words such as legends and status labels are built in for Chinese, English, Japanese, Korean, Spanish and Thai; for other languages Claude writes them in your language.

## Install

Needs Node ≥ 18 and Chrome, Chromium or Edge. Video and GIF output also need `ffmpeg` (`brew install ffmpeg`).

**Option 1: npm** (simplest)

```bash
npx arch-diagram-skill install
```

This installs to `~/.claude/skills/arch-diagram`. Add `--project` to install into the current project's `.claude/skills/`. Run it again to update; remove it with `npx arch-diagram-skill uninstall`.

**Option 2: Claude Code plugin**. In Claude Code, run:

```
/plugin marketplace add bassnova42/arch-diagram-skill
/plugin install arch-diagram@arch-diagram
```

**Option 3: copy by hand**

```bash
git clone https://github.com/bassnova42/arch-diagram-skill
cp -R arch-diagram-skill/skills/arch-diagram ~/.claude/skills/
```

Restart Claude Code after installing.

## Usage

Just ask in Claude Code, for example:

- `Draw the architecture of https://github.com/plausible/analytics`
- `Turn this article into a flowchart: <URL>, export a 30-second video`
- `Export that diagram as an image` / `as mermaid`
- `/arch-diagram <repo or article URL>`

Each diagram's source is `<slug>.spec.json`. To change a diagram, ask Claude to edit the spec and rebuild. You can also use the command line directly:

```bash
npx arch-diagram-skill build  my.spec.json my.html
npx arch-diagram-skill check  my.html
npx arch-diagram-skill export my.html my.png my.mp4 --seconds 30
```

## Layout

```
skills/arch-diagram/
  SKILL.md            workflow: read source → choose structure → lay out → self-check → export
  assets/             rendering engine, styles, template
  scripts/            build / check / export
  references/         spec fields, visual style
  examples/           rea (repo), plausible (repo), elephant-goldfish (article)
bin/cli.mjs           npm commands: install / uninstall / build / check / export
```

## License

MIT
