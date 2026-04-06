# Phase 2: hooks インターフェース設計書

## SkillCreatorHooks インターフェース（確定版）

```typescript
export interface SkillCreatorHooks {
  onSessionStart(params: {
    sessionId: string;
    provenance?: SkillCreatorWorkflowSourceProvenance;
  }): void;

  onPreToolUse(params: {
    sessionId: string;
    toolName: string;
  }): SkillCreatorToolDecision;

  onPostToolUse(params: {
    sessionId: string;
    toolName: string;
    success: boolean;
    error?: string;
  }): void;

  onSessionEnd(params: { sessionId: string; summary?: string }): void;
}
```

## createHooks() シグネチャ

```typescript
export function createHooks(
  phase: SkillCreatorGovernancePhase,
  auditSink: SkillCreatorAuditSink,
  provenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorHooks;
```

## hooks をコード側に固定する理由

1. **manifest との分離**: manifest はスキルのメタデータを定義するが、
   セキュリティポリシーは実行基盤（コード）が責任を持つべき
2. **改ざん防止**: manifest はユーザーが編集可能であるため、
   hooks をコード固定にすることでセキュリティポリシーの改ざんを防ぐ
3. **lifecycle との整合**: SDK の lifecycle events は実行エンジン内で発火するため、
   コード側でのみ適切に接続できる

## audit sink との接続設計

- `createHooks(phase, auditSink)` で auditSink をファクトリに注入
- 各 hook は `auditSink.recordEvent()` を呼び出して audit イベントを記録
- hook が返す `SkillCreatorToolDecision` も audit event に含まれる

**作成日**: 2026-04-06
