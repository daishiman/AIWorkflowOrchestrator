# TASK-P0-09-U1: path-scoped governance runtime enforcement

## メタ情報

| 項目     | 値                                                           |
| -------- | ------------------------------------------------------------ |
| タスクID | TASK-P0-09-U1                                                |
| 検出元   | TASK-P0-09 Phase 4 carry-forward（context-aware canUseTool） |
| 優先度   | MEDIUM                                                       |
| 影響     | セキュリティ強化（skill root 外へのファイル書き込み防止）    |
| 検出日   | 2026-03-31                                                   |

## 概要

`canUseTool` に `CanUseToolContext`（`targetPath` / `allowedSkillRoot`）を受け取る path-scoped 判定ロジックが `SkillCreatorPermissionPolicy.ts` に実装済みだが、SDK execution path（`RuntimeSkillCreatorFacade.execute()` 内の `createExecuteGovernanceCanUseTool()`）に接続されていない。

実行時に skill root 外のファイルへの Write/Edit を動的に拒否するため、接続を完了させる必要がある。

## 現状

```typescript
// SkillCreatorPermissionPolicy.ts — 実装済み
export function canUseTool(
  toolName: string,
  phase: SkillCreatorGovernancePhase,
  context?: CanUseToolContext,  // ← 実装済みだが呼び出し時に渡されていない
): SkillCreatorToolDecision { ... }

// RuntimeSkillCreatorFacade.ts — 現在の実装
private createExecuteGovernanceCanUseTool() {
  return (toolName: string) => {
    const decision = canUseTool(toolName, "execute");
    // ↑ context なし → allowedSkillRoot チェックが無効
    ...
  };
}
```

## 期待される修正

```typescript
// RuntimeSkillCreatorFacade.ts — 修正後
private createExecuteGovernanceCanUseTool(skillRoot: string) {
  return (toolName: string, input?: { path?: string; file_path?: string }) => {
    const targetPath = input?.path ?? input?.file_path;
    const decision = canUseTool(toolName, "execute", {
      targetPath,
      allowedSkillRoot: skillRoot,
    });
    this.auditSink.record({ ... decision ... });
    return decision;
  };
}
```

`skillRoot` は `execute()` の引数（`skillMeta.skillRoot` または `session.skillRoot`）から渡す。

## 完了条件

- [ ] `createExecuteGovernanceCanUseTool` が `skillRoot` を引数に取る
- [ ] `canUseTool` 呼び出し時に `CanUseToolContext` を渡している
- [ ] `targetPath` は `input?.path` または `input?.file_path` から取得
- [ ] skill root 外への Write/Edit が denied になる統合テストが PASS する
- [ ] 既存 68 governance tests が全て PASS する

## 関連

- `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts` — `canUseTool` + `CanUseToolContext`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `createExecuteGovernanceCanUseTool()`
- `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorPermissionPolicy.test.ts` — context-aware tests（実装済み・PASS）
- TASK-P0-09 実装記録: `docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/outputs/`
