# アーキテクチャ設計: Permission要求履歴トラッキングUI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | task-imp-permission-history-001 |
| Phase    | 2                               |
| 作成日   | 2026-01-31                      |

## 全体構成

```
Renderer Process
├── Store Layer
│   ├── permissionHistorySlice.ts    (新規: 独立Slice + persist)
│   └── skillSlice.ts               (既存: respondToSkillPermission変更)
│
├── Data Model Layer
│   └── permissionHistory.ts         (新規: 型定義・ユーティリティ)
│
├── UI Layer
│   └── PermissionSettings/
│       ├── index.tsx                (既存: HistoryPanel統合)
│       ├── PermissionHistoryPanel.tsx  (新規)
│       ├── PermissionHistoryFilter.tsx (新規)
│       └── PermissionHistoryItem.tsx   (新規)
│
└── AppStore (index.ts)
    └── permissionHistorySlice追加
```

## 1. データモデル設計

### ファイル: `apps/desktop/src/renderer/components/skill/permissionHistory.ts`

```typescript
export type PermissionDecision = "approved" | "denied" | "approved_once";

export interface PermissionHistoryEntry {
  id: string; // crypto.randomUUID()
  timestamp: string; // ISO8601
  toolName: string; // Bash, Read, Write等
  argsSnapshot: string; // safeArgsSnapshot()で安全化
  decision: PermissionDecision;
  sessionId?: string; // agentSliceのセッションID
}

export interface PermissionHistoryFilter {
  toolName?: string; // undefinedで全件
  decision?: PermissionDecision; // undefinedで全件
}

export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;
export const ARGS_SNAPSHOT_MAX_LENGTH = 200;
```

### ヘルパー関数

```typescript
// 引数を安全な要約テキストに変換
export function safeArgsSnapshot(args: Record<string, unknown>): string;

// 履歴エントリを作成
export function createHistoryEntry(params: {
  toolName: string;
  args: Record<string, unknown>;
  decision: PermissionDecision;
  sessionId?: string;
}): PermissionHistoryEntry;
```

## 2. 状態管理設計（Zustand Store）

### ファイル: `apps/desktop/src/renderer/store/slices/permissionHistorySlice.ts`

```typescript
export interface PermissionHistorySlice {
  // State
  permissionHistory: PermissionHistoryEntry[];
  historyFilter: PermissionHistoryFilter;

  // Actions
  addHistoryEntry: (
    entry: Omit<PermissionHistoryEntry, "id" | "timestamp">,
  ) => void;
  clearHistory: () => void;
  setHistoryFilter: (filter: PermissionHistoryFilter) => void;
}
```

### 永続化設計

- **独立persist**: メインAppStoreの`partialize`に依存せず、Slice内で独自に永続化
- ただし実装上の簡略化のため、AppStoreの`partialize`に`permissionHistory`フィールドを追加する
- `name`: `knowledge-studio-store`（既存と同じ）
- `partialize`追加: `permissionHistory`のみ（`historyFilter`は非永続化）
- `addHistoryEntry`内で`PERMISSION_HISTORY_MAX_ENTRIES`超過時、末尾（最古）を削除

### AppStore統合

`apps/desktop/src/renderer/store/index.ts`に以下を追加:

- `import { createPermissionHistorySlice, PermissionHistorySlice }`
- `AppStore`型に`PermissionHistorySlice`を追加
- `create`内に`...createPermissionHistorySlice(...args)`追加
- `partialize`に`permissionHistory: state.permissionHistory`追加

## 3. UIコンポーネント設計

### PermissionHistoryPanel

| プロパティ | 型      | 説明         |
| ---------- | ------- | ------------ |
| className  | string? | スタイル注入 |

構成:

- ヘッダー: タイトル + 件数 + クリアボタン
- フィルタ: PermissionHistoryFilter
- リスト: 仮想スクロール対応リスト
- 空状態: メッセージ表示

### PermissionHistoryFilter

| プロパティ     | 型                                        | 説明             |
| -------------- | ----------------------------------------- | ---------------- |
| filter         | PermissionHistoryFilter                   | フィルタ状態     |
| onFilterChange | (filter: PermissionHistoryFilter) => void | 変更コールバック |
| availableTools | string[]                                  | ツール名一覧     |

### PermissionHistoryItem

| プロパティ | 型                     | 説明     |
| ---------- | ---------------------- | -------- |
| entry      | PermissionHistoryEntry | エントリ |

表示内容:

- タイムスタンプ: 相対時間（ホバーで絶対時間）
- ツール名: emojiアイコン + 名前
- 判断結果バッジ: approved=green, denied=red, approved_once=yellow
- 引数要約テキスト

## 4. 自動記録トリガー設計

`skillSlice.ts`の`respondToSkillPermission`内で記録:

```
respondToSkillPermission(approved, remember)
  ↓
pendingPermissionからtoolName, argsを取得
  ↓
decision判定: !approved → 'denied' : remember → 'approved' : 'approved_once'
  ↓
addHistoryEntry({ toolName, argsSnapshot, decision, sessionId })
  ↓
既存処理（IPC送信、pendingPermission=null）
```

## 5. 仮想スクロール設計

- パッケージ: `@tanstack/react-virtual`
- `useVirtualizer`設定:
  - `count`: フィルタ適用後のエントリ数
  - `getScrollElement`: スクロールコンテナref
  - `estimateSize`: `() => 72`（各エントリ72px）
  - `overscan`: 5
- DOM要素数: 表示領域分 + overscan 5件のみ

## 6. フィルタリング設計

- `useMemo`でフィルタ適用後のエントリリストを計算
- `useMemo`でユニークツール名リストを計算
- フィルタはクライアントサイドで完結（1000件以下のため十分高速）
