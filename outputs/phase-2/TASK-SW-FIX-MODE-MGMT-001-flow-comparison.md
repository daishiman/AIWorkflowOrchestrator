# Phase 2 成果物: フロー比較図

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 修正前フロー（Wave A 以前）

```
Step 0（スキル情報入力）
  ├─ [ラジオ: テンプレートから作成] → handleStep0Next → goToStep(2) → Step 2（GenerateStep）
  └─ [ラジオ: LLMで生成] → handleGenerate → goToStep(2) → Step 2（GenerateStep）
                                                              ↑ Step 1 をスキップ！

問題点:
  - 問題1: Step 0 にラジオボタン（仕様外 UI）が表示される
  - 問題9: generationMode / hasActivatedLlmMode の 2 系統フラグが混在
  - 問題10: handleGenerate が goToStep(2) を直接呼び出し Step 1 をスキップ
```

## 修正後フロー（Wave A 適用後・現在）

```
Step 0（スキル情報入力）
  └─ 「次へ」クリック → handleStep0Next → goNext() → Step 1（ConversationRoundStep）
                                                          ↓
                                                   Q1〜Q6 インタビュー
                                                          ↓
                                              「生成する」クリック → handleGenerate → goToStep(2)
                                                                                        ↓
                                                                               Step 2（GenerateStep）
                                                                                        ↓
                                                                             生成完了 → goToStep(3)
                                                                                        ↓
                                                                               Step 3（CompleteStep）
```

## handleStep0Next 修正前後

### 修正前（疑似コード）

```typescript
const handleStep0Next = () => {
  if (generationMode === "template") {
    goToStep(2); // Step 1 スキップ
  } else {
    // LLM モード: handleGenerate を直接呼ぶかStep 1 へ
    handleGenerate("complete"); // goToStep(2) 内部呼び出し
  }
};
```

### 修正後（現在のコード）

```typescript
const handleStep0Next = () => {
  const defaults = inferSmartDefaults(formData);
  setSmartDefaults(defaults);
  const integration = resolveExternalIntegration(answers.q5, defaults.tool);
  setHasExternalIntegration(integration.hasExternalIntegration);
  setExternalToolName(integration.externalToolName);
  trackEvent("skill_wizard_step_complete", { step: 0, stepName: STEPS[0] });
  goNext(); // 常に Step 1 へ
};
```

## handleGenerate 修正後

```typescript
const handleGenerate = async (method: "complete" | "skip") => {
  // ConversationRoundStep（Step 1）の onGenerate 経由でのみ呼ばれる
  // ...
  goToStep(2); // Step 1 から Step 2 へ
  // ...
};
```
