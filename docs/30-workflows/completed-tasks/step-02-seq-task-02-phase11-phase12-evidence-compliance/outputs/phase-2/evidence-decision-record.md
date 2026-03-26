# Evidence Decision Record

## parent workflow 判定

| 項目             | 判定                    | 理由                                                   |
| ---------------- | ----------------------- | ------------------------------------------------------ |
| UI差分の有無     | non_visual              | 今回の corrective wave は docs evidence hardening のみ |
| PNG の扱い       | review_board を 1件保持 | validator と current evidence bundle のアンカーが必要  |
| placeholder 許容 | 不可                    | evidence quality を下げるため禁止                      |

## corrective workflow 判定

| 項目           | 判定                                          | 理由                                                   |
| -------------- | --------------------------------------------- | ------------------------------------------------------ |
| Phase 11 画像  | review_board を 1件保持                       | 本 workflow でも outputs/phase-11 の成果物を揃えるため |
| capture method | `review-board markdown -> qlmanage thumbnail` | local 環境だけで再現可能                               |
