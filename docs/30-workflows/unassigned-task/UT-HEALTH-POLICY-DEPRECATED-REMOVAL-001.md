# UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001

## メタ情報

| 項目           | 値                                      |
| -------------- | --------------------------------------- |
| タスクID       | UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001 |
| 優先度         | MED                                     |
| 親タスク       | TASK-IMP-HEALTH-POLICY-UNIFICATION-001  |
| 対象バージョン | v0.8.0                                  |

## 概要

@deprecated マーク済みの `apiKeyDegraded` フィールドを v0.8.0 で実際に削除し、全参照箇所を `HealthPolicy.isDegraded` に完全移行する。

## 背景

TASK-IMP-HEALTH-POLICY-UNIFICATION-001 で以下のフィールドに `@deprecated v0.8.0` マークを追加:

- `ExecutionCapabilityInput.apiKeyDegraded`
- `MainlineExecutionAccessInput.apiKeyDegraded`

## 実装方針

1. 先行タスク（UT-HEALTH-POLICY-MAINLINE-MIGRATION-001, UT-HEALTH-POLICY-RUNTIME-INJECTION-001）が完了していることを確認
2. `apiKeyDegraded` フィールドを削除
3. 全参照箇所を `HealthPolicy.isDegraded` に置換
4. `grep -rn "apiKeyDegraded" packages/ apps/` で残存箇所がゼロであることを確認
5. 既存テスト全 PASS

## 受入基準

- `apiKeyDegraded` フィールドがコードベースから完全に除去
- 全参照箇所が `HealthPolicy.isDegraded` に移行
- 既存テスト全 PASS
- `pnpm typecheck` / `pnpm lint` PASS
