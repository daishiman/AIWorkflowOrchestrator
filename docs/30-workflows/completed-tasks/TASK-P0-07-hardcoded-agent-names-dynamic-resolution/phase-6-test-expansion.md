# Phase 6: テスト拡充 - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 6                                                   |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| 前提Phase | Phase 5: 実装（TDD: Green）                         |
| 後続Phase | Phase 7: コードレビュー                             |

## 目的

Phase 5 の実装に対して、fail path、回帰ガード、エッジケースのテストを追加し、テストカバレッジを強化する。動的解決パスの堅牢性を保証し、将来のリグレッションを防止する。

## 実行タスク

- タスク1: manifest のリソース ID が resources[] に存在しない場合のスキップ動作テスト
- タスク2: manifest の resource.path 先頭 "./" 除去テスト
- タスク3: kind → tier マッピングテスト（全 kind パターン）
- タスク4: 複数フォールバック条件の組み合わせテスト
- タスク5: 既存テスト T-P7-02, T-P7-04 のリグレッション確認
- タスク6: カバレッジ確認

## 参照資料

| 資料名                    | パス                                                                  | 説明                                 |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| Phase 2 設計              | `phase-2-design.md`                                                   | 変換アルゴリズム・フォールバック条件 |
| Phase 4 テスト            | `phase-4-test-creation.md`                                            | 既存テストケース一覧                 |
| Phase 5 実装              | `phase-5-implementation.md`                                           | 実装内容・変更ファイル一覧           |
| manifestResourceResolver  | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`  | テスト対象ユーティリティ             |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | テスト対象メインファイル             |
| planPromptConstants       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | `PLAN_RESOURCE_REQUESTS` 静的定義    |
| improvePromptConstants    | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`    | `IMPROVE_RESOURCE_REQUESTS` 静的定義 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                               |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | Main Process サービス設計          |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill Creator SDK インターフェース |

## 実行手順

### ステップ0: P50チェック — Phase 5 の全テスト PASS 確認

```bash
# Phase 5 完了後の全テスト PASS を確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

### タスク1: manifest のリソース ID が resources[] に存在しない場合のスキップ動作テスト

**追加先**: `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`

```typescript
describe("リソース ID 未発見時のスキップ動作", () => {
  it("T-P7-11: resourceIds の一部が resources[] に見つからない場合、見つかったもののみ返す", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan Phase",
          resourceIds: [
            "agent-define-boundary",
            "nonexistent-resource",
            "ref-core-principles",
          ],
          entryHookId: "plan-entry",
          exitHookId: "plan-exit",
        },
      ],
    });

    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      PLAN_RESOURCE_REQUESTS,
    );

    // nonexistent-resource はスキップされ、2件のみ返される
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([
      "agent-define-boundary",
      "ref-core-principles",
    ]);
  });

  it("T-P7-11b: 未発見リソースのスキップ時に warn ログが出力される", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan Phase",
          resourceIds: ["agent-define-boundary", "nonexistent-resource"],
          entryHookId: "plan-entry",
          exitHookId: "plan-exit",
        },
      ],
    });

    // console.warn のスパイを設定
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      PLAN_RESOURCE_REQUESTS,
    );

    // "nonexistent-resource" に対する warn ログが出力されること
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("nonexistent-resource"),
    );

    warnSpy.mockRestore();
  });
});
```

### タスク2: manifest の resource.path 先頭 "./" 除去テスト

**追加先**: `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`

```typescript
describe("パス変換", () => {
  it("T-P7-12: resource.path 先頭の './' が除去される", () => {
    const manifest = createMockManifest({
      resources: [
        { id: "agent-test", kind: "agent", path: "./agents/test-agent.md" },
      ],
      phases: [
        {
          id: "plan",
          title: "Plan",
          resourceIds: ["agent-test"],
          entryHookId: "e",
          exitHookId: "x",
        },
      ],
    });

    const result = buildPhaseResourceRequestsFromManifest(manifest, "plan", []);

    expect(result[0].relativePath).toBe("agents/test-agent.md");
  });

  it("T-P7-12b: resource.path に './' プレフィックスがない場合はそのまま使用される", () => {
    const manifest = createMockManifest({
      resources: [
        { id: "agent-test", kind: "agent", path: "agents/test-agent.md" },
      ],
      phases: [
        {
          id: "plan",
          title: "Plan",
          resourceIds: ["agent-test"],
          entryHookId: "e",
          exitHookId: "x",
        },
      ],
    });

    const result = buildPhaseResourceRequestsFromManifest(manifest, "plan", []);

    expect(result[0].relativePath).toBe("agents/test-agent.md");
  });

  it("T-P7-12c: resource.path に深いネスト（例: './sub/dir/file.md'）がある場合も先頭 './' のみ除去", () => {
    const manifest = createMockManifest({
      resources: [
        { id: "ref-deep", kind: "reference", path: "./sub/dir/deep-ref.md" },
      ],
      phases: [
        {
          id: "plan",
          title: "Plan",
          resourceIds: ["ref-deep"],
          entryHookId: "e",
          exitHookId: "x",
        },
      ],
    });

    const result = buildPhaseResourceRequestsFromManifest(manifest, "plan", []);

    expect(result[0].relativePath).toBe("sub/dir/deep-ref.md");
  });
});
```

### タスク3: kind → tier マッピングテスト（全 kind パターン）

**追加先**: `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`

```typescript
describe("kind → tier マッピング", () => {
  it.each([
    { kind: "agent", expectedTier: "required-core", expectedRequired: true },
    {
      kind: "reference",
      expectedTier: "optional-quality",
      expectedRequired: false,
    },
    {
      kind: "schema",
      expectedTier: "optional-quality",
      expectedRequired: false,
    },
    {
      kind: "asset",
      expectedTier: "optional-quality",
      expectedRequired: false,
    },
  ] as const)(
    "T-P7-13: kind=$kind → tier=$expectedTier, required=$expectedRequired",
    ({ kind, expectedTier, expectedRequired }) => {
      const manifest = createMockManifest({
        resources: [{ id: `test-${kind}`, kind, path: `./test/${kind}.md` }],
        phases: [
          {
            id: "plan",
            title: "Plan",
            resourceIds: [`test-${kind}`],
            entryHookId: "e",
            exitHookId: "x",
          },
        ],
      });

      const result = buildPhaseResourceRequestsFromManifest(
        manifest,
        "plan",
        [],
      );

      expect(result[0].tier).toBe(expectedTier);
      expect(result[0].required).toBe(expectedRequired);
    },
  );
});
```

### タスク4: 複数フォールバック条件の組み合わせテスト

**追加先**: `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`

```typescript
describe("複数フォールバック条件の組み合わせ", () => {
  it("T-P7-14: manifest に複数フェーズがあり、対象フェーズのみ未定義の場合", () => {
    const manifest = createMockManifest({
      phases: [
        // plan は存在しない
        {
          id: "improve",
          title: "Improve Phase",
          resourceIds: ["agent-analyze-feedback"],
          entryHookId: "improve-entry",
          exitHookId: "improve-exit",
        },
      ],
    });

    const planResult = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      PLAN_RESOURCE_REQUESTS,
    );
    const improveResult = buildPhaseResourceRequestsFromManifest(
      manifest,
      "improve",
      IMPROVE_RESOURCE_REQUESTS,
    );

    // plan はフォールバック
    expect(planResult).toEqual([...PLAN_RESOURCE_REQUESTS]);
    // improve も resolveOperationResources() 経由で manifest 由来
    expect(improveResult).not.toEqual([...IMPROVE_RESOURCE_REQUESTS]);
    expect(improveResult[0].id).toBe("agent-analyze-feedback");
  });

  it("T-P7-14b: resourceIds の全 ID が未発見で結果が空 → フォールバック", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan Phase",
          resourceIds: ["ghost-1", "ghost-2", "ghost-3"],
          entryHookId: "plan-entry",
          exitHookId: "plan-exit",
        },
      ],
      resources: [
        // resourceIds に一致するリソースが存在しない
        { id: "unrelated-agent", kind: "agent", path: "./agents/unrelated.md" },
      ],
    });

    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      PLAN_RESOURCE_REQUESTS,
    );

    expect(result).toEqual([...PLAN_RESOURCE_REQUESTS]);
  });

  it("T-P7-14c: manifest の phases が空配列の場合、フォールバックする", () => {
    const manifest = createMockManifest({
      phases: [],
    });

    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      PLAN_RESOURCE_REQUESTS,
    );

    expect(result).toEqual([...PLAN_RESOURCE_REQUESTS]);
  });
});
```

### タスク5: 既存テスト T-P7-02, T-P7-04 のリグレッション確認

```bash
# 既存テストの明示的な PASS 確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts -t "T-P7-02"
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts -t "T-P7-04"

# 全 Facade テストの PASS 確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
```

**確認ポイント**:

- T-P7-02: `PLAN_RESOURCE_REQUESTS` に reference エントリがあっても agent 名導出に混ざらない → PASS
- T-P7-04: `AGENT_NAMES` の残留参照がない → PASS
- 上記テストは Phase 5 の変更（動的パスの切り替え）で影響を受けないこと

### タスク6: カバレッジ確認

```bash
# manifestResourceResolver のカバレッジ確認
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts

# RuntimeSkillCreatorFacade のカバレッジ確認
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
```

**カバレッジ目標**（Phase 1 要件定義に準拠）:

| メトリクス | 目標 | 対象ファイル                  |
| ---------- | ---- | ----------------------------- |
| Line       | 80%+ | `manifestResourceResolver.ts` |
| Branch     | 60%+ | `manifestResourceResolver.ts` |
| Function   | 80%+ | `manifestResourceResolver.ts` |

## テストケース一覧（Phase 6 追加分）

| テストID | テストファイル                           | テスト内容                                                 | 対応AC |
| -------- | ---------------------------------------- | ---------------------------------------------------------- | ------ |
| T-P7-11  | `manifestResourceResolver.test.ts`       | リソース ID 未発見時のスキップ動作                         | AC-1   |
| T-P7-11b | `manifestResourceResolver.test.ts`       | 未発見リソーススキップ時の warn ログ出力                   | AC-5   |
| T-P7-12  | `manifestResourceResolver.test.ts`       | resource.path 先頭 "./" 除去                               | AC-1   |
| T-P7-12b | `manifestResourceResolver.test.ts`       | "./" プレフィックスなしのパスがそのまま使用される          | AC-1   |
| T-P7-12c | `manifestResourceResolver.test.ts`       | 深いネストパスの先頭 "./" のみ除去                         | AC-1   |
| T-P7-13  | `manifestResourceResolver.test.ts`       | kind → tier マッピング（agent/reference/schema/asset）     | AC-1   |
| T-P7-14  | `manifestResourceResolver.test.ts`       | 複数フェーズ存在時の対象フェーズのみ未定義のフォールバック | AC-3   |
| T-P7-14b | `manifestResourceResolver.test.ts`       | 全リソース ID 未発見時のフォールバック                     | AC-3,4 |
| T-P7-14c | `manifestResourceResolver.test.ts`       | manifest phases 空配列時のフォールバック                   | AC-3   |
| (回帰)   | `RuntimeSkillCreatorFacade.plan.test.ts` | T-P7-02 リグレッション確認                                 | AC-7   |
| (回帰)   | `RuntimeSkillCreatorFacade.plan.test.ts` | T-P7-04 リグレッション確認                                 | AC-7   |

## 統合テスト連携

| 判定項目                                | 基準   | 備考                                                 |
| --------------------------------------- | ------ | ---------------------------------------------------- |
| Phase 6 新規テスト全 PASS               | 必須   | T-P7-11〜T-P7-14c が全て PASS                        |
| Phase 4 テスト全 PASS（リグレッション） | 必須   | T-P7-05〜T-P7-10 が引き続き PASS                     |
| 既存テスト T-P7-02, T-P7-04 PASS        | 必須   | Phase 5 変更によるリグレッションがないこと           |
| 全 Facade テスト PASS                   | 必須   | `RuntimeSkillCreatorFacade*.test.ts` の全テスト PASS |
| カバレッジ目標達成                      | should | Line 80%+, Branch 60%+, Function 80%+                |
| typecheck エラーなし                    | 必須   | `pnpm --filter @repo/desktop typecheck`              |
| lint エラーなし                         | 必須   | `pnpm --filter @repo/desktop lint`                   |

## 成果物

| 成果物                              | パス                                                                                        | 説明                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| manifestResourceResolver テスト拡充 | `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`（追記） | T-P7-11〜T-P7-14c のエッジケーステスト |

## 完了条件

- [ ] T-P7-11: リソース ID 未発見時のスキップ動作テストが追加されている
- [ ] T-P7-11b: 未発見リソーススキップ時の warn ログ出力テストが追加されている
- [ ] T-P7-12: resource.path 先頭 "./" 除去テストが追加されている
- [ ] T-P7-12b: "./" プレフィックスなしパスのテストが追加されている
- [ ] T-P7-12c: 深いネストパスの "./" 除去テストが追加されている
- [ ] T-P7-13: kind → tier マッピングテスト（agent/reference/schema/asset の全4パターン）が追加されている
- [ ] T-P7-14: 複数フォールバック条件の組み合わせテストが追加されている
- [ ] T-P7-14b: 全リソース ID 未発見時のフォールバックテストが追加されている
- [ ] T-P7-14c: manifest phases 空配列時のフォールバックテストが追加されている
- [ ] 既存テスト T-P7-02 がリグレッションなく PASS する
- [ ] 既存テスト T-P7-04 がリグレッションなく PASS する
- [ ] Phase 4 テスト T-P7-05〜T-P7-10 が引き続き PASS する
- [ ] `manifestResourceResolver.ts` の Line カバレッジが 80% 以上
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: コードレビュー
