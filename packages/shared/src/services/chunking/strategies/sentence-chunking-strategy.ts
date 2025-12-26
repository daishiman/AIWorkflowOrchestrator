/**
 * 文単位チャンキング戦略
 *
 * @description 文境界を尊重してテキストを分割し、意味的なまとまりを保持
 */

import { BaseChunkingStrategy } from "./base-chunking-strategy";
import { ValidationError } from "../errors";
import type {
  ChunkingStrategy,
  ChunkingOptions,
  SentenceChunkingOptions,
  Chunk,
} from "../types";
import type { ITokenizer } from "../interfaces";

/**
 * 文単位チャンキング戦略
 *
 * アルゴリズム:
 * 1. テキストを文に分割
 * 2. targetChunkSizeに収まるように文をグループ化
 * 3. maxChunkSizeを超えないように調整
 * 4. sentenceOverlap分の文を重複させる
 */
export class SentenceChunkingStrategy extends BaseChunkingStrategy {
  readonly name: ChunkingStrategy = "sentence";

  constructor(tokenizer: ITokenizer) {
    super(tokenizer);
  }

  async chunk(text: string, options: ChunkingOptions): Promise<Chunk[]> {
    const opts = options as SentenceChunkingOptions;
    this.validateOptions(opts);

    // 空テキストの場合
    if (text.length === 0) {
      return [];
    }

    // デフォルト値の適用
    const targetChunkSize = opts.targetChunkSize ?? opts.chunkSize ?? 512;
    const maxChunkSize = opts.maxChunkSize ?? targetChunkSize * 1.5;
    const sentenceOverlap = opts.sentenceOverlap ?? 0;
    const sentenceDelimiters = opts.sentenceDelimiters ?? [
      ".",
      "!",
      "?",
      "。",
      "！",
      "？",
    ];

    // 文に分割
    const sentences = this.splitIntoSentences(text, sentenceDelimiters);

    if (sentences.length === 0) {
      return [];
    }

    const chunks: Chunk[] = [];
    let currentSentences: { text: string; start: number; end: number }[] = [];
    let currentTokenCount = 0;
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokenCount = this.tokenizer.countTokens(sentence.text);

      // 単一文がmaxChunkSizeを超える場合
      if (sentenceTokenCount > maxChunkSize && currentSentences.length === 0) {
        // 長い文を単独チャンクとして追加（警告付き）
        console.warn(
          `Sentence exceeds maxChunkSize: ${sentenceTokenCount} tokens`,
        );

        const chunk = this.createChunk(
          this.generateChunkId("doc", chunkIndex),
          sentence.text,
          { start: sentence.start, end: sentence.end },
          {
            strategy: this.name,
          },
        );

        chunks.push(chunk);
        chunkIndex++;
        continue;
      }

      // targetChunkSizeを超える場合はチャンクを確定
      if (
        currentTokenCount + sentenceTokenCount > targetChunkSize &&
        currentSentences.length > 0
      ) {
        const chunk = this.createChunkFromSentences(
          currentSentences,
          chunkIndex,
          sentenceOverlap > 0 && chunkIndex > 0 ? sentenceOverlap : 0,
        );
        chunks.push(chunk);
        chunkIndex++;

        // オーバーラップ分の文を保持
        if (sentenceOverlap > 0) {
          currentSentences = currentSentences.slice(-sentenceOverlap);
          currentTokenCount = this.countTokensForSentences(currentSentences);
        } else {
          currentSentences = [];
          currentTokenCount = 0;
        }
      }

      currentSentences.push(sentence);
      currentTokenCount += sentenceTokenCount;
    }

    // 残りのチャンクを追加
    if (currentSentences.length > 0) {
      const chunk = this.createChunkFromSentences(
        currentSentences,
        chunkIndex,
        sentenceOverlap > 0 && chunkIndex > 0 ? sentenceOverlap : 0,
      );
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * テキストを文に分割
   */
  private splitIntoSentences(
    text: string,
    delimiters: string[],
  ): { text: string; start: number; end: number }[] {
    const sentences: { text: string; start: number; end: number }[] = [];
    let currentStart = 0;
    let currentSentence = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      currentSentence += char;

      // デリミタをチェック
      if (delimiters.includes(char)) {
        // 次の文字が空白、改行、または終端の場合、文の終わりとみなす
        const nextChar = text[i + 1];
        if (
          nextChar === undefined ||
          nextChar === " " ||
          nextChar === "\n" ||
          nextChar === "\r" ||
          nextChar === "\t"
        ) {
          const trimmed = currentSentence.trim();
          if (trimmed.length > 0) {
            // 実際の開始位置を見つける（先頭の空白をスキップ）
            let actualStart = currentStart;
            while (actualStart < i && /\s/.test(text[actualStart])) {
              actualStart++;
            }
            sentences.push({
              text: trimmed,
              start: actualStart,
              end: i + 1,
            });
          }
          currentStart = i + 1;
          currentSentence = "";
        }
      }
    }

    // 残りのテキストがあれば追加
    const remaining = currentSentence.trim();
    if (remaining.length > 0) {
      let actualStart = currentStart;
      while (actualStart < text.length && /\s/.test(text[actualStart])) {
        actualStart++;
      }
      sentences.push({
        text: remaining,
        start: actualStart,
        end: text.length,
      });
    }

    return sentences;
  }

  /**
   * 文配列からチャンクを作成
   */
  private createChunkFromSentences(
    sentences: { text: string; start: number; end: number }[],
    chunkIndex: number,
    overlapSentences: number,
  ): Chunk {
    const content = sentences.map((s) => s.text).join(" ");
    const start = sentences[0].start;
    const end = sentences[sentences.length - 1].end;

    return this.createChunk(
      this.generateChunkId("doc", chunkIndex),
      content,
      { start, end },
      {
        strategy: this.name,
        overlap:
          chunkIndex > 0
            ? {
                previous: overlapSentences,
                next: 0,
              }
            : undefined,
      },
    );
  }

  /**
   * 文のリストのトークン数を計算
   */
  private countTokensForSentences(
    sentences: { text: string; start: number; end: number }[],
  ): number {
    const text = sentences.map((s) => s.text).join(" ");
    return this.tokenizer.countTokens(text);
  }

  validateOptions(options: ChunkingOptions): void {
    const opts = options as SentenceChunkingOptions;

    const targetChunkSize = opts.targetChunkSize ?? opts.chunkSize;

    if (targetChunkSize !== undefined && targetChunkSize <= 0) {
      throw new ValidationError("targetChunkSize must be positive");
    }

    if (opts.maxChunkSize !== undefined) {
      if (opts.maxChunkSize <= 0) {
        throw new ValidationError("maxChunkSize must be positive");
      }
      if (
        targetChunkSize !== undefined &&
        opts.maxChunkSize < targetChunkSize
      ) {
        throw new ValidationError("maxChunkSize must be >= targetChunkSize");
      }
    }

    if (opts.sentenceOverlap !== undefined) {
      if (opts.sentenceOverlap < 0 || opts.sentenceOverlap > 5) {
        throw new ValidationError("sentenceOverlap must be between 0 and 5");
      }
    }
  }

  getDefaultOptions(): SentenceChunkingOptions {
    return {
      chunkSize: 512,
      targetChunkSize: 512,
      maxChunkSize: 768,
      sentenceOverlap: 1,
      sentenceDelimiters: [".", "!", "?", "。", "！", "？"],
      preserveParagraphs: true,
    };
  }
}
