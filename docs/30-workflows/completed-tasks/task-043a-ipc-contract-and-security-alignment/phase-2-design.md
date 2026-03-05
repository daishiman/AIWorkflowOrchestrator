# Phase 2: 設計

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 2                                   |
| 機能名 | TASK-043A IPC契約・セキュリティ整合 |
| 作成日 | 2026-03-05                          |
| 状態   | spec_created                        |

## 目的

要求を契約マトリクスと検証パイプラインへ設計変換する。

## 実行タスク

- 契約マトリクス設計: request/response/validation の対応表を作成する
- セキュリティパイプライン設計: sender/P42/境界/サニタイズ順序を固定する
- エラーマッピング設計: `ERR_1001` / `ERR_2004` / `ERR_5001` の扱いを定義する
- テスト引き渡し設計: SubAgent-D に渡す検証観点を定義する

## 参照資料

| 参照資料         | パス                                                                              | 説明                               |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 仕様書   | `phase-1-requirements.md`                                                         | 依存入力                           |
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

- Phase 2 で確定した観点を TASK-10A-E-D / TASK-10A-G の検証項目へトレース可能な形で記録する。

## 成果物

| 成果物             | パス                                          | 説明                        |
| ------------------ | --------------------------------------------- | --------------------------- |
| 契約設計書         | `outputs/phase-2/ipc-contract-design.md`      | request/response/validation |
| セキュリティ設計書 | `outputs/phase-2/security-pipeline-design.md` | 検証順序                    |
| エラー設計書       | `outputs/phase-2/error-mapping-design.md`     | ERR方針                     |

## 完了条件

- [ ] 目的を満たす仕様が定義されている
- [ ] 実行タスクが検証可能な粒度で定義されている
- [ ] 依存Phase参照とaiworkflow参照が整合している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3: 設計レビューゲート
