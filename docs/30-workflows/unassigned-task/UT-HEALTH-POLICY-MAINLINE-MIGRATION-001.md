# UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## メタ情報

| 項目         | 値                                                              |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                         |
| 優先度       | HIGH                                                            |
| 親タスク     | TASK-IMP-HEALTH-POLICY-UNIFICATION-001                          |
| 対象ファイル | `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` |
| issue番号    | #1605                                                           |

## 概要

`useMainlineExecutionAccess` フックが `resolveHealthPolicy()` を呼び出して `healthPolicy` を `buildMainlineExecutionAccessState` に渡すよう移行する。

## 背景

TASK-IMP-HEALTH-POLICY-UNIFICATION-001 で HealthPolicy インターフェースと `buildMainlineExecutionAccessState` の healthPolicy 消費ロジックは実装済み。しかし Renderer 側の Hook（`useMainlineExecutionAccess`）がまだ旧パス（`apiKeyDegraded` 直接渡し）を使用している。

## 実装方針

1. `useMainlineExecutionAccess` 内で `resolveHealthPolicy()` を呼び出す
2. 結果の `healthPolicy` を `buildMainlineExecutionAccessState` の入力に渡す
3. `apiKeyDegraded` の直接渡しを削除（healthPolicy 経由に移行）
4. 既存テストが全 PASS することを確認

## 受入基準

- `useMainlineExecutionAccess` が `resolveHealthPolicy()` 経由で healthPolicy を生成
- `buildMainlineExecutionAccessState` に healthPolicy が渡される
- 既存テスト全 PASS
