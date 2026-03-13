# skill-docs-runtime-integration - タスク実行仕様書

## ユーザーからの元の指示

```text
AI 機能を `Integrated API Runtime` と `ユーザー操作の Claude Code terminal surface` に分離し、すべての AI surface で切替・handoff・UI/UX・実行順序が分かるタスク仕様書を task-specification-creator と aiworkflow-requirements に従って整備する。実装は行わない。
```

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| タスク名     | skill-docs-runtime-integration     |
| 分類         | 設計                               |
| 対象機能     | Skill Docs 生成の AI runtime 統合  |
| 優先度       | 高                                 |
| 見積もり規模 | 中規模                             |
| ステータス   | spec_created                       |
| 作成日       | 2026-03-13                         |

## タスク概要

### 目的

SkillDocGenerator の stubQueryFn を production 経路から外し、`Integrated API Runtime` で docs 生成を実行できるようにする。integrated runtime が使えない場合は `Claude Code terminal` 用の prompt handoff を返せるようにする。

### 背景

現状の Skill Docs は docs 生成フローを先に成立させるため stubQueryFn を DI 注入している。本番経路では query runtime と error policy を定義し直す必要がある。さらに consumer subscription をアプリ内 docs generation に使わず、manual terminal へ handoff する境界も決める必要がある。

### 最終ゴール

Skill Docs が provider、timeout、retry、guidance を明示した integrated runtime 設計に切り替わり、未接続時は terminal 用 prompt handoff を返せる状態にする。

### 成果物一覧

| 種別               | 成果物                                                                                                              | 配置先                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                             | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration`                  |
| 設計成果物         | outputs/phase-_/_.md                                                                                                | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/outputs/phase-*/` |
| system spec 同期先 | interfaces-agent-sdk-skill.md / api-ipc-agent.md / security-electron-ipc.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                         |

## 参照ファイル

| 参照資料                   | パス                                                                                                                                                                                  | 内容                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| pack parent index          | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                                                                                          | 実行順序、依存グラフ、共通方針の正本を確認する                                                  |
| pack design audit          | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                                                                                            | 多角的監査の結論、禁止事項、依存整合を確認する                                                  |
| pack UI/UX 図解            | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                                                                                                 | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                               |
| pack UI/UX 正本            | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                                                                                              | 全 surface 共通の状態、CTA、microcopy 契約を確認する                                            |
| Task01 foundation outputs  | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-2/design-summary.md`                                        | access matrix / resolver / fail-fast / terminal boundary の共通契約を継承する                   |
| Task01 settings review     | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshots/TC-11-00-settings-authmode-review-board.png` | 設定画面（認証方式カード・Claude Agent SDK APIキー・APIキー設定一覧）の改善要求を設計へ反映する |
| SkillDocGenerator          | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                                                                                           | docs 生成本体を確認する                                                                         |
| ipc index                  | `apps/desktop/src/main/ipc/index.ts`                                                                                                                                                  | queryFn DI の current path を確認する                                                           |
| task UT-9I-001             | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md`                                                                     | 既存 stub 排除タスクを確認する                                                                  |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                                                  | Skill Docs IPC 正本                                                                             |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                                                                                          | registerSkillDocsHandlers の構成正本                                                            |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                     | Skill Docs 関連未タスクと public contract 正本                                                  |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                                          | sender、path validation、error envelope の正本                                                  |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                  | TASK-9I の完了履歴と未タスク正本                                                                |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名    | 責務                                         | 依存 |
| ---- | ---------- | --------------- | -------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件整理        | Skill Docs の stub と要件を整理する          | -    |
| T-02 | Phase 2    | 設計確定        | query runtime と error policy を設計する     | T-01 |
| T-03 | Phase 3    | レビューゲート  | TASK-9I 系の既存仕様と衝突しないかを判定する | T-02 |
| T-04 | Phase 4-7  | テスト仕様化    | queryFn と IPC のテスト仕様を定義する        | T-03 |
| T-05 | Phase 8-13 | 文書化とhandoff | spec sync と残件 formalize 方針を整理する    | T-04 |

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
- 本タスクでは queryFn、provider adapter、timeout、retry、prompt handoff、guidance を統合テスト観点の中心に置く。

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
