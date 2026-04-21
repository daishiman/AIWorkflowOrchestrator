# Phase 12: ドキュメント更新

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 12                              |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| taskType            | NON_VISUAL                      |
| implementation_mode | new                             |
| 前提Phase           | Phase 11                        |
| 後続Phase           | Phase 13                        |
| 作成日              | 2026-04-21                      |
| ステータス          | pending                         |

## 目的

Phase 12 の canonical 6成果物を定義し、workflow-local 完了記録と `aiworkflow-requirements` 側の system spec sync を分離して扱う。

## 実行タスク

### Task 12-1: 実装ガイド作成

- Part 1: なぜ必要か → 何をするか の順で説明する
- Part 2: 型、API、error handling、fallback、設定要素を記載する
- `## 視覚証跡` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を明記する

### Task 12-2: システム仕様更新サマリー

- Step 1-A〜1-C の実施内容を記録する
- Step 2 の要否を、Phase 2 の判断書に基づいて記録する
- `implementation_mode` 定義衝突を skill feedback 対象として明記する

### Task 12-3: ドキュメント更新履歴

- workflow-local 更新
- global sync 更新
- validator 結果と planned wording なし確認

### Task 12-4: 未タスク検出

- 0件でも出力する

### Task 12-5: スキルフィードバック

- 改善点なしでも出力する
- `implementation_mode` 正本不一致を改善候補として記録する

### Task 12-6: 準拠チェック

- 6成果物存在確認
- `artifacts.json` / `outputs/artifacts.json` parity
- Step 1 / Step 2 / NON_VISUAL 固定文言確認

## 参照資料

| 資料                 | パス                                                                           | 用途            |
| -------------------- | ------------------------------------------------------------------------------ | --------------- |
| spec update workflow | `.agents/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1 / Step 2 |
| Phase 2 判断書       | `outputs/phase-2/system-spec-sync-decision.md`                                 | Step 2 要否根拠 |
| Phase 11 結果        | `outputs/phase-11/manual-test-result.md`                                       | 代替証跡        |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                | 内容                                  |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| skill creator core spec | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md` | update mode の current facts 反映候補 |
| topic map               | `.agents/skills/aiworkflow-requirements/indexes/topic-map.md`                       | 反映先探索                            |

## 実行手順

1. 6成果物の骨子を作る
2. Step 1 / Step 2 を記録する
3. parity と planned wording なしを確認する
4. skill feedback を残す

## 統合テスト連携

| 判定項目    | 基準                      | 結果    |
| ----------- | ------------------------- | ------- |
| 6成果物定義 | 全ファイルが揃う          | pending |
| Step 2 判断 | 要否と理由が残る          | pending |
| parity      | root / outputs が一致する | pending |

## 多角的チェック観点（AIが判断）

- システム思考: workflow-local と global sync が混線していないか
- why思考: Step 2 必要性の根拠が明確か
- KJ法: close-out の指摘が整理されているか

## サブタスク管理

| サブタスク | 責務                            | 状態    |
| ---------- | ------------------------------- | ------- |
| ST-23      | implementation-guide 定義       | pending |
| ST-24      | system-spec-update-summary 定義 | pending |
| ST-25      | compliance-check 定義           | pending |

## 成果物

| 成果物                   | パス                                                     | 説明                       |
| ------------------------ | -------------------------------------------------------- | -------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 / 視覚証跡 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2            |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`            | 更新内容と validator       |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須                |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点 / なし              |
| 準拠チェック             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence              |

## 完了条件

- [ ] 6成果物が定義されている
- [ ] Step 1-A〜1-C / Step 2 が明記されている
- [ ] NON_VISUAL 固定文言が `implementation-guide.md` に入る前提が明記されている
- [ ] `artifacts.json` / `outputs/artifacts.json` parity が確認対象になっている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次Phase

Phase 13: PR 作成
