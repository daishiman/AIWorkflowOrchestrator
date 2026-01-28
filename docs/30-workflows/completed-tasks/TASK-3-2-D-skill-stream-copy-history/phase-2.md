# Phase 2: 設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | TASK-3-2-D-skill-stream-copy-history |
| 作成日 | 2026-01-28                           |

## 目的

要件を実現可能な構造に落とし込む。コピー履歴機能のUI設計、状態管理設計、コンポーネント設計を行う。

## 実行タスク

- コンポーネント設計: CopyHistoryPanel、CopyHistoryContextの設計
- 状態管理設計: Context API を使用した履歴状態管理
- UI設計: ポップオーバーパネルのUI/UX設計

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                            | 内容                   |
| ----------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| UI/UX機能コンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillStreamDisplay仕様 |
| UI/UXデザイン原則       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | デザインパターン       |
| インターフェース定義    | `.claude/skills/aiworkflow-requirements/references/interfaces-types.md`         | 型定義                 |

## 実行手順

### ステップ1: コンポーネント設計

#### コンポーネント階層

| コンポーネント      | 種類     | 親                     | 子要素                                       |
| ------------------- | -------- | ---------------------- | -------------------------------------------- |
| CopyHistoryProvider | provider | App（またはAgentView） | 子コンポーネント全体                         |
| CopyButton          | molecule | MessageItem            | (既存) + CopyHistoryToggle                   |
| CopyHistoryToggle   | atom     | CopyButton             | アイコンボタン                               |
| CopyHistoryPanel    | organism | SkillStreamDisplay     | CopyHistoryItem, CopyHistoryActions          |
| CopyHistoryItem     | molecule | CopyHistoryPanel       | チェックボックス、プレビュー、再コピーボタン |
| CopyHistoryActions  | molecule | CopyHistoryPanel       | 一括コピーボタン、クリアボタン               |

#### CopyHistoryPanel 仕様

| 項目     | 仕様                                                                  |
| -------- | --------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` |
| 責務     | 履歴一覧表示、再コピー、複数選択、クリア                              |
| 表示条件 | CopyHistoryToggle クリック時にポップオーバー表示                      |
| Props    | `onClose: () => void`, `className?: string`                           |

#### CopyHistoryItem 仕様

| 項目  | 仕様                                                                                          |
| ----- | --------------------------------------------------------------------------------------------- |
| 責務  | 単一履歴項目の表示                                                                            |
| Props | `item: CopyHistoryEntry`, `isSelected: boolean`, `onSelect: () => void`, `onCopy: () => void` |

### ステップ2: 状態管理設計

#### CopyHistoryContext 設計

```typescript
// 型定義
interface CopyHistoryEntry {
  id: string; // ユニークID（uuid）
  content: string; // コピーした内容
  timestamp: number; // コピー日時（UNIXミリ秒）
  sourceMessageId?: string; // 元メッセージID（オプション）
}

interface CopyHistoryContextValue {
  // State
  history: CopyHistoryEntry[];
  selectedIds: Set<string>;

  // Actions
  addToHistory: (content: string, sourceMessageId?: string) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  copyFromHistory: (id: string) => Promise<void>;
  copySelectedItems: () => Promise<void>;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}
```

#### 状態遷移

| アクション        | 状態変化                                     |
| ----------------- | -------------------------------------------- |
| addToHistory      | 先頭に追加、50件超過時は最古を削除           |
| removeFromHistory | 指定IDの項目を削除                           |
| clearHistory      | 全履歴削除、選択状態もリセット               |
| copyFromHistory   | クリップボードにコピー（状態変化なし）       |
| copySelectedItems | 選択項目を結合してコピー、選択状態をリセット |
| toggleSelection   | 選択状態をトグル                             |
| clearSelection    | 全選択解除                                   |

### ステップ3: UI設計

#### ポップオーバーパネルレイアウト

```
┌─────────────────────────────────────┐
│ コピー履歴 (N件)          [×]      │ ← ヘッダー
├─────────────────────────────────────┤
│ [□] テキストプレビュー...  [📋]    │ ← 履歴項目
│ [□] テキストプレビュー...  [📋]    │
│ [□] テキストプレビュー...  [📋]    │
│ ... (最大50件、スクロール可能)      │
├─────────────────────────────────────┤
│ [選択をコピー(N件)]   [クリア]     │ ← アクションバー
└─────────────────────────────────────┘
```

#### スタイル仕様

| 要素           | スタイル                                                         |
| -------------- | ---------------------------------------------------------------- |
| パネル         | `bg-white dark:bg-gray-800 shadow-lg rounded-lg w-80`            |
| ヘッダー       | `border-b p-2 flex justify-between items-center`                 |
| 履歴リスト     | `max-h-64 overflow-y-auto`                                       |
| 履歴項目       | `p-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center` |
| プレビュー     | `text-sm text-gray-600 truncate max-w-48`                        |
| アクションバー | `border-t p-2 flex justify-between`                              |

#### アクセシビリティ設計

| 要素             | ARIA属性                                        |
| ---------------- | ----------------------------------------------- |
| パネル           | `role="dialog"`, `aria-label="コピー履歴"`      |
| 履歴リスト       | `role="listbox"`, `aria-multiselectable="true"` |
| 履歴項目         | `role="option"`, `aria-selected`                |
| チェックボックス | `role="checkbox"`, `aria-checked`               |
| 閉じるボタン     | `aria-label="パネルを閉じる"`                   |

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント       | 契約定義                                                    |
| ------------------ | ----------------------------------------------------------- |
| CopyButton連携     | `onCopy` コールバックで `addToHistory` を呼び出し           |
| Clipboard API      | `navigator.clipboard.writeText(content)` の Promise 処理    |
| SkillStreamDisplay | CopyHistoryToggle を StreamHeader または MessageItem に配置 |

## アーキテクチャ層別設計（Electronデスクトップアプリ観点）

| 層                         | 設計観点                             | 仕様参照先                  |
| -------------------------- | ------------------------------------ | --------------------------- |
| フロントエンド（Renderer） | Context API、Hooks、UIコンポーネント | ui-ux-feature-components.md |
| IPC通信                    | 本タスクでは不要（Renderer内で完結） | -                           |
| データ                     | セッション内メモリ保持のみ           | -                           |

## 成果物

| 成果物             | パス                                  | 説明                 |
| ------------------ | ------------------------------------- | -------------------- |
| コンポーネント設計 | `outputs/phase-2/component-design.md` | コンポーネント階層   |
| 状態管理設計       | `outputs/phase-2/state-management.md` | Context設計          |
| UI設計             | `outputs/phase-2/ui-design.md`        | レイアウト・スタイル |

## 完了条件

- [ ] コンポーネント階層が定義されている
- [ ] CopyHistoryContext の型定義が完了している
- [ ] 状態遷移が明確に定義されている
- [ ] UI レイアウトが設計されている
- [ ] アクセシビリティ設計が完了している
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. コンポーネント設計の実施
3. 状態管理設計の実施
4. UI設計の実施
5. 成果物の作成・配置
6. 完了条件の検証

## 次のPhase

Phase 3: 設計レビューゲート
