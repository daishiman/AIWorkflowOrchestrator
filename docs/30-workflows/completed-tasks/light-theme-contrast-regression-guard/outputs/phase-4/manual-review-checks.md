# Phase 4 Manual Review Checks

## Phase 11 チェックリスト

| 項目                     | 確認内容                                              | 合格条件                                  |
| ------------------------ | ----------------------------------------------------- | ----------------------------------------- |
| Current build            | `apps/desktop/out/renderer` を配信しているか          | build asset 名が metadata と一致する      |
| Selector capture         | route 全景でなく要素 capture になっているか           | selector 単位で png を取得する            |
| Apple UI/UX 観点         | hierarchy / contrast / spacing / helper text を見たか | 画面ごとに所見を残す                      |
| current / baseline split | issue を 2 層で記録したか                             | `discovered-issues.md` に分離して記載する |

## Phase 12 チェックリスト

| 項目                 | 確認内容                                                                               | 合格条件                                       |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------- |
| implementation-guide | Part 1 / Part 2 / 型 / CLI / edge case                                                 | validator PASS                                 |
| spec sync            | `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` を更新したか | 3 ファイルに今回の guard 知見が残る            |
| skill feedback       | 2 skill への改善提案を記録したか                                                       | `skill-feedback-report.md` が存在する          |
| mirror drift         | `.claude` と `.agents` の差分を記録したか                                              | drift の有無が `spec-update-summary.md` にある |

## レビュー時の禁止事項

- baseline backlog を current 失敗として扱わない。
- light theme contrast の remediation 自体を本 workflow 内で実施しない。
- screenshot を別 workflow / 別 build artifact から流用しない。
