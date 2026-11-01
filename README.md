<p align="center">
  <b>简体中文</b> · <a href="docs/README.en.md">English</a> · <a href="docs/README.es.md">Español</a> · <a href="docs/README.ja.md">日本語</a> · <a href="docs/README.ko.md">한국어</a> · <a href="docs/README.th.md">ไทย</a>
</p>

# RokoAI arch-diagram 架构图 Skill

适用于 **Claude Code** 和 **Codex**。

给它一个 GitHub 仓库、一篇技术文章、一份 PDF 或本地项目，Claude Code 或 Codex 会读懂结构，画出一张架构图。默认是深色"终端蓝图"风格，另有 7 种风格可选（见 [风格](#风格)）。连线上有流动的光点，底部的 log 会在模块之间交换数据时实时加一行。

**下面是开源项目 [morluto/rea](https://github.com/morluto/rea) 的架构图，由这个 Skill 读取它的 GitHub 仓库自动生成：**

![morluto/rea 架构图](docs/examples/rea.gif)

更多例子（文章、GitHub 仓库、需求文档）见文末的 [示例](#示例)。

## 能做什么

- **按内容选结构**：分层系统、流水线、带循环的流程、中心辐射、泳道、层级树，不套固定模板。
- **颜色有含义**：元素按种类上色；连线按流向类型（请求、写入、回传、异步……）区分颜色和虚实；分组框表示包含关系。
- **实时 trace log**：光点到达终点时，底部追加一行 `时间 · 类型 · A → B · 说明`。
- **自检**：用无头 Chrome 检查元素重叠、文字溢出、连线穿过方框、标签被遮挡，有问题就改到干净为止。
- **8 种风格**：暗夜终端、晒图蓝图、牛皮纸制图、白板手绘、粗野撞色、荧光终端、柔光卡片、等距沙盘，说一句就能切换。
- **多种输出**：
  - 可交互的单文件 HTML
  - PNG（2 倍分辨率）
  - MP4：默认 20 秒，可指定任意秒数，4 秒一个周期无缝循环
  - GIF：一个周期
  - Mermaid 流程图

## 图的语言跟着提示词走

用什么语言提要求，图就是什么语言：

- 用**中文**写提示词，图里的标题、说明、标签、log 都是中文
- 用**英文**写，整张图就是英文
- 用**日语**写，内容就都是日文

即使原文或源码是另一种语言也一样。代码里的标识符、路径、命令保持原样。图例、状态标签等界面文字内置了中文、英语、日语、韩语、西班牙语、泰语；其他语言由 Claude 按你的语言写出来。

## 安装

需要 Node ≥ 18 和 Chrome、Chromium 或 Edge。输出视频和 GIF 还需要 `ffmpeg`（`brew install ffmpeg`）。

**方式一：npm**（最简单）

```bash
npx @rokoai/arch-diagram install
```

会装到 `~/.claude/skills/arch-diagram`。加 `--project` 则装到当前项目的 `.claude/skills/`。更新时再跑一次；卸载用 `npx @rokoai/arch-diagram uninstall`。

装了 Codex 的话（存在 `~/.codex`），会同时装到 `~/.codex/skills/arch-diagram`。只装其中一个，可以加 `--claude` 或 `--codex`。

> 在本仓库的 clone 目录里运行 `npx @rokoai/arch-diagram …` 会报 `arch-diagram: command not found`：npm 会把当前目录当成这个包本身，不会把它的命令加进 PATH。请到仓库外的目录运行，或在仓库里直接用 `node bin/cli.mjs install`（参数相同，如 `--codex`）。

**方式二：插件**。Claude Code 里依次执行：

```
/plugin marketplace add bassnova42/arch-diagram-skill
/plugin install arch-diagram@arch-diagram
```

Codex CLI 里：

```bash
codex plugin marketplace add bassnova42/arch-diagram-skill
codex plugin add arch-diagram@arch-diagram
```

**方式三：手动拷贝**

```bash
git clone https://github.com/bassnova42/arch-diagram-skill
cp -R arch-diagram-skill/skills/arch-diagram ~/.claude/skills/
cp -R arch-diagram-skill/skills/arch-diagram ~/.codex/skills/   # Codex
```

装好后重启 Claude Code 或 Codex。

## 用法

在 Claude Code 或 Codex 里直接说，比如：

- `把 https://github.com/plausible/analytics 画成架构图`
- `这篇文章画成流程图：<URL>，输出成视频，30 秒`
- `把刚才的图输出成图片` / `输出成 mermaid`
- 想明确指定用这个 Skill：Claude Code 里输入 `/arch-diagram <仓库或文章地址>`，Codex 里输入 `$arch-diagram <仓库或文章地址>`

图的源文件是 `<slug>.spec.json`，要修改就让 Claude Code 或 Codex 改 spec，再重新生成。也可以用命令行直接操作：

```bash
npx @rokoai/arch-diagram build  my.spec.json my.html
npx @rokoai/arch-diagram check  my.html
npx @rokoai/arch-diagram export my.html my.png my.mp4 --seconds 30
```

## 风格

默认是 **暗夜终端**（`terminal`）风格，另外还有 7 种风格。提要求时说出风格就行，比如 `画成蓝图风格`、`用手绘白板风格`、`换成 3D 等距`；不说就用默认风格。

- **只换外观，不改内容**：同一份 spec，换风格不用动结构、文字和坐标，自检规则也一样。已有的图说一句"换成柔光卡片风格"就能重画。
- **颜色含义不变**：每种风格都有自己的配色，但蓝、青、绿、琥珀、紫这些颜色名在每种风格里都对应同一类元素，图例照样能看懂。
- **所有输出都支持**：HTML、PNG、MP4、GIF 在每种风格下都能导出（Mermaid 由 Mermaid 自己排版，不带风格）。

同一张图（Elephant-Goldfish 示例）的 8 种风格一览：

| | |
|---|---|
| <img src="docs/themes/terminal.jpg" width="420"><br>**暗夜终端（默认）** · `terminal` | <img src="docs/themes/blueprint.jpg" width="420"><br>**晒图蓝图** · `blueprint` |
| <img src="docs/themes/drafting.jpg" width="420"><br>**牛皮纸制图** · `drafting` | <img src="docs/themes/whiteboard.jpg" width="420"><br>**白板手绘** · `whiteboard` |
| <img src="docs/themes/brutalism.jpg" width="420"><br>**粗野撞色** · `brutalism` | <img src="docs/themes/crt.jpg" width="420"><br>**荧光终端** · `crt` |
| <img src="docs/themes/saas.jpg" width="420"><br>**柔光卡片** · `saas` | <img src="docs/themes/isometric.jpg" width="420"><br>**等距沙盘** · `isometric` |

命令行里用 `--theme` 指定，或者在 spec 里写 `"theme": "blueprint"`：

```bash
npx @rokoai/arch-diagram build my.spec.json my.html --theme whiteboard
```

下面逐个介绍新增的 7 种风格，示例都是 [morluto/rea](https://github.com/morluto/rea) 的架构图（和本页顶部那张同一份 spec）。

### 晒图蓝图 · `blueprint`

![晒图蓝图](docs/themes/blueprint.gif)

- **外观**：深蓝底上画白色墨线，铺着 20px / 100px 两层网格，四周有双线图框。方框四角带对位十字，连线标签用斜体，异步连线是长虚线。颜色换成了浅色调，在蓝底上依然分得清。
- **适合**：系统设计评审、技术方案文档、想要"工程图纸"仪式感的场合。
- **这样说**：`画成蓝图风格` · `蓝图` · `blueprint`

[▶ 20 秒视频（MP4）](docs/themes/blueprint.mp4)

### 牛皮纸制图 · `drafting`

![牛皮纸制图](docs/themes/drafting.gif)

- **外观**：米黄色纸张带纸纹，衬线字体，深色墨水线条，四周双线图框。每个组件左上角有编号气泡，方便按编号讲解；连线起点有实心圆点，异步连线是点划线。
- **适合**：打印、导出 PDF、技术手册和论文插图，或者需要"①②③"逐项讲解的场合。
- **这样说**：`工程制图风格` · `技术手册风格` · `图纸风格`

[▶ 20 秒视频（MP4）](docs/themes/drafting.mp4)

### 白板手绘 · `whiteboard`

![白板手绘](docs/themes/whiteboard.gif)

- **外观**：白底，马克笔一样微微抖动的线条，方框用斜线填色，箭头是开口的笔画，标题下面像被荧光笔划过。抖动用固定随机种子生成，每次渲染完全一样，视频也能无缝循环。
- **适合**：头脑风暴、方案早期讨论、给非技术同事讲解、博客配图。
- **这样说**：`手绘风格` · `白板风格` · `画成草图`
- **注意**：装了手写字体（霞鹜文楷、手札体、翩翩体等）会更像手写；没装时中文会用系统字体，线条仍然是手绘的。

[▶ 20 秒视频（MP4）](docs/themes/whiteboard.mp4)

### 粗野撞色 · `brutalism`

![粗野撞色](docs/themes/brutalism.gif)

- **外观**：奶油色底，2px 黑色粗边框加 6px 硬投影，方框用元素颜色大面积填充，粗体字。连线又粗又黑白分明，标签是白底黑框的小牌子，标题压在黑色色块上。
- **适合**：README 首图、社交媒体、演讲幻灯片、海报，需要第一眼就抓住注意力的地方。
- **这样说**：`粗野风格` · `醒目一点` · `海报感` · `撞色`

[▶ 20 秒视频（MP4）](docs/themes/brutalism.mp4)

### 荧光终端 · `crt`

![荧光终端](docs/themes/crt.gif)

- **外观**：黑绿色显像管屏幕，文字和连线带荧光辉光，方框是双线框，整页叠加扫描线和四角暗角，标题前带 `>` 提示符。
- **适合**：安全、逆向、基础设施类主题，复古风分享，视频封面。
- **这样说**：`复古终端` · `CRT 风格` · `荧光绿`

[▶ 20 秒视频（MP4）](docs/themes/crt.mp4)

### 柔光卡片 · `saas`

![柔光卡片](docs/themes/saas.gif)

- **外观**：浅灰点阵背景，白色圆角卡片，顶部一条元素颜色的细条，柔和阴影。连线拐角是圆角，标签是胶囊形，异步连线是圆点线。
- **适合**：产品文档、官网、对外介绍，以及浅色文档站（Notion、飞书、语雀等）。
- **这样说**：`简洁浅色风格` · `产品文档风格` · `SaaS 风格` · `卡片风格`

[▶ 20 秒视频（MP4）](docs/themes/saas.mp4)

### 等距沙盘 · `isometric`

![等距沙盘](docs/themes/isometric.gif)

- **外观**：排好版、自检通过的图整张铺到等距网格地面上，每个方框变成有厚度和投影的立体块；标题、图例和日志保持正立。画布会加宽（约 1.5 倍），而不是把字缩小。
- **适合**：封面图、宣传图、节点不多的系统总览。
- **这样说**：`3D 风格` · `等距` · `立体一点`
- **注意**：文字也跟着地面倾斜，节点在 12 个以内效果最好；节点很多时建议换其他风格。

[▶ 20 秒视频（MP4）](docs/themes/isometric.mp4)

## 目录

```
skills/arch-diagram/
  SKILL.md            工作流程：读源 → 选结构 → 布局 → 自检 → 导出
  assets/             渲染引擎、样式、模板；themes/ 下是各风格的样式
  scripts/            build / check / export
  references/         spec 字段说明、视觉风格
  examples/           rea（仓库）、plausible（仓库）、elephant-goldfish（文章）
bin/cli.mjs           npm 命令：install / uninstall / build / check / export
```

## 示例

### 1. 对一篇文章做的架构图

来源：Dave Rensin 的文章《Elephants, Goldfish, and the New Golden Age of Software Engineering》  
<https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874>

![对一篇文章做的架构图](docs/examples/elephant-goldfish.gif)

[▶ 完整视频（MP4，30 秒）](docs/examples/elephant-goldfish.mp4)

### 2. 对一个 GitHub 仓库做的架构图

来源：<https://github.com/morluto/rea>

![对一个 GitHub 仓库做的架构图](docs/examples/rea.gif)

[▶ 完整视频（MP4，20 秒）](docs/examples/rea.mp4)

### 3. 对一份需求文档做的架构图

来源：Ballet 芭蕾动作评分小程序的需求文档（PRD）和代码。这是私有项目，没有公开链接。

![对一份需求文档做的架构图](docs/examples/ballet.gif)

[▶ 完整视频（MP4，20 秒）](docs/examples/ballet.mp4)

## License

MIT
