# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 4                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

失敗系 lifecycle を正常系から切り分けた targeted test matrix として固定し、実装完了条件を曖昧にしない。

## 実行タスク

- engine 単体の invalid transition テストを定義する
- facade 経由の reject / `success:false` テストを定義する
- `verification_review` prompt 生成テストを定義する
- artifact append 戦略の回帰テストを定義する

## 参照資料

| 資料名       | パス                                                                                        | 説明                 |
| ------------ | ------------------------------------------------------------------------------------------- | -------------------- |
| Phase 2      | `phase-2-design.md`                                                                         | canonical transition |
| parent tests | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md` | 既存不足観点         |

## 成果物

| 成果物      | パス                             | 説明                      |
| ----------- | -------------------------------- | ------------------------- |
| test matrix | `outputs/phase-4/test-matrix.md` | failure path のケース一覧 |

## 統合テスト連携

- Phase 1 の `outputs/phase-1/spec-extraction-map.md` から code anchor を引き、Phase 3 の `outputs/phase-3/design-review-gate.md` で確定した論点だけを test matrix に載せる。
- `outputs/phase-2/failure-transition-matrix.md` の各行に対して少なくとも 1 ケースを割り当て、未割当行を残さない。
- 親 task の failure path 不足観点との差分を `outputs/phase-4/test-matrix.md` に明記し、Phase 6 の拡充入口にする。

## 完了条件

- [ ] reject path の期待状態がテスト化されている
- [ ] `success:false` path の期待状態がテスト化されている
- [ ] `verification_review` path の期待状態がテスト化されている
- [ ] invalid transition / artifact append の回帰ケースがある
- [ ] **本Phase内の全タスクを100%実行完了**
