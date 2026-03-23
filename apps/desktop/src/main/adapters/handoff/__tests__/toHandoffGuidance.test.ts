import { describe, it, expect } from "vitest";
import { toHandoffGuidance } from "../toHandoffGuidance";
import type {
  ChatEditHandoffSource,
  AgentHandoffSource,
  SkillHandoffSource,
  BundleHandoffSource,
  HandoffGuidance,
} from "../types";

describe("toHandoffGuidance", () => {
  // ============================================================
  // Phase 4: T-01 ~ T-08 基本テスト
  // ============================================================

  it("T-01: ChatEditHandoffSource から HandoffGuidance に正常変換できる", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "Fix the login bug in auth module",
        workspacePath: "/Users/dev/project",
        contextFiles: ["src/auth/login.ts", "src/auth/session.ts"],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result).toHaveProperty("terminalCommand");
    expect(result).toHaveProperty("contextSummary");
    expect(result).toHaveProperty("reason");
    expect(typeof result.terminalCommand).toBe("string");
    expect(typeof result.contextSummary).toBe("string");
    expect(typeof result.reason).toBe("string");
    expect(result.terminalCommand.length).toBeGreaterThan(0);
  });

  it("T-02: AgentHandoffSource から HandoffGuidance に正常変換できる", () => {
    const source: AgentHandoffSource = {
      kind: "agent",
      skillId: "test-skill-001",
      prompt: "do something with the agent",
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result.contextSummary).toContain("surface=agent");
    expect(result.terminalCommand.length).toBeGreaterThan(0);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it("T-03: SkillHandoffSource から HandoffGuidance に正常変換できる", () => {
    const source: SkillHandoffSource = {
      kind: "skill",
      skillName: "test-skill",
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result.contextSummary).toContain("surface=skill");
    expect(result.terminalCommand.length).toBeGreaterThan(0);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it("T-04: BundleHandoffSource から HandoffGuidance に正常変換できる", () => {
    const source: BundleHandoffSource = {
      kind: "bundle",
      launcher: "claude",
      promptBundle: "Run integration tests and fix failures",
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result.terminalCommand).toContain("claude");
    expect(result.contextSummary.length).toBeGreaterThan(0);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it("T-05: shell injection 文字列がエスケープされる", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: 'Delete everything with $HOME and `rm -rf /` and "quotes"',
        workspacePath: "/Users/dev/project",
        contextFiles: [],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    // $ 変数展開がエスケープされている（\$ の形式）
    expect(result.terminalCommand).toContain("\\$HOME");
    expect(result.terminalCommand).not.toMatch(/(?<!\\)\$HOME/);
    // バッククォートがエスケープされている（\` の形式）
    expect(result.terminalCommand).toContain("\\`rm -rf /\\`");
    expect(result.terminalCommand).toBeDefined();
  });

  it("T-06: 機密情報（APIキーパターン）が terminalCommand に含まれない", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "Use API key sk-abc123def456ghi789 to authenticate",
        workspacePath: "/Users/dev/project",
        contextFiles: [],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result.terminalCommand).not.toMatch(/sk-[a-zA-Z0-9]{10,}/);
  });

  it("T-07: 空の prompt でもエラーなく HandoffGuidance が生成される", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "",
        workspacePath: "/Users/dev/project",
        contextFiles: [],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result).toHaveProperty("terminalCommand");
    expect(result).toHaveProperty("contextSummary");
    expect(result).toHaveProperty("reason");
    expect(typeof result.terminalCommand).toBe("string");
  });

  it("T-08: workingDirectory が指定されている場合、コマンドに反映される", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "Fix the bug",
        workspacePath: "/Users/dev/my-project",
        contextFiles: ["src/index.ts"],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result.terminalCommand).toContain("/Users/dev/my-project");
  });

  // ============================================================
  // Phase 6: T-09 ~ T-16 拡充テスト
  // ============================================================

  it("T-09: 10000文字超の prompt でもエラーなく HandoffGuidance が生成される", () => {
    const longPrompt = "a".repeat(10001);
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: longPrompt,
        workspacePath: "/Users/dev/project",
        contextFiles: [],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result).toHaveProperty("terminalCommand");
    expect(result).toHaveProperty("contextSummary");
    expect(result).toHaveProperty("reason");
    expect(typeof result.terminalCommand).toBe("string");
  });

  it("T-10: 日本語を含む prompt で正常変換される", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "ログイン画面のバグを修正してください。認証モジュールを確認。",
        workspacePath: "/Users/dev/project",
        contextFiles: ["src/auth/login.ts"],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result).toHaveProperty("terminalCommand");
    expect(result).toHaveProperty("contextSummary");
    expect(result).toHaveProperty("reason");
    expect(typeof result.terminalCommand).toBe("string");
    expect(result.terminalCommand.length).toBeGreaterThan(0);
  });

  it("T-11: workingDirectory が undefined の場合にデフォルト動作する", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "Fix the bug",
        contextFiles: [],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result).toHaveProperty("terminalCommand");
    expect(result).toHaveProperty("contextSummary");
    expect(result).toHaveProperty("reason");
    expect(typeof result.terminalCommand).toBe("string");
  });

  it("T-12: 全フィールドが空文字列でもエラーなく動作する", () => {
    const source: AgentHandoffSource = {
      kind: "agent",
      skillId: "",
      prompt: "",
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result).toHaveProperty("terminalCommand");
    expect(result).toHaveProperty("contextSummary");
    expect(result).toHaveProperty("reason");
    expect(typeof result.terminalCommand).toBe("string");
  });

  it("T-13: ChatEdit + workspacePath ありの場合、--add-dir フラグが含まれる", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "Refactor the auth module",
        workspacePath: "/Users/dev/my-workspace",
        contextFiles: ["src/auth/index.ts", "src/auth/session.ts"],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result.terminalCommand).toContain("--add-dir");
    expect(result.terminalCommand).toContain("/Users/dev/my-workspace");
  });

  it("T-14: HandoffGuidance 型の3フィールドが正しい型であること", () => {
    const guidance: HandoffGuidance = {
      terminalCommand: "claude --print 'test'",
      contextSummary: "surface=chat-edit",
      reason: "Terminal handoff required",
    };

    expect(typeof guidance.terminalCommand).toBe("string");
    expect(typeof guidance.contextSummary).toBe("string");
    expect(typeof guidance.reason).toBe("string");
  });

  it("T-15: 複合 shell injection パターンがサニタイズされる", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: '$(whoami) ${USER} && rm -rf / ; echo "hacked"',
        workspacePath: "/Users/dev/project",
        contextFiles: [],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    // コマンド置換 $() がエスケープされている（\$ の形式）
    expect(result.terminalCommand).toContain("\\$(whoami)");
    expect(result.terminalCommand).not.toMatch(/(?<!\\)\$\(whoami\)/);
    // 変数展開 ${} がエスケープされている
    expect(result.terminalCommand).toContain("\\${USER}");
    expect(result.terminalCommand).not.toMatch(/(?<!\\)\$\{USER\}/);
  });

  it("T-16: 改行・タブ文字を含む prompt でも正常動作する", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "Fix the bug\n\twith proper\n\tindentation",
        workspacePath: "/Users/dev/project",
        contextFiles: [],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    expect(result).toHaveProperty("terminalCommand");
    expect(typeof result.terminalCommand).toBe("string");
    expect(result.terminalCommand).not.toContain("\n");
    expect(result.terminalCommand).not.toContain("\t");
  });

  // ============================================================
  // Phase 12 追加: T-17 ~ T-18 セキュリティ拡充テスト
  // ============================================================

  it("T-17: workspacePath にダブルクォートが含まれる場合にエスケープされる", () => {
    const source: ChatEditHandoffSource = {
      kind: "chat-edit",
      request: {
        prompt: "fix bug",
        workspacePath: '/Users/Alice "Bob"/project',
        contextFiles: [],
      },
    };

    const result = toHandoffGuidance(source, "test reason");

    // --add-dir 内のダブルクォートがエスケープされていること
    expect(result.terminalCommand).toContain('\\"Bob\\"');
    expect(result.terminalCommand).toContain("--add-dir");
  });

  it("T-18: launcher に不正な文字列が含まれる場合にエラーをスローする", () => {
    const source: BundleHandoffSource = {
      kind: "bundle",
      launcher: "claude; rm -rf /",
      promptBundle: "test",
    };

    expect(() => toHandoffGuidance(source, "test reason")).toThrow(
      "Invalid launcher name",
    );
  });
});
