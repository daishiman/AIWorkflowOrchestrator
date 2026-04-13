# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 4                                                           |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | implementation                                              |
| 前提Phase  | Phase 3（設計レビュー PASS）                                |
| 後続Phase  | Phase 5                                                     |
| 作成日     | 2026-04-12                                                  |
| ステータス | completed                                                   |

## 目的

`buildSkillContext()`・`createSkill` シグネチャ拡張・IPC ハンドラ拡張に対応するテストケースを定義し、TDD Red 段階のテストスイートを作成する。

## テストケース一覧

### TC-01: buildSkillContext — 全フィールド入力時の正常変換

| 項目       | 内容                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト対象 | `buildSkillContext(formData, answers)`                                                                                                                                                            |
| 入力       | formData: `{ skillName: "テストスキル", category: "code-support", purpose: "PRレビュー支援" }`, answers: `{ q1: "Q1回答", q2: "Q2回答", q3: "Q3回答", q4: "Q4回答", q5: "Q5回答", q6: "Q6回答" }` |
| 期待値     | `SkillCreationContext` に全フィールドが正しくマッピングされている                                                                                                                                 |
| 検証方法   | Vitest 単体テスト                                                                                                                                                                                 |

```typescript
it("TC-01: 全フィールド入力時にSkillCreationContextへ正しく変換される", () => {
  const formData = {
    skillName: "テストスキル",
    category: "code-support",
    purpose: "PRレビュー支援",
  };
  const answers = {
    q1: "Q1の回答テキスト",
    q2: "Q2の回答テキスト",
    q3: "GitHub",
    q4: "毎日",
    q5: "レビューコメント一覧",
    q6: "本番コードの変更禁止",
  };

  const result = buildSkillContext(formData, answers);

  expect(result.skillName).toBe("テストスキル");
  expect(result.category).toBe("code-support");
  expect(result.purpose).toBe("PRレビュー支援");
  expect(result.q1Purpose).toBe("Q1の回答テキスト");
  expect(result.q2Target).toBe("Q2の回答テキスト");
  expect(result.q3Tools).toBe("GitHub");
  expect(result.q4Timing).toBe("毎日");
  expect(result.q5Output).toBe("レビューコメント一覧");
  expect(result.q6Constraints).toBe("本番コードの変更禁止");
});
```

### TC-02: buildSkillContext — 空文字フィールドが undefined に正規化される

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| テスト対象 | `buildSkillContext(formData, answers)` の空文字正規化 |
| 入力       | 一部フィールドが空文字 `""` の formData・answers      |
| 期待値     | 空文字フィールドが `undefined` に変換されている       |
| 検証方法   | Vitest 単体テスト                                     |

```typescript
it("TC-02: 空文字フィールドはundefinedに正規化される", () => {
  const formData = { skillName: "", category: "", purpose: "" };
  const answers = { q1: "", q2: "", q3: "", q4: "", q5: "", q6: "" };

  const result = buildSkillContext(formData, answers);

  expect(result.skillName).toBeUndefined();
  expect(result.category).toBeUndefined();
  expect(result.purpose).toBeUndefined();
  expect(result.q1Purpose).toBeUndefined();
  expect(result.q6Constraints).toBeUndefined();
});
```

### TC-03: buildSkillContext — 一部フィールドのみ入力

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| テスト対象 | `buildSkillContext()` の部分入力   |
| 入力       | skillName のみ入力・他は空文字     |
| 期待値     | skillName のみ設定、他は undefined |
| 検証方法   | Vitest 単体テスト                  |

```typescript
it("TC-03: 一部フィールドのみ入力した場合、入力済みのみ設定される", () => {
  const formData = { skillName: "部分入力スキル", category: "", purpose: "" };
  const answers = { q1: "Q1のみ回答", q2: "", q3: "", q4: "", q5: "", q6: "" };

  const result = buildSkillContext(formData, answers);

  expect(result.skillName).toBe("部分入力スキル");
  expect(result.q1Purpose).toBe("Q1のみ回答");
  expect(result.category).toBeUndefined();
  expect(result.q2Target).toBeUndefined();
});
```

### TC-04: handleGenerate — SkillCreationContext を渡して createSkill を呼ぶ

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| テスト対象 | `handleGenerate()` が `buildSkillContext` の結果を `createSkill` に渡す |
| 入力       | モック formData・answers                                                |
| 期待値     | `dispatch(createSkill(context, OPTIONS))` が呼ばれる                    |
| 検証方法   | Vitest + React Testing Library + Redux mock                             |

```typescript
it("TC-04: handleGenerateがSkillCreationContextをcreateSkillに渡す", async () => {
  const mockDispatch = vi.fn();
  const { result } = renderHook(() =>
    useSkillCreateWizard({ dispatch: mockDispatch }),
  );

  await act(async () => {
    await result.current.handleGenerate();
  });

  expect(mockDispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type: expect.stringContaining("createSkill"),
    }),
  );
  // context に Q1〜Q6 が含まれることを確認
  const calledArg = mockDispatch.mock.calls[0][0];
  expect(calledArg.meta?.arg?.context).toHaveProperty("q1Purpose");
});
```

### TC-05: createSkill Thunk — context あり呼び出し（正常系）

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| テスト対象 | `createSkill` Thunk に `context` を渡した場合の IPC 呼び出し           |
| 入力       | `{ context: SkillCreationContext, options: SKILL_GENERATION_OPTIONS }` |
| 期待値     | `window.api.skill.create(context, options)` が呼ばれる                 |
| 検証方法   | Vitest + Redux Toolkit mock                                            |

### TC-06: createSkill Thunk — context なし呼び出し（後方互換）

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| テスト対象 | `createSkill` Thunk に `context` を渡さない（従来呼び出し）  |
| 入力       | `{ context: { purpose: "既存の目的" }, options: undefined }` |
| 期待値     | エラーなく IPC が呼ばれる（後方互換確認）                    |
| 検証方法   | Vitest 単体テスト                                            |

### TC-07: buildSkillGenerationPrompt — 全フィールドがプロンプトに含まれる

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| テスト対象 | `buildSkillGenerationPrompt(context)` の出力内容                    |
| 入力       | 全フィールドが入力された `SkillCreationContext`                     |
| 期待値     | プロンプト文字列に skillName・category・Q1〜Q6 の内容が全て含まれる |
| 検証方法   | Vitest 単体テスト（Main Process ユーティリティ）                    |

```typescript
it("TC-07: buildSkillGenerationPromptが全フィールドをプロンプトに含む", () => {
  const context: SkillCreationContext = {
    skillName: "テストスキル",
    category: "code-support",
    purpose: "PRレビュー支援",
    q1Purpose: "Q1テキスト",
    q2Target: "Q2テキスト",
    q3Tools: "GitHub",
    q4Timing: "毎日",
    q5Output: "レビューコメント",
    q6Constraints: "本番変更禁止",
  };

  const prompt = buildSkillGenerationPrompt(context);

  expect(prompt).toContain("テストスキル");
  expect(prompt).toContain("code-support");
  expect(prompt).toContain("Q1テキスト");
  expect(prompt).toContain("Q2テキスト");
  expect(prompt).toContain("GitHub");
  expect(prompt).toContain("毎日");
  expect(prompt).toContain("レビューコメント");
  expect(prompt).toContain("本番変更禁止");
});
```

### TC-08: buildSkillGenerationPrompt — undefined フィールドはプロンプトに含まれない

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| テスト対象 | `buildSkillGenerationPrompt()` の undefined フィールドの扱い  |
| 入力       | q3Tools・q6Constraints が undefined の `SkillCreationContext` |
| 期待値     | プロンプト文字列に undefined フィールドのラベルが含まれない   |
| 検証方法   | Vitest 単体テスト                                             |

```typescript
it("TC-08: undefinedフィールドはプロンプトに含まれない", () => {
  const context: SkillCreationContext = {
    skillName: "テストスキル",
    q1Purpose: "Q1テキスト",
    // q3Tools, q6Constraints は undefined
  };

  const prompt = buildSkillGenerationPrompt(context);

  expect(prompt).not.toContain("使用ツール・サービス");
  expect(prompt).not.toContain("制約・禁止事項");
});
```

### TC-09: IPC ハンドラ — context を渡した場合の統合確認

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| テスト対象 | `skill:create` IPC ハンドラへの `context` 伝播           |
| 入力       | `SkillCreationContext` を含む IPC 呼び出し               |
| 期待値     | ハンドラ内でプロンプトが組み立てられ、LLM API が呼ばれる |
| 検証方法   | Vitest + IPC mock                                        |

### TC-10: 後方互換テスト — context なし（従来の purpose のみ）

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| テスト対象 | `context` を渡さない従来の呼び出しパターン             |
| 入力       | `{ purpose: "既存目的テキスト" }` のみの context       |
| 期待値     | `purpose` のみでスキル生成が正常動作する（エラーなし） |
| 検証方法   | Vitest 回帰テスト                                      |

```typescript
it("TC-10: [後方互換] contextにpurposeのみを渡しても正常動作する", () => {
  const context: SkillCreationContext = {
    purpose: "既存の目的テキスト",
  };

  const prompt = buildSkillGenerationPrompt(context);

  expect(prompt).toContain("既存の目的テキスト");
  expect(() => buildSkillGenerationPrompt(context)).not.toThrow();
});
```

## テストコマンド

```bash
# buildSkillContext 単体テスト
pnpm vitest run --reporter=verbose packages/shared/src/types/skillCreator.test.ts

# SkillCreateWizard テスト
pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/SkillCreateWizard.test.tsx

# skillHandlers テスト（Main Process）
pnpm vitest run --reporter=verbose apps/desktop/src/main/ipc/__tests__/skillHandlers.create.context.test.ts

# 全テスト（後方互換確認含む）
pnpm vitest run --reporter=verbose

# カバレッジ付き実行
pnpm vitest run --coverage --reporter=verbose

# 依存関係確認（実行前必須）
pnpm install
pnpm --filter @repo/shared build
```

## TDD 実行手順

1. `SkillCreationContext` 型と `buildSkillContext` のテストファイルを作成（Red）
2. TC-01〜TC-03 を Red 状態で実行・失敗を確認
3. Phase 5（実装）で `SkillCreationContext` 型と `buildSkillContext` を実装して Green にする
4. TC-04〜TC-06 は `agentSlice.ts` 変更後に Green にする
5. TC-07〜TC-09 は `skillHandlers.ts` 変更後に Green にする
6. TC-10 は後方互換回帰テストとして全変更後に Green であることを確認する

## 参照資料

| 資料名           | パス                                      | 用途                   |
| ---------------- | ----------------------------------------- | ---------------------- |
| Phase 2 設計書   | `outputs/phase-2/design-spec.md`          | テストケース設計の参照 |
| Phase 3 レビュー | `outputs/phase-3/design-review-report.md` | 設計確定内容の確認     |

## 成果物

| 成果物                 | パス                                    | 説明                  |
| ---------------------- | --------------------------------------- | --------------------- |
| テストケース定義書     | `outputs/phase-4/test-cases.md`         | TC-01〜TC-10 詳細定義 |
| テストコマンドスイート | `outputs/phase-4/test-command-suite.md` | 実行コマンド一覧      |

## 完了条件

- [ ] TC-01〜TC-10 が Red 状態で実行確認されていること
- [ ] テスト命名規則が既存コードと整合していること
- [ ] テストコマンドスイートが記録されていること
- [ ] 後方互換テスト（TC-10）が定義されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
