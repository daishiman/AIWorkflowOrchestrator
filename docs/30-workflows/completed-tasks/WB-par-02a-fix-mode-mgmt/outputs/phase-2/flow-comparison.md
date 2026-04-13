# Phase 2 成果物: フロー比較図

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 修正前フロー

```
SkillCreateWizard（修正前）
│
├─ Step 0: wizard-step-info
│   ├─ [ラジオボタン] ○ テンプレートから作成  ← 問題1: 仕様外UI
│   │                ○ LLM で生成
│   │
│   ├─ generationMode === "template" && !hasActivatedLlmMode の場合
│   │   └─ <SkillInfoStep onNext={handleStep0Next} />
│   │       └─ 次へ → goNext() → Step 1
│   │
│   └─ generationMode === "llm" の場合
│       └─ <textarea llmDescription>
│           └─ 次へボタン → handleLlmGenerate()
│               └─ planSkill(description) 呼び出し
│               └─ goToStep(2)  ← 問題10: Step 1スキップ
│               └─ Step 2（LLM生成）
│
├─ 問題9: 2系統フラグが混在
│   ├─ generationMode: "template" | "llm"（TASK-SC-07追加）
│   └─ hasActivatedLlmMode: boolean（LLM→template切替用）
│
├─ Step 1: ConversationRoundStep（LLMモードでは未到達）
│   └─ Q1〜Q6インタビュー（スキップされるため無効化）
│
├─ Step 2: GenerateStep
│   ├─ generationMode === "llm" → planResult / onExecutePlan / onCancelPlan
│   └─ generationMode === "template" → onRetry / onCancel
│
└─ Step 3: CompleteStep
```

## 修正後フロー

```
SkillCreateWizard（修正後）
│
├─ Step 0: wizard-step-info              ← AC-1: ラジオボタン削除
│   └─ <SkillInfoStep onNext={handleStep0Next} />
│       └─ 次へ → goNext() → Step 1     ← 常にStep 1へ
│
├─ Step 1: ConversationRoundStep         ← AC-4: 常に通過（スキップ不可）
│   └─ Q1〜Q6インタビュー（必ず実行）
│       └─ 生成ボタン → handleGenerate(method) → Step 2
│
├─ Step 2: GenerateStep                  ← generationMode条件分岐なし
│   └─ LLM生成（createSkillベース）
│       └─ 完了 → goToStep(3)
│
└─ Step 3: CompleteStep
    └─ 完了表示
```

## 状態遷移の変化

| 項目               | 修正前                                        | 修正後                |
| ------------------ | --------------------------------------------- | --------------------- |
| Step 0からの遷移先 | templateなら1、LLMなら2                       | 常に1                 |
| Step 1の実行       | LLMモードでスキップ                           | 常に実行              |
| Step 2のプロップス | generationModeで条件分岐                      | 固定値（LLM生成パス） |
| フラグ数           | 2系統（generationMode + hasActivatedLlmMode） | 0（廃止）             |
