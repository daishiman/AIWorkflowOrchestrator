# Phase 5: 実装（TDD-Green）

## メタ情報

| 項目      | 内容                  |
| --------- | --------------------- |
| Phase     | 5                     |
| 名称      | 実装（TDD-Green）     |
| タスクID  | TASK-3-2-A            |
| Issue番号 | #520                  |
| 前提Phase | Phase 4（テスト作成） |
| 次Phase   | Phase 6（テスト拡充） |

---

## 1. 目的

Phase 4で作成したテストをPASSさせるため、R1〜R3の改善機能を実装する（TDD Green Phase）。

---

## 2. タスク

### Task 5-1: R1 ローディングスピナー実装

**対象ファイル**: `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

**実装手順**:

| Step | 作業内容                             |
| ---- | ------------------------------------ |
| 1    | stream-header内にスピナー要素を追加  |
| 2    | status === "running"の条件で表示制御 |
| 3    | Tailwind CSSクラス適用               |
| 4    | アクセシビリティ属性追加             |

**実装コード例**:

```tsx
{
  /* ヘッダー: 実行状態表示 */
}
<div className="stream-header flex items-center gap-2 p-2 border-b">
  <span className={`status-badge status-${status} px-2 py-1 rounded text-sm`}>
    {getStatusText(status)}
  </span>
  {status === "running" && (
    <span
      className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"
      role="status"
      aria-label="実行中"
    />
  )}
  {/* 既存のabort/resetボタン */}
</div>;
```

**完了条件**:

| ID  | 条件                       |
| --- | -------------------------- |
| 1   | TC-R1-1〜TC-R1-6が全てPASS |
| 2   | 既存テストが全てPASS       |

---

### Task 5-2: R2 タイムスタンプ実装

**対象ファイル**:

- `apps/desktop/src/renderer/utils/formatTime.ts`（新規）
- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

**Step 1: formatRelativeTime関数作成**

```typescript
// apps/desktop/src/renderer/utils/formatTime.ts

/**
 * タイムスタンプを相対時刻文字列に変換
 * @param timestamp - UNIXタイムスタンプ（ミリ秒）
 * @returns 相対時刻文字列（例: "30秒前", "5分前"）
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds}秒前`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}
```

**Step 2: MessageItemにタイムスタンプ追加**

```tsx
const MessageItem = React.memo(function MessageItem({
  message,
}: {
  message: SkillStreamMessage;
}) {
  // ... 既存のロジック

  return (
    <div
      className={`message-item ${getMessageClassName()} flex justify-between items-start`}
    >
      <span className="message-content">{message.content}</span>
      <span className="message-timestamp text-xs text-gray-400 flex-shrink-0 ml-2">
        {formatRelativeTime(message.timestamp)}
      </span>
    </div>
  );
});
```

**完了条件**:

| ID  | 条件                       |
| --- | -------------------------- |
| 1   | TC-R2-1〜TC-R2-8が全てPASS |
| 2   | 既存テストが全てPASS       |

---

### Task 5-3: R3 クリップボードコピー実装

**対象ファイル**: `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

**Step 1: コピー状態管理追加**

```tsx
const MessageItem = React.memo(function MessageItem({
  message,
}: {
  message: SkillStreamMessage;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  // ...
});
```

**Step 2: コピーボタンUI追加**

```tsx
return (
  <div
    className={`message-item ${getMessageClassName()} group flex justify-between items-start`}
  >
    <span className="message-content flex-1">{message.content}</span>
    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
      <span className="message-timestamp text-xs text-gray-400">
        {formatRelativeTime(message.timestamp)}
      </span>
      <button
        onClick={handleCopy}
        className="copy-button opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
        aria-label="メッセージをコピー"
      >
        {/* クリップボードアイコン (SVG) */}
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>
      {copied && (
        <span
          className="copy-feedback text-xs text-green-500"
          role="status"
          aria-live="polite"
        >
          コピーしました
        </span>
      )}
    </div>
  </div>
);
```

**完了条件**:

| ID  | 条件                       |
| --- | -------------------------- |
| 1   | TC-R3-1〜TC-R3-7が全てPASS |
| 2   | 既存テストが全てPASS       |

---

### Task 5-4: 統合確認

**確認項目**:

| ID  | 項目                                 | 確認方法         |
| --- | ------------------------------------ | ---------------- |
| 1   | R1〜R3の全機能が正常動作             | 手動確認         |
| 2   | 既存機能（abort, reset等）に影響なし | テスト実行       |
| 3   | 全テスト（既存+新規）がPASS          | `pnpm test`      |
| 4   | TypeScript型エラーなし               | `pnpm typecheck` |
| 5   | ESLintエラーなし                     | `pnpm lint`      |

---

## 3. 完了条件

| ID  | 条件                            | 確認方法       |
| --- | ------------------------------- | -------------- |
| 1   | R1〜R3の全実装が完了している    | コードレビュー |
| 2   | Phase 4で作成した全テストがPASS | テスト実行     |
| 3   | 既存テスト（776行）が全てPASS   | テスト実行     |
| 4   | TypeScript型エラーなし          | tsc実行        |
| 5   | ESLintエラーなし                | lint実行       |

---

## 4. 成果物

| 成果物                   | パス                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| 改善済みコンポーネント   | apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx |
| formatTimeユーティリティ | apps/desktop/src/renderer/utils/formatTime.ts                         |
| 実装サマリー             | outputs/phase-05/implementation-summary.md                            |

---

## 5. コマンド

```bash
# テスト実行
pnpm --filter @repo/desktop test SkillStreamDisplay

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# 全テスト
pnpm --filter @repo/desktop test
```

---

## 6. システム観点チェック

### フロントエンド（Renderer）実装観点

| 観点               | 確認事項                       | 関連仕様                 |
| ------------------ | ------------------------------ | ------------------------ |
| ファイル配置       | コンポーネントはAgentView/配下 | ui-ux-components.md      |
| ユーティリティ配置 | utils/配下に配置               | architecture-patterns.md |
| 命名規則           | キャメルケース、適切な関数名   | コーディング規約         |
| 型安全性           | 明示的な型定義、any禁止        | TypeScript規約           |

### バックエンド（Main）

このタスクはMain Processの変更なし。

### IPC通信

このタスクはIPC通信の変更なし。

---

## 7. 参考資料

| 資料               | パス/URL                                                              |
| ------------------ | --------------------------------------------------------------------- |
| 既存実装           | apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx |
| Phase 4テスト設計  | phase-04-test-creation.md                                             |
| Tailwind Animation | https://tailwindcss.com/docs/animation                                |
| Clipboard API      | https://developer.mozilla.org/en-US/docs/Web/API/Clipboard            |
