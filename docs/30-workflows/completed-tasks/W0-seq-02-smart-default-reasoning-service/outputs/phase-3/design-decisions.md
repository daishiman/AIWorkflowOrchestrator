# 設計判断メモ — 型マッピング

## 背景

コードベースに2つの型体系が存在する：

1. **Workflow型** (`skillCreator.ts`): `SkillCreatorUserInputRequest` — `kind`, `title`, `prompt`, `requestId`, `options[{id, label}]`
2. **Session Bridge型** (`skillCreatorSession.ts`): `UserInputQuestion` — `type`, `question`, `toolCallId`, `options[{value, label}]`

## 判断

- Atom / Molecule コンポーネント: Workflow型 (`SkillCreatorUserInputRequest`, `InterviewUserAnswer`) を使用
- `SkillCreatorConversationPanel`: `window.skillCreatorSessionAPI` を使用し、`UserInputQuestion` → `SkillCreatorUserInputRequest` のマッピング関数を実装
- テスト: Atom / Molecule は仕様書通り、Panel はモック `window.skillCreatorSessionAPI` を使用

## マッピング関数

```typescript
function mapQuestionToRequest(
  q: UserInputQuestion,
): SkillCreatorUserInputRequest {
  return {
    requestId: q.toolCallId,
    reason: "plan_review",
    title: q.question,
    prompt: "",
    kind: q.type as SkillCreatorUserInputKind,
    options: q.options?.map((o) => ({
      id: o.value,
      label: o.label,
      description: o.description,
    })),
    placeholder: q.placeholder,
    requestedAt: new Date().toISOString(),
  };
}
```
