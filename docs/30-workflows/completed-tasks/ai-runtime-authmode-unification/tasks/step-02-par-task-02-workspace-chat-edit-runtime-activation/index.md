# workspace-chat-edit-runtime-activation - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| タスク名     | workspace-chat-edit-runtime-activation      |
| 分類         | 設計                                        |
| 対象機能     | Workspace Chat Edit の AI runtime 有効化    |
| 優先度       | 高                                          |
| 見積もり規模 | 中規模                                      |
| ステータス   | spec_created                                |
| 作成日       | 2026-03-13                                  |

## タスク概要

### 目的

Chat Edit の selection 取得と send-with-context を `Integrated API Runtime` へ接続し、integrated runtime が使えない場合は `Claude Code terminal` へ文脈を handoff できる構造を設計する。

### 背景

現状の Chat Edit は selection と LLM 実行の TODO が残り、ipc/index.ts では stub adapter が注入されている。さらに旧 `subscription/api-key` toggle 前提のままでは、consumer subscription を安全に扱えない。Chat Edit では `API runtime` と `terminal handoff` の責務を分けた仕様が必要である。

### 最終ゴール

Chat Edit が Monaco selection、workspacePath 制約、security を維持したまま API runtime へ接続され、未接続時は terminal 起動導線と context summary を返せる設計を確定する。

### 成果物一覧

| 種別               | 成果物                                                                                                                               | 配置先                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                              | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                                 | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/outputs/phase-*/` |
| system spec 同期先 | api-ipc-agent.md / llm-workspace-chat-edit.md / interfaces-llm.md / security-electron-ipc.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                                                 |

## 参照ファイル

| 参照資料                             | パス                                                                                                     | 内容                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| pack parent index                    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                             | 実行順序、依存グラフ、共通方針の正本を確認する                                    |
| pack design audit                    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                               | 多角的監査の結論、禁止事項、依存整合を確認する                                    |
| pack UI/UX 図解                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                    | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                 |
| pack UI/UX 正本                      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                 | 全 surface 共通の状態、CTA、microcopy 契約を確認する                              |
| Task01 foundation investigation      | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承する |
| Task01 settings review investigation | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 設定画面レビュー結果（TC-11-00 相当）を設計へ反映する                             |
| chatEditHandlers                     | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                                                     | stub 実装と TODO の起点                                                           |
| ChatEditService                      | `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`                                            | real adapter を受ける facade                                                      |
| chatEdit IPC bootstrap               | `apps/desktop/src/main/ipc/index.ts`                                                                     | stub adapter 注入の現状を確認する                                                 |
| api-ipc-agent                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                     | Chat Edit IPC 正本                                                                |
| llm-workspace-chat-edit              | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                           | Chat Edit service interface 正本                                                  |
| interfaces-llm                       | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                    | LLM 契約と coverage 指針                                                          |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                             | sender、masking、error envelope の正本                                            |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                          | Workspace Chat Edit の UI component 正本                                          |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名    | 責務                                        | 依存 |
| ---- | ---------- | --------------- | ------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件整理        | Chat Edit の TODO と runtime gap を整理する | -    |
| T-02 | Phase 2    | 設計確定        | selection と LLM 実行の責務境界を設計する   | T-01 |
| T-03 | Phase 3    | レビューゲート  | security と UX の破綻がないかを判定する     | T-02 |
| T-04 | Phase 4-7  | テスト仕様化    | selection と send のテスト仕様を定義する    | T-03 |
| T-05 | Phase 8-13 | 文書化とhandoff | spec sync と handoff を整理する             | T-04 |

## 実行フロー

1. Phase 1-3 で前提、設計、レビューゲートを固める。
2. Phase 4-7 でテスト仕様と coverage 目標を固める。
3. Phase 8-13 で実装順序、文書同期、handoff を固める。

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

- integrated runtime、terminal handoff、IPC、state handoff の接続点を各 Phase で必ず扱う。
- 本タスクでは selection handoff、chat-edit IPC、workspacePath 制約、context summary、terminal launcher を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
