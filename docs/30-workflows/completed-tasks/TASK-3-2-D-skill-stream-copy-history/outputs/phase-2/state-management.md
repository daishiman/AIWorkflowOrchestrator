# 状態管理設計書

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-3-2-D                        |
| 機能名     | SkillStreamDisplay コピー履歴機能 |
| Phase      | 2                                 |
| 作成日     | 2026-01-28                        |
| ステータス | 確定                              |

---

## 1. 状態管理方式

### 1.1 採用方式

| 項目     | 選択                          | 理由                           |
| -------- | ----------------------------- | ------------------------------ |
| 状態管理 | React Context API             | 軽量、Renderer内で完結         |
| 永続化   | なし（セッション内のみ）      | 要件外、将来拡張で対応         |
| スコープ | アプリ全体（またはAgentView） | 複数コンポーネントからアクセス |

### 1.2 Zustand vs Context API

| 観点           | Zustand            | Context API       | 採用        |
| -------------- | ------------------ | ----------------- | ----------- |
| セットアップ   | パッケージ追加必要 | 標準API           | Context API |
| パフォーマンス | セレクタで最適化   | useMemoで対応可能 | Context API |
| 学習コスト     | 低い               | なし              | Context API |
| 依存           | 外部ライブラリ     | なし              | Context API |
| 今回のスコープ | オーバースペック   | 十分              | Context API |

---

## 2. 型定義

### 2.1 CopyHistoryEntry

```typescript
/**
 * 履歴項目の型定義
 */
interface CopyHistoryEntry {
  /** ユニークID（uuid） */
  id: string;

  /** コピーした内容 */
  content: string;

  /** コピー日時（UNIXミリ秒） */
  timestamp: number;

  /** 元メッセージID（オプション、トレーサビリティ用） */
  sourceMessageId?: string;
}
```

### 2.2 CopyHistoryContextValue

```typescript
/**
 * Context の値の型定義
 */
interface CopyHistoryContextValue {
  // ========== State ==========

  /** 履歴項目配列（新しい順） */
  history: CopyHistoryEntry[];

  /** 選択中の項目ID集合 */
  selectedIds: Set<string>;

  // ========== Computed ==========

  /** 履歴件数 */
  historyCount: number;

  /** 選択件数 */
  selectedCount: number;

  // ========== Actions ==========

  /** 履歴に追加 */
  addToHistory: (content: string, sourceMessageId?: string) => void;

  /** 履歴から削除 */
  removeFromHistory: (id: string) => void;

  /** 全履歴クリア */
  clearHistory: () => void;

  /** 履歴項目をコピー */
  copyFromHistory: (id: string) => Promise<void>;

  /** 選択項目を一括コピー */
  copySelectedItems: () => Promise<void>;

  /** 選択状態をトグル */
  toggleSelection: (id: string) => void;

  /** 全選択解除 */
  clearSelection: () => void;

  /** 全選択 */
  selectAll: () => void;
}
```

---

## 3. 状態遷移

### 3.1 アクション一覧

| アクション        | 入力                      | 状態変化                               |
| ----------------- | ------------------------- | -------------------------------------- |
| addToHistory      | content, sourceMessageId? | 先頭に追加、50件超過時は最古を削除     |
| removeFromHistory | id                        | 指定IDの項目を削除                     |
| clearHistory      | なし                      | 全履歴削除、選択状態もリセット         |
| copyFromHistory   | id                        | クリップボードにコピー（状態変化なし） |
| copySelectedItems | なし                      | 選択項目を結合してコピー、選択リセット |
| toggleSelection   | id                        | 選択状態をトグル                       |
| clearSelection    | なし                      | 全選択解除                             |
| selectAll         | なし                      | 全項目を選択                           |

### 3.2 状態遷移図

```
[初期状態]
  history: []
  selectedIds: Set()
      │
      ▼ addToHistory(content)
[履歴1件]
  history: [entry1]
  selectedIds: Set()
      │
      ├── toggleSelection(entry1.id) ──▶ selectedIds: Set(entry1.id)
      │
      ├── addToHistory(content2) ──▶ history: [entry2, entry1]
      │
      └── clearHistory() ──▶ history: [], selectedIds: Set()

[履歴50件]
  history: [entry50, ..., entry1]
      │
      ▼ addToHistory(content51)
[履歴50件（最古削除）]
  history: [entry51, entry50, ..., entry2]
  // entry1 が削除される
```

### 3.3 addToHistory 処理フロー

```
addToHistory(content, sourceMessageId?)
    │
    ▼
1. 新しいエントリを作成
   entry = {
     id: crypto.randomUUID(),
     content,
     timestamp: Date.now(),
     sourceMessageId
   }
    │
    ▼
2. 先頭に追加
   newHistory = [entry, ...history]
    │
    ▼
3. 件数チェック（50件超過時）
   if (newHistory.length > MAX_HISTORY_SIZE) {
     newHistory = newHistory.slice(0, MAX_HISTORY_SIZE)
   }
    │
    ▼
4. 状態更新
   setHistory(newHistory)
```

### 3.4 copySelectedItems 処理フロー

```
copySelectedItems()
    │
    ▼
1. 選択項目を取得（選択順を維持）
   selectedItems = history.filter(item => selectedIds.has(item.id))
    │
    ▼
2. 内容を改行で結合
   combinedContent = selectedItems.map(item => item.content).join('\n')
    │
    ▼
3. クリップボードにコピー
   await navigator.clipboard.writeText(combinedContent)
    │
    ▼
4. 選択状態をリセット
   clearSelection()
```

---

## 4. Context 実装設計

### 4.1 ファイル構成

| ファイル               | 内容                          |
| ---------------------- | ----------------------------- |
| CopyHistoryContext.tsx | Context定義、Provider、型定義 |
| useCopyHistory.ts      | コンシューマ用フック          |

### 4.2 CopyHistoryContext.tsx 構造

```typescript
// 1. 型定義（上記参照）

// 2. デフォルト値
const defaultValue: CopyHistoryContextValue = {
  history: [],
  selectedIds: new Set(),
  historyCount: 0,
  selectedCount: 0,
  addToHistory: () => {},
  removeFromHistory: () => {},
  clearHistory: () => {},
  copyFromHistory: async () => {},
  copySelectedItems: async () => {},
  toggleSelection: () => {},
  clearSelection: () => {},
  selectAll: () => {},
};

// 3. Context作成
const CopyHistoryContext = createContext<CopyHistoryContextValue>(defaultValue);

// 4. Provider コンポーネント
function CopyHistoryProvider({ children }: { children: React.ReactNode }) {
  // State
  const [history, setHistory] = useState<CopyHistoryEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Actions（useCallback でメモ化）
  const addToHistory = useCallback(...);
  const removeFromHistory = useCallback(...);
  // ... 他のアクション

  // Context値（useMemo でメモ化）
  const value = useMemo(() => ({
    history,
    selectedIds,
    historyCount: history.length,
    selectedCount: selectedIds.size,
    addToHistory,
    removeFromHistory,
    clearHistory,
    copyFromHistory,
    copySelectedItems,
    toggleSelection,
    clearSelection,
    selectAll,
  }), [history, selectedIds, ...]);

  return (
    <CopyHistoryContext.Provider value={value}>
      {children}
    </CopyHistoryContext.Provider>
  );
}

// 5. エクスポート
export { CopyHistoryContext, CopyHistoryProvider };
export type { CopyHistoryEntry, CopyHistoryContextValue };
```

### 4.3 useCopyHistory.ts 構造

```typescript
import { useContext } from "react";
import { CopyHistoryContext } from "../contexts/CopyHistoryContext";

/**
 * コピー履歴機能を使用するためのフック
 *
 * @throws Context外で使用された場合にエラー
 */
export function useCopyHistory() {
  const context = useContext(CopyHistoryContext);

  if (!context) {
    throw new Error("useCopyHistory must be used within CopyHistoryProvider");
  }

  return context;
}
```

---

## 5. 定数定義

| 定数名           | 値   | 説明                         |
| ---------------- | ---- | ---------------------------- |
| MAX_HISTORY_SIZE | 50   | 最大履歴件数                 |
| PREVIEW_LENGTH   | 100  | プレビュー表示文字数         |
| COPY_FEEDBACK_MS | 2000 | コピーフィードバック表示時間 |

---

## 6. パフォーマンス考慮

### 6.1 再レンダリング最適化

| 手法        | 適用箇所        | 効果                     |
| ----------- | --------------- | ------------------------ |
| useMemo     | Context value   | 不要な再レンダリング防止 |
| useCallback | アクション関数  | 参照安定性確保           |
| React.memo  | CopyHistoryItem | 項目単位の最適化         |

### 6.2 選択状態の管理

```typescript
// Set を使用することで O(1) でのルックアップを実現
selectedIds: Set<string>;

// 選択状態のトグル
toggleSelection = (id: string) => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
};
```

---

## 7. 要件との対応

| NFR-ID | 要件                         | 対応設計                          |
| ------ | ---------------------------- | --------------------------------- |
| NFR-04 | 履歴追加時のUI遅延100ms以下  | useCallback, useMemo による最適化 |
| NFR-05 | メモリ使用量抑制（50件上限） | MAX_HISTORY_SIZE 定数で制限       |
