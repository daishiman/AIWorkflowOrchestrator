# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 11                                  |
| 機能名 | TASK-043A IPC契約・セキュリティ整合 |
| 作成日 | 2026-03-05                          |
| 状態   | spec_created                        |

## 目的

ユーザー観点の検証シナリオと証跡要件を定義する。

## 実行タスク

- 手動テストケース定義: 操作手順と期待結果を定義する
- 証跡要件定義: スクリーンショットとログの採取条件を定義する
- 未タスク化条件定義: 手動テスト失敗時の未タスク化基準を定義する

## 参照資料

| 参照資料         | パス                                                                              | 説明                               |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 仕様書   | `phase-1-requirements.md`                                                         | 依存入力                           |
| Phase 2 仕様書   | `phase-2-design.md`                                                               | 依存入力                           |
| Phase 5 仕様書   | `phase-5-implementation.md`                                                       | 依存入力                           |
| Phase 6 仕様書   | `phase-6-test-expansion.md`                                                       | 依存入力                           |
| Phase 7 仕様書   | `phase-7-coverage-check.md`                                                       | 依存入力                           |
| Phase 8 仕様書   | `phase-8-refactoring.md`                                                          | 依存入力                           |
| Phase 9 仕様書   | `phase-9-quality-assurance.md`                                                    | 依存入力                           |
| Phase 10 仕様書  | `phase-10-final-review.md`                                                        | 依存入力                           |
| resource-map     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | タスク種別に対応する正本仕様を抽出 |
| quick-reference  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | IPC/patternの先行固定              |
| interfaces       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skill系インターフェース契約        |
| api-ipc          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPC契約・チャネル責務分離          |
| security-ipc     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender/P42/サニタイズ順序          |
| security-preload | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextIsolation・公開面制約       |
| error            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | ERR_1001/2004/5001 方針            |
| quality          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質ゲート・テスト基準             |

## 実行手順

1. 参照資料から要件・制約・依存関係を抽出する。
2. 実行タスクを成果物へトレースできる形で定義する。
3. 次Phaseへ引き渡す判定条件を明記する。

## 統合テスト連携

- Phase 11 で確定した観点を TASK-10A-E-D / TASK-10A-G の検証項目へトレース可能な形で記録する。

## テストケース

| テストケース | 機能                              | 期待結果                                 | 証跡                                                         |
| ------------ | --------------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| TC-11-01     | `skill:import` 正常系             | import 完了後に一覧へ反映される          | `outputs/phase-11/screenshots/tc-11-01-import-success.png`   |
| TC-11-02     | `skill:import` 入力不正           | `ERR_1001` がUI方針どおり表示される      | `outputs/phase-11/screenshots/tc-11-02-validation-error.png` |
| TC-11-03     | sender検証                        | 未許可 sender 呼び出しを拒否する         | `outputs/phase-11/manual-test-result.md`                     |
| TC-11-04     | `skill:importFromSource` 境界分離 | import UI 導線で当該チャネルが呼ばれない | `outputs/phase-11/manual-test-result.md`                     |

## 画面カバレッジマトリクス

| テストケース | 画面/状態                               | 必須区分 | 証跡                                                         |
| ------------ | --------------------------------------- | -------- | ------------------------------------------------------------ |
| TC-11-01     | SkillManagementPanel / success          | A        | `outputs/phase-11/screenshots/tc-11-01-import-success.png`   |
| TC-11-02     | SkillManagementPanel / error            | B        | `outputs/phase-11/screenshots/tc-11-02-validation-error.png` |
| TC-11-03     | SkillManagementPanel / unauthorized     | B        | `outputs/phase-11/screenshots/tc-11-03-unauthorized.png`     |
| TC-11-04     | SkillManagementPanel / channel-boundary | A        | `outputs/phase-11/screenshots/tc-11-04-channel-boundary.png` |

## 成果物

| 成果物                 | パス                                        | 説明                 |
| ---------------------- | ------------------------------------------- | -------------------- |
| 手動テスト計画         | `outputs/phase-11/manual-test-plan.md`      | 検証手順             |
| 証跡要件               | `outputs/phase-11/evidence-requirements.md` | 証跡定義             |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`    | TC別結果と不具合記録 |
| 画面カバレッジレポート | `outputs/phase-11/screenshot-coverage.md`   | TCと証跡の対応表     |

## 完了条件

- [ ] 目的を満たす仕様が定義されている
- [ ] 実行タスクが検証可能な粒度で定義されている
- [ ] 依存Phase参照とaiworkflow参照が整合している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 12: ドキュメント更新
