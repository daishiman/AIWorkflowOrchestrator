# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 7                                   |
| 機能名 | TASK-043A IPC契約・セキュリティ整合 |
| 作成日 | 2026-03-05                          |
| 状態   | spec_created                        |

## 目的

観点別カバレッジ基準と不足時の戻し条件を定義する。

## 実行タスク

- カバレッジ基準定義: line/branch/function の下限値を固定する
- 不足検出ルール定義: カバレッジ不足時の判定基準を固定する
- 差戻し条件定義: 不足時にPhaseを戻す条件を固定する

## 参照資料

| 参照資料         | パス                                                                              | 説明                               |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 5 仕様書   | `phase-5-implementation.md`                                                       | 依存入力                           |
| Phase 6 仕様書   | `phase-6-test-expansion.md`                                                       | 依存入力                           |
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

- Phase 7 で確定した観点を TASK-10A-E-D / TASK-10A-G の検証項目へトレース可能な形で記録する。

## 成果物

| 成果物           | パス                                     | 説明         |
| ---------------- | ---------------------------------------- | ------------ |
| カバレッジ基準書 | `outputs/phase-7/coverage-criteria.md`   | 判定基準     |
| 不足分析レポート | `outputs/phase-7/coverage-gap-report.md` | ギャップ一覧 |

## 完了条件

- [ ] 目的を満たす仕様が定義されている
- [ ] 実行タスクが検証可能な粒度で定義されている
- [ ] 依存Phase参照とaiworkflow参照が整合している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 8: リファクタリング
