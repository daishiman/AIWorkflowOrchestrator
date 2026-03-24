import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";
import type { ApplyImprovementResult } from "@repo/shared/types";
import type { RuntimeSkillCreatorFacade } from "../../services/runtime/RuntimeSkillCreatorFacade";

const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlerMap.set(channel, handler);
      },
    ),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  },
}));

vi.mock(
  "../../infrastructure/security/ipc-validator",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../infrastructure/security/ipc-validator")
      >();
    return {
      ...original,
      validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
    };
  },
);

vi.mock("../sanitizeErrorMessage", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../sanitizeErrorMessage")>();
  return {
    ...original,
    sanitizeErrorMessage: vi.fn(original.sanitizeErrorMessage),
  };
});

import { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../creatorHandlers";
import { validateIpcSender } from "../../infrastructure/security/ipc-validator";
import { sanitizeErrorMessage } from "../sanitizeErrorMessage";

function createMockMainWindow() {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  };
}

function createMockEvent(webContentsId = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

const validSuggestion = {
  section: "## 目的",
  before: "このスキルは処理を行います。",
  after: "このスキルは入力テキストを解析し、構造化データに変換します。",
  reason: "目的を具体的に記述することで、利用者の理解度が向上する",
};

const mockApplyResult = {
  applied: 2,
  skipped: 1,
  skippedDetails: [
    {
      section: "## 制約事項",
      reason: "before text not found in SKILL.md",
    },
  ],
  errors: [],
};

describe("skill-creator:apply-improvement ハンドラ", () => {
  let mockMainWindow: ReturnType<typeof createMockMainWindow>;

  const mockRuntimeSkillCreatorService = {
    plan: vi.fn(),
    execute: vi.fn(),
    improve: vi.fn(),
    applyImprovement: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockMainWindow();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    vi.mocked(validateIpcSender).mockReturnValue({ valid: true });

    registerRuntimeSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockRuntimeSkillCreatorService as unknown as RuntimeSkillCreatorFacade,
    );
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
  });

  function getHandler() {
    return handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT);
  }

  // H-1: 正常系: 改善提案の適用成功
  it("H-1: 有効な skillName + suggestions で applyImprovement が呼ばれ、成功レスポンスが返る", async () => {
    mockRuntimeSkillCreatorService.applyImprovement.mockResolvedValue(
      mockApplyResult,
    );

    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [validSuggestion],
    });

    expect(result).toEqual({
      success: true,
      data: mockApplyResult,
    });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).toHaveBeenCalledWith("my-skill", [validSuggestion]);
  });

  // H-2: バリデーション: skillName 未指定
  it("H-2: args.skillName が undefined の場合、バリデーションエラー", async () => {
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      suggestions: [validSuggestion],
    });

    expect(result).toEqual({
      success: false,
      error: "skillName が指定されていません",
    });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).not.toHaveBeenCalled();
  });

  // H-3: バリデーション: skillName 空文字列
  it("H-3: args.skillName が空文字列の場合、バリデーションエラー", async () => {
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "",
      suggestions: [validSuggestion],
    });

    expect(result).toEqual({
      success: false,
      error: "skillName が指定されていません",
    });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).not.toHaveBeenCalled();
  });

  // H-4: バリデーション: skillName スペースのみ（P42）
  it("H-4: args.skillName がスペースのみの場合、バリデーションエラー（P42）", async () => {
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "   ",
      suggestions: [validSuggestion],
    });

    expect(result).toEqual({
      success: false,
      error: "skillName が指定されていません",
    });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).not.toHaveBeenCalled();
  });

  // H-5: バリデーション: suggestions 非配列
  it("H-5: args.suggestions が文字列の場合、バリデーションエラー", async () => {
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: "not-an-array" as unknown,
    });

    expect(result).toEqual({
      success: false,
      error: "suggestions が配列ではありません",
    });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).not.toHaveBeenCalled();
  });

  // H-6: バリデーション: suggestions 空配列
  it("H-6: args.suggestions が空配列の場合、バリデーションエラー", async () => {
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [],
    });

    expect(result).toEqual({
      success: false,
      error: "suggestions が空です",
    });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).not.toHaveBeenCalled();
  });

  // H-7: バリデーション: suggestion 要素の構造不正
  it("H-7: section が欠落した suggestion でバリデーションエラー", async () => {
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [
        {
          // section が欠落
          before: "before text",
          after: "after text",
          reason: "reason text",
        },
      ],
    });

    expect(result).toEqual({
      success: false,
      error:
        "suggestions[0] の構造が不正です（section/before/after/reason は全て string 必須）",
    });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).not.toHaveBeenCalled();
  });

  // H-8: runtimeService 未注入
  it("H-8: runtimeSkillCreatorService が undefined の場合、利用不可エラー", async () => {
    unregisterRuntimeSkillCreatorHandlers();
    handlerMap.clear();

    registerRuntimeSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
    );

    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [validSuggestion],
    });

    expect(result).toEqual({
      success: false,
      error: "Runtime Skill Creator は現在利用できません",
    });
  });

  // H-9: applyImprovement 例外
  it("H-9: facade.applyImprovement が例外を投げた場合、sanitize されたエラー", async () => {
    vi.mocked(sanitizeErrorMessage).mockReturnValue("サニタイズ済みエラー");
    mockRuntimeSkillCreatorService.applyImprovement.mockRejectedValue(
      new Error("FS error"),
    );

    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [validSuggestion],
    });

    expect(result).toEqual({
      success: false,
      error: "サニタイズ済みエラー",
    });
    expect(sanitizeErrorMessage).toHaveBeenCalledWith(
      expect.any(Error),
      "改善提案の適用に失敗しました",
    );
  });

  // H-10: 送信元検証失敗
  it("H-10: validateIpcSender が失敗した場合、例外が送出される", async () => {
    vi.mocked(validateIpcSender).mockReturnValueOnce({
      valid: false,
      errorCode: "IPC_UNAUTHORIZED",
      errorMessage: "unauthorized sender",
    });

    const handler = getHandler();
    await expect(
      handler!(createMockEvent(), {
        skillName: "my-skill",
        suggestions: [validSuggestion],
      }),
    ).rejects.toThrow();
  });

  // H-11: unregister 確認
  it("H-11: unregisterRuntimeSkillCreatorHandlers でハンドラが解除される", () => {
    expect(getHandler()).toBeDefined();

    unregisterRuntimeSkillCreatorHandlers();

    expect(getHandler()).toBeUndefined();
  });

  // H-11a: バリデーション: suggestions 配列が 101 件以上（DoS 防御）
  it("H-11a: suggestions が 101 件以上の場合、上限超過エラー", async () => {
    const overflowSuggestions = Array.from({ length: 101 }, (_, i) => ({
      section: `## Section ${i}`,
      before: `before-${i}`,
      after: `after-${i}`,
      reason: `reason-${i}`,
    }));

    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: overflowSuggestions,
    });

    expect(result).toEqual({
      success: false,
      error: "suggestions が上限（100件）を超えています",
    });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).not.toHaveBeenCalled();
  });

  // H-12: suggestions 配列に1件のみ
  it("H-12: suggestions が1件のみでも正常動作する", async () => {
    mockRuntimeSkillCreatorService.applyImprovement.mockResolvedValue(
      mockApplyResult,
    );
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [validSuggestion],
    });
    expect(result).toEqual({ success: true, data: mockApplyResult });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).toHaveBeenCalledWith("my-skill", [validSuggestion]);
  });

  // H-13: suggestions 配列に20件
  it("H-13: suggestions が20件でも正常動作する", async () => {
    mockRuntimeSkillCreatorService.applyImprovement.mockResolvedValue(
      mockApplyResult,
    );
    const manySuggestions = Array.from({ length: 20 }, (_, i) => ({
      section: `## Section ${i}`,
      before: `before-${i}`,
      after: `after-${i}`,
      reason: `reason-${i}`,
    }));
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: manySuggestions,
    });
    expect(result).toEqual({ success: true, data: mockApplyResult });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).toHaveBeenCalledWith("my-skill", manySuggestions);
  });

  // H-14: suggestion.before が空文字列 → バリデーション通過
  it("H-14: suggestion.before が空文字列でもバリデーションを通過する", async () => {
    mockRuntimeSkillCreatorService.applyImprovement.mockResolvedValue(
      mockApplyResult,
    );
    const suggestionWithEmptyBefore = {
      section: "## 目的",
      before: "",
      after: "新しい内容",
      reason: "セクションを追加する",
    };
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [suggestionWithEmptyBefore],
    });
    expect(result).toEqual({ success: true, data: mockApplyResult });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).toHaveBeenCalledWith("my-skill", [suggestionWithEmptyBefore]);
  });

  // H-15: suggestion.reason が空文字列 → バリデーション通過
  it("H-15: suggestion.reason が空文字列でもバリデーションを通過する", async () => {
    mockRuntimeSkillCreatorService.applyImprovement.mockResolvedValue(
      mockApplyResult,
    );
    const suggestionWithEmptyReason = {
      section: "## 目的",
      before: "旧テキスト",
      after: "新テキスト",
      reason: "",
    };
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [suggestionWithEmptyReason],
    });
    expect(result).toEqual({ success: true, data: mockApplyResult });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).toHaveBeenCalledWith("my-skill", [suggestionWithEmptyReason]);
  });

  // H-16: skillName に特殊文字 → trim された値が facade に渡される
  it('H-16: skillName に特殊文字（"my-skill_v2.0"）を含む場合も正常動作し、trim された値が facade に渡される', async () => {
    mockRuntimeSkillCreatorService.applyImprovement.mockResolvedValue(
      mockApplyResult,
    );
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "  my-skill_v2.0  ",
      suggestions: [validSuggestion],
    });
    expect(result).toEqual({ success: true, data: mockApplyResult });
    expect(
      mockRuntimeSkillCreatorService.applyImprovement,
    ).toHaveBeenCalledWith("my-skill_v2.0", [validSuggestion]);
  });

  // H-17: applyImprovement 部分成功 → applied=1, skipped=1 の混合結果
  it("H-17: applyImprovement が applied=1, skipped=1 の部分成功結果を返した場合、そのまま data に含まれる", async () => {
    const partialResult = {
      applied: 1,
      skipped: 1,
      skippedDetails: [
        {
          section: "## 制約事項",
          reason: "before text not found in SKILL.md",
        },
      ],
      errors: [],
    };
    mockRuntimeSkillCreatorService.applyImprovement.mockResolvedValue(
      partialResult,
    );
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [validSuggestion],
    });
    expect(result).toEqual({ success: true, data: partialResult });
    expect(result).toMatchObject({
      success: true,
      data: { applied: 1, skipped: 1 },
    });
  });

  // H-18: applyImprovement errors あり → errors 配列にエラーがある場合も success=true で data が返る
  it("H-18: applyImprovement の結果に errors 配列がある場合も success=true で data が返る", async () => {
    const resultWithErrors: ApplyImprovementResult = {
      applied: 1,
      skipped: 0,
      skippedDetails: [],
      errors: ["## 使い方: 予期しない書き込みエラー"],
    };
    mockRuntimeSkillCreatorService.applyImprovement.mockResolvedValue(
      resultWithErrors,
    );
    const handler = getHandler();
    const result = await handler!(createMockEvent(), {
      skillName: "my-skill",
      suggestions: [validSuggestion],
    });
    expect(result).toEqual({ success: true, data: resultWithErrors });
    expect(result).toMatchObject({
      success: true,
      data: {
        errors: ["## 使い方: 予期しない書き込みエラー"],
      },
    });
  });
});
