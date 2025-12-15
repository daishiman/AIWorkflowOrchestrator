/**
 * FileReader - ファイル読み込みユーティリティ
 *
 * 機能:
 * - UTF-8テキストファイルの読み込み
 * - 行単位のストリーム読み込み
 * - ファイルサイズ制限（10MB）
 * - バイナリファイル検出
 */

import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as readline from "readline";
import { BinaryDetector } from "./BinaryDetector";

// 最大ファイルサイズ（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface FileContent {
  content: string;
  encoding: string;
}

export class FileReader {
  private binaryDetector: BinaryDetector;

  constructor() {
    this.binaryDetector = new BinaryDetector();
  }

  /**
   * ファイルを読み込む
   * @returns ファイル内容、またはnull（バイナリ/サイズ超過/存在しない場合）
   */
  async readFile(filePath: string): Promise<FileContent | null> {
    try {
      // ファイルの存在確認とサイズ取得
      const stats = await fs.stat(filePath);

      // サイズ制限チェック
      if (stats.size > MAX_FILE_SIZE) {
        return null;
      }

      // バイナリファイルチェック
      if (await this.binaryDetector.isBinary(filePath)) {
        return null;
      }

      // ファイル読み込み
      const content = await fs.readFile(filePath, "utf-8");

      return {
        content,
        encoding: "utf-8",
      };
    } catch (error) {
      // ファイルが存在しない場合
      if (this.isNodeError(error) && error.code === "ENOENT") {
        return null;
      }
      // その他のエラーは再スロー
      throw error;
    }
  }

  /**
   * ファイルを行単位で読み込む（ストリーム）
   * @param callback 各行に対して呼び出されるコールバック
   */
  async readLines(
    filePath: string,
    callback: (line: string, lineNumber: number) => void,
  ): Promise<void> {
    const fileStream = fsSync.createReadStream(filePath, { encoding: "utf-8" });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineNumber = 0;

    for await (const line of rl) {
      callback(line, lineNumber);
      lineNumber++;
    }
  }

  /**
   * エラーがNodeJSのファイルシステムエラーかどうかを判定
   */
  private isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && "code" in error;
  }
}
