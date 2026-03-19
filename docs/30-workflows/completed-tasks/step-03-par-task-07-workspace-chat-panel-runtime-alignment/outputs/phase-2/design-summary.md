# Phase 2: 設計サマリー

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 2                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## 責務境界

### Main Process 責務

- **streaming 制御**: LLMAdapter + AbortController 所有。handleStreamChat/handleStreamCancel
- **access capability 判定**: RuntimeResolver.resolve() が唯一の判定源
- **conversation 永続化**: ConversationRepository（SQLite）経由でのみアクセス
- **IPC sender 検証**: validateIpcSender を全ハンドラ先頭で実行
- **P42 3段バリデーション**: 全文字列引数に型チェック → 空文字列 → trim()空文字列

### Renderer 責務

- **file context 組立**: buildFileContextBlock（selectedFiles から組立）
- **UI 状態管理**: messages/input/isSending/isStreaming/streamContent/errorMessage（全て local useState）
- **mention 解析**: useWorkspaceMentionQuery（UI入力解析）
- **stream chunk 表示**: onStreamChunk/End/Error の購読と描画
- **CTA 活性/非活性制御**: selectedModelId/isStreaming/isSending に基づく判定

### IPC 境界

- Renderer → Main: llm:stream-chat, llm:cancel-stream, conversation:create, conversation:addMessage, file:read
- Main → Renderer: llm:on-stream-chunk, llm:on-stream-end, llm:on-stream-error

## 依存関係グラフ

```
Task01 (RuntimeResolver) ─────→ Task08 (本タスク)
Task06 (IPC契約正本) ─────────→ Task08 (本タスク)
Task059a (Panel基盤実装) ─────→ Task08 (本タスク)
```

## GAP対応マッピング

| GAP ID | 内容                                 | 対応設計タスク   | 変更ファイル                                                       |
| ------ | ------------------------------------ | ---------------- | ------------------------------------------------------------------ |
| GAP-01 | P62違反: selectedModelId ?? "gpt-4o" | T2-1, T2-2, T2-5 | useWorkspaceChatController.ts, llm.ts                              |
| GAP-02 | errorMessage 未表示                  | T2-5             | WorkspaceChatPanel.tsx                                             |
| GAP-03 | cancel ボタン不在                    | T2-4             | WorkspaceChatInput.tsx                                             |
| GAP-04 | authMode/accessCapability 非連携     | T2-1, T2-3       | useWorkspaceChatController.ts                                      |
| GAP-05 | llmProvider/llmModel 未保存          | T2-4             | useWorkspaceChatController.ts                                      |
| GAP-06 | 新規コンポーネント3件未実装          | T2-5, T2-6, T2-7 | GuidanceBlock.tsx, TranscriptProvenanceChip.tsx, CompactLayout.tsx |

## 設計方針（5原則）

1. **streaming と file context は別責務**: file read failure が streaming 障害と誤認されない
2. **workspace 文脈組立は access capability 判定に依存しない**: terminal handoff 時にも文脈が保持される
3. **terminal surface は別 capability**: HandoffCard のみ提供、terminal 直接操作しない
4. **selected config authority は Main Process**: P62対策で DEFAULT_CONFIG fallback 禁止
5. **conversation 永続化は Main Process 経由のみ**: Renderer 直アクセス禁止
