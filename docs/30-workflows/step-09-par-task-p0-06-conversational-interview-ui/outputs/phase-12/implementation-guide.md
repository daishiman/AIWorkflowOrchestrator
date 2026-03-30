# Implementation Guide — Phase 12 TASK-P0-06

## Part 1: 概念説明

この変更は、紙のアンケートを順番に埋める形から、会話しながら必要な答えを集める形へ変えるものです。受付の人が一問ずつ聞いてくれて、答え直したければその場で前の質問へ戻れる状態を目指します。

今回の修正では次を実施しました。

- 質問 UI を会話型コンポーネントへ分離
- `multi_select` を shared 型、renderer、main validation まで通した
- undo で前の質問と入力値を復元するよう補強
- submit 失敗時に optimistic な user message を巻き戻すよう補強

## Part 2: 技術詳細

### 変更対象

- `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `packages/shared/src/types/skillCreator.ts`

### 契約

```ts
export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  selectedValues?: string[]; // backward compatibility
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}
```

### 重要な実装ポイント

1. `multi_select` は canonical を `selectedOptionIds` に寄せつつ、`selectedValues` を互換入力として許容
2. `undo` は履歴削除だけでなく、assistant message と直前回答の入力値を復元
3. `onSubmit` 失敗時は renderer 側の optimistic user message を rollback

### 未完了事項

- representative screenshots の取得
- aiworkflow-requirements への same-wave sync
