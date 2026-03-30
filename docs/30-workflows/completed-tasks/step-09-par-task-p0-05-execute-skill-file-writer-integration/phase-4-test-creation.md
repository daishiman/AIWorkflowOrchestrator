# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 4                                     |
| タスクID | TASK-P0-05                            |
| 機能名   | execute-skill-file-writer-integration |
| 作成日   | 2026-03-29                            |
| 更新日   | 2026-03-30                            |

## 目的

Phase 2 設計に基づき、LLM 応答パーサー (`parseLlmResponseToContent`) の単体テストと、Facade `execute()` の persist 連携テストを TDD Red Phase として先行作成する。全テストが FAIL する状態で Phase 5 に進む。

## 実行タスク

### Task 4-1: パーサー単体テスト設計・作成

**テストファイル配置先:**

```
apps/desktop/src/main/services/runtime/__tests__/parseLlmResponseToContent.test.ts
```

**テストケース一覧:**

| テストID | テスト内容                                                                   | 対応AC     | カテゴリ                 |
| -------- | ---------------------------------------------------------------------------- | ---------- | ------------------------ |
| P-01     | 単一コードブロック（SKILL.md のみ）→ `skillMd` に格納                        | AC-1       | 正常系                   |
| P-02     | 複数コードブロック（SKILL.md + agents + scripts + references）→ 各配列に分類 | AC-1, AC-2 | 正常系                   |
| P-03     | 見出し行注釈（`### agents/decompose-task.md`）からファイル名を抽出           | AC-1       | 正常系                   |
| P-04     | コードブロックが 0 件 → `null` を返す                                        | AC-5       | 正常系（コンテンツなし） |
| P-05     | `assistant` と `result` の両イベントタイプのテキストを結合して解析           | AC-1       | 正常系                   |
| P-06     | コードブロック内容が不正フォーマット（言語注釈なし等）でも抽出可能           | AC-1       | 境界値                   |

**テストコード構造:**

````typescript
import { describe, expect, it } from "vitest";
import { parseLlmResponseToContent } from "../parseLlmResponseToContent";
import type { SkillCreatorSdkEvent } from "@repo/shared/types";

// ヘルパー: SDKイベント配列を生成
function makeEvents(
  texts: Array<{ text: string; eventType?: "assistant" | "result" }>,
): SkillCreatorSdkEvent[] {
  return texts.map((t, i) => ({
    eventType: t.eventType ?? "assistant",
    sequence: i,
    text: t.text,
  }));
}

describe("parseLlmResponseToContent", () => {
  it("P-01: 単一コードブロック（SKILL.md のみ）", () => {
    const events = makeEvents([
      {
        text: "### SKILL.md\n```markdown\n# My Skill\nDescription here\n```",
      },
    ]);
    const result = parseLlmResponseToContent(events);

    expect(result).not.toBeNull();
    expect(result!.skillMd).toContain("# My Skill");
    expect(result!.agents).toHaveLength(0);
    expect(result!.scripts).toHaveLength(0);
    expect(result!.references).toHaveLength(0);
  });

  it("P-02: 複数コードブロック（agents, scripts, references 付き）", () => {
    const events = makeEvents([
      {
        text: [
          "### SKILL.md",
          "```markdown",
          "# Skill Content",
          "```",
          "",
          "### agents/planner.md",
          "```markdown",
          "# Planner Agent",
          "```",
          "",
          "### scripts/run.sh",
          "```bash",
          "#!/bin/bash",
          "echo hello",
          "```",
          "",
          "### references/guide.md",
          "```markdown",
          "# Reference Guide",
          "```",
        ].join("\n"),
      },
    ]);
    const result = parseLlmResponseToContent(events);

    expect(result).not.toBeNull();
    expect(result!.skillMd).toContain("# Skill Content");
    expect(result!.agents).toHaveLength(1);
    expect(result!.agents[0].name).toBe("planner.md");
    expect(result!.scripts).toHaveLength(1);
    expect(result!.scripts[0].name).toBe("run.sh");
    expect(result!.references).toHaveLength(1);
    expect(result!.references[0].name).toBe("guide.md");
  });

  it("P-03: 見出し行注釈からファイル名を抽出", () => {
    const events = makeEvents([
      {
        text: [
          "### agents/decompose-task.md",
          "```markdown",
          "# Decompose Task Agent",
          "```",
        ].join("\n"),
      },
    ]);
    // SKILL.md がないケースだが、最初のブロックを skillMd として扱うか、
    // 見出し行に agents/ があるので agents に分類されるか、設計に依存
    const result = parseLlmResponseToContent(events);
    expect(result).not.toBeNull();
  });

  it("P-04: コードブロックが 0 件 → null を返す", () => {
    const events = makeEvents([
      { text: "LLM がコードブロックなしのテキストだけ返した場合" },
    ]);
    const result = parseLlmResponseToContent(events);
    expect(result).toBeNull();
  });

  it("P-05: assistant と result イベントのテキストを結合して解析", () => {
    const events = makeEvents([
      { text: "### SKILL.md\n```markdown\n# Part1", eventType: "assistant" },
      { text: "\nPart2\n```", eventType: "result" },
    ]);
    const result = parseLlmResponseToContent(events);
    expect(result).not.toBeNull();
    expect(result!.skillMd).toContain("Part1");
    expect(result!.skillMd).toContain("Part2");
  });

  it("P-06: 言語注釈なしのコードブロックも抽出可能", () => {
    const events = makeEvents([
      {
        text: "### SKILL.md\n```\n# No Language Annotation\n```",
      },
    ]);
    const result = parseLlmResponseToContent(events);
    expect(result).not.toBeNull();
    expect(result!.skillMd).toContain("# No Language Annotation");
  });
});
````

### Task 4-2: Facade execute() persist 連携テスト設計・作成

**テストファイル配置先:**

```
apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts
```

**テストケース一覧:**

| テストID | テスト内容                                                                                                      | 対応AC |
| -------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| F-01     | execute 成功 + コンテンツあり → `persist()` が正しい引数 `(skillName, content, { overwrite: true })` で呼ばれる | AC-3   |
| F-02     | persist 成功 → `persistResult` に `PersistResult` が格納される                                                  | AC-4   |
| F-03     | persist 失敗（throw）→ `persistError` にエラーメッセージが格納、`success` は `true` のまま                      | AC-5   |
| F-04     | `skillFileWriter` 未DI → persist スキップ、`persistResult: null`                                                | AC-3   |
| F-05     | LLM 応答にコードブロックなし → persist 呼ばれない、`persistResult: null`                                        | AC-5   |
| F-06     | execute 失敗（`response.success === false`）→ persist 呼ばれない                                                | AC-3   |

**テストコード構造:**

````typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RuntimeSkillCreatorFacade } from "../RuntimeSkillCreatorFacade";
import type { SkillExecutor } from "../../skill/SkillExecutor";
import type { SkillFileWriter } from "../../skill/SkillFileWriter";
import type { PersistResult } from "../../skill/SkillFileWriter";
import type { ILLMAdapter } from "../../../adapters/llm/types";

// SkillExecutor モック: execute 成功レスポンスを返す
function createMockSkillExecutor(
  sdkEvents: Array<{ eventType: string; text?: string }>,
): SkillExecutor {
  return {
    execute: vi.fn().mockResolvedValue({
      success: true,
      messages: sdkEvents.map((e) => ({
        type: e.eventType,
        content: e.text ? [{ type: "text", text: e.text }] : [],
      })),
    }),
  } as unknown as SkillExecutor;
}

// SkillFileWriter モック
function createMockSkillFileWriter(
  persistResult?: PersistResult,
  persistError?: Error,
): SkillFileWriter {
  const mock = {
    persist: persistError
      ? vi.fn().mockRejectedValue(persistError)
      : vi
          .fn()
          .mockResolvedValue(
            persistResult ?? { skillPath: "/skills/test", files: ["SKILL.md"] },
          ),
  };
  return mock as unknown as SkillFileWriter;
}

describe("RuntimeSkillCreatorFacade execute() persist integration", () => {
  let facade: RuntimeSkillCreatorFacade;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("persist 正常系", () => {
    it("F-01: persist が正しい引数で呼ばれる", async () => {
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor([
        {
          eventType: "assistant",
          text: "### SKILL.md\n```markdown\n# Test Skill\n```",
        },
      ]);
      facade = new RuntimeSkillCreatorFacade({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });
      // LLMAdapter を設定（execute が動作するために必要）
      facade.setLLMAdapter({
        providerId: "anthropic",
        sendChat: vi.fn(),
        streamChat: vi.fn(),
        checkHealth: vi.fn(),
      } as unknown as ILLMAdapter);

      const result = await facade.execute("test-skill", "Create a skill");

      expect(mockWriter.persist).toHaveBeenCalledWith(
        "test-skill",
        expect.objectContaining({ skillMd: expect.any(String) }),
        { overwrite: true },
      );
    });

    it("F-02: persist 成功 → persistResult に結果格納", async () => {
      const expectedResult: PersistResult = {
        skillPath: "/skills/my-skill",
        files: ["SKILL.md", "agents/planner.md"],
      };
      const mockWriter = createMockSkillFileWriter(expectedResult);
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

      expect(result.persistResult).toEqual(expectedResult);
      expect(result.persistError).toBeNull();
    });
  });

  describe("persist 異常系", () => {
    it("F-03: persist 失敗 → persistError にメッセージ、success は true", async () => {
      const mockWriter = createMockSkillFileWriter(
        undefined,
        new Error("WRITE_ERROR: disk full"),
      );
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
      expect(result.persistError).toContain("WRITE_ERROR");
      expect(result.persistResult).toBeUndefined();
    });

    it("F-04: skillFileWriter 未DI → persist スキップ", async () => {
      const mockExecutor = createMockSkillExecutor([
        {
          eventType: "assistant",
          text: "### SKILL.md\n```markdown\n# Skill\n```",
        },
      ]);
      // skillFileWriter を渡さない
      facade = new RuntimeSkillCreatorFacade({
        skillExecutor: mockExecutor,
      });

      const result = await facade.execute("my-skill", "prompt");

      expect(result.persistResult).toBeNull();
      expect(result.persistError).toBeNull();
    });

    it("F-05: コードブロックなし → persist 呼ばれない", async () => {
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = createMockSkillExecutor([
        {
          eventType: "assistant",
          text: "コードブロックを含まないテキスト応答",
        },
      ]);
      facade = new RuntimeSkillCreatorFacade({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute("my-skill", "prompt");

      expect(mockWriter.persist).not.toHaveBeenCalled();
      expect(result.persistResult).toBeNull();
    });

    it("F-06: execute 失敗 → persist 呼ばれない", async () => {
      const mockWriter = createMockSkillFileWriter();
      const mockExecutor = {
        execute: vi.fn().mockResolvedValue({
          success: false,
          error: "SDK execution failed",
          messages: [],
        }),
      } as unknown as SkillExecutor;
      facade = new RuntimeSkillCreatorFacade({
        skillExecutor: mockExecutor,
        skillFileWriter: mockWriter,
      });

      const result = await facade.execute("my-skill", "prompt");

      expect(mockWriter.persist).not.toHaveBeenCalled();
    });
  });
});
````

### Task 4-3: ExecuteResult 型拡張テスト設計

`persistResult` と `persistError` がオプショナルフィールドとして型に存在することは、F-02/F-03/F-04/F-05 のテストで間接的に検証する（結果オブジェクトのフィールド参照がコンパイルを通る = 型拡張済み）。専用の型テストファイルは不要。

### Task 4-4: テスト実行確認（Red Phase）

```bash
# パーサーテスト（モジュール未作成のため FAIL）
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/parseLlmResponseToContent.test.ts

# Facade persist 連携テスト（persist 連携未実装のため FAIL）
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts
```

- パーサーテスト: `parseLlmResponseToContent` モジュールが存在しないため import エラーで FAIL
- Facade テスト: `persistResult` / `persistError` フィールドが型に存在しないためコンパイルエラーで FAIL
- テスト自体のシンタックスエラーがないことを確認（モジュール不在による FAIL のみ）

## 参照資料

| 資料名             | パス                                                                                 | 説明                                   |
| ------------------ | ------------------------------------------------------------------------------------ | -------------------------------------- |
| Phase 2 設計       | `phase-2-design.md`                                                                  | パーサー設計、execute フロー設計       |
| Phase 3 レビュー   | `phase-3-design-review.md`                                                           | 設計レビュー結果（PASS）               |
| Facade 実装        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | execute() の現行実装                   |
| SkillFileWriter    | `apps/desktop/src/main/services/skill/SkillFileWriter.ts`                            | persist() のシグネチャ、エラー型       |
| 型定義             | `packages/shared/src/types/skillCreator.ts`                                          | SkillCreatorSdkEvent, ExecuteResult 型 |
| 既存 Facade テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | 既存テストパターンの参考               |

## 統合テスト連携

| テスト種別     | 対象                        | 方針                                               |
| -------------- | --------------------------- | -------------------------------------------------- |
| パーサー単体   | `parseLlmResponseToContent` | SDKイベント → SkillGeneratedContent の変換を検証   |
| Facade persist | `execute()` 内 persist 連携 | SkillFileWriter モックで引数・結果・エラーを検証   |
| Phase 6 で拡充 | エッジケース                | 本 Phase では主要パスのみ。境界値は Phase 6 で追加 |

## 多角的チェック観点

| 観点         | 適用 | チェック内容                                                                  |
| ------------ | ---- | ----------------------------------------------------------------------------- |
| テスト設計   | 該当 | AC-1〜AC-5 全件に対応するテストケース（P-01〜P-06, F-01〜F-06）が存在すること |
| モック戦略   | 該当 | SkillFileWriter を完全モック化し、ファイルシステムに依存しないこと            |
| TDD Red 原則 | 該当 | 全テストが実装前に FAIL することを確認                                        |

## 成果物

| 成果物                    | パス                                                                                                     | 説明                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| テスト設計書              | `phase-4-test-creation.md`（本ファイル）                                                                 | テストケース設計                   |
| パーサー単体テスト        | `apps/desktop/src/main/services/runtime/__tests__/parseLlmResponseToContent.test.ts`                     | parseLlmResponseToContent のテスト |
| Facade persist 連携テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts` | execute() persist 連携のテスト     |

## 完了条件

- [ ] P-01〜P-06 のパーサー単体テストコードが作成されている
- [ ] F-01〜F-06 の Facade persist 連携テストコードが作成されている
- [ ] 全テストが FAIL（Red Phase）であることを確認済み
- [ ] テスト自体にシンタックスエラーがないことを確認済み（モジュール不在エラーのみ）
- [ ] AC-1〜AC-5 の全受入基準に対応するテストが存在する
- [ ] 既存 Facade テスト（`RuntimeSkillCreatorFacade.test.ts`）のモックパターンと整合している
- [ ] テストファイルがプロジェクトの該当ディレクトリに配置されている（`outputs/` 配下ではない）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
