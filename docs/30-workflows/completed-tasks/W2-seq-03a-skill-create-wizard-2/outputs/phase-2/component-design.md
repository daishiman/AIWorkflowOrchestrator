# Phase 2: コンポーネント設計書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日     | 2026-04-08                                 |
| ステータス | completed                                  |

---

## Props インターフェース設計

```typescript
export interface SkillCreateWizardProps {
  onClose: () => void;
}
```

**設計判断**:

- `onClose` のみを必須 Props とする（ウィザードの終了通知）
- `isOpen` は親コンポーネントが制御するため、Props として受け取らない
- Wave 1 コンポーネントとの整合性を確保するためシンプルなインターフェースを維持

---

## 状態管理設計

```typescript
// ステップ制御（useWizardStep フック）
const { currentStep, goNext, goBack, goToStep } = useWizardStep(STEPS.length);

// フォームデータ
const [formData, setFormData] = useState<SkillInfoFormData>(DEFAULT_FORM_DATA);
const [answers, setAnswers] = useState<ConversationAnswers>(DEFAULT_ANSWERS);
const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(
  null,
);

// 生成状態
const [isGenerating, setIsGenerating] = useState(false);
const [skillPath, setSkillPath] = useState<string | null>(null);
const [hasExternalIntegration, setHasExternalIntegration] = useState(false);
const [externalToolName, setExternalToolName] = useState<string | null>(null);
```

**デフォルト値定義**:

```typescript
const DEFAULT_FORM_DATA: SkillInfoFormData = {
  skillName: "",
  purpose: "",
  category: null,
};

const DEFAULT_SMART_DEFAULTS: SmartDefaultResult = {
  who: null,
  input: null,
  timing: null,
  output: null,
  tool: null,
  format: null,
};
```

---

## inferSmartDefaults 呼び出しフロー

```
[Step 0 onNext 呼び出し]
    ↓
handleStep0Next()
    ↓
inferSmartDefaults(formData) ← @repo/shared/services/skillCreator
    ↓
setSmartDefaults(defaults)
    ↓
goNext() → currentStep = 1
    ↓
ConversationRoundStep への smartDefaults Props 受け渡し
```

**エラーハンドリング**:

- `inferSmartDefaults` は純粋関数のため例外は発生しない
- 将来的に非同期化する場合は try/catch で `null` にフォールバック

---

## コンポーネント構造図

```
SkillCreateWizard
├── ProvenanceWarningSummary (workflowSnapshot provenance 表示)
├── StepIndicator (STEPS + currentStep)
├── [Step 0] SkillInfoStep
│     formData, onFormDataChange, onNext={handleStep0Next}
├── [Step 1] ConversationRoundStep
│     formData, smartDefaults, answers, onAnswersChange
│     onBack={goBack}, onGenerate={handleGenerate}
└── [Step 2] CompleteStep
      skillPath, hasExternalIntegration, externalToolName
      onExecuteNow, onOpenInEditor, onCreateAnother
      onQualityFeedback, onRetry
```
