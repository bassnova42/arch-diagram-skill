<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README.en.md">English</a> · <a href="README.es.md">Español</a> · <b>日本語</b> · <a href="README.ko.md">한국어</a> · <a href="README.th.md">ไทย</a>
</p>

# RokoAI arch-diagram アーキテクチャ図 Skill

**Claude Code** と **Codex** で使えます。

GitHub リポジトリ、技術記事、PDF、ローカルプロジェクトを渡すと、Claude Code または Codex が構造を読み取り、アーキテクチャ図を描きます。デフォルトはダークな「ターミナル設計図」スタイルで、ほかに 7 つのスタイルも選べます（[スタイル](#スタイル)）。線の上をパケットが流れ、モジュール間でデータがやり取りされるたびに、下部のログに 1 行ずつリアルタイムで追加されます。

**以下は、オープンソースプロジェクト [morluto/rea](https://github.com/morluto/rea) のアーキテクチャ図です。この Skill が GitHub リポジトリを読み取って自動生成しました：**

![morluto/rea のアーキテクチャ図](examples/rea.gif)

ほかの作例（記事・GitHub リポジトリ・要件定義書）は末尾の [作例](#作例) をご覧ください。

## できること

- **内容に合わせた構造**：レイヤー型システム、パイプライン、ループのあるプロセス、ハブ＆スポーク、スイムレーン、階層ツリー。固定テンプレートは使いません。
- **意味のある色分け**：ボックスは種類ごとに色分け。線はフローの種類（リクエスト、書き込み、コールバック、非同期など）で色と実線／破線を区別。グループ枠は包含関係を表します。
- **ライブトレースログ**：パケットが線の終点に届くと、下部に `時刻 · 種類 · A → B · 説明` の 1 行が追加されます。
- **セルフチェック**：ヘッドレス Chrome でボックスの重なり、文字のはみ出し、ボックスを貫く線、隠れたラベルを検出し、きれいになるまで Claude が修正します。
- **8 つのスタイル**：ナイトターミナル、青焼き設計図、製図用紙、ホワイトボード手描き、ボールドブルータル、蛍光 CRT、ソフトカード、アイソ箱庭。一言で切り替えられます。
- **多彩な出力形式**：
  - インタラクティブな単一 HTML ファイル
  - PNG（2 倍解像度）
  - MP4：デフォルト 20 秒、任意の長さに対応、4 秒周期のシームレスループ
  - GIF：1 周期
  - Mermaid フローチャート

## 図の言語はプロンプトの言語に合わせて決まります

依頼した言語で図が書かれます：

- **日本語**でプロンプトを書けば、図の内容はすべて日本語
- **英語**で書けば、図全体が英語
- **中国語**で書けば、タイトル、説明、ラベル、ログが中国語

元の記事やソースコードが別の言語でも同じです。コードの識別子、パス、コマンドはそのまま残ります。凡例や状態ラベルなどの UI 文言は中国語・英語・日本語・韓国語・スペイン語・タイ語を内蔵しており、それ以外の言語では Claude がその言語で書き出します。

## インストール

Node 18 以上と、Chrome / Chromium / Edge のいずれかが必要です。動画と GIF の出力には `ffmpeg` も必要です（`brew install ffmpeg`）。

**方法 1：npm**（いちばん簡単）

```bash
npx @rokoai/arch-diagram install
```

`~/.claude/skills/arch-diagram` にインストールされます。`--project` を付けると、現在のプロジェクトの `.claude/skills/` に入ります。更新するときはもう一度実行し、削除は `npx @rokoai/arch-diagram uninstall` です。

Codex がインストールされている場合（`~/.codex` がある場合）は、`~/.codex/skills/arch-diagram` にも同時に入ります。片方だけに入れるときは `--claude` または `--codex` を付けます。

> このリポジトリの clone の中で `npx @rokoai/arch-diagram …` を実行すると `arch-diagram: command not found` になります（npm がカレントディレクトリをこのパッケージ自体とみなし、コマンドを PATH に追加しないため）。リポジトリの外で実行するか、clone の中では `node bin/cli.mjs install` を使ってください（`--codex` など同じオプションが使えます）。

**方法 2：プラグイン**。Claude Code では次を実行します：

```
/plugin marketplace add bassnova42/arch-diagram-skill
/plugin install arch-diagram@arch-diagram
```

Codex CLI では：

```bash
codex plugin marketplace add bassnova42/arch-diagram-skill
codex plugin add arch-diagram@arch-diagram
```

**方法 3：手動でコピー**

```bash
git clone https://github.com/bassnova42/arch-diagram-skill
cp -R arch-diagram-skill/skills/arch-diagram ~/.claude/skills/
cp -R arch-diagram-skill/skills/arch-diagram ~/.codex/skills/   # Codex
```

インストール後、Claude Code または Codex を再起動してください。

## 使い方

Claude Code または Codex でそのまま頼むだけです。例：

- `https://github.com/plausible/analytics のアーキテクチャ図を描いて`
- `この記事をフローチャートにして：<URL>、30 秒の動画で出力`
- `さっきの図を画像で出力して` / `mermaid で出力して`
- Skill を明示的に呼び出す場合：Claude Code では `/arch-diagram <URL>`、Codex では `$arch-diagram <URL>`

図の元データは `<slug>.spec.json` です。修正したいときは Claude Code または Codex に spec を編集して再生成するよう頼みます。コマンドラインから直接操作することもできます：

```bash
npx @rokoai/arch-diagram build  my.spec.json my.html
npx @rokoai/arch-diagram check  my.html
npx @rokoai/arch-diagram export my.html my.png my.mp4 --seconds 30
```

## スタイル

デフォルトは **ナイトターミナル**（`terminal`）で、ほかに 7 つのスタイルがあります。依頼するときにスタイルを伝えるだけです。例：`設計図風に描いて`、`ホワイトボード手描き風で`、`3D アイソメトリックにして`。指定しなければデフォルトになります。

- **見た目だけが変わる**：同じ spec がどのスタイルでも描けます。構造・文字・座標は変わらず、セルフチェックも同じです。既存の図も「ソフトカード風に変えて」の一言で描き直せます。
- **色の意味は変わらない**：配色はスタイルごとに違いますが、青・シアン・緑・琥珀・紫が表す要素の種類は同じなので、凡例はそのまま読めます。
- **すべての出力に対応**：HTML、PNG、MP4、GIF はどのスタイルでも書き出せます（Mermaid は Mermaid 自身がレイアウトするためスタイルなし）。

同じ図（Elephant-Goldfish の作例）を 8 スタイルで並べたもの：

| | |
|---|---|
| <img src="themes/terminal.jpg" width="420"><br>**ナイトターミナル（デフォルト）** · `terminal` | <img src="themes/blueprint.jpg" width="420"><br>**青焼き設計図** · `blueprint` |
| <img src="themes/drafting.jpg" width="420"><br>**製図用紙** · `drafting` | <img src="themes/whiteboard.jpg" width="420"><br>**ホワイトボード手描き** · `whiteboard` |
| <img src="themes/brutalism.jpg" width="420"><br>**ボールドブルータル** · `brutalism` | <img src="themes/crt.jpg" width="420"><br>**蛍光 CRT** · `crt` |
| <img src="themes/saas.jpg" width="420"><br>**ソフトカード** · `saas` | <img src="themes/isometric.jpg" width="420"><br>**アイソ箱庭** · `isometric` |

コマンドラインでは `--theme` を付けるか、spec に `"theme": "blueprint"` と書きます：

```bash
npx @rokoai/arch-diagram build my.spec.json my.html --theme whiteboard
```

以下、新しい 7 スタイルの詳細です。作例はすべて [morluto/rea](https://github.com/morluto/rea) の図（このページ冒頭と同じ spec）です。

### 青焼き設計図 · `blueprint`

![青焼き設計図](themes/blueprint.gif)

- **見た目**: 濃い青地に白いインクの線、20px / 100px の二重グリッド、二重線の図枠。ボックスの四隅にトンボ（十字）、線のラベルは斜体、非同期線は長い破線。色は淡いトーンに変わり、青地でも見分けられます。
- **向いている用途**: 設計レビュー、技術提案書、「設計図」らしさが欲しい場面。
- **頼み方**: `設計図風に` · `ブループリント`

[▶ 20 秒の動画（MP4）](themes/blueprint.mp4)

### 製図用紙 · `drafting`

![製図用紙](themes/drafting.gif)

- **見た目**: 紙目のある生成り色の製図用紙に明朝体と濃いインク、二重線の図枠。各コンポーネントの左上に番号付きの丸があり、番号順に説明できます。線の始点には黒丸、非同期線は一点鎖線。
- **向いている用途**: 印刷、PDF 書き出し、マニュアルや論文の図、番号順の解説。
- **頼み方**: `製図風に` · `技術マニュアル風に`

[▶ 20 秒の動画（MP4）](themes/drafting.mp4)

### ホワイトボード手描き · `whiteboard`

![ホワイトボード手描き](themes/whiteboard.gif)

- **見た目**: 白地にマーカーで描いたような少し揺れる線、斜線で塗った箱、開いた矢じり、タイトルの下に蛍光ペン。揺れは固定シードなので毎回同じ描画になり、動画もつなぎ目なくループします。
- **向いている用途**: ブレインストーミング、初期の設計議論、非エンジニアへの説明、ブログの挿絵。
- **頼み方**: `手描き風に` · `ホワイトボード風に` · `ラフスケッチで`
- **注意**: 手書きフォント（Klee、LXGW WenKai など）があるとより手書きらしくなります。ない場合は文字がシステムフォントになり、線は手描きのままです。

[▶ 20 秒の動画（MP4）](themes/whiteboard.mp4)

### ボールドブルータル · `brutalism`

![ボールドブルータル](themes/brutalism.gif)

- **見た目**: クリーム色の地に 2px の黒い太枠と 6px のハードシャドウ、要素色のベタ塗り、極太の文字。線は太く、ラベルは白地に黒枠の札、タイトルは黒いブロックの上。
- **向いている用途**: README のトップ画像、SNS、スライド、ポスターなど、一目で目を引きたい場面。
- **頼み方**: `ブルータリズム風に` · `目立つように` · `ポスター風に`

[▶ 20 秒の動画（MP4）](themes/brutalism.mp4)

### 蛍光 CRT · `crt`

![蛍光 CRT](themes/crt.gif)

- **見た目**: 黒緑のブラウン管。文字と線が蛍光体のように光り、ボックスは二重線、ページ全体に走査線と周辺減光、タイトルの前に `>` プロンプト。
- **向いている用途**: セキュリティ、リバースエンジニアリング、インフラの話題、レトロな発表、動画のサムネイル。
- **頼み方**: `レトロなターミナル風` · `CRT 風` · `蛍光グリーン`

[▶ 20 秒の動画（MP4）](themes/crt.mp4)

### ソフトカード · `saas`

![ソフトカード](themes/saas.gif)

- **見た目**: 明るいドットグリッドの背景に白い角丸カード。上端に要素色の細い帯、柔らかい影。線の角は丸く、ラベルはピル型、非同期線はドット線。
- **向いている用途**: プロダクトドキュメント、Web サイト、社外向けの説明、明るいドキュメントサイト（Notion、Confluence など）。
- **頼み方**: `シンプルで明るく` · `プロダクトドキュメント風` · `SaaS 風`

[▶ 20 秒の動画（MP4）](themes/saas.mp4)

### アイソ箱庭 · `isometric`

![アイソ箱庭](themes/isometric.gif)

- **見た目**: レイアウトとセルフチェックを終えた図を、アイソメトリックの床グリッドに寝かせます。ボックスは厚みと影のある立体ブロックになり、見出し・凡例・ログは正立のまま。文字を縮める代わりにキャンバスを（約 1.5 倍）広げます。
- **向いている用途**: 表紙、宣伝用の画像、コンポーネントの少ないシステムの全体図。
- **頼み方**: `3D 風に` · `アイソメトリックで` · `立体的に`
- **注意**: 文字も床と一緒に傾くため、ノードは 12 個程度までが最適です。ノードが多い図には別のスタイルをおすすめします。

[▶ 20 秒の動画（MP4）](themes/isometric.mp4)

## ディレクトリ構成

```
skills/arch-diagram/
  SKILL.md            手順：ソースを読む → 構造を選ぶ → レイアウト → セルフチェック → 出力
  assets/             描画エンジン、スタイル、テンプレート。themes/ に各スタイルのスタイルシート
  scripts/            build / check / export
  references/         spec の項目説明、ビジュアルスタイル
  examples/           rea（リポジトリ）、plausible（リポジトリ）、elephant-goldfish（記事）
bin/cli.mjs           npm コマンド：install / uninstall / build / check / export
```

## 作例

### 1. 記事から作ったアーキテクチャ図

元データ: Dave Rensin の記事「Elephants, Goldfish, and the New Golden Age of Software Engineering」  
<https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874>

![記事から作ったアーキテクチャ図](examples/elephant-goldfish.gif)

[▶ フル動画（MP4、30 秒）](examples/elephant-goldfish.mp4)

### 2. GitHub リポジトリから作ったアーキテクチャ図

元データ: <https://github.com/morluto/rea>

![GitHub リポジトリから作ったアーキテクチャ図](examples/rea.gif)

[▶ フル動画（MP4、20 秒）](examples/rea.mp4)

### 3. 要件定義書から作ったアーキテクチャ図

元データ: バレエの動きを採点するミニプログラム Ballet の要件定義書（PRD）とコード。非公開プロジェクトのため公開リンクはありません。

![要件定義書から作ったアーキテクチャ図](examples/ballet.gif)

[▶ フル動画（MP4、20 秒）](examples/ballet.mp4)

## ライセンス

MIT
