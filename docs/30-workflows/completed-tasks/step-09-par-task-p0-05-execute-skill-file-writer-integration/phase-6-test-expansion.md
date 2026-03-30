# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 6                                     |
| タスクID | TASK-P0-05                            |
| 機能名   | execute-skill-file-writer-integration |
| 作成日   | 2026-03-29                            |
| 更新日   | 2026-03-30                            |

## 目的

Phase 4 の主要パステストに加え、エッジケース・境界値・エラーパターンのテストを追加する。既存 execute() テストの回帰確認も行い、テストカバレッジ目標を達成する。

## テストカバレッジ目標

| 対象ファイル                                  | ライン | ブランチ | 備考                           |
| --------------------------------------------- | ------ | -------- | ------------------------------ |
| `parseLlmResponseToContent.ts`                | >= 90% | >= 85%   | 新規ファイル、高カバレッジ必須 |
| `RuntimeSkillCreatorFacade.ts` (persist 部分) | >= 85% | >= 80%   | 追加した Step 3.5-3.6 部分     |

## 実行タスク

### Task 6-1: パーサーのエッジケーステスト追加

**テストファイル:** `apps/desktop/src/main/services/runtime/__tests__/parseLlmResponseToContent.test.ts`（Phase 4 で作成したファイルに追記）

**追加テストケース:**

| テストID | テスト内容                                                                                        | カテゴリ       |
| -------- | ------------------------------------------------------------------------------------------------- | -------------- |
| E-01     | 空の SDKイベント配列 `[]` → `null` を返す                                                         | エッジケース   |
| E-02     | `assistant` イベントの `text` が `undefined` → 空文字として扱い、`null` を返す                    | エッジケース   |
| E-03     | `assistant` イベントの `text` が空文字 `""` → `null` を返す                                       | エッジケース   |
| E-04     | コードブロック内に ` ``` ` が含まれるケース（ネストされたコードブロック）→ 外側のブロックのみ抽出 | 境界値         |
| E-05     | 非常に大きな LLM 応答（10,000 行相当）→ パフォーマンス劣化なくパース完了                          | パフォーマンス |
| E-06     | `init` や `error` イベントタイプのみ → テキスト結合されず `null` を返す                           | エッジケース   |
| E-07     | 見出し行なしのコードブロックが複数 → 最初のブロックが `skillMd` に格納                            | 境界値         |
| E-08     | 見出し行が `###` ではなく `##` や `####` の場合 → パーサーの許容範囲確認                          | 境界値         |
| E-09     | ファイル名にスペースや日本語を含む見出し行 → 正しく抽出されるか確認                               | 境界値         |

**テストコード例:**

````typescript
describe("parseLlmResponseToContent - エッジケース", () => {
  it("E-01: 空のSDKイベント配列 → null", () => {
    const result = parseLlmResponseToContent([]);
    expect(result).toBeNull();
  });

  it("E-02: text が undefined のイベント → null", () => {
    const events: SkillCreatorSdkEvent[] = [
      { eventType: "assistant", sequence: 0 },
    ];
    const result = parseLlmResponseToContent(events);
    expect(result).toBeNull();
  });

  it("E-03: text が空文字のイベント → null", () => {
    const events = makeEvents([{ text: "" }]);
    const result = parseLlmResponseToContent(events);
    expect(result).toBeNull();
  });

  it("E-04: ネストされたコードブロック → 外側のみ抽出", () => {
    const events = makeEvents([
      {
        text: [
          "### SKILL.md",
          "```markdown",
          "# Skill",
          "Inner example:",
          "\\`\\`\\`bash",
          "echo hello",
          "\\`\\`\\`",
          "```",
        ].join("\n"),
      },
    ]);
    const result = parseLlmResponseToContent(events);
    expect(result).not.toBeNull();
    expect(result!.skillMd).toContain("# Skill");
  });

  it("E-05: 大規模 LLM 応答（10,000 行）→ 正常にパース完了", () => {
    const largeContent = Array.from(
      { length: 10000 },
      (_, i) => `Line ${i}`,
    ).join("\n");
    const events = makeEvents([
      {
        text: `### SKILL.md\n\`\`\`markdown\n${largeContent}\n\`\`\``,
      },
    ]);

    const start = performance.now();
    const result = parseLlmResponseToContent(events);
    const elapsed = performance.now() - start;

    expect(result).not.toBeNull();
    expect(elapsed).toBeLessThan(1000); // 1秒以内
  });

  it("E-06: init/error イベントのみ → null", () => {
    const events: SkillCreatorSdkEvent[] = [
      { eventType: "init", sequence: 0, text: "session started" },
      {
        eventType: "error",
        sequence: 1,
        errorMessage: "something went wrong",
      },
    ];
    const result = parseLlmResponseToContent(events);
    expect(result).toBeNull();
  });

  it("E-07: 見出し行なしの複数コードブロック → 最初が skillMd", () => {
    const events = makeEvents([
      {
        text: [
          "```markdown",
          "# First Block",
          "```",
          "",
          "```markdown",
          "# Second Block",
          "```",
        ].join("\n"),
      },
    ]);
    const result = parseLlmResponseToContent(events);
    expect(result).not.toBeNull();
    expect(result!.skillMd).toContain("# First Block");
  });
});
````

### Task 6-2: Facade persist エラーパターンテスト追加

**テストファイル:** `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts`（Phase 4 で作成したファイルに追記）

**追加テストケース:**

| テストID | テスト内容                                                                                             | カテゴリ |
| -------- | ------------------------------------------------------------------------------------------------------ | -------- |
| E-10     | persist が `SkillFileWriterError` (code: `VALIDATION_ERROR`) を throw → `persistError` に記録          | エラー系 |
| E-11     | persist が `SkillFileWriterError` (code: `PATH_TRAVERSAL`) を throw → `persistError` に記録            | エラー系 |
| E-12     | persist が `SkillFileWriterError` (code: `SKILL_ALREADY_EXISTS`) を throw → `persistError` に記録      | エラー系 |
| E-13     | persist が `SkillFileWriterError` (code: `WRITE_ERROR`) を throw → `persistError` に記録、ロールバック | エラー系 |
| E-14     | `skillName` が空文字 → persist に空文字が渡される（バリデーションは Writer 側の責務）                  | 境界値   |
| E-15     | parseLlmResponseToContent 自体が throw → `persistError` に記録、`success` は `true`                    | エラー系 |
| E-16     | `skillFileWriter` 未DI時に `console.warn` が出力される（MR-01 検証）                                   | MR-01    |

**テストコード例:**

````typescript
describe("persist エラーパターン", () => {
  it("E-10: VALIDATION_ERROR → persistError に記録", async () => {
    const validationError = Object.assign(
      new Error("skillMd must be a non-empty string"),
      {
        code: "VALIDATION_ERROR",
      },
    );
    const mockWriter = createMockSkillFileWriter(undefined, validationError);
    const mockExecutor = createMockSkillExecutor([
      {
        eventType: "assistant",
        text: "### SKILL.md\n```markdown\n# Skill\n```",
      },
    ]);
    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockExecutor,
      skillFileWriter: mockWriter,
    });

    const result = await facade.execute("my-skill", "prompt");

    expect(result.success).toBe(true);
    expect(result.persistError).toContain("skillMd must be a non-empty string");
  });

  it("E-11: PATH_TRAVERSAL → persistError に記録", async () => {
    const error = Object.assign(new Error("Invalid skill name"), {
      code: "PATH_TRAVERSAL",
    });
    const mockWriter = createMockSkillFileWriter(undefined, error);
    // ... 同様のセットアップ ...

    const result = await facade.execute("../malicious", "prompt");

    expect(result.success).toBe(true);
    expect(result.persistError).toContain("Invalid skill name");
  });

  it("E-12: SKILL_ALREADY_EXISTS → persistError に記録", async () => {
    const error = Object.assign(new Error("Skill already exists"), {
      code: "SKILL_ALREADY_EXISTS",
    });
    const mockWriter = createMockSkillFileWriter(undefined, error);
    // ... 同様のセットアップ ...

    const result = await facade.execute("existing-skill", "prompt");

    expect(result.success).toBe(true);
    expect(result.persistError).toContain("Skill already exists");
  });

  it("E-13: WRITE_ERROR → persistError に記録", async () => {
    const error = Object.assign(new Error("Failed to write files"), {
      code: "WRITE_ERROR",
    });
    const mockWriter = createMockSkillFileWriter(undefined, error);
    // ... 同様のセットアップ ...

    const result = await facade.execute("my-skill", "prompt");

    expect(result.success).toBe(true);
    expect(result.persistError).toContain("Failed to write files");
  });

  it("E-15: parseLlmResponseToContent が throw → persistError に記録", async () => {
    // parseLlmResponseToContent をモックして例外を throw させる
    vi.mock("../parseLlmResponseToContent", () => ({
      parseLlmResponseToContent: vi.fn(() => {
        throw new Error("Unexpected parse error");
      }),
    }));

    const mockWriter = createMockSkillFileWriter();
    const mockExecutor = createMockSkillExecutor([
      { eventType: "assistant", text: "some response" },
    ]);
    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockExecutor,
      skillFileWriter: mockWriter,
    });

    const result = await facade.execute("my-skill", "prompt");

    expect(result.success).toBe(true);
    expect(result.persistError).toContain("Unexpected parse error");
    expect(mockWriter.persist).not.toHaveBeenCalled();
  });

  it("E-16: skillFileWriter 未DI時に console.warn が出力される（MR-01）", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockExecutor = createMockSkillExecutor([
      {
        eventType: "assistant",
        text: "### SKILL.md\n```markdown\n# Skill\n```",
      },
    ]);
    facade = new RuntimeSkillCreatorFacade({
      skillExecutor: mockExecutor,
      // skillFileWriter 未DI
    });

    await facade.execute("my-skill", "prompt");

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("skillFileWriter is not injected"),
    );
    warnSpy.mockRestore();
  });
});
````

### Task 6-3: 既存 execute() テストの回帰確認

**確認対象:**

| テストファイル                                             | 確認内容                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.test.ts`                        | 既存 execute テストが PASS（新フィールド追加の影響なし） |
| `RuntimeSkillCreatorFacade.sdk-normalization.test.ts`      | SDK 正規化テストが PASS                                  |
| `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | ワークフローテストが PASS                                |
| `RuntimeSkillCreatorFacade.plan.test.ts`                   | plan テストが PASS（無関係な変更の波及なし）             |
| `RuntimeSkillCreatorFacade.improve.test.ts`                | improve テストが PASS                                    |
| `RuntimeSkillCreatorFacade.adapter-status.test.ts`         | adapter ステータステストが PASS                          |

**実行コマンド:**

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
```

全ファイルが PASS することを確認。FAIL があれば原因を特定し、Phase 5 の実装を修正する（Phase 6 のスコープでは新規テストの追加のみ行い、実装修正は Phase 5 に差し戻す）。

### Task 6-4: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/parseLlmResponseToContent.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts
```

カバレッジが目標を下回る場合、不足しているブランチを特定し追加テストを作成する。

## 参照資料

| 資料名               | パス                                                                                   | 説明                                  |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 4 テスト       | `phase-4-test-creation.md`                                                             | 主要パステスト P-01〜P-06, F-01〜F-06 |
| Phase 5 実装         | `phase-5-implementation.md`                                                            | 実装仕様                              |
| SkillFileWriter      | `apps/desktop/src/main/services/skill/SkillFileWriter.ts`                              | エラーコード定義                      |
| パーサー実装         | `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts`                  | テスト対象                            |
| Facade 実装          | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                  | テスト対象                            |
| 既存 Facade テスト群 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.*.test.ts` | 回帰確認対象                          |

## 統合テスト連携

| テスト種別     | 対象                 | 方針                                                     |
| -------------- | -------------------- | -------------------------------------------------------- |
| エッジケース   | E-01〜E-09           | パーサーの境界値・異常系を網羅                           |
| エラーパターン | E-10〜E-16           | SkillFileWriterError の各コードと MR-01 を検証           |
| 回帰テスト     | 既存 Facade テスト群 | 全既存テストが PASS であることを確認                     |
| カバレッジ     | 全テスト             | ライン >= 90%（パーサー）、>= 85%（Facade persist 部分） |

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                           |
| ------------------ | ---- | ---------------------------------------------------------------------- |
| エラーハンドリング | 該当 | SkillFileWriterError の全 4 エラーコードに対応するテストが存在すること |
| パフォーマンス     | 該当 | E-05 で大規模応答のパース時間が 1 秒以内であること                     |
| 回帰防止           | 該当 | 既存 Facade テスト 6 ファイルが全て PASS であること                    |
| MR-01              | 該当 | E-16 で console.warn の出力を検証                                      |
| カバレッジ         | 該当 | 目標値（ライン 90%/85%、ブランチ 85%/80%）を達成していること           |

## 成果物

| 成果物                      | パス                                                                                                     | 説明                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------- |
| テスト拡充仕様書            | `phase-6-test-expansion.md`（本ファイル）                                                                | エッジケーステスト設計 |
| パーサーエッジケーステスト  | `apps/desktop/src/main/services/runtime/__tests__/parseLlmResponseToContent.test.ts`                     | E-01〜E-09 追加        |
| Facade エラーパターンテスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts` | E-10〜E-16 追加        |

## 完了条件

- [ ] E-01〜E-09 のパーサーエッジケーステストが追加されている
- [ ] E-10〜E-16 の Facade persist エラーパターンテストが追加されている
- [ ] SkillFileWriterError の全 4 エラーコード（VALIDATION_ERROR, PATH_TRAVERSAL, SKILL_ALREADY_EXISTS, WRITE_ERROR）に対応するテストが存在する
- [ ] E-16 で MR-01（console.warn）の検証が行われている
- [ ] 既存 Facade テスト 6 ファイルが全て PASS（回帰なし）
- [ ] カバレッジ計測を実施し、目標値を達成している（ライン >= 90%/85%、ブランチ >= 85%/80%）
- [ ] テストコードがプロジェクトの該当ディレクトリに配置されている（`outputs/` 配下ではない）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジチェック
