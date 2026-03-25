# Unassigned Task Report: TASK-IMP-HEALTH-POLICY-UNIFICATION-001

## 検出日: 2026-03-25

### 未タスク一覧

| #   | タスクID候補                            | 内容                                                              | 優先度 |
| --- | --------------------------------------- | ----------------------------------------------------------------- | ------ |
| 1   | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 | useMainlineExecutionAccess.ts を resolveHealthPolicy() 経由に移行 | HIGH   |
| 2   | UT-HEALTH-POLICY-RUNTIME-INJECTION-001  | RuntimePolicyResolver の HealthPolicy 注入元実装                  | HIGH   |
| 3   | UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001 | @deprecated apiKeyDegraded の実際の除去（v0.8.0）                 | MED    |

### 詳細

#### UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

- 対象: `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts`
- 内容: `useMainlineExecutionAccess` が `resolveHealthPolicy()` を呼び出して `healthPolicy` を `buildMainlineExecutionAccessState` に渡すよう移行
- 根拠: 30種思考法分析で「断絶1」として検出。Renderer側の消費が旧パスのまま

#### UT-HEALTH-POLICY-RUNTIME-INJECTION-001

- 対象: RuntimePolicyResolver のファクトリー/DI コンテナ
- 内容: RuntimePolicyResolver 構築時に healthPolicy を注入する呼び出し元を実装
- 根拠: 30種思考法分析で「最大リスク: 注入元未実装による永続的デッドコード化」として検出

#### UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001

- 対象: ExecutionCapabilityInput.apiKeyDegraded, MainlineExecutionAccessInput.apiKeyDegraded
- 内容: v0.8.0 で @deprecated フィールドを削除し、全参照箇所を HealthPolicy.isDegraded に完全移行
- 根拠: @deprecated マークのみでは実際の除去が行われない
