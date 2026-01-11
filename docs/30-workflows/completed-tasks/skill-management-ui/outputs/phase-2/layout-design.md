# レイアウト設計書 - スキル管理UI（AGENT-002）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | AGENT-002  |
| Phase    | 2          |
| 作成日   | 2026-01-11 |

---

## 1. 概要

スキル管理UIの詳細なレイアウトとスタイルを設計する。デザインシステム仕様（`ui-ux-design-system.md`）に従い、Glass Panel効果、8pxグリッドシステム、レスポンシブ対応を実装する。

---

## 2. メインレイアウト

### 2.1 全体構成

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AgentView (100% viewport)                                               │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ SkillToolbar (h-14, border-b)                                       │ │
│ │ ┌───────────────────────────────┐ ┌─────────────┐ ┌──────────────┐  │ │
│ │ │ 🔍 スキルを検索...             │ │ カテゴリ ▼  │ │+ インポート  │  │ │
│ │ │ flex-1, max-w-md              │ │ w-40        │ │ w-auto       │  │ │
│ │ └───────────────────────────────┘ └─────────────┘ └──────────────┘  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┬───────────────────────┐ │
│ │ SkillList (flex-1, overflow-auto)           │ SkillDetailPanel      │ │
│ │                                             │ (w-[360px])           │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │                       │ │
│ │ │ SkillCard   │ │ SkillCard   │ │ Skill   │ │ ┌─────────────────┐   │ │
│ │ │ 280px min   │ │ 280px min   │ │ Card    │ │ │ スキル名        │   │ │
│ │ │             │ │             │ │         │ │ │ text-xl, bold   │   │ │
│ │ │ ▔▔▔▔▔▔▔▔▔   │ │ ▔▔▔▔▔▔▔▔▔   │ │ ▔▔▔▔▔▔  │ │ └─────────────────┘   │ │
│ │ │ desc...     │ │ desc...     │ │ desc    │ │ ┌─────────────────┐   │ │
│ │ │ [Test][TDD] │ │ [Code][CI]  │ │ [tag]   │ │ │ 説明文全文      │   │ │
│ │ └─────────────┘ └─────────────┘ └─────────┘ │ │ ...             │   │ │
│ │ ┌─────────────┐ ┌─────────────┐             │ └─────────────────┘   │ │
│ │ │ SkillCard   │ │ SkillCard   │             │ ┌─────────────────┐   │ │
│ │ │ 280px min   │ │ 280px min   │             │ │ Triggers        │   │ │
│ │ │             │ │             │             │ │ [tdd][test]...  │   │ │
│ │ │ ▔▔▔▔▔▔▔▔▔   │ │ ▔▔▔▔▔▔▔▔▔   │             │ └─────────────────┘   │ │
│ │ │ desc...     │ │ desc...     │             │ ┌─────────────────┐   │ │
│ │ │ [Design]    │ │ [Doc]       │             │ │ Anchors         │   │ │
│ │ └─────────────┘ └─────────────┘             │ │ • Clean Code    │   │ │
│ │                                             │ │ • TDD by Example│   │ │
│ │                                             │ └─────────────────┘   │ │
│ │                                             │ ┌─────────────────┐   │ │
│ │                                             │ │[🚀実行] [🗑削除]│   │ │
│ │                                             │ └─────────────────┘   │ │
│ └─────────────────────────────────────────────┴───────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 レイアウト寸法

| 領域             | 幅                   | 高さ        | 備考               |
| ---------------- | -------------------- | ----------- | ------------------ |
| SkillToolbar     | 100%                 | 56px (h-14) | 固定ヘッダー       |
| SkillList        | calc(100% - 360px)   | flex-1      | スクロール可能     |
| SkillDetailPanel | 360px                | 100%        | 固定幅サイドパネル |
| SkillCard        | min 280px, max 400px | auto        | グリッド自動配置   |

---

## 3. SkillCard デザイン

### 3.1 カード構造

```
┌─────────────────────────────────────────────────┐
│ SkillCard (GlassPanel)                          │
│ padding: 16px (spacing-4)                       │
│ border-radius: 12px                             │
│ min-height: 140px                               │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📦 skill-name                               │ │  ← text-lg (18px)
│ │    font-semibold, text-slate-900            │ │     line-height: 1.25
│ └─────────────────────────────────────────────┘ │
│ margin-bottom: 8px (spacing-2)                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Description text that may span multiple     │ │  ← text-sm (14px)
│ │ lines with ellipsis after two lines...      │ │     text-slate-600
│ │ line-clamp-2                                │ │     line-height: 1.5
│ └─────────────────────────────────────────────┘ │
│ margin-bottom: 12px (spacing-3)                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ [テスト]  [TDD]  [品質]                     │ │  ← Badge, gap-2
│ │ bg-green-100 text-green-800                 │ │     text-xs (12px)
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 3.2 カード状態スタイル

```css
/* Default */
.skill-card {
  background: var(--glass-bg); /* rgba(30,30,30,0.7) */
  border: 1px solid var(--glass-border); /* rgba(255,255,255,0.1) */
  backdrop-filter: blur(var(--glass-blur)); /* 20px */
  box-shadow: var(--glass-shadow);
  transition: all 200ms ease-in-out;
}

/* Hover */
.skill-card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: var(--color-primary);
}

/* Selected */
.skill-card[data-selected="true"] {
  ring: 2px solid var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
}

/* Focus (キーボード) */
.skill-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 3.3 Tailwind CSS クラス

```tsx
const cardClasses = cn(
  // Base
  "relative p-4 rounded-xl cursor-pointer",
  "bg-slate-800/70 backdrop-blur-xl",
  "border border-slate-700/50",
  "shadow-lg",
  // Transition
  "transition-all duration-200 ease-in-out",
  // Hover
  "hover:scale-[1.02] hover:shadow-2xl hover:border-primary-500",
  // Selected
  isSelected && "ring-2 ring-primary-500 bg-primary-500/10",
  // Focus
  "focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2",
);
```

---

## 4. SkillDetailPanel デザイン

### 4.1 パネル構造

```
┌─────────────────────────────────────────────┐
│ SkillDetailPanel                            │
│ width: 360px                                │
│ height: 100%                                │
│ border-left: 1px solid var(--border-color)  │
│ background: var(--bg-secondary)             │
│ padding: 24px (spacing-6)                   │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Header                                  │ │
│ │ ┌───────────────────────────────┐ ┌───┐ │ │
│ │ │ スキル名                      │ │ × │ │ │
│ │ │ text-xl, font-bold            │ │   │ │ │
│ │ └───────────────────────────────┘ └───┘ │ │
│ └─────────────────────────────────────────┘ │
│ margin-bottom: 16px (spacing-4)             │
│ ┌─────────────────────────────────────────┐ │
│ │ カテゴリバッジ                          │ │
│ │ [テスト] Badge                          │ │
│ └─────────────────────────────────────────┘ │
│ margin-bottom: 24px (spacing-6)             │
│ ┌─────────────────────────────────────────┐ │
│ │ 説明                                    │ │
│ │ ───────────                             │ │
│ │ 説明文の全文がここに表示されます。      │ │
│ │ 複数行に渡る場合もあります。            │ │
│ │ text-sm, text-slate-400                 │ │
│ └─────────────────────────────────────────┘ │
│ margin-bottom: 24px (spacing-6)             │
│ ┌─────────────────────────────────────────┐ │
│ │ Triggers                                │ │
│ │ ───────────                             │ │
│ │ [tdd] [test] [テスト駆動]               │ │
│ │ flex-wrap, gap-2                        │ │
│ └─────────────────────────────────────────┘ │
│ margin-bottom: 24px (spacing-6)             │
│ ┌─────────────────────────────────────────┐ │
│ │ Anchors                                 │ │
│ │ ───────────                             │ │
│ │ • Clean Code                            │ │
│ │   適用: コード品質                      │ │
│ │   目的: 保守性向上                      │ │
│ │                                         │ │
│ │ • TDD by Example                        │ │
│ │   適用: テスト戦略                      │ │
│ │   目的: 品質担保                        │ │
│ └─────────────────────────────────────────┘ │
│ flex-grow to fill remaining space           │
│ ┌─────────────────────────────────────────┐ │
│ │ Actions (sticky bottom)                 │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ │ │
│ │ │ 🚀 実行         │ │ 🗑 削除         │ │ │
│ │ │ primary button  │ │ ghost danger    │ │ │
│ │ └─────────────────┘ └─────────────────┘ │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 4.2 Tailwind CSS クラス

```tsx
// Panel container
const panelClasses = cn(
  "w-[360px] h-full",
  "border-l border-slate-700",
  "bg-slate-900/95 backdrop-blur-xl",
  "p-6",
  "flex flex-col",
  "overflow-y-auto",
);

// Section title
const sectionTitleClasses = "text-sm font-medium text-slate-400 mb-2";

// Section content
const sectionContentClasses = "text-sm text-slate-300";
```

---

## 5. SkillImportDialog デザイン

### 5.1 ダイアログ構造

```
┌─────────────────────────────────────────────────────────┐
│                    (overlay: bg-black/50)               │
│    ┌───────────────────────────────────────────────┐    │
│    │ SkillImportDialog                             │    │
│    │ max-width: 600px                              │    │
│    │ max-height: 80vh                              │    │
│    │ border-radius: 16px                           │    │
│    │ background: var(--bg-primary)                 │    │
│    │                                               │    │
│    │ ┌───────────────────────────────────────────┐ │    │
│    │ │ Header                                    │ │    │
│    │ │ ┌─────────────────────────────────┐ ┌───┐ │ │    │
│    │ │ │ スキルをインポート              │ │ × │ │ │    │
│    │ │ │ text-lg, font-semibold          │ │   │ │ │    │
│    │ │ └─────────────────────────────────┘ └───┘ │ │    │
│    │ └───────────────────────────────────────────┘ │    │
│    │ padding: 16px (spacing-4)                     │    │
│    │ border-bottom: 1px solid var(--border-color)  │    │
│    │                                               │    │
│    │ ┌───────────────────────────────────────────┐ │    │
│    │ │ Search                                    │ │    │
│    │ │ [🔍 スキルを検索...                     ] │ │    │
│    │ └───────────────────────────────────────────┘ │    │
│    │ padding: 16px (spacing-4)                     │    │
│    │                                               │    │
│    │ ┌───────────────────────────────────────────┐ │    │
│    │ │ Skill List (scrollable)                   │ │    │
│    │ │ max-height: calc(80vh - 200px)            │ │    │
│    │ │                                           │ │    │
│    │ │ ☐ tdd-principles                          │ │    │
│    │ │   TDD原則に従った開発ガイド               │ │    │
│    │ │ ───────────────────────────────           │ │    │
│    │ │ ☑ code-review                             │ │    │
│    │ │   コードレビューのベストプラクティス      │ │    │
│    │ │ ───────────────────────────────           │ │    │
│    │ │ ☐ domain-modeling                         │ │    │
│    │ │   ドメインモデリング手法                  │ │    │
│    │ │ ───────────────────────────────           │ │    │
│    │ │ ☑ responsive-design                       │ │    │
│    │ │   レスポンシブデザイン設計               │ │    │
│    │ │                                           │ │    │
│    │ └───────────────────────────────────────────┘ │    │
│    │ padding: 16px (spacing-4)                     │    │
│    │                                               │    │
│    │ ┌───────────────────────────────────────────┐ │    │
│    │ │ Footer                                    │ │    │
│    │ │ ┌─────────────────┐ ┌─────────────────┐   │ │    │
│    │ │ │ キャンセル      │ │ インポート (2)  │   │ │    │
│    │ │ │ ghost button    │ │ primary button  │   │ │    │
│    │ │ └─────────────────┘ └─────────────────┘   │ │    │
│    │ └───────────────────────────────────────────┘ │    │
│    │ padding: 16px (spacing-4)                     │    │
│    │ border-top: 1px solid var(--border-color)     │    │
│    └───────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Tailwind CSS クラス

```tsx
// Overlay
const overlayClasses = cn(
  "fixed inset-0",
  "bg-black/50 backdrop-blur-sm",
  "flex items-center justify-center",
  "z-50",
);

// Dialog
const dialogClasses = cn(
  "w-full max-w-[600px] max-h-[80vh]",
  "bg-slate-900 border border-slate-700",
  "rounded-2xl shadow-2xl",
  "flex flex-col",
  "overflow-hidden",
);

// Checkbox item
const checkboxItemClasses = cn(
  "flex items-start gap-3 p-3",
  "hover:bg-slate-800/50 rounded-lg",
  "cursor-pointer transition-colors",
);
```

---

## 6. レスポンシブデザイン

### 6.1 ブレイクポイント

| ブレイクポイント | 幅        | グリッド列数 | 詳細パネル     |
| ---------------- | --------- | ------------ | -------------- |
| 2xl              | >= 1536px | 4列          | サイドパネル   |
| xl               | >= 1280px | 3列          | サイドパネル   |
| lg               | >= 1024px | 2列          | オーバーレイ   |
| md               | >= 768px  | 2列          | オーバーレイ   |
| default          | < 768px   | 1列          | フルスクリーン |

### 6.2 レスポンシブ実装

```tsx
// SkillList grid
const gridClasses = cn(
  "grid gap-4",
  // Default: 1 column
  "grid-cols-1",
  // md: 2 columns
  "md:grid-cols-2",
  // xl: 3 columns
  "xl:grid-cols-3",
  // 2xl: 4 columns
  "2xl:grid-cols-4",
);

// Detail panel responsive
const detailPanelClasses = cn(
  // Desktop (>= 1280px): side panel
  "xl:w-[360px] xl:border-l xl:border-slate-700",
  // Tablet/Mobile: overlay
  "max-xl:fixed max-xl:inset-0 max-xl:z-40",
  "max-xl:bg-slate-900/95 max-xl:backdrop-blur-xl",
);
```

### 6.3 小画面時の詳細パネル

```
┌─────────────────────────────────────────────────────────┐
│ (< 1280px) SkillDetailPanel as Overlay                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Header                                          │ │ │
│ │ │ ← 戻る │ スキル名                        │ × │ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Content (scrollable)                            │ │ │
│ │ │ 説明、Triggers、Anchors...                      │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Actions (sticky bottom)                         │ │ │
│ │ │ [🚀 実行] [🗑 削除]                             │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 7. アニメーション

### 7.1 トランジション定義

| 要素              | トランジション    | 用途         |
| ----------------- | ----------------- | ------------ |
| SkillCard hover   | 200ms ease-in-out | スケール・影 |
| SkillDetailPanel  | 300ms ease-out    | スライドイン |
| SkillImportDialog | 200ms ease-out    | フェードイン |
| Badge hover       | 150ms ease        | 色変化       |
| Button hover      | 150ms ease        | 色・影変化   |

### 7.2 アニメーションCSS

```css
/* Detail panel slide-in */
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.detail-panel-enter {
  animation: slideInFromRight 300ms ease-out;
}

/* Dialog fade-in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-enter {
  animation: fadeIn 200ms ease-out;
}
```

---

## 8. カラーパレット

### 8.1 ダークモード（デフォルト）

| 用途                   | Tailwind クラス  | 値      |
| ---------------------- | ---------------- | ------- |
| 背景（プライマリ）     | bg-slate-900     | #0f172a |
| 背景（セカンダリ）     | bg-slate-800     | #1e293b |
| 背景（ターシャリ）     | bg-slate-700     | #334155 |
| テキスト（プライマリ） | text-slate-50    | #f8fafc |
| テキスト（セカンダリ） | text-slate-400   | #94a3b8 |
| テキスト（ミュート）   | text-slate-500   | #64748b |
| ボーダー               | border-slate-700 | #334155 |
| プライマリ             | primary-500      | #3b82f6 |
| 成功                   | green-500        | #22c55e |
| 警告                   | amber-500        | #f59e0b |
| エラー                 | red-500          | #ef4444 |

### 8.2 カテゴリバッジ色

| カテゴリ      | 背景色           | テキスト色      |
| ------------- | ---------------- | --------------- |
| testing       | bg-green-500/20  | text-green-400  |
| design        | bg-blue-500/20   | text-blue-400   |
| development   | bg-purple-500/20 | text-purple-400 |
| documentation | bg-orange-500/20 | text-orange-400 |
| security      | bg-red-500/20    | text-red-400    |
| performance   | bg-yellow-500/20 | text-yellow-400 |
| other         | bg-slate-500/20  | text-slate-400  |

---

## 9. 確認済み

- [x] メインレイアウト構造が定義されている
- [x] SkillCardデザインが詳細化されている
- [x] SkillDetailPanelデザインが詳細化されている
- [x] SkillImportDialogデザインが詳細化されている
- [x] レスポンシブブレイクポイントが定義されている
- [x] アニメーション仕様が定義されている
- [x] カラーパレットがデザインシステムに準拠している
