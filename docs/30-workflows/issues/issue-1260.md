# [#1260] [UT-06-003] SafetyGatePort 具象クラス実装（DefaultSafetyGate）

## メタ情報

```yaml
issue_number: 1260
title: [UT-06-003] SafetyGatePort 具象クラス実装（DefaultSafetyGate）
state: CLOSED
priority: 高
scale: -
category: -
status: 未実施
created_date: 2026-03-16
updated_date: 2026-03-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1260
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 目的

`SafetyGatePort` の具象クラス `DefaultSafetyGate` を Main Process に実装し、`evaluate(skillName)` が `SafetyGateResult.overallGrade`（`SAFE` / `SAFE_WITH_WARNINGS` / `UNSAFE`）を返せる状態にする。

現在 `SafetyGatePort` は契約（インターフェース）のみ定義されており、評価ロジックの実体が存在しない。これにより公開前ブロック判定が機能せず、後続の TASK-SKILL-LIFECYCLE-08（PermissionDialog 実装）で DI 利用できない状態となっている。

## 受入基準

- [ ] `evaluate(skillName): Promise<SafetyGateResult>` が動作する
- [ ] `SafetyCheckId` 5 種の評価ロジックが実装されている
- [ ] Grade 集約ルール（UNSAFE 優先）が実装されている
- [ ] `CRITICAL_TOOL_REQUIRED` が `UNSAFE` へ集約される
- [ ] `HIGH_TOOL_REQUIRED` が `SAFE_WITH_WARNINGS` へ集約される
- [ ] `skill:evaluate-safety` IPC ハンドラが追加されている
- [ ] IPC 経由で結果取得できる
- [ ] DI 境界を維持し、Port インターフェース越しに利用できる
- [ ] 単体テストで blocked/warned/passed の代表ケースが固定されている
- [ ] 全テストが PASS すること
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること

## 関連タスクID

| タスクID                | 関係性                             |
| ----------------------- | ---------------------------------- |
| TASK-SKILL-LIFECYCLE-06 | 発見元（完了済み）                 |
| TASK-SKILL-LIFECYCLE-08 | 後続（本タスク完了後に DI で利用） |
| UT-06-001               | 前提（TOOL_RISK_CONFIG 定数実装）  |
| UT-06-002               | 前提（PermissionStore 実装）       |

## 成果物

- `apps/desktop/src/main/permissions/default-safety-gate.ts`（新規）
- IPC ハンドラ `skill:evaluate-safety`（追加）
- テストファイル `apps/desktop/src/main/permissions/safety-gate*.test.ts`

## 参照資料

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-12/implementation-guide.md`
- タスク指示書: `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/unassigned-task/task-ut-06-003-safety-gate-port-implementation.md`
