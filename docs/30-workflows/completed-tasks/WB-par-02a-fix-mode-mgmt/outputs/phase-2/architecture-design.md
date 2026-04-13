# Phase 2 成果物: アーキテクチャ設計書

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 修正後のstate管理設計

### 維持するstate

| state名                  | 型                           | 役割                                    |
| ------------------------ | ---------------------------- | --------------------------------------- |
| `currentStep`            | `number`                     | 現在のステップ番号（useWizardStep管理） |
| `formData`               | `SkillInfoFormData`          | Step 0のフォーム入力値                  |
| `answers`                | `ConversationAnswers`        | Step 1の会話回答                        |
| `smartDefaults`          | `SmartDefaultResult \| null` | Step 0→Step 1の推論結果                 |
| `generationMethod`       | `"complete" \| "skip"`       | 生成方法                                |
| `isGenerating`           | `boolean`                    | LLM生成中フラグ                         |
| `error`                  | `Error \| null`              | 生成失敗時のエラー                      |
| `skillPath`              | `string \| null`             | 生成完了後のスキルパス                  |
| `hasExternalIntegration` | `boolean`                    | 外部連携フラグ                          |
| `externalToolName`       | `string \| null`             | 外部ツール名                            |

### 廃止するstate

| state名               | 廃止後の代替                          |
| --------------------- | ------------------------------------- |
| `generationMode`      | なし（LLM固定のため不要）             |
| `hasActivatedLlmMode` | なし（廃止・管理不要）                |
| `localPlanResult`     | なし（planSkill/executePlan廃止）     |
| `llmDescription`      | なし（SkillInfoStepのformDataに統合） |

### 廃止するref

| ref名                       | 廃止理由                                          |
| --------------------------- | ------------------------------------------------- |
| `llmGenerationRequestIdRef` | handleLlmGenerate/handleExecutePlan廃止に伴う除去 |

## 修正後のハンドラ設計

### handleStep0Next（LLM専用・固定）

```typescript
const handleStep0Next = () => {
  const defaults = inferSmartDefaults(formData);
  setSmartDefaults(defaults);
  const integration = resolveExternalIntegration(answers.q5, defaults.tool);
  setHasExternalIntegration(integration.hasExternalIntegration);
  setExternalToolName(integration.externalToolName);
  trackEvent("skill_wizard_step_complete", { step: 0, stepName: STEPS[0] });
  goNext(); // 常にStep 1へ（分岐なし）
};
```

### handleGenerate（維持・setLocalPlanResultのみ除去）

```typescript
const handleGenerate = async (method: "complete" | "skip") => {
  // setLocalPlanResult(null) 呼び出しを除去
  // その他のロジックは維持
};
```

### 廃止するハンドラ

- `handleStep0NextFromLlm`: LLMモード専用遷移（廃止）
- `handleLlmGenerate`: planSkillベースのフロー（廃止）
- `handleExecutePlan`: executePlanベースのフロー（廃止）
- `handleCancelPlan`: LLMプランキャンセル（廃止）

### handleCancelTemplateGeneration → handleCancelGeneration（リネーム）

```typescript
const handleCancelGeneration = () => {
  cancelGeneration();
  resetGeneratedState(true);
  goToStep(0);
};
```

## レンダリング設計

| currentStep | レンダリングコンポーネント | 変更内容                                    |
| ----------- | -------------------------- | ------------------------------------------- |
| 0           | `<SkillInfoStep>`          | ラジオボタン削除・常にSkillInfoStepのみ表示 |
| 1           | `<ConversationRoundStep>`  | 変更なし（常に表示・スキップ不可）          |
| 2           | `<GenerateStep>`           | generationMode条件分岐を除去                |
| 3           | `<CompleteStep>`           | 変更なし                                    |

## 廃止するユーティリティ関数

- `isTerminalHandoffExecuteResponse`: handleExecutePlanのみで使用
- `toHandoffGuidance`: handleExecutePlanのみで使用
- `toTerminalHandoffPlanResult`: handleExecutePlanのみで使用

## 廃止するstoreインポート

`useSetIsSkillGenerating`, `useSetGenerationProgress`, `useSetGenerationError`,
`useSetCurrentPlanResult`, `useSetCurrentPlanId`, `useCurrentPlanId`, `useCurrentPlanResult`
