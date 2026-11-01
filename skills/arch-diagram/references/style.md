# Themes

The engine draws the same spec in eight themes (`spec.theme` or `build.mjs --theme`). `terminal` is the original look described first; the others are summarized after it. Colors keep their names in every theme (blue, cyan, green, amber, purple, red), so the legend's meaning never changes.

## terminal (default)

Draw the diagram as a single HTML page in a dark "terminal blueprint" style, matching the attached screenshot.

- Colors: background #0b0f14, text #c9d1d9, secondary text #7d8590, hairlines #3a4450. Accent colors mark the layer of each element: blue #79a8ff, cyan #5ad1e6, green #6fdc8c, amber #e8b25d, purple #b48cff; red #ff7b72 only for errors.
- Type: monospace only (JetBrains Mono / SF Mono / Menlo, PingFang SC for Chinese), 13px body, 11px labels, bold white titles.
- Boxes: sharp rectangles with a 1px border in the layer color; centered title, a colored subtitle, one or two short dim lines. No rounded corners, shadows, gradients or icons. Dashed border means planned or optional.
- Status badges sit on the top-right border line, cutting it: ● running (green, soft pulse), ▲ warning, ◐ in progress, ■ stopped, ○ not created, ✓ done.
- Connectors: thin orthogonal lines with right-angle turns and small arrowheads, colored by source; solid for sync, dashed for async. Tiny dim text labels on every line; small dots at junctions. Route long lines along the outer edges so nothing crosses a box.
- Group titles and panel legends sit on the border line, like a fieldset legend.
- Overall: dense, precise, engineering-schematic feel; generous dark space between rows; a small legend at the top explaining colors and badges.

## Other themes

- **blueprint**: white ink on blueprint blue (#1b4c8f) with a 20/100px grid and a double sheet frame. Monospace type, pale tints of the palette, registration crosses on box corners, italic wire labels, long dashes.
- **drafting**: ink on aged drafting paper (#f1e9d4) with paper grain and a double sheet frame. Serif type, deep inks, a thin inner rule inside each box, a numbered item balloon on each box's top-left corner, a dot where every wire starts, dash-dot async wires.
- **whiteboard**: marker on a white board (#fcfbf7). Handwriting fonts when installed (Xiaolai, LXGW WenKai, Hannotate, Chalkboard SE…); boxes and groups are drawn by the engine as wobbly double outlines with a hatched fill in the element color; wires wobble and end in open arrowheads. The wobble is seeded, so every render is identical.
- **brutalism**: cream background (#fff3d1), 2px black outlines with 6px hard black shadows, flat fills mixed from the element color, heavy sans type, white boxed wire labels with black borders, thick wires.
- **crt**: phosphor green on a black-green tube (#04110a). Glowing text and wires, a second inner rule in each box, scanlines and vignette over the page.
- **saas**: light product-docs look (#f6f7fb with a dot grid). White cards with 14px corners, a colored top accent and soft shadows; rounded wire corners, dotted async wires, pill labels.
- **isometric**: the finished, checked layout is laid on an isometric floor grid; each box becomes a block extruded 10px with a soft floor shadow; header and log stay upright. The canvas widens to fit the tilted floor instead of shrinking the text.
