# Implementation Guide: TASK-RALLY-001

## Part 1: 中学生向けの説明

なぜこの変更が必要かというと、今はもう使っていない入力処理が `SkillLifecyclePanel.tsx` に残っていると、次の開発者が「この state や関数はまだ必要なのか」を毎回調べる必要があり、設計を読み違えやすくなるからである。

dead code は、教室の机の中へ残った古いプリントに近い。たとえば、もう提出しない紙が混ざっていると、次に机を開けた人は必要なものと不要なものを毎回見分けなければならない。今回の作業は、その古いプリントだけを片づけて、今使っているものだけにそろえる整理である。

何をしたかというと、`SkillLifecyclePanel.tsx` から「旧入力 state 4つ」「それを初期化するだけの companion `useEffect`」「どこからも呼ばれていない `_handleSubmitWorkflowInput`」を削除した。見た目や操作は変えず、コードを読んだときの迷いだけを減らしている。

### 今回作ったもの

- 新しい UI や新規 API は作っていない
- Phase 4〜12 の成果物を current facts に合わせて整理した
- `artifacts.json` と `outputs/artifacts.json` を同期し、Phase 1〜12 を `completed`、Phase 13 を `blocked` に正規化した

## Part 2: 技術者向け実装詳細

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### 削除対象の型定義

```ts
type RemovedWorkflowInputState = {
  selectedOptionId: string | null;
  textAnswer: string;
  secretAnswer: string;
  confirmAnswer: boolean | null;
};

interface DeadCodeRemovalScope {
  removedStates: keyof RemovedWorkflowInputState;
  removedEffect: "workflowSnapshot-reset-effect";
  removedHandler: "_handleSubmitWorkflowInput";
}
```

### APIシグネチャ

現行の入力送信責務は `ConversationalInterview` 側に集約されている。`SkillLifecyclePanel` が保持すべき current contract は、`workflowSnapshot` を渡し、現行 interview flow の submit を受けることだけである。

```ts
type SubmitAnswer = (answer: string | boolean) => Promise<void>;

type ActiveWorkflowContract = {
  workflowSnapshot: { planId: string };
  submitAnswer: SubmitAnswer;
};
```

### 使用例

```tsx
<ConversationalInterview
  workflowSnapshot={workflowSnapshot}
  onSubmitAnswer={submitAnswer}
/>
```

旧 `_handleSubmitWorkflowInput()` はこの current flow では未使用であり、残置すると責務境界を曖昧にするため削除対象とした。

### エラーハンドリング

- 到達不能な `submitUserInput` 失敗分岐を `SkillLifecyclePanel` 側へ残さない
- `workflowSnapshot?.awaitingUserInput` に連動する state 初期化ロジックを消し、不要な状態不整合の可能性を減らす
- 回帰検証は `typecheck`、`lint`、既存テスト、`rg` による残存参照確認で担保する

### エッジケース

- `useState` 自体は `localError` や `sessionEntries` で継続使用中のため import は削除しない
- `SkillCreatorUserInputSubmission` 型は他箇所で利用されるため本タスクの削除対象に含めない
- テストコード上の `selectedOptionId` は IPC payload のフィールドであり、削除した React state と同名でも別概念である
- UI/UX 変更はないため、Phase 11 は `manual-test-result.md` を primary evidence とし、スクリーンショットは不要

### 設定項目と定数一覧

| 項目            | 値            | 扱い                                            |
| --------------- | ------------- | ----------------------------------------------- |
| UI 種別         | `NON_VISUAL`  | スクリーンショット不要                          |
| workflow status | `in-progress` | Phase 13 が `blocked` のため root status は維持 |
| phase status    | `completed`   | Phase 1〜12 完了済み                            |
| approval status | `blocked`     | commit / PR は未実施                            |

### テスト構成

- 静的確認: `rg -n "_handleSubmitWorkflowInput|selectedOptionId|textAnswer|secretAnswer|confirmAnswer" apps/desktop/src apps/desktop/test packages`
- 型検証: `pnpm --filter @repo/desktop typecheck`
- Lint: `pnpm --filter @repo/desktop lint`
- 回帰: `pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel`
- 手動証跡: `outputs/phase-11/manual-test-result.md`

### 影響範囲

- 変更ファイル: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` 1ファイル
- 後続タスク: RALLY-005 の前提条件を満たす
- 並列関係: RALLY-002, RALLY-004 とは独立
