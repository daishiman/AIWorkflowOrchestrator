# TASK-SW-STREAM-001 テスト拡充記録

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 6                                                                 |
| Phase名    | テスト拡充                                                        |
| 対象タスク | TASK-SW-STREAM-001                                                |
| 対象機能   | SkillCreatorService.createSkill() onProgress コールバック引数追加 |
| 作成日     | 2026-04-17                                                        |
| 状態       | 完了                                                              |
| 担当       | AIエージェント（ポストモーテム記録）                              |

## 概要

本ドキュメントは Phase 5 実装後の拡充テスト設計記録である。  
基本テストケース TC-01〜TC-06 に加え、境界条件・呼び出し順序・呼び出し回数を検証する
TC-07〜TC-14 の設計内容と、実際の追加状況を記録する。

---

## 境界条件テスト設計（TC-07〜TC-10）

### 設計方針

Phase 4 で設計した TC-01〜TC-06 は各フェーズが呼ばれることを個別に検証する。
TC-07〜TC-10 では以下の観点を追加する:

1. **呼び出し回数**: 合計5回（planning/generating-skill/generating-agents/validating/done）のみ呼ばれること
2. **呼び出し順序**: フェーズが planning → done の昇順で呼ばれること
3. **percentage 値の正確性**: 10/40/70/90/100 の値が正確であること
4. **message の型・内容**: 日本語文字列が正確に渡されること

### テストケース一覧

| TC ID | テストタイトル                                        | 期待結果                                     | 実装状況                        |
| ----- | ----------------------------------------------------- | -------------------------------------------- | ------------------------------- |
| TC-07 | onProgress が合計5回呼ばれること                      | `onProgress.mock.calls.length === 5`         | 実装済み（progress.test.ts 内） |
| TC-08 | コールバックの呼び出し順が planning → done の順である | 1回目 planning, 5回目 done の順序検証        | 実装済み（progress.test.ts 内） |
| TC-09 | 各コールバックの percentage が 10/40/70/90/100 である | `percentages.toEqual([10, 40, 70, 90, 100])` | 実装済み（progress.test.ts 内） |
| TC-10 | 各コールバックの message が正確な日本語文字列である   | 5件の日本語 message が正確に一致すること     | 実装済み（progress.test.ts 内） |

### TC-07: 呼び出し回数検証

```typescript
it("TC-06: onProgress が合計5回呼ばれること", async () => {
  allowSuccessfulCreate();
  await service.createSkill(validCreateOptions, onProgress);

  expect(onProgress).toHaveBeenCalledTimes(5);
});
```

### TC-08: 呼び出し順序検証

```typescript
it("TC-08: onProgress のフェーズが planning→done の順序で呼ばれること", async () => {
  allowSuccessfulCreate();
  await service.createSkill(validCreateOptions, onProgress);

  expect(onProgress).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ phase: "planning" }),
  );
  expect(onProgress).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ phase: "generating-skill" }),
  );
  expect(onProgress).toHaveBeenNthCalledWith(
    3,
    expect.objectContaining({ phase: "generating-agents" }),
  );
  expect(onProgress).toHaveBeenNthCalledWith(
    4,
    expect.objectContaining({ phase: "validating" }),
  );
  expect(onProgress).toHaveBeenNthCalledWith(
    5,
    expect.objectContaining({ phase: "done" }),
  );
});
```

### TC-09: percentage 値の正確性検証

```typescript
it("TC-09: onProgress の percentage 値が正確に 10/40/70/90/100 であること", async () => {
  allowSuccessfulCreate();
  await service.createSkill(validCreateOptions, onProgress);

  const percentages = onProgress.mock.calls.map(
    (c: [{ percentage: number }]) => c[0].percentage,
  );
  expect(percentages).toEqual([10, 40, 70, 90, 100]);
});
```

### TC-10: message 内容の検証

```typescript
it("TC-10: onProgress の message 内容が正確な日本語文字列であること", async () => {
  allowSuccessfulCreate();
  await service.createSkill(validCreateOptions, onProgress);

  const messages = onProgress.mock.calls.map(
    (c: [{ message: string }]) => c[0].message,
  );
  expect(messages).toEqual([
    "構造を計画しています",
    "SKILL.md を生成しています",
    "エージェント定義を生成しています",
    "スキルを検証しています",
    "完了しました",
  ]);
});
```

---

## 追加境界条件テスト設計（TC-11〜TC-14）

Phase 6 時点で追加設計された境界条件テスト。実際には `SkillCreatorService.progress.test.ts` に実装済み。

| TC ID | テストタイトル                                                  | 期待結果                                               | 実装状況                        |
| ----- | --------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------- |
| TC-11 | onProgress がエラーを投げた場合にそのエラーが伝播すること       | `createSkill` が `"コールバックエラー"` で reject する | 実装済み（progress.test.ts 内） |
| TC-12 | collaborative モードでも planning フェーズが呼ばれること        | `planning` フェーズのコールバックが発火する            | 実装済み（progress.test.ts 内） |
| TC-13 | バリデーションエラー時に done フェーズが呼ばれないこと          | `done` フェーズのコールバックが発火しない              | 実装済み（progress.test.ts 内） |
| TC-14 | onProgress に渡されるオブジェクトが毎回新しいオブジェクトである | 各呼び出しのオブジェクト参照が異なる                   | 実装済み（progress.test.ts 内） |

### TC-11: コールバックエラーの伝播

```typescript
it("TC-11: onProgress がエラーを投げた場合にそのエラーが伝播すること", async () => {
  allowSuccessfulCreate();
  const throwingCallback = vi.fn().mockImplementation(() => {
    throw new Error("コールバックエラー");
  });

  await expect(
    service.createSkill(validCreateOptions, throwingCallback),
  ).rejects.toThrow("コールバックエラー");
  expect(throwingCallback).toHaveBeenCalledTimes(1);
});
```

### TC-12: collaborative モードでの planning コールバック

`planning` フェーズの `emitProgress` 呼び出しは switch 文の前（L203〜L208）に配置されているため、
`collaborative` モードでも `planning` フェーズは発火する。

```typescript
it("TC-12: create モード以外（collaborative）でも planning フェーズが呼ばれること", async () => {
  allowSuccessfulCreate();
  const collaborativeOptions: CreateSkillOptions = {
    name: "collab-skill",
    description: "Collaborative skill",
    mode: "collaborative",
    interviewResult: mockInterviewResult,
  };
  await service.createSkill(collaborativeOptions, onProgress);

  expect(onProgress).toHaveBeenCalledWith(
    expect.objectContaining({ phase: "planning" }),
  );
});
```

### TC-13: バリデーションエラー時の done 未発火

```typescript
it("TC-13: createSkill がバリデーションエラーで終了した場合 done フェーズが呼ばれないこと", async () => {
  const invalidOptions: CreateSkillOptions = {
    name: "",
    description: "Test",
    mode: "create",
  };

  await expect(
    service.createSkill(invalidOptions, onProgress),
  ).rejects.toThrow();
  expect(onProgress).not.toHaveBeenCalledWith(
    expect.objectContaining({ phase: "done" }),
  );
});
```

### TC-14: オブジェクト参照の独立性

```typescript
it("TC-14: onProgress に渡されるオブジェクトが毎回新しいオブジェクトであること", async () => {
  allowSuccessfulCreate();
  await service.createSkill(validCreateOptions, onProgress);

  const calls = onProgress.mock.calls as [object][];
  const objects = calls.map((c) => c[0]);
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      expect(objects[i]).not.toBe(objects[j]);
    }
  }
});
```

---

## TASK-SW-STREAM-002 との接続を見越した拡充観点

`onProgress` コールバックは TASK-SW-STREAM-002 において IPC 経由で
`sendSkillCreatorProgress` に渡されることが想定される。
以下の点を本テストで事前に担保している:

| 確認項目                     | 担保するテスト | 内容                                               |
| ---------------------------- | -------------- | -------------------------------------------------- |
| `phase` が文字列型           | TC-10          | 期待される文字列値と完全一致することを検証         |
| `percentage` が数値型        | TC-09          | 期待される数値配列と完全一致することを検証         |
| `message` が日本語文字列     | TC-10          | 日本語 message が正確に渡されることを検証          |
| オブジェクトが毎回独立       | TC-14          | IPC シリアライズ時の参照共有問題を防ぐ             |
| コールバックエラーが伝播する | TC-11          | IPC 側でのエラーハンドリングが必要であることを示す |

---

## 未追加テストの記録

現状（2026-04-17 時点）において、以下のテストは `SkillCreatorService.test.ts` への
**直接追加は保留中**である（`SkillCreatorService.progress.test.ts` として独立ファイルで実装済み）:

| テストID     | 追加先想定ファイル          | 実際の追加先                                |
| ------------ | --------------------------- | ------------------------------------------- |
| TC-01〜TC-06 | SkillCreatorService.test.ts | SkillCreatorService.progress.test.ts (新規) |
| TC-07〜TC-14 | SkillCreatorService.test.ts | SkillCreatorService.progress.test.ts (新規) |

独立ファイルとすることで、既存の `SkillCreatorService.test.ts` の肥大化を防ぎ、
進捗コールバックの責務を明確に分離している。

---

## テスト実行確認コマンド

```bash
# 拡充テストのみ実行
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService.progress"

# 全 SkillCreatorService テスト実行
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService"

# カバレッジ確認
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService" \
  --coverage
```

---

## 参照資料

- `docs/30-workflows/p02-par-STREAM-001/phase-6-test-expansion.md` — Phase 6 実行計画書
- `docs/30-workflows/p02-par-STREAM-001/outputs/phase-4/TASK-SW-STREAM-001-test-design.md` — 基本テストケース（TC-01〜TC-06）
- `docs/30-workflows/p02-par-STREAM-001/outputs/phase-5/TASK-SW-STREAM-001-implementation-plan.md` — 実装記録
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` — 実際のテストコード（TC-01〜TC-14）

---

## 完了チェックリスト

- [x] TC-07（呼び出し回数5回）の設計が完了している
- [x] TC-08（呼び出し順序 planning→done）の設計が完了している
- [x] TC-09（percentage 値 10/40/70/90/100）の設計が完了している
- [x] TC-10（message 日本語文字列）の設計が完了している
- [x] TC-11（コールバックエラー伝播）の設計が完了している
- [x] TC-12（collaborative モードでの planning 発火）の設計が完了している
- [x] TC-13（バリデーションエラー時の done 未発火）の設計が完了している
- [x] TC-14（オブジェクト参照独立性）の設計が完了している
- [x] TASK-SW-STREAM-002 接続を見越した拡充観点が記録されている
- [x] 未追加テストの現状が記録されている（独立ファイルとして実装済み）
- [x] テスト実行確認コマンドが明記されている
