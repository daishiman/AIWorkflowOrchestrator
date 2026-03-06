# Phase 4: テスト作成

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 4                                        |
| Phase名      | テスト作成                               |
| 前提Phase    | Phase 1, Phase 2, Phase 3                |
| 後続Phase    | Phase 5                                  |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E3                              |

## 目的

統合レビューゲートと仕様同期台帳を将来実行する際の失敗条件を、Redテストとして先に固定する。

## 実行タスク

- ゲート判定テスト設計: PASS / MINOR / MAJOR の境界条件をテストケース化する。
- 仕様同期テスト設計: 更新対象、更新不要、条件付き更新の判定をテストケース化する。
- 引き渡しテスト設計: 下流タスクへのリンク、前提成果物、解除条件を検証する。

## 参照資料

| 参照資料               | パス                                                                               | 内容                            |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1要件            | `phase-1-requirements.md`                                                          | テストの根拠                    |
| Phase 2設計            | `phase-2-design.md`                                                                | テスト対象                      |
| Phase 3レビュー結果    | `phase-3-design-review.md`                                                         | 重点テスト対象                  |
| C正本                  | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md` | history / notification の参照元 |
| D正本                  | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`        | navigation の参照元             |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                                       | Phase 1 成果物                  |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                                           | Phase 1 成果物                  |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                                              | Phase 1 成果物                  |
| 統合ゲート設計         | `outputs/phase-2/integration-gate-design.md`                                       | Phase 2 成果物                  |
| 仕様同期マトリクス     | `outputs/phase-2/spec-sync-matrix.md`                                              | Phase 2 成果物                  |
| 引き渡し計画           | `outputs/phase-2/dependency-handoff-plan.md`                                       | Phase 2 成果物                  |
| aiworkflow抽出レポート | `outputs/phase-2/aiworkflow-requirements-extract.md`                               | Phase 2 成果物                  |
| トレーサビリティ表     | `outputs/phase-2/traceability-matrix.md`                                           | Phase 2 成果物                  |
| 設計レビュー結果       | `outputs/phase-3/design-review-result.md`                                          | Phase 3 成果物                  |
| レビュー指摘一覧       | `outputs/phase-3/review-findings.md`                                               | Phase 3 成果物                  |

## システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                          | 内容                          |
| ------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テスト観点                    |
| カバレッジ基準      | `.claude/skills/task-specification-creator/references/coverage-standards.md`  | 結合テストカテゴリと合否基準  |
| IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`         | channel同期の観点             |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`  | 公開API境界の観点             |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | sender順序の観点              |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | FAILケースの観点              |
| 履歴統合            | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md` | history導線の統合観点         |
| ナビゲーションUI    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`       | nav同期の観点                 |
| タスク台帳          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | Step 1-B / 1-C / 2 の分岐観点 |

## 実行手順

### ステップ1: 失敗条件の列挙

欠落入力、誤った更新対象判定、ブロッカー解除漏れを失敗条件として一覧化する。

### ステップ2: テストケース定義

各失敗条件に入力、期待結果、失敗時の戻り先を対応付ける。

### ステップ3: 統合テストマトリクス作成

`coverage-standards.md` の結合テストカテゴリを参照し、state、ipc、security、navigation、documentation の各軸を横断するテストマトリクスを作成する。

## 統合テスト連携

| 観点     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 上流入力 | C/D/A/B の成果物差分をテスト入力に含める                                           |
| 下流入力 | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` のブロッカー解除条件を確認対象に含める |
| 台帳同期 | Step 1-B / Step 1-C / Step 2 の分岐をテストケース化する                            |

## 成果物

| 成果物               | パス                                         | 内容           |
| -------------------- | -------------------------------------------- | -------------- |
| テスト仕様           | `outputs/phase-4/test-specification.md`      | テスト戦略     |
| テストケース         | `outputs/phase-4/test-cases.md`              | 判定ケース一覧 |
| 統合テストマトリクス | `outputs/phase-4/integration-test-matrix.md` | 軸横断の検証表 |

## 完了条件

- [x] PASS / MINOR / MAJOR の境界条件がケース化されている
- [x] 仕様同期の3区分がケース化されている
- [x] 下流タスクへの引き渡し失敗がケース化されている
- [x] 5軸の統合テストマトリクスが作成されている
- [x] `coverage-standards.md` の結合テストカテゴリがテストマトリクスへ反映されている
- [x] 失敗時の戻り先Phaseがケースごとに記録されている

## 次のPhase

Phase 5: 実装

## 多角的チェック観点（AIが判断）

| 観点                          | 適用判断                                                | 仕様参照先                                                                                             |
| ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 要件追跡                      | 要件ごとの失敗条件を固定するため適用                    | `phase-1-requirements.md`                                                                              |
| 設計追跡                      | 設計ごとの失敗条件を固定するため適用                    | `phase-2-design.md`                                                                                    |
| 仕様同期                      | Step 1-B / 1-C / 2 の分岐をテスト対象へ含めるため適用   | `aiworkflow-requirements: task-workflow.md`                                                            |
| Preload / セキュリティ / ナビ | ipc / navigation の失敗条件と公開境界を固定するため適用 | `aiworkflow-requirements: security-api-electron.md`, `security-electron-ipc.md`, `ui-ux-navigation.md` |
| エラーハンドリング            | FAILケースの戻り値を固定するため適用                    | `aiworkflow-requirements: error-handling.md`                                                           |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. 失敗条件の列挙
2. テストケース定義
3. 統合テストマトリクス作成
4. 戻り先Phaseの定義
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 失敗条件とテストケースを成果物へ反映
- [x] 統合テストマトリクスを成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 4
```
