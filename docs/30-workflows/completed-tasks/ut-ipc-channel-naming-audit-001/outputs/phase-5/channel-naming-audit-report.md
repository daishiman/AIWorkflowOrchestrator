# Phase 5 命名監査レポート

## 監査サマリ

- 実行日: 2026-02-25
- 対象チャネル: 203
- `skill:` 対象: 26
- 準拠: 20
- 違反: 6
- 値重複: 0

## 適用ルール

1. `skill:{動詞}`（camelCase許容）
2. `skill:{動詞}FromSource`
3. `skill:{動詞}Source`

## skillチャネル全件判定

| key                       | value                     | result    | usage(main/preload/renderer) |
| ------------------------- | ------------------------- | --------- | ---------------------------- |
| SKILL_ABORT               | skill:abort               | pass      | 11/10/0                      |
| SKILL_ANALYZE             | skill:analyze             | pass      | 6/2/0                        |
| SKILL_COMPLETE            | skill:complete            | pass      | 0/19/0                       |
| SKILL_CREATE_FILE         | skill:createFile          | pass      | 16/3/0                       |
| SKILL_DELETE_FILE         | skill:deleteFile          | pass      | 15/3/0                       |
| SKILL_ERROR               | skill:error               | pass      | 0/19/0                       |
| SKILL_EXECUTE             | skill:execute             | pass      | 20/13/0                      |
| SKILL_GET_DETAIL          | skill:get-detail          | violation | 14/2/0                       |
| SKILL_GET_IMPORTED        | skill:getImported         | pass      | 10/21/0                      |
| SKILL_GET_STATUS          | skill:get-status          | violation | 11/7/0                       |
| SKILL_IMPORT              | skill:import              | pass      | 16/9/0                       |
| SKILL_IMPROVE             | skill:improve             | pass      | 6/2/0                        |
| SKILL_LIST                | skill:list                | pass      | 27/24/0                      |
| SKILL_LIST_BACKUPS        | skill:listBackups         | pass      | 16/3/0                       |
| SKILL_OPTIMIZE            | skill:optimize            | pass      | 10/4/0                       |
| SKILL_OPTIMIZE_EVALUATE   | skill:optimize:evaluate   | violation | 4/2/0                        |
| SKILL_OPTIMIZE_VARIANTS   | skill:optimize:variants   | violation | 4/2/0                        |
| SKILL_PERMISSION_REQUEST  | skill:permission:request  | violation | 13/25/0                      |
| SKILL_PERMISSION_RESPONSE | skill:permission:response | violation | 7/29/0                       |
| SKILL_READ_FILE           | skill:readFile            | pass      | 33/3/0                       |
| SKILL_REMOVE              | skill:remove              | pass      | 11/8/0                       |
| SKILL_RESTORE_BACKUP      | skill:restoreBackup       | pass      | 15/3/0                       |
| SKILL_SCAN                | skill:scan                | pass      | 7/17/0                       |
| SKILL_STREAM              | skill:stream              | pass      | 17/12/0                      |
| SKILL_UPDATE              | skill:update              | pass      | 0/12/0                       |
| SKILL_WRITE_FILE          | skill:writeFile           | pass      | 25/3/0                       |

## 違反一覧

| key                       | value                     | violationType  | riskTags | usage(main/preload/renderer) | priority | evidence                                             |
| ------------------------- | ------------------------- | -------------- | -------- | ---------------------------- | -------- | ---------------------------------------------------- |
| SKILL_GET_DETAIL          | skill:get-detail          | 区切り規則違反 | P45      | 14/2/0                       | 中       | `rg -n "skill:get-detail" apps/desktop/src`          |
| SKILL_GET_STATUS          | skill:get-status          | 区切り規則違反 | P45      | 11/7/0                       | 中       | `rg -n "skill:get-status" apps/desktop/src`          |
| SKILL_PERMISSION_REQUEST  | skill:permission:request  | 区切り規則違反 | P45,P44  | 13/25/0                      | 高       | `rg -n "skill:permission:request" apps/desktop/src`  |
| SKILL_PERMISSION_RESPONSE | skill:permission:response | 区切り規則違反 | P45,P44  | 7/29/0                       | 高       | `rg -n "skill:permission:response" apps/desktop/src` |
| SKILL_OPTIMIZE_VARIANTS   | skill:optimize:variants   | 区切り規則違反 | P45      | 4/2/0                        | 低       | `rg -n "skill:optimize:variants" apps/desktop/src`   |
| SKILL_OPTIMIZE_EVALUATE   | skill:optimize:evaluate   | 区切り規則違反 | P45      | 4/2/0                        | 低       | `rg -n "skill:optimize:evaluate" apps/desktop/src`   |

## SubAgent-B 実行記録

- 判定ロジック: 正規表現3パターン照合
- 主要リスク: 区切り表現の不統一による命名ドリフト（P45）
- 完了判定: PASS
