# Phase 2 タスク2: データフロー設計

## フロー A: LLM 生成フロー

```
Step 0 [generationMode="llm", description入力, "次へ"クリック]
  → SkillCreateWizard.handleLlmGenerate()
    → goToStep(2)  // step=2 (GenerateStep)
    → setIsGenerating(true)
    → setGenerationProgress("計画を生成中...")
    → setGenerationError(null)
    → getSkillCreatorApi().planSkill(llmDescription)
    → 成功時:
      → setLocalPlanResult(planResult.data)
      → setCurrentPlanResult(planResult.data)
      → setCurrentPlanId(planResult.data.planId)
      → setIsGenerating(false)
      → setGenerationProgress(null)
      → GenerateStep で plan 結果表示
    → 失敗時:
      → setGenerationError(error.message)
      → setIsGenerating(false)
      → setGenerationProgress(null)
      → GenerateStep でエラー表示

GenerateStep [「実行する」ボタン]
  → SkillCreateWizard.handleExecutePlan()
    → setIsGenerating(true)
    → setGenerationError(null)
    → getSkillCreatorApi().executePlan(currentPlanId, llmDescription)
    → 成功時(accepted=true):
      → getWorkflowState で verifyResult 確認
      → fail → setGenerationError(message)
      → pass → setLocalPlanResult(null) + clearGenerationState() + goToStep(3)
    → 成功時(terminal_handoff):
      → setGenerationError("ターミナル実行が必要です: " + command)
    → 失敗時:
      → setGenerationError(error.message)
    → finally: setIsGenerating(false)

GenerateStep [「キャンセル」ボタン]
  → SkillCreateWizard.handleCancelPlan()
    → setLocalPlanResult(null)
    → clearGenerationState()
    → goToStep(0)
```

## フロー B: テンプレート生成フロー（既存・非破壊）

```
Step 0 [generationMode="template", onNext]
  → handleStep0Next() → goNext() → Step 1 (ConversationRoundStep)
Step 1 [onGenerate(method)]
  → handleGenerate(method) → createSkill() → goToStep(2) → goToStep(3)
```
