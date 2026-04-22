# Implementation Guide

## Part 1

なぜ必要かというと、会話の「戻る」を押したときに、画面に見えている質問と実際に送られる回答先がずれると、ユーザーは正しい質問に答えたつもりでも別の質問へ送信してしまうからです。これは会話の信頼性を壊します。

たとえば、学校の面談で先生が前の質問に戻してくれたのに、提出箱だけ次の質問用のままだと、見えている紙と提出先が食い違います。RALLY-002 ではその食い違いをなくし、「今見えている質問」がそのまま送信先になるようにそろえました。

何をするかというと、復元中に表示している質問を submission 生成でもそのまま使い、新しい snapshot が本当に届くまでは復元表示を維持するようにします。

### 今回作ったもの

- 復元中の `pendingRequest` を、そのまま submission 生成元にも使う修正
- 送信成功直後に復元状態を早く消しすぎないようにする修正
- undo 復元中の再送信 payload と stale fallback を固定する回帰テスト

## Part 2

### 対象コンポーネント

- `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`

### 型定義

```ts
type PendingSource =
  | { kind: "restored"; requestId: string }
  | { kind: "snapshot"; requestId: string }
  | { kind: "none" };

interface SubmissionSnapshotLike {
  planId: string;
  awaitingUserInput: SkillCreatorUserInputRequest | null;
}
```

### APIシグネチャ

```ts
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;

const submission = interview.buildSubmission(
  {
    ...workflowSnapshot,
    awaitingUserInput: pendingRequest,
  },
  answer,
);
```

### 使用例

```ts
fireEvent.click(screen.getByTestId("interview-undo"));
fireEvent.click(screen.getByTestId("chip-opt-b"));
fireEvent.click(screen.getByTestId("interview-submit"));

expect(mockOnSubmit).toHaveBeenLastCalledWith(
  expect.objectContaining({
    requestId: "req-ec6-001",
    selectedOptionId: "opt-b",
  }),
);
```

### エラーハンドリング

- `pendingRequest` が取れない場合は submission を作らず、ロールバックして `回答の構築に失敗しました` を返す
- `onSubmit` が失敗した場合は最後の user message をロールバックし、`回答の送信に失敗しました` を返す

### エッジケース

- undo 復元中に live snapshot が残っていても、表示中の restored request を送信元に使う
- 再送信成功直後は restored state を維持し、新しい `requestId` の snapshot 到着時だけ通常フローへ戻る
- `requestId` が同じまま snapshot 内容だけ変わる場合は、既存どおり restored 優先を維持する

### 設定項目と定数一覧

| 項目       | 値/規則                                                 | 用途                            |
| ---------- | ------------------------------------------------------- | ------------------------------- |
| 優先規則   | `restored ?? snapshot ?? null`                          | 表示中の質問ソースを決定        |
| クリア条件 | `workflowSnapshot?.awaitingUserInput?.requestId` の変化 | restored から通常フローへの復帰 |
| エラー文言 | `回答の構築に失敗しました` / `回答の送信に失敗しました` | 失敗時の UI 通知                |

### テスト構成

- 正常系: snapshot フォールバック、undo 復元優先、requestId 変化で通常復帰
- 境界系: 両値非 null、同一 requestId 維持、再マウント、undo 再送信 payload、stale fallback 防止
- 実測制約: vitest 実行は esbuild host/binary mismatch により未完了

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

- 代替証跡: `outputs/phase-10/final-review-result.md`
- 代替証跡: `outputs/phase-11/manual-test-result.md`
