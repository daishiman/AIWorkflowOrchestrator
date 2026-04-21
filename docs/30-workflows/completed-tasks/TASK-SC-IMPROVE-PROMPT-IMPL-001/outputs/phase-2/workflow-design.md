# ワークフロー設計: runImprovePromptWorkflow

## 正常系フロー

```
createSkill()
  └─ case "improve-prompt":
       emitProgress("loading-skill")  // 10%
       throwIfAborted
       emitProgress("analyzing")      // 30%
       throwIfAborted
       await runImprovePromptWorkflow(options, signal)
         ├─ [llmClient あり]
         │    fs.readFile(skillMdPath)
         │    throwIfAborted
         │    resourceLoader.loadAgent("improve-prompt")
         │    llmClient.generate({ system: agentDef, user: content })
         │    throwIfAborted
         │    fs.writeFile(skillMdPath, improved)
         └─ [llmClient なし]
              improveSkill(name, true)   // improve_skill.js フォールバック
       emitProgress("improving")      // 65%
     [switch exit]
     [generating-skill → no-op]
     [generating-agents → no-op]
     emitProgress("validating")      // 90%
     emitProgress("done")            // 100%
```

## シグネチャ

```typescript
private async runImprovePromptWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void>
```

## 入力・出力・副作用

| 項目   | 内容                                           |
| ------ | ---------------------------------------------- |
| 入力   | `options.name` (スキル名), `signal` (中断信号) |
| 出力   | なし (void)                                    |
| 副作用 | SKILL.md が改善済みコンテンツで上書きされる    |

## case "improve-prompt": 修正後

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
