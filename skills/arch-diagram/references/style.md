Draw the diagram as a single HTML page in a dark "terminal blueprint" style, matching the attached screenshot.

- Colors: background #0b0f14, text #c9d1d9, secondary text #7d8590, hairlines #3a4450. Accent colors mark the layer of each element: blue #79a8ff, cyan #5ad1e6, green #6fdc8c, amber #e8b25d, purple #b48cff; red #ff7b72 only for errors.
- Type: monospace only (JetBrains Mono / SF Mono / Menlo, PingFang SC for Chinese), 13px body, 11px labels, bold white titles.
- Boxes: sharp rectangles with a 1px border in the layer color; centered title, a colored subtitle, one or two short dim lines. No rounded corners, shadows, gradients or icons. Dashed border means planned or optional.
- Status badges sit on the top-right border line, cutting it: ● running (green, soft pulse), ▲ warning, ◐ in progress, ■ stopped, ○ not created, ✓ done.
- Connectors: thin orthogonal lines with right-angle turns and small arrowheads, colored by source; solid for sync, dashed for async. Tiny dim text labels on every line; small dots at junctions. Route long lines along the outer edges so nothing crosses a box.
- Group titles and panel legends sit on the border line, like a fieldset legend.
- Overall: dense, precise, engineering-schematic feel; generous dark space between rows; a small legend at the top explaining colors and badges.
