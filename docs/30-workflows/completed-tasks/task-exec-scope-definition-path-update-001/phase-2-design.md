# Phase 2: 設計

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 2                                          |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

docs-only patch の topology、patch 順序、validation matrix を実装者が迷わない粒度まで落とす。

## 実行タスク

- target path decision を確定する
- D. Implementation Anchor の patch shape を定義する
- validation matrix を AC ごとに結びつける
- stale source / duplicate source / CLOSED issue の扱いを no-op 条件として固定する

## 参照資料

| 資料名       | パス                                                                                                                                     | 説明                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1      | `phase-1-requirements.md`                                                                                                                | 要件固定                          |
| target file  | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` | patch 本体                        |
| shared type  | `packages/shared/src/types/execution-capability.ts`                                                                                      | existence 確認対象                |
| parent scope | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` | D. Implementation Anchor の現行形 |

## 成果物

| 成果物               | パス                                      | 説明                  |
| -------------------- | ----------------------------------------- | --------------------- |
| design summary       | `outputs/phase-2/design-summary.md`       | patch topology        |
| target path decision | `outputs/phase-2/target-path-decision.md` | candidate path 比較   |
| validation matrix    | `outputs/phase-2/validation-matrix.md`    | AC と evidence の対応 |

## 統合テスト連携

- Phase 4 は `outputs/phase-2/validation-matrix.md` をそのまま command suite へ転写する。
- Phase 5 は `outputs/phase-2/target-path-decision.md` の採否を崩さず、1 ファイル patch に限定する。

## 完了条件

- [ ] target path decision が表形式で記録されている
- [ ] patch shape が D. Implementation Anchor の 1 行追加に限定されている
- [ ] validation matrix が AC-1 から AC-4 をカバーしている
- [ ] **本Phase内の全タスクを100%実行完了**
