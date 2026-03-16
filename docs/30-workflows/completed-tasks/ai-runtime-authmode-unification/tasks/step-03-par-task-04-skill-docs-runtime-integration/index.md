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
| 分類         | 実装                               |
| 対象機能     | Skill Docs 生成の AI runtime 統合  |
| 優先度       | 高                                 |
| 見積もり規模 | 中規模                             |
| ステータス   | completed                          |
| 作成日       | 2026-03-13                         |
| 更新日       | 2026-03-16                         |

## タスク概要

### 目的

SkillDocGenerator の stubQueryFn を production 経路から外し、`Integrated API Runtime` で docs 生成を実行できるようにする。integrated runtime が使えない場合は `Claude Code terminal` 用の prompt handoff を返せるようにする。

### 背景

現状の Skill Docs は docs 生成フローを先に成立させるため stubQueryFn を DI 注入している。本番経路では query runtime と error policy を定義し直す必要がある。さらに consumer subscription をアプリ内 docs generation に使わず、manual terminal へ handoff する境界も決める必要がある。

### 最終ゴール

Skill Docs が provider、timeout、retry、guidance を明示した integrated runtime 設計に切り替わり、未接続時は terminal 用 prompt handoff を返せる状態にする。

### 設計概要（Phase 1-3 で確定）

#### 新規型定義

| 型名                        | 責務                                                                      |
| --------------------------- | ------------------------------------------------------------------------- |
| LLMDocQueryAdapter          | query(prompt) / isAvailable() / getProviderName()                         |
| DocOperationResult\<T\>     | success / data? / error?（code, category, message, retryable, guidance?） |
| SkillDocsCapabilityResolver | integrated-api / guidance-only / terminal-handoff の 3 path 判定          |

#### エラー分類（7 種別）

| エラー種別           | コード | カテゴリ         | retryable |
| -------------------- | ------ | ---------------- | --------- |
| API key 未設定       | 2001   | BUSINESS         | false     |
| API key 無効         | 2002   | BUSINESS         | false     |
| LLM timeout          | 3001   | EXTERNAL_SERVICE | true      |
| LLM rate limit (429) | 3002   | EXTERNAL_SERVICE | true      |
| LLM server error     | 3003   | EXTERNAL_SERVICE | true      |
| IPC 通信エラー       | 4001   | INFRASTRUCTURE   | true      |
| 内部エラー           | 5001   | INTERNAL         | false     |

#### UI 状態遷移（7 状態）

```
[ready] ---(generate click)---> [generating]
[generating] ---(success)---> [result]
[generating] ---(timeout)---> [timeout-guidance]
[generating] ---(rate limit)---> [rate-limit-wait]
[generating] ---(error)---> [error-guidance]
[guidance-only] (API key 未設定で初期表示)
```

### 成果物一覧

| 種別               | 成果物                                                                                                                                                               | 配置先                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 仕様書             | index.md / phase-1〜13 / artifacts.json                                                                                                                              | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration`                  |
| 設計成果物         | outputs/phase-\*/\*.md                                                                                                                                               | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/outputs/phase-*/` |
| system spec 同期先 | interfaces-agent-sdk-skill-reference-share-debug-analytics.md / api-ipc-agent-details.md / security-electron-ipc-advanced.md / task-workflow.md / lessons-learned.md | `/.claude/skills/aiworkflow-requirements/references/`                                                                         |

## 参照ファイル

| 参照資料                                 | パス                                                                                                              | 内容                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| pack parent index                        | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                      | 実行順序、依存グラフ、共通方針の正本を確認する                                    |
| pack design audit                        | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                        | 多角的監査の結論、禁止事項、依存整合を確認する                                    |
| pack UI/UX 図解                          | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                             | 5図セットの画面構成、状態遷移、CTA 導線を確認する                                 |
| pack UI/UX 正本                          | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                          | 全 surface 共通の状態、CTA、microcopy 契約を確認する                              |
| Task01 foundation investigation          | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md`          | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承する |
| Task01 settings review investigation     | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md`          | 設定画面レビュー結果（TC-11-00 相当）を設計へ反映する                             |
| SkillDocGenerator                        | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体（stubQueryFn の DI 経路）を確認する                                 |
| ipc index                                | `apps/desktop/src/main/ipc/index.ts`                                                                              | queryFn DI の current path（L786-793）を確認する                                  |
| skillHandlers                            | `apps/desktop/src/main/ipc/handlers/skillHandlers.ts`                                                             | registerSkillDocsHandlers（L1049-1271）を確認する                                 |
| task UT-9I-001                           | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスク（LLM プロバイダ連携）を確認する                              |
| task UT-9I-002                           | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md`            | テンプレート CRUD タスクを確認する                                                |
| api-ipc-agent                            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本（4 チャンネル契約）                                           |
| architecture-overview                    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の Pattern 3 構成正本                                   |
| interfaces-agent-sdk-skill               | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | DocGenerationRequest / GeneratedDoc 型定義正本                                    |
| security-electron-ipc                    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | 4 層検証（sender / P42 / 入力制約 / エラー境界）の正本                            |
| workflow-ai-runtime-authmode-unification | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`                   | `Integrated API Runtime` と `Claude Code Terminal Surface` の責務分離正本         |
| ui-ux-settings                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                             | 設定画面3領域（認証方式/APIキー入力/APIキー一覧）の表示契約                       |
| interfaces-auth                          | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                            | capability 基盤（integratedRuntime / terminalSurface / both / none）型契約        |
| api-ipc-system                           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                             | runtime 解決経路と settings 反映 IPC 契約                                         |
| legacy-ordinal-family-register           | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`                             | 旧 filename 互換の台帳（artifact inventory の逆引き）                             |
| task-workflow                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I 完了履歴（2026-02-28、64テスト全PASS）と未タスク正本                      |

## タスク分解サマリー

| ID   | フェーズ | サブタスク名     | 責務                                                                       | 依存 | サブタスク数 |
| ---- | -------- | ---------------- | -------------------------------------------------------------------------- | ---- | ------------ |
| T-01 | Phase 1  | 要件定義         | stub 棚卸し、runtime/handoff/access matrix/エラー分類の要件整理（5タスク） | -    | 5            |
| T-02 | Phase 2  | 設計確定         | adapter/失敗ポリシー/IPC正規化/capability/UI状態遷移の設計（5タスク）      | T-01 | 5            |
| T-03 | Phase 3  | 設計レビュー     | 6観点レビュー + 8 Pitfall チェック（2タスク）                              | T-02 | 2            |
| T-04 | Phase 4  | テスト仕様化     | adapter/DI/IPC/capability の 23 テストケース定義（4タスク）                | T-03 | 4            |
| T-05 | Phase 5  | 実装計画         | adapter/queryFn差替/capability/error拡張/handoff の実装順序（5タスク）     | T-04 | 5            |
| T-06 | Phase 6  | テスト拡充       | edge case/回帰/境界/セキュリティの 19 追加テスト（4タスク）                | T-05 | 4            |
| T-07 | Phase 7  | カバレッジ確認   | ファイル別目標とgap検出ループ（1タスク）                                   | T-06 | 1            |
| T-08 | Phase 8  | リファクタリング | PromptBuilder/ErrorMapper/withDocHandler の責務分離（5タスク）             | T-07 | 5            |
| T-09 | Phase 9  | 品質検証         | 型安全/セキュリティ/UI-UX/非機能/lint の横断確認（5タスク）                | T-08 | 5            |
| T-10 | Phase 10 | 最終レビュー     | AC検証/7観点レビュー/blocker判定（3タスク）                                | T-09 | 3            |
| T-11 | Phase 11 | 手動テスト       | 5代表シナリオの手動確認（5タスク）                                         | T-10 | 5            |
| T-12 | Phase 12 | ドキュメント     | 実装ガイド/spec sync/changelog/未タスク/feedback（5タスク）                | T-11 | 5            |
| T-13 | Phase 13 | PR作成           | 変更範囲/PR本文/チェックリスト（3タスク）                                  | T-12 | 3            |

## 実行フロー

1. **Phase 1-3（直列）**: 前提、設計、レビューゲートを固める。
2. **Phase 4-7（Phase 3 後に着手）**: テスト仕様と coverage 目標を固める。
3. **Phase 8-10（Phase 3 後に着手）**: リファクタリング方針、品質検証、最終レビューを固める。
4. **Phase 11-13（Phase 10 後に着手）**: 手動テスト、文書同期、PR 準備を固める。

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  | サブタスク数 | 完了条件数 |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- | ------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   | 5            | 7          |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   | 5            | 8          |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   | 2            | 7          |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   | 4            | 4+         |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   | 5            | 5+         |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed   | 4            | 4+         |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   | 1            | 3+         |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   | 5            | 8          |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   | 5            | 11         |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   | 3            | 6          |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed   | 5            | 7          |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed   | 5            | 11         |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started | 3            | 6          |

## 受入基準

| ID   | 受入基準                                                                                 |
| ---- | ---------------------------------------------------------------------------------------- |
| AC-1 | docs 生成に必要な runtime 要件（プロバイダ、API key、timeout、retry）が定義されている    |
| AC-2 | stub 排除の対象範囲が明確になっている（4 IPC チャンネルの影響範囲）                      |
| AC-3 | terminal handoff の 3 経路（timeout / missing credentials / rate limit）が定義されている |
| AC-4 | access matrix の Skill Docs 適用方針（3 path）が Task01 契約と整合している               |

## 統合テスト連携（Phase 1〜11で必須）

- integrated runtime、terminal handoff、IPC、state handoff の接続点を各 Phase で必ず扱う。
- 本タスクでは queryFn、provider adapter、timeout、retry、prompt handoff、guidance を統合テスト観点の中心に置く。

## 既知の落とし穴（タスク横断）

| Pitfall | 内容                                    | 適用 Phase       |
| ------- | --------------------------------------- | ---------------- |
| P23     | API 二重定義の型管理複雑性              | Phase 1, 2, 5    |
| P32     | 型定義の二箇所同時更新必須              | Phase 1, 2, 5    |
| P34     | 遅延初期化が必要な DI パターン          | Phase 2, 5, 8    |
| P42     | 文字列引数の .trim() バリデーション漏れ | Phase 1, 4, 6, 9 |
| P44     | IPC インターフェース不整合              | Phase 2, 3, 5    |
| P45     | IPC 引数命名の契約ドリフト              | Phase 2, 3, 5    |
| P48     | non-null assertion による安全性偽装     | Phase 1, 9       |
| P54     | safeRegister パターン不適合             | Phase 2, 8       |

## Phase完了時の必須アクション

- 本Phase内の全タスクを100%実行完了と記録する。
- 成果物パスと完了条件を確認する。
- artifacts.json を更新対象として扱う。
