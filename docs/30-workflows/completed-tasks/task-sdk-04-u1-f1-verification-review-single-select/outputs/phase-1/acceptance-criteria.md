# Phase 1: 受け入れ基準

## タスクID: TASK-SDK-04-U1-F1

## 受け入れ基準一覧

| AC-ID | 受け入れ基準                                                              | 検証方法                   | 対応 TC     |
| ----- | ------------------------------------------------------------------------- | -------------------------- | ----------- |
| AC-1  | `createVerificationReviewRequest()` が `kind: "single_select"` を返す     | テスト（単体）             | TC-NEW-1    |
| AC-2  | `options` に `approve` / `improve` / `reject` の3選択肢が含まれる         | テスト（単体）             | TC-NEW-2    |
| AC-3  | `validateUserInputSubmission` が options 外の selectedOptionId を拒否する | テスト（単体）             | TC-NEW-3    |
| AC-4  | 既存テスト全件パス（回帰なし）                                            | `pnpm exec vitest run ...` | TC-MOD-1〜3 |

## 詳細定義

### AC-1: kind: "single_select"

```typescript
// createVerificationReviewRequest() が返す値の kind フィールド
expect(awaitingUserInput.kind).toBe("single_select");
```

- 確認方法: `recordExecutionFailure()` または `recordVerifyFailure()` 経由で `awaitingUserInput` を取得し、`kind` フィールドを確認

### AC-2: 3選択肢の存在

```typescript
// options 配列に approve/improve/reject が含まれる
expect(awaitingUserInput.options).toHaveLength(3);
expect(awaitingUserInput.options?.map((o) => o.id)).toEqual([
  "approve",
  "improve",
  "reject",
]);
```

### AC-3: 不正 selectedOptionId のバリデーション

```typescript
// selectedOptionId が null/undefined/空文字の場合はエラー
expect(() => engine.submitUserInput(..., {
  selectedOptionId: undefined,
})).toThrow("selectedOptionId is invalid");
```

- 注意: NFR-3 により、verification_review の未知文字列 option は no-op fallback（エラーなし）
- AC-3 は null/undefined/空文字のケースで拒否されることを確認

### AC-4: 回帰なし

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

- 全テスト PASS が条件

## 補足: NFR-3 との整合

| ケース                               | 期待動作               | 根拠       |
| ------------------------------------ | ---------------------- | ---------- |
| `selectedOptionId: null`             | エラー（拒否）         | AC-3       |
| `selectedOptionId: ""`               | エラー（拒否）         | AC-3       |
| `selectedOptionId: "unknown_option"` | no-op fallback（許容） | NFR-3      |
| `selectedOptionId: "approve"`        | approve 遷移           | AC-1, AC-2 |
