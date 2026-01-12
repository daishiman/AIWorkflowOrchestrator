# エージェント実行UI コンポーネント設計

## 概要

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | AGENT-004          |
| 機能名   | agent-execution-ui |
| Phase    | 2                  |
| 作成日   | 2026-01-12         |

---

## コンポーネント階層

```
AgentExecutionView (View/Page)
├── SkillHeader (Molecule)
│   ├── BackButton
│   ├── SkillName
│   └── SkillDescription
├── AgentChatInterface (Organism)
│   ├── AgentMessageList (Molecule)
│   │   └── AgentMessageItem[] (Molecule)
│   │       ├── MessageAvatar
│   │       ├── MessageContent
│   │       └── MessageTimestamp
│   └── AgentOutputStream (Molecule)
│       ├── StreamingIndicator
│       └── StreamingContent
├── AgentMessageInput (Molecule)
│   ├── TextArea
│   └── SendButton
├── AgentExecutionControls (Molecule)
│   ├── CancelButton
│   └── ClearButton
└── PermissionDialog (Organism)
    ├── DialogHeader
    ├── ToolInfo (Molecule)
    │   ├── ToolName
    │   └── ToolArgs
    ├── RememberChoiceCheckbox
    └── DialogActions
        ├── DenyButton
        └── ApproveButton
```

---

## コンポーネント詳細

### AgentExecutionView

実行画面のメインビュー。

| 属性     | 値                                                |
| -------- | ------------------------------------------------- |
| 階層     | View/Page                                         |
| ファイル | `views/AgentExecutionView/index.tsx`              |
| 責務     | レイアウト管理、状態購読、IPCイベントハンドリング |

```typescript
interface AgentExecutionViewProps {
  skillId: string;
}
```

**状態管理**:

- Zustand `agentSlice` から状態を購読
- IPCイベントハンドラーをuseEffectで登録

**レイアウト**:

```
┌────────────────────────────────────────────────────┐
│ [←] SkillName                                 [⚙️] │  ← SkillHeader
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ AgentChatInterface                           │  │
│  │  (flex-1, overflow-y: auto)                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
├────────────────────────────────────────────────────┤
│  [AgentMessageInput              ] [Send]          │  ← 固定下部
├────────────────────────────────────────────────────┤
│           [Cancel] [Clear]                         │  ← 固定下部
└────────────────────────────────────────────────────┘
```

---

### SkillHeader

選択中のスキル情報を表示するヘッダー。

| 属性     | 値                                     |
| -------- | -------------------------------------- |
| 階層     | Molecule                               |
| ファイル | `components/molecules/SkillHeader.tsx` |
| 責務     | スキル名・説明表示、戻るナビゲーション |

```typescript
interface SkillHeaderProps {
  skill: Skill;
  onBack: () => void;
}
```

**アクセシビリティ**:

- `role="banner"`
- 戻るボタンに `aria-label="スキル一覧に戻る"`

---

### AgentChatInterface

チャット履歴とストリーミング出力を表示するインターフェース。

| 属性     | 値                                            |
| -------- | --------------------------------------------- |
| 階層     | Organism                                      |
| ファイル | `components/organisms/AgentChatInterface.tsx` |
| 責務     | メッセージ一覧表示、自動スクロール            |

```typescript
interface AgentChatInterfaceProps {
  messages: AgentMessage[];
  streamingContent: string;
  isStreaming: boolean;
}
```

**機能**:

- メッセージ追加時の自動スクロール
- ストリーミング中のリアルタイム表示
- `aria-live="polite"` でスクリーンリーダー対応

---

### AgentMessageList

メッセージ一覧を表示するリスト。

| 属性     | 値                                          |
| -------- | ------------------------------------------- |
| 階層     | Molecule                                    |
| ファイル | `components/molecules/AgentMessageList.tsx` |
| 責務     | メッセージアイテムのレンダリング            |

```typescript
interface AgentMessageListProps {
  messages: AgentMessage[];
}
```

---

### AgentMessageItem

個別のメッセージを表示。

| 属性     | 値                                           |
| -------- | -------------------------------------------- |
| 階層     | Molecule                                     |
| ファイル | `components/molecules/AgentMessageItem.tsx`  |
| 責務     | メッセージ内容・アバター・タイムスタンプ表示 |

```typescript
interface AgentMessageItemProps {
  message: AgentMessage;
}
```

**バリエーション**:

| role      | スタイル                    | アバター |
| --------- | --------------------------- | -------- |
| user      | 右寄せ、青背景              | 👤       |
| assistant | 左寄せ、グレー背景          | 🤖       |
| system    | 中央寄せ、警告/情報スタイル | ⚠️/ℹ️    |

---

### AgentOutputStream

ストリーミング中の出力を表示。

| 属性     | 値                                           |
| -------- | -------------------------------------------- |
| 階層     | Molecule                                     |
| ファイル | `components/molecules/AgentOutputStream.tsx` |
| 責務     | ストリーミングコンテンツ表示、インジケーター |

```typescript
interface AgentOutputStreamProps {
  content: string;
  isStreaming: boolean;
}
```

**アニメーション**:

- ストリーミング中はカーソル点滅 `█`
- コンテンツ追加時のスムーズスクロール

---

### AgentMessageInput

メッセージ入力コンポーネント。

| 属性     | 値                                           |
| -------- | -------------------------------------------- |
| 階層     | Molecule                                     |
| ファイル | `components/molecules/AgentMessageInput.tsx` |
| 責務     | テキスト入力、送信トリガー                   |

```typescript
interface AgentMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}
```

**キーボード操作**:

- `Enter`: 送信
- `Shift+Enter`: 改行
- `Escape`: 入力クリア（フォーカス維持）

**アクセシビリティ**:

- `aria-label="メッセージを入力"`
- 送信ボタンに `aria-label="メッセージを送信"`

---

### AgentExecutionControls

実行制御ボタン群。

| 属性     | 値                                                |
| -------- | ------------------------------------------------- |
| 階層     | Molecule                                          |
| ファイル | `components/molecules/AgentExecutionControls.tsx` |
| 責務     | キャンセル・クリアボタン                          |

```typescript
interface AgentExecutionControlsProps {
  isExecuting: boolean;
  hasMessages: boolean;
  onCancel: () => void;
  onClear: () => void;
}
```

**ボタン状態**:

| ボタン | 表示条件      | 無効条件      |
| ------ | ------------- | ------------- |
| Cancel | `isExecuting` | -             |
| Clear  | `hasMessages` | `isExecuting` |

---

### PermissionDialog

権限確認ダイアログ。

| 属性     | 値                                          |
| -------- | ------------------------------------------- |
| 階層     | Organism                                    |
| ファイル | `components/organisms/PermissionDialog.tsx` |
| 責務     | 権限確認リクエスト表示、ユーザー選択受付    |

```typescript
interface PermissionDialogProps {
  request: PermissionRequest | null;
  onApprove: (rememberChoice: boolean) => void;
  onDeny: (rememberChoice: boolean) => void;
}
```

**レイアウト**:

```
┌──────────────────────────────────────────────────┐
│ 権限の確認                                    [×] │
├──────────────────────────────────────────────────┤
│                                                  │
│  エージェントが以下のツールを使用しようとしています:  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ ツール: Bash                                │  │
│  │ 引数:                                       │  │
│  │   command: "npm install"                   │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ☐ このツールの選択を記憶する                    │
│                                                  │
├──────────────────────────────────────────────────┤
│                     [拒否]  [許可]               │
└──────────────────────────────────────────────────┘
```

**アクセシビリティ**:

- `role="alertdialog"`
- `aria-modal="true"`
- フォーカストラップ
- `Escape`キーで拒否

---

### ToolInfo

ツール情報表示コンポーネント。

| 属性     | 値                                  |
| -------- | ----------------------------------- |
| 階層     | Molecule                            |
| ファイル | `components/molecules/ToolInfo.tsx` |
| 責務     | ツール名・引数の整形表示            |

```typescript
interface ToolInfoProps {
  toolName: string;
  args: Record<string, unknown>;
}
```

**表示形式**:

- ツール名: 太字
- 引数: JSON風の整形表示（pre/code）

---

## 共通コンポーネント使用

| コンポーネント | 使用元       | 用途                 |
| -------------- | ------------ | -------------------- |
| Button         | packages/ui  | 各種ボタン           |
| TextArea       | packages/ui  | メッセージ入力       |
| Dialog         | packages/ui  | PermissionDialog     |
| Checkbox       | packages/ui  | 記憶チェックボックス |
| Spinner        | packages/ui  | ローディング表示     |
| Icon           | lucide-react | 各種アイコン         |

---

## スタイリング方針

### Tailwind CSSクラス設計

| 要素                    | クラス例                                                          |
| ----------------------- | ----------------------------------------------------------------- |
| メッセージ（user）      | `ml-auto bg-blue-500 text-white rounded-lg p-3 max-w-[80%]`       |
| メッセージ（assistant） | `mr-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]` |
| 入力欄                  | `flex-1 resize-none border rounded-lg p-2`                        |
| ボタン（primary）       | `bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded`      |
| ボタン（secondary）     | `bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded`   |

### ダークモード対応

- Tailwind `dark:` プレフィックス使用
- システム設定に追従
- 背景・テキスト・ボーダー色の反転

---

## アクセシビリティ要件

### キーボードナビゲーション

| キー      | 動作                         |
| --------- | ---------------------------- |
| Tab       | 次の要素にフォーカス移動     |
| Shift+Tab | 前の要素にフォーカス移動     |
| Enter     | 送信、ボタン実行             |
| Escape    | ダイアログ閉じる、キャンセル |
| 矢印キー  | リスト内移動（該当時）       |

### ARIA属性

| コンポーネント     | ARIA属性                           |
| ------------------ | ---------------------------------- |
| AgentChatInterface | `aria-live="polite"`, `role="log"` |
| AgentMessageInput  | `aria-label`, `aria-describedby`   |
| PermissionDialog   | `role="alertdialog"`, `aria-modal` |
| 送信ボタン         | `aria-label="メッセージを送信"`    |

### フォーカス管理

| シナリオ         | フォーカス先           |
| ---------------- | ---------------------- |
| ダイアログ表示   | ダイアログ内最初の要素 |
| ダイアログ閉じる | トリガー要素           |
| メッセージ送信後 | 入力欄                 |
| エラー発生       | エラーメッセージ       |

---

## 変更履歴

| Version | Date       | Author | Changes  |
| ------- | ---------- | ------ | -------- |
| 1.0.0   | 2026-01-12 | Claude | 初版作成 |
