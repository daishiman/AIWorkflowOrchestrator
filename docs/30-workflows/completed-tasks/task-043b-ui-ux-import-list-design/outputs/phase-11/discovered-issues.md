# Phase 11 発見課題

## Open

- なし

## このターンで解消した課題

| ID        | 内容                                                                       | 対応                                           |
| --------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| FIX-11-01 | store `importSkill` が failure 時に throw しないため dialog が閉じてしまう | dialog success 判定を store state ベースへ修正 |
| FIX-11-02 | dialog open 中に panel / dialog の alert が二重表示される                  | panel alert を dialog open 中は抑止            |

## 結論

- blocking / non-blocking ともに open issue は 0
