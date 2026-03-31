import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";

vi.mock("fs", async () => {
  const actual = await vi.importActual<typeof import("fs")>("fs");
  const mocked = {
    ...actual,
    readFileSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true),
  };
  return { ...mocked, default: mocked };
});

describe("evaluate-ui-ux-prompt-loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("プロンプト本文セクションを正しく抽出する", async () => {
    const mockContent = `# テストプロンプト

## プロンプト本文

これはテストプロンプトです。
対象: {{taskContext}}

## 重要度基準

| 重要度 | 定義 |
`;
    vi.mocked(fs.readFileSync).mockReturnValueOnce(mockContent);

    const { loadPrompt } = await import(
      "../evaluate-ui-ux-prompt-loader"
    );
    const result = loadPrompt("test.prompt.md", {
      taskContext: "テスト対象",
    });

    expect(result).toContain("これはテストプロンプトです");
    expect(result).toContain("対象: テスト対象");
    expect(result).not.toContain("重要度基準");
  });

  it("プロンプト本文セクションが無い場合にエラーを投げる", async () => {
    vi.mocked(fs.readFileSync).mockReturnValueOnce("# No body section here");

    const { loadPrompt } = await import(
      "../evaluate-ui-ux-prompt-loader"
    );

    expect(() => loadPrompt("bad.prompt.md")).toThrow("プロンプト本文");
  });

  it("複数のプレースホルダーを置換する", async () => {
    const mockContent = `# プロンプト

## プロンプト本文

{{name}} が {{action}} を実行する
`;
    vi.mocked(fs.readFileSync).mockReturnValueOnce(mockContent);

    const { loadPrompt } = await import(
      "../evaluate-ui-ux-prompt-loader"
    );
    const result = loadPrompt("test.prompt.md", {
      name: "ユーザー",
      action: "テスト",
    });

    expect(result).toBe("ユーザー が テスト を実行する");
  });

  it("複数セクションを結合して読み込む", async () => {
    const mockContent = `# プロンプト

## プロンプト本文

メインプロンプト内容

## 重要度基準

| 重要度 | 定義 |
| HIGH | 重大 |

## その他

無関係なセクション
`;
    vi.mocked(fs.readFileSync).mockReturnValueOnce(mockContent);

    const { loadPrompt } = await import(
      "../evaluate-ui-ux-prompt-loader"
    );
    const result = loadPrompt("test.prompt.md", {}, [
      "プロンプト本文",
      "重要度基準",
    ]);

    expect(result).toContain("メインプロンプト内容");
    expect(result).toContain("| HIGH | 重大 |");
    expect(result).not.toContain("無関係なセクション");
  });

  it("存在しないオプショナルセクションはスキップする", async () => {
    const mockContent = `# プロンプト

## プロンプト本文

メインプロンプトのみ
`;
    vi.mocked(fs.readFileSync).mockReturnValueOnce(mockContent);

    const { loadPrompt } = await import(
      "../evaluate-ui-ux-prompt-loader"
    );
    const result = loadPrompt("test.prompt.md", {}, [
      "プロンプト本文",
      "存在しないセクション",
    ]);

    expect(result).toBe("メインプロンプトのみ");
  });
});
