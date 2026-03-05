# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 8                                   |
| 機能名 | TASK-043A IPC契約・セキュリティ整合 |
| 作成日 | 2026-03-05                          |
| 状態   | spec_created                        |

## 目的

契約互換を維持したまま重複・命名ドリフトを解消する方針を定義する。

## 実行タスク

- 重複ロジック整理方針定義: 共通化対象と分離対象を定義する
- エラー正規化方針定義: エラー整形処理の共通化ルールを定義する
- 命名ドリフト防止方針定義: チャネル名と型名の整合ルールを定義する

## 参照資料

| 参照資料         | パス                                                                              | 説明                               |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 仕様書   | `phase-1-requirements.md`                                                         | 依存入力                           |
| Phase 2 仕様書   | `phase-2-design.md`                                                               | 依存入力                           |
| Phase 5 仕様書   | `phase-5-implementation.md`                                                       | 依存入力                           |
| Phase 6 仕様書   | `phase-6-test-expansion.md`                                                       | 依存入力                           |
| Phase 7 仕様書   | `phase-7-coverage-check.md`                                                       | 依存入力                           |
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

- Phase 8 で確定した観点を TASK-10A-E-D / TASK-10A-G の検証項目へトレース可能な形で記録する。

## 成果物

| 成果物           | パス                                         | 説明         |
| ---------------- | -------------------------------------------- | ------------ |
| リファクタ計画   | `outputs/phase-8/refactoring-plan.md`        | 改善方針     |
| 互換性チェック表 | `outputs/phase-8/compatibility-checklist.md` | 契約互換条件 |

## 完了条件

- [ ] 目的を満たす仕様が定義されている
- [ ] 実行タスクが検証可能な粒度で定義されている
- [ ] 依存Phase参照とaiworkflow参照が整合している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 9: 品質保証
