# Phase 2: Facade 統合設計書

## RuntimeSkillCreatorFacade governance 統合パターン

```typescript
// クラスフィールド
private readonly auditSink = new SkillCreatorAuditSink();
private currentGovernancePhase: SkillCreatorGovernancePhase = "plan";

// createGovernanceHooks プライベートメソッド
private createGovernanceHooks(
  phase: SkillCreatorGovernancePhase,
  provenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorHooks {
  this.currentGovernancePhase = phase;
  return createHooks(phase, this.auditSink, provenance);
}

// 各 phase での使用パターン（plan の例）
const governanceHooks = this.createGovernanceHooks("plan");
governanceHooks.onSessionStart({ sessionId: planId });
try {
  // ... 処理 ...
} finally {
  governanceHooks.onSessionEnd({ sessionId: planId, summary: "..." });
}
```

## 変更範囲（修正すべきメソッド一覧）

既存実装が設計と完全一致のため変更なし。

## `createSdkGovernanceOptions()` の抽出判断

現状: 各 phase で個別に呼んでいる。
判断: **抽出しない**（DRY よりも各 phase の自己完結性を優先）。

## `_input` 未使用問題の対応方針

- P0-09 本体では `_input` を `Record<string, unknown>` のまま残す
- TODO コメントで U1 carry-forward を明示
- U1 で `CanUseToolContext` を組み立てて `canUseTool()` に渡す実装を行う

## `getGovernanceState()` IPC 向けレスポンス構造

```typescript
interface SkillCreatorGovernanceState {
  phase: SkillCreatorGovernancePhase;
  activePolicy: SkillCreatorSdkPolicy;
  recentAuditEvents: readonly SkillCreatorGovernanceAuditEvent[];
  recentDenials: SkillCreatorGovernanceAuditEvent[];
}
```

**作成日**: 2026-04-06
