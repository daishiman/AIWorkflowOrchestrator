# Phase 8 正規化監査レポート

## 正規化方針

- 列順を固定: `key/value/改名後/優先度/3層件数/根拠/影響箇所`
- 表記統一: 命名違反タイプを「区切り規則違反」に統一
- 重複行: 0件（統合済み）

## 実施向け一覧

| key                       | 改名前                    | 改名後（提案）             | 優先度 | usage(main/preload/renderer) | 根拠                                                   | 影響箇所                                                                                                                          |
| ------------------------- | ------------------------- | -------------------------- | ------ | ---------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| SKILL_PERMISSION_REQUEST  | skill:permission:request  | skill:requestPermission    | 高     | 13/25/0                      | 多段コロンで用途表現が分断され、契約名の統一性を損なう | apps/desktop/src/preload/channels.ts<br>apps/desktop/src/main/ipc/permission-handlers.ts<br>apps/desktop/src/preload/skill-api.ts |
| SKILL_PERMISSION_RESPONSE | skill:permission:response | skill:respondPermission    | 高     | 7/29/0                       | 多段コロンで用途表現が分断され、契約名の統一性を損なう | apps/desktop/src/main/ipc/permission-handlers.ts<br>apps/desktop/src/preload/channels.ts<br>apps/desktop/src/preload/skill-api.ts |
| SKILL_GET_STATUS          | skill:get-status          | skill:getStatus            | 中     | 11/7/0                       | kebab表記がskill命名規則（camelCase動詞）と不一致      | apps/desktop/src/main/ipc/skillHandlers.ts<br>apps/desktop/src/preload/channels.ts<br>apps/desktop/src/preload/skill-api.ts       |
| SKILL_GET_DETAIL          | skill:get-detail          | skill:getDetail            | 中     | 14/2/0                       | kebab表記がskill命名規則（camelCase動詞）と不一致      | apps/desktop/src/main/ipc/skillHandlers.ts<br>apps/desktop/src/preload/channels.ts                                                |
| SKILL_OPTIMIZE_VARIANTS   | skill:optimize:variants   | skill:optimizeVariants     | 低     | 4/2/0                        | 動詞+対象の区切りがドメイン区切りと混在                | apps/desktop/src/main/ipc/skillHandlers.ts<br>apps/desktop/src/preload/channels.ts                                                |
| SKILL_OPTIMIZE_EVALUATE   | skill:optimize:evaluate   | skill:evaluateOptimization | 低     | 4/2/0                        | 動詞+対象の区切りがドメイン区切りと混在                | apps/desktop/src/main/ipc/skillHandlers.ts<br>apps/desktop/src/preload/channels.ts                                                |

## 再検証

- TC-02（値重複）: 0
- TC-06（重複登録式）: 全体5件、Skill 0件
