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

## 実行手順

1. Phase 4 の Red テストを current model のまま Green にする。
2. `ChoiceButton` / `FreeTextInput` / `ConversationProgress` / `QuestionCard` / `SkillCreatorConversationPanel` を順に実装する。
3. `vitest` と `typecheck` を実行し、終端状態まで含めて通す。

## 統合テスト連携

- Phase 6 の拡張テストと Phase 7 の coverage にそのまま接続できる実装にする。
- Phase 8 のリファクタリング後も `SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `UserInputQuestion` / `UserInputAnswer` の mapping 契約が変わらないようにする。
- Phase 10 の最終レビューで FR / AC とズレないことを確認する。

## 多角的チェック観点（AIが判断）

- 論理分析系: テスト期待値と実装の一致
- 構造分解系: 各コンポーネントの責務分離
- システム系: IPC / shared types / React state の整合
- 改善思考: 最小の複雑性で最大の要件充足を得る

## サブタスク管理

- 5 コンポーネントは独立に実装できるが、`QuestionCard` は shared 型に依存するため最後に寄せる。
- `SkillCreatorConversationPanel` は IPC と state 管理を統合するので、他コンポーネント実装後にまとめる。
- 完了条件の確認はテストと typecheck を一括で行う。

## タスク100%実行確認【必須】

- [ ] 5 コンポーネントを実装した
- [ ] `SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `UserInputQuestion` / `UserInputAnswer` を current model で扱った
- [ ] Phase 4 のテストが Green になった
- [ ] `pnpm typecheck` のエラー 0 件を確認した

## 実行タスク

### Task 5-1: ChoiceButton.tsx の実装

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`

#### 実装方針

- `isSelected=true` のとき `bg-blue-500 text-white border-blue-600` クラスを適用
- `isSelected=false` のとき `bg-white text-gray-700 border-gray-300 hover:border-blue-400` クラスを適用
- `isFreeText=true` のとき `border-dashed border-gray-400` クラスを追加（未選択時のみ）
- `disabled=true` のとき `opacity-50 cursor-not-allowed` クラスを追加し、クリックを無効化
- `aria-pressed` 属性でアクセシビリティを担保

#### 実装要点

- ベースは `w-full` のボタンにし、選択状態で配色を切り替える
- `isFreeText=true` かつ未選択時のみ破線ボーダーを付与する
- `disabled=true` ではクリックを無効化し、`opacity` と `cursor` を落とす
- `aria-pressed` を付与して選択状態を機械可読にする

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

#### 実装要点

- `isVisible=false` では `null` を返してアンマウントする
- `isSecret=true` のときは単行 `input[type="password"]` を使う
- それ以外は `textarea` を使い、`Enter` で送信・`Shift+Enter` で改行にする
- 送信前に `trim()` し、空文字は破棄する
- 送信後は入力値をクリアする

### Task 5-3: ConversationProgress.tsx の実装

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`

#### 実装方針

- `「質問 N / estimatedTotal」` 形式のテキストを表示
- `width: ${(current / estimatedTotal) * 100}%` でバーの幅を計算
- `role="progressbar"` と `aria-valuenow` / `aria-valuemax` 属性を付与
- `estimatedTotal=0` の場合は除算を防ぐため width: 0% にフォールバック

#### 実装要点

- 表示文言は `質問 {current} / {estimatedTotal}` の固定形式にする
- `estimatedTotal=0` では `0%` にフォールバックする
- 進捗バーには `role="progressbar"` と `aria-valuenow/aria-valuemax/aria-valuemin` を付与する

### Task 5-4: QuestionCard.tsx の実装

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`

#### 実装方針

- `request.kind` によって表示するUIを switch 文で切り替える
- `single_select` / `multi_select` では `request.options` の末尾に常に「その他（自由入力）」を追加
- 「その他（自由入力）」選択時のみ `FreeTextInput` の `isVisible` を `true` にする
- `multi_select` のとき `selectedOptionIds: string[]` を内部状態で管理し、送信ボタンで配列を渡す
- `multi_select` の自由入力は `selectedValues` を使って保持し、`SkillCreatorConversationPanel` 側で session bridge に正規化する
- `secret` タイプは `FreeTextInput` を `isSecret=true` で表示
- `QuestionCard` は `question` 変更時に内部状態を再初期化し、前の質問の free text を持ち越さない
- `FREE_TEXT_LABEL` を選んだ場合は通常選択をクリアし、自由入力を単独の回答経路として扱う

#### 実装スケルトン

```typescript
import React, { useState } from "react";
import type {
  InterviewUserAnswer,
  SkillCreatorUserInputRequest,
} from "@repo/shared/src/types/skillCreator";
import { ChoiceButton } from "./ChoiceButton";
import { FreeTextInput } from "./FreeTextInput";

const FREE_TEXT_LABEL = "その他（自由入力）";

interface QuestionCardProps {
  request: SkillCreatorUserInputRequest;
  onAnswer: (answer: InterviewUserAnswer) => void;
  isSubmitting?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  request,
  onAnswer,
  isSubmitting = false,
}) => {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isFreeTextVisible, setIsFreeTextVisible] = useState(false);

  // single_select / multi_select では常に末尾に「その他（自由入力）」を追加
  const optionsWithFreeText = [
    ...(request.options ?? []),
    { id: "__free_text__", label: FREE_TEXT_LABEL },
  ];

  const handleChoiceClick = (choice: string) => {
    if (choice === "__free_text__") {
      setSelectedOptionIds([]);
      setIsFreeTextVisible(true);
      return;
    }
    setIsFreeTextVisible(false);
    if (request.kind === "multi_select") {
      const next = selectedOptionIds.includes(choice)
        ? selectedOptionIds.filter((c) => c !== choice)
        : [...selectedOptionIds, choice];
      setSelectedOptionIds(next);
    } else {
      onAnswer({ kind: "single_select", selectedOptionId: choice });
    }
  };

  const cardClass = "rounded-lg shadow-md p-6 bg-white";

  switch (request.kind) {
    case "free_text":
      return (
        <div className={cardClass}>
          <p className="mb-2 text-gray-800 font-medium text-lg">
            {request.title}
          </p>
          {request.prompt && (
            <p className="mb-4 text-sm text-gray-500">{request.prompt}</p>
          )}
          <FreeTextInput
            onSubmit={(text) => onAnswer({ kind: "free_text", textValue: text })}
            isVisible={true}
            disabled={isSubmitting}
          />
        </div>
      );

    case "secret":
      return (
        <div className={cardClass}>
          <p className="mb-2 text-gray-800 font-medium text-lg">
            {request.title}
          </p>
          {request.prompt && (
            <p className="mb-4 text-sm text-gray-500">{request.prompt}</p>
          )}
          <FreeTextInput
            onSubmit={(text) => onAnswer({ kind: "secret", secretValue: text })}
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
            {request.title}
          </p>
          {request.prompt && (
            <p className="mb-4 text-sm text-gray-500">{request.prompt}</p>
          )}
          <div className="flex gap-3">
            <ChoiceButton
              label="はい"
              isSelected={false}
              onClick={() => onAnswer({ kind: "confirm", confirmed: true })}
              disabled={isSubmitting}
            />
            <ChoiceButton
              label="いいえ"
              isSelected={false}
              onClick={() => onAnswer({ kind: "confirm", confirmed: false })}
              disabled={isSubmitting}
            />
          </div>
        </div>
      );

    case "multi_select":
      return (
        <div className={cardClass}>
          <p className="mb-2 text-gray-800 font-medium text-lg">
            {request.title}
          </p>
          {request.prompt && (
            <p className="mb-4 text-sm text-gray-500">{request.prompt}</p>
          )}
          <div className="flex flex-col gap-2">
            {optionsWithFreeText.map((option) => (
              <ChoiceButton
                key={option.id}
                label={option.label}
                isSelected={selectedOptionIds.includes(option.id)}
                isFreeText={option.id === "__free_text__"}
                onClick={() => handleChoiceClick(option.id)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          <FreeTextInput
            onSubmit={(text) => onAnswer({ kind: "free_text", textValue: text })}
            isVisible={isFreeTextVisible}
            disabled={isSubmitting}
          />
          <button
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={() =>
              onAnswer({
                kind: "multi_select",
                selectedOptionIds: selectedOptionIds,
                selectedValues: selectedOptionIds,
              })
            }
            disabled={isSubmitting || selectedOptionIds.length === 0}
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
            {request.title}
          </p>
          {request.prompt && (
            <p className="mb-4 text-sm text-gray-500">{request.prompt}</p>
          )}
          <div className="flex flex-col gap-2">
            {optionsWithFreeText.map((option) => (
              <ChoiceButton
                key={option.id}
                label={option.label}
                isSelected={selectedOptionIds.includes(option.id)}
                isFreeText={option.id === "__free_text__"}
                onClick={() => handleChoiceClick(option.id)}
                disabled={isSubmitting}
              />
            ))}
          </div>
          <FreeTextInput
            onSubmit={(text) => onAnswer({ kind: "free_text", textValue: text })}
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

- `useEffect` で `skill-creator:question-received` / `session-complete` / `session-error` の IPC リスナーを登録し、cleanup で解除
- `useReducer` で会話状態を管理（currentRequest / questionIndex / isSubmitting / terminalState）
- `handleAnswer` で `UserInputAnswer` を組み立てて `skill-creator:answer` IPC を送信し、isSubmitting をセット
- `ConversationProgress` に questionIndex と estimatedTotal を渡す
- `QuestionCard` は `key={questionIndex}` で再マウントし、前の質問の内部状態を持ち越さない
- `handleAnswer` は `try/finally` で `isSubmitting` を必ず戻し、IPC 失敗時に UI が固まらないようにする

#### 実装スケルトン

```typescript
import React, { useEffect, useReducer } from "react";
import type {
  InterviewUserAnswer,
  SkillCreatorUserInputRequest,
} from "@repo/shared/types/skillCreator";
import type { UserInputAnswer, UserInputQuestion } from "@repo/shared/types";
import { QuestionCard } from "./QuestionCard";
import { ConversationProgress } from "./ConversationProgress";

const ESTIMATED_TOTAL = 10;

function mapQuestionToRequest(
  question: UserInputQuestion,
): SkillCreatorUserInputRequest {
  return {
    requestId: question.toolCallId,
    reason: "plan_review",
    title: question.question,
    prompt: "",
    kind: question.type,
    options: question.options?.map((option) => ({
      id: option.value,
      label: option.label,
      description: option.description,
    })),
    placeholder: question.placeholder,
    requestedAt: new Date().toISOString(),
  };
}

function mapAnswerToUserInputAnswer(
  answer: InterviewUserAnswer,
  toolCallId: string,
): UserInputAnswer {
  let value: string | string[] | boolean;

  if (answer.confirmed !== undefined) {
    value = answer.confirmed;
  } else if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
    value = answer.selectedOptionIds;
  } else if (answer.selectedOptionId) {
    value = answer.selectedOptionId;
  } else if (answer.secretValue) {
    value = answer.secretValue;
  } else {
    value = answer.textValue ?? "";
  }

  return { toolCallId, value };
}

type State = {
  currentRequest: SkillCreatorUserInputRequest | null;
  currentToolCallId: string | null;
  questionIndex: number;
  isSubmitting: boolean;
  terminalState: "idle" | "complete" | "error";
  errorMessage: string | null;
};

type Action =
  | {
      type: "QUESTION_RECEIVED";
      payload: SkillCreatorUserInputRequest;
      toolCallId: string;
    }
  | { type: "ANSWER_SUBMITTING" }
  | { type: "ANSWER_SUBMITTED" }
  | { type: "SESSION_COMPLETE" }
  | { type: "SESSION_ERROR"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUESTION_RECEIVED":
      return {
        ...state,
        currentRequest: action.payload,
        currentToolCallId: action.toolCallId,
        questionIndex: state.questionIndex + 1,
        isSubmitting: false,
        terminalState: "idle",
        errorMessage: null,
      };
    case "ANSWER_SUBMITTING":
      return { ...state, isSubmitting: true };
    case "ANSWER_SUBMITTED":
      return { ...state, isSubmitting: false };
    case "SESSION_COMPLETE":
      return { ...state, terminalState: "complete", isSubmitting: false };
    case "SESSION_ERROR":
      return {
        ...state,
        terminalState: "error",
        errorMessage: action.message,
        isSubmitting: false,
      };
    default:
      return state;
  }
}

interface SkillCreatorConversationPanelProps {
  onComplete?: () => void;
  onError?: (message: string) => void;
}

export const SkillCreatorConversationPanel: React.FC<
  SkillCreatorConversationPanelProps
> = ({ onComplete, onError }) => {
  const [state, dispatch] = useReducer(reducer, {
    currentRequest: null,
    currentToolCallId: null,
    questionIndex: 0,
    isSubmitting: false,
    terminalState: "idle",
    errorMessage: null,
  });

  useEffect(() => {
    const unsubscribeQuestion = window.skillCreatorSessionAPI.onQuestion(
      (question: UserInputQuestion) => {
        dispatch({
          type: "QUESTION_RECEIVED",
          payload: mapQuestionToRequest(question),
          toolCallId: question.toolCallId,
        });
      },
    );
    const unsubscribeComplete = window.skillCreatorSessionAPI.onComplete(
      () => {
        dispatch({ type: "SESSION_COMPLETE" });
      },
    );
    const unsubscribeError = window.skillCreatorSessionAPI.onError(
      (event: { error: string }) => {
        dispatch({ type: "SESSION_ERROR", message: event.error });
        onError?.(event.error);
      },
    );
    return () => {
      unsubscribeQuestion?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
    };
  }, [onError]);

  useEffect(() => {
    if (state.terminalState === "complete") {
      onComplete?.();
    }
  }, [onComplete, state.terminalState]);

  const handleAnswer = async (answer: InterviewUserAnswer) => {
    if (!state.currentRequest || !state.currentToolCallId) {
      return;
    }
    dispatch({ type: "ANSWER_SUBMITTING" });

    try {
      const submission = mapAnswerToUserInputAnswer(
        answer,
        state.currentToolCallId,
      );
      await window.skillCreatorSessionAPI.sendAnswer(submission);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "送信に失敗しました";
      dispatch({ type: "SESSION_ERROR", message });
      onError?.(message);
    } finally {
      dispatch({ type: "ANSWER_SUBMITTED" });
    }
  };

  if (state.terminalState === "error") {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {state.errorMessage ?? "セッションでエラーが発生しました"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <ConversationProgress
        current={state.questionIndex}
        estimatedTotal={ESTIMATED_TOTAL}
      />
      {state.currentRequest ? (
        <QuestionCard
          key={state.questionIndex}
          request={state.currentRequest}
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

| 資料名                                                                                      | パス                                                                         |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Phase 2 設計                                                                                | `phase-2-design.md`                                                          |
| Phase 4 テスト                                                                              | `phase-4-test-creation.md`                                                   |
| UserInputQuestion / UserInputAnswer / SkillCreatorUserInputRequest / InterviewUserAnswer 型 | `packages/shared/src/types/index.ts`                                         |
| IPC チャネル定数                                                                            | `packages/shared/src/ipc/channels.ts`                                        |
| UI/UX 親仕様                                                                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      |
| IPC 正本                                                                                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        |
| セキュリティ正本                                                                            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| 品質・テスト正本                                                                            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

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
