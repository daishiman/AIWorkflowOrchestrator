# workspace-chat-panel-runtime-alignment - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001            |
| タスク名     | workspace-chat-panel-runtime-alignment                  |
| 分類         | 設計                                                    |
| 対象機能     | Workspace Chat Panel の runtime / terminal handoff 同期 |
| 優先度       | 高                                                      |
| 見積もり規模 | 中規模                                                  |
| ステータス   | spec_created                                            |
| 作成日       | 2026-03-13                                              |

## タスク概要

### 目的

Workspace Chat Panel の stream chat、file context、mention、conversation 永続化が `Integrated API Runtime` と `Claude Code terminal` handoff を同じ authority で扱えるようにする。

### 背景

Workspace Chat Panel は `llm:stream-chat` を使った会話体験を持ち、selected files、mention 補助、conversation 保存までを 1 surface で扱っている。一方で integrated runtime と terminal handoff の最終判定は別タスクで設計された共通基盤に乗せる必要があり、現状の `useWorkspaceChatController` では provider / model と context の handoff が local state 主導である。workspace 系 chat surface を独立責務で仕様化する必要がある。

### 最終ゴール

Workspace Chat Panel が stream / cancel / file context / conversation / integrated runtime / selected config を矛盾なく扱い、未接続時は terminal launcher と context summary を返す設計を確定する。

### 成果物一覧

| 種別               | 成果物                                                                                                                                                      | 配置先                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                     | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                                        | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment/outputs/phase-*/` |
| system spec 同期先 | interfaces-llm.md / llm-streaming.md / ui-ux-feature-components.md / ui-ux-navigation.md / arch-state-management.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                                 |

## 参照ファイル

| 参照資料                   | パス                                                                                                                                                                                  | 内容                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| pack parent index          | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                                                                                          | 実行順序、依存グラフ、共通方針の正本を確認する                                                  |
| pack design audit          | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                                                                                            | 多角的監査の結論、禁止事項、依存整合を確認する                                                  |
| pack UI/UX 図解            | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                                                                                                 | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                               |
| pack UI/UX 正本            | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                                                                                              | 全 surface 共通の状態、CTA、microcopy 契約を確認する                                            |
| Task01 foundation outputs  | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-2/design-summary.md`                                        | access matrix / resolver / fail-fast / terminal boundary の共通契約を継承する                   |
| Task01 settings review     | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshots/TC-11-00-settings-authmode-review-board.png` | 設定画面（認証方式カード・Claude Agent SDK APIキー・APIキー設定一覧）の改善要求を設計へ反映する |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                                                                                                                | workspace chat UI surface を確認する                                                            |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`                                                                                                   | stream / selected config / file context handoff を確認する                                      |
| WorkspaceView              | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                                                                                                                             | panel 統合位置と file preview 連携を確認する                                                    |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                                                                                                                               | `llm:stream-chat` / cancel / selected config authority を確認する                               |
| conversation repository    | `apps/desktop/src/main/repositories/conversationRepository.ts`                                                                                                                        | conversation 永続化の current path を確認する                                                   |
| completed task 059a        | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md`                                                                                                    | 既存 UI / streaming 正本を確認する                                                              |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名     | 責務                                                                          | 依存 |
| ---- | ---------- | ---------------- | ----------------------------------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件整理         | stream / context / conversation / access capability の current gap を整理する | -    |
| T-02 | Phase 2    | 設計確定         | runtime / stream / context / persistence の authority を設計する              | T-01 |
| T-03 | Phase 3    | レビューゲート   | streaming UX と access capability の矛盾がないか判定する                      | T-02 |
| T-04 | Phase 4-7  | テスト仕様化     | streaming / mention / file context / fail-fast のテスト仕様を定義する         | T-03 |
| T-05 | Phase 8-13 | 文書化と handoff | spec sync と rollout 順序を整理する                                           | T-04 |

## 実行フロー

1. Phase 1-3 で stream / context / authority / review gate を固める。
2. Phase 4-7 で streaming / mention / conversation の回帰テスト仕様を固める。
3. Phase 8-13 で実装順序、spec sync、handoff を固める。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11で必須）

- stream、cancel、selected files、mention、conversation、integrated runtime、selected config の接続点を各 Phase で必ず扱う。
- 本タスクでは `llm:stream-chat`、`llm:cancel-stream`、file context、conversation 保存、terminal launcher、guidance 表示を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
