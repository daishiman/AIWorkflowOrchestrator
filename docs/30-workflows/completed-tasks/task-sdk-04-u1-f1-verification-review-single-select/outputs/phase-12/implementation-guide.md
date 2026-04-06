# 実装ガイド: verification_review request の single_select 化

## タスクID: TASK-SDK-04-U1-F1

---

## Part 1: 初学者向け解説（中学生レベル）

### なぜ選択肢が表示されなかったのか？

**例え話:**

想像してください — 受付の担当者が「この書類、どうしますか？」と聞いてきます。
でも、あなたに渡された回答用紙は **自由記述欄しかない** 状態でした。

本来は「承認・改善・却下」の3択で答えてほしいのに、
自由記述欄しかないから、何を書いていいか分からない…

これが今回の問題でした。

**今回の修正:**

回答用紙を「選択式（3択）」に変えました。

- ✅ 承認してhandoffへ進む
- 🔧 改善して再検証する
- ❌ 差し戻して再計画する

これで画面に3つのボタンが表示されるようになり、
ユーザーが選択できるようになりました！

---

## Part 2: 技術者向け解説

### 変更した型フィールド

`SkillCreatorUserInputRequest.kind` フィールド:

| Before        | After             |
| ------------- | ----------------- |
| `"free_text"` | `"single_select"` |

### 関連インターフェース

```typescript
export interface SkillCreatorUserInputRequest {
  requestId: string;
  reason: "plan_review" | "verification_review";
  title: string;
  prompt: string;
  kind: "single_select" | "multi_select" | "free_text" | "secret" | "confirm";
  options?: SkillCreatorUserInputOption[];
  placeholder?: string;
  allowSkip?: boolean;
  requestedAt: string;
}
```

### APIシグネチャと使用例

```typescript
function createVerificationReviewRequest(
  planId: string,
  message: string,
  requestedAt = nowIso(),
): SkillCreatorAwaitingUserInput;

function validateUserInputSubmission(
  request: SkillCreatorAwaitingUserInput,
  submission: SkillCreatorUserInputSubmission,
): void;
```

```typescript
const request = createVerificationReviewRequest("plan-001", "executor failed");

engine.submitUserInput("plan-001", {
  planId: "plan-001",
  requestId: request.requestId,
  selectedOptionId: "approve",
});
```

### createVerificationReviewRequest() の Before/After

**Before（変更前）:**

```typescript
function createVerificationReviewRequest(
  planId: string,
  message: string,
  requestedAt = nowIso(),
): SkillCreatorAwaitingUserInput {
  return {
    requestId: buildRequestId(planId, "verification_review", requestedAt),
    reason: "verification_review",
    title: "検証レビュー",
    prompt: buildVerificationReviewPrompt(message),
    kind: "free_text",
    placeholder: "承認/改善/却下の理由を入力してください",
    allowSkip: false,
    requestedAt,
  };
}
```

**After（変更後）:**

```typescript
function createVerificationReviewRequest(
  planId: string,
  message: string,
  requestedAt = nowIso(),
): SkillCreatorAwaitingUserInput {
  return {
    requestId: buildRequestId(planId, "verification_review", requestedAt),
    reason: "verification_review",
    title: "検証レビュー",
    prompt: buildVerificationReviewPrompt(message),
    kind: "single_select",
    options: [
      { id: "approve", label: "承認してhandoffへ進む" },
      { id: "improve", label: "改善して再検証する" },
      { id: "reject", label: "差し戻して再計画する" },
    ],
    allowSkip: false,
    requestedAt,
  };
}
```

### SkillCreatorUserInputOption の options 配列定義

```typescript
export interface SkillCreatorUserInputOption {
  id: string;
  label: string;
  description?: string;
}
```

3つの選択肢:

| id          | label                 | applyVerificationReviewTransition() の対応     |
| ----------- | --------------------- | ---------------------------------------------- |
| `"approve"` | 承認してhandoffへ進む | `nextAction: "handoff"`, `status: "pass"`      |
| `"improve"` | 改善して再検証する    | `nextAction: "improve"`                        |
| `"reject"`  | 差し戻して再計画する  | `currentPhase: "plan"`, `nextAction: "review"` |

### 設定可能なパラメータ・定数

| 項目            | 値              | 備考                         |
| --------------- | --------------- | ---------------------------- |
| `kind`          | `single_select` | verification_review では固定 |
| `allowSkip`     | `false`         | スキップ不可                 |
| `options[0].id` | `approve`       | 承認して handoff へ進む      |
| `options[1].id` | `improve`       | 改善して再検証する           |
| `options[2].id` | `reject`        | 差し戻して再計画する         |
| `requestedAt`   | `nowIso()`      | requestId の一部に使う       |

### validateUserInputSubmission の selectedOptionId バリデーション挙動

```typescript
case "single_select":
  if (!submission.selectedOptionId) {
    throw new Error("selectedOptionId is invalid");  // null/undefined/空文字を拒否
  }
  // NFR-3: verification_review は未知 option を no-op fallback として許容する
  if (
    request.reason !== "verification_review" &&
    !request.options?.some(
      (option) => option.id === submission.selectedOptionId,
    )
  ) {
    throw new Error("selectedOptionId is invalid");
  }
```

| ケース                                              | 挙動                   |
| --------------------------------------------------- | ---------------------- |
| `selectedOptionId: undefined`                       | エラー（拒否）         |
| `selectedOptionId: ""`                              | エラー（拒否）         |
| `selectedOptionId: "unknown"` (verification_review) | no-op fallback（許容） |
| `selectedOptionId: "unknown"` (他の single_select)  | エラー（拒否）         |
| `selectedOptionId: "approve"`                       | approve 遷移           |

### 影響範囲

変更は Main Process 内の `createVerificationReviewRequest()` 関数のみ。
Renderer は既存の `single_select` handling が対応（変更なし）。

```
recordExecutionFailure() ──┐
                           ├──► createVerificationReviewRequest() [変更済み]
recordVerifyFailure()   ──┘         │
                                    ▼
                           awaitingUserInput.kind = "single_select"
                                    │
                                    ▼
                           Renderer: 選択肢ボタン表示 [既存実装で対応]
```
