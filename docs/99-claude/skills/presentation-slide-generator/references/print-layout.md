# 印刷用レイアウト仕様

## 概要

プレゼンテーションスライドを配布資料用PDFとして出力するための印刷レイアウト仕様。
シンプル方式を採用し、フルスクリーンのスライドをそのまま1ページ1スライドで印刷する。

---

## レイアウト構成

### ページレイアウト

```
┌─────────────────────────────────────────────────────────────┐
│                        A4 横向き                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   スライドコンテンツ                         │
│                       (100%)                                │
│                                                             │
│   ・フルページ表示（メモ欄なし）                              │
│   ・明るい背景 (#FAFAFA)                                    │
│   ・テキストは黒 (#1F1F28)                                  │
│   ・フォントサイズ縮小で視認性確保                            │
│   ・レイアウト崩れなし                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   スライド番号 / 全体枚数                     │
└─────────────────────────────────────────────────────────────┘
```

### 寸法

| 項目         | 値                   |
| ------------ | -------------------- |
| ページサイズ | A4横 (297mm × 210mm) |
| マージン     | 8mm (上下左右)       |
| スライド領域 | 100%（フルページ）   |
| 最小高さ     | 170mm                |
| 区切り線     | 1px solid #DDD       |

### シンプル方式（推奨）

**従来の問題**: `transform: scale()` + `overflow: hidden` を使用した方式では、コンテンツがクリッピングされて消失する問題が発生。

**解決策**: フルページ表示 + フォントサイズ縮小で、レイアウトを維持しながら全コンテンツを表示。

```
従来方式（問題あり）:
┌────────────────────────────────┐
│  transform: scale(0.65)        │  ← overflow: hidden でクリッピング
│  width/height: 153%            │  ← コンテンツ消失の原因
│  overflow: hidden              │
└────────────────────────────────┘

シンプル方式（推奨）:
┌────────────────────────────────┐
│  transform: none               │  ← スケーリングなし
│  width: 100%                   │  ← フルページ表示
│  overflow: visible             │  ← 全コンテンツ表示
│  font-size: 縮小               │  ← 視認性確保
└────────────────────────────────┘
```

---

## 印刷用CSS

### 基本設定

```css
@media print {
  /* ページ設定 */
  @page {
    size: A4 landscape;
    margin: 8mm;
  }

  /* 印刷不要要素を非表示 */
  .progress-bar,
  .slider-navigation,
  .slider-controls,
  .slide-number {
    display: none !important;
  }

  /* ボディ設定 */
  body,
  html {
    background: white !important;
    overflow: visible !important;
    height: auto !important;
  }

  .slider {
    overflow: visible !important;
    height: auto !important;
  }

  .slider__container {
    display: block !important;
    transform: none !important;
  }
}
```

### スライドコンテナ（Flexbox/Grid維持方式）

**重要**: `.slider__item` は `display: flex` を使用して中央揃えを維持する。
各コンテナは元の `display` モード（flex/grid）を維持し、全子要素に `visibility: visible` を設定する。

```css
@media print {
  /* スライドアイテム（flexで中央揃え維持） */
  .slider__item {
    display: flex !important; /* 重要: blockではなくflex */
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: auto !important;
    width: 100% !important;
    height: auto !important;
    min-height: 170mm !important;
    page-break-after: always !important;
    page-break-inside: avoid !important;
    padding: 15px !important;
    margin: 0 !important;
    background: #fafafa !important;
    border: 1px solid #ddd !important;
    border-radius: 8px !important;
    box-sizing: border-box !important;
    position: relative !important;
  }

  .slider__item:last-child {
    page-break-after: auto !important;
  }

  /* スライドコンテンツ - 全表示（display維持） */
  .slider__content {
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    padding: 20px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    /* display: 元のスタイルを維持（下記で個別指定） */
  }

  /* 各スライドタイプのdisplay維持 */
  .slide-title .slider__content,
  .slide-message .slider__content {
    display: block !important;
    text-align: center !important;
  }

  .slide-agenda .slider__content,
  .slide-list .slider__content,
  .slide-compare .slider__content,
  .slide-flow .slider__content,
  .slide-stats .slider__content,
  .slide-grid .slider__content,
  .slide-pyramid .slider__content,
  .slide-highlight .slider__content,
  .slide-process .slider__content,
  .slide-section .slider__content,
  .slide-hero .slider__content {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
  }

  /* 全スライドタイプの基本設定 */
  .slide-title,
  .slide-message,
  .slide-list,
  .slide-compare,
  .slide-flow,
  .slide-timeline,
  .slide-table,
  .slide-agenda,
  .slide-section,
  .slide-stats,
  .slide-quote,
  .slide-image,
  .slide-diagram,
  .slide-chart,
  .slide-grid,
  .slide-pyramid,
  .slide-highlight,
  .slide-process,
  .slide-hero {
    transform: none !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }
}
```

### コンテナのレイアウト維持（重要）

各コンテナは元の `display` モードを維持し、`visibility: visible` を設定する。

```css
@media print {
  /* グリッドコンテナ */
  .agenda-container {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.8rem !important;
    width: 100% !important;
    visibility: visible !important;
  }

  /* フレックスコンテナ */
  .list-container {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 1rem !important;
    justify-content: center !important;
    width: 100% !important;
    visibility: visible !important;
  }

  .compare-container {
    display: flex !important;
    gap: 1.5rem !important;
    justify-content: center !important;
    width: 100% !important;
    visibility: visible !important;
  }

  .flow-container {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.5rem !important;
    flex-wrap: wrap !important;
    width: 100% !important;
    visibility: visible !important;
  }

  .grid-container {
    display: grid !important;
    gap: 1rem !important;
    width: 100% !important;
    visibility: visible !important;
  }
  .grid-container.grid-2 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .grid-container.grid-3 {
    grid-template-columns: repeat(3, 1fr) !important;
  }
  .grid-container.grid-4 {
    grid-template-columns: repeat(4, 1fr) !important;
  }

  /* 全子要素の表示保証 */
  .agenda-item,
  .list-item,
  .compare-item,
  .flow-step,
  .flow-arrow,
  .grid-card,
  .stat-item,
  .pyramid-level,
  .highlight-item,
  .process-step,
  .process-arrow,
  .timeline-item,
  .timeline-content,
  .table-wrapper,
  .compare-vs,
  .message-icon,
  .icon-wrapper {
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### スライド番号（CSS counter使用）

```css
@media print {
  /* カウンターリセット */
  body {
    counter-reset: slide-counter;
  }

  /* カウンターインクリメント */
  .slider__item {
    counter-increment: slide-counter;
  }

  /* スライド番号表示 */
  .slider__item::before {
    content: counter(slide-counter) " / {{総スライド数}}";
    position: absolute !important;
    bottom: 10px !important;
    right: 15px !important;
    font-size: 9pt !important;
    color: #888 !important;
    font-family: "Noto Sans JP", sans-serif !important;
  }
}
```

**注**: `{{総スライド数}}` はHTML生成時に実際のスライド数に置換する。

### フォントサイズ縮小（印刷用）

```css
@media print {
  /* タイトル系 */
  .main-title {
    font-size: 2rem !important;
  }
  .sub-title {
    font-size: 1rem !important;
  }
  .section-title {
    font-size: 1.8rem !important;
  }

  /* 見出し系 */
  .list-title,
  .flow-title,
  .compare-title,
  .table-title,
  .agenda-title,
  .stats-title,
  .grid-title,
  .pyramid-title,
  .highlight-title,
  .process-title {
    font-size: 1.3rem !important;
  }

  /* メッセージ系 */
  .main-message {
    font-size: 1.5rem !important;
  }
  .sub-message {
    font-size: 0.9rem !important;
  }

  /* 統計値 */
  .stat-value {
    font-size: 2rem !important;
  }

  /* アイコンサイズ縮小 */
  .icon-wrapper {
    width: 50px !important;
    height: 50px !important;
  }

  .icon-wrapper i {
    font-size: 1.5rem !important;
  }

  .title-icon {
    font-size: 2.5rem !important;
  }
}
```

### カラー反転（ライトモード）

```css
@media print {
  /* 背景色を明るく */
  .slider__item,
  .slide-title,
  .slide-message,
  .slide-list,
  .slide-compare,
  .slide-flow,
  .slide-timeline,
  .slide-table,
  .slide-agenda,
  .slide-section,
  .slide-stats,
  .slide-quote,
  .slide-image,
  .slide-diagram,
  .slide-chart {
    background: white !important;
  }

  /* カード・アイテムの背景 */
  .list-item,
  .compare-item,
  .flow-step,
  .timeline-content,
  .agenda-item,
  .stat-item,
  .diagram-node,
  .pyramid-level,
  .icon-wrapper,
  .grid-card,
  .highlight-item,
  .process-step {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
  }

  /* テキスト色を暗く */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  span,
  li,
  td,
  th,
  .main-title,
  .sub-title,
  .main-message,
  .sub-message,
  .list-title,
  .list-item span,
  .compare-title,
  .flow-title,
  .flow-step span,
  .timeline-title,
  .timeline-content h4,
  .timeline-content p,
  .table-title,
  .agenda-title,
  .agenda-text,
  .section-title,
  .section-subtitle,
  .section-number,
  .stats-title,
  .stat-label,
  .grid-title,
  .grid-card h3,
  .grid-card p,
  .pyramid-title,
  .pyramid-level span,
  .highlight-title,
  .highlight-item h3,
  .highlight-item p,
  .process-title,
  .process-step span,
  .hero-title,
  .hero-subtitle,
  .hero-thanks {
    color: #1f1f28 !important;
    -webkit-text-fill-color: #1f1f28 !important;
  }

  /* 統計値のグラデーションテキストを単色に */
  .stat-value {
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    -webkit-text-fill-color: #7e9cd8 !important;
    color: #7e9cd8 !important;
  }

  /* 補足テキスト */
  .text-note,
  .text-caption,
  .text-small,
  .sub-title,
  .sub-message,
  .contact {
    color: #666666 !important;
    -webkit-text-fill-color: #666666 !important;
  }
}
```

### アクセントカラー（維持）

```css
@media print {
  /* アクセントカラーは印刷時も維持 */
  .highlight,
  .accent-yellow {
    color: #dca561 !important;
    -webkit-text-fill-color: #dca561 !important;
  }
  .highlight-pink,
  .accent-pink {
    color: #d27e99 !important;
    -webkit-text-fill-color: #d27e99 !important;
  }
  .highlight-aqua,
  .accent-aqua {
    color: #7aa89f !important;
    -webkit-text-fill-color: #7aa89f !important;
  }
  .accent-blue {
    color: #7e9cd8 !important;
    -webkit-text-fill-color: #7e9cd8 !important;
  }
  .accent-violet {
    color: #957fb8 !important;
    -webkit-text-fill-color: #957fb8 !important;
  }

  /* アイコン色 */
  i.fa,
  i.fas,
  i.far,
  i.fab,
  .icon,
  [class*="fa-"] {
    color: #54546d !important;
  }

  .icon-wrapper i,
  .title-icon,
  .section-icon,
  .message-icon i,
  .list-item i,
  .flow-step i,
  .stat-item i,
  .grid-card i,
  .hero-icon {
    color: #7e9cd8 !important;
  }

  .icon-wrapper.accent-pink i,
  .card-pink i {
    color: #d27e99 !important;
  }
  .icon-wrapper.accent-aqua i,
  .card-aqua i {
    color: #7aa89f !important;
  }
  .icon-wrapper.accent-yellow i,
  .card-yellow i {
    color: #dca561 !important;
  }
}
```

### テーブル印刷用

```css
@media print {
  table {
    border-collapse: collapse !important;
    width: 100% !important;
  }

  th {
    background: #e8e8e8 !important;
    color: #1f1f28 !important;
    border: 1px solid #ccc !important;
  }

  td {
    background: white !important;
    color: #1f1f28 !important;
    border: 1px solid #ddd !important;
  }

  tr:nth-child(even) td {
    background: #f5f5f5 !important;
  }
}
```

### フロー・タイムライン印刷用

```css
@media print {
  /* フロー矢印 */
  .flow-arrow {
    color: #dca561 !important;
  }

  /* タイムラインライン */
  .timeline-line {
    background: #7e9cd8 !important;
  }

  /* タイムラインドット */
  .timeline-dot {
    background: #7e9cd8 !important;
    border-color: white !important;
  }

  /* ステップ番号 */
  .step-number,
  .agenda-number,
  .process-number {
    background: #7e9cd8 !important;
    color: white !important;
  }
}
```

### 比較・図解印刷用

```css
@media print {
  /* 比較カード */
  .compare-item.left,
  .compare-item.before {
    border-top-color: #d27e99 !important;
  }

  .compare-item.right,
  .compare-item.after {
    border-top-color: #7aa89f !important;
  }

  /* ピラミッド */
  .pyramid-level:nth-child(1) {
    background: #7e9cd8 !important;
  }

  .pyramid-level:nth-child(1) span {
    color: white !important;
    -webkit-text-fill-color: white !important;
  }

  /* その他の装飾 */
  .section-divider,
  .hero-badge {
    background: linear-gradient(90deg, #7e9cd8, #d27e99) !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
```

---

## 使用手順

### ブラウザでの印刷

1. HTMLファイルをブラウザで開く
2. `Ctrl+P` (Windows) / `Cmd+P` (Mac) で印刷ダイアログを開く
3. 印刷設定:
   - 送信先: 「PDFに保存」
   - レイアウト: 「横」
   - 余白: 「なし」または「最小」
   - 背景のグラフィック: **有効にする**（重要）
4. 「保存」をクリック

### Chrome推奨設定

| 設定項目               | 値         |
| ---------------------- | ---------- |
| 送信先                 | PDFに保存  |
| ページ                 | すべて     |
| レイアウト             | 横         |
| 用紙サイズ             | A4         |
| ページあたりのページ数 | 1          |
| 余白                   | なし       |
| 倍率                   | デフォルト |
| 背景のグラフィック     | ✓ 有効     |

---

## トラブルシューティング

| 問題                         | 原因                             | 解決策                                                              |
| ---------------------------- | -------------------------------- | ------------------------------------------------------------------- |
| コンテンツが消える           | `visibility: hidden`             | 全子要素に `visibility: visible !important` を追加                  |
| コンテンツが消える           | `overflow: hidden`               | `overflow: visible` に変更                                          |
| コンテンツが消える           | `transform: scale()`             | `transform: none` に変更                                            |
| コンテンツが消える           | `display: block` でflex/grid破壊 | 各コンテナの元の `display` モードを維持                             |
| タイトルが中央に来ない       | `.slider__item`のdisplay         | `display: flex` + `align-items: center` + `justify-content: center` |
| カード・リストが表示されない | コンテナのdisplay欠落            | コンテナごとに明示的に `display: flex/grid` を設定                  |
| 背景色が印刷されない         | 背景グラフィック無効             | 印刷設定で「背景のグラフィック」を有効化                            |
| レイアウトが崩れる           | マージン設定                     | 余白を「なし」に設定                                                |
| 文字が切れる                 | フォントサイズ                   | CSSの`font-size`を調整                                              |
| 改ページ位置がずれる         | コンテンツ量                     | `page-break-inside: avoid`を確認                                    |
| アニメーション残留           | GSAPスタイル                     | `transform: none !important` を追加                                 |

---

## 設計原則

### シンプル方式を採用する理由

1. **コンテンツ消失防止**: `transform: scale()` + `overflow: hidden` の組み合わせは、印刷時にコンテンツがクリッピングされて消失する原因となる
2. **デバッグ容易性**: シンプルなCSSは問題発生時の原因特定が容易
3. **ブラウザ互換性**: 複雑なtransformは印刷エンジンとの相性問題が発生しやすい
4. **保守性**: フォントサイズ調整のみで視認性を確保でき、コードが簡潔

### 避けるべきパターン

```css
/* NG: コンテンツ消失の原因となる */
.slider__content {
  overflow: hidden !important;
  transform: scale(0.65) !important;
  width: 153% !important;
  height: 153% !important;
}

/* OK: シンプルで確実 */
.slider__content {
  overflow: visible !important;
  transform: none !important;
  width: 100% !important;
  height: auto !important;
}
```

---

## 変更履歴

| Version | Date       | Changes                                                                                                                |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 2.1.0   | 2026-01-04 | Flexbox/Grid維持方式に変更：`.slider__item`をflex表示に、コンテナごとの明示的display設定、全子要素のvisibility保証追加 |
| 2.0.0   | 2026-01-04 | シンプル方式に全面変更（transform: scale廃止、overflow: visible採用）、メモ欄削除                                      |
| 1.1.0   | 2026-01-03 | 比率維持スケーリング方式に変更（65%→70%/35%→30%）、レイアウト崩れ防止                                                  |
| 1.0.0   | 2026-01-03 | 初版作成                                                                                                               |
