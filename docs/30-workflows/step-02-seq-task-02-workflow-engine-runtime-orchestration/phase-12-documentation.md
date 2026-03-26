# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 12                                    |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

engine / facade 境界の実装ガイド、system spec 同期対象、検証履歴、未タスク有無、skill feedback を整理し、Task02 を documentation wave で閉じる。

## 実行タスク

- implementation guide を作成する
- system spec update summary を作成する
- documentation changelog を作成する
- unassigned detection を実施する
- skill feedback report を作成する
- phase12 compliance check を作成する

## 参照資料

| 資料名                   | パス                           | 説明                        |
| ------------------------ | ------------------------------ | --------------------------- |
| Phase 1 要件             | `phase-1-requirements.md`      | owner inventory             |
| Phase 2 設計             | `phase-2-design.md`            | ownership matrix            |
| Phase 5 実装計画         | `phase-5-implementation.md`    | implementation scope        |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`    | fail path                   |
| Phase 7 カバレッジ       | `phase-7-coverage-check.md`    | coverage 観点               |
| Phase 8 リファクタリング | `phase-8-refactoring.md`       | boundary hardening          |
| Phase 9 品質保証         | `phase-9-quality-assurance.md` | QA 観点                     |
| Phase 10 最終レビュー    | `phase-10-final-review.md`     | acceptance と deferred item |
| Phase 11 手動テスト      | `phase-11-manual-test.md`      | manual walkthrough          |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                                            | 内容                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Runtime public IPC 契約    | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | public runtime surface の正本 |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | route baseline の正本         |
| lesson                     | `.agents/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | public surface と drift 防止  |

## 実行手順

### ステップ1: 6 成果物を揃える

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

### ステップ2: sync target を固定する

- aiworkflow-requirements で更新対象になる canonical references を列挙する。
- task-specification-creator 側へ返す template feedback を列挙する。

### ステップ3: validation 結果を固定する

- `validate-phase-output` と `verify-all-specs` の結果を changelog と compliance check に残す。

## 成果物

| 成果物                     | パス                                                     | 説明                         |
| -------------------------- | -------------------------------------------------------- | ---------------------------- |
| ドキュメント更新           | `phase-12-documentation.md`                              | documentation wave の本文    |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 概念説明と技術説明           |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | sync target の一覧           |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validation 結果   |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`          | follow-up の有無             |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | skill への改善フィードバック |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認            |

## 完了条件

- [ ] Phase 12 の 6 成果物が揃っている
- [ ] 境界仕様の同期対象が整理されている
- [ ] validation 結果が documentation changelog と compliance check に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**
