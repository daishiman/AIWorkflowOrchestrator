# コンポーネント設計書

## コンポーネント階層

```
ChatPanel (forwardRef)
├── Header
│   ├── ModelSelector (既存)
│   └── SkillSelector (TASK-7A)
├── MessageArea
│   ├── MessageList (既存チャット)
│   └── SkillStreamingView (条件付き表示)
│       ├── StatusBadge
│       ├── StreamMessageItem (assistant/tool_use/tool_result/error)
│       └── ToolExecutionHistory (折りたたみ)
├── InputArea
│   └── ChatInput (既存)
└── Dialogs
    ├── SkillImportDialog (TASK-7B)
    └── PermissionDialog (TASK-7C, Store-direct)
```

## Props/データフロー

| 親 → 子                        | Props                             | 備考                 |
| ------------------------------ | --------------------------------- | -------------------- |
| ChatPanel → SkillSelector      | `className`                       | 配置のみ             |
| ChatPanel → SkillStreamingView | `skillName`, `messages`, `status` | Store経由データ      |
| ChatPanel → SkillImportDialog  | `skill`, `isOpen`, `onClose`      | ローカルstate制御    |
| ChatPanel → PermissionDialog   | (なし)                            | Store-directパターン |
| SkillSelector → ChatPanel      | `onImportRequest` callback        | ref経由              |

## 表示条件ロジック

```typescript
// SkillStreamingView表示
{isExecuting && selectedSkillName && (
  <SkillStreamingView
    skillName={selectedSkillName}
    messages={streamingMessages}
    status={skillExecutionStatus}
  />
)}

// SkillImportDialog表示
{importDialogSkill && (
  <SkillImportDialog
    skill={importDialogSkill}
    isOpen={importDialogSkill !== null}
    onClose={() => setImportDialogSkill(null)}
  />
)}

// PermissionDialog: 常時マウント
<PermissionDialog />
```

## SkillStreamingView内部設計

### StatusBadge

| status             | 色         | ラベル       | role     |
| ------------------ | ---------- | ------------ | -------- |
| running            | blue-500   | "実行中..."  | "status" |
| permission_pending | yellow-500 | "権限確認"   | "status" |
| completed          | green-500  | "完了"       | "status" |
| cancelled          | gray-500   | "キャンセル" | "status" |
| error              | red-500    | "エラー"     | "status" |
| idle / null        | (非表示)   | -            | -        |

### StreamMessageItem

| message.type | 表示                                | スタイル                |
| ------------ | ----------------------------------- | ----------------------- |
| assistant    | text + `▌` (isPartial時)            | 通常                    |
| tool_use     | `🔧 ツール使用: {toolName}`         | bg-blue-50              |
| tool_result  | 成功: `✅ 完了` / 失敗: `❌ エラー` | bg-green-50 / bg-red-50 |
| error        | エラーメッセージ                    | bg-red-50, text-red-600 |
| default      | null                                | -                       |

### ToolExecutionHistory

- `<details>` / `<summary>` 折りたたみ
- tool_use + tool_result をフィルタリング
- ツール数: `toolMessages.length / 2`
- ゼロ件: null

### 中止ボタン

- 表示: `status === "running"`
- onClick: `abortExecution()`
- `aria-label="スキル実行を中止する"`
