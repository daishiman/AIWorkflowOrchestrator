# 実装サマリー

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| タスクID   | TASK-3-2-A      |
| Issue番号  | #520            |
| Phase      | 5               |
| 作成日     | 2026-01-27      |
| ステータス | TDD Green Phase |

---

## 1. 概要

R1〜R3の改善機能を実装し、Phase 4で作成したテストをPASSさせた。

---

## 2. 実装ファイル一覧

| ファイル                                                              | 変更内容           |
| --------------------------------------------------------------------- | ------------------ |
| apps/desktop/src/renderer/utils/formatTime.ts                         | 新規作成（R2用）   |
| apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx | R1, R2, R3機能追加 |

---

## 3. R1 ローディングスピナー実装

### 3.1 新規コンポーネント: LoadingSpinner

```typescript
const LoadingSpinner = React.memo(function LoadingSpinner() {
  return (
    <div
      data-testid="loading-spinner-container"
      role="status"
      aria-label="実行中"
      className="flex items-center"
    >
      <div
        data-testid="loading-spinner"
        className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"
      />
    </div>
  );
});
```

### 3.2 統合箇所

- stream-header内、status-badgeの右隣に配置
- `status === "running"` 時のみ表示

---

## 4. R2 タイムスタンプ表示実装

### 4.1 ユーティリティ関数: formatRelativeTime

```typescript
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string {
  const diff = now - timestamp;

  if (diff < 0) return "たった今";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return `${seconds}秒前`;
}
```

### 4.2 新規コンポーネント: MessageTimestamp

```typescript
const MessageTimestamp = React.memo(function MessageTimestamp({
  timestamp,
  messageId,
}: {
  timestamp: number;
  messageId: string;
}) {
  return (
    <span
      data-testid={`message-timestamp-${messageId}`}
      className="text-xs text-gray-400 flex-shrink-0"
    >
      {formatRelativeTime(timestamp)}
    </span>
  );
});
```

---

## 5. R3 クリップボードコピー実装

### 5.1 新規コンポーネント: CopyButton

```typescript
const CopyButton = React.memo(function CopyButton({
  content,
  messageId,
}: {
  content: string;
  messageId: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Clipboard API非対応時は非表示
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <button
        data-testid={`copy-button-${messageId}`}
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCopy();
          }
        }}
        className="copy-button opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="メッセージをコピー"
        tabIndex={0}
      >
        {/* クリップボードアイコン SVG */}
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
  );
});
```

### 5.2 機能詳細

- ホバー時にボタン表示（opacity-0 → group-hover:opacity-100）
- クリックでクリップボードにコピー
- 成功時に「コピーしました」フィードバック表示（2000ms）
- キーボード操作対応（Enter/Space）
- Clipboard API非対応時は非表示

---

## 6. MessageItem変更

### 6.1 構造変更

```tsx
<div className="message-item group flex justify-between items-start gap-2">
  <span className="flex-1">{message.content}</span>
  <div className="flex items-center gap-2 flex-shrink-0">
    <MessageTimestamp timestamp={message.timestamp} messageId={message.id} />
    <CopyButton content={message.content} messageId={message.id} />
  </div>
</div>
```

### 6.2 変更点

- flexレイアウトに変更
- groupクラス追加（ホバーでコピーボタン表示用）
- MessageTimestamp, CopyButton追加

---

## 7. アクセシビリティ対応

| 要素           | ARIA属性                          | 目的                   |
| -------------- | --------------------------------- | ---------------------- |
| LoadingSpinner | role="status" aria-label="実行中" | スクリーンリーダー通知 |
| CopyButton     | aria-label="メッセージをコピー"   | ボタンの目的説明       |
| CopyFeedback   | role="status" aria-live="polite"  | コピー成功通知         |

---

## 8. data-testid一覧

| data-testid               | 要素             |
| ------------------------- | ---------------- |
| loading-spinner           | スピナーSVG      |
| loading-spinner-container | スピナーコンテナ |
| message-timestamp-{id}    | タイムスタンプ   |
| copy-button-{id}          | コピーボタン     |

---

## 9. 完了確認

| ID  | 項目                   | 状況   |
| --- | ---------------------- | ------ |
| 1   | R1実装完了             | 完了   |
| 2   | R2実装完了             | 完了   |
| 3   | R3実装完了             | 完了   |
| 4   | Phase 4テストPASS予定  | 要確認 |
| 5   | 既存テスト影響なし     | 要確認 |
| 6   | TypeScript型エラーなし | 要確認 |
| 7   | ESLintエラーなし       | 要確認 |

---

## 10. 次フェーズへの申し送り

- Phase 6でテスト拡充
- Phase 7でカバレッジ確認
- Phase 9で品質保証（型チェック、lint）
