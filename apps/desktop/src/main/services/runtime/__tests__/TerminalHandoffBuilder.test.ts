/**
 * TerminalHandoffBuilder Unit Tests
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 * test-matrix.md TC-4-07〜TC-4-10 に対応
 *
 * UT-RUNTIME-BUILDER-MIGRATION-001
 * buildForSurface() テストケース 1〜16
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  TerminalHandoffBuilder,
  type BuildForSurfaceRequest,
} from "../TerminalHandoffBuilder";

describe("TerminalHandoffBuilder", () => {
  let builder: TerminalHandoffBuilder;

  beforeEach(() => {
    builder = new TerminalHandoffBuilder();
  });

  describe("TC-4-07: 基本的なbundleの構築", () => {
    it("should build a valid TerminalHandoffBundle", () => {
      const bundle = builder.build("テストプロンプト", "/home/user/project");
      expect(bundle.launcher).toBe("claude");
      expect(bundle.promptBundle).toBe("テストプロンプト");
      expect(bundle.cwd).toBe("/home/user/project");
      expect(bundle.suggestedCommand).toContain("claude -p");
      expect(bundle.manualRetryRule).toBeTruthy();
    });
  });

  describe("TC-4-08: shell injection 対策", () => {
    it("should escape double quotes in prompt", () => {
      const bundle = builder.build('He said "hello"', "/path");
      expect(bundle.suggestedCommand).not.toContain('"hello"');
      expect(bundle.promptBundle).toContain('\\"hello\\"');
    });

    it("should escape backslash in prompt", () => {
      const bundle = builder.build("path\\to\\file", "/path");
      expect(bundle.promptBundle).toContain("\\\\");
    });

    it("should escape dollar sign in prompt", () => {
      const bundle = builder.build("Price: $100", "/path");
      expect(bundle.promptBundle).toContain("\\$100");
    });

    it("should escape backtick in prompt", () => {
      const bundle = builder.build("`dangerous`", "/path");
      expect(bundle.promptBundle).toContain("\\`dangerous\\`");
    });

    it("should produce safe suggestedCommand", () => {
      const bundle = builder.build('say "hi" && rm -rf /', "/path");
      // The suggestedCommand should not allow command injection
      // double quotes inside should be escaped
      expect(bundle.suggestedCommand).toContain('\\"hi\\"');
    });
  });

  describe("TC-4-09: runbook オプション", () => {
    it("should include runbook when provided", () => {
      const bundle = builder.build("prompt", "/path", {
        runbook: "Step 1: do this\nStep 2: do that",
      });
      expect(bundle.runbook).toBe("Step 1: do this\nStep 2: do that");
    });

    it("should have undefined runbook when not provided", () => {
      const bundle = builder.build("prompt", "/path");
      expect(bundle.runbook).toBeUndefined();
    });
  });

  describe("TC-4-10: suggestedCommand の形式", () => {
    it('should format suggestedCommand as claude -p "..."', () => {
      const bundle = builder.build("simple prompt", "/path");
      expect(bundle.suggestedCommand).toBe('claude -p "simple prompt"');
    });
  });

  // =========================================================================
  // buildForSurface() テスト（UT-RUNTIME-BUILDER-MIGRATION-001）
  // =========================================================================

  describe("buildForSurface()", () => {
    const reasons = [
      "subscription mode",
      "API key not configured",
      "terminal_handoff",
      "LLM unreachable",
    ] as const;

    // --- ケース 1〜4: chat-edit surface ---
    describe("chat-edit surface", () => {
      const chatEditRequest: BuildForSurfaceRequest = {
        surfaceType: "chat-edit",
        commandType: "refactor",
        filePaths: ["App.tsx", "utils.ts"],
        message: "テストプロンプト",
        workspacePath: "/workspace/my-project",
      };

      reasons.forEach((reason, i) => {
        it(`ケース ${i + 1}: reason="${reason}" で正しい HandoffGuidance を返す`, () => {
          const result = builder.buildForSurface(chatEditRequest, reason);

          expect(result.terminalCommand).toMatch(/^claude -p "/);
          expect(result.reason).toBe(reason);
          expect(result.terminalCommand).not.toMatch(
            /sk-[a-zA-Z0-9]+|ANTHROPIC_API_KEY/,
          );
          expect(result.contextSummary).not.toBe("");
          expect(result.contextSummary).toContain("command=");
          expect(result.contextSummary).toContain("files=");
        });
      });
    });

    // --- ケース 5〜8: runtime surface (agent/skill) ---
    describe("runtime surface", () => {
      const runtimeRequest: BuildForSurfaceRequest = {
        surfaceType: "runtime",
        runtimeType: "agent",
        skillId: "agent-123",
        prompt: "エージェントプロンプト",
        workingDirectory: "/workspace",
      };

      reasons.forEach((reason, i) => {
        it(`ケース ${i + 5}: reason="${reason}" で正しい HandoffGuidance を返す`, () => {
          const result = builder.buildForSurface(runtimeRequest, reason);

          expect(result.terminalCommand).toMatch(/^claude -p "/);
          expect(result.reason).toBe(reason);
          expect(result.terminalCommand).not.toMatch(
            /sk-[a-zA-Z0-9]+|ANTHROPIC_API_KEY/,
          );
          expect(result.contextSummary).toContain("surface=agent");
        });
      });
    });

    // --- ケース 9〜12: skill-docs surface ---
    describe("skill-docs surface", () => {
      const skillDocsRequest: BuildForSurfaceRequest = {
        surfaceType: "skill-docs",
        queryText: "How to use skill X",
        skillName: "my-skill",
      };

      reasons.forEach((reason, i) => {
        it(`ケース ${i + 9}: reason="${reason}" で正しい HandoffGuidance を返す`, () => {
          const result = builder.buildForSurface(skillDocsRequest, reason);

          expect(result.terminalCommand).toMatch(/^claude -p "/);
          expect(result.reason).toBe(reason);
          expect(result.terminalCommand).not.toMatch(
            /sk-[a-zA-Z0-9]+|ANTHROPIC_API_KEY/,
          );
          expect(result.contextSummary).toContain("skill-docs");
        });
      });
    });

    // --- ケース 13: P62対策 — 未知 surfaceType でエラー throw ---
    describe("P62対策: 未知 surfaceType", () => {
      it("ケース 13: 未定義の surfaceType でエラーをスローする", () => {
        const unknownRequest = {
          surfaceType: "unknown-surface" as never,
        } as BuildForSurfaceRequest;

        expect(() =>
          builder.buildForSurface(unknownRequest, "terminal_handoff"),
        ).toThrow();
        // never 型の exhaustive check により、
        // 新しい surfaceType 追加時にコンパイルエラーとして検出される
      });
    });

    // --- ケース 14: P55対策 — shell 特殊文字のサニタイズ ---
    describe("P55対策: shell 特殊文字サニタイズ", () => {
      it("ケース 14: shell 特殊文字を含む prompt がサニタイズされる", () => {
        const request: BuildForSurfaceRequest = {
          surfaceType: "chat-edit",
          commandType: "refactor",
          filePaths: ["/path/to/file.ts"],
          message: 'rm -rf / && echo "hacked" $(dangerous) `cmd`',
        };

        const result = builder.buildForSurface(request, "terminal_handoff");

        expect(result.terminalCommand).toBeTruthy();
        // $( はエスケープされ \$( となるため、未エスケープの $( がないことを確認
        expect(result.terminalCommand).not.toMatch(/(?<!\\)\$\(/);
        // バッククォートはエスケープされ \` となるため、未エスケープの ` がないことを確認
        expect(result.terminalCommand).not.toMatch(/(?<!\\)`/);
        expect(result.terminalCommand).not.toBe("");
      });
    });

    // --- ケース 15: 空値処理 — prompt 未指定時のデフォルト値 ---
    describe("空値処理", () => {
      it("ケース 15: message 省略時もエラーなく HandoffGuidance を返す", () => {
        const request: BuildForSurfaceRequest = {
          surfaceType: "chat-edit",
          commandType: "edit",
          filePaths: ["/path/to/file.ts"],
        };

        expect(() =>
          builder.buildForSurface(request, "terminal_handoff"),
        ).not.toThrow();

        const result = builder.buildForSurface(request, "terminal_handoff");
        expect(result.terminalCommand).not.toBe("");
        expect(result.terminalCommand).toMatch(/^claude -p "/);
      });
    });

    // --- ケース 16: 返却型 — HandoffGuidance 型の検証 ---
    describe("返却型検証", () => {
      it("ケース 16: 戻り値が HandoffGuidance の全プロパティを持つ", () => {
        const request: BuildForSurfaceRequest = {
          surfaceType: "chat-edit",
          commandType: "refactor",
          filePaths: ["/path/to/file.ts"],
          message: "検証用プロンプト",
        };

        const result = builder.buildForSurface(request, "terminal_handoff");

        expect(typeof result.terminalCommand).toBe("string");
        expect(typeof result.contextSummary).toBe("string");
        expect(typeof result.reason).toBe("string");

        const keys = Object.keys(result);
        expect(keys).toContain("terminalCommand");
        expect(keys).toContain("contextSummary");
        expect(keys).toContain("reason");
      });
    });

    // =========================================================================
    // Phase 6: 境界値テスト（A-1〜A-4）
    // =========================================================================

    describe("境界値テスト", () => {
      it("A-1: 空文字列 message でもエラーなく生成される", () => {
        const request: BuildForSurfaceRequest = {
          surfaceType: "chat-edit",
          commandType: "edit",
          filePaths: ["/path/to/file.ts"],
          message: "",
        };
        expect(() =>
          builder.buildForSurface(request, "terminal_handoff"),
        ).not.toThrow();
        const result = builder.buildForSurface(request, "terminal_handoff");
        expect(result.terminalCommand).not.toBe("");
      });

      it("A-2: 超長文 prompt（1000文字）でも生成される", () => {
        const request: BuildForSurfaceRequest = {
          surfaceType: "runtime",
          runtimeType: "agent",
          prompt: "a".repeat(1000),
        };
        expect(() =>
          builder.buildForSurface(request, "terminal_handoff"),
        ).not.toThrow();
        const result = builder.buildForSurface(request, "terminal_handoff");
        expect(result.terminalCommand).toMatch(/^claude -p "/);
        expect(result.terminalCommand.length).toBeGreaterThan(0);
      });

      it("A-3: 特殊文字のみの prompt でも生成される", () => {
        const request: BuildForSurfaceRequest = {
          surfaceType: "skill-docs",
          queryText: "`$()\\<>&|;\"'",
        };
        expect(() =>
          builder.buildForSurface(request, "terminal_handoff"),
        ).not.toThrow();
        const result = builder.buildForSurface(request, "terminal_handoff");
        expect(typeof result.terminalCommand).toBe("string");
      });

      it("A-4: 日本語マルチバイト文字の prompt で正しく生成される", () => {
        const request: BuildForSurfaceRequest = {
          surfaceType: "chat-edit",
          commandType: "refactor",
          filePaths: ["/path/to/file.ts"],
          message: "日本語のプロンプトです。テスト用。",
        };
        expect(() =>
          builder.buildForSurface(request, "terminal_handoff"),
        ).not.toThrow();
        const result = builder.buildForSurface(request, "terminal_handoff");
        expect(result.terminalCommand).toMatch(/^claude -p "/);
      });
    });

    // =========================================================================
    // Phase 6: runtime (skill) サブタイプテスト
    // =========================================================================

    describe("runtime skill サブタイプ", () => {
      it("runtimeType=skill で skillName が contextSummary に反映される", () => {
        const request: BuildForSurfaceRequest = {
          surfaceType: "runtime",
          runtimeType: "skill",
          skillName: "test-skill",
          prompt: "スキルテスト",
        };
        const result = builder.buildForSurface(request, "terminal_handoff");
        expect(result.contextSummary).toContain("surface=skill");
        expect(result.contextSummary).toContain("skill=test-skill");
      });
    });
  });

  // =========================================================================
  // Phase 6: 旧メソッド回帰テスト（B-1）
  // =========================================================================

  describe("旧メソッド回帰テスト（@deprecated）", () => {
    it("B-1: buildForAgentExecution は @deprecated でも後方互換を維持する", () => {
      const result = builder.buildForAgentExecution(
        {
          skillId: "agent-abc",
          prompt: "テスト",
          workingDirectory: "/workspace",
        },
        "terminal_handoff",
      );
      expect(result.terminalCommand).toContain("claude -p");
      expect(result.contextSummary).toContain("surface=agent");
      expect(result.contextSummary).toContain("skill=agent-abc");
      expect(result.reason).toBe("terminal_handoff");
    });

    it("B-1b: buildForSkillExecution は @deprecated でも後方互換を維持する", () => {
      const result = builder.buildForSkillExecution(
        {
          skillName: "my-skill",
          prompt: "スキルテスト",
          workingDirectory: "/workspace",
        },
        "LLM unreachable",
      );
      expect(result.terminalCommand).toContain("claude -p");
      expect(result.contextSummary).toContain("surface=skill");
      expect(result.contextSummary).toContain("skill=my-skill");
      expect(result.reason).toBe("LLM unreachable");
    });

    it("B-1c: build() は @deprecated でも TerminalHandoffBundle を返す", () => {
      const bundle = builder.build("テスト", "/path");
      expect(bundle.launcher).toBe("claude");
      expect(bundle.suggestedCommand).toContain("claude -p");
      expect(bundle.cwd).toBe("/path");
    });

    it("B-1d: buildForSkillExecution prompt 未指定 + skillName ありでデフォルト生成", () => {
      const result = builder.buildForSkillExecution(
        { skillName: "test-skill" },
        "terminal_handoff",
      );
      expect(result.terminalCommand).toContain("test-skill");
      expect(result.contextSummary).toContain("skill=test-skill");
    });

    it("B-1e: buildForSkillExecution prompt/skillName 未指定でデフォルト生成", () => {
      const result = builder.buildForSkillExecution({}, "terminal_handoff");
      expect(result.terminalCommand).toContain("claude -p");
      expect(result.contextSummary).toContain("skill=unknown");
    });

    it("B-1f: buildForSkillExecution skillId のみ指定", () => {
      const result = builder.buildForSkillExecution(
        { skillId: "skill-id-123" },
        "terminal_handoff",
      );
      expect(result.contextSummary).toContain("skill=skill-id-123");
    });

    it("B-1g: buildForAgentExecution prompt 未指定でデフォルト生成", () => {
      const result = builder.buildForAgentExecution({}, "terminal_handoff");
      expect(result.terminalCommand).toContain("claude -p");
      expect(result.contextSummary).toContain("skill=unknown");
    });
  });
});
