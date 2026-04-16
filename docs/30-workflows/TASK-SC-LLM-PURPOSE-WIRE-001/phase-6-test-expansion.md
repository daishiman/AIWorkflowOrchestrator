# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 6                            |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 機能名     | llm-purpose-wire             |
| 前提Phase  | Phase 5                      |
| 後続Phase  | Phase 7                      |
| 作成日     | 2026-04-16                   |
| ステータス | pending                      |

## 目的

Phase 4 のテストに加えて、エッジケース・fail path・回帰テストを追加し、
`runCreateWorkflow` の LLM 呼び出し処理の堅牢性を高める。
特に LLM が空文字列を返すケースや `skillInput` の組み立て内容など、
Phase 4 で網羅しきれなかったケースを補完する。

## 実行タスク

- Phase 4 テストの充足性確認
- エッジケーステスト追加（LLM 空文字列返却・skillInput の内容確認）
- fail path テスト追加（loadAgent が部分的に失敗するケース）
- 回帰テスト確認（既存の create モードテストへの影響がないこと）
- 全テスト実行確認

## 参照資料

| 資料名                      | パス                                                                         | 用途             |
| --------------------------- | ---------------------------------------------------------------------------- | ---------------- |
| Phase 4 テスト              | `outputs/phase-4/`                                                           | 既存テスト確認   |
| Phase 5 実装                | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 実装確認         |
| SkillCreatorService.test.ts | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | テスト追記先確認 |

## 実行手順

### 1. Phase 4 テスト充足性確認

| TC 番号 | テスト内容                                                      | Phase 4 での充足 |
| ------- | --------------------------------------------------------------- | ---------------- |
| TC-01   | `llmClient.complete` が1回呼ばれること                          | 確認             |
| TC-02   | `systemPrompt` に `extract-purpose` エージェント定義が渡ること  | 確認             |
| TC-03   | LLM 成功時に purpose が LLM 推論結果になること（間接確認）      | 確認             |
| TC-04   | LLM 失敗（result.success=false）時に createSkill が完了すること | 確認             |
| TC-05   | LLM 例外時に createSkill が完了すること                         | 確認             |
| TC-06   | loadAgent 失敗時に createSkill が完了すること                   | 確認             |
| TC-07   | selected config 未選択時に createSkill が完了すること           | 確認             |
| TC-08   | loadAgent が "extract-purpose" を引数として呼ばれること         | 確認             |

### 2. 追加テストケース定義

| TC 番号 | テスト名                                                                                  | 対象                        | 追加理由                                                             |
| ------- | ----------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------- |
| TC-09   | `LLM が空文字列を返した場合でも createSkill が完了すること`                               | LLM 空文字列レスポンス      | `result.data = ""` でも description にフォールバックするエッジケース |
| TC-09b  | `LLM が空白のみを返した場合に purpose が description にフォールバックすること`            | LLM 空白レスポンス          | `normalizePurpose` で空白応答を description に維持するエッジケース   |
| TC-10   | `llmClient.complete の prompt に skillName と description が含まれること`                 | `skillInput` の内容確認     | `${options.name}: ${options.description}` の検証                     |
| TC-11   | `loadAgent が "plan-structure" を引数として呼ばれること`                                  | `planStructureAgent` の確認 | Phase 4 で plan-structure の検証が欠けていた                         |
| TC-12   | `extract-purpose の loadAgent 成功・plan-structure の loadAgent 失敗時に null が返ること` | 部分的 loadAgent 失敗       | fail path の網羅                                                     |
| TC-13   | `llmClient.complete が呼ばれる際に skillInput が空でないこと`                             | skillInput 非空確認         | prompt が空になるケースの防止                                        |

### 3. 追加テストコード

```typescript
// SkillCreatorService.test.ts の "create mode LLM purpose wire" describe ブロックへの追記

// TC-09: LLM が空文字列を返した場合
it("TC-09: LLM が空文字列を返した場合でも createSkill が完了すること", async () => {
  mockLlmClient.complete.mockResolvedValue({
    success: true,
    data: "", // 空文字列
  });

  await expect(
    serviceWithLlm.createSkill({
      mode: "create",
      name: "test-skill",
      description: "テストスキルの説明",
    }),
  ).resolves.toBeDefined();
});

// TC-09b: LLM が空白のみを返した場合
it("TC-09b: LLM が空白のみを返した場合に purpose が description にフォールバックすること", async () => {
  mockLlmClient.complete.mockResolvedValue({
    success: true,
    data: "   ",
  });

  const structurePlan = await (serviceWithLlm as any).runCreateWorkflow({
    mode: "create",
    name: "test-skill",
    description: "テストスキルの説明",
  });

  expect(structurePlan).toMatchObject({
    purpose: "テストスキルの説明",
  });
});

// TC-10: llmClient.complete の prompt に skillName と description が含まれること
it("TC-10: llmClient.complete の prompt に skillName と description が含まれること", async () => {
  await serviceWithLlm.createSkill({
    mode: "create",
    name: "my-skill",
    description: "マイスキルの説明文",
  });

  expect(mockLlmClient.complete).toHaveBeenCalledWith(
    expect.stringContaining("my-skill"),
    expect.any(Object),
  );
  expect(mockLlmClient.complete).toHaveBeenCalledWith(
    expect.stringContaining("マイスキルの説明文"),
    expect.any(Object),
  );
});

// TC-11: loadAgent が "plan-structure" を引数として呼ばれること
it("TC-11: loadAgent が plan-structure を引数として呼ばれること", async () => {
  await serviceWithLlm.createSkill({
    mode: "create",
    name: "test-skill",
    description: "テストスキルの説明",
  });

  expect(mockResourceLoader.loadAgent).toHaveBeenCalledWith("plan-structure");
});

// TC-12: plan-structure の loadAgent 失敗時に null フォールバック
it("TC-12: plan-structure の loadAgent 失敗時に createSkill がエラーなく完了すること", async () => {
  mockResourceLoader.loadAgent.mockImplementation(async (agentName: string) => {
    if (agentName === "extract-purpose") {
      return "# Extract Purpose Agent\nYou are an agent...";
    }
    // plan-structure は失敗
    throw new Error("plan-structure agent not found");
  });

  await expect(
    serviceWithLlm.createSkill({
      mode: "create",
      name: "test-skill",
      description: "テストスキルの説明",
    }),
  ).resolves.toBeDefined();
});

// TC-13: skillInput が空でないこと
it("TC-13: llmClient.complete に渡される skillInput が空でないこと", async () => {
  await serviceWithLlm.createSkill({
    mode: "create",
    name: "test-skill",
    description: "テストスキルの説明",
  });

  const [prompt] = mockLlmClient.complete.mock.calls[0] as [
    string,
    ...unknown[],
  ];
  expect(prompt.length).toBeGreaterThan(0);
});
```

### 4. 回帰テスト確認

```bash
# 既存の create モードテストを含む全体テストを実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  --reporter=verbose

# 型チェック（追加テストで型エラーがないことを確認）
pnpm --filter @repo/desktop typecheck
```

### 5. 全テスト実行確認

```bash
# Phase 4（TC-01〜TC-08）+ Phase 6（TC-09〜TC-13 + TC-09b）全て PASS することを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  --reporter=verbose 2>&1 | grep -E "TC-[0-9]+"

# desktop パッケージ全体テスト実行（他テストへの悪影響がないことを確認）
pnpm --filter @repo/desktop test
```

## 統合テスト連携【必須】

| 判定項目                           | 基準   | 結果    |
| ---------------------------------- | ------ | ------- |
| TC-09〜TC-13 + TC-09b 全 PASS      | PASS   | pending |
| 既存 TC（Phase 4）回帰なし         | 全PASS | pending |
| LLM 空文字列/空白エッジケース PASS | PASS   | pending |
| 型チェック（desktop）              | PASS   | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 矛盾     | 追加テストが Phase 5 実装の動作仕様と矛盾していないか                                                           |
| 漏れ     | LLM 空文字列・skillInput 内容・plan-structure 失敗の各エッジケースが網羅されているか                            |
| 整合性   | TC-10 の `prompt` 内容確認が Phase 5 の `skillInput = ${options.name}: ${options.description}` と一致しているか |
| 依存関係 | Phase 4 テストとの重複がなく、補完関係になっているか                                                            |

## 成果物

| 成果物           | パス                                                                         | 説明                         |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| テストコード拡充 | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | TC-09〜TC-13 + TC-09b を追加 |

## 完了条件

- [ ] Phase 4 テストの充足性確認済み
- [ ] TC-09〜TC-13 + TC-09b が追加済み
- [ ] 全テスト（Phase 4 + Phase 6 追加分）が PASS
- [ ] LLM 空文字列エッジケーステストが PASS
- [ ] fail path（部分的 loadAgent 失敗）テストが PASS
- [ ] skillInput 内容確認テストが PASS
- [ ] 型チェックが PASS
- [ ] 既存テストへの悪影響なし
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 4 テスト充足性確認
2. エッジケーステスト設計（TC-09〜TC-10）
3. fail path テスト設計（TC-11〜TC-12）
4. 回帰ガードテスト設計（TC-13）
5. テストコード追加
6. 全テスト実行確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 7: カバレッジ確認
