# Spec reference

One JSON file describes the whole diagram. `scripts/build.mjs` turns it into a single self-contained HTML file. All coordinates are pixels on a fixed-width canvas (default 1080 wide). The engine scales it down on narrow screens.

## Top level

| key | meaning |
|---|---|
| `lang` | `"zh-CN"` (default) or `"en"`. Sets the default status labels and legend text |
| `pageTitle` | browser tab title. Defaults to `title` with the markup removed |
| `title` | bold header line. Supports markup |
| `subtitle` | optional dim line under the title |
| `width` | canvas width, default 1080 |
| `layers` | `[{id, label, color}]`: the element *kinds*. Drives the color legend and each node's default color |
| `flows` | `[{id, label, color, dash}]`: the wire *kinds*. Edges reference one with `flow`, and the header draws a flow legend. With flows declared, the generic sync/async legend is hidden |
| `nodes` | boxes (see below) |
| `groups` | `[{id?, label, x, y, w, h, color, solid?, labelRight?}]`: a dashed outline whose legend sits on the top border (`labelRight` moves it to the right). Use it to show containment: one session, one process, one cluster, one phase. Use it to enclose a cluster, a VPC or a "deploy unit" |
| `notes` | `[{id?, x, y, w, text, align?, dim?, color?}]`: free text, e.g. a queue name between two rows. Notes can be wire anchors |
| `edges` | wires (see below) |
| `dots` | `[{at: [x,y] or "anchor", color, hollow?}]`: junction dots |
| `log` | `{title, rows: [[time, who, color, what, detail], …], cols?, y?}`: the "session log" panel under the diagram |
| `log.live` | `true` or `{rows: N}` (default 7) replaces `rows` with a live trace: every time a packet reaches the end of a wire, a row `t · flow · A → B · label` is added (`⇄` for `arrow: "both"`). Each wire logs one arrival per 4s cycle, at an evenly spaced slot, so `?loop=4` videos stay seamless. Node names come from `short`, otherwise the title before ` · `. Per edge, `log: false` skips it, `log: "text"` overrides the detail, `log: {who, what, detail, color}` overrides any field. Wires anchored on raw points are skipped unless they have `log`. Still renders (check/PNG) show the first N rows statically |
| `footer` | `{cwd, cmd, note}`: terminal prompt line with a blinking cursor, plus a dim note |
| `statusLabels` | override badge text per status, e.g. `{"none": "规划中"}` |
| `wireLegend` | `false` hides the "── sync ╌╌ async" legend |

Colors: `blue cyan green amber purple red orange text dim faint`, or the short forms `bl cy gr am pu rd or`.

## Markup (in any text field)

- `{cy:text}`, `{bl:…}`, `{gr:…}`, `{am:…}`, `{pu:…}`, `{rd:…}`: colored text
- `{b:…}`: bold
- `{w:…}`: bright white
- `{dim:…}`: dim
- Markup nests: `{b:{gr:OK}}`
- `\n` starts a new line
- HTML is escaped, so there is no injection risk

## Node

```json
{ "id": "api", "layer": "svc", "x": 395, "y": 300, "w": 520, "h": 330,
  "title": "app · NestJS {cy::3000}", "sub": "what it is / tech", "text": "bright centered line",
  "lines": ["dim centered line", "…"],
  "rows": [{ "id": "m-auth", "name": "auth", "ref": "src/auth", "desc": "JWT", "tag": "global", "bar": 60, "color": "cyan", "bright": true }],
  "pipeline": ["decode", "~filter (dashed)", "score"],
  "footer": "line under a dashed rule",
  "status": "ok|warn|dev|off|none|done", "statusText": "custom badge text",
  "dashed": true, "color": "override layer color" }
```

- `h` is optional. If you leave it out, the box grows to fit its content, and the wires and log are placed after measuring.
- The render order inside a box is fixed: title → sub → text → rows → pipeline → lines → footer.
- `rows` is a module table. Give a row an `id` so wires and rail items can anchor to it. A wire on side l/r of a row uses the box edge at the row's height.
- `dashed` means planned or optional. The statuses `dev`, `none` and `off` are also drawn dashed.

Status glyphs: ● ok (pulses), ▲ warn, ◐ dev, ■ off, ○ none, ✓ done. Only use a status the source actually supports.

### Rail node (side panel)

`"kind": "rail"` makes a tall panel with a dashed spine. Each item in `items: [{icon, title, lines, alignTo, top, hl}]` is placed one of three ways:

- `alignTo: "<row id>"` vertically centers the item on that row, so a straight wire can run across to it
- `top: N` places it at N px from the rail's top
- with neither, it stacks 18px under the previous item

`hl: true` gives the item a tinted highlight bar. Use it for a closing "before launch / caveats" item. If `h` is omitted, the rail grows to fit its items.

## Edge

```json
{ "from": "api.b", "to": "worker.t", "flow": "call", "color": "override", "dash": true, "label": "POST /tasks\nasync",
  "mid": 690, "rail": "x:1062", "via": [[x,y],…], "straight": true,
  "arrow": false | "both", "joint": true | "hollow", "startDot": true, "packet": false,
  "labelSide": "above|below|left|right", "labelSeg": 2, "labelOffset": [dx,dy], "labelPos": [x,y], "labelColor": "green" }
```

Anchors can take these forms:

- `"id"`: the side is inferred from where the other end is
- `"id.side"`: side is `t`, `b`, `l` or `r`
- `"id.side@0.3"`: a fraction along that side
- `"id.side@40px"`: 40px from the start of the side (left or top end)
- `"id.side@-22px"`: 22px from the far end of the side
- `[x, y]` or `[x, y, "b"]`: a raw point, for fan-outs and junctions

Routing is orthogonal and is chosen like this:

- **t/b → t/b**: down, across at `mid` (default halfway), down
- **l/r → l/r**: across, vertical at `mid`, across
- **mixed sides**: one elbow
- `rail: "x:N"`: out to the vertical line x=N, along it, then in. Use this for long wires along the outer edge. `"y:N"` does the same with a horizontal line.
- `via`: explicit waypoints. Elbows are inserted between them automatically.
- `straight: true`: slides the start along its side so the wire runs straight into the target, e.g. from a tall rail to a table row.

Fan-out pattern: one edge `[x1,y]→[x3,y]` with `arrow:false`, plus one edge per branch from `[xi,y,"b"]` to the target, plus `dots` at the branch points.

Wire meaning comes from the declared `flows`: each kind of relationship gets one color and dash style, named in the legend. Without `flows`, the convention is solid = synchronous and `dash` = async/optional.

## Self-check (what check.mjs reports)

- boxes or notes overlapping each other
- content overflowing its box, taller or wider than the box
- anything off the canvas
- wires passing through a box other than their two endpoints
- wire labels sitting on a box
- rail items colliding
- warning only: the number of wire crossings
