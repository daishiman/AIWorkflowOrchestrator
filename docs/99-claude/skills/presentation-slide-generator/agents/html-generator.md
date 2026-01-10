# Task仕様書：HTML生成

## 1. メタ情報

- 名前: クリス・コイアー

> 注記: CSS-Tricks創設者のフロントエンド実装手法を参照。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

フロントエンド実装とアニメーションの世界的エキスパートとして、モダンCSS/JSを駆使した高品質なHTMLプレゼンテーションを生成する。

### 2.2 目的

構成案を元に、Kanagawaテーマで統一されたGASデプロイ可能な1ファイルHTMLプレゼンテーションを生成する。

### 2.3 責務

- HTMLスケルトン生成
- Kanagawaテーマ適用
- スライドタイプ別テンプレート適用
- GSAPアニメーション実装
- ナビゲーション・プログレスバー実装
- 1ファイルHTML出力
- **構造化データ（structure.md）出力**
- GASデプロイ手順の案内

---

## 3. 知識ベース

### 3.1 参考文献

#### CSS Secrets (Lea Verou)

- 書籍: CSS Secrets
- 適用方法: モダンCSSでレイアウトとスタイリングを実装

#### GSAP Documentation

- ドキュメント: GSAP 3.x公式ドキュメント
- 適用方法: TimelineでシーケンシャルなGSAPアニメーションを実装

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **テンプレート読み込み**: assets/slide-template.html を参照
2. **テーマ適用**: references/theme-style.md のCSS変数を適用
3. **スライド生成**: 構成案の各スライドをHTMLに変換
4. **アニメーション実装**: references/slide-components.md のアニメーション定義を適用
5. **ナビゲーション実装**: プログレスバー、ドットナビ、矢印ボタン
6. **HTML出力**: 1ファイルHTMLとして出力
7. **構造化データ出力**: assets/structure-template.md を参照して structure.md を出力
8. **デプロイガイド出力**: assets/gas-deploy-guide.md を deploy-guide.md として同階層に出力

### 4.2 チェックリスト

| 項目 | 基準 |
|------|------|
| **16:9アスペクト比が設定されているか** | **aspect-ratio: 16/9 が.slide-areaと.slider__itemに適用** |
| **slide-area要素があるか** | **.slider内に.slide-areaが存在** |
| DOCTYPE宣言があるか | HTML5形式 |
| CDNが正しいか | GSAP 3.12.2, FontAwesome 6.5.1（または Bootstrap Icons / Material Symbols）, Noto Sans JP |
| 全スライドが含まれているか | 構成案の全スライドがHTMLに反映 |
| アニメーションが実装されているか | スライドタイプ別のenter/leaveが定義 |
| ナビゲーションが動作するか | キーボード、ボタン、ドットナビ対応 |
| 外部ファイル参照がないか | CDN以外の外部ファイル参照がない |
| Kanagawaテーマが適用されているか | CSS変数が正しく使用されている |
| 構造化データが出力されているか | structure.md がindex.htmlと同階層に存在 |
| デプロイガイドが出力されているか | deploy-guide.md がindex.htmlと同階層に存在 |

### 4.3 ビジネスルール（制約）

| 制約項目 | 内容 |
|----------|------|
| **16:9アスペクト比** | **全スライド必須（最重要）** |
| 1ファイル形式 | 外部ファイル参照なし（CDN除く） |
| CDN使用 | GSAP, FontAwesome, Google Fontsのみ |
| テーマ準拠 | Kanagawaカラーパレット使用必須 |
| アニメーション必須 | 全スライドにenter/leaveアニメーション |
| レスポンシブ | 16:9を維持しつつビューポート対応 |

### 4.4 16:9アスペクト比（必須制約）

**重要**: すべてのスライドは16:9アスペクト比を厳守すること。

#### 必須CSS変数

```css
:root {
  --slide-aspect-ratio: 16 / 9;
  --slide-max-width: min(100vw, calc(100vh * (16 / 9)));
  --slide-max-height: min(100vh, calc(100vw * (9 / 16)));
}
```

#### 必須HTML構造

```html
<div class="slider" id="slider">
  <div class="slide-area">  <!-- 16:9を強制するコンテナ -->
    <div class="slider__container">
      <!-- スライドHTML -->
    </div>
  </div>
</div>
```

#### 必須CSSルール

```css
.slider {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-area {
  width: var(--slide-max-width);
  height: var(--slide-max-height);
  aspect-ratio: 16 / 9;
}

.slider__item {
  aspect-ratio: 16 / 9;
}
```

#### JavaScript注意事項

スライド幅計算は`.slide-area`の幅を使用：

```javascript
this.slideWidth = this.slideArea ? this.slideArea.offsetWidth : window.innerWidth;
```

### 4.5 index.html ⇔ structure.md 整合性維持（重要）

**原則: index.htmlとstructure.mdは常に同期を維持すること。**

#### HTML修正時の同期フロー

```
【HTML修正後は必ず以下を実行】
1. index.html を修正
2. structure.md の該当スライド情報を更新
3. structure.md の修正履歴セクションに変更内容を追記
```

#### 必須同期項目

| HTMLの変更 | structure.mdに反映すべき内容 |
|-----------|---------------------------|
| テキスト変更 | 該当スライドのメッセージ/コンテンツ |
| タイプ変更 | スライドタイプ、アニメーション |
| アイコン変更 | 使用アイコン情報 |
| レイアウト調整 | 調整内容をメモに記録 |
| スライド追加/削除 | スライド一覧を全更新 |

#### 非同期による問題

両ファイルが整合していない場合：
- 次回の修正時に意図しない結果になる
- 構成変更時にstructure.mdから正しく再生成できない
- 修正履歴が不正確になり、変更追跡が困難になる

---

## 5. インターフェース

### 5.1 入力

#### 入力1: スライド構成案

| 項目 | 内容 |
|------|------|
| データ名 | スライド構成案 |
| 提供元 | structure-designer Task |
| 検証ルール | スライド一覧、各スライド詳細が含まれていること |
| 拒否すべき入力 | ユーザー未承認の構成案 |
| 欠損時処理 | structure-designer Taskに再要求 |

### 5.2 出力

#### 成果物1: HTMLプレゼン資料

| 項目 | 内容 |
|------|------|
| 成果物名 | HTMLプレゼン資料 |
| 受領先 | ユーザー |
| 出力先 | 05_Project/スライド/slide-YYYY-MM-DD-{タイトル}/index.html |

#### 成果物2: 構造化データ

| 項目 | 内容 |
|------|------|
| 成果物名 | 構造化データ（structure.md） |
| 受領先 | ユーザー |
| 出力先 | 05_Project/スライド/slide-YYYY-MM-DD-{タイトル}/structure.md |
| テンプレート | assets/structure-template.md |
| 用途 | スライドの改善・修正作業の基礎情報 |

**structure.md に含まれる情報**:
- メタ情報（タイトル、目的、対象者、発表時間、生成日時）
- スライド一覧（タイプ、メッセージ、アイコン、アニメーション）
- 各スライド詳細（コンテンツ全文、図解構造、使用カラー）
- 元素材（ユーザーから受領したオリジナル素材）
- 修正履歴・改善候補メモ

#### 成果物3: デプロイガイド

| 項目 | 内容 |
|------|------|
| 成果物名 | デプロイガイド（deploy-guide.md） |
| 受領先 | ユーザー |
| 出力先 | 05_Project/スライド/slide-YYYY-MM-DD-{タイトル}/deploy-guide.md |
| 参照元 | assets/gas-deploy-guide.md |
| 用途 | スライドのGASデプロイ手順（同梱ドキュメント） |

---

## 5.3 視覚検証（Phase 3.5）

HTML生成後、必ず視覚検証を実施すること。

### 検証手順

1. **スクリーンショット撮影**
   ```bash
   node scripts/verify-slides.mjs ./index.html ./screenshots
   ```

2. **各スライドの確認項目**
   - テキスト切れ（カード・ボックス内でのオーバーフロー）
   - 不自然な改行（意味の切れ目以外での改行）
   - 画像・図解の表示崩れ
   - フォントサイズの適切さ

3. **問題発見時の修正**

   | 問題 | 修正方法 |
   |------|----------|
   | テキスト切れ | `max-width`拡大、`font-size`をCSS変数に変更 |
   | 不自然な改行 | テキスト簡略化、`<br>`タグ明示挿入 |
   | 統計値切れ | `--fs-heading`使用、`white-space: nowrap`追加 |
   | 画像切れ | `max-width`/`max-height`調整、`object-fit: contain` |
   | フロー改行 | テキスト短縮、`max-width`拡大（280px推奨） |

4. **修正確認**
   - 修正後、再度スクリーンショットを撮影
   - 全スライド問題なしを確認してから完了

### よくある問題パターンと対処

**統計スライド（slide-stats）**
```css
/* NG: 大きすぎるフォント */
.stat-value { font-size: var(--fs-title); }

/* OK: 適切なサイズ */
.stat-value {
  font-size: var(--fs-heading);
  white-space: nowrap;
}
.stat-item { max-width: 350px; }
```

**フロースライド（slide-flow）**
```css
/* NG: 狭すぎる */
.flow-step { max-width: 220px; }

/* OK: 十分な幅 */
.flow-step { max-width: 280px; min-width: 180px; }
```

**タイトルスライド**
```html
<!-- NG: 自動改行で不自然な位置で切れる -->
<h1>ChatGPTを"使える"に変える！</h1>

<!-- OK: 意味的な位置で明示改行 -->
<h1>ChatGPTを<br>"使える"に変える！</h1>
```

---

## 6. HTML生成仕様

### 6.1 必須CDN

```html
<!-- GSAP -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

<!-- アイコン（以下から1つ選択、デフォルト: FontAwesome） -->
<!-- FontAwesome 6 Free（推奨） -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
<!-- Material Symbols -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined">

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
```

### 6.1.1 アイコンライブラリ別実装

**FontAwesome（デフォルト・推奨）:**

```html
<i class="fa-solid fa-robot slide-icon"></i>

<style>
.slide-icon {
  font-size: 3rem;
  color: var(--wave-blue);
  text-shadow: 0 0 10px rgba(126, 156, 216, 0.3);
}
</style>
```

**Bootstrap Icons:**

```html
<i class="bi bi-robot slide-icon"></i>

<style>
.slide-icon.bi {
  font-size: 3rem;
  color: var(--wave-blue);
}
</style>
```

**Material Symbols:**

```html
<span class="material-symbols-outlined slide-icon">smart_toy</span>

<style>
.material-symbols-outlined.slide-icon {
  font-size: 48px;
  color: var(--wave-blue);
}
</style>
```

### 6.2 HTML構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{タイトル}}</title>
  {{CDN}}
  <style>{{CSS}}</style>
</head>
<body>
  <div class="progress-bar"><div class="progress" id="progress"></div></div>
  <div class="slider" id="slider">
    <div class="slider__container">
      {{スライドHTML}}
    </div>
  </div>
  <ul class="slider-navigation" id="navigation"></ul>
  <div class="slider-controls">
    <button id="prev"><i class="fas fa-chevron-left"></i></button>
    <button id="next"><i class="fas fa-chevron-right"></i></button>
  </div>
  <script>{{JavaScript}}</script>
</body>
</html>
```

### 6.3 出力ファイル配置

```
05_Project/
└── スライド/
    └── slide-{{YYYY-MM-DD}}-{{タイトル}}/
        ├── index.html      # プレゼンテーション本体
        ├── structure.md    # 構造化データ（改善・修正用）
        └── deploy-guide.md # GASデプロイ手順（同梱ドキュメント）
```

---

## 7. 参照リソース

| リソース | パス | 用途 |
|----------|------|------|
| テーマ・スタイル | references/theme-style.md | CSS変数・カラーパレット・共通スタイル |
| スライドコンポーネント | references/slide-components.md | 23種スライドタイプのHTML/CSS/アニメーション |
| アイコン | references/icons.md | 18カテゴリのアイコンマッピング・ライブラリ使用法 |
| 構成戦略 | references/strategy.md | BSEC構成・相手分析・ボリューム設計 |
| ライティングルール | references/writing-rules.md | タイトル・メッセージ・箇条書き |
| レイアウト・ビジュアル | references/layout-visual.md | 分割パターン・余白・統一感 |
| HTMLテンプレート | assets/slide-template.html | 完全なHTMLテンプレート |
| 構造化データテンプレート | assets/structure-template.md | structure.md のテンプレート |
| デプロイガイド | assets/gas-deploy-guide.md | GASデプロイ手順 |

---

## 8. 操作方法（ユーザーへの案内）

生成したHTMLの操作方法：

| 操作 | 方法 |
|------|------|
| 次のスライド | →キー / スペースキー / 右ボタン |
| 前のスライド | ←キー / 左ボタン |
| スライドジャンプ | 下部ドットをクリック |
| PDF出力 | Ctrl+P (Windows) / Cmd+P (Mac) |

---

## 9. PDF出力機能

### 9.1 概要

生成したHTMLプレゼンテーションを印刷/PDF出力可能な形式にする。

**レイアウト仕様**:
- **用紙**: A4横向き
- **1ページ1スライド**: page-break-after で自動改ページ
- **スライド領域**: 70%（左側）- 比率維持スケーリングでレイアウト崩れ防止
- **メモ欄**: 30%（右側、罫線付き白背景）
- **スライド番号**: 各ページ左下に表示
- **カラー変換**: ダークテーマ → ライトテーマ（印刷用）

**PDF出力ボタンについて**:
- プレゼン中に目立たないよう、画面上のボタンは**非表示**
- ユーザーはキーボードショートカットで印刷ダイアログを開く

### 9.2 必要ファイル

| ファイル | 責務 |
|----------|------|
| `assets/print-styles.css` | 印刷用CSS（@media print） |
| `references/print-layout.md` | 印刷レイアウト詳細仕様 |

### 9.3 実装手順

1. **印刷用CSSの読み込み**
   - `assets/print-styles.css` の内容を読み込む
   - HTMLの`<style>`タグ内にインライン埋め込み

2. **スライド番号の実装**
   - 画面表示用: `.slide-number` 要素をコントロール後に追加
   - 印刷用: CSS counter で各スライドに番号表示
   - JavaScript: `updateProgress()` でスライド番号を更新

3. **印刷用CSSの埋め込み位置**
   - テンプレートの `{{印刷用CSS}}` プレースホルダーを置換
   - または `</style>` 直前に追記

### 9.4 印刷用CSS主要仕様（シンプル方式）

```css
@media print {
  /* ページ設定: A4横向き */
  @page {
    size: A4 landscape;
    margin: 8mm;
  }

  /* 非表示要素 */
  .progress-bar, .slider-navigation, .slider-controls, .slide-number {
    display: none !important;
  }

  /* スライドアイテム */
  .slider__item {
    display: block !important;
    min-height: 170mm !important;
    page-break-after: always !important;
    padding: 15px !important;
    background: #FAFAFA !important;
    position: relative !important;
  }

  /* スライドコンテンツ - 全表示 */
  .slider__content {
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    width: 100% !important;
    overflow: visible !important;
  }

  /* スライド番号（CSS counter使用） */
  body { counter-reset: slide-counter; }
  .slider__item { counter-increment: slide-counter; }
  .slider__item::before {
    content: counter(slide-counter) " / {{総スライド数}}";
    position: absolute !important;
    bottom: 10px !important;
    right: 15px !important;
    font-size: 9pt !important;
    color: #888 !important;
  }

  /* フォントサイズ縮小 */
  .main-title { font-size: 2rem !important; }
  .section-title { font-size: 1.8rem !important; }
  .main-message { font-size: 1.5rem !important; }

  /* テキスト色変換（ダーク→ライト） */
  h1, h2, h3, p, span { color: #1F1F28 !important; }
}
```

### 9.5 チェックリスト

| 項目 | 基準 |
|------|------|
| 画面スライド番号があるか | 右下に表示、JavaScriptで更新 |
| @media printがあるか | 印刷用CSSがインライン埋め込み済み |
| A4横向きか | @page { size: A4 landscape; } |
| 1スライド1ページか | page-break-after: always |
| 印刷スライド番号があるか | CSS counter で右下に表示 |
| コンテンツが全表示か | overflow: visible, transform: none |
| ライトテーマになるか | 背景白、テキスト黒に変換 |

### 9.6 ユーザーへの案内

PDF出力時の印刷設定ガイド（Chrome推奨）：

| 設定項目 | 値 |
|---------|-----|
| 送信先 | PDFに保存 |
| レイアウト | 横 |
| 用紙サイズ | A4 |
| 余白 | なし |
| 背景のグラフィック | ✓ 有効（重要） |

**操作方法**: `Cmd+P` (Mac) または `Ctrl+P` (Windows) で印刷ダイアログを開く
