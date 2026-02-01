# 実装ガイド: Permission履歴トラッキングUI

## Part 1: やさしい解説（初学者向け）

### これは何？

アプリの中で、AIが何かの作業をしようとするとき「この作業をしてもいいですか？」と聞いてきます。
ユーザーが「いいよ」「ダメ」と答えるたびに、その記録が残る仕組みです。

**身近な例えで言うと...**

図書館の貸出記録を思い浮かべてください。

- いつ（日時）
- 誰が（どのツール）
- 何を借りた/借りなかった（引数と判断結果）

これと同じように、AIツールの許可記録を一覧で見られるようにしました。

### なぜ必要？

1. **透明性**: AIが何をしたか、何を拒否されたか一目でわかる
2. **セキュリティ**: 不審な操作がなかったか確認できる
3. **学習**: どんなツールがよく使われているか把握できる

### どう使う？

1. 設定画面を開く
2. 「権限要求履歴」セクションまでスクロール
3. 履歴が一覧で表示される
4. ツール名や結果でフィルタできる
5. 不要になったら「クリア」ボタンで消せる

---

## Part 2: 技術的詳細（開発者向け）

### データモデル

```typescript
// src/renderer/components/skill/permissionHistory.ts

type PermissionDecision = "approved" | "denied" | "approved_once";

interface PermissionHistoryEntry {
  id: string; // crypto.randomUUID()
  timestamp: string; // ISO8601形式
  toolName: string; // "Bash", "Read", "Write"等
  argsSnapshot: string; // 安全化済み引数要約（200文字制限）
  decision: PermissionDecision;
  sessionId?: string; // セッションID（任意）
}

interface PermissionHistoryFilter {
  toolName?: string;
  decision?: PermissionDecision;
}
```

### Store API (permissionHistorySlice)

```typescript
// src/renderer/store/slices/permissionHistorySlice.ts

interface PermissionHistorySlice {
  // 状態
  permissionHistory: PermissionHistoryEntry[]; // 最新が先頭、最大1000件
  historyFilter: PermissionHistoryFilter; // フィルタ条件（非永続化）

  // アクション
  addHistoryEntry: (
    entry: Omit<PermissionHistoryEntry, "id" | "timestamp">,
  ) => void;
  clearHistory: () => void;
  setHistoryFilter: (filter: PermissionHistoryFilter) => void;
}
```

### コンポーネント構成

```
PermissionSettings/index.tsx
  └── PermissionHistoryPanel.tsx    ... 履歴パネル全体・仮想スクロール管理
        ├── PermissionHistoryFilter.tsx  ... ツール名・判断結果フィルタUI
        └── PermissionHistoryItem.tsx    ... 個別エントリ表示
```

### 使用例

```tsx
// PermissionSettings/index.tsxに統合済み
import { PermissionHistoryPanel } from "./PermissionHistoryPanel";

export function PermissionSettings() {
  return (
    <div>
      {/* 既存のAllowed Tools UI */}
      <PermissionHistoryPanel />
    </div>
  );
}
```

### 自動記録の仕組み

`skillSlice.ts`の`respondToSkillPermission`内で自動記録:

```typescript
respondToSkillPermission: (approved, remember = false) => {
  const { pendingPermission } = get();
  if (pendingPermission) {
    const decision = !approved
      ? "denied"
      : remember
        ? "approved"
        : "approved_once";
    const entry = createHistoryEntry({
      toolName: pendingPermission.toolName,
      args: pendingPermission.args,
      decision,
    });
    (get() as unknown as PermissionHistorySlice).addHistoryEntry(entry);
    // ... IPC送信
  }
};
```

### セキュリティ: safeArgsSnapshot()

```typescript
function safeArgsSnapshot(args: Record<string, unknown>): string {
  let text = JSON.stringify(args); // 1. JSON化
  text = text.replace(/<[^>]*>/g, ""); // 2. HTMLタグ除去（XSS防止）
  text = text.replace(/[\x00-\x1f\x7f]/g, ""); // 3. 制御文字除去
  if (text.length > 200) {
    text = text.slice(0, 200) + "..."; // 4. 200文字制限
  }
  return text;
}
```

### パラメータ一覧

| パラメータ                     | 値    | 場所                       |
| ------------------------------ | ----- | -------------------------- |
| PERMISSION_HISTORY_MAX_ENTRIES | 1000  | permissionHistory.ts       |
| ARGS_SNAPSHOT_MAX_LENGTH       | 200   | permissionHistory.ts       |
| estimateSize                   | 72px  | PermissionHistoryPanel.tsx |
| overscan                       | 5     | PermissionHistoryPanel.tsx |
| maxHeight (リスト)             | 400px | PermissionHistoryPanel.tsx |

### 永続化

Zustand `persist` middlewareの`partialize`設定で`permissionHistory`をlocalStorageに保存:

```typescript
partialize: (state) => ({
  // ...既存フィールド
  permissionHistory: state.permissionHistory,
});
```

ストレージキー: `knowledge-studio-store`

### エラーハンドリング

| エラーケース                   | 対処                                |
| ------------------------------ | ----------------------------------- |
| JSON.stringify失敗（循環参照） | catch → "{}" を返す                 |
| localStorage容量超過           | Zustand persist内部のフォールバック |
| 不正なJSON復元                 | Zustand persist内部のフォールバック |
| 1000件超過                     | addHistoryEntry内で自動切り捨て     |
