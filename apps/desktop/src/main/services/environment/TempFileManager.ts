/**
 * TempFileManager - 一時ファイル管理
 * @module environment
 */

import type { ContentType, SanitizedContent } from "@repo/shared/types/agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { randomUUID } from "node:crypto";

/**
 * 一時ファイル管理クラス
 */
export class TempFileManager {
  /** 一時ディレクトリパス */
  private tempDir: string = "";

  /** 追跡中のファイル */
  private trackedFiles: Set<string> = new Set();

  /** ファイル拡張子マッピング */
  private readonly extensionMap: Record<ContentType, string> = {
    html: ".html",
    markdown: ".md",
    css: ".css",
    javascript: ".js",
    text: ".txt",
  };

  /**
   * 初期化（一時ディレクトリ作成）
   */
  async initialize(): Promise<void> {
    this.tempDir = path.join(os.tmpdir(), "aiworkflow-preview");

    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * コンテンツを一時ファイルに保存
   * @param content - サニタイズ済みコンテンツ
   * @returns ファイルパス
   */
  async saveContent(content: SanitizedContent): Promise<string> {
    const extension = this.getFileExtension(content.type);
    const filename = `${randomUUID()}${extension}`;
    const filepath = path.join(this.tempDir, filename);

    await fs.promises.writeFile(filepath, content.sanitizedContent, {
      encoding: "utf-8",
      mode: 0o600, // owner read/write only
    });

    this.trackedFiles.add(filepath);

    return filepath;
  }

  /**
   * 全追跡ファイルをクリーンアップ
   */
  async cleanup(): Promise<void> {
    const deletePromises = Array.from(this.trackedFiles).map(
      async (filepath) => {
        try {
          await fs.promises.unlink(filepath);
        } catch {
          // ファイル削除失敗は無視して継続
        }
      },
    );

    await Promise.all(deletePromises);
    this.trackedFiles.clear();
  }

  /**
   * 特定ファイルをクリーンアップ
   * @param filepath - ファイルパス
   */
  async cleanupFile(filepath: string): Promise<void> {
    try {
      await fs.promises.unlink(filepath);
    } catch {
      // ファイル削除失敗は無視
    }

    this.trackedFiles.delete(filepath);
  }

  /**
   * 一時ディレクトリパスを取得
   * @returns 一時ディレクトリパス
   */
  getTempDirectory(): string {
    return this.tempDir;
  }

  /**
   * 追跡中のファイル一覧を取得
   * @returns ファイルパス配列
   */
  getTrackedFiles(): string[] {
    return Array.from(this.trackedFiles);
  }

  /**
   * コンテンツタイプからファイル拡張子を取得
   * @param type - コンテンツタイプ
   * @returns ファイル拡張子
   */
  private getFileExtension(type: ContentType): string {
    return this.extensionMap[type] || ".txt";
  }
}
