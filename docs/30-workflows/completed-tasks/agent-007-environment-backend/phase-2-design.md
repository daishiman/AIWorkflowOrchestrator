# Phase 2: 設計

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 2                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

要件を実現可能な構造に落とし込む。

## 実行タスク

- 型定義設計: ContentType、ExtractedContent等の型定義
- サービス設計: ContentExtractor、ContentSanitizer、TempFileManager、EnvironmentServiceのクラス設計
- IPC設計: チャネル・ハンドラ設計

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                             | 内容               |
| ------------------ | -------------------------------------------------------------------------------- | ------------------ |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     | Facadeパターン設計 |
| セキュリティ実装   | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`   | XSS対策原則        |
| 入力バリデーション | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | サニタイズ実装     |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`     | IPC設計            |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "IPC"`

## 実行手順

### 1. 型定義設計

```typescript
// packages/shared/src/types/agent.ts に追加

export type ContentType = "html" | "markdown" | "css" | "javascript" | "text";

export interface ExtractedContent {
  id: string;
  type: ContentType;
  content: string;
  language?: string; // コードブロックの言語指定
  order: number; // 出現順序
  extractedAt: Date;
}

export interface SanitizedContent {
  id: string;
  type: ContentType;
  originalContent: string;
  sanitizedContent: string;
  removedElements: string[]; // 除去された要素のリスト
  sanitizedAt: Date;
}

export interface PreviewContent {
  executionId: string;
  contents: SanitizedContent[];
  tempFilePath?: string;
  createdAt: Date;
}
```

### 2. サービス設計

#### 2.1 ContentExtractor設計

````typescript
// apps/desktop/src/main/services/environment/ContentExtractor.ts

export class ContentExtractor {
  /**
   * Markdownコードブロックを抽出
   * ```html ... ``` 形式を検出
   */
  extractCodeBlocks(text: string): ExtractedContent[] {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const contents: ExtractedContent[] = [];
    let match;
    let order = 0;

    while ((match = regex.exec(text)) !== null) {
      const language = match[1] || "text";
      const content = match[2];

      contents.push({
        id: uuidv4(),
        type: this.detectContentType(language),
        content: content.trim(),
        language,
        order: order++,
        extractedAt: new Date(),
      });
    }

    return contents;
  }

  /**
   * 最後のHTML/Markdownブロックを取得（プレビュー用）
   */
  getPreviewableContent(contents: ExtractedContent[]): ExtractedContent | null {
    const previewable = contents.filter((c) =>
      ["html", "markdown"].includes(c.type),
    );
    return previewable[previewable.length - 1] || null;
  }

  private detectContentType(language: string): ContentType {
    const mapping: Record<string, ContentType> = {
      html: "html",
      htm: "html",
      markdown: "markdown",
      md: "markdown",
      css: "css",
      javascript: "javascript",
      js: "javascript",
    };
    return mapping[language.toLowerCase()] || "text";
  }
}
````

#### 2.2 ContentSanitizer設計

```typescript
// apps/desktop/src/main/services/environment/ContentSanitizer.ts

import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export class ContentSanitizer {
  private purify: DOMPurify.DOMPurifyI;

  constructor() {
    const window = new JSDOM("").window;
    this.purify = DOMPurify(window);
  }

  sanitizeHtml(content: ExtractedContent): SanitizedContent {
    const removedElements: string[] = [];

    // DOMPurify設定
    this.purify.addHook("uponSanitizeElement", (node) => {
      if (node.nodeName === "SCRIPT") {
        removedElements.push("script");
      }
    });

    const sanitized = this.purify.sanitize(content.content, {
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "base"],
      FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover", "onfocus"],
      ALLOW_DATA_ATTR: false,
      SAFE_FOR_TEMPLATES: true,
    });

    this.purify.removeAllHooks();

    return {
      id: content.id,
      type: content.type,
      originalContent: content.content,
      sanitizedContent: sanitized,
      removedElements,
      sanitizedAt: new Date(),
    };
  }

  sanitize(content: ExtractedContent): SanitizedContent {
    if (content.type === "html") {
      return this.sanitizeHtml(content);
    }

    // Markdown等はそのまま（フロントエンドで安全にレンダリング）
    return {
      id: content.id,
      type: content.type,
      originalContent: content.content,
      sanitizedContent: content.content,
      removedElements: [],
      sanitizedAt: new Date(),
    };
  }
}
```

#### 2.3 TempFileManager設計

```typescript
// apps/desktop/src/main/services/environment/TempFileManager.ts

import { app } from "electron";
import path from "path";
import fs from "fs/promises";

export class TempFileManager {
  private tempDir: string;
  private files: Set<string> = new Set();

  constructor() {
    this.tempDir = path.join(app.getPath("temp"), "ai-workflow-orchestrator");
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  async saveContent(content: SanitizedContent): Promise<string> {
    const ext = this.getExtension(content.type);
    const filename = `preview-${content.id}${ext}`;
    const filepath = path.join(this.tempDir, filename);

    await fs.writeFile(filepath, content.sanitizedContent, {
      encoding: "utf-8",
      mode: 0o600, // owner read/write only
    });
    this.files.add(filepath);

    return filepath;
  }

  async cleanup(): Promise<void> {
    for (const filepath of this.files) {
      try {
        await fs.unlink(filepath);
      } catch {
        // Ignore errors during cleanup
      }
    }
    this.files.clear();
  }

  async cleanupFile(filepath: string): Promise<void> {
    if (this.files.has(filepath)) {
      await fs.unlink(filepath);
      this.files.delete(filepath);
    }
  }

  private getExtension(type: ContentType): string {
    const mapping: Record<ContentType, string> = {
      html: ".html",
      markdown: ".md",
      css: ".css",
      javascript: ".js",
      text: ".txt",
    };
    return mapping[type];
  }
}
```

#### 2.4 EnvironmentService設計（Facade）

```typescript
// apps/desktop/src/main/services/environment/EnvironmentService.ts

export class EnvironmentService {
  private extractor: ContentExtractor;
  private sanitizer: ContentSanitizer;
  private tempFileManager: TempFileManager;
  private previewCache: Map<string, PreviewContent> = new Map();

  constructor() {
    this.extractor = new ContentExtractor();
    this.sanitizer = new ContentSanitizer();
    this.tempFileManager = new TempFileManager();
  }

  async initialize(): Promise<void> {
    await this.tempFileManager.initialize();
  }

  async extractAndSanitize(
    text: string,
    executionId: string,
  ): Promise<PreviewContent> {
    const extracted = this.extractor.extractCodeBlocks(text);
    const sanitized = extracted.map((c) => this.sanitizer.sanitize(c));

    const previewContent: PreviewContent = {
      executionId,
      contents: sanitized,
      createdAt: new Date(),
    };

    // プレビュー可能なコンテンツがあれば一時ファイルに保存
    const previewable = this.extractor.getPreviewableContent(extracted);
    if (previewable) {
      const sanitizedPreviewable = sanitized.find(
        (c) => c.id === previewable.id,
      );
      if (sanitizedPreviewable) {
        previewContent.tempFilePath =
          await this.tempFileManager.saveContent(sanitizedPreviewable);
      }
    }

    this.previewCache.set(executionId, previewContent);
    return previewContent;
  }

  getPreviewContent(executionId: string): PreviewContent | null {
    return this.previewCache.get(executionId) || null;
  }

  async cleanupTempFiles(): Promise<void> {
    await this.tempFileManager.cleanup();
    this.previewCache.clear();
  }
}
```

### 3. IPC設計

#### 3.1 IPCチャネル定義

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const IPC_CHANNELS = {
  // ... 既存チャネル
  AGENT_EXTRACT_CONTENT: "agent:extract-content",
  AGENT_GET_PREVIEW_CONTENT: "agent:get-preview-content",
  AGENT_CLEANUP_TEMP_FILES: "agent:cleanup-temp-files",
} as const;
```

#### 3.2 agentHandlers拡張

```typescript
// apps/desktop/src/main/ipc/agentHandlers.ts に追加

export function registerEnvironmentHandlers(
  environmentService: EnvironmentService,
): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXTRACT_CONTENT,
    async (_e, { text, executionId }) => {
      return environmentService.extractAndSanitize(text, executionId);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_PREVIEW_CONTENT,
    async (_e, { executionId }) => {
      return environmentService.getPreviewContent(executionId);
    },
  );

  ipcMain.handle(IPC_CHANNELS.AGENT_CLEANUP_TEMP_FILES, async () => {
    await environmentService.cleanupTempFiles();
    return true;
  });
}
```

### 4. コンポーネント構成図

```
Main Process (Electron)
├── EnvironmentService (Facade - エントリポイント)
│   ├── ContentExtractor (コードブロック抽出)
│   ├── ContentSanitizer (HTML安全化)
│   └── TempFileManager (一時ファイル管理)
└── IPC Handlers (Renderer通信)
    └── agentHandlers.ts (registerEnvironmentHandlers)
```

## 統合テスト連携【必須】

統合ポイント/契約（IPC・型定義）を設計に反映する:

| 統合ポイント        | 契約定義                          |
| ------------------- | --------------------------------- |
| Main→Renderer (IPC) | PreviewContent型での返却          |
| Renderer→Main (IPC) | text, executionIdパラメータ       |
| サービス間          | ExtractedContent→SanitizedContent |

## 成果物

| 成果物               | パス                                     | 説明         |
| -------------------- | ---------------------------------------- | ------------ |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | システム構造 |
| 型定義設計書         | `outputs/phase-2/type-definitions.md`    | 型定義詳細   |
| IPC設計書            | `outputs/phase-2/ipc-design.md`          | IPC設計      |

## 完了条件

- [ ] 型定義（ContentType、ExtractedContent、SanitizedContent、PreviewContent）が完成している
- [ ] クラス設計（4サービス）が完成している
- [ ] IPC設計（3チャネル）が完成している
- [ ] セキュリティ設計（DOMPurify設定）が完成している
- [ ] コンポーネント構成図が作成されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 型定義設計
3. ContentExtractor設計
4. ContentSanitizer設計
5. TempFileManager設計
6. EnvironmentService設計
7. IPC設計
8. 統合テスト連携の記載
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
