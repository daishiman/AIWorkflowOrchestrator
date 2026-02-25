# Phase 8 正規化リネーム計画

## 実施バッチ

1. Batch-H（高）: SKILL_PERMISSION_REQUEST, SKILL_PERMISSION_RESPONSE
2. Batch-M（中）: SKILL_GET_DETAIL, SKILL_GET_STATUS
3. Batch-L（低）: SKILL_OPTIMIZE_VARIANTS, SKILL_OPTIMIZE_EVALUATE

## 1行計画

| key                       | 改名前                    | 改名後                     | 優先度 | 依存                                     |
| ------------------------- | ------------------------- | -------------------------- | ------ | ---------------------------------------- |
| SKILL_PERMISSION_REQUEST  | skill:permission:request  | skill:requestPermission    | 高     | preload公開API → main handler → test更新 |
| SKILL_PERMISSION_RESPONSE | skill:permission:response | skill:respondPermission    | 高     | preload公開API → main handler → test更新 |
| SKILL_GET_STATUS          | skill:get-status          | skill:getStatus            | 中     | preload公開API → main handler → test更新 |
| SKILL_GET_DETAIL          | skill:get-detail          | skill:getDetail            | 中     | preload公開API → main handler → test更新 |
| SKILL_OPTIMIZE_VARIANTS   | skill:optimize:variants   | skill:optimizeVariants     | 低     | preload公開API → main handler → test更新 |
| SKILL_OPTIMIZE_EVALUATE   | skill:optimize:evaluate   | skill:evaluateOptimization | 低     | preload公開API → main handler → test更新 |

## 実施原則

- 先に `IPC_CHANNELS` 定義を変更し、`IPC_CHANNELS.<KEY>` 参照を一括置換する。
- 文字列直書きは `rg -n 'skill:' apps/desktop/src` で残存確認する。
- 互換期間は旧名を警告付きで受理する。
