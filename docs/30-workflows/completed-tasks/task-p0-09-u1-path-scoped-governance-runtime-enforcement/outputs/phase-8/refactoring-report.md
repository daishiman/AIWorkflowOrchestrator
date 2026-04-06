# Phase 8: リファクタリング

## 実施内容

### 共通 helper `extractTargetPath` の抽出

**実施前**: `execute` / `improve` の各 canUseTool で `file_path ?? path` を重複実装する可能性があった

**実施後**: `extractTargetPath(input: Record<string, unknown>): string | undefined` を private helper として抽出し、
`createExecuteGovernanceCanUseTool` と `createImproveGovernanceCanUseTool` で共有

```typescript
// 共有ロジック（1箇所に集約）
private extractTargetPath(input: Record<string, unknown>): string | undefined {
  const filePath = typeof input.file_path === "string" ? input.file_path : undefined;
  const pathValue = typeof input.path === "string" ? input.path : undefined;
  return filePath ?? pathValue;
}
```

### createGovernanceCanUseTool の対称設計

`createExecuteGovernanceCanUseTool(skillRoot: string)` と
`createImproveGovernanceCanUseTool(skillRoot: string)` は phase 引数のみが異なる対称実装。
将来的に共通化する場合は `createPhaseGovernanceCanUseTool(phase, skillRoot)` に集約できるが、
現状は2メソッドで明示性を優先する（YAGNI原則）。

## リファクタリング不要と判断した箇所

- `_executeInternal` の `getExplicitSkillCreatorRoot() ?? ""` パターンは1箇所のみ → 抽出不要
- `createImproveGovernanceCanUseTool` は現在 `improve()` フローに配線されていないが、
  method 提供で AC-6 テスト検証は達成している → wiring は将来スコープ（未タスク候補）

## 結論

追加リファクタリングなし。実装は最小変更原則に準拠している。
