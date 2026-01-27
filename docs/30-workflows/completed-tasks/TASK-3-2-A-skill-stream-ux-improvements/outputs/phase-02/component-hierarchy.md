# コンポーネント階層図

## メタ情報

| 項目      | 内容       |
| --------- | ---------- |
| タスクID  | TASK-3-2-A |
| Issue番号 | #520       |
| Phase     | 2          |
| 作成日    | 2026-01-27 |

---

## 1. 現在の階層構造

```
SkillStreamDisplay
├── sr-only (role="status")
│   └── ステータステキスト
├── stream-header
│   ├── status-badge
│   ├── abort-button (running時)
│   └── reset-button (completed/error/aborted時)
├── stream-content (role="log")
│   ├── 空状態メッセージ (idle時)
│   ├── ローディングテキスト (running/メッセージなし時)
│   └── MessageItem[] (複数)
│       └── message-content
│           └── span (content)
└── PermissionDialog
```

---

## 2. 改善後の階層構造

```
SkillStreamDisplay
├── sr-only (role="status")
│   └── ステータステキスト
├── stream-header
│   ├── status-badge
│   ├── LoadingSpinner (R1) ← 新規: running時
│   ├── abort-button (running時)
│   └── reset-button (completed/error/aborted時)
├── stream-content (role="log")
│   ├── 空状態メッセージ (idle時)
│   ├── ローディングテキスト (running/メッセージなし時)
│   └── MessageItem[] (複数)
│       ├── message-content
│       │   └── span (content)
│       ├── MessageTimestamp (R2) ← 新規
│       └── CopyButton (R3) ← 新規
│           └── CopyFeedback ← 新規 (コピー成功時)
└── PermissionDialog
```

---

## 3. コンポーネント詳細

### 3.1 新規コンポーネント

| コンポーネント   | 親            | 責務                       | 表示条件             |
| ---------------- | ------------- | -------------------------- | -------------------- |
| LoadingSpinner   | stream-header | ローディングアニメーション | status === "running" |
| MessageTimestamp | MessageItem   | 相対時刻表示               | 常時                 |
| CopyButton       | MessageItem   | クリップボードコピー       | clipboard対応時      |
| CopyFeedback     | CopyButton    | コピー成功フィードバック   | copied === true      |

### 3.2 既存コンポーネント変更

| コンポーネント     | 変更内容                           |
| ------------------ | ---------------------------------- |
| SkillStreamDisplay | LoadingSpinnerの追加               |
| MessageItem        | MessageTimestamp, CopyButtonの追加 |

---

## 4. データフロー図

```
SkillStreamDisplay
│
├── props: skillId, initialPrompt, autoExecute, ...
│
├── useSkillExecution() → messages, status, error, ...
│
├── LoadingSpinner
│   └── props: なし（内部で完結）
│
└── MessageItem × N
    │
    ├── props: message (SkillStreamMessage)
    │
    ├── MessageTimestamp
    │   └── props: timestamp (message.timestamp)
    │
    └── CopyButton
        ├── props: content (message.content)
        └── internal state: copied (boolean)
```

---

## 5. 状態管理図

```
┌─────────────────────────────────────────────────────────┐
│ SkillStreamDisplay                                       │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ useSkillExecution() Hook                             ││
│  │  - messages: SkillStreamMessage[]                    ││
│  │  - status: "idle" | "running" | "completed" | ...    ││
│  │  - error: SkillExecutionError | null                 ││
│  │  - execute, abort, reset functions                   ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ useSkillPermission() Hook                            ││
│  │  - pendingPermission                                 ││
│  │  - handleApprove, handleDeny functions               ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌───────────────────────┐ ┌───────────────────────┐   │
│  │ MessageItem           │ │ MessageItem           │   │
│  │  ┌─────────────────┐  │ │  ┌─────────────────┐  │   │
│  │  │ CopyButton      │  │ │  │ CopyButton      │  │   │
│  │  │  state: copied  │  │ │  │  state: copied  │  │   │
│  │  └─────────────────┘  │ │  └─────────────────┘  │   │
│  └───────────────────────┘ └───────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 6. イベントフロー

### 6.1 コピーボタンクリック

```
1. ユーザーがCopyButtonをクリック
   │
2. handleCopy()実行
   │
3. navigator.clipboard.writeText(content)
   │
   ├─ 成功 → setCopied(true)
   │         │
   │         └─ 2000ms後 → setCopied(false)
   │
   └─ 失敗 → console.error(error)
```

### 6.2 ステータス変更

```
1. status変更 (idle → running)
   │
2. LoadingSpinner表示
   │
3. status変更 (running → completed/error/aborted)
   │
4. LoadingSpinner非表示、reset-button表示
```

---

## 7. レイアウト構造

### 7.1 stream-header

```
┌─────────────────────────────────────────────────────────┐
│ [status-badge] [LoadingSpinner] [abort-button]          │
│                                    or                    │
│                                 [reset-button]           │
└─────────────────────────────────────────────────────────┘
```

### 7.2 MessageItem

```
┌─────────────────────────────────────────────────────────┐
│ [message-content]                  [timestamp] [copy]   │
│ メッセージ内容...                   30秒前      [📋]    │
└─────────────────────────────────────────────────────────┘
```

---

## 8. ファイル構成

```
apps/desktop/src/renderer/
├── components/
│   └── AgentView/
│       ├── SkillStreamDisplay.tsx     ← 変更
│       ├── LoadingSpinner.tsx         ← 新規 (R1)
│       ├── MessageTimestamp.tsx       ← 新規 (R2)
│       ├── CopyButton.tsx             ← 新規 (R3)
│       └── __tests__/
│           ├── SkillStreamDisplay.test.tsx  ← 変更
│           ├── LoadingSpinner.test.tsx      ← 新規
│           ├── MessageTimestamp.test.tsx    ← 新規
│           └── CopyButton.test.tsx          ← 新規
└── utils/
    ├── formatTime.ts                  ← 新規 (R2)
    └── __tests__/
        └── formatTime.test.ts         ← 新規
```

---

## 9. インポート関係

```
SkillStreamDisplay.tsx
├── import { LoadingSpinner } from "./LoadingSpinner"
├── import { MessageTimestamp } from "./MessageTimestamp"
├── import { CopyButton } from "./CopyButton"
└── import { formatRelativeTime } from "../../utils/formatTime"

MessageTimestamp.tsx
└── import { formatRelativeTime } from "../../utils/formatTime"

CopyButton.tsx
└── (内部で完結、外部依存なし)

LoadingSpinner.tsx
└── (内部で完結、外部依存なし)
```
