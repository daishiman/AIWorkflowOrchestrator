# Implementation Guide: TASK-IMP-HEALTH-POLICY-UNIFICATION-001

## 概要

HealthPolicy 統一インターフェースの実装ガイド。接続状態判定（health check）が分散していた現状を、統一された HealthPolicy インターフェースに集約した。

## 変更ファイル一覧

| ファイル                                                               | 変更内容                                                  |
| ---------------------------------------------------------------------- | --------------------------------------------------------- |
| `packages/shared/src/types/health-policy.ts`                           | 新規: HealthPolicy 型 + resolveHealthPolicy pure function |
| `packages/shared/src/types/__tests__/health-policy.test.ts`            | 新規: 23テスト                                            |
| `packages/shared/src/types/execution-capability.ts`                    | @deprecated マーク追加（v0.8.0 で削除予定）               |
| `packages/shared/src/types/index.ts`                                   | HealthPolicy 関連の re-export 追加                        |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`      | HealthPolicy DI + degraded 分岐追加                       |
| `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts` | HealthPolicy 消費追加（後方互換保持）                     |
| `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`         | HealthPolicy props 追加（D-6、後方互換保持）              |

## アーキテクチャ

```
HealthPolicyInput → resolveHealthPolicy() → HealthPolicy
                                              ├─ RuntimePolicyResolver (Main Process, DI)
                                              ├─ mainlineAccess.ts (Renderer, optional prop)
                                              └─ HealthIndicator.tsx (Renderer Component)
```

## 後方互換性

- healthPolicy は全消費者で optional。未指定時は既存動作を維持。
- apiKeyDegraded に @deprecated マーク。IDE で警告表示。
- 既存テスト全PASS（回帰なし）。

## P62 対策

RuntimePolicyResolver の degraded 分岐で integrated_api を返すパスが一切存在しない。
