# 異常系設計: runImprovePromptWorkflow

## LLM 利用不可時のフォールバック

```
llmClient が undefined
  → improveSkill(options.name, true) を直接呼び出す
  → return (例外なし)
```

## ファイル読み書き失敗時

```
fs.readFile が throw
  → isAbortError(error) → rethrow
  → それ以外 → improveSkill() フォールバック

fs.writeFile が throw
  → isAbortError(error) → rethrow
  → それ以外 → logger.warn + 上位に伝播（ユーザーにエラー通知）
```

## LLM 実行失敗時

```
llmClient.generate が throw
  → isAbortError(error) → rethrow
  → それ以外 → improveSkill() フォールバック
```

## AbortSignal 中断タイミング

| タイミング    | 場所                                                    |
| ------------- | ------------------------------------------------------- |
| case入口      | `emitProgress("loading-skill")` 直前の `throwIfAborted` |
| analyzing後   | `emitProgress("analyzing")` 後の `throwIfAborted`       |
| readFile後    | `throwIfAborted(signal)`                                |
| LLM呼び出し後 | `throwIfAborted(signal)`                                |

## improveSkill() フォールバックの挙動

`improveSkill(name, true)` は `improve_skill.js --name <name> --auto-apply` を実行。
失敗時は ScriptExecutor が Error をスロー → 上位に伝播。
