# Phase 5: 実装

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 5                                   |
| 機能名 | TASK-043A IPC契約・セキュリティ整合 |
| 作成日 | 2026-03-05                          |
| 状態   | spec_created                        |

## 目的

将来実装時の変更順序と責務境界を定義し、契約ドリフトを防止する。

## 実行タスク

- 実装順序仕様定義: Preload→Main→Renderer の変更順を固定する
- 変更境界仕様定義: 許可変更ファイルと禁止変更範囲を固定する
- 契約ドリフト防止定義: 仕様と実装の差分検知ルールを固定する

## 参照資料

| 参照資料         | パス                                                                              | 説明                               |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 4 仕様書   | `phase-4-test-creation.md`                                                        | 依存入力                           |
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

- Phase 5 で確定した観点を TASK-10A-E-D / TASK-10A-G の検証項目へトレース可能な形で記録する。

## 成果物

| 成果物       | パス                                     | 説明     |
| ------------ | ---------------------------------------- | -------- |
| 実装計画書   | `outputs/phase-5/implementation-plan.md` | 実装順序 |
| 変更境界定義 | `outputs/phase-5/change-boundary.md`     | 影響範囲 |

## 完了条件

- [ ] 目的を満たす仕様が定義されている
- [ ] 実行タスクが検証可能な粒度で定義されている
- [ ] 依存Phase参照とaiworkflow参照が整合している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6: テスト拡充
