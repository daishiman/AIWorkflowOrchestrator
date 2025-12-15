# チャンキング戦略実装 - タスク指示書

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | CONV-06-01                           |
| タスク名     | チャンキング戦略実装                 |
| 親タスク     | CONV-06 (埋め込み生成パイプライン)   |
| 依存タスク   | CONV-04-03 (content_chunks テーブル) |
| 規模         | 中                                   |
| 見積もり工数 | 1日                                  |
| ステータス   | 未実施                               |

---

## 1. 目的

変換されたドキュメントを適切なサイズのチャンクに分割する戦略サービスを実装する。複数のチャンキング戦略（fixed, sentence, semantic, hierarchical, late）をサポートし、ドキュメントタイプに応じて最適な戦略を選択できるようにする。

---

## 2. 成果物

- `packages/shared/src/services/chunking/chunking-service.ts`
- `packages/shared/src/services/chunking/strategies/fixed-size-strategy.ts`
- `packages/shared/src/services/chunking/strategies/sentence-strategy.ts`
- `packages/shared/src/services/chunking/strategies/semantic-strategy.ts`
- `packages/shared/src/services/chunking/strategies/hierarchical-strategy.ts`
- `packages/shared/src/services/chunking/types.ts`
- `packages/shared/src/services/chunking/__tests__/chunking-service.test.ts`

---

## 3. 入力

- 変換後のドキュメントコンテンツ（プレーンテキスト or Markdown）
- チャンキングオプション（戦略、トークン数、オーバーラップ）
- ドキュメントメタデータ（タイトル、ファイルタイプ）

---

## 4. 出力

```typescript
// packages/shared/src/services/chunking/types.ts
import { z } from "zod";
import type { ChunkId, ConversionId } from "@/types/branded";

export const chunkingStrategySchema = z.enum([
  "fixed_size",
  "sentence",
  "semantic",
  "hierarchical",
  "late",
]);
export type ChunkingStrategy = z.infer<typeof chunkingStrategySchema>;

export const chunkingOptionsSchema = z.object({
  strategy: chunkingStrategySchema,
  targetTokens: z.number().min(64).max(2048).default(512),
  maxTokens: z.number().min(128).max(4096).default(1024),
  overlapTokens: z.number().min(0).max(512).default(50),
  overlapPercent: z.number().min(0).max(50).optional(),
  preserveHeaders: z.boolean().default(true),
  preserveCodeBlocks: z.boolean().default(true),
  minChunkTokens: z.number().min(16).default(64),
});
export type ChunkingOptions = z.infer<typeof chunkingOptionsSchema>;

export interface ContentChunk {
  id: ChunkId;
  conversionId: ConversionId;
  index: number;
  content: string;
  tokenCount: number;
  startPosition: number;
  endPosition: number;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  headings?: string[];
  isCodeBlock?: boolean;
  language?: string;
  parentChunkId?: ChunkId;
  level?: number; // hierarchical用
}

export interface ChunkingResult {
  chunks: ContentChunk[];
  totalTokens: number;
  strategy: ChunkingStrategy;
  processingTimeMs: number;
}
```

---

## 5. 実装仕様

### 5.1 チャンキングサービスインターフェース

```typescript
// packages/shared/src/services/chunking/chunking-service.ts
import type { Result } from "@/types/result";

export interface IChunkingService {
  /**
   * ドキュメントをチャンクに分割
   */
  chunk(
    content: string,
    conversionId: ConversionId,
    options: ChunkingOptions,
  ): Promise<Result<ChunkingResult, Error>>;

  /**
   * ドキュメントタイプに応じた推奨オプションを取得
   */
  getRecommendedOptions(
    mimeType: string,
    contentLength: number,
  ): ChunkingOptions;

  /**
   * トークン数を推定
   */
  estimateTokenCount(text: string): number;
}
```

### 5.2 チャンキング戦略インターフェース

```typescript
// packages/shared/src/services/chunking/strategies/base-strategy.ts
export interface IChunkingStrategy {
  readonly name: ChunkingStrategy;

  chunk(content: string, options: ChunkingOptions): ContentChunk[];
}
```

### 5.3 固定サイズ戦略

```typescript
// packages/shared/src/services/chunking/strategies/fixed-size-strategy.ts
export class FixedSizeStrategy implements IChunkingStrategy {
  readonly name = "fixed_size" as const;

  constructor(private readonly tokenizer: ITokenizer) {}

  chunk(content: string, options: ChunkingOptions): ContentChunk[] {
    const chunks: ContentChunk[] = [];
    const tokens = this.tokenizer.encode(content);

    let position = 0;
    let index = 0;

    while (position < tokens.length) {
      const endPosition = Math.min(
        position + options.targetTokens,
        tokens.length,
      );

      const chunkTokens = tokens.slice(position, endPosition);
      const chunkContent = this.tokenizer.decode(chunkTokens);

      chunks.push({
        id: generateChunkId(),
        conversionId: "" as ConversionId, // 呼び出し側で設定
        index,
        content: chunkContent,
        tokenCount: chunkTokens.length,
        startPosition: position,
        endPosition,
        metadata: {},
      });

      // オーバーラップを考慮して次の開始位置を設定
      position = endPosition - options.overlapTokens;
      index++;
    }

    return chunks;
  }
}
```

### 5.4 文単位戦略

```typescript
// packages/shared/src/services/chunking/strategies/sentence-strategy.ts
export class SentenceStrategy implements IChunkingStrategy {
  readonly name = "sentence" as const;

  private readonly sentenceRegex = /[.!?。！？]\s+/g;

  constructor(private readonly tokenizer: ITokenizer) {}

  chunk(content: string, options: ChunkingOptions): ContentChunk[] {
    const sentences = this.splitIntoSentences(content);
    const chunks: ContentChunk[] = [];

    let currentChunk: string[] = [];
    let currentTokenCount = 0;
    let index = 0;
    let startPosition = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.tokenizer.encode(sentence).length;

      if (currentTokenCount + sentenceTokens > options.targetTokens) {
        if (currentChunk.length > 0) {
          const chunkContent = currentChunk.join(" ");
          chunks.push({
            id: generateChunkId(),
            conversionId: "" as ConversionId,
            index,
            content: chunkContent,
            tokenCount: currentTokenCount,
            startPosition,
            endPosition: startPosition + chunkContent.length,
            metadata: {},
          });
          index++;
          startPosition += chunkContent.length;
        }

        // オーバーラップ: 最後の1-2文を次のチャンクに含める
        const overlapSentences = currentChunk.slice(-2);
        currentChunk = [...overlapSentences, sentence];
        currentTokenCount = this.tokenizer.encode(
          currentChunk.join(" "),
        ).length;
      } else {
        currentChunk.push(sentence);
        currentTokenCount += sentenceTokens;
      }
    }

    // 残りのチャンクを追加
    if (currentChunk.length > 0) {
      const chunkContent = currentChunk.join(" ");
      chunks.push({
        id: generateChunkId(),
        conversionId: "" as ConversionId,
        index,
        content: chunkContent,
        tokenCount: currentTokenCount,
        startPosition,
        endPosition: startPosition + chunkContent.length,
        metadata: {},
      });
    }

    return chunks;
  }

  private splitIntoSentences(content: string): string[] {
    return content.split(this.sentenceRegex).filter((s) => s.trim().length > 0);
  }
}
```

### 5.5 セマンティック戦略（Markdown見出しベース）

```typescript
// packages/shared/src/services/chunking/strategies/semantic-strategy.ts
export class SemanticStrategy implements IChunkingStrategy {
  readonly name = "semantic" as const;

  private readonly headingRegex = /^(#{1,6})\s+(.+)$/gm;

  constructor(private readonly tokenizer: ITokenizer) {}

  chunk(content: string, options: ChunkingOptions): ContentChunk[] {
    const sections = this.splitBySections(content);
    const chunks: ContentChunk[] = [];
    let index = 0;

    for (const section of sections) {
      const sectionChunks = this.chunkSection(section, options, index);
      chunks.push(...sectionChunks);
      index += sectionChunks.length;
    }

    return chunks;
  }

  private splitBySections(content: string): Section[] {
    const sections: Section[] = [];
    const lines = content.split("\n");

    let currentSection: Section = {
      headings: [],
      content: [],
      level: 0,
    };

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        // 現在のセクションを保存
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }

        // 新しいセクションを開始
        currentSection = {
          headings: [headingMatch[2]],
          content: [],
          level: headingMatch[1].length,
        };
      } else {
        currentSection.content.push(line);
      }
    }

    // 最後のセクションを保存
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  private chunkSection(
    section: Section,
    options: ChunkingOptions,
    startIndex: number,
  ): ContentChunk[] {
    const sectionContent = section.content.join("\n");
    const tokenCount = this.tokenizer.encode(sectionContent).length;

    // セクションがtargetTokens以下なら1チャンクとして返す
    if (tokenCount <= options.targetTokens) {
      return [
        {
          id: generateChunkId(),
          conversionId: "" as ConversionId,
          index: startIndex,
          content: sectionContent,
          tokenCount,
          startPosition: 0,
          endPosition: sectionContent.length,
          metadata: {
            headings: section.headings,
            level: section.level,
          },
        },
      ];
    }

    // 大きいセクションは文単位で分割
    const sentenceStrategy = new SentenceStrategy(this.tokenizer);
    const subChunks = sentenceStrategy.chunk(sectionContent, options);

    // メタデータを追加
    return subChunks.map((chunk, i) => ({
      ...chunk,
      index: startIndex + i,
      metadata: {
        ...chunk.metadata,
        headings: section.headings,
        level: section.level,
      },
    }));
  }
}

interface Section {
  headings: string[];
  content: string[];
  level: number;
}
```

### 5.6 階層チャンキング戦略

```typescript
// packages/shared/src/services/chunking/strategies/hierarchical-strategy.ts
export class HierarchicalStrategy implements IChunkingStrategy {
  readonly name = "hierarchical" as const;

  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly config: {
      parentTargetTokens: number; // 1024
      childTargetTokens: number; // 256
    } = { parentTargetTokens: 1024, childTargetTokens: 256 },
  ) {}

  chunk(content: string, options: ChunkingOptions): ContentChunk[] {
    const allChunks: ContentChunk[] = [];

    // 1. 親チャンクを生成（大きなセクション）
    const parentOptions = {
      ...options,
      targetTokens: this.config.parentTargetTokens,
    };
    const semanticStrategy = new SemanticStrategy(this.tokenizer);
    const parentChunks = semanticStrategy.chunk(content, parentOptions);

    // 2. 各親チャンクに対して子チャンクを生成
    for (const parentChunk of parentChunks) {
      // 親チャンクを追加
      parentChunk.metadata.level = 0;
      allChunks.push(parentChunk);

      // 子チャンクを生成
      const childOptions = {
        ...options,
        targetTokens: this.config.childTargetTokens,
      };
      const childChunks = new SentenceStrategy(this.tokenizer).chunk(
        parentChunk.content,
        childOptions,
      );

      // 子チャンクにメタデータを設定
      for (const childChunk of childChunks) {
        childChunk.metadata.parentChunkId = parentChunk.id;
        childChunk.metadata.level = 1;
        allChunks.push(childChunk);
      }
    }

    // インデックスを再設定
    return allChunks.map((chunk, index) => ({
      ...chunk,
      index,
    }));
  }
}
```

### 5.7 チャンキングサービス実装

```typescript
// packages/shared/src/services/chunking/chunking-service.ts
export class ChunkingService implements IChunkingService {
  private readonly strategies: Map<ChunkingStrategy, IChunkingStrategy>;

  constructor(private readonly tokenizer: ITokenizer) {
    this.strategies = new Map([
      ["fixed_size", new FixedSizeStrategy(tokenizer)],
      ["sentence", new SentenceStrategy(tokenizer)],
      ["semantic", new SemanticStrategy(tokenizer)],
      ["hierarchical", new HierarchicalStrategy(tokenizer)],
    ]);
  }

  async chunk(
    content: string,
    conversionId: ConversionId,
    options: ChunkingOptions,
  ): Promise<Result<ChunkingResult, Error>> {
    const startTime = performance.now();

    const strategy = this.strategies.get(options.strategy);
    if (!strategy) {
      return err(new Error(`Unknown strategy: ${options.strategy}`));
    }

    try {
      const chunks = strategy.chunk(content, options);

      // conversionIdを設定
      const finalChunks = chunks.map((chunk) => ({
        ...chunk,
        conversionId,
      }));

      // 最小トークン数未満のチャンクをフィルタリング
      const filteredChunks = finalChunks.filter(
        (chunk) => chunk.tokenCount >= options.minChunkTokens,
      );

      const totalTokens = filteredChunks.reduce(
        (sum, chunk) => sum + chunk.tokenCount,
        0,
      );

      return ok({
        chunks: filteredChunks,
        totalTokens,
        strategy: options.strategy,
        processingTimeMs: performance.now() - startTime,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Chunking failed"));
    }
  }

  getRecommendedOptions(
    mimeType: string,
    contentLength: number,
  ): ChunkingOptions {
    // ドキュメントタイプに応じた推奨設定
    const recommendations: Record<string, Partial<ChunkingOptions>> = {
      "text/markdown": {
        strategy: "semantic",
        targetTokens: 512,
        preserveHeaders: true,
      },
      "text/plain": {
        strategy: "sentence",
        targetTokens: 512,
      },
      "application/json": {
        strategy: "fixed_size",
        targetTokens: 256,
      },
      "text/x-typescript": {
        strategy: "semantic",
        targetTokens: 512,
        preserveCodeBlocks: true,
      },
    };

    const baseOptions: ChunkingOptions = {
      strategy: "sentence",
      targetTokens: 512,
      maxTokens: 1024,
      overlapTokens: 50,
      preserveHeaders: true,
      preserveCodeBlocks: true,
      minChunkTokens: 64,
    };

    const typeOptions = recommendations[mimeType] ?? {};

    // 大きなドキュメントは階層チャンキングを推奨
    if (contentLength > 50000) {
      typeOptions.strategy = "hierarchical";
    }

    return { ...baseOptions, ...typeOptions };
  }

  estimateTokenCount(text: string): number {
    return this.tokenizer.encode(text).length;
  }
}
```

---

## 6. テストケース

```typescript
describe("ChunkingService", () => {
  describe("fixed_size strategy", () => {
    it("指定トークン数でチャンクを分割する", async () => {
      const service = new ChunkingService(mockTokenizer);
      const result = await service.chunk(longContent, conversionId, {
        strategy: "fixed_size",
        targetTokens: 100,
        overlapTokens: 10,
      });
      expect(result.success).toBe(true);
      expect(result.data.chunks.every((c) => c.tokenCount <= 100)).toBe(true);
    });

    it("オーバーラップが正しく適用される", async () => {
      const service = new ChunkingService(mockTokenizer);
      const result = await service.chunk(longContent, conversionId, {
        strategy: "fixed_size",
        targetTokens: 100,
        overlapTokens: 20,
      });
      // オーバーラップ部分が重複していることを確認
      // ...
    });
  });

  describe("sentence strategy", () => {
    it("文単位でチャンクを分割する", async () => {
      const content = "First sentence. Second sentence. Third sentence.";
      const service = new ChunkingService(mockTokenizer);
      const result = await service.chunk(content, conversionId, {
        strategy: "sentence",
        targetTokens: 20,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("semantic strategy", () => {
    it("Markdown見出しでセクションを分割する", async () => {
      const markdown = `# Title\nContent 1\n## Section\nContent 2`;
      const service = new ChunkingService(mockTokenizer);
      const result = await service.chunk(markdown, conversionId, {
        strategy: "semantic",
        targetTokens: 512,
      });
      expect(result.success).toBe(true);
      expect(result.data.chunks[0].metadata.headings).toContain("Title");
    });
  });

  describe("hierarchical strategy", () => {
    it("親子関係のチャンクが生成される", async () => {
      const service = new ChunkingService(mockTokenizer);
      const result = await service.chunk(longContent, conversionId, {
        strategy: "hierarchical",
        targetTokens: 512,
      });
      expect(result.success).toBe(true);

      const parentChunks = result.data.chunks.filter(
        (c) => c.metadata.level === 0,
      );
      const childChunks = result.data.chunks.filter(
        (c) => c.metadata.level === 1,
      );

      expect(parentChunks.length).toBeGreaterThan(0);
      expect(childChunks.length).toBeGreaterThan(0);
      expect(
        childChunks.every((c) => c.metadata.parentChunkId !== undefined),
      ).toBe(true);
    });
  });

  describe("getRecommendedOptions", () => {
    it("Markdownにはsemantic戦略を推奨する", () => {
      const service = new ChunkingService(mockTokenizer);
      const options = service.getRecommendedOptions("text/markdown", 1000);
      expect(options.strategy).toBe("semantic");
    });

    it("大きなドキュメントにはhierarchical戦略を推奨する", () => {
      const service = new ChunkingService(mockTokenizer);
      const options = service.getRecommendedOptions("text/plain", 100000);
      expect(options.strategy).toBe("hierarchical");
    });
  });
});
```

---

## 7. 完了条件

- [ ] `ChunkingService`クラスが実装済み
- [ ] `FixedSizeStrategy`が動作する
- [ ] `SentenceStrategy`が動作する
- [ ] `SemanticStrategy`が動作する（Markdown見出し対応）
- [ ] `HierarchicalStrategy`が動作する（親子チャンク）
- [ ] オーバーラップ処理が正しく動作する
- [ ] トークン数推定が動作する
- [ ] 推奨オプション取得が動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-06-02: 埋め込みプロバイダー抽象化

---

## 9. 参照情報

- CONV-04-03: content_chunks テーブル
- CONV-06: 埋め込み生成パイプライン（親タスク）
- [Best Chunking Strategies for RAG 2025](https://www.firecrawl.dev/blog/best-chunking-strategies-rag-2025)
- [NVIDIA Chunking Benchmark](https://developer.nvidia.com/blog/finding-the-best-chunking-strategy-for-accurate-ai-responses/)

---

## 10. チャンキング設定ガイドライン

| ドキュメントタイプ   | 推奨戦略     | トークン数    | オーバーラップ |
| -------------------- | ------------ | ------------- | -------------- |
| 技術文書・マニュアル | hierarchical | 親1024, 子256 | 親子連携       |
| 一般記事・ブログ     | semantic     | 256-512       | 10-20%         |
| FAQ・Q&A             | sentence     | 文単位        | 1-2文          |
| コード・設定ファイル | fixed        | 512           | 50トークン     |
