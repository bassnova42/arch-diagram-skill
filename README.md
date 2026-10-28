# arch-diagram · 架构图 Skill for Claude Code

给它一个 GitHub 仓库、一篇技术文章、一份 PDF 或本地项目，Claude 会读懂结构，画出一张深色"终端蓝图"风格的架构图。连线带流动的光点，底部的 log 会在模块之间交换数据时实时加一行。

![REA 架构图](docs/rea.png)

## 能做什么

- **按内容选结构**：分层系统、流水线、带循环的流程、中心辐射、泳道、层级树。不套固定模板。
- **颜色有含义**：元素按种类上色，连线按流向类型（请求、写入、回传、异步……）区分颜色和虚实，分组框表示包含关系。
- **实时 trace log**：光点到达终点时，底部追加一行 `时间 · 类型 · A → B · 说明`。
- **自检**：用无头 Chrome 检查元素重叠、文字溢出、连线穿过方框、标签被遮挡，有问题就改到干净为止。
- **多种输出**：
  - 可交互的单文件 HTML
  - PNG（2 倍分辨率）
  - MP4：默认 20 秒，可指定任意秒数，4 秒一个周期无缝循环
  - GIF：一个周期
  - Mermaid 流程图

![动图示例](docs/elephant-goldfish.gif)

## 安装

需要 Node ≥ 18 和 Chrome、Chromium 或 Edge。输出视频和 GIF 还需要 `ffmpeg`（`brew install ffmpeg`）。

**方式一：作为插件安装**（推荐）。在 Claude Code 里依次执行：

```
/plugin marketplace add bassnova42/arch-diagram-skill
/plugin install arch-diagram@arch-diagram
```

**方式二：直接拷进 skills 目录**

```bash
git clone https://github.com/bassnova42/arch-diagram-skill
cp -R arch-diagram-skill/skills/arch-diagram ~/.claude/skills/
```

## 用法

在 Claude Code 里直接说，比如：

- `把 https://github.com/plausible/analytics 画成架构图`
- `这篇文章画成流程图：<URL>，输出成视频，30 秒`
- `把刚才的图输出成图片` / `输出成 mermaid`
- `/arch-diagram <仓库或文章地址>`

图的源文件是 `<slug>.spec.json`，要修改就让 Claude 改 spec，再重新生成。

## 目录

```
skills/arch-diagram/
  SKILL.md            工作流程：读源 → 选结构 → 布局 → 自检 → 导出
  assets/             渲染引擎、样式、模板
  scripts/            build / check / export
  references/         spec 字段说明、视觉风格
  examples/           rea（仓库）、plausible（仓库）、elephant-goldfish（文章）
```

## License

MIT
