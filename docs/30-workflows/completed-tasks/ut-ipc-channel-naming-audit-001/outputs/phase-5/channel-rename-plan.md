# Phase 5 リネーム計画

## 方針

- 目的: 命名規則の一貫性確保と将来拡張時の衝突予防。
- 非目的: このPhaseではコード変更を行わない。

## 優先度付き計画

| 優先度 | key                       | 改名前                    | 改名後(提案)               | 参照総数 | リスクタグ | 主要影響箇所                                                                                                                      |
| ------ | ------------------------- | ------------------------- | -------------------------- | -------: | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 高     | SKILL_PERMISSION_REQUEST  | skill:permission:request  | skill:requestPermission    |       38 | P45,P44    | apps/desktop/src/preload/channels.ts<br>apps/desktop/src/main/ipc/permission-handlers.ts<br>apps/desktop/src/preload/skill-api.ts |
| 高     | SKILL_PERMISSION_RESPONSE | skill:permission:response | skill:respondPermission    |       36 | P45,P44    | apps/desktop/src/main/ipc/permission-handlers.ts<br>apps/desktop/src/preload/channels.ts<br>apps/desktop/src/preload/skill-api.ts |
| 中     | SKILL_GET_STATUS          | skill:get-status          | skill:getStatus            |       18 | P45        | apps/desktop/src/main/ipc/skillHandlers.ts<br>apps/desktop/src/preload/channels.ts<br>apps/desktop/src/preload/skill-api.ts       |
| 中     | SKILL_GET_DETAIL          | skill:get-detail          | skill:getDetail            |       16 | P45        | apps/desktop/src/main/ipc/skillHandlers.ts<br>apps/desktop/src/preload/channels.ts                                                |
| 低     | SKILL_OPTIMIZE_VARIANTS   | skill:optimize:variants   | skill:optimizeVariants     |        6 | P45        | apps/desktop/src/main/ipc/skillHandlers.ts<br>apps/desktop/src/preload/channels.ts                                                |
| 低     | SKILL_OPTIMIZE_EVALUATE   | skill:optimize:evaluate   | skill:evaluateOptimization |        6 | P45        | apps/desktop/src/main/ipc/skillHandlers.ts<br>apps/desktop/src/preload/channels.ts                                                |

## 実施順序（推奨）

1. 高優先度（permission系2件）
2. 中優先度（get-detail/get-status）
3. 低優先度（optimize系2件）

## 移行ガード

- 旧名/新名の二重受付期間を設ける（互換期間）。
- preload APIの公開名は段階的に切り替える。
- 置換は `IPC_CHANNELS.<KEY>` 定数参照を優先し、文字列直書きはgrepで追跡する。

## SubAgent-C 実行記録

- 影響範囲調査: 完了
- 優先度付与: 完了
- 改名提案: 完了
