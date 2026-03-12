# Phase 3 指摘一覧

## Major

なし。

## Minor

| ID     | 内容                                                                               | 対応方針                                         |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| MIN-01 | create 成功後に返る値が `path` のため、skill 名導出を各所に散らすとバグ化しやすい  | `path.basename` を使う共通 helper を導入する     |
| MIN-02 | session card に分析 UI を詰め込みすぎると既存 `SkillAnalysisView` と責務が競合する | session card は summary と主要 action に限定する |
| MIN-03 | `detectMode` を blocking にすると create が不要に失敗する                          | mode 判定 failure は非 blocking とする           |

## Note

| ID      | 内容                                                                                  |
| ------- | ------------------------------------------------------------------------------------- |
| NOTE-01 | list view 上部へ card を置くため、既存 empty state 文言との並び順を調整する必要がある |
| NOTE-02 | wizard 起動ボタンの文言は「詳細設定で作成する」に固定したほうが混乱が少ない           |
