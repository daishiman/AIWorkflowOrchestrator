# Phase 1 成果物: スコープ定義

## 対象範囲

### Main Process

| ファイル                                | 変更種別     | 内容                                                            |
| --------------------------------------- | ------------ | --------------------------------------------------------------- |
| `services/runtime/RuntimeResolver.ts`   | 新規（移動） | chat-edit から共通サービスに移動、LLMAdapter 依存解除           |
| `services/chat-edit/RuntimeResolver.ts` | 削除         | 共通サービスに移動後に削除                                      |
| `ipc/skillHandlers.ts`                  | 修正         | RuntimeResolver DI 追加、handoff 分岐追加                       |
| `ipc/agentHandlers.ts`                  | 修正         | RuntimeResolver DI 追加、handoff 分岐追加                       |
| `ipc/index.ts`                          | 修正         | composition root で RuntimeResolver を1回生成、各ハンドラに注入 |
| `ipc/chatEditHandlers.ts`               | 修正         | import パスを共通サービスに変更                                 |

### Renderer Process

| ファイル                                                           | 変更種別 | 内容                                    |
| ------------------------------------------------------------------ | -------- | --------------------------------------- |
| `components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` | 新規     | HandoffGuidance 表示コンポーネント      |
| `components/organisms/TerminalHandoffCard/index.ts`                | 新規     | barrel export                           |
| `hooks/useSkillExecution.ts`                                       | 修正     | authMode 分岐追加                       |
| `hooks/useAgent.ts`                                                | 修正     | authMode 分岐追加                       |
| `store/slices/agentSlice.ts`                                       | 修正     | handoffGuidance 状態 + 個別セレクタ追加 |

### 共有型定義

| ファイル                               | 変更種別     | 内容                               |
| -------------------------------------- | ------------ | ---------------------------------- |
| `packages/shared/src/types/handoff.ts` | 新規（検討） | HandoffGuidance 型を共有化する場合 |

## 除外範囲

| 項目                                         | 除外理由                                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| chat-edit ドメインの HandoffGuidance 表示 UI | chat-edit は Main Process で guidance を生成して IPC で返却済み。Renderer 側の表示は別タスク |
| skillCreatorHandlers.ts の新規作成           | 既に composition root に登録済み（L819-822）。runtime routing 分岐の追加のみ                 |
| Preload API の新規チャンネル追加             | 既存の skill/agent チャンネルで handoff guidance を返却可能。新規チャンネルは不要            |
| AnthropicLLMAdapter の変更                   | RuntimeResolver 共通化で LLMAdapter 依存を解除するが、AnthropicLLMAdapter 自体は変更しない   |
| 認証フロー（OAuth / PKCE）の変更             | authMode の取得元（authModeSlice）は変更しない                                               |
| 既存テストの大幅な書き換え                   | DI 追加に伴うモック追加は行うが、既存テストのロジックは変更しない                            |

## 依存関係

```
Phase 1（要件定義） → Phase 2（設計） → Phase 3（設計レビュー）
    → Phase 4（テスト作成） → Phase 5（実装） → Phase 6（テスト拡充）
    → Phase 7（カバレッジ確認） → Phase 8（リファクタリング）
    → Phase 9（品質検証） → Phase 10（最終レビュー）
    → Phase 11（手動テスト） → Phase 12（ドキュメント）
```

## リスク

| リスク                                      | 影響度 | 対策                                                              |
| ------------------------------------------- | ------ | ----------------------------------------------------------------- |
| RuntimeResolver 移動による import 破壊      | 中     | grep で全参照箇所を特定し、一括置換。TypeCheck で検証             |
| DI 追加による既存テスト大量修正（P21/P35）  | 中     | 影響テストファイルを事前に特定し、モック追加計画を立てる          |
| Zustand handoff 状態の無限ループ（P31/P48） | 高     | 個別セレクタのみ使用、派生セレクタには useShallow 適用            |
| IPC 引数形式の不整合（P44/P45）             | 高     | handoff guidance 応答の型を明示的に定義し、Preload 側と一致させる |
