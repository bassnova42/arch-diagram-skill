<p align="center">[简体中文](README.md) · [English](README.en.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [ไทย](README.th.md)</p>

# arch-diagram · Claude Code / Codex 用アーキテクチャ図 Skill

GitHub リポジトリ、技術記事、PDF、ローカルプロジェクトを渡すと、Claude Code または Codex が構造を読み取り、ダークな「ターミナル設計図」スタイルのアーキテクチャ図を描きます。線の上をパケットが流れ、モジュール間でデータがやり取りされるたびに、下部のログに 1 行ずつリアルタイムで追加されます。

![REA のアーキテクチャ図](docs/rea.png)

## できること

- **内容に合わせた構造**：レイヤー型システム、パイプライン、ループのあるプロセス、ハブ＆スポーク、スイムレーン、階層ツリー。固定テンプレートは使いません。
- **意味のある色分け**：ボックスは種類ごとに色分け。線はフローの種類（リクエスト、書き込み、コールバック、非同期など）で色と実線／破線を区別。グループ枠は包含関係を表します。
- **ライブトレースログ**：パケットが線の終点に届くと、下部に `時刻 · 種類 · A → B · 説明` の 1 行が追加されます。
- **セルフチェック**：ヘッドレス Chrome でボックスの重なり、文字のはみ出し、ボックスを貫く線、隠れたラベルを検出し、きれいになるまで Claude が修正します。
- **多彩な出力形式**：
  - インタラクティブな単一 HTML ファイル
  - PNG（2 倍解像度）
  - MP4：デフォルト 20 秒、任意の長さに対応、4 秒周期のシームレスループ
  - GIF：1 周期
  - Mermaid フローチャート

![アニメーション例](docs/elephant-goldfish.gif)

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
- `/arch-diagram <リポジトリまたは記事の URL>`

図の元データは `<slug>.spec.json` です。修正したいときは Claude に spec を編集して再生成するよう頼みます。コマンドラインから直接操作することもできます：

```bash
npx @rokoai/arch-diagram build  my.spec.json my.html
npx @rokoai/arch-diagram check  my.html
npx @rokoai/arch-diagram export my.html my.png my.mp4 --seconds 30
```

## ディレクトリ構成

```
skills/arch-diagram/
  SKILL.md            手順：ソースを読む → 構造を選ぶ → レイアウト → セルフチェック → 出力
  assets/             描画エンジン、スタイル、テンプレート
  scripts/            build / check / export
  references/         spec の項目説明、ビジュアルスタイル
  examples/           rea（リポジトリ）、plausible（リポジトリ）、elephant-goldfish（記事）
bin/cli.mjs           npm コマンド：install / uninstall / build / check / export
```

## ライセンス

MIT
