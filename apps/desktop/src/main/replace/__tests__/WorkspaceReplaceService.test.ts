import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  WorkspaceReplaceService,
  type WorkspaceReplaceOptions,
} from "../WorkspaceReplaceService";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

describe("WorkspaceReplaceService", () => {
  let service: WorkspaceReplaceService;
  let testDir: string;

  beforeEach(async () => {
    service = new WorkspaceReplaceService();
    testDir = path.join(tmpdir(), `workspace-replace-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("正常系: 複数ファイル一括置換", () => {
    it("should replace across multiple files", async () => {
      await fs.writeFile(
        path.join(testDir, "file1.ts"),
        "const hello = 'world';",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "file2.ts"),
        "function hello() {}",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "hello",
        replacement: "goodbye",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      expect(result.filesModified).toBe(2);
      expect(result.totalReplacements).toBe(2);

      const file1Content = await fs.readFile(
        path.join(testDir, "file1.ts"),
        "utf-8",
      );
      const file2Content = await fs.readFile(
        path.join(testDir, "file2.ts"),
        "utf-8",
      );

      expect(file1Content).toBe("const goodbye = 'world';");
      expect(file2Content).toBe("function goodbye() {}");
    });

    it("should replace multiple occurrences in same file", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "test test test",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "test",
        replacement: "foo",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      expect(result.totalReplacements).toBe(3);

      const content = await fs.readFile(path.join(testDir, "file.ts"), "utf-8");
      expect(content).toBe("foo foo foo");
    });

    it("should handle nested directories", async () => {
      const nestedDir = path.join(testDir, "src", "components");
      await fs.mkdir(nestedDir, { recursive: true });
      await fs.writeFile(
        path.join(nestedDir, "Button.tsx"),
        "export const Button = () => 'click';",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "Button",
        replacement: "MyButton",
        workspacePath: testDir,
        include: ["**/*.tsx"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      expect(result.filesModified).toBe(1);

      const content = await fs.readFile(
        path.join(nestedDir, "Button.tsx"),
        "utf-8",
      );
      expect(content).toBe("export const MyButton = () => 'click';");
    });
  });

  describe("正常系: プレビュー生成", () => {
    it("should generate preview without modifying files", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "const hello = 'world';",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "hello",
        replacement: "goodbye",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const preview = await service.preview(options);

      expect(preview.totalMatches).toBe(1);
      expect(preview.files.length).toBe(1);
      expect(preview.files[0].replacements[0].before).toBe("hello");
      expect(preview.files[0].replacements[0].after).toBe("goodbye");

      // ファイルは変更されていないことを確認
      const content = await fs.readFile(path.join(testDir, "file.ts"), "utf-8");
      expect(content).toBe("const hello = 'world';");
    });

    it("should show preview for multiple files", async () => {
      await fs.writeFile(
        path.join(testDir, "file1.ts"),
        "const test = 1;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "file2.ts"),
        "const test = 2;",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "test",
        replacement: "value",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const preview = await service.preview(options);

      expect(preview.totalMatches).toBe(2);
      expect(preview.files.length).toBe(2);
    });
  });

  describe("正常系: Undo機能", () => {
    it("should undo all replacements", async () => {
      await fs.writeFile(
        path.join(testDir, "file1.ts"),
        "const hello = 1;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "file2.ts"),
        "const hello = 2;",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "hello",
        replacement: "goodbye",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      // 置換後の確認
      let content1 = await fs.readFile(path.join(testDir, "file1.ts"), "utf-8");
      expect(content1).toBe("const goodbye = 1;");

      // Undo実行
      await service.undo(result.undoId);

      // 元に戻っていることを確認
      content1 = await fs.readFile(path.join(testDir, "file1.ts"), "utf-8");
      const content2 = await fs.readFile(
        path.join(testDir, "file2.ts"),
        "utf-8",
      );

      expect(content1).toBe("const hello = 1;");
      expect(content2).toBe("const hello = 2;");
    });

    it("should support redo after undo", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "const hello = 1;",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "hello",
        replacement: "goodbye",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);
      await service.undo(result.undoId);
      await service.redo(result.undoId);

      const content = await fs.readFile(path.join(testDir, "file.ts"), "utf-8");
      expect(content).toBe("const goodbye = 1;");
    });
  });

  describe("正常系: 正規表現置換", () => {
    it("should support regex replacement with capture groups", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "const foo123 = 1;",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "(foo)(\\d+)",
        replacement: "$2_$1",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: true,
        preserveCase: false,
      };

      const _result = await service.replaceAll(options);

      const content = await fs.readFile(path.join(testDir, "file.ts"), "utf-8");
      expect(content).toBe("const 123_foo = 1;");
    });
  });

  describe("正常系: 大文字小文字保持", () => {
    it("should preserve case when replacing", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "HELLO hello Hello",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "hello",
        replacement: "world",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: true,
      };

      const _result = await service.replaceAll(options);

      const content = await fs.readFile(path.join(testDir, "file.ts"), "utf-8");
      expect(content).toBe("WORLD world World");
    });
  });

  describe("正常系: 除外パターン", () => {
    it("should exclude node_modules by default", async () => {
      const nodeModulesDir = path.join(testDir, "node_modules", "package");
      await fs.mkdir(nodeModulesDir, { recursive: true });
      await fs.writeFile(
        path.join(nodeModulesDir, "index.js"),
        "const test = 1;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "src.js"),
        "const test = 2;",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "test",
        replacement: "value",
        workspacePath: testDir,
        include: ["**/*.js"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      expect(result.filesModified).toBe(1);

      // node_modules内のファイルは変更されていない
      const nodeContent = await fs.readFile(
        path.join(nodeModulesDir, "index.js"),
        "utf-8",
      );
      expect(nodeContent).toBe("const test = 1;");
    });

    it("should respect custom exclude patterns", async () => {
      const buildDir = path.join(testDir, "build");
      await fs.mkdir(buildDir, { recursive: true });
      await fs.writeFile(
        path.join(buildDir, "output.js"),
        "const test = 1;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "src.js"),
        "const test = 2;",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "test",
        replacement: "value",
        workspacePath: testDir,
        include: ["**/*.js"],
        exclude: ["**/build/**"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      expect(result.filesModified).toBe(1);
    });
  });

  describe("境界値: 空の検索", () => {
    it("should return empty result for empty query", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "const test = 1;",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "",
        replacement: "value",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      expect(result.filesModified).toBe(0);
      expect(result.totalReplacements).toBe(0);
    });
  });

  describe("境界値: マッチなし", () => {
    it("should handle no matches gracefully", async () => {
      await fs.writeFile(
        path.join(testDir, "file.ts"),
        "const hello = 1;",
        "utf-8",
      );

      const options: WorkspaceReplaceOptions = {
        searchQuery: "nonexistent",
        replacement: "value",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      expect(result.filesModified).toBe(0);
      expect(result.totalReplacements).toBe(0);
    });
  });

  describe("境界値: 大量ファイル", () => {
    it("should handle many files efficiently", async () => {
      // 30ファイル作成
      for (let i = 0; i < 30; i++) {
        await fs.writeFile(
          path.join(testDir, `file${i}.ts`),
          `const test${i} = ${i};`,
          "utf-8",
        );
      }

      const options: WorkspaceReplaceOptions = {
        searchQuery: "const",
        replacement: "let",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const startTime = Date.now();
      const result = await service.replaceAll(options);
      const duration = Date.now() - startTime;

      expect(result.filesModified).toBe(30);
      expect(duration).toBeLessThan(10000); // 10秒以内
    });
  });

  describe("異常系: エラーハンドリング", () => {
    it("should handle non-existent workspace path", async () => {
      const options: WorkspaceReplaceOptions = {
        searchQuery: "test",
        replacement: "value",
        workspacePath: "/non/existent/path",
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
      };

      const result = await service.replaceAll(options);

      expect(result.filesModified).toBe(0);
    });

    it("should throw error for invalid regex", async () => {
      const options: WorkspaceReplaceOptions = {
        searchQuery: "[invalid",
        replacement: "value",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: true,
        preserveCase: false,
      };

      await expect(service.replaceAll(options)).rejects.toThrow();
    });
  });

  describe("選択的置換", () => {
    it("should replace only selected files", async () => {
      await fs.writeFile(
        path.join(testDir, "file1.ts"),
        "const test = 1;",
        "utf-8",
      );
      await fs.writeFile(
        path.join(testDir, "file2.ts"),
        "const test = 2;",
        "utf-8",
      );

      const file1Path = path.join(testDir, "file1.ts");

      const options: WorkspaceReplaceOptions = {
        searchQuery: "test",
        replacement: "value",
        workspacePath: testDir,
        include: ["**/*.ts"],
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        preserveCase: false,
        selectedFiles: [file1Path],
      };

      const result = await service.replaceAll(options);

      expect(result.filesModified).toBe(1);

      // file1は変更されている
      const content1 = await fs.readFile(file1Path, "utf-8");
      expect(content1).toBe("const value = 1;");

      // file2は変更されていない
      const content2 = await fs.readFile(
        path.join(testDir, "file2.ts"),
        "utf-8",
      );
      expect(content2).toBe("const test = 2;");
    });
  });
});
