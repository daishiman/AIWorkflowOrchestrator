import * as fs from "fs/promises";
import * as path from "path";
import { FileReadResult, FileWriteResult, FileWriteOptions } from "./types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const EXTENSION_MAP: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".md": "markdown",
  ".json": "json",
  ".css": "css",
  ".scss": "scss",
  ".html": "html",
  ".vue": "vue",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".rb": "ruby",
  ".php": "php",
  ".sh": "shell",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".sql": "sql",
  ".graphql": "graphql",
};

export class FileService {
  /**
   * ファイル内容を読み取る
   */
  async readFile(filePath: string): Promise<FileReadResult> {
    try {
      // パストラバーサル検出
      const normalizedPath = path.resolve(filePath);
      if (filePath.includes("..")) {
        throw new Error("Path traversal detected");
      }

      // ファイル存在確認とサイズ確認
      const stats = await fs.stat(normalizedPath);

      if (stats.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: {
            code: "TOO_LARGE",
            message: `ファイルサイズが${MAX_FILE_SIZE / 1024 / 1024}MBを超えています`,
          },
        };
      }

      const content = await fs.readFile(normalizedPath, "utf-8");
      const language = this.detectLanguage(normalizedPath);

      return {
        success: true,
        content,
        language,
        fileSize: stats.size,
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };

      if (err.message === "Path traversal detected") {
        throw error;
      }

      if (err.code === "ENOENT") {
        return {
          success: false,
          error: {
            code: "FILE_NOT_FOUND",
            message: `ファイルが見つかりません: ${filePath}`,
          },
        };
      }
      if (err.code === "EACCES") {
        return {
          success: false,
          error: {
            code: "PERMISSION_DENIED",
            message: `ファイルへのアクセス権限がありません: ${filePath}`,
          },
        };
      }
      return {
        success: false,
        error: {
          code: "READ_ERROR",
          message: err.message || "Unknown error",
        },
      };
    }
  }

  /**
   * ファイルに内容を書き込む
   */
  async writeFile(
    filePath: string,
    content: string,
    options?: FileWriteOptions,
  ): Promise<FileWriteResult> {
    try {
      // 無効なパスチェック
      if (!filePath || filePath.trim() === "") {
        return {
          success: false,
          error: {
            code: "INVALID_PATH",
            message: "Invalid file path",
          },
        };
      }

      let backupPath: string | undefined;

      // バックアップ作成
      if (options?.createBackup) {
        try {
          await fs.access(filePath);
          const timestamp = Date.now();
          const ext = path.extname(filePath);
          const baseName = path.basename(filePath, ext);
          const dir = path.dirname(filePath);
          backupPath = path.join(dir, `${baseName}.${timestamp}.bak`);
          await fs.copyFile(filePath, backupPath);
        } catch {
          // ファイルが存在しない場合はバックアップ不要
        }
      }

      // 書き込み
      const encoding = (options?.encoding || "utf-8") as BufferEncoding;
      await fs.writeFile(filePath, content, encoding);

      return {
        success: true,
        backupPath,
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };

      if (err.code === "EACCES") {
        return {
          success: false,
          error: {
            code: "PERMISSION_DENIED",
            message: `ファイルへの書き込み権限がありません: ${filePath}`,
          },
        };
      }
      return {
        success: false,
        error: {
          code: "WRITE_ERROR",
          message: err.message || "Unknown error",
        },
      };
    }
  }

  /**
   * ファイルパスから言語を検出
   */
  detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return EXTENSION_MAP[ext] || "plaintext";
  }

  /**
   * バックアップファイルを作成
   */
  async createBackup(filePath: string): Promise<string> {
    const timestamp = Date.now();
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    const backupPath = path.join(dir, `${baseName}.${timestamp}.bak`);
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  }
}
