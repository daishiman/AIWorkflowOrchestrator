# Phase 9 再現性検証ログ

## 実行日

2026-02-25

## 再実行結果

| 項目          | コマンド                                                                                                | 結果 |
| ------------- | ------------------------------------------------------------------------------------------------------- | ---: |
| TC-01         | `rg -n '^[[:space:]]+[A-Z0-9_]+:\s*"[a-zA-Z0-9:-]+"' apps/desktop/src/preload/channels.ts \| wc -l`     |  203 |
| TC-02         | `rg -o '"[a-zA-Z0-9:-]+"' apps/desktop/src/preload/channels.ts \| sort \| uniq -d \| wc -l`             |    0 |
| TC-03         | `rg -n 'skill:' apps/desktop/src/preload/channels.ts \| wc -l`                                          |   26 |
| TC-06B(total) | `jq '.duplicateHandlers \| length' /tmp/ut-ipc-usage-analysis.json`                                     |    5 |
| TC-06B(skill) | `jq '[.duplicateHandlers[] \| select(.expr\|test("SKILL"))] \| length' /tmp/ut-ipc-usage-analysis.json` |    0 |

## 判定

前回値との乖離なし（差分0件）。
