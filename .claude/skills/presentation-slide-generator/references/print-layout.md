# 印刷用レイアウト仕様

## 概要

プレゼンテーションスライドを配布資料用PDFとして出力するための印刷レイアウト仕様。
**A4横向き印刷を最優先**とし、すべての要素が確実にA4内に収まることを保証する。
フォントサイズはpt単位、寸法はmm単位で固定し、100%スケールで正確に印刷される。

---

## 16:9 on A4 設計原則（最重要）

### 計算根拠

```
A4横向き: 297mm × 210mm
ページマージン: 8mm（上下左右）
印刷可能領域: 281mm × 194mm

16:9比率でwidth=281mmの場合:
height = 281 × (9/16) = 158mm

縦方向余白: (194 - 158) / 2 = 18mm（上下均等配置）
```

### ページレイアウト

```
┌───────────────────── A4横 297mm ─────────────────────┐
│ 8mm                                             8mm │
│ ┌─────────────── 印刷領域 281mm ───────────────┐    │
│ │                    18mm                      │    │
│ │  ┌─────────── 16:9スライド ───────────┐      │    │
│ │  │                                    │      │    │
│ │  │         281mm × 158mm              │      │210mm
│ │  │                                    │      │    │
│ │  │    ・アスペクト比 16:9 厳守         │      │    │
│ │  │    ・100%スケールで正確に印刷       │      │    │
│ │  │                                    │      │    │
│ │  └────────────────────────────────────┘      │    │
│ │                    18mm                      │    │
│ └──────────────────────────────────────────────┘    │
│ 8mm                                             8mm │
└─────────────────────────────────────────────────────┘
```

### 寸法（デフォルト値）

| 項目 | 値 | 備考 |
|------|-----|------|
| ページサイズ | A4横 (297mm × 210mm) | @page size: A4 landscape |
| ページマージン | 8mm (上下左右) | @page margin: 8mm |
| 印刷可能領域 | 281mm × 194mm | 297-16, 210-16 |
| **スライド幅** | **281mm** | 印刷領域フル幅 |
| **スライド高さ** | **158mm** | 281 × 9/16 |
| **アスペクト比** | **16:9** | 厳守 |
| 縦余白（上下各） | 18mm | (194-158)/2 で中央配置 |
| 区切り線 | 1px solid #DDD | スライド境界 |

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

**設計原則**:
- フォントサイズは**pt単位**（画面解像度に依存しない固定値）
- 寸法は**mm単位**（印刷時の正確な物理サイズ）
- 100%スケールでの正確な印刷を保証

```css
@media print {
  /* ページ設定 - A4横向き固定 */
  @page {
    size: A4 landscape;
    margin: 8mm;
  }

  /* 印刷不要要素を非表示 */
  .progress-bar,
  .slider-navigation,
  .slider-controls,
  .slide-number,
  .agenda-indicator {
    display: none !important;
  }

  /* ボディ設定 */
  body, html {
    background: white !important;
    overflow: visible !important;
    height: auto !important;
    font-size: 12pt !important;  /* pt単位で固定 */
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

### スライドコンテナ（16:9固定 + mm単位）

**重要**: `.slider__item` は **16:9アスペクト比を固定**し、**mm単位**で寸法を指定。
A4横向き印刷で100%スケール出力に対応。

```css
@media print {
  /* 16:9スライドアイテム - A4横に最適化（mm単位） */
  .slider__item {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    /* 16:9固定サイズ（A4横の印刷領域に最適化） */
    width: 281mm !important;
    height: 158mm !important;
    aspect-ratio: 16 / 9 !important;
    /* 中央配置（縦余白18mm） */
    margin: 18mm auto !important;
    padding: 8mm !important;  /* mm単位 */
    background: white !important;
    border: 1px solid #DDD !important;
    border-radius: 2mm !important;  /* mm単位 */
    box-sizing: border-box !important;
    position: relative !important;
    page-break-after: always !important;
    page-break-inside: avoid !important;
    overflow: hidden !important;
  }

  .slider__item:last-child {
    page-break-after: auto !important;
  }

  /* スライドコンテンツ - 最大サイズを明示（mm単位） */
  .slider__content {
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    width: 100% !important;
    max-width: 265mm !important;   /* コンテンツ領域幅 */
    height: auto !important;
    max-height: 142mm !important;  /* コンテンツ領域高さ */
    padding: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;   /* はみ出し防止 */
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
  .slide-title, .slide-message, .slide-list, .slide-compare,
  .slide-flow, .slide-timeline, .slide-table, .slide-agenda,
  .slide-section, .slide-stats, .slide-quote, .slide-image,
  .slide-diagram, .slide-chart, .slide-grid, .slide-pyramid,
  .slide-highlight, .slide-process, .slide-hero {
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
  .grid-container.grid-2 { grid-template-columns: repeat(2, 1fr) !important; }
  .grid-container.grid-3 { grid-template-columns: repeat(3, 1fr) !important; }
  .grid-container.grid-4 { grid-template-columns: repeat(4, 1fr) !important; }

  /* 全子要素の表示保証 */
  .agenda-item, .list-item, .compare-item, .flow-step, .flow-arrow,
  .grid-card, .stat-item, .pyramid-level, .highlight-item, .process-step,
  .process-arrow, .timeline-item, .timeline-content, .table-wrapper,
  .compare-vs, .message-icon, .icon-wrapper {
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
    font-family: 'Noto Sans JP', sans-serif !important;
  }
}
```

**注**: `{{総スライド数}}` はHTML生成時に実際のスライド数に置換する。

### フォントサイズ（pt単位固定）

**重要**: 印刷時は**pt単位**を使用し、画面解像度に依存しない固定サイズを指定。

```css
@media print {
  /* タイトル系（pt単位） */
  .main-title { font-size: 28pt !important; }
  .sub-title { font-size: 14pt !important; }
  .section-title { font-size: 24pt !important; }

  /* 見出し系（pt単位） */
  .list-title, .flow-title, .compare-title, .table-title,
  .agenda-title, .stats-title, .grid-title, .pyramid-title,
  .highlight-title, .process-title { font-size: 18pt !important; }

  /* メッセージ系（pt単位） */
  .main-message { font-size: 20pt !important; }
  .sub-message { font-size: 12pt !important; }

  /* 統計値（pt単位） */
  .stat-value { font-size: 28pt !important; }

  /* 本文・説明（pt単位） */
  .list-item span,
  .flow-step span,
  .compare-item p,
  .agenda-text { font-size: 11pt !important; }

  /* アイコンサイズ（mm単位） */
  .icon-wrapper {
    width: 12mm !important;
    height: 12mm !important;
  }

  .icon-wrapper i {
    font-size: 16pt !important;
  }

  .title-icon {
    font-size: 32pt !important;
  }
}
```

### スライドタイプ別サイズ指定（mm単位）

各スライドタイプの要素サイズをmm単位で固定し、確実にA4内に収まるよう設計。

```css
@media print {
  /* アジェンダスライド */
  .slide-agenda .agenda-container {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 4mm !important;
    max-width: 250mm !important;
  }

  .slide-agenda .agenda-item {
    padding: 4mm !important;
    min-height: 25mm !important;
    max-height: 35mm !important;
  }

  /* 比較スライド */
  .slide-compare .compare-container {
    display: flex !important;
    gap: 6mm !important;
    max-width: 260mm !important;
  }

  .slide-compare .compare-item {
    flex: 1 !important;
    max-width: 120mm !important;
    padding: 5mm !important;
  }

  /* リストスライド（横3列） */
  .slide-list .list-container {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 4mm !important;
    max-width: 260mm !important;
  }

  .slide-list .list-item {
    flex: 1 !important;
    min-width: 70mm !important;
    max-width: 85mm !important;
    padding: 4mm !important;
  }

  /* フロースライド（横4ステップ） */
  .slide-flow .flow-container {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    gap: 2mm !important;
    max-width: 265mm !important;
  }

  .slide-flow .flow-step {
    min-width: 50mm !important;
    max-width: 58mm !important;
    padding: 4mm !important;
  }

  .slide-flow .flow-arrow {
    font-size: 14pt !important;
    min-width: 6mm !important;
  }

  /* サイクル図（絶対配置） */
  .slide-diagram .cycle-diagram {
    position: relative !important;
    width: 90mm !important;
    height: 90mm !important;
    margin: 0 auto !important;
  }

  .slide-diagram .cycle-node {
    position: absolute !important;
    width: 22mm !important;
    height: 22mm !important;
    border-radius: 50% !important;
    padding: 2mm !important;
  }

  /* サイクルノード位置（絶対配置） */
  .slide-diagram .cycle-node:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); }
  .slide-diagram .cycle-node:nth-child(2) { top: 25%; right: 0; }
  .slide-diagram .cycle-node:nth-child(3) { bottom: 0; right: 15%; }
  .slide-diagram .cycle-node:nth-child(4) { bottom: 0; left: 15%; }
  .slide-diagram .cycle-node:nth-child(5) { top: 25%; left: 0; }

  /* ヒーロースライド */
  .slide-hero .slider__content {
    max-width: 240mm !important;
    text-align: center !important;
  }
}
```

### カラー反転（ライトモード）

```css
@media print {
  /* 背景色を明るく */
  .slider__item,
  .slide-title, .slide-message, .slide-list, .slide-compare,
  .slide-flow, .slide-timeline, .slide-table, .slide-agenda,
  .slide-section, .slide-stats, .slide-quote, .slide-image,
  .slide-diagram, .slide-chart {
    background: white !important;
  }

  /* カード・アイテムの背景 */
  .list-item, .compare-item, .flow-step, .timeline-content,
  .agenda-item, .stat-item, .diagram-node, .pyramid-level,
  .icon-wrapper, .grid-card, .highlight-item, .process-step {
    background: #F5F5F5 !important;
    border: 1px solid #DDD !important;
  }

  /* テキスト色を暗く */
  h1, h2, h3, h4, h5, h6,
  p, span, li, td, th,
  .main-title, .sub-title,
  .main-message, .sub-message,
  .list-title, .list-item span,
  .compare-title,
  .flow-title, .flow-step span,
  .timeline-title, .timeline-content h4, .timeline-content p,
  .table-title,
  .agenda-title, .agenda-text,
  .section-title, .section-subtitle, .section-number,
  .stats-title, .stat-label,
  .grid-title, .grid-card h3, .grid-card p,
  .pyramid-title, .pyramid-level span,
  .highlight-title, .highlight-item h3, .highlight-item p,
  .process-title, .process-step span,
  .hero-title, .hero-subtitle, .hero-thanks {
    color: #1F1F28 !important;
    -webkit-text-fill-color: #1F1F28 !important;
  }

  /* 統計値のグラデーションテキストを単色に */
  .stat-value {
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    -webkit-text-fill-color: #7E9CD8 !important;
    color: #7E9CD8 !important;
  }

  /* 補足テキスト */
  .text-note, .text-caption, .text-small,
  .sub-title, .sub-message, .contact {
    color: #666666 !important;
    -webkit-text-fill-color: #666666 !important;
  }
}
```

### アクセントカラー（維持）

```css
@media print {
  /* アクセントカラーは印刷時も維持 */
  .highlight, .accent-yellow { color: #DCA561 !important; -webkit-text-fill-color: #DCA561 !important; }
  .highlight-pink, .accent-pink { color: #D27E99 !important; -webkit-text-fill-color: #D27E99 !important; }
  .highlight-aqua, .accent-aqua { color: #7AA89F !important; -webkit-text-fill-color: #7AA89F !important; }
  .accent-blue { color: #7E9CD8 !important; -webkit-text-fill-color: #7E9CD8 !important; }
  .accent-violet { color: #957FB8 !important; -webkit-text-fill-color: #957FB8 !important; }

  /* アイコン色 */
  i.fa, i.fas, i.far, i.fab,
  .icon, [class*="fa-"] {
    color: #54546D !important;
  }

  .icon-wrapper i,
  .title-icon, .section-icon, .message-icon i,
  .list-item i, .flow-step i, .stat-item i,
  .grid-card i, .hero-icon {
    color: #7E9CD8 !important;
  }

  .icon-wrapper.accent-pink i, .card-pink i { color: #D27E99 !important; }
  .icon-wrapper.accent-aqua i, .card-aqua i { color: #7AA89F !important; }
  .icon-wrapper.accent-yellow i, .card-yellow i { color: #DCA561 !important; }
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
    background: #E8E8E8 !important;
    color: #1F1F28 !important;
    border: 1px solid #CCC !important;
  }

  td {
    background: white !important;
    color: #1F1F28 !important;
    border: 1px solid #DDD !important;
  }

  tr:nth-child(even) td {
    background: #F5F5F5 !important;
  }
}
```

### フロー・タイムライン印刷用

```css
@media print {
  /* フロー矢印 */
  .flow-arrow {
    color: #DCA561 !important;
  }

  /* タイムラインライン */
  .timeline-line {
    background: #7E9CD8 !important;
  }

  /* タイムラインドット */
  .timeline-dot {
    background: #7E9CD8 !important;
    border-color: white !important;
  }

  /* ステップ番号 */
  .step-number, .agenda-number, .process-number {
    background: #7E9CD8 !important;
    color: white !important;
  }
}
```

### 比較・図解印刷用

```css
@media print {
  /* 比較カード */
  .compare-item.left, .compare-item.before {
    border-top-color: #D27E99 !important;
  }

  .compare-item.right, .compare-item.after {
    border-top-color: #7AA89F !important;
  }

  /* ピラミッド */
  .pyramid-level:nth-child(1) {
    background: #7E9CD8 !important;
  }

  .pyramid-level:nth-child(1) span {
    color: white !important;
    -webkit-text-fill-color: white !important;
  }

  /* その他の装飾 */
  .section-divider, .hero-badge {
    background: linear-gradient(90deg, #7E9CD8, #D27E99) !important;
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

| 設定項目 | 値 |
|---------|-----|
| 送信先 | PDFに保存 |
| ページ | すべて |
| レイアウト | 横 |
| 用紙サイズ | A4 |
| ページあたりのページ数 | 1 |
| 余白 | なし |
| 倍率 | デフォルト |
| 背景のグラフィック | ✓ 有効 |

---

## トラブルシューティング

| 問題 | 原因 | 解決策 |
|------|------|--------|
| **表紙・メッセージが消える** | **GSAPがvisibility:hiddenを設定** | **各スライドタイプ別に`visibility: visible !important`を明示設定** |
| **特定スライドのみ消える** | **スライドタイプ別CSSルール欠落** | **全23種のスライドタイプに対しdisplay/visibilityを設定** |
| コンテンツが消える | `visibility: hidden` | 全子要素に `visibility: visible !important` を追加 |
| コンテンツが消える | `overflow: hidden` | `overflow: visible` に変更 |
| コンテンツが消える | `transform: scale()` | `transform: none` に変更 |
| コンテンツが消える | `display: block` でflex/grid破壊 | 各コンテナの元の `display` モードを維持 |
| タイトルが中央に来ない | `.slider__item`のdisplay | `display: flex` + `align-items: center` + `justify-content: center` |
| カード・リストが表示されない | コンテナのdisplay欠落 | コンテナごとに明示的に `display: flex/grid` を設定 |
| 背景色が印刷されない | 背景グラフィック無効 | 印刷設定で「背景のグラフィック」を有効化 |
| レイアウトが崩れる | マージン設定 | 余白を「なし」に設定 |
| 文字が切れる | フォントサイズ | CSSの`font-size`を調整 |
| 改ページ位置がずれる | コンテンツ量 | `page-break-inside: avoid`を確認 |
| アニメーション残留 | GSAPスタイル | `transform: none !important` を追加 |

### 重要：GSAPアニメーションとの競合

GSAPは画面表示用に `.slider__content { visibility: hidden }` をデフォルト設定する。
印刷時にこれが残るため、**各スライドタイプ別に明示的にvisibilityを上書きする必要がある**。

```css
/* 必須: 各スライドタイプ別の可視化 */
.slide-title .slider__content,
.slide-message .slider__content,
.slide-section .slider__content,
.slide-hero .slider__content,
.slide-quote .slider__content {
  visibility: visible !important;
  display: flex !important;
}

/* 必須: 全子要素の可視化 */
.slider__item *,
.slider__content * {
  visibility: visible !important;
  opacity: 1 !important;
}
```

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

| Version | Date | Changes |
|---------|------|---------|
| **3.1.0** | **2026-01-23** | **GSAP競合対策**: 各スライドタイプ別に`visibility: visible`を明示設定、全子要素の可視化ルール追加、トラブルシューティング強化 |
| 3.0.0 | 2026-01-23 | A4ファースト設計に全面改訂: pt単位フォント、mm単位寸法、スライドタイプ別サイズ指定、サイクル図絶対配置対応 |
| 2.1.0 | 2026-01-04 | Flexbox/Grid維持方式に変更：`.slider__item`をflex表示に、コンテナごとの明示的display設定、全子要素のvisibility保証追加 |
| 2.0.0 | 2026-01-04 | シンプル方式に全面変更（transform: scale廃止、overflow: visible採用）、メモ欄削除 |
| 1.1.0 | 2026-01-03 | 比率維持スケーリング方式に変更（65%→70%/35%→30%）、レイアウト崩れ防止 |
| 1.0.0 | 2026-01-03 | 初版作成 |
