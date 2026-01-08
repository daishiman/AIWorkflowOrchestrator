# スライドコンポーネント仕様

**責務**: 全23種のスライドタイプ・CSS・HTMLテンプレート・アニメーション

---

## 1. スライドタイプ一覧

### 基本スライド（7種）

| タイプ | クラス名 | 用途 |
|--------|---------|------|
| タイトル | `slide-title` | 表紙・セクション見出し |
| メッセージ | `slide-message` | 1メッセージを強調 |
| リスト | `slide-list` | 並列要素の列挙 |
| 比較 | `slide-compare` | Before/After・対比 |
| フロー | `slide-flow` | 横方向プロセス |
| タイムライン | `slide-timeline` | 時系列・履歴 |
| テーブル | `slide-table` | 詳細情報の表 |

### 拡張スライド（8種）

| タイプ | クラス名 | 用途 |
|--------|---------|------|
| ピラミッド | `slide-pyramid` | 階層構造・優先度 |
| サークル | `slide-circle` | 中心と周辺の関係 |
| グリッド | `slide-grid` | カード形式の一覧 |
| ハイライト | `slide-highlight` | 重要な数値/メッセージ |
| アイコングリッド | `slide-icon-grid` | アイコン主体の一覧 |
| プロセス | `slide-process` | 縦方向ステップ |
| 引用 | `slide-quote` | 引用文・権威付け |
| ヒーロー | `slide-hero` | インパクト見出し |

---

## 2. 基本スライド詳細

### 2.1 タイトルスライド

```css
.slide-title .slider__content {
  text-align: center;
}

.slide-title .main-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.slide-title .sub-title {
  font-size: 1.5rem;
  color: var(--fg-dim);
}

.slide-title .title-icon {
  font-size: 5rem;
  color: var(--wave-blue);
  margin-bottom: 2rem;
}
```

```html
<div class="slider__item slide-title">
  <div class="slider__content">
    <i class="title-icon fas {{アイコン}}"></i>
    <h1 class="main-title">{{タイトル}}</h1>
    <p class="sub-title">{{サブタイトル}}</p>
  </div>
</div>
```

### 2.2 メッセージスライド

```css
.slide-message .slider__content {
  text-align: center;
}

.slide-message .message-icon {
  margin: 0 auto 2rem;
}

.slide-message .main-message {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.3;
}

.slide-message .sub-message {
  font-size: 1.2rem;
  color: var(--fg-dim);
  margin-top: 1rem;
}
```

```html
<div class="slider__item slide-message">
  <div class="slider__content">
    <div class="icon-wrapper message-icon {{アクセントクラス}}">
      <i class="fas {{アイコン}}"></i>
    </div>
    <h2 class="main-message">{{メッセージ}}</h2>
    <p class="sub-message">{{補足}}</p>
  </div>
</div>
```

### 2.3 リストスライド

```css
.slide-list .slider__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.slide-list .list-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
}

.slide-list .list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.slide-list .list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-dim);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  min-width: 280px;
  border-left: 4px solid var(--wave-blue);
}

.slide-list .list-item i {
  font-size: 1.5rem;
  color: var(--wave-blue);
}

.slide-list .list-item span {
  font-size: 1.2rem;
}
```

```html
<div class="slider__item slide-list">
  <div class="slider__content">
    <h2 class="list-title">{{タイトル}}</h2>
    <div class="list-container">
      <div class="list-item">
        <i class="fas {{アイコン}}"></i>
        <span>{{テキスト}}</span>
      </div>
      <!-- 繰り返し -->
    </div>
  </div>
</div>
```

### 2.4 比較スライド

```css
.slide-compare .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slide-compare .compare-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
}

.slide-compare .compare-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: stretch;
}

.slide-compare .compare-item {
  flex: 1;
  max-width: 400px;
  background: var(--bg-dim);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
}

.slide-compare .compare-item.left {
  border-top: 4px solid var(--sakura-pink);
}

.slide-compare .compare-item.right {
  border-top: 4px solid var(--wave-aqua);
}

.slide-compare .compare-item h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.slide-compare .compare-item .value {
  font-size: 3rem;
  font-weight: 700;
}

.slide-compare .compare-item.left .value {
  color: var(--sakura-pink);
}

.slide-compare .compare-item.right .value {
  color: var(--wave-aqua);
}

.slide-compare .compare-vs {
  display: flex;
  align-items: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--autumn-yellow);
}
```

```html
<div class="slider__item slide-compare">
  <div class="slider__content">
    <h2 class="compare-title">{{タイトル}}</h2>
    <div class="compare-container">
      <div class="compare-item left">
        <i class="fas {{左アイコン}}"></i>
        <h3>{{左ラベル}}</h3>
        <div class="value">{{左値}}</div>
        <p>{{左説明}}</p>
      </div>
      <div class="compare-vs">VS</div>
      <div class="compare-item right">
        <i class="fas {{右アイコン}}"></i>
        <h3>{{右ラベル}}</h3>
        <div class="value">{{右値}}</div>
        <p>{{右説明}}</p>
      </div>
    </div>
  </div>
</div>
```

### 2.5 フロースライド

```css
.slide-flow .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slide-flow .flow-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
}

.slide-flow .flow-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.slide-flow .flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-dim);
  padding: 1.5rem;
  border-radius: 12px;
  min-width: 140px;
}

.slide-flow .flow-step .step-number {
  width: 40px;
  height: 40px;
  background: var(--wave-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.slide-flow .flow-step i {
  font-size: 2rem;
  color: var(--wave-aqua);
  margin: 0.5rem 0;
}

.slide-flow .flow-step span {
  font-size: 1rem;
  text-align: center;
}

.slide-flow .flow-arrow {
  font-size: 1.5rem;
  color: var(--autumn-yellow);
}
```

```html
<div class="slider__item slide-flow">
  <div class="slider__content">
    <h2 class="flow-title">{{タイトル}}</h2>
    <div class="flow-container">
      <div class="flow-step">
        <div class="step-number">{{番号}}</div>
        <i class="fas {{アイコン}}"></i>
        <span>{{テキスト}}</span>
      </div>
      <div class="flow-arrow"><i class="fas fa-arrow-right"></i></div>
      <!-- 繰り返し -->
    </div>
  </div>
</div>
```

### 2.6 タイムラインスライド

```css
.slide-timeline .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slide-timeline .timeline-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
}

.slide-timeline .timeline-container {
  position: relative;
  padding-left: 3rem;
}

.slide-timeline .timeline-line {
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--wave-blue);
  border-radius: 2px;
}

.slide-timeline .timeline-item {
  position: relative;
  padding: 1rem 0 1rem 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.slide-timeline .timeline-dot {
  position: absolute;
  left: -2.5rem;
  width: 20px;
  height: 20px;
  background: var(--wave-blue);
  border-radius: 50%;
  border: 4px solid var(--bg-dark);
}

.slide-timeline .timeline-content {
  background: var(--bg-dim);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  flex: 1;
}

.slide-timeline .timeline-content h4 {
  font-size: 1.2rem;
  color: var(--wave-blue);
  margin-bottom: 0.5rem;
}
```

```html
<div class="slider__item slide-timeline">
  <div class="slider__content">
    <h2 class="timeline-title">{{タイトル}}</h2>
    <div class="timeline-container">
      <div class="timeline-line"></div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h4>{{時期}}</h4>
          <p>{{内容}}</p>
        </div>
      </div>
      <!-- 繰り返し -->
    </div>
  </div>
</div>
```

### 2.7 テーブルスライド

```css
.slide-table .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slide-table .table-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
}

.slide-table table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-dim);
  border-radius: 12px;
  overflow: hidden;
}

.slide-table th {
  background: var(--sumi-ink);
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--wave-blue);
  border-bottom: 2px solid var(--fuji-gray);
}

.slide-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--fuji-gray);
}

.slide-table tr:last-child td {
  border-bottom: none;
}

.slide-table .table-icon {
  color: var(--wave-aqua);
  margin-right: 0.5rem;
}
```

```html
<div class="slider__item slide-table">
  <div class="slider__content">
    <h2 class="table-title">{{タイトル}}</h2>
    <table>
      <thead>
        <tr>
          <th>{{ヘッダー}}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{セル}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## 3. 拡張スライド詳細

### 3.1 ピラミッドスライド

階層構造を視覚的に表現。上から下へ重要度/範囲が広がる。

```css
.slide-pyramid .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.slide-pyramid .pyramid-title {
  font-size: var(--fs-heading);
  font-weight: 700;
  text-align: center;
}

.slide-pyramid .pyramid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 800px;
}

.slide-pyramid .pyramid-level {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.slide-pyramid .pyramid-level:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* レベル別スタイル */
.slide-pyramid .pyramid-level-1 { width: 30%; background: var(--sakura-pink); color: var(--bg-dark); font-weight: 700; }
.slide-pyramid .pyramid-level-2 { width: 50%; background: var(--autumn-yellow); color: var(--bg-dark); }
.slide-pyramid .pyramid-level-3 { width: 70%; background: var(--wave-aqua); color: var(--bg-dark); }
.slide-pyramid .pyramid-level-4 { width: 90%; background: var(--wave-blue); color: var(--bg-dark); }
```

```html
<div class="slider__item slide-pyramid">
  <div class="slider__content">
    <h2 class="pyramid-title"><i class="fas {{アイコン}}"></i> {{タイトル}}</h2>
    <div class="pyramid-container">
      <div class="pyramid-level pyramid-level-1 has-tooltip" data-tooltip="{{説明1}}">
        <i class="fas {{アイコン1}}"></i>
        <span>{{テキスト1}}</span>
      </div>
      <!-- レベル2-4繰り返し -->
    </div>
  </div>
</div>
```

### 3.2 サークルスライド

中心から放射状に広がる構成。中心概念と周辺要素の関係を表現。

```css
.slide-circle .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.slide-circle .circle-title {
  font-size: var(--fs-heading);
  font-weight: 700;
  text-align: center;
}

.slide-circle .circle-container {
  position: relative;
  width: 500px;
  height: 500px;
}

.slide-circle .circle-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  background: var(--sakura-pink);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--bg-dark);
  font-weight: 700;
  z-index: 10;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.slide-circle .circle-center:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 0 40px rgba(210, 126, 153, 0.5);
}

.slide-circle .circle-item {
  position: absolute;
  width: 120px;
  height: 120px;
  background: var(--bg-dim);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 3px solid var(--wave-blue);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.slide-circle .circle-item:hover {
  transform: scale(1.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  border-color: var(--sakura-pink);
}

/* 位置（6要素の場合） */
.slide-circle .circle-item:nth-child(2) { top: 0; left: 50%; transform: translateX(-50%); }
.slide-circle .circle-item:nth-child(3) { top: 25%; right: 5%; }
.slide-circle .circle-item:nth-child(4) { bottom: 25%; right: 5%; }
.slide-circle .circle-item:nth-child(5) { bottom: 0; left: 50%; transform: translateX(-50%); }
.slide-circle .circle-item:nth-child(6) { bottom: 25%; left: 5%; }
.slide-circle .circle-item:nth-child(7) { top: 25%; left: 5%; }
```

```html
<div class="slider__item slide-circle">
  <div class="slider__content">
    <h2 class="circle-title"><i class="fas {{アイコン}}"></i> {{タイトル}}</h2>
    <div class="circle-container">
      <div class="circle-center has-tooltip" data-tooltip="{{中心説明}}">
        <i class="fas {{中心アイコン}}"></i>
        <span>{{中心テキスト}}</span>
      </div>
      <div class="circle-item has-tooltip" data-tooltip="{{説明1}}">
        <i class="fas {{アイコン1}}"></i>
        <span>{{テキスト1}}</span>
      </div>
      <!-- 周辺要素繰り返し -->
    </div>
  </div>
</div>
```

### 3.3 グリッドスライド

均等なグリッドレイアウトでカードを配置。

```css
.slide-grid .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slide-grid .grid-title {
  font-size: var(--fs-heading);
  font-weight: 700;
  text-align: center;
}

.slide-grid .grid-container {
  display: grid;
  gap: 1.5rem;
  justify-content: center;
}

/* グリッド列数バリエーション */
.slide-grid .grid-container.grid-2 { grid-template-columns: repeat(2, 280px); }
.slide-grid .grid-container.grid-3 { grid-template-columns: repeat(3, 250px); }
.slide-grid .grid-container.grid-4 { grid-template-columns: repeat(4, 200px); }

.slide-grid .grid-card {
  background: var(--bg-dim);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  border: 2px solid transparent;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.slide-grid .grid-card:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border-color: var(--wave-blue);
}

/* カラーバリエーション */
.slide-grid .grid-card.card-pink { border-top: 4px solid var(--sakura-pink); }
.slide-grid .grid-card.card-pink i { color: var(--sakura-pink); }
.slide-grid .grid-card.card-aqua { border-top: 4px solid var(--wave-aqua); }
.slide-grid .grid-card.card-aqua i { color: var(--wave-aqua); }
.slide-grid .grid-card.card-yellow { border-top: 4px solid var(--autumn-yellow); }
.slide-grid .grid-card.card-yellow i { color: var(--autumn-yellow); }
```

```html
<div class="slider__item slide-grid">
  <div class="slider__content">
    <h2 class="grid-title"><i class="fas {{アイコン}}"></i> {{タイトル}}</h2>
    <div class="grid-container grid-3">
      <div class="grid-card card-pink has-tooltip" data-tooltip="{{説明1}}">
        <i class="fas {{アイコン1}}"></i>
        <h3>{{見出し1}}</h3>
        <p>{{テキスト1}}</p>
      </div>
      <!-- 繰り返し -->
    </div>
  </div>
</div>
```

### 3.4 ハイライトスライド

1つの重要な情報を大きく強調表示。

```css
.slide-highlight .slider__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  text-align: center;
}

.slide-highlight .highlight-icon {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, var(--wave-blue), var(--sakura-pink));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.slide-highlight .highlight-icon:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 50px rgba(126, 156, 216, 0.5);
}

.slide-highlight .highlight-icon i {
  font-size: 4rem;
  color: var(--bg-dark);
}

.slide-highlight .highlight-value {
  font-size: calc(var(--fs-title) * 1.5);
  font-weight: 700;
  background: linear-gradient(135deg, var(--wave-blue), var(--sakura-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slide-highlight .highlight-label {
  font-size: var(--fs-subtitle);
  color: var(--fg-dim);
}

.slide-highlight .highlight-description {
  font-size: var(--fs-body);
  max-width: 600px;
  line-height: 1.6;
}
```

```html
<div class="slider__item slide-highlight">
  <div class="slider__content">
    <div class="highlight-icon has-tooltip" data-tooltip="{{アイコン説明}}">
      <i class="fas {{アイコン}}"></i>
    </div>
    <div class="highlight-value">{{大きな値}}</div>
    <div class="highlight-label">{{ラベル}}</div>
    <p class="highlight-description">{{説明文}}</p>
  </div>
</div>
```

### 3.5 アイコングリッドスライド

アイコンを主体にしたシンプルなグリッド表示。

```css
.slide-icon-grid .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slide-icon-grid .icon-grid-title {
  font-size: var(--fs-heading);
  font-weight: 700;
  text-align: center;
}

.slide-icon-grid .icon-grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.slide-icon-grid .icon-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--bg-dim);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.slide-icon-grid .icon-grid-item:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.slide-icon-grid .icon-grid-item i {
  font-size: 2.5rem;
  color: var(--wave-blue);
  transition: transform 0.3s ease, color 0.3s ease;
}

.slide-icon-grid .icon-grid-item:hover i {
  transform: scale(1.2);
  color: var(--sakura-pink);
}
```

```html
<div class="slider__item slide-icon-grid">
  <div class="slider__content">
    <h2 class="icon-grid-title"><i class="fas {{アイコン}}"></i> {{タイトル}}</h2>
    <div class="icon-grid-container">
      <div class="icon-grid-item has-tooltip" data-tooltip="{{説明1}}">
        <i class="fas {{アイコン1}}"></i>
        <span>{{テキスト1}}</span>
      </div>
      <!-- 繰り返し -->
    </div>
  </div>
</div>
```

### 3.6 プロセススライド（縦）

縦方向のプロセス/ステップ表示。

```css
.slide-process .slider__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slide-process .process-title {
  font-size: var(--fs-heading);
  font-weight: 700;
  text-align: center;
}

.slide-process .process-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  max-width: 600px;
  margin: 0 auto;
}

.slide-process .process-step {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  padding: 1.5rem;
  background: var(--bg-dim);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.slide-process .process-step:hover {
  transform: scale(1.03) translateX(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.slide-process .process-number {
  width: 50px;
  height: 50px;
  background: var(--wave-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.slide-process .process-arrow {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  color: var(--autumn-yellow);
  font-size: 1.5rem;
}
```

```html
<div class="slider__item slide-process">
  <div class="slider__content">
    <h2 class="process-title"><i class="fas {{アイコン}}"></i> {{タイトル}}</h2>
    <div class="process-container">
      <div class="process-step has-tooltip" data-tooltip="{{説明1}}">
        <div class="process-number">1</div>
        <div class="process-content">
          <h4><i class="fas {{アイコン1}}"></i> {{見出し1}}</h4>
          <p>{{テキスト1}}</p>
        </div>
      </div>
      <div class="process-arrow"><i class="fas fa-arrow-down"></i></div>
      <!-- 繰り返し -->
    </div>
  </div>
</div>
```

### 3.7 引用スライド

印象的な引用文を大きく表示。

```css
.slide-quote .slider__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 2rem;
}

.slide-quote .quote-mark {
  font-size: 6rem;
  color: var(--wave-blue);
  opacity: 0.3;
  line-height: 1;
}

.slide-quote .quote-text {
  font-size: var(--fs-subtitle);
  font-style: italic;
  max-width: 800px;
  line-height: 1.6;
}

.slide-quote .quote-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.slide-quote .quote-author-avatar {
  width: 60px;
  height: 60px;
  background: var(--bg-dim);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-quote .quote-author-avatar i {
  font-size: 1.5rem;
  color: var(--wave-aqua);
}

.slide-quote .quote-author-name {
  font-size: var(--fs-body-lg);
  font-weight: 700;
}

.slide-quote .quote-author-title {
  font-size: var(--fs-small);
  color: var(--fg-dim);
}
```

```html
<div class="slider__item slide-quote">
  <div class="slider__content">
    <div class="quote-mark">"</div>
    <p class="quote-text">{{引用文}}</p>
    <div class="quote-author">
      <div class="quote-author-avatar">
        <i class="fas {{著者アイコン}}"></i>
      </div>
      <div class="quote-author-info">
        <div class="quote-author-name">{{著者名}}</div>
        <div class="quote-author-title">{{著者肩書}}</div>
      </div>
    </div>
  </div>
</div>
```

### 3.8 ヒーロースライド

大きな背景/グラデーションと重ねてテキストを表示。

```css
.slide-hero {
  position: relative;
}

.slide-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(31, 31, 40, 0.9), rgba(42, 42, 55, 0.8));
  z-index: 1;
}

.slide-hero .slider__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 2rem;
}

.slide-hero .hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--wave-blue);
  color: var(--bg-dark);
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: var(--fs-small);
}

.slide-hero .hero-title {
  font-size: calc(var(--fs-title) * 1.2);
  font-weight: 700;
  background: linear-gradient(135deg, var(--fg), var(--wave-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slide-hero .hero-subtitle {
  font-size: var(--fs-subtitle);
  color: var(--fg-dim);
  max-width: 600px;
}

.slide-hero .hero-cta {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.slide-hero .hero-button {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: var(--fs-body);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  cursor: pointer;
}

.slide-hero .hero-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.slide-hero .hero-button-primary {
  background: var(--sakura-pink);
  color: var(--bg-dark);
}

.slide-hero .hero-button-secondary {
  background: transparent;
  border: 2px solid var(--fg);
  color: var(--fg);
}
```

```html
<div class="slider__item slide-hero">
  <div class="slider__content">
    <div class="hero-badge">
      <i class="fas {{バッジアイコン}}"></i>
      <span>{{バッジテキスト}}</span>
    </div>
    <h1 class="hero-title">{{タイトル}}</h1>
    <p class="hero-subtitle">{{サブタイトル}}</p>
    <div class="hero-cta">
      <button class="hero-button hero-button-primary">{{ボタン1}}</button>
      <button class="hero-button hero-button-secondary">{{ボタン2}}</button>
    </div>
  </div>
</div>
```

---

## 4. ホバーエフェクト

### 4.1 基本ホバークラス

```css
/* 基本ホバー - 拡大 + 影 */
.hoverable {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.hoverable:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 控えめホバー - 小さめの拡大 */
.hoverable-subtle {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hoverable-subtle:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 強調ホバー - ボーダーハイライト */
.hoverable-highlight {
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.hoverable-highlight:hover {
  transform: scale(1.03);
  border-color: var(--wave-blue);
  box-shadow: 0 0 20px rgba(126, 156, 216, 0.3);
}

/* グロー効果 */
.hoverable-glow {
  transition: transform 0.3s ease, filter 0.3s ease;
}

.hoverable-glow:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 15px var(--wave-blue));
}
```

### 4.2 カードホバー（スライドタイプ別）

```css
/* リストアイテムカード */
.slide-list .list-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-left-color 0.3s ease;
}

.slide-list .list-item:hover {
  transform: translateX(10px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-left-color: var(--sakura-pink);
}

/* 比較カード */
.slide-compare .compare-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.slide-compare .compare-item:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

/* フローステップ */
.slide-flow .flow-step {
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.slide-flow .flow-step:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: var(--bg-card);
}

/* タイムラインアイテム */
.slide-timeline .timeline-content {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.slide-timeline .timeline-content:hover {
  transform: translateX(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* 統計カード */
.slide-stats .stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.slide-stats .stat-card:hover {
  transform: translateY(-15px) scale(1.05);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

/* グリッドカード */
.slide-grid .grid-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.slide-grid .grid-card:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border-color: var(--wave-blue);
}
```

### 4.3 アイコンホバー

```css
/* アイコンラッパー */
.icon-wrapper {
  transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.icon-wrapper:hover {
  transform: scale(1.15) rotate(5deg);
  background: var(--wave-blue);
  box-shadow: 0 10px 30px rgba(126, 156, 216, 0.4);
}

.icon-wrapper:hover i {
  color: var(--bg-dark);
}

/* アイコン単体 */
.hoverable-icon {
  transition: transform 0.3s ease, color 0.3s ease, filter 0.3s ease;
}

.hoverable-icon:hover {
  transform: scale(1.2);
  color: var(--sakura-pink);
  filter: drop-shadow(0 0 10px currentColor);
}

/* 回転アイコン */
.hoverable-icon-spin:hover {
  transform: rotate(360deg);
  transition: transform 0.6s ease;
}

/* パルスアイコン */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.hoverable-icon-pulse:hover {
  animation: pulse 0.6s ease infinite;
}
```

### 4.4 統計値ホバー

```css
/* 大きな数値 */
.stat-value {
  transition: transform 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;
}

.stat-card:hover .stat-value {
  transform: scale(1.1);
  text-shadow: 0 0 30px currentColor;
}

/* 進捗バー付き統計 */
.stat-progress {
  height: 6px;
  background: var(--bg-dim);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.stat-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--wave-blue), var(--sakura-pink));
  transition: width 0.8s ease;
}

.stat-card:hover .stat-progress-bar {
  filter: brightness(1.2);
}
```

### 4.5 テーブル行ホバー

```css
/* テーブル行 */
.slide-table tbody tr {
  transition: background 0.2s ease, transform 0.2s ease;
}

.slide-table tbody tr:hover {
  background: var(--bg-card);
  transform: scale(1.01);
}

/* セルホバー */
.slide-table td {
  transition: color 0.2s ease;
}

.slide-table tbody tr:hover td {
  color: var(--wave-blue);
}

/* 強調行 */
.slide-table tr.highlight {
  background: var(--bg-card);
  border-left: 4px solid var(--sakura-pink);
}

.slide-table tr.highlight:hover {
  background: var(--sumi-ink);
}
```

### 4.6 ツールチップ

```css
/* ツールチップコンテナ */
.has-tooltip {
  position: relative;
  cursor: help;
}

/* ツールチップ本体 */
.has-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(5px);
  background: var(--sumi-ink);
  color: var(--fg);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  white-space: nowrap;
  max-width: 300px;
  white-space: normal;
  text-align: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 1000;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--fuji-gray);
  pointer-events: none;
}

/* ツールチップ矢印 */
.has-tooltip::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: var(--sumi-ink);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  z-index: 1001;
}

/* ホバー時に表示 */
.has-tooltip:hover::after,
.has-tooltip:hover::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* 下向きツールチップ */
.has-tooltip-bottom::after {
  bottom: auto;
  top: calc(100% + 10px);
  transform: translateX(-50%) translateY(-5px);
}

.has-tooltip-bottom::before {
  bottom: auto;
  top: calc(100% + 2px);
  border-top-color: transparent;
  border-bottom-color: var(--sumi-ink);
}

.has-tooltip-bottom:hover::after {
  transform: translateX(-50%) translateY(0);
}

/* カラーバリエーション */
.has-tooltip-blue::after {
  background: var(--wave-blue);
  border-color: var(--wave-blue);
}

.has-tooltip-pink::after {
  background: var(--sakura-pink);
  border-color: var(--sakura-pink);
}

.has-tooltip-yellow::after {
  background: var(--autumn-yellow);
  color: var(--bg-dark);
  border-color: var(--autumn-yellow);
}
```

### 4.7 使用ガイドライン

| 要素タイプ | 推奨クラス | 備考 |
|-----------|-----------|------|
| リストアイテム | `hoverable` | 左移動 + 拡大 |
| カード | `hoverable` + `has-tooltip` | 補足情報付き |
| フローステップ | `hoverable-highlight` | ボーダーハイライト |
| 統計カード | `hoverable` + `has-tooltip` | 詳細説明付き |
| アイコン | `hoverable-icon` | 拡大 + 色変化 |
| テーブル行 | 自動適用 | CSS定義済み |

**注意事項**:
1. 過度な使用を避ける - 全要素にホバーを付けると煩雑
2. 意味のある情報を - ツールチップには有用な補足情報を入れる
3. モバイル考慮 - タッチデバイスではホバーが機能しない
4. パフォーマンス - transform/opacityを使用し、レイアウト変更を避ける

---

## 5. TweenSliderクラス

```javascript
class TweenSlider {
  constructor(selector) {
    this.container = document.querySelector(selector + ' .slider__container');
    this.items = document.querySelectorAll(selector + ' .slider__item');
    this.index = 0;
    this.isAnimating = false;
    this.slideWidth = window.innerWidth;

    this.init();
  }

  init() {
    this.buildNavigation();
    this.bindEvents();
    this.makeActive(0);
    this.playEnterAnimation(0);
    this.updateProgress();
  }

  buildNavigation() {
    const nav = document.getElementById('navigation');
    this.items.forEach((_, i) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + i;
      a.dataset.index = i;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.move(i);
      });
      li.appendChild(a);
      nav.appendChild(li);
    });
  }

  bindEvents() {
    document.getElementById('next').addEventListener('click', () => this.moveToNext());
    document.getElementById('prev').addEventListener('click', () => this.moveToPrev();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        this.moveToNext();
      }
      if (e.key === 'ArrowLeft') this.moveToPrev();
    });

    window.addEventListener('resize', () => {
      this.slideWidth = window.innerWidth;
      gsap.set(this.container, { x: -this.index * this.slideWidth });
    });
  }

  makeActive(index) {
    const navItems = document.querySelectorAll('.slider-navigation a');
    this.items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
      navItems[i]?.classList.toggle('is-active', i === index);
    });
  }

  getSlideType(slide) {
    const classes = slide.className.split(' ');
    for (const cls of classes) {
      if (cls.startsWith('slide-') && cls !== 'slider__item') {
        return cls;
      }
    }
    return 'slide-message';
  }

  playEnterAnimation(index) {
    const slide = this.items[index];
    const content = slide.querySelector('.slider__content');
    const type = this.getSlideType(slide);

    if (animations[type] && animations[type].enter) {
      return animations[type].enter(content);
    } else {
      gsap.set(content, { visibility: 'visible' });
      return gsap.timeline();
    }
  }

  playLeaveAnimation(index) {
    const slide = this.items[index];
    const content = slide.querySelector('.slider__content');
    const type = this.getSlideType(slide);

    if (animations[type] && animations[type].leave) {
      return animations[type].leave(content);
    } else {
      return gsap.timeline();
    }
  }

  async move(index) {
    if (this.isAnimating || index === this.index || index < 0 || index >= this.items.length) {
      return;
    }

    this.isAnimating = true;

    const masterTl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
      }
    });

    masterTl.add(this.playLeaveAnimation(this.index));

    masterTl.to(this.container, {
      x: -index * this.slideWidth,
      duration: 0.6,
      ease: 'power3.inOut'
    }, '-=0.2');

    masterTl.add(this.playEnterAnimation(index), '-=0.3');

    this.index = index;
    this.makeActive(index);
    this.updateProgress();
  }

  moveToNext() {
    if (this.index < this.items.length - 1) {
      this.move(this.index + 1);
    }
  }

  moveToPrev() {
    if (this.index > 0) {
      this.move(this.index - 1);
    }
  }

  updateProgress() {
    const progress = ((this.index + 1) / this.items.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new TweenSlider('#slider');
});
```

---

## 6. アニメーション定義

すべてのスライドタイプのアニメーション定義は`animations`オブジェクトにまとめる。

各タイプに`enter`と`leave`関数を定義：

```javascript
const animations = {
  'slide-title': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-message': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-list': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-compare': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-flow': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-timeline': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-table': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-pyramid': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-circle': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-grid': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-highlight': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-icon-grid': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-process': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-quote': { enter: (content) => {...}, leave: (content) => {...} },
  'slide-hero': { enter: (content) => {...}, leave: (content) => {...} }
};
```

---

## 7. 完成チェックリスト

- [ ] スライドタイプは内容に適しているか
- [ ] ホバーエフェクトは適切に設定されているか
- [ ] ツールチップの内容は適切か
- [ ] アニメーションは滑らかか
- [ ] カラーはテーマに沿っているか
