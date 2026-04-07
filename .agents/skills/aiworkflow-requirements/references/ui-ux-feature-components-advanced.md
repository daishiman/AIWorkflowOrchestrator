# UIフィーチャーコンポーネント（高度な機能） / advanced specification
> 親ファイル: [ui-ux-feature-components-core.md](ui-ux-feature-components-core.md)

## Custom Execution Environment UI コンポーネント（AGENT-006）

エージェント実行結果をリアルタイムでプレビューするためのUIコンポーネント群。
HTML、Markdownのプレビューに対応し、3層セキュリティ防御を実装。

### コンポーネント階層

| コンポーネント       | 種類      | 親                       | 子要素                                                                     |
| -------------------- | --------- | ------------------------ | -------------------------------------------------------------------------- |
| AgentExecutionView   | views     | -                        | SplitLayout                                                                |
| SplitLayout          | organisms | AgentExecutionView       | leftPanel (AgentChatInterface), Divider, rightPanel (ExecutionEnvironment) |
| ExecutionEnvironment | organisms | SplitLayout (rightPanel) | EnvironmentSelector, HTMLPreviewEnvironment / MarkdownPreviewEnvironment   |
| EnvironmentSelector  | molecules | ExecutionEnvironment     | 環境タイプ選択ドロップダウン                                               |

### コンポーネント仕様

| コンポーネント             | 種類     | 責務                             |
| -------------------------- | -------- | -------------------------------- |
| SplitLayout                | organism | 左右分割レイアウト、ドラッグ調整 |
| EnvironmentSelector        | molecule | 環境タイプ選択ドロップダウン     |
| ExecutionEnvironment       | organism | 環境タイプに応じたプレビュー切替 |
| HTMLPreviewEnvironment     | organism | sandbox iframe内でHTMLを安全表示 |
| MarkdownPreviewEnvironment | organism | Markdownをレンダリング表示       |

### ファイル配置

| コンポーネント             | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/`                |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/`        |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/`       |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/`     |
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/` |
| sanitize.ts                | `apps/desktop/src/renderer/utils/sanitize.ts`                                |

### SplitLayout Props

| Prop           | 型                        | 必須 | デフォルト | 説明                 |
| -------------- | ------------------------- | ---- | ---------- | -------------------- |
| leftPanel      | `React.ReactNode`         | ✓    | -          | 左パネルコンテンツ   |
| rightPanel     | `React.ReactNode`         | ✓    | -          | 右パネルコンテンツ   |
| initialRatio   | `number`                  | -    | 50         | 初期分割比率 (%)     |
| minRatio       | `number`                  | -    | 20         | 最小比率 (%)         |
| maxRatio       | `number`                  | -    | 80         | 最大比率 (%)         |
| onRatioChange  | `(ratio: number) => void` | -    | -          | 比率変更コールバック |
| showRightPanel | `boolean`                 | -    | true       | 右パネル表示         |
| className      | `string`                  | -    | -          | カスタムクラス       |

### SplitLayout キーボード操作

| キー       | 動作             |
| ---------- | ---------------- |
| ArrowLeft  | 左パネルを5%縮小 |
| ArrowRight | 左パネルを5%拡大 |
| Home       | 最小比率に設定   |
| End        | 最大比率に設定   |

### セキュリティ（3層防御）

| レイヤー | 実装                     | 防御対象                         |
| -------- | ------------------------ | -------------------------------- |
| Layer 1  | DOMPurify HTMLサニタイズ | scriptタグ、イベントハンドラ除去 |
| Layer 2  | CSP（script-src 'none'） | インラインスクリプト防止         |
| Layer 3  | iframe sandbox           | スクリプト実行、ポップアップ禁止 |

---

## workspace-chat-edit-ui コンポーネント（Issue #468, #494）

AIアシスタントとのチャット中にファイル編集を依頼し、差分プレビュー・適用を行うためのUIコンポーネント群。

### コンポーネント階層

| コンポーネント       | 種類      | 親                   | 子要素                                                                                    |
| -------------------- | --------- | -------------------- | ----------------------------------------------------------------------------------------- |
| ChatView             | views     | -                    | FileContextDropZone, FileContextList, FileAttachmentButton, EditCommandInput, DiffPreview |
| FileAttachmentButton | molecules | ChatView             | なし                                                                                      |
| FileContextList      | organisms | ChatView             | FileContextBadge（複数）                                                                  |
| FileContextDropZone  | organisms | ChatView             | ChatContent                                                                               |
| FileContextBadge     | molecules | FileContextList      | なし                                                                                      |
| EditCommandInput     | molecules | ChatView             | CommandTypeSelector, TextInput + SendButton                                               |
| DiffPreview          | organisms | ChatView（モーダル） | DiffEditor, ApplyControls                                                                 |
| DiffEditor           | -         | DiffPreview          | Monaco DiffEditor                                                                         |

### コンポーネント仕様

#### FileAttachmentButton（Issue #494）

| 項目     | 仕様                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileAttachmentButton.tsx`    |
| 責務     | ファイル選択ダイアログを開き、選択されたファイルをコンテキストに追加                            |
| 依存     | useFileContext, electronAPI.fileSelection                                                       |
| Props    | `onFilesSelected?`, `multiple?`, `accept?`, `maxFiles?`, `disabled?`, `className?`, `children?` |

**Props詳細**

| Prop            | 型                               | 必須 | デフォルト | 説明                       |
| --------------- | -------------------------------- | ---- | ---------- | -------------------------- |
| onFilesSelected | `(files: FileContext[]) => void` | No   | -          | ファイル選択時コールバック |
| multiple        | `boolean`                        | No   | true       | 複数選択許可               |
| accept          | `string[]`                       | No   | ["*"]      | 許可する拡張子             |
| maxFiles        | `number`                         | No   | 10         | 最大ファイル数             |
| disabled        | `boolean`                        | No   | false      | 無効状態                   |

**機能**

| 機能             | 説明                                   |
| ---------------- | -------------------------------------- |
| ダイアログ表示   | クリックでファイル選択ダイアログを開く |
| 最大数制限       | canAddContext: falseで自動無効化       |
| キーボード操作   | Enter/Spaceでダイアログを開く          |
| ローディング状態 | 処理中はボタン無効化                   |

#### FileContextList（Issue #494）

| 項目     | 仕様                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextList.tsx`           |
| 責務     | 添付ファイル一覧の表示、削除・選択操作のハンドリング                                              |
| 依存     | useFileContext, FileContextBadge                                                                  |
| Props    | `contexts?`, `onRemove?`, `onSelect?`, `selectedId?`, `emptyMessage?`, `maxHeight?`, `className?` |

**Props詳細**

| Prop         | 型                     | 必須 | デフォルト                     | 説明                 |
| ------------ | ---------------------- | ---- | ------------------------------ | -------------------- |
| contexts     | `FileContext[]`        | No   | (Zustandから取得)              | 表示するコンテキスト |
| onRemove     | `(id: string) => void` | No   | -                              | 削除時コールバック   |
| onSelect     | `(id: string) => void` | No   | -                              | 選択時コールバック   |
| selectedId   | `string`               | No   | (Zustandから取得)              | 選択中のID           |
| emptyMessage | `string`               | No   | "ファイルが添付されていません" | 空状態メッセージ     |

**機能**

| 機能                     | 説明                               |
| ------------------------ | ---------------------------------- |
| 一覧表示                 | FileContextBadgeで各ファイルを表示 |
| 空状態表示               | ファイルなし時にメッセージ表示     |
| スクロール               | 大量ファイル時にスクロール可能     |
| キーボードナビゲーション | Tab/Enter/Deleteで操作             |

#### FileContextBadge

| 項目     | 仕様                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextBadge.tsx`         |
| 責務     | 添付ファイルの表示と削除                                                                         |
| Props    | `file: FileContext`, `isSelected?: boolean`, `onRemove?: (id) => void`, `onClick?: (id) => void` |

#### ApplyControls

| 項目     | 仕様                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/ApplyControls.tsx` |
| 責務     | 差分の適用または却下                                                                  |
| Props    | `resultId: string`, `onApplied?: () => void`, `onRejected?: () => void`               |

#### FileContextDropZone

| 項目     | 仕様                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextDropZone.tsx` |
| 責務     | ドラッグ&ドロップでのファイル添付                                                           |
| Props    | `children: ReactNode`, `disabled?: boolean`, `onFilesDropped?: (files) => void`             |

#### DiffPreview

| 項目     | 仕様                                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffPreview.tsx`                                                                  |
| 責務     | 差分プレビューモーダルの表示                                                                                                                         |
| Props    | `original: string`, `modified: string`, `fileName: string`, `language?: string`, `resultId: string`, `onClose: () => void`, `onApplied?: () => void` |

#### DiffEditor

| 項目     | 仕様                                                                               |
| -------- | ---------------------------------------------------------------------------------- | ------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffEditor.tsx` |
| 責務     | Monaco Editorによる差分表示                                                        |
| Props    | `original: string`, `modified: string`, `language?: string`, `height?: string      | number` |

#### EditCommandInput

| 項目     | 仕様                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/EditCommandInput.tsx` |
| 責務     | 編集コマンドの入力と送信                                                                 |
| Props    | `onSubmit: (command: EditCommand) => void`, `disabled?: boolean`, `placeholder?: string` |

### 状態管理

| Hook           | 責務                                           |
| -------------- | ---------------------------------------------- |
| useFileContext | ファイルコンテキストの管理（添付/削除/クリア） |
| useDiffApply   | 差分適用状態の管理（適用/却下/リセット）       |

### バリデーション

| 項目               | 制限値     |
| ------------------ | ---------- |
| 最大ファイル数     | 10ファイル |
| 最大ファイルサイズ | 10MB       |

### キーボード操作

| キー             | コンポーネント   | 動作                       |
| ---------------- | ---------------- | -------------------------- |
| Delete/Backspace | FileContextBadge | 選択中のバッジを削除       |
| Ctrl+Enter       | EditCommandInput | コマンド送信               |
| Escape           | DiffPreview      | プレビューを閉じる         |
| Tab              | DiffPreview      | フォーカストラップ内を循環 |

---

## ChatPanel Real AI Chat Wiring（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 / spec_created）

> 設計タスク。ChatPanel の placeholder を real AI chat 経路へ接続し、streaming/error/handoff 各状態の表示を設計する。

### コンポーネント階層

```
ChatPanel (organism) - 全面書換（3 placeholder 置換 + 8 状態条件レンダリング）
  +-- RuntimeBanner (atom)              # capability 表示バナー + terminal ボタン
  +-- ChatMessageList (molecule)        # メッセージ一覧 (role="log", aria-live="polite")
  |     +-- ChatMessage (atom)          # 個別メッセージ (user / assistant)
  |     +-- StreamingMessage (atom)     # ストリーミング中メッセージ（既存接続）
  +-- ErrorGuidance (molecule)          # エラー表示 (capability / network / API key)
  +-- HandoffBlock (molecule)           # terminal handoff ブロック
  |     +-- PersistentTerminalLauncher (atom) # terminal 常設起動ボタン
  +-- ComposerArea (molecule)           # 入力エリア
  |     +-- ComposerInput (atom)        # テキスト入力
  |     +-- SendButton (atom)           # 送信ボタン
  +-- LLMSelectorPanel (molecule)       # Provider/Model セレクタ（既存接続）
  +-- SkillStreamingView (既存維持)     # スキル実行中表示
  +-- SkillManagementPanel (既存維持)   # スキル管理パネル
```

### Atomic Design 分類

| コンポーネント             | 分類     | 新規/既存 | ファイルパス                                                                   |
| -------------------------- | -------- | --------- | ------------------------------------------------------------------------------ |
| RuntimeBanner              | atom     | 新規      | `apps/desktop/src/renderer/components/chat/RuntimeBanner.tsx`              |
| ChatMessage                | atom     | 新規      | `apps/desktop/src/renderer/components/chat/ChatMessage.tsx`                |
| ComposerInput              | atom     | 新規      | `apps/desktop/src/renderer/components/chat/ComposerInput.tsx`              |
| SendButton                 | atom     | 新規      | `apps/desktop/src/renderer/components/chat/SendButton.tsx`                 |
| PersistentTerminalLauncher | atom     | 新規      | `apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx` |
| ChatMessageList            | molecule | 新規      | `apps/desktop/src/renderer/components/chat/ChatMessageList.tsx`            |
| ErrorGuidance              | molecule | 新規      | `apps/desktop/src/renderer/components/chat/ErrorGuidance.tsx`              |
| HandoffBlock               | molecule | 新規      | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`               |
| ComposerArea               | molecule | 新規      | `apps/desktop/src/renderer/components/chat/ComposerArea.tsx`               |
| LLMSelectorPanel           | molecule | 新規      | `apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx`           |
| ChatPanel                  | organism | 変更      | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                  |
| StreamingMessage           | atom     | 既存      | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`           |

### 主要 Props 設計

| コンポーネント             | 主要 Props                                                                      |
| -------------------------- | ------------------------------------------------------------------------------- |
| RuntimeBanner              | `capability: AccessCapability`, `onTerminalClick?: () => void`                  |
| ChatMessageList            | `messages: ChatMessage[]`, `isStreaming: boolean`                               |
| ChatMessage                | `message: ChatMessage`                                                          |
| ErrorGuidance              | `error: LLMError`, `onRetry?: () => void`, `onSettings?: () => void`            |
| HandoffBlock               | `guidance: HandoffGuidance`, `onLaunch: () => void`                             |
| PersistentTerminalLauncher | `onLaunch: () => void`                                                          |
| ComposerInput              | `value: string`, `onChange: (v: string) => void`, `onSubmit: () => void`, `disabled: boolean` |
| SendButton                 | `onClick: () => void`, `disabled: boolean`, `isStreaming: boolean`              |
| ComposerArea               | `children: ReactNode`                                                           |
| LLMSelectorPanel           | `selectedProviderId: string \| null`, `selectedModelId: string \| null`, `providers: Provider[]`, `onSelect: (providerId, modelId) => void` |

### 8 状態条件レンダリング

| 状態        | RuntimeBanner | ChatMessageList | ComposerArea | ErrorGuidance | HandoffBlock |
| ----------- | ------------- | --------------- | ------------ | ------------- | ------------ |
| `idle`      | 表示          | empty state     | 無効         | -             | -            |
| `ready`     | 表示          | 表示            | 有効         | -             | -            |
| `streaming` | 表示          | 表示+streaming  | 無効         | -             | -            |
| `cancelled` | 表示          | 表示            | 有効         | -             | -            |
| `completed` | 表示          | 表示            | 有効         | -             | -            |
| `error`     | 表示          | 表示            | 有効         | 表示          | -            |
| `blocked`   | 表示(警告)    | -               | 無効         | -             | -            |
| `handoff`   | 表示          | -               | 無効         | -             | 表示         |

### アクセシビリティ

| コンポーネント    | ARIA 属性                      |
| ----------------- | ------------------------------ |
| ChatMessageList   | `role="log"`, `aria-live="polite"` |
| RuntimeBanner     | `role="status"`                |
| ErrorGuidance     | `role="alert"`                 |
| ComposerInput     | `aria-label="メッセージ入力"`  |
| SendButton        | `aria-label="送信"`            |

### キーボード操作

| キー           | コンポーネント | 動作                  |
| -------------- | -------------- | --------------------- |
| Enter          | ComposerInput  | メッセージ送信        |
| Shift+Enter    | ComposerInput  | 改行挿入              |
| Escape         | ComposerInput  | ストリーミングキャンセル |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 | ChatPanel の実 AI チャット配線（設計） | spec_created（2026-03-18） |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 | Main Chat/Settings AI runtime 同期 | 完了（2026-03-17） |

---
