# Phase 2: 設計 出力

- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 完了日: 2026-04-08
- ステータス: PASS

## コンポーネント構成

```
ConversationRoundStep (親)
├── InterviewProgressBar
├── QuestionCard (インライン)
│   └── ScheduleConfigInput (Q3="定期実行" 時のみ)
└── ApplySummaryCard (showSummaryCard=true 時のみ)
```

## 状態設計

| state           | 型                  | 初期値       | 説明               |
| --------------- | ------------------- | ------------ | ------------------ |
| currentPage     | 1 \| 2              | 1            | 表示ページ         |
| internalAnswers | ConversationAnswers | answers prop | 内部回答状態       |
| showSummaryCard | boolean             | false        | サマリーカード表示 |

## Props インターフェース

```typescript
interface ConversationRoundStepProps {
  formData: SkillInfoFormData;
  smartDefaults: SmartDefaultResult;
  answers: ConversationAnswers;
  onAnswersChange: (answers: ConversationAnswers) => void;
  onBack: () => void;
  onGenerate: (method: "skip" | "complete") => void;
}
```

## key-based マッピング設計

```typescript
const DEFAULT_KEY_BY_QUESTION: Record<QuestionKey, keyof SmartDefaultResult> = {
  q1: "who",
  q2: "input",
  q3: "timing",
  q4: "output",
  q5: "tool",
  q6: "format",
};
```

## Q5 必須化条件

```typescript
const isQ5Required = formData.category === "external-integration";
```

- サマリーカードの「生成する」を**ブロックしない**（警告のみ）
