# コンポーネント適用設計書

## メタ情報

| 項目         | 内容                       |
| ------------ | -------------------------- |
| サブタスクID | T-01-2                     |
| フェーズ     | Phase 1: 設計              |
| 作成日       | 2025-12-12                 |
| 担当         | @ui-designer, @arch-police |

---

## 1. 概要

### 1.1 目的

各コンポーネントにハードコードされた色を特定し、CSS変数への置換計画を策定する。

### 1.2 検出方法

- `#[0-9a-fA-F]{6}` パターンでHex値を検索
- `rgba(` パターンでRGBA値を検索

---

## 2. ハードコード色一覧

### 2.1 高優先度（画面・ルートコンポーネント）

| ファイル                | 行  | 現在の値       | 用途             | 置換先                   |
| ----------------------- | --- | -------------- | ---------------- | ------------------------ |
| `App.tsx`               | 53  | `bg-[#0a0a0a]` | ルート背景       | `bg-[var(--bg-primary)]` |
| `AuthView/index.tsx`    | 98  | `bg-[#0a0a0a]` | ログイン背景     | `bg-[var(--bg-primary)]` |
| `AuthErrorBoundary.tsx` | 142 | `bg-[#0a0a0a]` | エラー画面背景   | `bg-[var(--bg-primary)]` |
| `LoadingScreen.tsx`     | 21  | `bg-[#0a0a0a]` | ローディング背景 | `bg-[var(--bg-primary)]` |

### 2.2 中優先度（コンポーネント）

| ファイル                   | 行  | 現在の値                               | 用途               | 置換先                     |
| -------------------------- | --- | -------------------------------------- | ------------------ | -------------------------- |
| `GlassPanel/index.tsx`     | 35  | `bg-[rgba(30,30,30,0.6)]`              | ガラスパネル背景   | `bg-[var(--bg-glass)]`     |
| `GlassPanel/index.tsx`     | 37  | `shadow-[0_20px_60px_rgba(0,0,0,0.6)]` | ガラスシャドウ     | `shadow-glass`             |
| `AppDock/index.tsx`        | 44  | `bg-[rgba(20,20,20,0.8)]`              | ドック背景         | `bg-[var(--bg-glass)]`     |
| `MobileDrawer/index.tsx`   | 53  | `bg-[rgba(20,20,20,0.95)]`             | ドロワー背景       | `bg-[var(--bg-glass)]`     |
| `AccountSection/index.tsx` | 442 | `bg-[#1a1a1a]`                         | ドロップダウン背景 | `bg-[var(--bg-secondary)]` |

### 2.3 アクセントカラー（macOSブルー）

| ファイル                  | 行      | 現在の値                         | 用途             | 置換先                       |
| ------------------------- | ------- | -------------------------------- | ---------------- | ---------------------------- |
| `Button/index.tsx`        | 44, 46  | `bg-[#0a84ff]`                   | プライマリボタン | `bg-[var(--status-primary)]` |
| `ThemeSelector/index.tsx` | 128,135 | `bg-[#0a84ff]`, `ring-[#0a84ff]` | 選択状態         | `bg-[var(--status-primary)]` |
| `LocaleSelector.tsx`      | 89,122  | `ring-[#0a84ff]`, `bg-[#0a84ff]` | フォーカス・選択 | `bg-[var(--status-primary)]` |
| `TimezoneSelector.tsx`    | 135,208 | `ring-[#0a84ff]`, `bg-[#0a84ff]` | フォーカス・選択 | `bg-[var(--status-primary)]` |

### 2.4 設定画面ドロップダウン

| ファイル               | 行      | 現在の値       | 用途               | 置換先                     |
| ---------------------- | ------- | -------------- | ------------------ | -------------------------- |
| `LocaleSelector.tsx`   | 106     | `bg-[#1c1c1e]` | ドロップダウン背景 | `bg-[var(--bg-secondary)]` |
| `TimezoneSelector.tsx` | 176,181 | `bg-[#1c1c1e]` | ドロップダウン背景 | `bg-[var(--bg-secondary)]` |

### 2.5 グラフ・可視化

| ファイル                   | 行  | 現在の値                   | 用途               | 置換先                  |
| -------------------------- | --- | -------------------------- | ------------------ | ----------------------- |
| `KnowledgeGraph/index.tsx` | 19  | `#818cf8`                  | メインノード色     | `var(--status-primary)` |
| `KnowledgeGraph/index.tsx` | 20  | `#34d399`                  | ドキュメントノード | `var(--status-success)` |
| `KnowledgeGraph/index.tsx` | 21  | `#fbbf24`                  | コンセプトノード   | `var(--status-warning)` |
| `KnowledgeGraph/index.tsx` | 145 | `rgba(255, 255, 255, 0.2)` | エッジストローク   | `var(--border-subtle)`  |

---

## 3. 置換戦略

### 3.1 CSS変数参照方法

```tsx
// Tailwindでのcss変数参照
className="bg-[var(--bg-primary)]"
className="text-[var(--text-primary)]"
className="border-[var(--border-default)]"

// インラインスタイル（Canvas等）
style={{ backgroundColor: 'var(--bg-primary)' }}
ctx.strokeStyle = 'var(--border-subtle)';
```

### 3.2 置換優先順位

| 優先度 | カテゴリ                 | 理由                       |
| ------ | ------------------------ | -------------------------- |
| 1      | ルート・画面背景         | 視覚的影響が最も大きい     |
| 2      | GlassPanel・Dock         | 主要UIコンポーネント       |
| 3      | Button・フォーカス状態   | インタラクティブ要素       |
| 4      | ドロップダウン・選択状態 | 設定画面のUI               |
| 5      | グラフ・可視化           | 特殊用途、影響範囲が限定的 |

---

## 4. Tailwind CSS変数統合

### 4.1 tailwind.config.js 拡張

```javascript
// colors拡張
colors: {
  // CSS変数を参照するセマンティックカラー
  semantic: {
    bg: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
      elevated: 'var(--bg-elevated)',
      glass: 'var(--bg-glass)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
      inverse: 'var(--text-inverse)',
    },
    border: {
      default: 'var(--border-default)',
      emphasis: 'var(--border-emphasis)',
      subtle: 'var(--border-subtle)',
    },
    status: {
      primary: 'var(--status-primary)',
      success: 'var(--status-success)',
      warning: 'var(--status-warning)',
      error: 'var(--status-error)',
      info: 'var(--status-info)',
    },
  },
}
```

### 4.2 置換例

```tsx
// Before
<div className="bg-[#0a0a0a]">

// After (CSS変数直接参照)
<div className="bg-[var(--bg-primary)]">

// After (Tailwind拡張使用)
<div className="bg-semantic-bg-primary">
```

---

## 5. テスト更新

### 5.1 テストファイルの色検証更新

| ファイル                 | 行  | 現在の検証                | 更新後の検証            |
| ------------------------ | --- | ------------------------- | ----------------------- |
| `ThemeSelector.test.tsx` | 82  | `bg-[#0a84ff]`            | CSS変数クラス検証に変更 |
| `ThemeSelector.test.tsx` | 89  | `bg-[#0a84ff]`            | CSS変数クラス検証に変更 |
| `Button.test.tsx`        | 27  | `bg-[#0a84ff]`            | CSS変数クラス検証に変更 |
| `GlassPanel.test.tsx`    | 78  | `bg-[rgba(30,30,30,0.6)]` | CSS変数クラス検証に変更 |

---

## 6. 完了条件チェックリスト

- [x] ハードコード色一覧が作成されている
- [x] 各色のCSS変数マッピングが定義されている
- [x] 置換優先順位が決定されている
- [x] Tailwind拡張戦略が設計されている
- [x] テスト更新計画が作成されている
