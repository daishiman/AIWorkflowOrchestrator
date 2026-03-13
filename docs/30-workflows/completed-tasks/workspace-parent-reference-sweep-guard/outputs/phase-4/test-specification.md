# テスト仕様書

## 方針

- path drift / status drift / mirror drift を別ケースとして扱う
- repo 実体に依存する確認は root script で行う
- red case は一時 fixture で再現し、green は current repo で確認する

## テスト対象

| TC    | 対象                                                                            | 期待する red                                    | 期待する green                                   |
| ----- | ------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| TC-01 | parent pointer (`task-060`)                                                     | `./task-058b...md` などの不存在リンクを検出する | `completed-tasks/*/index.md` 参照で PASS         |
| TC-02 | master index (`task-000-master-index.md`)                                       | 04A/04B/04C の参照先が実在しないと FAIL         | completed-task pointer docs 参照で PASS          |
| TC-03 | completed-task pointer docs / task-090                                          | `未着手` / `pending` を検出する                 | 移管済み status で PASS                          |
| TC-04 | system spec (`task-workflow.md`, `ui-ux-feature-components.md`, `interfaces-*`) | `docs/30-workflows/task-059a...` を検出する     | `completed-tasks/task-059a...` に統一されて PASS |
| TC-05 | capture script (`capture-task-058b...`)                                         | 旧 workflow root を検出する                     | completed workflow root で PASS                  |
| TC-06 | mirror root (`.claude` / `.agents`)                                             | 内容差分を作ると FAIL                           | `diff -qr` 0件で PASS                            |

## 実装単位

1. `scripts/validate-workspace-parent-reference-sweep.mjs`
2. `scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs`
3. docs patch 群

## 成功条件

- TC-01〜06 が root script と test で再現できる
- root script が `--json` で drift class ごとの件数を返す
- docs patch 後に current repo で `ok=true` になる
