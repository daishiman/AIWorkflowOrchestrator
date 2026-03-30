/**
 * parseLlmResponseToContent Unit Tests
 *
 * TASK-P0-05: LLM 応答パーサーの単体テスト (Phase 4)
 * AC-1: LLM 応答を解析しコードブロックを抽出
 * AC-2: 抽出結果が SkillGeneratedContent 型に変換
 * AC-5: パース失敗時のエラーハンドリング
 */

import { describe, expect, it } from "vitest";
import { parseLlmResponseToContent } from "../parseLlmResponseToContent";
import type { SkillCreatorSdkEvent } from "@repo/shared/types";

/** ヘルパー: SDKイベント配列を生成 */
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
    expect(result!.agents[0].name).toBe("planner");
    expect(result!.agents[0].content).toContain("# Planner Agent");
    expect(result!.scripts).toHaveLength(1);
    expect(result!.scripts[0].name).toBe("run.sh");
    expect(result!.references).toHaveLength(1);
    expect(result!.references[0].name).toBe("guide");
  });

  it("P-03: 見出し行注釈からファイル名を抽出", () => {
    const events = makeEvents([
      {
        text: [
          "### SKILL.md",
          "```markdown",
          "# Main Skill",
          "```",
          "",
          "### agents/decompose-task.md",
          "```markdown",
          "# Decompose Task Agent",
          "```",
        ].join("\n"),
      },
    ]);
    const result = parseLlmResponseToContent(events);

    expect(result).not.toBeNull();
    expect(result!.agents).toHaveLength(1);
    expect(result!.agents[0].name).toBe("decompose-task");
    expect(result!.agents[0].content).toContain("# Decompose Task Agent");
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
      {
        text: "### SKILL.md\n```markdown\n# Part1",
        eventType: "assistant",
      },
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

  // --- Phase 6: エッジケーステスト ---

  describe("エッジケース", () => {
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

    it("E-08: ## / #### 見出しでもファイル名を抽出できる", () => {
      const events = makeEvents([
        {
          text: [
            "## agents/review-agent.md",
            "```markdown",
            "# Review Agent",
            "```",
            "",
            "#### references/運用ガイド.md",
            "```markdown",
            "# Japanese Reference",
            "```",
          ].join("\n"),
        },
      ]);
      const result = parseLlmResponseToContent(events);

      expect(result).not.toBeNull();
      expect(result!.agents[0].name).toBe("review-agent");
      expect(result!.references[0].name).toBe("運用ガイド");
    });

    it("E-09: 見出し付きコードブロック内のエスケープ済み内側フェンスを保持する", () => {
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
      expect(result!.skillMd).toContain("\\`\\`\\`bash");
      expect(result!.skillMd).toContain("echo hello");
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
});
