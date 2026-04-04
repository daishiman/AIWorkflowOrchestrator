# Phase 5: 実装（TDD: Green）— Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 5                     |
| 機能名    | conversation-ui       |
| タスクID  | TASK-SDK-SC-02        |
| 作成日    | 2026-04-02            |
| 依存Phase | Phase 4（テスト作成） |

## 目的

Phase 4 で作成したテスト（T-01 から T-06）を全て通す実装を行う（TDD: Green フェーズ）。全5コンポーネントを新規作成する。

## 実行タスク

### Task 5-1: ChoiceButton.tsx の実装

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`

#### 実装方針

- `isSelected=true` のとき `bg-blue-500 text-white border-blue-600` クラスを適用
- `isSelected=false` のとき `bg-white text-gray-700 border-gray-300 hover:border-blue-400` クラスを適用
- `isFreeText=true` のとき `border-dashed border-gray-400` クラスを追加（未選択時のみ）
- `disabled=true` のとき `opacity-50 cursor-not-allowed` クラスを追加し、クリックを無効化
- `aria-pressed` 属性でアクセシビリティを担保

#### 実装スケルトン

```typescript
import React from "react";

interface ChoiceButtonProps {
  label: string;
  isSelected: boolean;
  isFreeText?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  label,
  isSelected,
  isFreeText = false,
  onClick,
  disabled = false,
}) => {
  const baseClass =
    "w-full text-left px-4 py-3 rounded-lg border-2 transition-colors";
  const selectedClass = isSelected
    ? "bg-blue-500 text-white border-blue-600"
    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400";
  const freeTextClass =
    isFreeText && !isSelected ? "border-dashed border-gray-400" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseClass} ${selectedClass} ${freeTextClass} ${disabledClass}`.trim()}
      onClick={disabled ? undefined : onClick}
      aria-pressed={isSelected}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

### Task 5-2: FreeTextInput.tsx の実装

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`

#### 実装方針

- `isVisible=false` のとき `null` を返してアンマウント
- `isSecret=true` のとき `<input type="password">` を使用（単行）
- `isSecret=false` のとき `<textarea>` を使用（複数行）
- `onKeyDown` ハンドラで `Enter`（Shift なし）のとき `onSubmit` を呼び出し
- `isSecret=true` 時は Shift+Enter の改行挙動を無効化（単行フィールドのため不要）
- 空文字列のとき `onSubmit` を呼び出さない（バリデーション）
- 送信後は入力値をリセット

#### 実装スケルトン

```typescript
import React, { useState } from "react";

interface FreeTextInputProps {
  placeholder?: string;
  onSubmit: (text: string) => void;
  isVisible: boolean;
  isSecret?: boolean;
  disabled?: boolean;
}

export const FreeTextInput: React.FC<FreeTextInputProps> = ({
  placeholder = "自由に入力してください...",
  onSubmit,
  isVisible,
  isSecret = false,
  disabled = false,
}) => {
  const [value, setValue] = useState("");

  if (!isVisible) return null;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        onSubmit(trimmed);
        setValue("");
      }
    }
  };

  const commonClass =
    "w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "";

  if (isSecret) {
    return (
      <input
        type="password"
        className={`${commonClass} ${disabledClass}`}
        value={value}
        placeholder={placeholder || "シークレット値を入力してください..."}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
    );
  }

  return (
    <textarea
      className={`${commonClass} resize-none ${disabledClass}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      rows={3}
      disabled={disabled}
    />
  );
};
```

### Task 5-3: ConversationProgress.tsx の実装

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`

#### 実装方針

- `「質問 N / estimatedTotal」` 形式のテキストを表示
- `width: ${(current / estimatedTotal) * 100}%` でバーの幅を計算
- `role="progressbar"` と `aria-valuenow` / `aria-valuemax` 属性を付与
- `estimatedTotal=0` の場合は除算を防ぐため width: 0% にフォールバック

#### 実装スケルトン

```typescript
import React from "react";

interface ConversationProgressProps {
  current: number;
  estimatedTotal: number;
}

export const ConversationProgress: React.FC<ConversationProgressProps> = ({
  current,
  estimatedTotal,
}) => {
  const percent =
    estimatedTotal > 0 ? Math.round((current / estimatedTotal) * 100) : 0;

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-600 mb-2">
        質問 {current} / {estimatedTotal}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={estimatedTotal}
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
```

### Task 5-4: QuestionCard.tsx の実装

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`

#### 実装方針

- `question.type` によって表示するUIを switch 文で切り替える
- `single_select` / `multi_select` では `payload.choices` の末尾に常に「その他（自由入力）」を追加
- 「その他（自由入力）」選択時のみ `FreeTextInput` の `isVisible` を `true` にする
- `multi_select` のとき `selectedChoices: string[]` を内部状態で管理し、送信ボタンで配列を渡す
- `secret` タイプは `FreeTextInput` を `isSecret=true` で表示

#### 実装スケルトン

```typescript
import React, { useState } from "react";
import type { QuestionPayload } from "@repo/shared/src/types/skillCreator";
import { ChoiceButton } from "./ChoiceButton";
import { FreeTextInput } from "./FreeTextInput";

const FREE_TEXT_LABEL = "その他（自由入力）";

interface QuestionCardProps {
  question: QuestionPayload;
  onAnswer: (answer: string | string[]) => void;
  isSubmitting?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  isSubmitting = false,
}) => {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [isFreeTextVisible, setIsFreeTextVisible] = useState(false);

  // single_select / multi_select では常に末尾に「その他（自由入力）」を追加
  const choicesWithFreeText = [...question.choices, FREE_TEXT_LABEL];

  const handleChoiceClick = (choice: string) => {
    if (choice === FREE_TEXT_LABEL) {
      setIsFreeTextVisible(true);
      return;
    }
    setIsFreeTextVisible(false);
    if (question.type === "multi_select") {
      const next = selectedChoices.includes(choice)
        ? selectedChoices.filter((c) => c !== choice)
        : [...selectedChoices, choice];
      setSelectedChoices(next);
    } else {
      onAnswer(choice);
    }
  };

  const cardClass = "rounded-lg shadow-md p-6 bg-white";

  switch (question.type) {
    case "free_text":
      return (
        <div className={cardClass}>
          <p className="mb-2 text-gray-800 font-medium text-lg">
            {question.question}
          </p>
          {question.context && (
            <p className="mb-4 text-sm text-gray-500">{question.context}</p>
          )}
          <FreeTextInput
            onSubmit={onAnswer}
            isVisible={true}
            disabled={isSubmitting}
          />
        </div>
      );

    case "secret":
      return (
        <div className={cardClass}>
          <p className="mb-2 text-gray-800 font-medium text-lg">
            {question.question}
          </p>
          {question.context && (
            <p className="mb-4 text-sm text-gray-500">{question.context}</p>
          )}
          <FreeTextInput
            onSubmit={onAnswer}
            isVisible={true}
            isSecret={true}
            placeholder="シークレット値を入力してください..."
            disabled={isSubmitting}
          />
        </div>
      );

    case "confirm":
      return (
        <div className={cardClass}>
          <p className="mb-2 text-gray-800 font-medium text-lg">
            {question.question}
          </p>
          {question.context && (
            <p className="mb-4 text-sm text-gray-500">{question.context}</p>
          )}
          <div className="flex gap-3">
            <ChoiceButton
              label="はい"
              isSelected={false}
              onClick={() => onAnswer("yes")}
              disabled={isSubmitting}
            />
            <ChoiceButton
              label="いいえ"
              isSelected={false}
              onClick={() => onAnswer("no")}
              disabled={isSubmitting}
            />
          </div>
        </div>
      );

    case "multi_select":
      return (
        <div className={cardClass}>
          <p className="mb-2 text-gray-800 font-medium text-lg">
            {question.question}
          </p>
          {question.context && (
            <p className="mb-4 text-sm text-gray-500">{question.context}</p>
          )}
          <div className="flex flex-col gap-2">
            {choicesWithFreeText.map((choice) => (
              <ChoiceButton
                key={choice}
                label={choice}
                isSelected={selectedChoices.includes(choice)}
                isFreeText={choice === FREE_TEXT_LABEL}
                onClick={() => handleChoiceClick(choice)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          <FreeTextInput
            onSubmit={(text) => onAnswer(text)}
            isVisible={isFreeTextVisible}
            disabled={isSubmitting}
          />
          <button
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={() => onAnswer(selectedChoices)}
            disabled={isSubmitting || selectedChoices.length === 0}
          >
            送信
          </button>
        </div>
      );

    // single_select（デフォルト）
    default:
      return (
        <div className={cardClass}>
          <p className="mb-2 text-gray-800 font-medium text-lg">
            {question.question}
          </p>
          {question.context && (
            <p className="mb-4 text-sm text-gray-500">{question.context}</p>
          )}
          <div className="flex flex-col gap-2">
            {choicesWithFreeText.map((choice) => (
              <ChoiceButton
                key={choice}
                label={choice}
                isSelected={selectedChoices.includes(choice)}
                isFreeText={choice === FREE_TEXT_LABEL}
                onClick={() => handleChoiceClick(choice)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          <FreeTextInput
            onSubmit={(text) => onAnswer(text)}
            isVisible={isFreeTextVisible}
            disabled={isSubmitting}
          />
        </div>
      );
  }
};
```

### Task 5-5: SkillCreatorConversationPanel.tsx の実装

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`

#### 実装方針

- `useEffect` で `skill-creator:question-received` IPCリスナーを登録し、cleanup で解除
- `useReducer` で会話状態を管理（currentQuestion / questionIndex / isSubmitting）
- `handleAnswer` で `skill-creator:answer` IPC を invoke し、isSubmitting をセット
- `ConversationProgress` に questionIndex と estimatedTotal を渡す

#### 実装スケルトン

```typescript
import React, { useEffect, useReducer } from "react";
import type { QuestionPayload } from "@repo/shared/src/types/skillCreator";
import {
  SKILL_CREATOR_QUESTION_RECEIVED,
  SKILL_CREATOR_ANSWER,
} from "@repo/shared/src/ipc/channels";
import { QuestionCard } from "./QuestionCard";
import { ConversationProgress } from "./ConversationProgress";

const ESTIMATED_TOTAL = 10;

type State = {
  currentQuestion: QuestionPayload | null;
  questionIndex: number;
  isSubmitting: boolean;
};

type Action =
  | { type: "QUESTION_RECEIVED"; payload: QuestionPayload }
  | { type: "ANSWER_SUBMITTING" }
  | { type: "ANSWER_SUBMITTED" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUESTION_RECEIVED":
      return {
        ...state,
        currentQuestion: action.payload,
        questionIndex: state.questionIndex + 1,
        isSubmitting: false,
      };
    case "ANSWER_SUBMITTING":
      return { ...state, isSubmitting: true };
    case "ANSWER_SUBMITTED":
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}

interface SkillCreatorConversationPanelProps {
  onClose?: () => void;
  onComplete?: () => void;
}

export const SkillCreatorConversationPanel: React.FC<
  SkillCreatorConversationPanelProps
> = ({ onClose, onComplete }) => {
  const [state, dispatch] = useReducer(reducer, {
    currentQuestion: null,
    questionIndex: 0,
    isSubmitting: false,
  });

  useEffect(() => {
    const unsubscribe = window.api.on(
      SKILL_CREATOR_QUESTION_RECEIVED,
      (payload: QuestionPayload) => {
        dispatch({ type: "QUESTION_RECEIVED", payload });
      },
    );
    return () => {
      unsubscribe?.();
    };
  }, []);

  const handleAnswer = async (answer: string | string[]) => {
    dispatch({ type: "ANSWER_SUBMITTING" });
    await window.api.invoke(SKILL_CREATOR_ANSWER, { answer });
    dispatch({ type: "ANSWER_SUBMITTED" });
  };

  return (
    <div className="flex flex-col h-full p-4">
      <ConversationProgress
        current={state.questionIndex}
        estimatedTotal={ESTIMATED_TOTAL}
      />
      {state.currentQuestion ? (
        <QuestionCard
          question={state.currentQuestion}
          onAnswer={handleAnswer}
          isSubmitting={state.isSubmitting}
        />
      ) : (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          質問を待機中...
        </div>
      )}
    </div>
  );
};
```

### Task 5-6: Green フェーズ確認

```bash
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill-creator/__tests__/
```

期待する結果: T-01 から T-06 の全テストが PASS

### Task 5-7: TypeScript コンパイル確認

```bash
pnpm --filter @repo/desktop typecheck
```

期待する結果: エラー 0 件

## 参照資料

| 資料名             | パス                                        |
| ------------------ | ------------------------------------------- |
| Phase 2 設計       | `phase-2-design.md`                         |
| Phase 4 テスト     | `phase-4-test-creation.md`                  |
| QuestionPayload 型 | `packages/shared/src/types/skillCreator.ts` |
| IPC チャネル定数   | `packages/shared/src/ipc/channels.ts`       |

## 成果物

| 成果物                        | パス                                                                                   | 形式       |
| ----------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| ChoiceButton                  | `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`                  | TypeScript |
| FreeTextInput                 | `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`                 | TypeScript |
| ConversationProgress          | `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`          | TypeScript |
| QuestionCard                  | `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | TypeScript |
| SkillCreatorConversationPanel | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | TypeScript |

## 完了条件

- [ ] `ChoiceButton.tsx` を新規作成した（選択/未選択/isFreeText/disabled スタイル実装済み）
- [ ] `FreeTextInput.tsx` を新規作成した（isVisible制御・isSecret・Enter送信・空文字バリデーション実装済み）
- [ ] `ConversationProgress.tsx` を新規作成した（「質問N/推定合計」形式・バー表示実装済み）
- [ ] `QuestionCard.tsx` を新規作成した（5タイプ分岐・「その他（自由入力）」常時末尾追加実装済み）
- [ ] `SkillCreatorConversationPanel.tsx` を新規作成した（IPCリスナー・useReducer状態管理・統合実装済み）
- [ ] Phase 4 の全テスト（T-01 から T-06）が PASS した
- [ ] `pnpm typecheck` がエラー 0 件で完了した

## 次の Phase: Phase 6 (phase-6-test-expansion.md)
