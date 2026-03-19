# チャット履歴永続化 インターフェース仕様 / history bundle

> 親仕様書: [interfaces-chat-history.md](interfaces-chat-history.md)
> 役割: history bundle

## 完了タスク

### UI-CONV-HISTORY-001（2026-01-25完了）

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | UI-CONV-HISTORY-001                                                                |
| タスク名     | conversation-history-ui-implementation                                             |
| 完了日       | 2026-01-25                                                                         |
| ステータス   | **完了**                                                                           |
| テスト数     | 280（自動テスト）                                                                  |
| カバレッジ   | Line: 98.66%, Branch: 95.07%, Function: 100%                                       |
| ドキュメント | `docs/30-workflows/completed-tasks/task-conversation-history-ui-implementation.md` |

#### テスト結果サマリー

| カテゴリ         | テスト数 | PASS | FAIL |
| ---------------- | -------- | ---- | ---- |
| UIコンポーネント | 231      | 231  | 0    |
| React Hooks      | 49       | 49   | 0    |
| **合計**         | **280**  | 280  | 0    |

#### 成果物

| 成果物             | パス                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/conversation-history-ui-implementation/outputs/phase-11/manual-test-result.md`   |
| 発見課題リスト     | `docs/30-workflows/conversation-history-ui-implementation/outputs/phase-11/discovered-issues.md`    |
| 実装ガイド         | `docs/30-workflows/conversation-history-ui-implementation/outputs/phase-12/implementation-guide.md` |

### TASK-UI-04B-WORKSPACE-CHAT（2026-03-11完了）

| 項目         | 内容 |
| ------------ | ---- |
| タスクID     | TASK-UI-04B-WORKSPACE-CHAT |
| 完了日       | 2026-03-11 |
| ステータス   | **完了（Phase 1-12）** |
| 利用API      | `conversation:create`, `conversation:addMessage` |
| 役割         | `WorkspaceChatPanel` で user/assistant メッセージを会話単位で永続化 |
| 実装箇所     | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` |
| 証跡         | `docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/outputs/phase-6/integration-test.md` |

### UT-LLM-HISTORY-001（2026-01-24完了）

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-LLM-HISTORY-001                                        |
| タスク名     | llm-conversation-history-persistence                      |
| 完了日       | 2026-01-24                                                |
| ステータス   | **完了**                                                  |
| テスト数     | 81（自動テスト）                                          |
| カバレッジ   | 91.43%                                                    |
| ドキュメント | `docs/30-workflows/llm-conversation-history-persistence/` |

---

## 残課題

| タスク名                          | 依存タスク          | 優先度 | 未タスク指示書                                                                |
| --------------------------------- | ------------------- | ------ | ----------------------------------------------------------------------------- |
| conversation-security-improvement | UI-CONV-HISTORY-001 | 低     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-conversation-security-improvement.md` |

---

## 関連ドキュメント

- [LLMインターフェース仕様](./interfaces-llm.md) - ChatMessage型（リアルタイム用）
- [データベース実装](./database-implementation.md) - Drizzle ORM、トランザクション
- [アーキテクチャパターン](./architecture-patterns.md) - Repository Pattern
- [会話履歴UIタスク指示書](docs/30-workflows/completed-tasks/task-conversation-history-ui-implementation.md) - UI実装タスク
- [実装ガイド](docs/30-workflows/conversation-history-ui-implementation/outputs/phase-12/implementation-guide.md) - 実装詳細

---

## 変更履歴

| Version   | Date       | Changes                                                                                                                                   |
| --------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **1.4.0** | 2026-03-11 | TASK-UI-04B-WORKSPACE-CHAT を追加。WorkspaceChatPanel での `conversation:create` / `conversation:addMessage` 利用フローと完了記録を同期 |
| **1.3.0** | 2026-01-26 | spec-guidelines.md準拠: コードブロック（認可ロジック、エクスポート形式）を表形式・文章に変換                                              |
| 1.2.0     | 2026-01-25 | UI-CONV-HISTORY-001完了: Renderer Process型定義追加、Preload API追加、React Hooks追加、UIコンポーネント構成追加、アクセシビリティ対応追加 |
| 1.1.0     | 2026-01-24 | UT-LLM-HISTORY-001完了: 認可チェック追加、セキュリティ原則追加                                                                            |
| 1.0.0     | 2026-01-20 | 初版作成: チャット履歴永続化インターフェース仕様                                                                                          |

