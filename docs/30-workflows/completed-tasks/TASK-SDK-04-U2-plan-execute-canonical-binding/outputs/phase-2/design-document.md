# Phase 2: 設計書

## 状態所有権設計

| 状態                               | 所有者                     | 責務                                              |
| ---------------------------------- | -------------------------- | ------------------------------------------------- |
| `request`                          | textarea state (useState)  | ユーザーの draft input。自由に編集可能            |
| `approvedSkillSpec`                | dedicated state (useState) | plan review 完了時に固定される canonical snapshot |
| `storePlanId` / `activePlanResult` | store / local state        | plan の ID と結果メタデータ                       |

### 設計原則

- **Single Source of Truth**: execute は `planId + approvedSkillSpec` の組だけを参照する
- **Owner 分離**: draft input と approved payload は別の state 変数で管理する
- **対称クリア**: cancel で `approvedSkillSpec` と plan 関連 state を対称的に破棄する

## 修正箇所

| ID  | 関数                          | 変更内容                                            | 根拠                       |
| --- | ----------------------------- | --------------------------------------------------- | -------------------------- |
| M-1 | state 宣言                    | `approvedSkillSpec` state を追加                    | Owner 分離                 |
| M-2 | `handlePrepare` (plan 成功時) | `setApprovedSkillSpec(trimmedRequest)`              | 承認時スナップショット固定 |
| M-3 | `handleExecutePlan`           | `request.trim()` → `approvedSkillSpec ?? undefined` | canonical binding          |
| M-4 | `handleCancelPlan`            | `setApprovedSkillSpec(null)` 追加                   | 対称クリア                 |

## 失敗系設計

| ケース                            | 動作                                                                     |
| --------------------------------- | ------------------------------------------------------------------------ |
| approved snapshot 不在時          | `approvedSkillSpec ?? undefined` → 第2引数は `undefined`（API 互換維持） |
| cancel                            | `approvedSkillSpec`, `localPlanResult`, generation state すべてクリア    |
| terminal handoff                  | handoff guidance UI に接続、fetchSkills は呼ばない（既存動作維持）       |
| integrated_api の既存 result type | `executeResponse.success`, `executeResponse.skillName` の分岐は変更なし  |

## 30思考法の反映

- **論理分析系**: draft と approved が同一変数を参照する矛盾を除去
- **構造分解系**: state ownership を textarea / approved / plan metadata の3層に分離
- **発想・拡張系**: PlanResult 型拡張は不要と判断。最小パッチ（state 追加 + 参照先変更 + 対称クリア）で十分
- **メタ系**: 問題パターンを「canonical binding drift」と命名し再発防止の共通語彙とする

## エッジケース

| シナリオ                          | 期待動作                                              |
| --------------------------------- | ----------------------------------------------------- |
| plan 未実行で execute             | 第2引数は `undefined`（互換維持）                     |
| cancel 後に再 plan                | 最新の trimmedRequest で `approvedSkillSpec` を再固定 |
| textarea を複数回編集後に execute | execute payload は plan 作成時の値を維持              |
| plan 成功 → cancel → 別の plan    | 古い spec は破棄され、新しい spec が固定される        |
