# テーマ・スタイルガイドライン

**責務**: カラーパレット・CSS変数・共通スタイル・アニメーション速度・**16:9アスペクト比**

---

## 0. 16:9アスペクト比（必須制約）

### 重要原則

**すべてのスライドは16:9アスペクト比を厳守すること。**

これにより以下を保証する：
- プロジェクター/ディスプレイでの正しい表示
- PDF出力時の一貫したレイアウト
- 異なるウィンドウサイズでも崩れないデザイン

### CSS変数定義

```css
:root {
  /* 16:9アスペクト比 */
  --slide-aspect-ratio: 16 / 9;

  /* ビューポートに収まる最大サイズを計算 */
  --slide-max-width: min(100vw, calc(100vh * (16 / 9)));
  --slide-max-height: min(100vh, calc(100vw * (9 / 16)));

  /* 基準解像度（設計基準） */
  --slide-base-width: 1920;
  --slide-base-height: 1080;
}
```

### スライドコンテナCSS

```css
/* スライダー全体: ビューポート全体を使用しつつ16:9を維持 */
.slider {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-dark);
}

/* スライドコンテナ: 16:9を強制 */
.slider__container {
  display: flex;
  width: var(--slide-max-width);
  height: var(--slide-max-height);
  aspect-ratio: 16 / 9;
}

/* 各スライド: 親コンテナに合わせて16:9を維持 */
.slider__item {
  min-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  aspect-ratio: 16 / 9;
}

/* スライドコンテンツ: 16:9内に収まるよう制約 */
.slider__content {
  width: 100%;
  max-width: min(1600px, 90%);
  max-height: 90%;
  visibility: hidden;
  overflow: hidden;
}
```

### 実装チェックリスト

| 項目 | 確認方法 |
|------|----------|
| aspect-ratio: 16/9 が設定されているか | .slider__containerと.slider__itemを確認 |
| ビューポート変更時も崩れないか | ブラウザをリサイズして確認 |
| コンテンツがはみ出していないか | 各スライドで視覚確認 |
| 上下左右に均等な余白があるか | 黒帯（レターボックス）が表示されるか確認 |

### よくある問題と対処

| 問題 | 原因 | 解決策 |
|------|------|--------|
| 縦長ウィンドウでスライドが切れる | height: 100%のみで制約なし | aspect-ratio: 16/9 を追加 |
| 横長ウィンドウで間延びする | width: 100vwで固定 | max-width: calc(100vh * 16/9) を使用 |
| コンテンツが枠外に出る | overflow設定なし | overflow: hidden を追加 |
| PDF出力でずれる | 印刷時のサイズ計算問題 | @media print で固定サイズ指定 |

---

## 1. Kanagawaカラーパレット

### 1.1 Wave（Dark）テーマ

#### メインカラー

| 変数名 | カラーコード | 用途 |
|--------|-------------|------|
| `--bg-dark` | #1F1F28 | 背景（メイン） |
| `--bg-dim` | #2A2A37 | 背景（サブ） |
| `--bg-card` | #363646 | カード背景 |
| `--fg` | #DCD7BA | テキスト（メイン） |
| `--fg-dim` | #727169 | テキスト（サブ） |

#### アクセントカラー

| 変数名 | カラーコード | 用途 |
|--------|-------------|------|
| `--wave-blue` | #7E9CD8 | メインアクセント・リンク |
| `--spring-violet` | #9CABCA | アクセント（紫） |
| `--sakura-pink` | #D27E99 | 警告・課題・Before |
| `--wave-aqua` | #7AA89F | 成功・解決策・After |
| `--autumn-yellow` | #DCA561 | 強調・数字 |

#### 補助カラー

| 変数名 | カラーコード | 用途 |
|--------|-------------|------|
| `--sumi-ink` | #363646 | ボーダー・区切り |
| `--fuji-gray` | #54546D | 補助色・ホバー |

### 1.2 Lotus（Light）テーマ

公式kanagawa.nvimのLotusテーマに基づくライトモード。

#### メインカラー

| 変数名 | カラーコード | Lotus名 | 用途 |
|--------|-------------|---------|------|
| `--bg-dark` | #f2ecbc | lotusWhite3 | 背景（メイン） |
| `--bg-dim` | #e5ddb0 | lotusWhite2 | 背景（サブ） |
| `--bg-card` | #dcd5ac | lotusWhite1 | カード背景 |
| `--fg` | #43436c | lotusInk2 | テキスト（メイン） |
| `--fg-dim` | #716e61 | lotusGray2 | テキスト（サブ） |

#### アクセントカラー

| 変数名 | カラーコード | Lotus名 | 用途 |
|--------|-------------|---------|------|
| `--wave-blue` | #4d699b | lotusBlue4 | メインアクセント・リンク |
| `--spring-violet` | #624c83 | lotusViolet4 | アクセント（紫） |
| `--sakura-pink` | #b35b79 | lotusPink | 警告・課題・Before |
| `--wave-aqua` | #597b75 | lotusAqua | 成功・解決策・After |
| `--autumn-yellow` | #de9800 | lotusYellow3 | 強調・数字 |

#### 補助カラー

| 変数名 | カラーコード | Lotus名 | 用途 |
|--------|-------------|---------|------|
| `--sumi-ink` | #d5cea3 | lotusWhite0 | ボーダー・区切り |
| `--fuji-gray` | #8a8980 | lotusGray3 | 補助色・ホバー |

#### Lotus追加カラー（拡張用）

| Lotus名 | カラーコード | 用途例 |
|---------|-------------|--------|
| lotusRed | #c84053 | エラー・警告 |
| lotusGreen | #6f894e | 成功・完了 |
| lotusOrange | #cc6d00 | 注意・オレンジアクセント |
| lotusBlue5 | #5d57a3 | 紫寄りの青 |

### 1.3 Lotus White（デフォルト推奨）

Lotusのアクセントカラーを維持しつつ、黄味のないニュートラルな白背景。
**プレゼンテーション用のデフォルトテーマとして推奨。**

#### メインカラー

| 変数名 | カラーコード | 用途 |
|--------|-------------|------|
| `--bg-dark` | #fafafa | 背景（ほぼ白） |
| `--bg-dim` | #f0f0f2 | 背景（薄いグレー） |
| `--bg-card` | #e8e8ec | カード背景 |
| `--fg` | #43436c | テキスト（メイン） |
| `--fg-dim` | #716e61 | テキスト（サブ） |

#### アクセントカラー（Lotusと共通）

| 変数名 | カラーコード | 用途 |
|--------|-------------|------|
| `--wave-blue` | #4d699b | メインアクセント・リンク |
| `--spring-violet` | #624c83 | アクセント（紫） |
| `--sakura-pink` | #b35b79 | 警告・課題・Before |
| `--wave-aqua` | #597b75 | 成功・解決策・After |
| `--autumn-yellow` | #de9800 | 強調・数字 |

#### 補助カラー

| 変数名 | カラーコード | 用途 |
|--------|-------------|------|
| `--sumi-ink` | #e0e0e4 | ボーダー・区切り |
| `--fuji-gray` | #8a8a90 | 補助色・ホバー |

---

## 2. カラー使用ガイド

### 意味に応じた色選択

| 意味 | 推奨カラー | CSS変数 |
|------|-----------|---------|
| 重要・メイン | 青 | `--wave-blue` |
| 課題・問題・Before | ピンク | `--sakura-pink` |
| 解決・成功・After | 青緑 | `--wave-aqua` |
| 強調・数字・警告 | 黄 | `--autumn-yellow` |
| 補足・サブ | 紫 | `--spring-violet` |
| 背景・カード | 暗灰 | `--bg-dim` |

### 比較スライドの色

```css
/* Before側（左） */
.compare-item.left {
  border-top: 4px solid var(--sakura-pink);
}
.compare-item.left .value {
  color: var(--sakura-pink);
}

/* After側（右） */
.compare-item.right {
  border-top: 4px solid var(--wave-aqua);
}
.compare-item.right .value {
  color: var(--wave-aqua);
}
```

---

## 3. CSS変数定義

### 3.1 Wave（Dark）完全な変数リスト

```css
:root {
  /* Wave（Dark）カラーパレット */
  --bg-dark: #1F1F28;
  --bg-dim: #2A2A37;
  --bg-card: #363646;
  --fg: #DCD7BA;
  --fg-dim: #727169;
  --wave-blue: #7E9CD8;
  --spring-violet: #9CABCA;
  --sakura-pink: #D27E99;
  --wave-aqua: #7AA89F;
  --autumn-yellow: #DCA561;
  --sumi-ink: #363646;
  --fuji-gray: #54546D;

  /* フォントサイズスケール */
  --font-scale: 1.3;

  /* 計算されたフォントサイズ */
  --fs-title: calc(5rem * var(--font-scale));
  --fs-subtitle: calc(2.5rem * var(--font-scale));
  --fs-heading: calc(3rem * var(--font-scale));
  --fs-subheading: calc(2rem * var(--font-scale));
  --fs-body: calc(1.5rem * var(--font-scale));
  --fs-body-lg: calc(1.8rem * var(--font-scale));
  --fs-small: calc(1.2rem * var(--font-scale));
  --fs-icon-lg: calc(6rem * var(--font-scale));
  --fs-icon-md: calc(3rem * var(--font-scale));
  --fs-icon-sm: calc(2rem * var(--font-scale));
}
```

### 3.2 Lotus（Light）完全な変数リスト

```css
:root {
  /* Kanagawa Lotus（公式Light）カラーパレット */
  --bg-dark: #f2ecbc;      /* lotusWhite3 */
  --bg-dim: #e5ddb0;       /* lotusWhite2 */
  --bg-card: #dcd5ac;      /* lotusWhite1 */
  --fg: #43436c;           /* lotusInk2 */
  --fg-dim: #716e61;       /* lotusGray2 */
  --wave-blue: #4d699b;    /* lotusBlue4 */
  --spring-violet: #624c83; /* lotusViolet4 */
  --sakura-pink: #b35b79;  /* lotusPink */
  --wave-aqua: #597b75;    /* lotusAqua */
  --autumn-yellow: #de9800; /* lotusYellow3 */
  --sumi-ink: #d5cea3;     /* lotusWhite0 */
  --fuji-gray: #8a8980;    /* lotusGray3 */

  /* フォントサイズスケール（共通） */
  --font-scale: 1.3;

  /* 計算されたフォントサイズ（共通） */
  --fs-title: calc(5rem * var(--font-scale));
  --fs-subtitle: calc(2.5rem * var(--font-scale));
  --fs-heading: calc(3rem * var(--font-scale));
  --fs-subheading: calc(2rem * var(--font-scale));
  --fs-body: calc(1.5rem * var(--font-scale));
  --fs-body-lg: calc(1.8rem * var(--font-scale));
  --fs-small: calc(1.2rem * var(--font-scale));
  --fs-icon-lg: calc(6rem * var(--font-scale));
  --fs-icon-md: calc(3rem * var(--font-scale));
  --fs-icon-sm: calc(2rem * var(--font-scale));
}
```

### 3.3 Lotus White（デフォルト推奨）完全な変数リスト

```css
:root {
  /* Kanagawa Lotus White - 白背景カスタム版（デフォルト） */
  --bg-dark: #fafafa;      /* ほぼ白（ニュートラル） */
  --bg-dim: #f0f0f2;       /* 薄いグレー（青み） */
  --bg-card: #e8e8ec;      /* カード背景（青み） */
  --fg: #43436c;           /* lotusInk2 */
  --fg-dim: #716e61;       /* lotusGray2 */
  --wave-blue: #4d699b;    /* lotusBlue4 */
  --spring-violet: #624c83; /* lotusViolet4 */
  --sakura-pink: #b35b79;  /* lotusPink */
  --wave-aqua: #597b75;    /* lotusAqua */
  --autumn-yellow: #de9800; /* lotusYellow3 */
  --sumi-ink: #e0e0e4;     /* ニュートラルグレー */
  --fuji-gray: #8a8a90;    /* ニュートラルグレー */

  /* フォントサイズスケール（共通） */
  --font-scale: 1.3;

  /* 計算されたフォントサイズ（共通） */
  --fs-title: calc(5rem * var(--font-scale));
  --fs-subtitle: calc(2.5rem * var(--font-scale));
  --fs-heading: calc(3rem * var(--font-scale));
  --fs-subheading: calc(2rem * var(--font-scale));
  --fs-body: calc(1.5rem * var(--font-scale));
  --fs-body-lg: calc(1.8rem * var(--font-scale));
  --fs-small: calc(1.2rem * var(--font-scale));
  --fs-icon-lg: calc(6rem * var(--font-scale));
  --fs-icon-md: calc(3rem * var(--font-scale));
  --fs-icon-sm: calc(2rem * var(--font-scale));
}
```

**重要**: `--font-scale`の値を変更するだけで全体のサイズを調整できる。

---

## 4. フォントサイズ一覧

| 用途 | CSS変数 | 基準値 |
|------|---------|--------|
| タイトル | `var(--fs-title)` | 5rem × scale |
| サブタイトル | `var(--fs-subtitle)` | 2.5rem × scale |
| 見出し | `var(--fs-heading)` | 3rem × scale |
| 小見出し | `var(--fs-subheading)` | 2rem × scale |
| 本文 | `var(--fs-body)` | 1.5rem × scale |
| 大きめ本文 | `var(--fs-body-lg)` | 1.8rem × scale |
| 小さめ文字 | `var(--fs-small)` | 1.2rem × scale |

---

## 5. 共通CSS

### リセット・基本設定

```css
*, *:after, *:before {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  height: 100%;
  font-family: 'Noto Sans JP', sans-serif;
  background: var(--bg-dark);
  color: var(--fg);
  overflow: hidden;
}
```

### スライダー基本

```css
.slider {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slider__container {
  display: flex;
  height: 100%;
  transition: none;
}

.slider__item {
  min-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.slider__content {
  width: 100%;
  max-width: 1200px;
  visibility: hidden;
}
```

---

## 6. アイコンスタイル

### アイコンラッパー

```css
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-dim);
  margin-bottom: 1rem;
}

.icon-wrapper i {
  font-size: 2.5rem;
  color: var(--wave-blue);
}

/* アクセントカラー */
.icon-wrapper.accent-pink i { color: var(--sakura-pink); }
.icon-wrapper.accent-aqua i { color: var(--wave-aqua); }
.icon-wrapper.accent-yellow i { color: var(--autumn-yellow); }
.icon-wrapper.accent-violet i { color: var(--spring-violet); }
```

---

## 7. 進捗バー

```css
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--sumi-ink);
  z-index: 100;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, var(--wave-blue), var(--sakura-pink));
  transition: width 0.5s ease;
}
```

---

## 7.5. アジェンダインジケーター（デフォルト機能）

左上に固定表示され、現在のセクションをハイライト。クリックで該当スライドにジャンプ。

```css
.agenda-indicator {
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  z-index: 100;
  background: var(--bg-dim);
  padding: 0.8rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  border: 1px solid var(--fuji-gray);
}

.agenda-indicator-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--fg-dim);
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.agenda-indicator-item:hover {
  background: var(--bg-card);
  color: var(--fg);
}

.agenda-indicator-item.active {
  color: var(--wave-blue);
  font-weight: 600;
  background: rgba(126, 156, 216, 0.15);
}

.agenda-indicator-item .agenda-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fuji-gray);
}

.agenda-indicator-item.active .agenda-dot {
  background: var(--wave-blue);
}
```

### HTML構造

```html
<div class="agenda-indicator" id="agendaIndicator">
  <a class="agenda-indicator-item" data-section="intro" data-slide="0">
    <span class="agenda-dot"></span>
    <span class="agenda-label">イントロ</span>
  </a>
  <a class="agenda-indicator-item" data-section="problem" data-slide="3">
    <span class="agenda-dot"></span>
    <span class="agenda-label">課題</span>
  </a>
  <!-- セクションごとに追加 -->
</div>
```

### JavaScript（セクション定義）

```javascript
const sections = [
  { id: 'intro', start: 0, end: 2 },
  { id: 'problem', start: 3, end: 4 },
  { id: 'solution', start: 5, end: 7 },
  { id: 'conclusion', start: 8, end: 11 }
];
```

---

## 8. ナビゲーション

```css
.slider-navigation {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 100;
}

.slider-navigation li {
  list-style: none;
}

.slider-navigation a {
  display: block;
  width: 12px;
  height: 12px;
  border: 2px solid var(--fg);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.slider-navigation a.is-active {
  background: var(--wave-blue);
  border-color: var(--wave-blue);
}
```

---

## 9. コントロール

```css
.slider-controls {
  position: fixed;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 100;
  pointer-events: none;
}

.slider-controls button {
  width: 50px;
  height: 50px;
  background: var(--bg-dim);
  border: 2px solid var(--fuji-gray);
  border-radius: 50%;
  color: var(--fg);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.slider-controls button:hover {
  background: var(--wave-blue);
  border-color: var(--wave-blue);
}
```

---

## 10. アニメーション速度ガイドライン

### 基本原則

GSAPアニメーションは**高速・スムーズ**を基本とする。

### スライド遷移

```javascript
// メインスライド遷移（左右移動）
duration: 0.25
ease: 'power3.inOut'

// enterアニメーション開始タイミング
'-=0.15'  // 遷移と並行して開始
```

### 要素アニメーション推奨値

| 要素タイプ | duration | stagger | 備考 |
|-----------|----------|---------|------|
| タイトル | 0.25-0.3s | - | アイコンは0.3-0.4s |
| リストアイテム | 0.2s | 0.05s | 要素が多い場合はstaggerを短く |
| カード・パネル | 0.3s | 0.08s | 同時出現は同一duration |
| フェードイン | 0.2s | 0.03-0.05s | leave時はさらに短く |

### leaveアニメーション

退場アニメーションは入場より**短く**設定：

```javascript
leave: {
  duration: 0.15-0.2s,
  stagger: 0.03-0.05s
}
```

### NG例

```javascript
// 遅すぎる（ユーザーがストレスを感じる）
duration: 0.6  // NG
stagger: 0.15  // NG（要素が多いと遅い）

// 推奨
duration: 0.25-0.3
stagger: 0.05-0.08
```

---

## 11. ユーティリティクラス

### テキスト関連

| クラス | 用途 |
|--------|------|
| `.text-note` | 注釈・補足テキスト（グレー） |
| `.text-emphasis` | 強調テキスト |
| `.highlight` | ハイライト（黄色） |

### 実装例

```css
.text-note {
  font-size: var(--fs-small);
  color: var(--fg-dim);
}

.text-emphasis {
  font-weight: 700;
  color: var(--wave-blue);
}

.highlight {
  background: var(--autumn-yellow);
  color: var(--bg-dark);
  padding: 0.2em 0.4em;
  border-radius: 4px;
}
```

---

## 12. 完成チェックリスト

- [ ] カラーは意味に沿っているか
- [ ] フォントサイズはCSS変数を使用しているか
- [ ] アニメーション速度は適切か（高速・スムーズ）
- [ ] leaveアニメーションはenterより短いか
- [ ] 進捗バー・ナビゲーションは表示されているか
