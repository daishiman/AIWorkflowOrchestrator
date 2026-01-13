/**
 * EnvironmentService - 実行環境管理ファサード
 * @module environment
 */

import type { PreviewContent } from "@repo/shared/types/agent";
import { ContentExtractor } from "./ContentExtractor";
import { ContentSanitizer } from "./ContentSanitizer";
import { TempFileManager } from "./TempFileManager";

/**
 * 実行環境管理サービス（Facadeパターン）
 */
export class EnvironmentService {
  /** コンテンツ抽出クラス */
  private readonly extractor: ContentExtractor;

  /** コンテンツサニタイズクラス */
  private readonly sanitizer: ContentSanitizer;

  /** 一時ファイル管理クラス */
  private readonly tempFileManager: TempFileManager;

  /** プレビューキャッシュ */
  private readonly previewCache: Map<string, PreviewContent> = new Map();

  constructor() {
    this.extractor = new ContentExtractor();
    this.sanitizer = new ContentSanitizer();
    this.tempFileManager = new TempFileManager();
  }

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    await this.tempFileManager.initialize();
  }

  /**
   * テキストからコンテンツを抽出してサニタイズ
   * @param text - エージェント出力テキスト
   * @param executionId - 実行ID
   * @returns プレビューコンテンツ
   */
  async extractAndSanitize(
    text: string,
    executionId: string,
  ): Promise<PreviewContent> {
    // コードブロック抽出
    const extractedContents = this.extractor.extractCodeBlocks(text);

    // 各コンテンツをサニタイズ
    const sanitizedContents = extractedContents.map((content) =>
      this.sanitizer.sanitize(content),
    );

    // プレビュー可能なコンテンツを取得
    const previewableContent =
      this.extractor.getPreviewableContent(extractedContents);

    // 一時ファイルパス
    let tempFilePath: string | undefined;

    // プレビュー可能なコンテンツがあれば一時ファイルに保存
    if (previewableContent) {
      const sanitizedPreviewable = sanitizedContents.find(
        (c) => c.id === previewableContent.id,
      );
      if (sanitizedPreviewable) {
        try {
          tempFilePath =
            await this.tempFileManager.saveContent(sanitizedPreviewable);
        } catch {
          // ファイル保存失敗は無視（tempFilePathなしで返却）
        }
      }
    }

    // プレビューコンテンツ作成
    const previewContent: PreviewContent = {
      executionId,
      contents: sanitizedContents,
      tempFilePath,
      createdAt: new Date(),
    };

    // キャッシュに保存
    this.previewCache.set(executionId, previewContent);

    return previewContent;
  }

  /**
   * キャッシュからプレビューコンテンツを取得
   * @param executionId - 実行ID
   * @returns プレビューコンテンツ、またはnull
   */
  getPreviewContent(executionId: string): PreviewContent | null {
    if (!executionId) {
      return null;
    }
    return this.previewCache.get(executionId) || null;
  }

  /**
   * 一時ファイルとキャッシュをクリーンアップ
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      await this.tempFileManager.cleanup();
    } catch {
      // クリーンアップ失敗は無視
    }
    this.previewCache.clear();
  }
}
