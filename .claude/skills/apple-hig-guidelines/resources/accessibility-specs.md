# HIG アクセシビリティ詳細仕様

## VoiceOver

### 基本要素

| 属性                    | 用途             | 例                           |
| ----------------------- | ---------------- | ---------------------------- |
| **accessibilityLabel**  | 要素の説明       | 「設定ボタン」               |
| **accessibilityHint**   | 追加コンテキスト | 「ダブルタップで設定を開く」 |
| **accessibilityValue**  | 現在の値         | 「50パーセント」             |
| **accessibilityTraits** | 要素の特性       | button, link, header         |

### Traits一覧

| Trait                       | 用途                     | 自動付与    |
| --------------------------- | ------------------------ | ----------- |
| **button**                  | タップ可能な要素         | UIButton    |
| **link**                    | ナビゲーションリンク     | -           |
| **header**                  | セクションヘッダー       | -           |
| **image**                   | 画像要素                 | UIImageView |
| **selected**                | 選択状態                 | -           |
| **staticText**              | 読み上げ専用テキスト     | UILabel     |
| **adjustable**              | 調整可能（スライダー等） | UISlider    |
| **allowsDirectInteraction** | 直接操作可能             | -           |
| **playsSound**              | 音声を再生               | -           |
| **startsMediaSession**      | メディア再生開始         | -           |
| **summaryElement**          | サマリー要素             | -           |
| **updatesFrequently**       | 頻繁に更新               | -           |
| **notEnabled**              | 無効状態                 | disabled時  |

### ラベリングベストプラクティス

**良い例**:

```
✅ accessibilityLabel = "送信"
✅ accessibilityLabel = "メニューを開く"
✅ accessibilityLabel = "山田太郎のプロフィール画像"
```

**悪い例**:

```
❌ accessibilityLabel = "ボタン"（冗長）
❌ accessibilityLabel = "btn_submit"（技術的）
❌ accessibilityLabel = "ここをタップして送信"（指示的）
```

### グループ化

```
コンテナをグループとしてマーク:
- accessibilityElements = [子要素の配列]
- isAccessibilityElement = true（コンテナ全体を1要素に）

例：カードをグループ化
accessibilityLabel = "商品名、価格1,000円、在庫あり"
accessibilityTraits = .button
```

### カスタムアクション

```
複数アクション可能な要素:
accessibilityCustomActions = [
  UIAccessibilityCustomAction(name: "編集"),
  UIAccessibilityCustomAction(name: "削除"),
  UIAccessibilityCustomAction(name: "共有")
]
```

---

## Dynamic Type

### サイズカテゴリ

| カテゴリ                | Body     | スケール |
| ----------------------- | -------- | -------- |
| xSmall                  | 14pt     | 0.82x    |
| Small                   | 15pt     | 0.88x    |
| Medium                  | 16pt     | 0.94x    |
| **Large（デフォルト）** | **17pt** | **1.0x** |
| xLarge                  | 19pt     | 1.12x    |
| xxLarge                 | 21pt     | 1.24x    |
| xxxLarge                | 23pt     | 1.35x    |

### アクセシビリティサイズ

| カテゴリ | Body | スケール |
| -------- | ---- | -------- |
| AX1      | 28pt | 1.65x    |
| AX2      | 33pt | 1.94x    |
| AX3      | 40pt | 2.35x    |
| AX4      | 47pt | 2.76x    |
| AX5      | 53pt | 3.12x    |

### 実装要件

1. **すべてのテキストで対応必須**
2. **固定サイズは禁止**（例外：タブバーラベルなど）
3. **レイアウトの適応**
   - 水平配置 → 垂直配置
   - テキスト切り詰めの回避
   - スクロール可能なコンテナ

### CSS実装

```css
/* 動的フォントサイズ */
html {
  font-size: 100%; /* ユーザー設定を尊重 */
}

body {
  font-size: 1rem; /* 17pt相当 */
}

.title {
  font-size: 1.25rem; /* Title 2: 22pt */
}

.caption {
  font-size: 0.75rem; /* Caption 1: 12pt */
}

/* 極端なサイズでのレイアウト調整 */
@media (min-resolution: 2dppx) {
  .card-horizontal {
    flex-direction: column;
  }
}
```

---

## カラーコントラスト

### WCAG要件

| テキストサイズ   | 最小コントラスト比 | 推奨  |
| ---------------- | ------------------ | ----- |
| 通常（< 18pt）   | **4.5:1**          | 7:1   |
| 大（≥ 18pt）     | **3:1**            | 4.5:1 |
| 太字（≥ 14pt）   | **3:1**            | 4.5:1 |
| UIコンポーネント | **3:1**            | 4.5:1 |
| グラフィック要素 | **3:1**            | 4.5:1 |

### システムカラーのコントラスト

| カラー        | 白背景   | 黒背景   |
| ------------- | -------- | -------- |
| System Blue   | 4.5:1 ✅ | 5.8:1 ✅ |
| System Red    | 4.0:1 ⚠️ | 5.2:1 ✅ |
| System Green  | 2.9:1 ⚠️ | 5.0:1 ✅ |
| System Orange | 2.5:1 ❌ | 4.8:1 ✅ |

### 色だけに依存しない設計

```
❌ 悪い例:
- 赤 = エラー、緑 = 成功（色のみ）

✅ 良い例:
- 赤 + ✕アイコン + 「エラー」ラベル
- 緑 + ✓アイコン + 「成功」ラベル
```

### 高コントラストモード対応

```css
@media (prefers-contrast: high) {
  .button {
    border: 2px solid currentColor;
  }

  .link {
    text-decoration: underline;
  }

  .card {
    border: 1px solid var(--separator);
  }
}
```

---

## Reduce Motion

### 影響を受けるアニメーション

| タイプ           | 標準              | Reduce Motion時  |
| ---------------- | ----------------- | ---------------- |
| **ページ遷移**   | スライド          | クロスフェード   |
| **モーダル**     | スケール+フェード | フェードのみ     |
| **回転**         | 回転              | 静止または透明度 |
| **パララックス** | 視差効果          | 無効             |
| **自動再生**     | 再生              | 停止             |
| **スプリング**   | バウンス          | リニア           |

### 実装

```css
/* Reduce Motion対応 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .parallax {
    transform: none !important;
  }

  .auto-play-video {
    /* 自動再生を停止 */
  }
}
```

### 代替アプローチ

```
標準: スライドインアニメーション
↓
Reduce Motion: 即時表示またはフェード

標準: スプリングバウンス
↓
Reduce Motion: シンプルなイージング
```

---

## フォーカス管理

### フォーカス順序

1. **論理的な順序**
   - 上から下、左から右（LTR）
   - 視覚的順序と一致

2. **フォーカス可能要素**
   - ボタン
   - リンク
   - 入力フィールド
   - カスタムコントロール

3. **フォーカストラップ**
   - モーダル内でフォーカスを制限
   - Escapeで解除

### フォーカスインジケーター

```css
/* 標準フォーカスリング */
:focus-visible {
  outline: 3px solid var(--system-blue);
  outline-offset: 2px;
}

/* カスタムフォーカス */
.custom-focus:focus-visible {
  box-shadow: 0 0 0 3px var(--system-blue);
  outline: none;
}

/* 高コントラスト */
@media (prefers-contrast: high) {
  :focus-visible {
    outline-width: 4px;
    outline-color: currentColor;
  }
}
```

### モーダルフォーカス

```
モーダル表示時:
1. フォーカスをモーダル内最初の要素に移動
2. フォーカスをモーダル内に制限
3. 閉じる時、元のトリガー要素に戻す
```

---

## スクリーンリーダーナビゲーション

### ランドマーク

| ロール            | HTML                     | 用途             |
| ----------------- | ------------------------ | ---------------- |
| **banner**        | `<header>`               | ヘッダー         |
| **navigation**    | `<nav>`                  | ナビゲーション   |
| **main**          | `<main>`                 | メインコンテンツ |
| **complementary** | `<aside>`                | 補足コンテンツ   |
| **contentinfo**   | `<footer>`               | フッター         |
| **search**        | role="search"            | 検索             |
| **form**          | `<form>`                 | フォーム         |
| **region**        | aria-label付きセクション | カスタム領域     |

### 見出し構造

```html
<h1>ページタイトル</h1>
<h2>セクション1</h2>
<h3>サブセクション</h3>
<h2>セクション2</h2>
<h3>サブセクション</h3>
<h4>詳細</h4>
```

**ルール**:

- h1は1ページに1つ
- レベルをスキップしない
- 装飾目的で使用しない

### ライブリージョン

```html
<!-- 重要な更新 -->
<div aria-live="assertive" aria-atomic="true">エラーメッセージ</div>

<!-- 控えめな更新 -->
<div aria-live="polite">通知メッセージ</div>

<!-- 頻繁な更新 -->
<div aria-live="off" aria-relevant="additions">チャットメッセージ</div>
```

---

## 入力アクセシビリティ

### フォームラベル

```html
<!-- 明示的ラベル -->
<label for="email">メールアドレス</label>
<input id="email" type="email" />

<!-- グループラベル -->
<fieldset>
  <legend>配送方法</legend>
  <input type="radio" id="standard" name="shipping" />
  <label for="standard">標準配送</label>
  <input type="radio" id="express" name="shipping" />
  <label for="express">速達配送</label>
</fieldset>
```

### エラーメッセージ

```html
<label for="password">パスワード</label>
<input
  id="password"
  type="password"
  aria-describedby="password-error"
  aria-invalid="true"
/>
<p id="password-error" role="alert">パスワードは8文字以上必要です</p>
```

### 必須フィールド

```html
<label for="name">
  名前
  <span aria-hidden="true">*</span>
</label>
<input id="name" type="text" aria-required="true" />
```

---

## 画像＆メディア

### 画像の代替テキスト

| 画像タイプ           | alt属性          |
| -------------------- | ---------------- |
| **情報を伝える**     | 内容を説明       |
| **装飾的**           | alt="" （空）    |
| **機能的（ボタン）** | アクションを説明 |
| **複雑（グラフ）**   | 要約 + 詳細説明  |

```html
<!-- 情報を伝える画像 -->
<img src="chart.png" alt="2023年売上: 前年比20%増" />

<!-- 装飾的画像 -->
<img src="decoration.png" alt="" />

<!-- 機能的画像 -->
<button>
  <img src="search.svg" alt="検索" />
</button>

<!-- 複雑な画像 -->
<figure>
  <img src="data-chart.png" alt="四半期売上推移" />
  <figcaption>Q1: 100万, Q2: 120万, Q3: 150万, Q4: 180万</figcaption>
</figure>
```

### ビデオアクセシビリティ

| 要素                 | 用途               |
| -------------------- | ------------------ |
| **キャプション**     | 聴覚障害者向け字幕 |
| **音声解説**         | 視覚障害者向け説明 |
| **トランスクリプト** | 全内容のテキスト版 |
| **再生コントロール** | キーボード操作可能 |

---

## テスト方法

### 自動テスト

| ツール         | 用途                         |
| -------------- | ---------------------------- |
| **axe-core**   | 自動アクセシビリティチェック |
| **WAVE**       | ブラウザ拡張                 |
| **Lighthouse** | 総合監査                     |
| **jest-axe**   | ユニットテスト統合           |

### 手動テスト

1. **キーボードナビゲーション**
   - Tabで全要素に到達可能
   - フォーカス順序が論理的
   - フォーカスインジケーターが見える

2. **スクリーンリーダー**
   - VoiceOver（iOS/macOS）
   - TalkBack（Android）
   - NVDA/JAWS（Windows）

3. **設定テスト**
   - Dynamic Type（最大サイズ）
   - Reduce Motion
   - 高コントラスト
   - ダークモード

### チェックリスト

- [ ] 全画像に適切なalt属性
- [ ] フォームラベルの関連付け
- [ ] カラーコントラスト4.5:1以上
- [ ] キーボード操作可能
- [ ] フォーカス順序が論理的
- [ ] 見出し構造が適切
- [ ] エラーメッセージが明確
- [ ] Dynamic Type対応
- [ ] Reduce Motion対応
- [ ] VoiceOverで操作可能

---

## 参考文献

- Apple Human Interface Guidelines - Accessibility
- WCAG 2.1 Guidelines
- Apple Accessibility Programming Guide
- WWDC 2023: Build accessible apps with SwiftUI
