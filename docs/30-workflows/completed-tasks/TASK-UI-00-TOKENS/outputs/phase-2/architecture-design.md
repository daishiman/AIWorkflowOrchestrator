# TASK-UI-00-TOKENS アーキテクチャ設計書

## メタ情報

| 項目     | 値                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| Phase    | 2（設計）                                                                                                   |
| タスクID | TASK-UI-00-TOKENS                                                                                           |
| タスク名 | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| 作成日   | 2026-02-22                                                                                                  |
| 前Phase  | Phase 1: 要件定義（phase-1-requirements.md）                                                                |

---

## 1. tokens.css ファイル構造設計（9セクション構成）

tokens.css は以下の9セクションで構成する。各セクションの責務と変更範囲を明確に分離する。

### セクション一覧

| #   | セクション名                       | スコープ                                   | 変更区分         | 責務                                                     |
| --- | ---------------------------------- | ------------------------------------------ | ---------------- | -------------------------------------------------------- |
| 1   | Primitive Colors                   | `:root`                                    | **変更なし**     | Slate, Blue, Green, Amber, Red, Sky, macOS System Colors |
| 2   | Semantic Colors (Default fallback) | `:root`                                    | **変更なし**     | kanagawa-dragon のフォールバック値                       |
| 3   | Spacing / Typography / Effects     | `:root`                                    | **変更なし**     | 8px Grid, フォント, 角丸, 影, トランジション             |
| 4   | マイクロインタラクション変数       | `:root`                                    | **新規追加**     | イージング・スケール変数（5個）                          |
| 5   | キーフレームアニメーション         | `@keyframes`                               | **新規追加**     | success-bounce, error-shake（2個）                       |
| 6   | Kanagawa Dragon Theme              | `:root` + `[data-theme="kanagawa-dragon"]` | **変更なし**     | kanagawa-dragon プリミティブ + セマンティック            |
| 7   | Light Theme                        | `[data-theme="light"]`                     | **全面書き換え** | Apple HIG System Colors (Light) 31変数                   |
| 8   | Dark Theme                         | `[data-theme="dark"]`                      | **新規定義**     | Apple HIG System Colors (Dark) 31変数                    |
| 9   | Theme Transition / Glass Utilities | `.theme-transition`, `.glass-panel`        | **変更なし**     | テーマ切替アニメーション、Glass Morphism                 |

### 挿入位置の詳細

```
:root {
  /* ===== 1. Primitive Colors ===== */           ← 既存維持（行1-59）
  /* ===== 2. Semantic Colors (Default) ===== */  ← 既存維持（行61-88）
  /* ===== 3. Spacing / Typography / Effects ===== */ ← 既存維持（行90-170）
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* ===== 4. Micro-Interaction Tokens ===== */   ← ★新規追加（Transitions直後）
  --ease-bounce: ...;
  --ease-anticipate: ...;
  --scale-hover: ...;
  --scale-active: ...;
  --scale-bounce: ...;
}

/* ===== 5. Keyframe Animations ===== */          ← ★新規追加（:root閉じ直後）
@keyframes success-bounce { ... }
@keyframes error-shake { ... }

/* ===== 6. Kanagawa Dragon Theme ===== */        ← 既存維持
:root { /* kanagawa primitives */ }
[data-theme="kanagawa-dragon"] { ... }

/* ===== 7. Light Theme ===== */                  ← ★全面書き換え
[data-theme="light"] { ... }

/* ===== 8. Dark Theme ===== */                   ← ★新規定義
[data-theme="dark"] { ... }

/* ===== 9. Theme Transition / Glass ===== */     ← 既存維持
```

---

## 2. テーマ切替方式

### `data-theme` 属性方式

```html
<html data-theme="kanagawa-dragon">
  <!-- デフォルト -->
  <html data-theme="light">
    <!-- Apple HIG Light -->
    <html data-theme="dark">
      <!-- Apple HIG Dark -->
    </html>
  </html>
</html>
```

### CSS セレクタ

```css
[data-theme="kanagawa-dragon"] {
  /* kanagawa-dragon テーマ変数 */
}
[data-theme="light"] {
  /* Apple HIG Light テーマ変数 */
}
[data-theme="dark"] {
  /* Apple HIG Dark テーマ変数 */
}
```

### 設計判断の根拠

| 方式                   | 採用 | 理由                                                                                  |
| ---------------------- | ---- | ------------------------------------------------------------------------------------- |
| `data-theme` 属性      | ✅   | ユーザーがOS設定と独立してテーマ選択可能。kanagawa-dragonはシステム設定と無関係に適用 |
| `prefers-color-scheme` | ❌   | OS設定に依存するため、3テーマの独立制御ができない                                     |
| CSS class 方式         | ❌   | 既存実装が `data-theme` を使用しているため、一貫性を維持                              |

### 型定義との対応

```typescript
// apps/desktop/src/renderer/store/types.ts
export type ResolvedTheme =
  | "kanagawa-dragon"
  | "kanagawa-wave"
  | "kanagawa-lotus"
  | "light"
  | "dark";
```

本タスクで対象とするテーマは `"kanagawa-dragon"` / `"light"` / `"dark"` の3種類。`"kanagawa-wave"` / `"kanagawa-lotus"` は本タスクのスコープ外。

---

## 3. CSS変数の3層構造（Primitive / Semantic / Component）

### 3層アーキテクチャ

```
┌─────────────────────────────────────────┐
│  Component Tokens（本タスク対象外）      │
│  --button-primary-bg, --card-shadow     │
│  → 各コンポーネントCSS内で定義          │
├─────────────────────────────────────────┤
│  Semantic Tokens（本タスクの主対象）     │  ← [data-theme="*"] セレクタ
│  --bg-primary, --text-secondary, etc.   │
│  → テーマごとに値が切り替わる           │
├─────────────────────────────────────────┤
│  Primitive Tokens（変更なし）            │  ← :root
│  --color-slate-900, --color-blue-600    │
│  → 全テーマ共通の基盤カラーパレット     │
└─────────────────────────────────────────┘
     ↑ 依存方向: 上位層 → 下位層（一方向）
```

### 層別詳細

| 層               | スコープ            | 命名規則                    | 例                                      | 本タスクでの変更       |
| ---------------- | ------------------- | --------------------------- | --------------------------------------- | ---------------------- |
| Primitive Tokens | `:root`             | `--color-{palette}-{shade}` | `--color-slate-900`, `--color-blue-600` | 変更なし               |
| Semantic Tokens  | `[data-theme="*"]`  | `--{category}-{variant}`    | `--bg-primary`, `--text-secondary`      | light全面書換/dark新規 |
| Component Tokens | コンポーネントCSS内 | `--{component}-{property}`  | `--button-primary-bg`                   | 対象外                 |

### 依存ルール

- Semantic Tokens は Primitive Tokens を `var()` で参照できる（kanagawa-dragon で使用中）
- Semantic Tokens は直接値（`#FFFFFF` 等）も使用できる（light/dark で使用）
- Component Tokens は Semantic Tokens を `var()` で参照する
- **逆方向の依存は禁止**: Primitive → Semantic への参照、Semantic → Component への参照は行わない

---

## 4. Light テーマの31変数マッピングテーブル（Apple HIG値）

### `[data-theme="light"]` セマンティック変数

```css
[data-theme="light"] {
  color-scheme: light;
```

#### Background（6変数）

| #   | セマンティック変数 | Apple HIG 名称            | CSS値                      | 備考              |
| --- | ------------------ | ------------------------- | -------------------------- | ----------------- |
| 1   | `--bg-primary`     | systemBackground          | `#FFFFFF`                  |                   |
| 2   | `--bg-secondary`   | secondarySystemBackground | `#F2F2F7`                  |                   |
| 3   | `--bg-tertiary`    | systemGray5               | `#E5E5EA`                  |                   |
| 4   | `--bg-elevated`    | elevated surface          | `#FFFFFF`                  | 影で分離を表現    |
| 5   | `--bg-glass`       | translucent secondary     | `rgba(242, 242, 247, 0.8)` | #F2F2F7 の80%透明 |
| 6   | `--bg-selection`   | systemBlue 15%            | `rgba(0, 122, 255, 0.15)`  | #007AFF の15%透明 |

#### Text（4変数）

| #   | セマンティック変数 | Apple HIG 名称 | CSS値                   | 備考                       |
| --- | ------------------ | -------------- | ----------------------- | -------------------------- |
| 7   | `--text-primary`   | label          | `#000000`               |                            |
| 8   | `--text-secondary` | secondaryLabel | `rgba(60, 60, 67, 0.6)` | 60%不透明                  |
| 9   | `--text-muted`     | tertiaryLabel  | `rgba(60, 60, 67, 0.3)` | 30%不透明。使用制限あり(※) |
| 10  | `--text-inverse`   | —              | `#FFFFFF`               | ダーク背景上のテキスト用   |

> ※ `--text-muted` は18px未満のテキストでWCAG 2.1 AA（4.5:1）を満たさない可能性がある。使用箇所で個別にコントラスト検証が必要。

#### Border（3変数）

| #   | セマンティック変数  | Apple HIG 名称  | CSS値                    | 備考      |
| --- | ------------------- | --------------- | ------------------------ | --------- |
| 11  | `--border-default`  | opaqueSeparator | `#C6C6C8`                |           |
| 12  | `--border-emphasis` | systemGray2     | `#AEAEB2`                |           |
| 13  | `--border-subtle`   | separator       | `rgba(60, 60, 67, 0.12)` | 12%不透明 |

#### Status（10変数）

| #   | セマンティック変数       | Apple HIG 名称 | CSS値     | 備考    |
| --- | ------------------------ | -------------- | --------- | ------- |
| 14  | `--status-primary`       | systemBlue     | `#007AFF` |         |
| 15  | `--status-primary-hover` | —              | `#0056B3` | 20%暗め |
| 16  | `--status-success`       | systemGreen    | `#34C759` |         |
| 17  | `--status-success-hover` | —              | `#28A745` | 20%暗め |
| 18  | `--status-warning`       | systemOrange   | `#FF9500` |         |
| 19  | `--status-warning-hover` | —              | `#CC7700` | 20%暗め |
| 20  | `--status-error`         | systemRed      | `#FF3B30` |         |
| 21  | `--status-error-hover`   | —              | `#CC2F26` | 20%暗め |
| 22  | `--status-info`          | systemIndigo   | `#5856D6` |         |
| 23  | `--status-info-hover`    | —              | `#4240A8` | 20%暗め |

#### Syntax Highlighting（8変数）

| #   | セマンティック変数  | Apple/Xcode 名称      | CSS値     | 備考      |
| --- | ------------------- | --------------------- | --------- | --------- |
| 24  | `--syntax-keyword`  | Xcode keyword purple  | `#9B2393` |           |
| 25  | `--syntax-function` | systemBlue            | `#007AFF` |           |
| 26  | `--syntax-string`   | Xcode string red      | `#C41A16` |           |
| 27  | `--syntax-number`   | Xcode number blue     | `#1C00CF` |           |
| 28  | `--syntax-constant` | Xcode constant purple | `#703DAA` |           |
| 29  | `--syntax-type`     | systemIndigo          | `#5856D6` |           |
| 30  | `--syntax-comment`  | systemGray            | `#8E8E93` |           |
| 31  | `--syntax-variable` | —                     | `#3900A0` | Xcode準拠 |

**合計: 31変数**

---

## 5. Dark テーマの31変数マッピングテーブル（Apple HIG値）

### `[data-theme="dark"]` セマンティック変数

```css
[data-theme="dark"] {
  color-scheme: dark;
```

#### Background（6変数）

| #   | セマンティック変数 | Apple HIG 名称            | CSS値                      | 備考                |
| --- | ------------------ | ------------------------- | -------------------------- | ------------------- |
| 1   | `--bg-primary`     | systemBackground          | `#000000`                  |                     |
| 2   | `--bg-secondary`   | secondarySystemBackground | `#1C1C1E`                  |                     |
| 3   | `--bg-tertiary`    | tertiarySystemBackground  | `#2C2C2E`                  |                     |
| 4   | `--bg-elevated`    | elevated surface          | `#1C1C1E`                  | Dark: secondary相当 |
| 5   | `--bg-glass`       | translucent secondary     | `rgba(28, 28, 30, 0.8)`    | #1C1C1E の80%透明   |
| 6   | `--bg-selection`   | systemBlue 25%            | `rgba(10, 132, 255, 0.25)` | #0A84FF の25%透明   |

#### Text（4変数）

| #   | セマンティック変数 | Apple HIG 名称 | CSS値                      | 備考                       |
| --- | ------------------ | -------------- | -------------------------- | -------------------------- |
| 7   | `--text-primary`   | label          | `#FFFFFF`                  |                            |
| 8   | `--text-secondary` | secondaryLabel | `rgba(235, 235, 245, 0.6)` | 60%不透明                  |
| 9   | `--text-muted`     | tertiaryLabel  | `rgba(235, 235, 245, 0.3)` | 30%不透明。使用制限あり(※) |
| 10  | `--text-inverse`   | —              | `#000000`                  | ライト背景上のテキスト用   |

> ※ Light テーマと同様、`--text-muted` は使用箇所でコントラスト比を個別検証する必要がある。

#### Border（3変数）

| #   | セマンティック変数  | Apple HIG 名称  | CSS値                    | 備考      |
| --- | ------------------- | --------------- | ------------------------ | --------- |
| 11  | `--border-default`  | opaqueSeparator | `#38383A`                |           |
| 12  | `--border-emphasis` | systemGray3     | `#48484A`                |           |
| 13  | `--border-subtle`   | separator       | `rgba(84, 84, 88, 0.36)` | 36%不透明 |

#### Status（10変数）

| #   | セマンティック変数       | Apple HIG 名称 | CSS値     | 備考           |
| --- | ------------------------ | -------------- | --------- | -------------- |
| 14  | `--status-primary`       | systemBlue     | `#0A84FF` |                |
| 15  | `--status-primary-hover` | —              | `#409CFF` | 明るめ(Dark用) |
| 16  | `--status-success`       | systemGreen    | `#30D158` |                |
| 17  | `--status-success-hover` | —              | `#5BD97D` | 明るめ(Dark用) |
| 18  | `--status-warning`       | systemOrange   | `#FF9F0A` |                |
| 19  | `--status-warning-hover` | —              | `#FFB840` | 明るめ(Dark用) |
| 20  | `--status-error`         | systemRed      | `#FF453A` |                |
| 21  | `--status-error-hover`   | —              | `#FF6961` | 明るめ(Dark用) |
| 22  | `--status-info`          | systemIndigo   | `#5E5CE6` |                |
| 23  | `--status-info-hover`    | —              | `#7A78EB` | 明るめ(Dark用) |

> **Light vs Dark ホバーの方向性**: Light テーマはベース色から20%暗くする。Dark テーマはベース色から明るくする。これはApple HIGの「ダークモードでは要素のインタラクション時に明度を上げる」原則に準拠。

#### Syntax Highlighting（8変数）

| #   | セマンティック変数  | Apple/Xcode 名称   | CSS値     | 備考      |
| --- | ------------------- | ------------------ | --------- | --------- |
| 24  | `--syntax-keyword`  | Xcode keyword pink | `#FC5FA3` |           |
| 25  | `--syntax-function` | systemBlue         | `#0A84FF` |           |
| 26  | `--syntax-string`   | Xcode string       | `#FC6A5D` |           |
| 27  | `--syntax-number`   | Xcode number       | `#D0BF69` |           |
| 28  | `--syntax-constant` | Xcode constant     | `#A167E6` |           |
| 29  | `--syntax-type`     | systemIndigo       | `#5E5CE6` |           |
| 30  | `--syntax-comment`  | Xcode comment gray | `#7F8C98` |           |
| 31  | `--syntax-variable` | —                  | `#67B7A4` | Xcode準拠 |

**合計: 31変数**

---

## 6. 3テーマ間のセマンティック変数整合性（31変数 × 3テーマ）

### 変数名統一テーブル

全3テーマが同一の31個のセマンティック変数名を定義する。

#### Background（6変数）

| 変数名           | kanagawa-dragon                  | light                      | dark                       |
| ---------------- | -------------------------------- | -------------------------- | -------------------------- |
| `--bg-primary`   | `var(--kanagawa-dragon-black-1)` | `#FFFFFF`                  | `#000000`                  |
| `--bg-secondary` | `var(--kanagawa-dragon-black-2)` | `#F2F2F7`                  | `#1C1C1E`                  |
| `--bg-tertiary`  | `var(--kanagawa-dragon-black-3)` | `#E5E5EA`                  | `#2C2C2E`                  |
| `--bg-elevated`  | `var(--kanagawa-dragon-black-3)` | `#FFFFFF`                  | `#1C1C1E`                  |
| `--bg-glass`     | `rgba(18, 18, 15, 0.9)`          | `rgba(242, 242, 247, 0.8)` | `rgba(28, 28, 30, 0.8)`    |
| `--bg-selection` | `var(--kanagawa-dragon-black-4)` | `rgba(0, 122, 255, 0.15)`  | `rgba(10, 132, 255, 0.25)` |

#### Text（4変数）

| 変数名             | kanagawa-dragon                  | light                   | dark                       |
| ------------------ | -------------------------------- | ----------------------- | -------------------------- |
| `--text-primary`   | `var(--kanagawa-dragon-white)`   | `#000000`               | `#FFFFFF`                  |
| `--text-secondary` | `var(--kanagawa-dragon-gray-2)`  | `rgba(60, 60, 67, 0.6)` | `rgba(235, 235, 245, 0.6)` |
| `--text-muted`     | `var(--kanagawa-dragon-gray)`    | `rgba(60, 60, 67, 0.3)` | `rgba(235, 235, 245, 0.3)` |
| `--text-inverse`   | `var(--kanagawa-dragon-black-1)` | `#FFFFFF`               | `#000000`                  |

#### Border（3変数）

| 変数名              | kanagawa-dragon                  | light                    | dark                     |
| ------------------- | -------------------------------- | ------------------------ | ------------------------ |
| `--border-default`  | `var(--kanagawa-dragon-black-4)` | `#C6C6C8`                | `#38383A`                |
| `--border-emphasis` | `var(--kanagawa-dragon-black-5)` | `#AEAEB2`                | `#48484A`                |
| `--border-subtle`   | `rgba(197, 201, 197, 0.1)`       | `rgba(60, 60, 67, 0.12)` | `rgba(84, 84, 88, 0.36)` |

#### Status（10変数）

| 変数名                   | kanagawa-dragon                 | light     | dark      |
| ------------------------ | ------------------------------- | --------- | --------- |
| `--status-primary`       | `var(--kanagawa-dragon-blue)`   | `#007AFF` | `#0A84FF` |
| `--status-primary-hover` | `var(--kanagawa-dragon-teal)`   | `#0056B3` | `#409CFF` |
| `--status-success`       | `var(--kanagawa-dragon-green)`  | `#34C759` | `#30D158` |
| `--status-success-hover` | `var(--kanagawa-autumn-green)`  | `#28A745` | `#5BD97D` |
| `--status-warning`       | `var(--kanagawa-ronin-yellow)`  | `#FF9500` | `#FF9F0A` |
| `--status-warning-hover` | `var(--kanagawa-dragon-yellow)` | `#CC7700` | `#FFB840` |
| `--status-error`         | `var(--kanagawa-samurai-red)`   | `#FF3B30` | `#FF453A` |
| `--status-error-hover`   | `var(--kanagawa-dragon-red)`    | `#CC2F26` | `#FF6961` |
| `--status-info`          | `var(--kanagawa-spring-blue)`   | `#5856D6` | `#5E5CE6` |
| `--status-info-hover`    | `var(--kanagawa-dragon-blue)`   | `#4240A8` | `#7A78EB` |

#### Syntax Highlighting（8変数）

| 変数名              | kanagawa-dragon                 | light     | dark      |
| ------------------- | ------------------------------- | --------- | --------- |
| `--syntax-keyword`  | `var(--kanagawa-dragon-violet)` | `#9B2393` | `#FC5FA3` |
| `--syntax-function` | `var(--kanagawa-dragon-blue)`   | `#007AFF` | `#0A84FF` |
| `--syntax-string`   | `var(--kanagawa-dragon-green)`  | `#C41A16` | `#FC6A5D` |
| `--syntax-number`   | `var(--kanagawa-dragon-pink)`   | `#1C00CF` | `#D0BF69` |
| `--syntax-constant` | `var(--kanagawa-dragon-orange)` | `#703DAA` | `#A167E6` |
| `--syntax-type`     | `var(--kanagawa-dragon-aqua)`   | `#5856D6` | `#5E5CE6` |
| `--syntax-comment`  | `var(--kanagawa-dragon-gray)`   | `#8E8E93` | `#7F8C98` |
| `--syntax-variable` | `var(--kanagawa-dragon-yellow)` | `#3900A0` | `#67B7A4` |

### 整合性検証結果

| チェック項目                                           | 結果 |
| ------------------------------------------------------ | ---- |
| 全3テーマで変数名が完全一致（31個 × 3）                | ✅   |
| kanagawa-dragon に `--bg-selection` が既存定義済み     | ✅   |
| kanagawa-dragon に `--status-*-hover` が既存定義済み   | ✅   |
| light/dark の追加変数で kanagawa-dragon 未定義変数なし | ✅   |
| `color-scheme` プロパティが全テーマで設定済み          | ✅   |

---

## 7. マイクロインタラクション変数（5個）とキーフレーム（2個）の配置設計

### 7-1. 変数配置

マイクロインタラクション変数はテーマ非依存のため、`:root` セクション内の Transitions 変数直後に配置する。

| 変数名              | 値                                      | 配置    | 用途                       |
| ------------------- | --------------------------------------- | ------- | -------------------------- |
| `--ease-bounce`     | `cubic-bezier(0.34, 1.56, 0.64, 1)`     | `:root` | バウンス感のある跳ね返り   |
| `--ease-anticipate` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | `:root` | 溜めてから跳ねるモーション |
| `--scale-hover`     | `1.02`                                  | `:root` | ホバー時の微拡大           |
| `--scale-active`    | `0.97`                                  | `:root` | タップ/クリック時の微縮小  |
| `--scale-bounce`    | `1.05`                                  | `:root` | 成功時のバウンスピーク     |

### 7-2. 挿入位置（tokens.css 内）

```css
:root {
  /* ... 既存の Transitions セクション ... */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* ===== Micro-Interaction Tokens ===== */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-anticipate: cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --scale-hover: 1.02;
  --scale-active: 0.97;
  --scale-bounce: 1.05;
}
```

### 7-3. キーフレームアニメーション設計

`:root` の閉じ括弧直後、Kanagawa Dragon Theme セクションの直前に配置する。

#### `@keyframes success-bounce`

```css
@keyframes success-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(var(--scale-bounce));
  }
  100% {
    transform: scale(1);
  }
}
```

- 3ステップ構成（0%, 50%, 100%）
- `var(--scale-bounce)` を使用し、ピーク値をトークンで管理
- 用途: 成功操作完了時のフィードバック

#### `@keyframes error-shake`

```css
@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-4px);
  }
  40% {
    transform: translateX(4px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
```

- 6ステップ構成（0%, 20%, 40%, 60%, 80%, 100%）
- ±4px 振幅の左右振動
- 用途: バリデーションエラー時のフィードバック

---

## 8. renderWithTheme テストヘルパー設計

### 8-1. 型定義

```typescript
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type { ResolvedTheme } from "../../store/types";

interface ThemeRenderOptions extends RenderOptions {
  theme?: ResolvedTheme;
}
```

### 8-2. 関数シグネチャ

```typescript
export function renderWithTheme(
  ui: React.ReactElement,
  options?: ThemeRenderOptions,
): RenderResult;
```

| パラメータ      | 型                   | デフォルト値        | 説明                        |
| --------------- | -------------------- | ------------------- | --------------------------- |
| `ui`            | `React.ReactElement` | —（必須）           | レンダリング対象のReact要素 |
| `options`       | `ThemeRenderOptions` | `{}`                | テーマ指定 + RenderOptions  |
| `options.theme` | `ResolvedTheme`      | `"kanagawa-dragon"` | 適用するテーマ名            |

### 8-3. 実装設計

```typescript
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ResolvedTheme } from "../../store/types";

interface ThemeRenderOptions extends RenderOptions {
  theme?: ResolvedTheme;
}

export function renderWithTheme(
  ui: React.ReactElement,
  options: ThemeRenderOptions = {},
): RenderResult {
  const { theme = "kanagawa-dragon", ...renderOptions } = options;
  document.documentElement.setAttribute("data-theme", theme);
  return render(ui, renderOptions);
}
```

### 8-4. 設計判断

| 判断項目                   | 選択                                   | 理由                                                                                    |
| -------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| テーマ設定先               | `document.documentElement`             | CSS変数が `:root` / `html` セレクタに依存。子要素の `data-theme` では変数が適用されない |
| wrapper コンポーネント使用 | 不使用                                 | `document.documentElement` への直接設定で十分。wrapper は不要な複雑性を追加するだけ     |
| デフォルトテーマ           | `"kanagawa-dragon"`                    | プロジェクトのデフォルトテーマと一致させ、既存テストとの後方互換性を維持                |
| 戻り値                     | `render()` の戻り値をそのまま返す      | `screen`, `getByTestId`, `rerender` 等の全APIが利用可能。ラッパーで情報を失わない       |
| `options` のスプレッド     | `theme` を分離、残りを `render` に委譲 | `container`, `wrapper`, `hydrate` 等の全 `RenderOptions` をそのまま透過的に渡せる       |

---

## 9. テストケース構造

### 9-1. テスト構造

```typescript
describe("renderWithTheme", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  // 3テーマ網羅テスト（describe.each）
  describe.each(["kanagawa-dragon", "light", "dark"] as const)(
    "Theme: %s",
    (theme) => {
      it("data-theme属性に正しいテーマ名を設定する", () => {
        renderWithTheme(<div data-testid="test">test</div>, { theme });
        expect(document.documentElement.getAttribute("data-theme")).toBe(theme);
      });
    },
  );

  // デフォルト値テスト
  it("テーマ未指定時はkanagawa-dragonをデフォルトとする", () => {
    renderWithTheme(<div data-testid="test">test</div>);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "kanagawa-dragon",
    );
  });

  // RenderOptions透過テスト
  it("RenderOptionsをrender関数に透過的に渡す", () => {
    const { getByTestId } = renderWithTheme(
      <div data-testid="custom">content</div>,
      { theme: "light" },
    );
    expect(getByTestId("custom")).toBeTruthy();
  });
});
```

### 9-2. テストケース一覧

| #   | テストケース                                | カテゴリ     | 検証内容                                    |
| --- | ------------------------------------------- | ------------ | ------------------------------------------- |
| 1   | Theme: kanagawa-dragon - data-theme属性設定 | 3テーマ網羅  | `data-theme="kanagawa-dragon"` が設定される |
| 2   | Theme: light - data-theme属性設定           | 3テーマ網羅  | `data-theme="light"` が設定される           |
| 3   | Theme: dark - data-theme属性設定            | 3テーマ網羅  | `data-theme="dark"` が設定される            |
| 4   | デフォルトテーマ                            | デフォルト値 | 引数なしで `"kanagawa-dragon"` がデフォルト |
| 5   | RenderOptions透過                           | Options透過  | `getByTestId` 等のAPI が利用可能            |

**合計: 5テストケース**

### 9-3. テスト設計の準拠事項

| 準拠対象 | 対策                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| P9       | `afterEach` で `data-theme` 属性をリセットし、テスト間の状態リークを防止           |
| P39      | `userEvent` を使用しない。happy-dom 環境では `fireEvent` のみ使用                  |
| P40      | テスト実行は `cd apps/desktop && pnpm vitest run` でパッケージディレクトリから実行 |

---

## 10. ファイル配置

### 新規作成ファイル

```
apps/desktop/src/renderer/tests/helpers/
├── renderWithTheme.tsx        ← テストヘルパー実装
└── renderWithTheme.test.tsx   ← テストヘルパーテスト
```

### 変更対象ファイル

```
apps/desktop/src/renderer/styles/
└── tokens.css                 ← セクション4,5,7,8 を変更
```

### 変更なしファイル

| ファイル                                   | 理由                                                 |
| ------------------------------------------ | ---------------------------------------------------- |
| `apps/desktop/src/renderer/store/types.ts` | `ResolvedTheme` 型は既に `"light"` / `"dark"` を含む |
| Kanagawa Dragon テーマセクション           | 既存31変数は一切変更しない                           |
| Spacing / Typography / Effects セクション  | テーマ共通変数は変更しない                           |

---

## アーキテクチャ層別影響範囲

| 層       | 影響ファイル                             | 変更内容                                                  |
| -------- | ---------------------------------------- | --------------------------------------------------------- |
| Renderer | `styles/tokens.css`                      | light全面書換、dark新規定義、マイクロインタラクション追加 |
| Renderer | `tests/helpers/renderWithTheme.tsx`      | 新規作成                                                  |
| Renderer | `tests/helpers/renderWithTheme.test.tsx` | 新規作成                                                  |
| Main     | なし                                     | 変更なし                                                  |
| Preload  | なし                                     | 変更なし                                                  |

---

## 設計判断サマリ

| #   | 判断項目                       | 選択                             | 代替案                 | 選択理由                                            |
| --- | ------------------------------ | -------------------------------- | ---------------------- | --------------------------------------------------- |
| 1   | テーマ切替方式                 | `data-theme` 属性                | `prefers-color-scheme` | 3テーマ独立制御、既存実装との一貫性                 |
| 2   | light/dark の変数値            | Apple HIG 直接値（`#FFFFFF` 等） | Primitive変数経由      | Apple HIG公式値との1:1照合が容易                    |
| 3   | マイクロインタラクション配置   | `:root` 内（テーマセレクタ外）   | テーマごとに定義       | テーマ非依存のモーション値のため                    |
| 4   | renderWithTheme のテーマ設定先 | `document.documentElement`       | wrapper コンポーネント | CSS変数が `:root` セレクタに依存するため            |
| 5   | デフォルトテーマ               | `"kanagawa-dragon"`              | `"light"`              | プロジェクトのデフォルトテーマとの一致              |
| 6   | ホバー色のDark テーマ方向      | ベース色より明るい方向           | ベース色より暗い方向   | Apple HIG「ダークモードでは明度を上げる」原則に準拠 |

---

## 現行 tokens.css からの差分サマリ

### 追加される要素

| 要素                         | 数量 | 詳細                                                                                      |
| ---------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| マイクロインタラクション変数 | 5個  | `--ease-bounce`, `--ease-anticipate`, `--scale-hover`, `--scale-active`, `--scale-bounce` |
| キーフレーム                 | 2個  | `@keyframes success-bounce`, `@keyframes error-shake`                                     |
| Light テーマ変数             | 31個 | 既存の不完全な定義を Apple HIG 準拠に全面書き換え                                         |
| Dark テーマ変数              | 31個 | 空の定義を Apple HIG 準拠に新規定義                                                       |

### 変更されない要素

| 要素                           | 理由                               |
| ------------------------------ | ---------------------------------- |
| Primitive Colors               | 全テーマ共通の基盤パレット         |
| Semantic Colors (Default)      | kanagawa-dragon のフォールバック値 |
| Spacing / Typography / Effects | テーマ非依存の共通トークン         |
| kanagawa-dragon テーマ全体     | 既存テーマの保護（NFR-004）        |
| Theme Transition / Glass       | テーマ切替アニメーション基盤       |
