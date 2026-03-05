# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 6                                   |
| 機能名 | TASK-043A IPC契約・セキュリティ整合 |
| 作成日 | 2026-03-05                          |
| 状態   | spec_created                        |

## 目的

異常系・回帰系の追加観点を定義して再発防止を強化する。

## 実行タスク

- 異常系ケース拡充: バリデーション失敗と業務失敗のケースを追加する
- 回帰ケース拡充: 既存導線を壊さない確認ケースを追加する
- セキュリティケース拡充: sender/P42/境界検証のケースを追加する

## 参照資料

| 参照資料         | パス                                                                              | 説明                               |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 5 仕様書   | `phase-5-implementation.md`                                                       | 依存入力                           |
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

- Phase 6 で確定した観点を TASK-10A-E-D / TASK-10A-G の検証項目へトレース可能な形で記録する。

## 成果物

| 成果物         | パス                                       | 説明       |
| -------------- | ------------------------------------------ | ---------- |
| テスト拡充計画 | `outputs/phase-6/test-expansion-plan.md`   | 追加戦略   |
| 追加テスト一覧 | `outputs/phase-6/additional-test-cases.md` | 追加ケース |

## 完了条件

- [ ] 目的を満たす仕様が定義されている
- [ ] 実行タスクが検証可能な粒度で定義されている
- [ ] 依存Phase参照とaiworkflow参照が整合している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7: テストカバレッジ確認
