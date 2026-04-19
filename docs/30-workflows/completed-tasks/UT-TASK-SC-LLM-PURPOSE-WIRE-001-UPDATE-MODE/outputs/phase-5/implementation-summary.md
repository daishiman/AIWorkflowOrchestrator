# Phase 5: 実装サマリー

## 変更ファイル一覧

| ファイルパス                                                                 | 変更種別 | 変更概要                                                         |
| ---------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | runUpdateWorkflow / runImprovePromptWorkflow 追加、switch 文修正 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 修正     | dispatch / 回帰 / 実在チェックのテスト 8 件追加                  |

## switch 文修正（early return 方式）

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  await this.runUpdateWorkflow(options, operationSignal);
  emitProgress("done");
  return skillDir; // init_skill.js をスキップ

case "improve-prompt":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  emitProgress("improving");
  await this.runImprovePromptWorkflow(options, operationSignal);
  emitProgress("done");
  return skillDir; // init_skill.js をスキップ
```

## 追加メソッド

```typescript
private async runUpdateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void> {
  this.throwIfAborted(signal);
  this.logger.warn("runUpdateWorkflow: not yet implemented", { ... });
}

private async runImprovePromptWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void> {
  this.throwIfAborted(signal);
  this.logger.warn("runImprovePromptWorkflow: not yet implemented", { ... });
}
```

## TDD Green 確認

- typecheck: PASS（エラー 0 件）
- SC-UPD-001〜SC-UPD-004, SC-IMP-001〜SC-IMP-002: 全件 Green
- SC-020, SC-021（既存）: 引き続き Green
