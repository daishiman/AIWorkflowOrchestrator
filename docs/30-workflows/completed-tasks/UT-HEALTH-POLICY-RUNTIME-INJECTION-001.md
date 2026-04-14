# UT-HEALTH-POLICY-RUNTIME-INJECTION-001

## メタ情報

| 項目         | 値                                               |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-HEALTH-POLICY-RUNTIME-INJECTION-001           |
| 優先度       | HIGH                                             |
| 親タスク     | TASK-IMP-HEALTH-POLICY-UNIFICATION-001           |
| 対象ファイル | RuntimePolicyResolver のファクトリー/DI コンテナ |
| issue番号    | #2004                                            |

## 概要

RuntimePolicyResolver 構築時に healthPolicy を注入する呼び出し元を実装する。

## 背景

TASK-IMP-HEALTH-POLICY-UNIFICATION-001 で RuntimePolicyResolver のコンストラクタ第3引数に `healthPolicy?: HealthPolicy` が追加済み。しかし実際に healthPolicy を注入する呼び出し元（ファクトリーまたは DI コンテナ）が未実装であり、永続的デッドコードになるリスクがある。

## 実装方針

1. HealthCheck サービスから最新の HealthCheckResult を取得
2. `resolveHealthPolicy()` で HealthPolicy を導出
3. RuntimePolicyResolver コンストラクタに渡す
4. DI のタイミング（起動時 or リクエスト毎）を設計判断する

## 受入基準

- RuntimePolicyResolver が実際の HealthPolicy を受け取って動作する
- degraded 状態で terminal_handoff が返されることをE2Eで確認
