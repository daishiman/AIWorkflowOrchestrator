/**
 * @file permissionDescriptions.test.ts
 * @description permissionDescriptions モジュールのユニットテスト
 * @phase Phase 4: テスト作成（TDD Red） + Phase 6: テスト拡充
 * @task task-imp-permission-readable-ui-001
 */

import { describe, it, expect } from "vitest";
import { getDescription } from "../permissionDescriptions";

describe("getDescription", () => {
  // ============================================================
  // 正常系: 各ツール別説明文生成（12種類）
  // ============================================================
  describe("各ツール別説明文生成", () => {
    it("Bash: コマンド文字列を含む説明を返す", () => {
      expect(getDescription("Bash", { command: "ls -la" })).toBe(
        "「ls -la」コマンドを実行します",
      );
    });

    it("Read: ファイルパスを含む説明を返す", () => {
      expect(getDescription("Read", { file_path: "/tmp/file.txt" })).toBe(
        "「/tmp/file.txt」ファイルを読み取ります",
      );
    });

    it("Write: ファイルパスを含む説明を返す", () => {
      expect(getDescription("Write", { file_path: "/tmp/output.txt" })).toBe(
        "「/tmp/output.txt」ファイルに書き込みます",
      );
    });

    it("Edit: ファイルパスを含む説明を返す", () => {
      expect(
        getDescription("Edit", {
          file_path: "/src/app.tsx",
          old_string: "foo",
          new_string: "bar",
        }),
      ).toBe("「/src/app.tsx」ファイルを編集します");
    });

    it("Glob: パターンを含む説明を返す", () => {
      expect(getDescription("Glob", { pattern: "**/*.ts" })).toBe(
        "「**/*.ts」パターンでファイルを検索します",
      );
    });

    it("Grep: パターンを含む説明を返す", () => {
      expect(getDescription("Grep", { pattern: "TODO" })).toBe(
        "「TODO」を含むファイルを検索します",
      );
    });

    it("WebSearch: クエリを含む説明を返す", () => {
      expect(getDescription("WebSearch", { query: "React hooks" })).toBe(
        "「React hooks」で検索します",
      );
    });

    it("Task: 説明を含む説明を返す", () => {
      expect(getDescription("Task", { description: "テストを実行" })).toBe(
        "タスクを実行します：テストを実行",
      );
    });

    it("NotebookEdit: ノートブックパスを含む説明を返す", () => {
      expect(
        getDescription("NotebookEdit", {
          notebook_path: "/notebooks/test.ipynb",
        }),
      ).toBe("ノートブックを編集します：/notebooks/test.ipynb");
    });

    it("WebFetch: URLを含む説明を返す", () => {
      expect(
        getDescription("WebFetch", { url: "https://example.com/api" }),
      ).toBe("「https://example.com/api」からデータを取得します");
    });

    it("Skill: スキル名を含む説明を返す", () => {
      expect(getDescription("Skill", { skill: "commit" })).toBe(
        "「commit」スキルを実行します",
      );
    });

    it("AskUser: ユーザー確認の説明を返す", () => {
      expect(getDescription("AskUser", { question: "続行しますか？" })).toBe(
        "ユーザーに確認します",
      );
    });
  });

  // ============================================================
  // 異常系: フォールバック
  // ============================================================
  describe("フォールバック", () => {
    it("未定義ツールにデフォルト説明を返す", () => {
      expect(getDescription("UnknownTool", { foo: "bar" })).toBe(
        "「UnknownTool」ツールの操作を実行します",
      );
    });

    it("空引数のBashにフォールバック説明を返す", () => {
      expect(getDescription("Bash", {})).toBe("コマンドを実行します");
    });

    it("空引数のReadにフォールバック説明を返す", () => {
      expect(getDescription("Read", {})).toBe("ファイルを読み取ります");
    });

    it("null引数値のBashにフォールバック説明を返す", () => {
      expect(getDescription("Bash", { command: null })).toBe(
        "コマンドを実行します",
      );
    });

    it("undefined引数値のReadにフォールバック説明を返す", () => {
      expect(getDescription("Read", { file_path: undefined })).toBe(
        "ファイルを読み取ります",
      );
    });

    it("空文字列のツール名でフォールバックする", () => {
      expect(getDescription("", { command: "ls" })).toBe("操作を実行します");
    });

    it("全ツールの空引数フォールバック", () => {
      expect(getDescription("Write", {})).toBe("ファイルに書き込みます");
      expect(getDescription("Edit", {})).toBe("ファイルを編集します");
      expect(getDescription("Glob", {})).toBe("パターンでファイルを検索します");
      expect(getDescription("Grep", {})).toBe("ファイル内を検索します");
      expect(getDescription("WebSearch", {})).toBe("Webを検索します");
      expect(getDescription("Task", {})).toBe("タスクを実行します");
      expect(getDescription("NotebookEdit", {})).toBe(
        "ノートブックを編集します",
      );
      expect(getDescription("WebFetch", {})).toBe("URLからデータを取得します");
      expect(getDescription("Skill", {})).toBe("スキルを実行します");
    });
  });

  // ============================================================
  // 境界値テスト
  // ============================================================
  describe("境界値", () => {
    it("非常に長いコマンド文字列が100文字で切り詰められる", () => {
      const longCommand = "a".repeat(150);
      const result = getDescription("Bash", { command: longCommand });
      expect(result).toBe(`「${"a".repeat(100)}...」コマンドを実行します`);
    });

    it("ちょうど100文字のコマンドは切り詰められない", () => {
      const exactCommand = "b".repeat(100);
      const result = getDescription("Bash", { command: exactCommand });
      expect(result).toBe(`「${exactCommand}」コマンドを実行します`);
    });

    it("日本語パスを含む説明を正しく返す", () => {
      expect(
        getDescription("Read", {
          file_path: "/home/ユーザー/ドキュメント/ファイル.txt",
        }),
      ).toBe(
        "「/home/ユーザー/ドキュメント/ファイル.txt」ファイルを読み取ります",
      );
    });

    it("特殊文字を含むパスを正しく返す", () => {
      expect(
        getDescription("Read", {
          file_path: "/path/with spaces/file (1).txt",
        }),
      ).toBe("「/path/with spaces/file (1).txt」ファイルを読み取ります");
    });

    it("空文字列のコマンドでフォールバックする", () => {
      expect(getDescription("Bash", { command: "" })).toBe(
        "コマンドを実行します",
      );
    });
  });

  // ============================================================
  // 型不正テスト
  // ============================================================
  describe("型不正", () => {
    it("数値のcommand引数でString()変換される", () => {
      const result = getDescription("Bash", {
        command: 123 as unknown as string,
      });
      expect(result).toBe("「123」コマンドを実行します");
    });

    it("配列のpath引数でString()変換される", () => {
      const result = getDescription("Read", {
        file_path: ["a", "b"] as unknown as string,
      });
      expect(result).toBe("「a,b」ファイルを読み取ります");
    });

    it("boolean引数でString()変換される", () => {
      const result = getDescription("Bash", {
        command: true as unknown as string,
      });
      expect(result).toBe("「true」コマンドを実行します");
    });
  });

  // ============================================================
  // 複合引数テスト
  // ============================================================
  describe("複合引数", () => {
    it("Bashのcommandとdescription両方がある場合にcommandを使用", () => {
      expect(
        getDescription("Bash", {
          command: "ls -la",
          description: "ファイル一覧",
        }),
      ).toBe("「ls -la」コマンドを実行します");
    });

    it("Editの全引数パターン", () => {
      expect(
        getDescription("Edit", {
          file_path: "/src/app.tsx",
          old_string: "const a = 1",
          new_string: "const a = 2",
        }),
      ).toBe("「/src/app.tsx」ファイルを編集します");
    });

    it("Taskのpromptとdescription両方がある場合にdescriptionを使用", () => {
      expect(
        getDescription("Task", {
          prompt: "詳細な指示",
          description: "テスト実行",
        }),
      ).toBe("タスクを実行します：テスト実行");
    });
  });

  // ============================================================
  // XSSセキュリティテスト
  // ============================================================
  describe("XSSセキュリティ", () => {
    it("HTMLタグを含む引数がそのまま文字列として返される", () => {
      const result = getDescription("Bash", {
        command: '<script>alert("xss")</script>',
      });
      expect(result).toBe(
        '「<script>alert("xss")</script>」コマンドを実行します',
      );
      // React JSXの自動エスケープにより安全に表示される
    });

    it("イベントハンドラを含む引数がそのまま文字列として返される", () => {
      const result = getDescription("Bash", {
        command: "<img src=x onerror=alert(1)>",
      });
      expect(result).toBe(
        "「<img src=x onerror=alert(1)>」コマンドを実行します",
      );
    });

    it("javascript:プロトコルを含む引数がそのまま文字列として返される", () => {
      const result = getDescription("Read", {
        file_path: "javascript:alert(1)",
      });
      expect(result).toBe("「javascript:alert(1)」ファイルを読み取ります");
    });

    it("エスケープシーケンスを含む引数がそのまま返される", () => {
      const result = getDescription("Bash", {
        command: 'echo "<b>bold</b>"',
      });
      expect(result).toBe('「echo "<b>bold</b>"」コマンドを実行します');
    });
  });
});
