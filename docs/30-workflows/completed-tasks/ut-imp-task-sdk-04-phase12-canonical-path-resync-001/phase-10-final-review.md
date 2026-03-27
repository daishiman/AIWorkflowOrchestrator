# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 10                                                   |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Phase 1、Phase 2、Phase 5 の成果が docs-only remediation として完結しているかを最終判定する。

## 実行タスク

- Phase 1 acceptance を最終確認する
- Phase 2 lane 設計どおりに閉じているか確認する
- Phase 5 実更新が close-out 4 点を覆っているか確認する
- blocker の有無を判定する

## 参照資料

| 資料名       | パス                        | 説明             |
| ------------ | --------------------------- | ---------------- |
| Phase 1 要件 | `phase-1-requirements.md`   | acceptance       |
| Phase 2 設計 | `phase-2-design.md`         | remediation lane |
| Phase 5 実装 | `phase-5-implementation.md` | 実更新対象       |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                           |
| ---------------- | ------------------------------------------------------------------------------------------------- | ------------------------------ |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | completed-tasks close-out 基準 |
| Phase 12 lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | final gate の注意点            |

## 実行手順

1. old path cleanup、validator current path、judgement current fact、follow-up 導線の 4 観点を再確認する
2. docs-only remediation の範囲外である code change、new follow-up、release action が混入していないことを確認する
3. blocker を `なし` か具体名で記録する

## 成果物

| 成果物    | パス                       | 説明                       |
| --------- | -------------------------- | -------------------------- |
| 最終 gate | `phase-10-final-review.md` | final pass or blocker 判定 |

## 統合テスト連携

- Phase 11 は Phase 10 の gate 結果を前提に手動読み合わせを実行する。
- Phase 12 は Phase 10 の blocker 判定を compliance check に反映する。

## 完了条件

- [ ] Phase 1 の acceptance が満たされている
- [ ] Phase 2 の lane 設計どおりに閉じている
- [ ] Phase 5 の close-out 4 点が確認されている
- [ ] blocker 判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
