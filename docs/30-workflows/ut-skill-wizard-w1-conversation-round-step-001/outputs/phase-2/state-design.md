# Phase 2 成果物: 状態管理設計書

## 状態定義

```typescript
// ページング状態（1 または 2 のみ）
const [currentPage, setCurrentPage] = useState<1 | 2>(1);

// 回答状態（ConversationAnswers 型・初期値はプリフィル変換で設定）
const [answers, setAnswers] = useState<ConversationAnswers>(() =>
  buildInitialAnswers(smartDefaults),
);
```

## ページング設計

| ページ | 表示質問           | インデックス | 進捗 N 値 |
| ------ | ------------------ | ------------ | --------- |
| 1      | Q1（q1）〜Q3（q3） | 0〜2         | 1, 2, 3   |
| 2      | Q4（q4）〜Q6（q6） | 3〜5         | 4, 5, 6   |

```typescript
const pageQuestions =
  currentPage === 1 ? QUESTIONS.slice(0, 3) : QUESTIONS.slice(3, 6);
const pageOffset = currentPage === 1 ? 0 : 3;
// 質問 N = pageOffset + index + 1
```

## 回答更新ロジック

```typescript
// 選択肢更新
const updateSelectedOption = (
  questionId: keyof ConversationAnswers,
  value: string,
) => {
  setAnswers((prev) => ({
    ...prev,
    [questionId]: { ...prev[questionId], selectedOption: value },
  }));
};

// 自由入力更新
const updateFreeText = (
  questionId: keyof ConversationAnswers,
  value: string,
) => {
  setAnswers((prev) => ({
    ...prev,
    [questionId]: { ...prev[questionId], freeText: value },
  }));
};
```

## プリフィル変換純粋関数

```typescript
function normalizeSelectedOption(
  questionId: keyof ConversationAnswers,
  value: string | null,
): string | null {
  if (value === null) return null;
  if (questionId === "q1" && value === "自分だけ") return "自分のみ";
  if (questionId === "q3" && value === "scheduled") return "定期実行";
  if (questionId === "q3" && value === "realtime") return "イベント駆動";
  if (questionId === "q5" && value === "slack") return "Slack";
  if (questionId === "q5" && value === "github") return "GitHub";
  if (questionId === "q5" && value === "notion") return "その他";
  if (questionId === "q6" && value === "code") return "Markdown";
  if (questionId === "q6" && value === "structured") return "JSON";
  return value;
}

export function buildInitialAnswers(
  defaults: SmartDefaultResult,
): ConversationAnswers {
  return {
    q1: {
      selectedOption: normalizeSelectedOption("q1", defaults.who),
      freeText: "",
    },
    q2: {
      selectedOption: normalizeSelectedOption("q2", defaults.input),
      freeText: "",
    },
    q3: {
      selectedOption: normalizeSelectedOption("q3", defaults.timing),
      freeText: "",
    },
    q4: {
      selectedOption: normalizeSelectedOption("q4", defaults.output),
      freeText: "",
    },
    q5: {
      selectedOption: normalizeSelectedOption("q5", defaults.tool),
      freeText: "",
    },
    q6: {
      selectedOption: normalizeSelectedOption("q6", defaults.format),
      freeText: "",
    },
  };
}
```

### null フォールバック方針

- `null` → `selectedOption: null`（未選択状態）
- semantic default 文字列は UI ラベルへ正規化する
- `inferenceLog` フィールドは無視する
- UI は `selectedOption === null` を「未選択」として表示
