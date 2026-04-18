# TASK-SW-STREAM-FUP-03 設計書

## 設計方針

### progress flow の単一集約

`PROGRESS_FLOWS` 定数（`SkillCreatorService.ts` モジュールレベル）に5モード全フローを集約。
`createSkill()` が mode を見て flow を解決し、`emitProgress(phase)` ローカルヘルパー経由で emit する。
private メソッドは progress literal を持たない。

### 型設計

```typescript
type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};
type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;

const PROGRESS_FLOWS: Record<
  SkillCreatorMode,
  readonly SkillCreatorProgressData[]
>;
```

### emitProgress ヘルパー

```typescript
const flow = PROGRESS_FLOWS[options.mode];
const emitProgress = (phase: string): void => {
  const step = flow.find((s) => s.phase === phase);
  if (step) onProgress?.(step);
};
```

`flow.find()` が undefined を返すフェーズ名（update/improve-prompt の generating-agents 等）は自動的に no-op になる。

### createSkill() switch 構造

```
switch (options.mode) {
  case "collaborative":  emitProgress("interview") → runCollaborativeWorkflow → emitProgress("consensus")
  case "orchestrate":    emitProgress("engine-selection") → runOrchestrateWorkflow
  case "create":         emitProgress("planning") → runCreateWorkflow
  case "update":         emitProgress("loading-skill") → emitProgress("analyzing")
  case "improve-prompt": emitProgress("loading-skill") → emitProgress("analyzing") → emitProgress("improving")
}
// 共通
emitProgress("generating-skill") → initSkill → generateSkillMd
emitProgress("generating-agents") // update/improve-promptでは no-op
emitProgress("validating") → validateSkill
emitProgress("done")
```

### 変更ファイル

| ファイル                             | 変更種別                                |
| ------------------------------------ | --------------------------------------- |
| SkillCreatorService.ts               | PROGRESS_FLOWS 追加・createSkill() 修正 |
| SkillCreatorService.progress.test.ts | TC-12 更新・FUP-03 Suite 1-8 追加       |

### 依存関係

IPC / Preload / Renderer 層への影響なし。`onProgress` はオプショナル。
