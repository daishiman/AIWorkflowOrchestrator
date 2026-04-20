# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 11                                                     |
| タスク種別 | NON_VISUAL code task                                   |
| 前Phase    | [phase-10-final-review.md](phase-10-final-review.md)   |
| 次Phase    | [phase-12-documentation.md](phase-12-documentation.md) |

## 目的

UI 変更を伴わない code task として、代替証跡を `manual-test-result.md` に集約する。

## 判定

| 区分                   | 判定   | 理由                                |
| ---------------------- | ------ | ----------------------------------- |
| docs-only/spec_created | いいえ | 変更対象は code behavior の回帰確認 |
| NON_VISUAL code task   | はい   | UI スクリーンショットは不要         |

## 正本ポリシー

- 一次ソースは `outputs/phase-11/manual-test-result.md`
- 補助成果物として `manual-test-checklist.md` と `discovered-issues.md` を持つ
- スクリーンショットは不要

## walkthrough 観点

| 観点                | 内容                                                           |
| ------------------- | -------------------------------------------------------------- |
| code/spec 一致      | `cleanupCancelledSkillDir` 前提で文言が一致しているか          |
| regression evidence | `SC-CANCEL-001` / `SC-CANCEL-002` の証跡導線が明示されているか |
| artifact parity     | Phase 10 / 11 / 12 の成果物名が一致しているか                  |

## 発見事項分類欄

| #   | シナリオ              | 発見事項     | 分類                  | 対応方針     |
| --- | --------------------- | ------------ | --------------------- | ------------ |
| 1   | code/spec walkthrough | 実施後に記入 | Blocker / Note / Info | 実施後に記入 |

## 成果物

| 成果物                | パス                                        |
| --------------------- | ------------------------------------------- |
| manual test result    | `outputs/phase-11/manual-test-result.md`    |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` |
| discovered issues     | `outputs/phase-11/discovered-issues.md`     |

## 完了条件

- [ ] `manual-test-result.md` を一次ソースとして定義している
- [ ] `manual-test-checklist.md` と `discovered-issues.md` が定義されている
- [ ] NON_VISUAL 代替証跡方針が明記されている
