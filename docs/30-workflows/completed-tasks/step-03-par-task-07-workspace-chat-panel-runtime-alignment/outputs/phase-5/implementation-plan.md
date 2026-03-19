# Phase 5: 実装計画

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 5                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## 実装順序

### Phase A: Main Process（T5-1）

| 順序 | 変更対象                  | 変更内容                                               | ステータス |
| ---- | ------------------------- | ------------------------------------------------------ | ---------- |
| A-1  | `llm.ts` handleStreamChat | P62: modelId 必須検証（空文字・trim チェック含む）追加 | completed  |
| A-2  | `llm.ts` handleSetConfig  | P42: 既に modelId.trim() 検証済み（変更不要）          | completed  |
| A-3  | `llm.ts` handleStreamChat | API_KEY_MISSING の guidance メッセージ整形             | completed  |
| A-4  | conversation handlers     | 既に { success, error } wrapper 形式で実装済み         | completed  |

### Phase B: Renderer Controller（T5-2）

| 順序 | 変更対象                   | 変更内容                                                  | ステータス |
| ---- | -------------------------- | --------------------------------------------------------- | ---------- |
| B-1  | useWorkspaceChatController | sendMessage に `!selectedModelId` ガード追加              | completed  |
| B-2  | useWorkspaceChatController | `buildChatRequest` の `?? "gpt-4o"` fallback 削除（P62）  | completed  |
| B-3  | useWorkspaceChatController | onStreamError の error.code 別 guidance メッセージ分岐    | completed  |
| B-4  | useWorkspaceChatController | buildFileContextBlock の throw パターン維持（テスト整合） | completed  |
| B-5  | useWorkspaceChatController | `selectedModelId` を controller interface に追加・export  | completed  |
| B-6  | useWorkspaceChatController | persistAssistantMessage に llmProvider/llmModel 追加      | completed  |

### Phase C: Renderer UI（T5-3, T5-5, T5-6）

| 順序 | 変更対象                     | 変更内容                                       | ステータス |
| ---- | ---------------------------- | ---------------------------------------------- | ---------- |
| C-1  | WorkspaceChatPanel           | GuidanceBlock 統合（model blocked 表示）       | completed  |
| C-2  | GuidanceBlock.tsx            | 新規コンポーネント（error/handoff/blocked）    | completed  |
| C-3  | WorkspaceChatInput           | canSend に `selectedModelId !== null` 条件追加 | completed  |
| C-4  | WorkspaceChatInput           | cancel ボタンは既に実装済み（変更不要）        | completed  |
| C-5  | TranscriptProvenanceChip.tsx | 新規コンポーネント                             | completed  |
| C-6  | CompactLayout.tsx            | 新規コンポーネント（ResizeObserver）           | completed  |
| C-7  | WorkspaceChatInput           | selectedModelId=null 時の microcopy 追加       | completed  |

### Phase D: access capability 統合（T5-4）

| 順序 | 変更対象           | 変更内容                                           | ステータス |
| ---- | ------------------ | -------------------------------------------------- | ---------- |
| D-1  | WorkspaceChatPanel | GuidanceBlock("blocked") で model 未選択状態を表示 | completed  |
| D-2  | WorkspaceChatPanel | isModelBlocked による CTA 分岐実装                 | completed  |
| D-3  | WorkspaceChatPanel | GuidanceBlock に blocked メッセージ表示            | completed  |

## ロールバック観点

| リスク                                         | 対策                                               |
| ---------------------------------------------- | -------------------------------------------------- |
| P62 fallback 削除で既存ユーザーの送信が壊れる  | selectedModelId=null 時の GuidanceBlock 表示で代替 |
| conversation handler の error wrapper 変更     | 既存形式と互換あり（変更不要と判明）               |
| compact レイアウトが特定解像度で崩れる         | ResizeObserver の breakpoint を 360px で固定       |
| accessCapability Store が Task01 未完了で null | null の場合は loading 状態として CTA を非活性化    |

## P50 確認結果

以下の GAP は Task059a で部分的に既実装であることを確認:

| GAP    | 既実装部分                                       | 追加実装                      |
| ------ | ------------------------------------------------ | ----------------------------- |
| GAP-03 | cancel ボタン（WorkspaceChatInput L92-103）      | 不要（既実装）                |
| GAP-02 | errorMessage 表示（WorkspaceChatInput L120-128） | guidance メッセージ分岐を追加 |
