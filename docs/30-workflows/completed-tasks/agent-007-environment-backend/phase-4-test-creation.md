# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 4                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- ContentExtractorテスト: コードブロック抽出のユニットテスト作成
- ContentSanitizerテスト: サニタイズのユニットテスト作成
- TempFileManagerテスト: 一時ファイル管理のユニットテスト作成
- EnvironmentServiceテスト: 統合テスト作成
- 統合テストシナリオ作成: IPC経由のテストシナリオ設計

## 参照資料

| 資料名           | パス                                         | 説明          |
| ---------------- | -------------------------------------------- | ------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| 設計書           | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容        |
| ---------------- | ------------------------------------------------------------------------------ | ----------- |
| セキュリティ実装 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | XSS対策確認 |

## 実行手順

### 1. テストシナリオ設計

受け入れ基準からテストシナリオを導出する。TDD原則に従い、テストを先に書く。

### 2. ContentExtractorテスト作成

```typescript
// apps/desktop/src/main/services/environment/__tests__/ContentExtractor.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { ContentExtractor } from "../ContentExtractor";

describe("ContentExtractor", () => {
  let extractor: ContentExtractor;

  beforeEach(() => {
    extractor = new ContentExtractor();
  });

  describe("extractCodeBlocks", () => {
    it("should extract html code block", () => {
      const text = `
Some text
\`\`\`html
<div>Hello World</div>
\`\`\`
More text
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("html");
      expect(result[0].content).toBe("<div>Hello World</div>");
      expect(result[0].language).toBe("html");
      expect(result[0].order).toBe(0);
    });

    it("should extract markdown code block", () => {
      const text = `
\`\`\`markdown
# Heading
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("markdown");
    });

    it("should extract multiple code blocks with order", () => {
      const text = `
\`\`\`html
<div>First</div>
\`\`\`
\`\`\`css
.class { color: red; }
\`\`\`
\`\`\`html
<div>Second</div>
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(3);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(result[2].order).toBe(2);
    });

    it("should handle code blocks without language", () => {
      const text = `
\`\`\`
plain text
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("text");
    });

    it("should return empty array for text without code blocks", () => {
      const text = "No code blocks here";
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(0);
    });

    it("should detect content type correctly", () => {
      const text = `
\`\`\`js
console.log('hello');
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result[0].type).toBe("javascript");
    });
  });

  describe("getPreviewableContent", () => {
    it("should return last html/markdown block", () => {
      const contents = [
        {
          id: "1",
          type: "css" as const,
          content: "",
          order: 0,
          extractedAt: new Date(),
        },
        {
          id: "2",
          type: "html" as const,
          content: "",
          order: 1,
          extractedAt: new Date(),
        },
        {
          id: "3",
          type: "javascript" as const,
          content: "",
          order: 2,
          extractedAt: new Date(),
        },
        {
          id: "4",
          type: "html" as const,
          content: "",
          order: 3,
          extractedAt: new Date(),
        },
      ];
      const result = extractor.getPreviewableContent(contents);
      expect(result?.id).toBe("4");
    });

    it("should return null if no previewable content", () => {
      const contents = [
        {
          id: "1",
          type: "css" as const,
          content: "",
          order: 0,
          extractedAt: new Date(),
        },
      ];
      const result = extractor.getPreviewableContent(contents);
      expect(result).toBeNull();
    });
  });
});
```

### 3. ContentSanitizerテスト作成

```typescript
// apps/desktop/src/main/services/environment/__tests__/ContentSanitizer.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { ContentSanitizer } from "../ContentSanitizer";

describe("ContentSanitizer", () => {
  let sanitizer: ContentSanitizer;

  beforeEach(() => {
    sanitizer = new ContentSanitizer();
  });

  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const content = {
        id: "1",
        type: "html" as const,
        content: '<div>Hello</div><script>alert("XSS")</script>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<script>");
      expect(result.removedElements).toContain("script");
    });

    it("should remove onclick handlers", () => {
      const content = {
        id: "1",
        type: "html" as const,
        content: "<button onclick=\"alert('XSS')\">Click</button>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("onclick");
    });

    it("should remove iframe tags", () => {
      const content = {
        id: "1",
        type: "html" as const,
        content: '<div><iframe src="https://evil.com"></iframe></div>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<iframe>");
    });

    it("should remove object and embed tags", () => {
      const content = {
        id: "1",
        type: "html" as const,
        content: '<object data="x"></object><embed src="y">',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<object>");
      expect(result.sanitizedContent).not.toContain("<embed>");
    });

    it("should preserve safe html", () => {
      const content = {
        id: "1",
        type: "html" as const,
        content: '<div class="container"><p>Safe content</p></div>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toContain('<div class="container">');
      expect(result.sanitizedContent).toContain("<p>Safe content</p>");
    });

    it("should track removed elements", () => {
      const content = {
        id: "1",
        type: "html" as const,
        content: "<script>evil</script><style>evil</style>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.removedElements.length).toBeGreaterThan(0);
    });
  });

  describe("sanitize (non-html)", () => {
    it("should pass through non-html content unchanged", () => {
      const content = {
        id: "1",
        type: "markdown" as const,
        content: "# Heading\n\nParagraph",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toBe(content.content);
      expect(result.removedElements).toHaveLength(0);
    });
  });
});
```

### 4. TempFileManagerテスト作成

```typescript
// apps/desktop/src/main/services/environment/__tests__/TempFileManager.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TempFileManager } from "../TempFileManager";
import fs from "fs/promises";
import path from "path";

// Mock electron app
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(() => "/tmp"),
  },
}));

describe("TempFileManager", () => {
  let manager: TempFileManager;

  beforeEach(async () => {
    manager = new TempFileManager();
    await manager.initialize();
  });

  afterEach(async () => {
    await manager.cleanup();
  });

  describe("initialize", () => {
    it("should create temp directory", async () => {
      const tempDir = path.join("/tmp", "ai-workflow-orchestrator");
      const stats = await fs.stat(tempDir);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe("saveContent", () => {
    it("should save content to file", async () => {
      const content = {
        id: "test-id",
        type: "html" as const,
        originalContent: "<div>Test</div>",
        sanitizedContent: "<div>Test</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };
      const filepath = await manager.saveContent(content);
      expect(filepath).toContain("preview-test-id.html");

      const fileContent = await fs.readFile(filepath, "utf-8");
      expect(fileContent).toBe("<div>Test</div>");
    });

    it("should use correct file extension", async () => {
      const htmlContent = {
        id: "html-id",
        type: "html" as const,
        originalContent: "",
        sanitizedContent: "",
        removedElements: [],
        sanitizedAt: new Date(),
      };
      const mdContent = {
        id: "md-id",
        type: "markdown" as const,
        originalContent: "",
        sanitizedContent: "",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const htmlPath = await manager.saveContent(htmlContent);
      const mdPath = await manager.saveContent(mdContent);

      expect(htmlPath).toMatch(/\.html$/);
      expect(mdPath).toMatch(/\.md$/);
    });
  });

  describe("cleanup", () => {
    it("should cleanup all files", async () => {
      const content = {
        id: "cleanup-test",
        type: "html" as const,
        originalContent: "",
        sanitizedContent: "<div>Test</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };
      const filepath = await manager.saveContent(content);

      // File should exist
      await expect(fs.access(filepath)).resolves.not.toThrow();

      await manager.cleanup();

      // File should be deleted
      await expect(fs.access(filepath)).rejects.toThrow();
    });
  });

  describe("cleanupFile", () => {
    it("should cleanup specific file", async () => {
      const content = {
        id: "specific-cleanup",
        type: "html" as const,
        originalContent: "",
        sanitizedContent: "<div>Test</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };
      const filepath = await manager.saveContent(content);

      await manager.cleanupFile(filepath);

      await expect(fs.access(filepath)).rejects.toThrow();
    });
  });
});
```

### 5. EnvironmentServiceテスト作成

```typescript
// apps/desktop/src/main/services/environment/__tests__/EnvironmentService.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EnvironmentService } from "../EnvironmentService";

// Mock electron app
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(() => "/tmp"),
  },
}));

describe("EnvironmentService", () => {
  let service: EnvironmentService;

  beforeEach(async () => {
    service = new EnvironmentService();
    await service.initialize();
  });

  afterEach(async () => {
    await service.cleanupTempFiles();
  });

  describe("extractAndSanitize", () => {
    it("should extract and sanitize content", async () => {
      const text = `
\`\`\`html
<div>Hello</div><script>alert('XSS')</script>
\`\`\`
`;
      const result = await service.extractAndSanitize(text, "exec-1");

      expect(result.executionId).toBe("exec-1");
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].sanitizedContent).not.toContain("<script>");
    });

    it("should save preview content to temp file", async () => {
      const text = `
\`\`\`html
<div>Preview</div>
\`\`\`
`;
      const result = await service.extractAndSanitize(text, "exec-2");

      expect(result.tempFilePath).toBeDefined();
      expect(result.tempFilePath).toMatch(/\.html$/);
    });
  });

  describe("getPreviewContent", () => {
    it("should retrieve preview content", async () => {
      const text = `
\`\`\`html
<div>Test</div>
\`\`\`
`;
      await service.extractAndSanitize(text, "exec-3");
      const result = service.getPreviewContent("exec-3");

      expect(result).not.toBeNull();
      expect(result?.executionId).toBe("exec-3");
    });

    it("should return null for unknown executionId", () => {
      const result = service.getPreviewContent("unknown");
      expect(result).toBeNull();
    });
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで作成する:

| シナリオカテゴリ   | 検証内容                                  | テストファイル          |
| ------------------ | ----------------------------------------- | ----------------------- |
| IPC接続テスト      | agent:extract-content疎通・レスポンス形式 | `*.integration.test.ts` |
| データフローテスト | 抽出→サニタイズ→保存→返却の往復           | `*.flow.test.ts`        |
| エラーハンドリング | サニタイズ失敗時のエラー返却              | `*.error.test.ts`       |
| セキュリティテスト | XSS攻撃パターンの除去確認                 | `*.security.test.ts`    |

### 統合テストシナリオ設計

```typescript
// apps/desktop/src/main/services/environment/__tests__/integration.test.ts

describe("Environment Integration Tests", () => {
  describe("IPC接続テスト", () => {
    it("should handle agent:extract-content request", async () => {});
    it("should handle agent:get-preview-content request", async () => {});
    it("should handle agent:cleanup-temp-files request", async () => {});
  });

  describe("データフローテスト", () => {
    it("should process content end-to-end", async () => {});
    it("should cache preview content correctly", async () => {});
  });

  describe("エラーハンドリング", () => {
    it("should handle empty input gracefully", async () => {});
    it("should handle malformed input", async () => {});
  });

  describe("セキュリティテスト", () => {
    it("should remove all XSS attack vectors", async () => {});
    it("should handle nested attack patterns", async () => {});
  });
});
```

## 成果物

| 成果物             | パス                                                             | 説明           |
| ------------------ | ---------------------------------------------------------------- | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                          | テスト設計     |
| テストケース       | `outputs/phase-4/test-cases.md`                                  | ケース一覧     |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                     | 統合テスト設計 |
| テストファイル     | `apps/desktop/src/main/services/environment/__tests__/*.test.ts` | テストコード   |

## 完了条件

- [ ] ContentExtractorのユニットテストが作成されている
- [ ] ContentSanitizerのユニットテストが作成されている
- [ ] TempFileManagerのユニットテストが作成されている
- [ ] EnvironmentServiceのユニットテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] セキュリティテスト（XSS攻撃パターン）が含まれている
- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ContentExtractorテスト作成
3. ContentSanitizerテスト作成
4. TempFileManagerテスト作成
5. EnvironmentServiceテスト作成
6. 統合テストシナリオ作成
7. セキュリティテスト作成
8. Red状態の確認
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
