# GASデプロイ手順

## 概要

生成したHTMLプレゼンテーションをGoogle Apps Script (GAS) を使用してウェブアプリとして公開する手順。
**2つの方法**を用意しています。

| 方法 | 特徴 | 推奨場面 |
|------|------|----------|
| 方法A: 1ファイル結合 | ビルドスクリプトでHTML/CSS/JavaScriptを1ファイルに結合 | シンプルにコピペでデプロイしたい場合（推奨） |
| 方法B: GASテンプレート | GAS側でファイルを分離したままデプロイ | GAS上で直接編集・メンテナンスしたい場合 |

### ファイル構成の前提

スライド出力ディレクトリには以下のいずれかの構成があります：

**1ファイル構成**（従来）:
```
slide-YYYY-MM-DD-{タイトル}/
├── index.html      # HTML/CSS/JavaScript全てインライン
├── structure.md
└── deploy-guide.md
```

**分離構成**（新）:
```
slide-YYYY-MM-DD-{タイトル}/
├── index.html      # HTMLのみ（CSS/JavaScriptは外部参照）
├── styles.css      # CSS分離ファイル
├── scripts.js      # JavaScript分離ファイル
├── structure.md
└── deploy-guide.md
```

> **重要**: GASでは外部ファイル参照（`<link href="styles.css">`等）が動作しません。
> 分離構成の場合は方法A（ビルド結合）または方法B（GASテンプレート）で対応します。

---

## 方法A: 1ファイル結合方式（推奨）

### A-0. ビルド（HTML/CSS/JavaScriptを結合）

分離形式（index.html + styles.css + scripts.js）から1ファイルHTMLを生成します。

```bash
# スライドディレクトリを指定して実行
node .claude/skills/presentation-slide-generator/scripts/build-single-html.js \
  "./05_Project/スライド/slide-YYYY-MM-DD-{タイトル}/"
```

→ `index-single.html` が生成されます。

> **注**: 1ファイル構成（CSS/JavaScript全てインライン済み）の場合はこの手順は不要です。
> そのまま index.html をGASに貼り付けてください。

### A-1. GASプロジェクト作成

1. [Google Drive](https://drive.google.com) を開く
2. 「新規」→「その他」→「Google Apps Script」をクリック
3. プロジェクト名を設定（例：「MyPresentation」）

### A-2. コード設定

#### コード.gs

```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('プレゼンテーション')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
```

#### index.html

1. 左側のファイル一覧で「+」→「HTML」を選択
2. ファイル名を `index` に設定（.html は自動付与）
3. `index-single.html`（または1ファイル構成の`index.html`）の内容をすべて貼り付け

### A-3. デプロイ

→ 「3. デプロイ手順」セクションへ

---

## 方法B: GASテンプレート方式（ファイル分離）

GASの`HtmlService.createTemplateFromFile()`を使い、HTML/CSS/JavaScriptをGAS上でも分離したまま管理します。

### B-1. GASプロジェクト作成

方法Aと同じ。

### B-2. コード設定（4ファイル）

GASプロジェクトに以下の4ファイルを作成します。

#### ファイル1: コード.gs（サーバーサイド）

```javascript
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('プレゼンテーション')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * HTMLテンプレートからファイルを読み込むヘルパー関数
 * index.html 内の <?!= include('styles') ?> で呼び出される
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

#### ファイル2: index.html

1. 「+」→「HTML」→ファイル名 `index`
2. ローカルの `index.html` をコピーし、以下2箇所を置換：

**置換前:**
```html
<link rel="stylesheet" href="styles.css">
```
**置換後:**
```html
<?!= include('styles') ?>
```

**置換前:**
```html
<script src="scripts.js"></script>
```
**置換後:**
```html
<?!= include('scripts') ?>
```

#### ファイル3: styles.html

1. 「+」→「HTML」→ファイル名 `styles`
2. 以下の形式で`styles.css`の内容を貼り付け：

```html
<style>
/* === ここにstyles.cssの内容をそのまま貼り付け === */
</style>
```

#### ファイル4: scripts.html

1. 「+」→「HTML」→ファイル名 `scripts`
2. 以下の形式で`scripts.js`の内容を貼り付け：

```html
<script>
/* === ここにscripts.jsの内容をそのまま貼り付け === */
</script>
```

### B-3. デプロイ

→ 「3. デプロイ手順」セクションへ

---

## 3. デプロイ手順（共通）

### 3.1 新しいデプロイの作成

1. 右上の「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 歯車アイコンをクリック
4. 「ウェブアプリ」を選択

### 3.2 デプロイ設定

| 設定項目 | 値 |
|----------|-----|
| 説明 | 任意（例：「プレゼン v1.0」） |
| 次のユーザーとして実行 | 「自分」 |
| アクセスできるユーザー | 「全員」 |

### 3.3 デプロイ実行

1. 「デプロイ」ボタンをクリック
2. 初回は承認が必要
   - 「アクセスを承認」をクリック
   - Googleアカウントでログイン
   - 「詳細」→「〇〇（安全ではないページ）に移動」
   - 「許可」をクリック
3. 表示されたURLをコピー

---

## 4. アクセス方法

### 4.1 URL形式

```
https://script.google.com/macros/s/{SCRIPT_ID}/exec
```

### 4.2 共有方法

- URLをそのまま共有可能
- QRコードに変換して配布も可能
- スマートフォン/タブレットでもアクセス可能

---

## 5. 操作方法

| 操作 | 方法 |
|------|------|
| 次のスライド | →キー / スペースキー / 右ボタン |
| 前のスライド | ←キー / 左ボタン |
| スライドジャンプ | 下部ドットをクリック |
| PDF出力 | Ctrl+P (Windows) / Cmd+P (Mac) |

---

## 6. 更新方法

### 方法A（1ファイル結合）の更新

1. ローカルのファイル（index.html / styles.css / scripts.js）を修正
2. ビルドスクリプトで `index-single.html` を再生成
3. GASプロジェクトの `index.html` を新しい内容で上書き
4. 「デプロイ」→「デプロイを管理」→ 鉛筆アイコン → 「新バージョン」→「デプロイ」

### 方法B（GASテンプレート）の更新

1. GASプロジェクトで該当ファイル（index.html / styles.html / scripts.html）を直接編集
2. 「デプロイ」→「デプロイを管理」→ 鉛筆アイコン → 「新バージョン」→「デプロイ」

### URLについて

- 同じURLで更新内容が反映される
- URLは変更されない

---

## 7. トラブルシューティング

### 7.1 アクセスできない

| 原因 | 対処法 |
|------|--------|
| デプロイされていない | 「デプロイ」→「新しいデプロイ」を実行 |
| 権限設定が不適切 | アクセスできるユーザーを「全員」に設定 |
| URLが古い | 「デプロイを管理」で最新URLを確認 |

### 7.2 表示が崩れる

| 原因 | 対処法 |
|------|--------|
| CDNがブロックされている | 社内ネットワークの場合はIT部門に確認 |
| ブラウザの問題 | 別のブラウザで試す |
| キャッシュの問題 | ブラウザのキャッシュをクリア |

### 7.3 アニメーションが動作しない

| 原因 | 対処法 |
|------|--------|
| JavaScriptエラー | ブラウザの開発者ツールでコンソールを確認 |
| GSAPの読み込み失敗 | ネットワーク接続を確認 |

### 7.4 方法Bでスタイル/スクリプトが反映されない

| 原因 | 対処法 |
|------|--------|
| include()関数が未定義 | コード.gsにinclude関数があるか確認 |
| ファイル名の不一致 | styles.html / scripts.html のファイル名を確認（.htmlは自動付与） |
| テンプレートタグの記述ミス | `<?!= include('styles') ?>` の `!` を忘れていないか確認 |
| `createHtmlOutputFromFile`使用 | 方法Bでは`createTemplateFromFile`を使用すること |

### 7.5 CSS/JavaScriptが外部参照のまま

| 原因 | 対処法 |
|------|--------|
| 分離構成をそのままデプロイ | 方法AでビルドするかB方法でテンプレート化 |
| `<link href="styles.css">` が残っている | GASでは外部ファイル参照不可。インライン化必須 |

---

## 8. 制限事項

| 項目 | 制限 |
|------|------|
| HTMLファイルサイズ | 最大500KB（結合後） |
| 実行時間 | 最大6分 |
| 同時アクセス数 | 制限なし（Google側で管理） |
| カスタムドメイン | 不可（script.google.com のみ） |
| 外部CSS/JavaScriptファイル | **不可**（インライン化またはGASテンプレート方式が必須） |

---

## 9. セキュリティ考慮事項

- 「全員」に公開する場合、URLを知っている人は誰でもアクセス可能
- 機密情報を含むプレゼンは「特定のユーザー」設定を推奨
- URLの取り扱いに注意
