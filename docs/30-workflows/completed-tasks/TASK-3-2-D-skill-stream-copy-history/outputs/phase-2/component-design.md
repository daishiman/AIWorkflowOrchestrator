# コンポーネント設計書

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-3-2-D                        |
| 機能名     | SkillStreamDisplay コピー履歴機能 |
| Phase      | 2                                 |
| 作成日     | 2026-01-28                        |
| ステータス | 確定                              |

---

## 1. コンポーネント階層

### 1.1 全体構造

```
App
└── CopyHistoryProvider  ← 新規作成
    └── AgentView
        └── SkillStreamDisplay  ← 既存更新
            ├── StreamHeader
            │   └── CopyHistoryToggle  ← 新規作成（履歴ボタン）
            ├── StreamContent
            │   └── MessageItem  ← 既存更新
            │       └── CopyButton  ← 既存更新（Context連携追加）
            └── CopyHistoryPanel  ← 新規作成（ポップオーバー）
                ├── CopyHistoryHeader
                ├── CopyHistoryList
                │   └── CopyHistoryItem (複数)
                └── CopyHistoryActions
```

### 1.2 コンポーネント一覧

| コンポーネント      | 種類     | 状態 | 責務                           |
| ------------------- | -------- | ---- | ------------------------------ |
| CopyHistoryProvider | provider | 新規 | 履歴状態のグローバル提供       |
| CopyHistoryToggle   | atom     | 新規 | 履歴パネル開閉トグルボタン     |
| CopyHistoryPanel    | organism | 新規 | 履歴一覧表示パネル             |
| CopyHistoryHeader   | atom     | 新規 | パネルヘッダー（件数・閉じる） |
| CopyHistoryList     | molecule | 新規 | 履歴項目リスト                 |
| CopyHistoryItem     | molecule | 新規 | 単一履歴項目                   |
| CopyHistoryActions  | molecule | 新規 | 一括コピー・クリアボタン       |
| CopyButton          | atom     | 更新 | Context連携追加                |
| SkillStreamDisplay  | organism | 更新 | 履歴トグル・パネル統合         |

---

## 2. 新規コンポーネント仕様

### 2.1 CopyHistoryProvider

| 項目     | 仕様                                                        |
| -------- | ----------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx` |
| 責務     | CopyHistoryContext の提供                                   |
| 配置位置 | App.tsx または AgentView の上位                             |
| children | React.ReactNode                                             |

### 2.2 CopyHistoryToggle

| 項目     | 仕様                                                                  |
| -------- | --------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` |
| 責務     | 履歴パネルの開閉トグル                                                |
| 配置位置 | StreamHeader 内                                                       |
| Props    | `isOpen: boolean`, `onToggle: () => void`, `historyCount: number`     |
| ARIA     | `aria-label="コピー履歴を開く"`, `aria-expanded`                      |

**表示仕様**

| 要素     | 内容                                    |
| -------- | --------------------------------------- |
| アイコン | クリップボードアイコン + バッジ（件数） |
| バッジ   | 履歴が1件以上ある場合のみ表示           |
| スタイル | `hover:bg-gray-100 rounded p-1`         |

### 2.3 CopyHistoryPanel

| 項目     | 仕様                                                                  |
| -------- | --------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` |
| 責務     | 履歴一覧表示、再コピー、複数選択、クリア                              |
| 表示形式 | ポップオーバー（absolute positioning）                                |
| Props    | `isOpen: boolean`, `onClose: () => void`, `className?: string`        |
| ARIA     | `role="dialog"`, `aria-label="コピー履歴"`, `aria-modal="true"`       |

**キーボード操作**

| キー      | 動作                 |
| --------- | -------------------- |
| Escape    | パネルを閉じる       |
| Tab       | フォーカス移動       |
| ArrowUp   | 前の項目にフォーカス |
| ArrowDown | 次の項目にフォーカス |

### 2.4 CopyHistoryHeader

| 項目  | 仕様                                   |
| ----- | -------------------------------------- |
| 責務  | パネルタイトル、件数表示、閉じるボタン |
| Props | `count: number`, `onClose: () => void` |

### 2.5 CopyHistoryList

| 項目     | 仕様                                            |
| -------- | ----------------------------------------------- |
| 責務     | 履歴項目のリスト表示、スクロール管理            |
| Props    | `items: CopyHistoryEntry[]`                     |
| ARIA     | `role="listbox"`, `aria-multiselectable="true"` |
| スタイル | `max-h-64 overflow-y-auto`                      |

### 2.6 CopyHistoryItem

| 項目  | 仕様                                                                  |
| ----- | --------------------------------------------------------------------- |
| 責務  | 単一履歴項目の表示（チェックボックス、プレビュー、再コピーボタン）    |
| Props | `item: CopyHistoryEntry`, `isSelected: boolean`, `onToggle`, `onCopy` |
| ARIA  | `role="option"`, `aria-selected`                                      |

**表示仕様**

| 要素             | 内容                              |
| ---------------- | --------------------------------- |
| チェックボックス | 複数選択用                        |
| プレビュー       | 最初の100文字、超過時は「...」    |
| タイムスタンプ   | formatRelativeTime による相対時刻 |
| 再コピーボタン   | クリップボードアイコン            |

### 2.7 CopyHistoryActions

| 項目  | 仕様                                         |
| ----- | -------------------------------------------- |
| 責務  | 一括コピー、クリア操作                       |
| Props | `selectedCount: number`, `hasItems: boolean` |

**ボタン仕様**

| ボタン       | 状態                       | aria-label         |
| ------------ | -------------------------- | ------------------ |
| 選択をコピー | selectedCount > 0 で有効化 | "選択項目をコピー" |
| クリア       | hasItems で有効化          | "履歴をクリア"     |

---

## 3. 既存コンポーネント更新

### 3.1 CopyButton 更新

| 変更点      | 内容                                                    |
| ----------- | ------------------------------------------------------- |
| Context連携 | `useCopyHistory` フックを使用し、コピー時に履歴へ追加   |
| Props追加   | `sourceMessageId?: string` （履歴のトレーサビリティ用） |

**更新後のフロー**

1. ユーザーがCopyButtonをクリック
2. `navigator.clipboard.writeText(content)` 実行
3. `addToHistory(content, sourceMessageId)` 呼び出し
4. フィードバック表示（既存動作維持）

### 3.2 SkillStreamDisplay 更新

| 変更点           | 内容                                          |
| ---------------- | --------------------------------------------- |
| State追加        | `isHistoryPanelOpen: boolean`                 |
| StreamHeader更新 | `CopyHistoryToggle` を追加                    |
| パネル追加       | `CopyHistoryPanel` をポップオーバーとして配置 |

---

## 4. ファイル配置

### 4.1 新規ファイル

| ファイル               | パス                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| CopyHistoryContext.tsx | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx`           |
| useCopyHistory.ts      | `apps/desktop/src/renderer/hooks/useCopyHistory.ts`                   |
| CopyHistoryPanel.tsx   | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` |

### 4.2 更新ファイル

| ファイル               | パス                                                                    | 変更内容     |
| ---------------------- | ----------------------------------------------------------------------- | ------------ |
| SkillStreamDisplay.tsx | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | 履歴機能統合 |

---

## 5. 依存関係図

```
CopyHistoryContext
    ↓ (provides)
useCopyHistory
    ↓ (uses)
┌───────────────────────┬─────────────────────┐
│                       │                     │
CopyButton              CopyHistoryPanel
(履歴追加)              (履歴表示・操作)
    │                       │
    └───────────────────────┘
            ↓
    SkillStreamDisplay (統合)
```

---

## 6. 要件との対応

| 要件ID | 要件                   | 対応コンポーネント |
| ------ | ---------------------- | ------------------ |
| FR-01  | コピー履歴パネル表示   | CopyHistoryPanel   |
| FR-02  | 履歴項目からの再コピー | CopyHistoryItem    |
| FR-03  | 複数選択一括コピー     | CopyHistoryActions |
| FR-04  | 履歴クリア             | CopyHistoryActions |
| FR-05  | 最大50件管理           | CopyHistoryContext |
| FR-06  | プレビュー表示         | CopyHistoryItem    |
