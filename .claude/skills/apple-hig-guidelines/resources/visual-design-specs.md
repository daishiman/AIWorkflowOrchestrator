# HIG ビジュアルデザイン仕様

## 角丸（Corner Radius）

### iOS/iPadOS 標準角丸値

| コンポーネント | 角丸値 | 備考 |
|--------------|--------|------|
| **アプリアイコン** | 連続曲線（Squircle） | iOS独自の曲線、CSSでは近似 |
| **カード/コンテナ** | 12-16pt | 標準的なカード |
| **ボタン（大）** | 12pt | フルワイドボタン |
| **ボタン（中）** | 10pt | 標準ボタン |
| **ボタン（小）** | 8pt | コンパクトボタン |
| **テキストフィールド** | 10pt | 入力フィールド |
| **チップ/タグ** | 完全円形（高さ/2） | Capsule形状 |
| **アラート/シート** | 14pt | モーダル系 |
| **通知バナー** | 20pt | システム通知風 |
| **検索バー** | 10pt | 標準検索フィールド |
| **セグメントコントロール** | 8pt | 選択コントロール |

### Squircle（連続曲線）について

Appleの角丸は標準的な円弧ではなく「Squircle」と呼ばれる連続曲線:
- 数学的には `|x|^n + |y|^n = 1` (n≈4-5)
- 標準CSSの`border-radius`より滑らかな印象
- CSS近似: `border-radius: 22%` または SVGマスク使用

**実装方法**:
```css
/* 標準的な近似 */
.squircle {
  border-radius: 22%;
}

/* より正確な近似（mask使用） */
.squircle-accurate {
  mask-image: url('squircle-mask.svg');
}
```

---

## シャドウ（Shadows）

### iOS標準シャドウ

| レベル | オフセット | ブラー | スプレッド | 透明度 | 用途 |
|-------|----------|--------|----------|--------|------|
| **なし** | 0, 0 | 0 | 0 | 0% | フラットUI |
| **微細** | 0, 1pt | 3pt | 0 | 8% | ホバー状態 |
| **軽い** | 0, 2pt | 8pt | 0 | 12% | カード、リスト |
| **中程度** | 0, 4pt | 16pt | 0 | 16% | ポップオーバー |
| **強い** | 0, 8pt | 24pt | 0 | 20% | モーダル、シート |
| **最大** | 0, 12pt | 32pt | 0 | 24% | フローティング要素 |

### シャドウカラー

| モード | カラー | 備考 |
|-------|--------|------|
| **ライト** | `rgba(0, 0, 0, opacity)` | 黒ベース |
| **ダーク** | `rgba(0, 0, 0, opacity * 1.5)` | より強い影 |
| **カラー影** | 背景色の暗い変種 | 自然な印象 |

### CSS実装例

```css
/* ライトモード */
.shadow-light {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* ダークモード */
.shadow-dark {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

/* モーダル用 */
.shadow-modal {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

---

## スペーシングシステム

### 基本グリッド: 4ptベース

| 名称 | 値 | 用途 |
|-----|-----|------|
| **xxs** | 2pt | 最小間隔、アイコン内 |
| **xs** | 4pt | コンパクト要素間 |
| **sm** | 8pt | 関連要素間 |
| **md** | 12pt | セクション内要素 |
| **base** | 16pt | 標準間隔 |
| **lg** | 20pt | セクション間 |
| **xl** | 24pt | 大きな区切り |
| **2xl** | 32pt | メジャーセクション |
| **3xl** | 40pt | ページレベル |
| **4xl** | 48pt | 最大間隔 |

### コンポーネント内スペーシング

| コンポーネント | パディング | 備考 |
|--------------|-----------|------|
| **ボタン（大）** | 16pt 水平, 14pt 垂直 | 44pt高さ維持 |
| **ボタン（中）** | 12pt 水平, 10pt 垂直 | 36pt高さ |
| **ボタン（小）** | 8pt 水平, 6pt 垂直 | 28pt高さ |
| **リストセル** | 16pt 水平, 12pt 垂直 | 標準44pt高さ |
| **カード** | 16pt 全方向 | コンテンツ領域 |
| **入力フィールド** | 12pt 水平, 10pt 垂直 | テキスト周囲 |
| **ナビゲーションバー** | 16pt 水平 | コンテンツエリア |

### セーフエリア

| エリア | 値 | 備考 |
|-------|-----|------|
| **上部（ノッチ付き）** | 47pt（iPhone 14 Pro） | 動的に変化 |
| **下部（ホームインジケーター）** | 34pt | iPhone X以降 |
| **左右** | 0pt（通常） | ノッチ横断時は考慮 |

---

## アニメーション＆トランジション

### 標準イージング

| 名称 | 値 | 用途 |
|-----|-----|------|
| **easeInOut** | `cubic-bezier(0.42, 0, 0.58, 1)` | 一般的なトランジション |
| **easeOut** | `cubic-bezier(0, 0, 0.58, 1)` | 要素の出現 |
| **easeIn** | `cubic-bezier(0.42, 0, 1, 1)` | 要素の退出 |
| **spring** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | バウンス効果 |
| **linear** | `linear` | 進捗インジケーター |

### 標準デュレーション

| 名称 | 値 | 用途 |
|-----|-----|------|
| **instant** | 0ms | 即時変化 |
| **fast** | 100ms | マイクロインタラクション |
| **normal** | 200ms | 標準トランジション |
| **slow** | 300ms | ページ遷移、モーダル |
| **slower** | 400ms | 複雑なアニメーション |
| **slowest** | 500ms | 大きな要素の移動 |

### アニメーションパターン

**フェード**:
```css
.fade-in {
  animation: fadeIn 200ms ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**スライド（シート）**:
```css
.slide-up {
  animation: slideUp 300ms ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

**スケール（ポップ）**:
```css
.pop-in {
  animation: popIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### Reduce Motion対応

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## マテリアル＆エフェクト

### ブラー効果（Vibrancy）

| 名称 | ブラー値 | 用途 |
|-----|---------|------|
| **ultraThin** | 10pt | 軽微な背景ぼかし |
| **thin** | 20pt | 軽いぼかし |
| **regular** | 40pt | 標準（ナビバー等） |
| **thick** | 60pt | 強いぼかし |
| **chromeMaterial** | 80pt | ツールバー背景 |

### CSS実装

```css
/* 標準ブラー */
.blur-regular {
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}

/* ナビゲーションバー風 */
.navbar-blur {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

/* ダークモード */
.navbar-blur-dark {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: saturate(180%) blur(20px);
}
```

### グラデーション

| タイプ | 用途 | 例 |
|-------|------|-----|
| **リニア** | 背景、オーバーレイ | 上から下へのフェード |
| **ラジアル** | スポットライト効果 | 中央から外周へ |
| **コニック** | ゲージ、進捗 | 円形プログレス |

---

## アイコンシステム（SF Symbols）

### サイズガイドライン

| コンテキスト | サイズ | ウェイト |
|-------------|-------|---------|
| **ナビゲーション** | 22-28pt | Regular |
| **タブバー** | 25pt | Regular/Medium |
| **リストアクセサリ** | 17pt | Regular |
| **ボタン内** | テキストと同等 | テキストに合わせる |
| **インライン** | 13-15pt | Regular |
| **大きなシンボル** | 32-48pt | Light/Ultralight |

### シンボルウェイト

| ウェイト | 用途 |
|---------|------|
| **Ultralight** | 大きな装飾的シンボル |
| **Thin** | 軽量UI |
| **Light** | 控えめなアイコン |
| **Regular** | 標準（デフォルト） |
| **Medium** | やや強調 |
| **Semibold** | 重要なアクション |
| **Bold** | 強い強調 |
| **Heavy** | 最大強調 |
| **Black** | 装飾的用途 |

### レンダリングモード

| モード | 説明 | 用途 |
|-------|------|------|
| **Monochrome** | 単色 | 標準UI |
| **Hierarchical** | 階層的不透明度 | 複雑なシンボル |
| **Palette** | 2-3色指定 | カラフルUI |
| **Multicolor** | フルカラー | 絵文字的表現 |

---

## ボーダー＆セパレーター

### ボーダー

| タイプ | 幅 | カラー（ライト） | カラー（ダーク） |
|-------|-----|----------------|----------------|
| **標準** | 1pt (0.5pt Retina) | rgba(0,0,0,0.1) | rgba(255,255,255,0.1) |
| **強調** | 1pt | rgba(0,0,0,0.2) | rgba(255,255,255,0.2) |
| **フォーカス** | 2-3pt | System Blue | System Blue |

### セパレーター

| タイプ | 高さ | インセット | 用途 |
|-------|------|----------|------|
| **フル幅** | 0.5pt | 0 | セクション間 |
| **インセット** | 0.5pt | 16pt左 | リスト内 |
| **ダブルインセット** | 0.5pt | 16pt両側 | 特殊リスト |

---

## オーバーレイ＆モーダル

### オーバーレイ不透明度

| 用途 | 不透明度（ライト） | 不透明度（ダーク） |
|------|------------------|------------------|
| **軽いディム** | 20% | 30% |
| **標準ディム** | 40% | 50% |
| **強いディム** | 60% | 70% |
| **シート背景** | 30% | 40% |
| **アラート背景** | 50% | 60% |

### モーダルサイズ（iPad）

| タイプ | 幅 | 高さ | 用途 |
|-------|-----|------|------|
| **フォームシート** | 540pt | 自動 | フォーム入力 |
| **ページシート** | 画面幅-60pt | 自動 | 詳細表示 |
| **ポップオーバー** | 320pt | 自動 | コンテキストメニュー |

---

## 参考文献

- Apple Human Interface Guidelines - Visual Design
- Apple Human Interface Guidelines - Materials
- Apple Human Interface Guidelines - Motion
- SF Symbols 5 Documentation
- WWDC 2023: Design with SwiftUI
