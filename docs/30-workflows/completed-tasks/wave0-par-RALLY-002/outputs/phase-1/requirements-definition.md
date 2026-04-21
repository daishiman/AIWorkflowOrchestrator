# Phase 1 要件定義書

## タスク概要

| 項目                | 値                                                                       |
| ------------------- | ------------------------------------------------------------------------ |
| タスクID            | TASK-RALLY-002                                                           |
| implementation_mode | verify_existing                                                          |
| タスク種別          | NON_VISUAL                                                               |
| 対象ファイル        | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` |

## 要件

### 主要件

`restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null` の合成式に対して、以下の意味を仕様として固定する。

1. **優先ルール**: `restoredPendingRequest` はセッション復元時のみ非 null になる。通常フローでは `workflowSnapshot?.awaitingUserInput` を使用する。
2. **クリア条件1**: `workflowSnapshot?.awaitingUserInput?.requestId` が変化した場合（新しい質問が届いた場合）に `restoredPendingRequest` を null にクリアし、通常フローに戻る。
3. **クリア条件2**: `submitAnswer` 完了後に `restoredPendingRequest` を null にクリアする。
4. **復元条件**: `handleUndo` 実行時に前回の `request` を `setRestoredPendingRequest` で復元する。

### 非目標

- `SkillLifecyclePanel.tsx` の変更（RALLY-001, RALLY-005〜008 の責務）
- IPC 契約変更（RALLY-003, RALLY-005 の責務）
- UX 追加（RALLY-010〜013 の責務）
- ロジックの変更（既存実装は正しい）

## 変更スコープ

| 変更種別     | 対象                                                      | 内容                                              |
| ------------ | --------------------------------------------------------- | ------------------------------------------------- |
| コメント追加 | `ConversationalInterview.tsx` L44 上                      | `restoredPendingRequest` 優先ルールの説明コメント |
| コメント追加 | `ConversationalInterview.tsx` L55 上                      | clear useEffect の意図説明コメント                |
| 新規テスト   | `ConversationalInterview.restoredPendingRequest.test.tsx` | targeted regression test                          |
| 変更なし     | ロジック全般                                              | 既存実装は仕様に合致している                      |

## downstream への handoff 条件

RALLY-002 完了後、RALLY-010 以降は以下を前提として実装できる。

- `pendingRequest` は「復元された質問 OR 通常の質問 OR null」を返す
- 復元された質問は `workflowSnapshot?.awaitingUserInput` の requestId が変化した時点で自動的にクリアされる
- この前提が仕様書（コメント）に明記されている
