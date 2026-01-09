# 実行環境管理バックエンド - タスク指示書

## メタ情報

| 項目         | 内容                     |
| ------------ | ------------------------ |
| タスクID     | AGENT-007                |
| タスク名     | 実行環境管理バックエンド |
| 分類         | 要件                     |
| 対象機能     | エージェント機能         |
| 優先度       | 中                       |
| 見積もり規模 | 中規模                   |
| ステータス   | 未実施                   |
| 発見元       | ユーザー要求             |
| 発見日       | 2026-01-09               |

---

## 依存関係と並行実行

### 依存関係マップ

```
task-agent-01-dashboard-foundation.md (AGENT-001)
    │
    ├──► task-agent-02-skill-management-ui.md (AGENT-002) ─┐
    │                                                      │
    └──► task-agent-03-skill-management-backend.md ────────┼──► task-agent-04-execution-ui.md
         (AGENT-003) ※02と並行可能                         │    (AGENT-004)
                │                                          │
                └──► task-agent-05-claude-code-integration ┘    ※04と並行可能
                     (AGENT-005) ※04と並行可能
                          │
                          └──► task-agent-06-custom-environment-ui.md (AGENT-006)
                                    │
                                    └──► task-agent-07-environment-backend.md (AGENT-007/本タスク)
                                         ※06と並行可能
```

### 本タスクの位置づけ

| 項目                     | 内容                            |
| ------------------------ | ------------------------------- |
| 直接依存                 | AGENT-005（Claude Code統合）    |
| 並行実行可能             | AGENT-006（カスタム実行環境UI） |
| 本タスク完了後に開始可能 | なし（最終タスク）              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

カスタム実行環境（HTMLプレビュー等）をサポートするために、エージェント出力からプレビュー用コンテンツを抽出・管理するバックエンド機能が必要。エージェントがHTMLを生成した場合、それを安全にRendererに転送しプレビュー表示できるようにする。

### 1.2 問題点・課題

- エージェント出力からHTML/Markdownコンテンツを抽出する機能がない
- コンテンツをサニタイズして安全に転送する仕組みがない
- 一時ファイルとしてコンテンツを保存・管理する機能がない

### 1.3 放置した場合の影響

- カスタム実行環境UI（AGENT-006）が完全に機能しない
- HTMLプレビュー等の価値提案が実現できない

---

## 2. 何を達成するか（What）

### 2.1 目的

エージェント出力からプレビュー用コンテンツを抽出し、安全にRendererへ転送するバックエンド機能を実装する。

### 2.2 最終ゴール

- エージェント出力からコードブロック（HTML、Markdown等）を抽出できる
- 抽出したコンテンツをサニタイズして安全に転送できる
- 一時ファイルとしてコンテンツを保存できる
- IPC経由でプレビュー用コンテンツを取得できる

### 2.3 スコープ

#### 含むもの

- ContentExtractorサービス（コードブロック抽出）
- ContentSanitizerサービス（セキュリティ処理）
- TempFileManagerサービス（一時ファイル管理）
- agentHandlers拡張
- IPCチャネル追加

#### 含まないもの

- フロントエンドUI（別タスク: AGENT-006）
- コード実行サンドボックス（将来タスク）

### 2.4 成果物

| 成果物             | パス                                                               |
| ------------------ | ------------------------------------------------------------------ |
| ContentExtractor   | `apps/desktop/src/main/services/environment/ContentExtractor.ts`   |
| ContentSanitizer   | `apps/desktop/src/main/services/environment/ContentSanitizer.ts`   |
| TempFileManager    | `apps/desktop/src/main/services/environment/TempFileManager.ts`    |
| EnvironmentService | `apps/desktop/src/main/services/environment/EnvironmentService.ts` |
| agentHandlers更新  | `apps/desktop/src/main/ipc/agentHandlers.ts`                       |
| IPCチャネル更新    | `apps/desktop/src/preload/channels.ts`                             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AGENT-005（Claude Code統合）が完了している
- セキュリティ要件を理解している

### 3.2 依存タスク

- AGENT-005: Claude Code統合

### 3.3 必要な知識・スキル

- Node.js / TypeScript
- HTML/Markdownパース
- セキュリティ（XSS対策）
- ファイルシステム操作

### 3.4 推奨アプローチ

1. 型定義を追加
2. ContentExtractorを実装（Markdown解析）
3. ContentSanitizerを実装（HTML安全化）
4. TempFileManagerを実装
5. EnvironmentServiceで統合
6. agentHandlersを拡張

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従って実装する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                    | パス                                                  | 選定理由                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| acceptance-criteria-writing | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式で受け入れ基準を定義 |

#### 受け入れ基準（Given-When-Then）

````gherkin
Feature: 実行環境管理バックエンド

Scenario: HTMLコードブロックを抽出できる
  Given エージェント出力に以下が含まれる:
    ```html
    <div>Hello World</div>
    ```
  When ContentExtractorで処理する
  Then HTML部分が抽出される
  And タイプが "html" と判定される

Scenario: 複数のコードブロックを抽出できる
  Given エージェント出力に複数のコードブロックがある
  When ContentExtractorで処理する
  Then すべてのコードブロックが抽出される
  And 各コードブロックに順序番号が付与される

Scenario: HTMLがサニタイズされる
  Given 抽出されたHTMLに<script>タグが含まれる
  When ContentSanitizerで処理する
  Then <script>タグが除去される
  And onclick等のイベントハンドラが除去される

Scenario: 一時ファイルとして保存できる
  Given 抽出されたコンテンツがある
  When TempFileManagerで保存する
  Then 一時ディレクトリにファイルが作成される
  And ファイルパスが返される

Scenario: 一時ファイルが適切にクリーンアップされる
  Given 一時ファイルが作成されている
  When アプリケーションが終了する
  Then 一時ファイルが削除される

Scenario: IPC経由でプレビューコンテンツを取得できる
  Given エージェント出力が処理済みである
  When agent:get-preview-contentを呼び出す
  Then 抽出・サニタイズ済みのコンテンツが返される
````

#### 成果物

- `outputs/phase-1/requirements.md`

#### 完了条件

- [ ] 受け入れ基準がGiven-When-Then形式で定義されている
- [ ] セキュリティ要件が明確化されている

---

### Phase 2: 設計

#### 使用スキル

| スキル名        | パス                                      | 選定理由             |
| --------------- | ----------------------------------------- | -------------------- |
| domain-modeling | `.claude/skills/domain-modeling/SKILL.md` | コンテンツモデル設計 |

#### 設計内容

**1. 型定義**

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

**2. ContentExtractor設計**

````typescript
// ContentExtractor.ts
export class ContentExtractor {
  // Markdownコードブロックを抽出
  // ```html ... ``` 形式を検出
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

  // 最後のHTML/Markdownブロックを取得（プレビュー用）
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

**3. ContentSanitizer設計**

```typescript
// ContentSanitizer.ts
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
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
      FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover"],
      ALLOW_DATA_ATTR: false,
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

**4. TempFileManager設計**

```typescript
// TempFileManager.ts
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

    await fs.writeFile(filepath, content.sanitizedContent, "utf-8");
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

**5. IPCチャネル定義**

```typescript
// channels.ts に追加
AGENT_EXTRACT_CONTENT: "agent:extract-content",
AGENT_GET_PREVIEW_CONTENT: "agent:get-preview-content",
AGENT_CLEANUP_TEMP_FILES: "agent:cleanup-temp-files",
```

**6. agentHandlers拡張**

```typescript
// agentHandlers.ts に追加
export function registerEnvironmentHandlers(
  environmentService: EnvironmentService,
): void {
  ipcMain.handle(IPC_CHANNELS.AGENT_EXTRACT_CONTENT, async (_e, { text }) => {
    return environmentService.extractAndSanitize(text);
  });

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

#### 成果物

- `outputs/phase-2/design.md`

#### 完了条件

- [ ] 型定義が完成している
- [ ] クラス設計が完成している
- [ ] セキュリティ設計が完成している

---

### Phase 3: 設計レビューゲート

#### 使用スキル

| スキル名             | パス                                           | 選定理由         |
| -------------------- | ---------------------------------------------- | ---------------- |
| code-smell-detection | `.claude/skills/code-smell-detection/SKILL.md` | 設計品質チェック |

#### セキュリティレビュー項目

- [ ] XSS対策が適切
- [ ] 一時ファイルのパーミッション
- [ ] クリーンアップの確実性

#### 完了条件

- [ ] セキュリティレビューが完了している
- [ ] 既存パターンと整合している

---

### Phase 4: テスト作成

#### 使用スキル

| スキル名       | パス                                     | 選定理由        |
| -------------- | ---------------------------------------- | --------------- |
| tdd-principles | `.claude/skills/tdd-principles/SKILL.md` | TDDでテスト先行 |

#### テストケース

```typescript
// ContentExtractor.test.ts
describe("ContentExtractor", () => {
  it("should extract html code block", () => {});
  it("should extract markdown code block", () => {});
  it("should extract multiple code blocks", () => {});
  it("should handle code blocks without language", () => {});
  it("should return empty array for text without code blocks", () => {});
  it("should detect content type correctly", () => {});
});

// ContentSanitizer.test.ts
describe("ContentSanitizer", () => {
  it("should remove script tags", () => {});
  it("should remove onclick handlers", () => {});
  it("should remove iframe tags", () => {});
  it("should preserve safe html", () => {});
  it("should track removed elements", () => {});
  it("should pass through non-html content", () => {});
});

// TempFileManager.test.ts
describe("TempFileManager", () => {
  it("should create temp directory", async () => {});
  it("should save content to file", async () => {});
  it("should cleanup all files", async () => {});
  it("should cleanup specific file", async () => {});
  it("should use correct file extension", async () => {});
});

// EnvironmentService.test.ts
describe("EnvironmentService", () => {
  it("should extract and sanitize content", async () => {});
  it("should save preview content", async () => {});
  it("should retrieve preview content", async () => {});
});
```

#### 完了条件

- [ ] 各クラスのユニットテストがある
- [ ] セキュリティテストがある
- [ ] すべてのテストが失敗状態（Red）

---

### Phase 5: 実装

#### 使用スキル

| スキル名        | パス                                      | 選定理由     |
| --------------- | ----------------------------------------- | ------------ |
| domain-modeling | `.claude/skills/domain-modeling/SKILL.md` | サービス実装 |

#### 実装ファイル

1. `packages/shared/src/types/agent.ts`（更新）
2. `apps/desktop/src/main/services/environment/ContentExtractor.ts`
3. `apps/desktop/src/main/services/environment/ContentSanitizer.ts`
4. `apps/desktop/src/main/services/environment/TempFileManager.ts`
5. `apps/desktop/src/main/services/environment/EnvironmentService.ts`
6. `apps/desktop/src/main/services/environment/index.ts`
7. `apps/desktop/src/main/ipc/agentHandlers.ts`（更新）
8. `apps/desktop/src/preload/channels.ts`（更新）

#### 完了条件

- [ ] 全クラスが実装されている
- [ ] コンテンツ抽出が動作する
- [ ] サニタイズが動作する
- [ ] 一時ファイル管理が動作する
- [ ] テストがすべて通過（Green）

---

### Phase 6-13: 標準フロー

標準のPhase 6-13フローに従って実装を完了する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] HTMLコードブロックを抽出できる
- [ ] HTMLがサニタイズされる
- [ ] 一時ファイルとして保存できる
- [ ] IPC経由でプレビューコンテンツを取得できる
- [ ] 一時ファイルがクリーンアップされる

### セキュリティ要件

- [ ] XSS対策が実装されている
- [ ] 危険なタグ・属性が除去される
- [ ] 一時ファイルの権限が適切

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] TypeScript型エラーなし
- [ ] ESLint/Prettierエラーなし

### ドキュメント要件

- [ ] セキュリティ仕様が文書化されている
- [ ] 実装ガイドが作成されている

---

## 6. 検証方法

### テストケース

```bash
# ユニットテスト
pnpm --filter @repo/desktop test src/main/services/environment/
```

### 検証手順

1. エージェントでHTMLを生成させる
2. agent:extract-contentで抽出を確認
3. サニタイズ結果を確認（script除去等）
4. 一時ファイル保存を確認
5. アプリ終了後にファイルがクリーンアップされることを確認

### セキュリティ検証

```html
<!-- テスト用悪意のあるHTML -->
<script>
  alert("XSS");
</script>
<div onclick="alert('XSS')">Click</div>
<iframe src="https://evil.com"></iframe>
```

上記が除去されることを確認する。

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                               |
| -------------------- | ------ | -------- | ---------------------------------- |
| サニタイズ漏れ       | 高     | 低       | DOMPurify使用、テスト充実          |
| 一時ファイルの肥大化 | 中     | 中       | 定期クリーンアップ、サイズ制限     |
| ファイル残存         | 低     | 中       | アプリ終了時の確実なクリーンアップ |

---

## 8. 参照情報

### 関連ドキュメント

- [DOMPurify](https://github.com/cure53/DOMPurify)
- `apps/desktop/src/main/services/` - 既存サービス参照

### 参考資料

- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

## 9. 備考

### DOMPurify設定

```typescript
const config = {
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "base"],
  FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover", "onfocus"],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true,
};
```

### 一時ファイル管理

- ディレクトリ: `{app.getPath('temp')}/ai-workflow-orchestrator/`
- ファイル名: `preview-{uuid}.{ext}`
- 権限: 600 (owner read/write only)
- クリーンアップ: アプリ終了時 + 明示的呼び出し

### 将来の拡張

- コード実行サンドボックス（WebWorker + iframe）
- Mermaid/PlantUML変換
- PDF生成
