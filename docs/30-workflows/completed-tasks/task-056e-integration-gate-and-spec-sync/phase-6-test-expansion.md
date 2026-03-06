# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 6                                        |
| Phase名      | テスト拡充                               |
| 前提Phase    | Phase 5                                  |
| 後続Phase    | Phase 7                                  |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E3                              |

## 目的

統合ゲートと仕様同期台帳の回帰ケースを拡充し、正本パス変更、同期漏れ、引き渡し漏れの再発を防ぐ。

## 実行タスク

- 回帰ケース追加: パス変更、statusドリフト、spec_created 判定漏れの回帰ケースを追加する。
- 台帳差分ケース追加: 更新区分の誤判定を回帰ケースへ追加する。
- 下流引き渡しケース追加: ブロッカー解除漏れを回帰ケースへ追加する。

## 参照資料

| 参照資料             | パス                                                                               | 内容               |
| -------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| Phase 5実装          | `phase-5-implementation.md`                                                        | 回帰対象           |
| A正本                | `docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md`      | パス変動の確認     |
| C正本                | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md` | history 連携の確認 |
| D正本                | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`        | nav 連携の確認     |
| テスト仕様           | `outputs/phase-4/test-specification.md`                                            | Phase 4 成果物     |
| テストケース         | `outputs/phase-4/test-cases.md`                                                    | Phase 4 成果物     |
| 統合テストマトリクス | `outputs/phase-4/integration-test-matrix.md`                                       | Phase 4 成果物     |
| 実装計画             | `outputs/phase-5/implementation-plan.md`                                           | Phase 5 成果物     |
| レビューゲート       | `outputs/phase-5/review-gate.md`                                                   | Phase 5 成果物     |
| 仕様同期対象一覧     | `outputs/phase-5/spec-sync-targets.md`                                             | Phase 5 成果物     |

## システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                   |
| ------------------ | ---------------------------------------------------------------------------- | ---------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 回帰観点               |
| カバレッジ基準     | `.claude/skills/task-specification-creator/references/coverage-standards.md` | 回帰優先順位と測定基準 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | FAIL再現ケース         |
| タスク台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | statusドリフト観点     |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 過去の再発例           |

## 実行手順

### ステップ1: 回帰リスク整理

056系で発生したパス混在、台帳ズレ、同期漏れを回帰リスクとして整理する。

### ステップ2: 回帰ケース追加

各リスクに対して再現手順、期待結果、検証コマンド、FAIL時の記録形式を追加する。

### ステップ3: 実行順序更新

回帰ケースの優先順位を付け、Phase 7 のカバレッジ対象へ引き渡す。

## 統合テスト連携

| 観点         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| パス整合     | completed-tasks と current path の混在を検出対象へ含める     |
| 台帳整合     | `spec_created` と downstream status のズレを検出対象へ含める |
| 引き渡し整合 | 下流タスクが参照するリンク切れを検出対象へ含める             |

## 成果物

| 成果物         | パス                                     | 内容               |
| -------------- | ---------------------------------------- | ------------------ |
| テスト拡充計画 | `outputs/phase-6/test-expansion-plan.md` | 回帰ケース追加計画 |
| 回帰マトリクス | `outputs/phase-6/regression-matrix.md`   | 回帰対象一覧       |

## 完了条件

- [x] パス混在の回帰ケースが追加されている
- [x] statusドリフトの回帰ケースが追加されている
- [x] 仕様同期漏れの回帰ケースが追加されている
- [x] 下流引き渡し漏れの回帰ケースが追加されている
- [x] `coverage-standards.md` を使った優先順位づけが記録されている
- [x] Phase 7 へ渡す優先順位が記録されている

## 次のPhase

Phase 7: テストカバレッジ確認

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                    | 仕様参照先                                                                                                                       |
| ------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 回帰管理           | 056系で再発した論点を再度固定するため適用   | `aiworkflow-requirements: lessons-learned.md`                                                                                    |
| 台帳整合           | status ドリフトを再発させないため適用       | `aiworkflow-requirements: task-workflow.md`                                                                                      |
| パス整合           | completed / current path 混在を防ぐため適用 | `phase-5-implementation.md`                                                                                                      |
| 品質維持           | 回帰ケース優先順位を固定するため適用        | `aiworkflow-requirements: quality-requirements.md`, `.claude/skills/task-specification-creator/references/coverage-standards.md` |
| エラーハンドリング | FAIL再現ケースの粒度を固定するため適用      | `aiworkflow-requirements: error-handling.md`                                                                                     |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. 回帰リスク整理
2. 回帰ケース追加
3. 優先順位更新
4. Phase 7 への引き渡し整理
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 回帰リスクと回帰ケースを成果物へ反映
- [x] 優先順位と引き渡し結果を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 6
```
