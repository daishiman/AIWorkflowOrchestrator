# [#1251] [UT-06-001] ToolRiskConfig 定数実装（packages/shared/src/constants/security.ts）

## メタ情報

```yaml
issue_number: 1251
title: [UT-06-001] ToolRiskConfig 定数実装（packages/shared/src/constants/security.ts）
state: CLOSED
priority: 高
scale: -
category: -
status: 未実施
created_date: 2026-03-16
updated_date: 2026-03-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1251
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 目的

`packages/shared/src/constants/security.ts` に `TOOL_RISK_CONFIG` 定数を実装し、riskLevel ごとの dialogWidth・headerColorToken・allowPermanent 設定を確定する。

TASK-SKILL-LIFECYCLE-06（Trust & Permission Governance 仕様策定）の Phase 5 で設計されたプロトタイプ定義が存在するが、本番実装と確定値割り当てが未完了のため、後続の PermissionDialog コンポーネント実装がブロックされている。

## 受入基準

- [ ] `TOOL_RISK_CONFIG` が `Record<RiskLevel, ToolRiskConfigEntry>` 型で定義されている
- [ ] `RiskLevel` 型（`"low" | "medium" | "high"`）が export されている
- [ ] `ToolRiskConfigEntry` interface が export されている
- [ ] dialogWidth が low:400 / medium:480 / high:640 に設定されている
- [ ] headerColorToken が CSS変数名形式（`--risk-low` / `--risk-medium` / `--risk-high`）で設定されている
- [ ] `allowPermanent` が high のみ `false` になっている
- [ ] `allowTime24h` / `allowTime7d` が high のみ `false` になっている
- [ ] JSDoc コメントが各フィールドに付与されている
- [ ] `pnpm --filter @repo/shared build` が通ること
- [ ] `packages/shared/src/constants/security.test.ts` に単体テストが追加されていること
- [ ] 全テストが PASS すること
- [ ] TypeScript 型エラー・ESLint エラーが 0 件

## 関連タスクID

| タスクID                | 関係性                         |
| ----------------------- | ------------------------------ |
| TASK-SKILL-LIFECYCLE-06 | 発見元（完了済み）             |
| TASK-SKILL-LIFECYCLE-08 | 後続（本タスク完了後に着手）   |
| UT-06-004               | 後続（UI実装でこの定数を参照） |

## 成果物

- `packages/shared/src/constants/security.ts`（更新）
- `packages/shared/src/constants/security.test.ts`（新規または更新）

## 参照資料

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/security.ts`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md`
- タスク指示書: `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/unassigned-task/task-ut-06-001-tool-risk-config-implementation.md`
