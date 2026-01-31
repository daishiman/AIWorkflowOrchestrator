# SkillStreamingView 設計書

## 設計日: 2026-01-30

## Props インターフェース

```typescript
interface SkillStreamingViewProps {
  skillName: string;
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus | null;
}
```

## サブコンポーネント構成

```
SkillStreamingView（border-t p-4 bg-gray-50 dark:bg-gray-900）
├── ヘッダー（flex items-center justify-between mb-4）
│   ├── div（flex items-center gap-2）
│   │   ├── スキル名表示（font-medium text-sm）
│   │   └── StatusBadge（ステータス別色・ラベル）
│   └── 中止ボタン（status === "running" 時のみ表示）
├── メッセージ表示（space-y-3, role="log", aria-live="polite"）
│   └── StreamMessageItem × N（message.type で分岐）
└── ToolExecutionHistory（折りたたみ表示）
```

## StatusBadge

```typescript
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  running: { color: "bg-blue-500", label: "実行中..." },
  permission_pending: { color: "bg-yellow-500", label: "権限確認" },
  completed: { color: "bg-green-500", label: "完了" },
  cancelled: { color: "bg-gray-500", label: "キャンセル" },
  error: { color: "bg-red-500", label: "エラー" },
};
```

- status が `null` or `"idle"` → null を返す（非表示）
- `role="status"` を設定

## StreamMessageItem

| type                  | 表示内容                                                 | スタイル                                                      |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| assistant             | `content.text` + ▌カーソル（isPartial時、animate-pulse） | whitespace-pre-wrap                                           |
| tool_use              | `🔧 ツール使用: {content.toolName}`                      | bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm            |
| tool_result (success) | `✅ 完了`                                                | bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm          |
| tool_result (failure) | `❌ エラー: {content.error}`                             | bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm              |
| error                 | `{content.message}`                                      | bg-red-50 dark:bg-red-900/20 text-red-600 p-2 rounded text-sm |
| default               | null                                                     |

## ToolExecutionHistory

- `<details>/<summary>` ネイティブ要素
- summary: `ツール実行履歴（{toolCount}件）`
- toolMessages: messages.filter(m => m.type === "tool_use" || m.type === "tool_result")
- toolCount: Math.floor(toolMessages.length / 2)
- toolMessages.length === 0 → null（非表示）

## 中止ボタン

- 表示条件: `status === "running"`
- テキスト: 「停止する」
- onClick: `useAppStore().abortExecution()`
- `type="button"`, `aria-label="スキル実行を中止する"`
