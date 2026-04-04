/**
 * SkillCreatorOutputHandler テスト
 * TASK-SDK-SC-04: Skill Output Integration
 *
 * TDD Phase 4 (Red) → Phase 5 (Green)
 * T-01: SDK セッション出力からスキル内容を正しく抽出
 * T-02: スキルファイルが正しいパスに保存される
 * T-03: SkillRegistry に登録される
 * T-04: 既存スキルが存在する場合に上書き確認フラグが立つ
 * T-05: skill-creator:output-ready IPC が発行される
 *
 * Phase 6 追加:
 * T-07: 出力パース失敗時の安全な処理
 * T-08: ディレクトリ作成エラー時の処理
 * T-09: レジストリ登録重複時の処理
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WebContents } from "electron";
import { SKILL_CREATOR_OUTPUT_READY } from "@repo/shared/ipc/channels";
import type {
  ParsedSkillOutput,
  SkillOutputReadyPayload,
} from "@repo/shared/types/skillCreator";
import { SkillCreatorOutputHandler } from "../SkillCreatorOutputHandler";
import type { SkillRegistry } from "../SkillRegistry";

// ── fs モック ──────────────────────────────────────────────
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn(),
  readFile: vi.fn(),
}));

import * as fs from "node:fs/promises";

// ── 共通モック ──────────────────────────────────────────────
const mockSkillRegistry = {
  registerFromPath: vi.fn().mockResolvedValue(undefined),
} as unknown as SkillRegistry;

const mockWebContents = {
  send: vi.fn(),
} as unknown as WebContents;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// T-01: SDK セッション出力からスキル内容を正しく抽出
// ============================================================

describe("extractSkillFromOutput", () => {
  it("T-01: <!-- SKILL_START: {skillName} --> と <!-- SKILL_END: {skillName} --> マーカーで囲まれた内容を抽出する", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const sessionOutput = `
セッション実行中...
<!-- SKILL_START: my-test-skill -->
name: my-test-skill
description: テスト用スキル
<!-- SKILL_END: my-test-skill -->
セッション終了
    `;
    const result = handler.extractSkillFromOutput(sessionOutput);

    expect(result).not.toBeNull();
    expect(result?.name).toBe("my-test-skill");
    expect(result?.content).toContain("name: my-test-skill");
    expect(result?.dirName).toBe("my-test-skill");
  });

  it("T-01b: マーカーが存在しない場合でも name があればフォールバック抽出する", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const sessionOutput = `
name: fallback-skill
description: フォールバック
`;
    const result = handler.extractSkillFromOutput(sessionOutput);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("fallback-skill");
    expect(result?.dirName).toBe("fallback-skill");
  });

  it("T-01c: マーカー内に name がない場合はマーカー属性名を採用する", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const sessionOutput = `
<!-- SKILL_START: marker-skill -->
description: name なし
<!-- SKILL_END: marker-skill -->
    `;
    const result = handler.extractSkillFromOutput(sessionOutput);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("marker-skill");
    expect(result?.dirName).toBe("marker-skill");
  });
});

// ============================================================
// T-02: スキルファイルが正しいパスに保存される
// ============================================================

describe("saveSkill", () => {
  it("T-02: {projectRoot}/.claude/skills/{dirName}/SKILL.md に保存する", async () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const skill: ParsedSkillOutput = {
      name: "my-test-skill",
      content: "name: my-test-skill\ndescription: テスト",
      dirName: "my-test-skill",
    };

    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);

    const savedPath = await handler.saveSkill(skill);

    expect(savedPath).toBe("/project/.claude/skills/my-test-skill/SKILL.md");
    expect(fs.writeFile).toHaveBeenCalledWith(
      "/project/.claude/skills/my-test-skill/SKILL.md",
      skill.content,
      "utf-8",
    );
  });
});

// ============================================================
// T-03: SkillRegistry に登録される
// ============================================================

describe("registerToRegistry", () => {
  it("T-03: SkillRegistry.registerFromPath() が正しいパスで呼び出される", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWebContents,
    );

    await handler.registerToRegistry(
      "/project/.claude/skills/my-test-skill/SKILL.md",
    );

    expect(mockRegistry.registerFromPath).toHaveBeenCalledWith(
      "/project/.claude/skills/my-test-skill/SKILL.md",
    );
  });
});

// ============================================================
// T-04: 既存スキルが存在する場合に上書き確認フラグが立つ
// ============================================================

describe("handleSessionComplete - overwrite confirmation", () => {
  it("T-04: 既存スキルが存在する場合 requiresOverwriteConfirm: true が設定される", async () => {
    vi.spyOn(fs, "access").mockResolvedValue(undefined); // ファイル存在

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );

    const sessionOutput = `
<!-- SKILL_START: existing-skill -->
name: existing-skill
description: 既存スキル
<!-- SKILL_END: existing-skill -->
    `;

    const notifySpy = vi.spyOn(handler, "notifyOutputReady");
    await handler.handleSessionComplete(sessionOutput);

    expect(notifySpy).toHaveBeenCalledWith(
      expect.objectContaining({ requiresOverwriteConfirm: true }),
    );
  });

  it("T-04b: ユーザー承認後に handleOverwriteApproved() が保存・登録を続行する", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const mockWC = { send: vi.fn() };
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as WebContents,
    );

    await handler.handleOverwriteApproved({
      skillName: "existing-skill",
      savedPath: "/project/.claude/skills/existing-skill/SKILL.md",
      content: "name: existing-skill\ndescription: 既存スキル",
      requiresOverwriteConfirm: true,
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      "/project/.claude/skills/existing-skill/SKILL.md",
      "name: existing-skill\ndescription: 既存スキル",
      "utf-8",
    );
    expect(mockRegistry.registerFromPath).toHaveBeenCalledWith(
      "/project/.claude/skills/existing-skill/SKILL.md",
    );
    expect(mockWC.send).toHaveBeenCalledWith(
      SKILL_CREATOR_OUTPUT_READY,
      expect.objectContaining({ requiresOverwriteConfirm: false }),
    );
  });

  it("T-04c: handleSessionComplete() の保存失敗時は通知しない", async () => {
    vi.spyOn(fs, "access").mockRejectedValue(new Error("not found"));
    vi.spyOn(fs, "mkdir").mockRejectedValue(new Error("disk full"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockWC = { send: vi.fn() };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWC as unknown as WebContents,
    );

    await handler.handleSessionComplete(`
name: failing-skill
description: 保存失敗
`);

    expect(errorSpy).toHaveBeenCalledWith(
      "[SkillCreatorOutputHandler] スキル保存失敗:",
      expect.any(Error),
    );
    expect(mockWC.send).not.toHaveBeenCalled();
  });

  it("T-04d: handleOverwriteApproved() の保存失敗時は通知しない", async () => {
    vi.spyOn(fs, "mkdir").mockRejectedValue(new Error("disk full"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const mockWC = { send: vi.fn() };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as WebContents,
    );

    await handler.handleOverwriteApproved({
      skillName: "existing-skill",
      savedPath: "/project/.claude/skills/existing-skill/SKILL.md",
      content: "name: existing-skill\ndescription: 既存スキル",
      requiresOverwriteConfirm: true,
    });

    expect(errorSpy).toHaveBeenCalledWith(
      "[SkillCreatorOutputHandler] スキル保存失敗:",
      expect.any(Error),
    );
    expect(mockRegistry.registerFromPath).not.toHaveBeenCalled();
    expect(mockWC.send).not.toHaveBeenCalled();
  });
});

// ============================================================
// T-05: skill-creator:output-ready IPC が発行される
// ============================================================

describe("notifyOutputReady", () => {
  it("T-05: webContents.send() で SKILL_CREATOR_OUTPUT_READY チャネルに送信する", () => {
    const mockWC = { send: vi.fn() };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWC as unknown as WebContents,
    );
    const payload: SkillOutputReadyPayload = {
      skillName: "my-skill",
      savedPath: "/project/.claude/skills/my-skill/SKILL.md",
      content: "name: my-skill",
      requiresOverwriteConfirm: false,
    };

    handler.notifyOutputReady(payload);

    expect(mockWC.send).toHaveBeenCalledWith(
      SKILL_CREATOR_OUTPUT_READY,
      payload,
    );
  });
});

// ============================================================
// T-07: 出力パース失敗時の安全な処理（Phase 6）
// ============================================================

describe("extractSkillFromOutput - エッジケース", () => {
  it("T-07a: SKILL_START マーカーはあるが SKILL_END マーカーがない場合は null を返す", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const output =
      "前文 <!-- SKILL_START: broken-skill --> name: broken-skill 後文";
    expect(handler.extractSkillFromOutput(output)).toBeNull();
  });

  it("T-07b: マーカー間に name フィールドがない場合はマーカー属性名を採用する", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const output =
      "<!-- SKILL_START: broken-skill --> description: nameなし <!-- SKILL_END: broken-skill -->";
    const result = handler.extractSkillFromOutput(output);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("broken-skill");
  });

  it("T-07c: スキル名にスペースが含まれる場合は dirName をハイフン区切りにスラッグ化する", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const output =
      "<!-- SKILL_START: My Test Skill -->\nname: My Test Skill\n<!-- SKILL_END: My Test Skill -->";
    const result = handler.extractSkillFromOutput(output);
    expect(result?.dirName).toBe("my-test-skill");
  });

  it("T-07d: handleSessionComplete でパース失敗時は何も実行しない", async () => {
    const mockRegistry = { registerFromPath: vi.fn() };
    const mockWC = { send: vi.fn() };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as WebContents,
    );

    await handler.handleSessionComplete("マーカーなし出力");

    expect(mockRegistry.registerFromPath).not.toHaveBeenCalled();
    expect(mockWC.send).not.toHaveBeenCalled();
  });
});

// ============================================================
// T-08: ディレクトリ作成エラー時の処理（Phase 6）
// ============================================================

describe("saveSkill - エラーハンドリング", () => {
  it("T-08a: mkdir が失敗した場合は Error をスローする", async () => {
    vi.spyOn(fs, "mkdir").mockRejectedValue(
      new Error("EACCES: permission denied"),
    );

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const skill: ParsedSkillOutput = {
      name: "fail-skill",
      content: "name: fail-skill",
      dirName: "fail-skill",
    };

    await expect(handler.saveSkill(skill)).rejects.toThrow(
      "EACCES: permission denied",
    );
  });

  it("T-08b: writeFile が失敗した場合は Error をスローする", async () => {
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockRejectedValue(
      new Error("ENOSPC: no space left on device"),
    );

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const skill: ParsedSkillOutput = {
      name: "fail-skill",
      content: "name: fail-skill",
      dirName: "fail-skill",
    };

    await expect(handler.saveSkill(skill)).rejects.toThrow(
      "ENOSPC: no space left on device",
    );
  });
});

// ============================================================
// T-09: レジストリ登録重複時の処理（Phase 6）
// ============================================================

describe("registerToRegistry - 重複登録", () => {
  it("T-09a: SkillRegistry.registerFromPath() が失敗してもエラーをスローせず処理を継続する", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockRejectedValue(new Error("Registry error")),
    };
    const mockWC = { send: vi.fn() };

    vi.spyOn(fs, "access").mockRejectedValue(new Error("ENOENT")); // ファイル未存在
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as WebContents,
    );

    const sessionOutput =
      "<!-- SKILL_START: my-skill -->\nname: my-skill\n<!-- SKILL_END: my-skill -->";

    await expect(
      handler.handleSessionComplete(sessionOutput),
    ).resolves.not.toThrow();

    expect(mockWC.send).toHaveBeenCalledWith(
      SKILL_CREATOR_OUTPUT_READY,
      expect.objectContaining({ skillName: "my-skill" }),
    );
  });

  it("T-09b: SkillRegistry.registerFromPath() で同名スキルを上書き登録できる", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWebContents,
    );

    await handler.registerToRegistry(
      "/project/.claude/skills/my-skill/SKILL.md",
    );
    await handler.registerToRegistry(
      "/project/.claude/skills/my-skill/SKILL.md",
    );

    expect(mockRegistry.registerFromPath).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// T-10: 保存失敗時の通知抑止
// ============================================================

describe("handleSessionComplete - 保存失敗", () => {
  it("T-10a: saveSkill が失敗した場合は通知せずに終了する", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const mockWC = { send: vi.fn() };

    vi.spyOn(fs, "access").mockRejectedValue(new Error("ENOENT"));
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockRejectedValue(new Error("EACCES"));

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as WebContents,
    );

    const sessionOutput =
      "<!-- SKILL_START: fail-skill -->\nname: fail-skill\n<!-- SKILL_END: fail-skill -->";

    await handler.handleSessionComplete(sessionOutput);

    expect(mockRegistry.registerFromPath).not.toHaveBeenCalled();
    expect(mockWC.send).not.toHaveBeenCalled();
  });

  it("T-10b: handleOverwriteApproved で saveSkill が失敗した場合は通知しない", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const mockWC = { send: vi.fn() };

    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockRejectedValue(new Error("EACCES"));

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as WebContents,
    );

    await handler.handleOverwriteApproved({
      skillName: "fail-skill",
      savedPath: "/project/.claude/skills/fail-skill/SKILL.md",
      content: "name: fail-skill",
      requiresOverwriteConfirm: true,
    });

    expect(mockRegistry.registerFromPath).not.toHaveBeenCalled();
    expect(mockWC.send).not.toHaveBeenCalled();
  });
});
