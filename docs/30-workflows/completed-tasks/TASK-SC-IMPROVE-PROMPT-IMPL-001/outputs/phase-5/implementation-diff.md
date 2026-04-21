# 実装差分: TASK-SC-IMPROVE-PROMPT-IMPL-001

## 変更ファイル

### SkillCreatorService.ts

**1. `case "improve-prompt":` 修正（L416-420 → L416-423）**

Before:

```typescript
case "improve-prompt":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  emitProgress("improving");
  break;
```

After:

```typescript
case "improve-prompt":
  emitProgress("loading-skill");
  this.throwIfAborted(operationSignal);
  emitProgress("analyzing");
  this.throwIfAborted(operationSignal);
  await this.runImprovePromptWorkflow(options, operationSignal);
  emitProgress("improving");
  break;
```

**2. `runImprovePromptWorkflow()` 新規追加（`generateFeaturesWithLlm` の直前）**

- SKILL.md 読み込み → LLM 改善 → 書き戻し
- llmClient 不在 / readFile 失敗 / LLM 失敗 → `improveSkill()` フォールバック
- abort は `isAbortError()` で検知して rethrow

### **tests**/SkillCreatorService.improve-prompt.test.ts (新規)

9テストケース: 正常系2, 異常系3, 回帰2

### **tests**/SkillCreatorService.test.ts (修正)

SC-021: `executeJson.mockResolvedValue({ suggestions: [] })` を追加

### **tests**/SkillCreatorService.progress.test.ts (修正)

`beforeEach`: `executeJson` デフォルト返り値 `{ suggestions: [] }` を追加
