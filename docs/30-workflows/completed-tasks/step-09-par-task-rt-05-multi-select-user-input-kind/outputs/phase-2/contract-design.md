# Phase 2: Contract Design

## shared type 拡張

```ts
export type SkillCreatorUserInputKind =
  | "single_select"
  | "multi_select" // ← 追加
  | "free_text"
  | "secret"
  | "confirm";

export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[]; // ← 追加
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}
```

## engine validation 設計

```ts
case "multi_select":
  if (!Array.isArray(submission.selectedOptionIds) || submission.selectedOptionIds.length === 0) {
    throw new Error("selectedOptionIds must be a non-empty array");
  }
  for (const id of submission.selectedOptionIds) {
    if (!request.options?.some((option) => option.id === id)) {
      throw new Error("selectedOptionIds contains unknown option id");
    }
  }
  return;
```

- `verification_review` の unknown option fallback は `single_select` のみ維持
- `multi_select` は厳密検証（全要素が既知 option id であること）

## renderer submit 設計

```ts
} else if (requestState.kind === "multi_select") {
  submission.selectedOptionIds = selectedOptionIds;
}
```
