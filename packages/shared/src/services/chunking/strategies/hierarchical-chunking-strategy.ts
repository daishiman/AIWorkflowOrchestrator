/**
 * 階層チャンキング戦略
 *
 * @description ドキュメントの見出し構造を解析し、階層的にチャンクを作成
 */

import { BaseChunkingStrategy } from "./base-chunking-strategy";
import { ValidationError } from "../errors";
import type {
  ChunkingStrategy,
  ChunkingOptions,
  HierarchicalChunkingOptions,
  Chunk,
  HierarchicalChunk,
  HeadingPattern,
} from "../types";
import type { ITokenizer } from "../interfaces";

/**
 * 見出し情報
 */
interface Heading {
  level: number;
  title: string;
  position: number;
  content: string;
}

/**
 * 階層ノード
 */
interface HierarchyNode {
  level: number;
  title: string;
  content: string;
  position: number;
  children: HierarchyNode[];
}

/**
 * 階層チャンキング戦略
 *
 * アルゴリズム:
 * 1. 見出し構造を解析（Markdown: #, ##, ###...）
 * 2. 見出しレベルに基づき階層ツリーを構築
 * 3. 各ノードをチャンクに変換
 * 4. inheritParentContextがtrueなら親の見出しを含める
 */
export class HierarchicalChunkingStrategy extends BaseChunkingStrategy {
  readonly name: ChunkingStrategy = "hierarchical";

  constructor(tokenizer: ITokenizer) {
    super(tokenizer);
  }

  async chunk(text: string, options: ChunkingOptions): Promise<Chunk[]> {
    const opts = options as HierarchicalChunkingOptions;
    this.validateOptions(opts);

    // 空テキストの場合
    if (text.length === 0) {
      return [];
    }

    // デフォルト値の適用
    const targetChunkSize = opts.targetChunkSize ?? opts.chunkSize ?? 512;
    const maxDepth = opts.maxDepth ?? 3;
    const headingPatterns: HeadingPattern = opts.headingPatterns ?? {
      type: "markdown",
    };
    const inheritParentContext = opts.inheritParentContext ?? true;

    // 見出しを抽出
    const headings = this.extractHeadings(text, headingPatterns);

    // 見出しがない場合は全テキストを1つのチャンクにする
    if (headings.length === 0) {
      return [
        this.createChunk(
          this.generateChunkId("doc", 0),
          text,
          { start: 0, end: text.length },
          { strategy: this.name },
        ),
      ];
    }

    // 階層ツリーを構築
    const tree = this.buildHierarchyTree(headings, text, maxDepth);

    // ツリーをチャンクに変換
    const chunks = this.treeToChunks(
      tree,
      targetChunkSize,
      inheritParentContext,
    );

    return chunks;
  }

  /**
   * 見出しを抽出
   */
  private extractHeadings(text: string, patterns: HeadingPattern): Heading[] {
    const headings: Heading[] = [];

    if (patterns.type === "markdown") {
      // Markdown見出しパターン
      const markdownRegex = /^(#{1,6})\s+(.+)$/gm;
      let match;

      while ((match = markdownRegex.exec(text)) !== null) {
        const level = match[1].length;
        const title = match[2].trim();
        const position = match.index;

        headings.push({
          level,
          title,
          position,
          content: "",
        });
      }
    } else if (patterns.type === "html") {
      // HTML見出しパターン
      const htmlRegex = /<h([1-6])[^>]*>([^<]+)<\/h\1>/gi;
      let match;

      while ((match = htmlRegex.exec(text)) !== null) {
        const level = parseInt(match[1], 10);
        const title = match[2].trim();
        const position = match.index;

        headings.push({
          level,
          title,
          position,
          content: "",
        });
      }
    } else if (patterns.type === "custom" && patterns.customPattern) {
      // カスタムパターン
      const customRegex = patterns.customPattern;
      let match;

      while ((match = customRegex.exec(text)) !== null) {
        headings.push({
          level: 1, // カスタムパターンではレベル1固定
          title: match[0],
          position: match.index,
          content: "",
        });
      }
    }

    // 各見出しのコンテンツを抽出
    for (let i = 0; i < headings.length; i++) {
      const start = headings[i].position;
      const end =
        i < headings.length - 1 ? headings[i + 1].position : text.length;
      headings[i].content = text.substring(start, end).trim();
    }

    return headings;
  }

  /**
   * 階層ツリーを構築
   */
  private buildHierarchyTree(
    headings: Heading[],
    text: string,
    maxDepth: number,
  ): HierarchyNode {
    const root: HierarchyNode = {
      level: 0,
      title: "root",
      content: text,
      position: 0,
      children: [],
    };

    const stack: HierarchyNode[] = [root];

    for (const heading of headings) {
      const adjustedLevel = Math.min(heading.level, maxDepth);
      const node: HierarchyNode = {
        level: adjustedLevel,
        title: heading.title,
        content: heading.content,
        position: heading.position,
        children: [],
      };

      // 適切な親を見つける
      while (
        stack.length > 1 &&
        stack[stack.length - 1].level >= adjustedLevel
      ) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      parent.children.push(node);
      stack.push(node);
    }

    return root;
  }

  /**
   * ツリーをチャンクに変換
   */
  private treeToChunks(
    root: HierarchyNode,
    targetChunkSize: number,
    inheritParentContext: boolean,
  ): HierarchicalChunk[] {
    const chunks: HierarchicalChunk[] = [];
    let chunkIndex = 0;

    const traverse = (
      node: HierarchyNode,
      path: string[],
      parentId: string | null,
    ) => {
      const currentPath = node.title !== "root" ? [...path, node.title] : path;
      const chunkId = this.generateChunkId("doc", chunkIndex);

      // ノードのコンテンツをチャンキング
      const nodeChunks = this.chunkNodeContent(
        node,
        chunkId,
        currentPath,
        parentId,
        targetChunkSize,
        inheritParentContext,
      );

      chunkIndex += nodeChunks.length;
      chunks.push(...nodeChunks);

      // 子ノードの親IDを決定（最初のチャンクを親とする）
      const childParentId = nodeChunks.length > 0 ? nodeChunks[0].id : parentId;

      // 子ノードを再帰的に処理
      for (const child of node.children) {
        traverse(child, currentPath, childParentId);
      }
    };

    // ルートの子から開始
    for (const child of root.children) {
      traverse(child, [], null);
    }

    return chunks;
  }

  /**
   * ノードのコンテンツをチャンキング
   */
  private chunkNodeContent(
    node: HierarchyNode,
    baseChunkId: string,
    path: string[],
    parentId: string | null,
    targetChunkSize: number,
    inheritParentContext: boolean,
  ): HierarchicalChunk[] {
    const chunks: HierarchicalChunk[] = [];

    // コンテキストを含めるか
    let content = node.content;
    if (inheritParentContext && path.length > 1) {
      const context = path.slice(0, -1).join(" > ");
      content = `Context: ${context}\n\n${content}`;
    }

    const tokenCount = this.tokenizer.countTokens(content);

    // targetChunkSizeを超える場合は分割
    if (tokenCount > targetChunkSize) {
      // 段落または文で分割
      const subcontent = this.splitContent(content, targetChunkSize);

      subcontent.forEach((sub, index) => {
        const chunkId = `${baseChunkId}-${index}`;
        chunks.push({
          id: chunkId,
          content: sub,
          tokenCount: this.tokenizer.countTokens(sub),
          position: {
            start: node.position,
            end: node.position + content.length,
          },
          level: node.level,
          parentId,
          childIds: [],
          path,
          metadata: {
            strategy: this.name,
            hierarchyPath: path,
            heading: node.title,
            position: node.position,
          },
        });
      });
    } else {
      chunks.push({
        id: baseChunkId,
        content,
        tokenCount,
        position: {
          start: node.position,
          end: node.position + content.length,
        },
        level: node.level,
        parentId,
        childIds: [],
        path,
        metadata: {
          strategy: this.name,
          hierarchyPath: path,
          heading: node.title,
          position: node.position,
        },
      });
    }

    return chunks;
  }

  /**
   * コンテンツを分割
   */
  private splitContent(content: string, targetSize: number): string[] {
    // 段落で分割
    const paragraphs = content.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const para of paragraphs) {
      const combinedTokens = this.tokenizer.countTokens(
        currentChunk + "\n\n" + para,
      );

      if (combinedTokens > targetSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = para;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${para}` : para;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  validateOptions(options: ChunkingOptions): void {
    const opts = options as HierarchicalChunkingOptions;

    if (opts.maxDepth !== undefined) {
      if (opts.maxDepth < 1 || opts.maxDepth > 6) {
        throw new ValidationError("maxDepth must be between 1 and 6");
      }
    }

    if (opts.targetChunkSize !== undefined && opts.targetChunkSize <= 0) {
      throw new ValidationError("targetChunkSize must be positive");
    }
  }

  getDefaultOptions(): HierarchicalChunkingOptions {
    return {
      chunkSize: 512,
      targetChunkSize: 512,
      maxDepth: 3,
      headingPatterns: { type: "markdown" },
      inheritParentContext: true,
      createSummaryChunks: false,
    };
  }
}
