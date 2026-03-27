# task-exec-scope-definition-path-update-001 - タスク実行仕様書

## ユーザーからの元の指示

```text
Issue #1664 が closed でも実行対象として扱い、設計書ベースで task spec を作成する
```

## メタ情報

| 項目         | 内容                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-EXEC-01                                                                                                        |
| タスク名     | scope-definition.md への execution-capability.ts パス追記                                                         |
| タスク種別   | docs-improvement / follow-up                                                                                      |
| 優先度       | 高                                                                                                                |
| ステータス   | completed                                                                                                         |
| 親タスク     | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                                                         |
| 元タスク     | `docs/30-workflows/completed-tasks/unassigned-task/task-exec-scope-definition-path-update-001.md`                 |
| 重複参考     | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-exec-01-scope-definition-execution-capability-path.md` |
| GitHub Issue | #1664                                                                                                             |
| Issue確認日  | 2026-03-27                                                                                                        |
| Issue状態    | CLOSED                                                                                                            |
| 作成日       | 2026-03-27                                                                                                        |

## 概要

本 workflow は、Task01 Phase 10 MINOR-1 として formalize された `UT-EXEC-01` を、実行担当者がそのまま着手できる 13 Phase 仕様へ落とした follow-up workflow である。

論点は単なる 1 行追記ではない。source の unassigned 指示書は target path を `docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` としているが、current worktree にそのパスは存在しない。実際に `execution-capability.ts` の追記漏れが残っているのは、`docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` の D. Implementation Anchor 節である。

## この task で固定すること

- 実更新対象を Task01 の `outputs/phase-1/scope-definition.md` に固定する
- `packages/shared/src/types/execution-capability.ts` の存在を current facts で確認してから追記する
- 既存 2 行（`auth-mode.ts` / `RuntimePolicyResolver.ts`）を不変のまま維持する
- source unassigned 文書の stale path を設計書側で吸収し、実装 task の誤着手を防ぐ
- Issue #1664 が CLOSED でも execution target から外さないことを明記する

## 非対象

- `execution-capability.ts` 自体の型・実装変更
- Task01 以外の workflow 文書の一括 path 修正
- 重複 unassigned 文書 2 本の統合整理
- `arch-execution-capability-contract.md` 内の別文脈 `UT-EXEC-01` 表記是正
- commit、push、PR 作成

## 受入基準

| ID   | 基準                                                                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | 実更新対象が `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` で固定されている |
| AC-2 | D. Implementation Anchor 節に `packages/shared/src/types/execution-capability.ts` が既存フォーマットで追加される                                                       |
| AC-3 | 既存 2 行の Implementation Anchor 記述が変更されない                                                                                                                   |
| AC-4 | stale source path / duplicate unassigned docs / CLOSED issue の 3 条件を読んだだけで実行者が誤解しない                                                                 |

## 依存関係

| 種別        | 参照先                                                                                                                                   | 役割                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| source      | `docs/30-workflows/completed-tasks/unassigned-task/task-exec-scope-definition-path-update-001.md`                                        | main source task                     |
| source      | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-exec-01-scope-definition-execution-capability-path.md`                        | 歴史的 duplicate source              |
| predecessor | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md`                            | parent workflow の正本               |
| predecessor | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` | 実更新対象                           |
| canonical   | `.agents/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`                          | current canonical workflow 入口      |
| canonical   | `.agents/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`                                                | `execution-capability.ts` の仕様背景 |

## 現行アンカー

| ファイル                                                                                                                                 | 観察点                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` | D. Implementation Anchor に `execution-capability.ts` が未記載 |
| `packages/shared/src/types/execution-capability.ts`                                                                                      | `AccessCapability` と関連 pure function の実装正本             |
| `docs/30-workflows/completed-tasks/unassigned-task/task-exec-scope-definition-path-update-001.md`                                        | target path が stale                                           |
| `docs/30-workflows/completed-tasks/unassigned-task/task-ut-exec-01-scope-definition-execution-capability-path.md`                        | duplicate source。Issue #1421 と古い path 参照が残る           |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| 真の論点             | 追記漏れそのものより、stale path のまま実行すると誤ファイルに着手すること                        |
| 依存関係・責務境界   | 実更新は Task01 scope-definition のみ。source task 整理や wider canonical sync は別責務          |
| 価値とコストの不均衡 | 1 行修正 task だが、設計書で target path を固定しないと review / execution cost が逆に増える     |
| 改善優先順位         | 1. actual target 決定 2. patch 形状固定 3. verification command 固定 4. close-out no-op 条件固定 |
| 4条件評価            | 価値性・実現性・整合性・運用性は docs-only patch に限定することで満たす                          |

## Phase 1-3 設計結果

| Phase | 成果                                                           | 参照                                                   |
| ----- | -------------------------------------------------------------- | ------------------------------------------------------ |
| 1     | source facts、actual target、scope、AC を固定                  | [phase-1-requirements.md](./phase-1-requirements.md)   |
| 2     | patch topology、target path decision、validation matrix を固定 | [phase-2-design.md](./phase-2-design.md)               |
| 3     | stale path を blocker 化せず PASS で進める gate 条件を固定     | [phase-3-design-review.md](./phase-3-design-review.md) |

## ディレクトリ構成

```text
task-exec-scope-definition-path-update-001/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/
    ├── phase-2/
    ├── phase-3/
    ├── phase-4/
    ├── phase-5/
    ├── phase-6/
    ├── phase-7/
    ├── phase-8/
    ├── phase-9/
    ├── phase-10/
    ├── phase-11/
    ├── phase-12/
    └── phase-13/
```

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 実行順

1. Phase 1 で stale source path と actual target path を切り分ける
2. Phase 2 で patch 形状と verification command を固定する
3. Phase 3 で issue closed 状態と duplicate source を blocker から外す
4. Phase 4-7 で docs-only patch の差分検証を先に閉じる
5. Phase 8-12 で wording / evidence / no-op 条件を揃える
6. Phase 13 はユーザー明示指示まで blocked のまま維持する

## 完了定義

| 状態                 | 意味                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| spec_created         | workflow と Phase 1-13 仕様書が揃い、実行順と evidence が固定された状態 |
| implementation_ready | Phase 1-3 gate が閉じ、実行担当者が Phase 4 へ進める状態                |
| completed            | actual target patch と verification と close-out 記録が閉じた状態       |

## 注意事項

- Issue #1664 は 2026-03-27 時点で `CLOSED` だが、ユーザー指示に従い execution target として扱う
- source unassigned 文書の target path は stale であり、そのまま実行しない
- `UT-EXEC-01` は history 上の重複・流用があるため、実装時は path を主キーとして判断する
- commit、push、PR は行わない
