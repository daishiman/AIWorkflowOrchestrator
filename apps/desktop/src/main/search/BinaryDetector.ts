/**
 * BinaryDetector - ファイルがバイナリかテキストかを判定
 *
 * 判定方法:
 * 1. 拡張子による事前判定
 * 2. ファイルヘッダー（マジックバイト）の確認
 * 3. NULLバイト検出
 */

import * as fs from "fs/promises";
import * as path from "path";

// テキストファイルとして扱う拡張子
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".txt",
  ".html",
  ".htm",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".cfg",
  ".conf",
  ".sh",
  ".bash",
  ".zsh",
  ".fish",
  ".py",
  ".rb",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".go",
  ".rs",
  ".swift",
  ".kt",
  ".scala",
  ".php",
  ".sql",
  ".vue",
  ".svelte",
  ".astro",
  ".env",
  ".gitignore",
  ".dockerignore",
  ".editorconfig",
  ".prettierrc",
  ".eslintrc",
  ".svg",
]);

// バイナリファイルとして扱う拡張子
const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".ico",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".rar",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".dat",
  ".mp3",
  ".mp4",
  ".avi",
  ".mov",
  ".wav",
  ".flac",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
]);

// バイナリファイルのマジックバイト（ヘッダー）
const BINARY_MAGIC_BYTES: { prefix: number[]; description: string }[] = [
  { prefix: [0x89, 0x50, 0x4e, 0x47], description: "PNG" },
  { prefix: [0xff, 0xd8, 0xff], description: "JPEG" },
  { prefix: [0x47, 0x49, 0x46, 0x38], description: "GIF" },
  { prefix: [0x50, 0x4b, 0x03, 0x04], description: "ZIP" },
  { prefix: [0x50, 0x4b, 0x05, 0x06], description: "ZIP (empty)" },
  { prefix: [0x1f, 0x8b], description: "GZIP" },
  { prefix: [0x42, 0x5a, 0x68], description: "BZIP2" },
  { prefix: [0x4d, 0x5a], description: "EXE/DLL" },
  { prefix: [0x7f, 0x45, 0x4c, 0x46], description: "ELF" },
  { prefix: [0xca, 0xfe, 0xba, 0xbe], description: "Mach-O" },
  { prefix: [0x25, 0x50, 0x44, 0x46], description: "PDF" },
];

// ファイル内容を検査するサイズ（バイト）
const SAMPLE_SIZE = 8192;

export class BinaryDetector {
  /**
   * ファイルがバイナリかどうかを判定
   */
  async isBinary(filePath: string): Promise<boolean> {
    // 拡張子による判定
    const ext = path.extname(filePath).toLowerCase();

    if (BINARY_EXTENSIONS.has(ext)) {
      return true;
    }

    if (TEXT_EXTENSIONS.has(ext)) {
      // 拡張子がテキストでも、内容にNULLバイトがあればバイナリ
      return this.containsNullBytes(filePath);
    }

    // 拡張子で判定できない場合は内容を検査
    return this.detectByContent(filePath);
  }

  /**
   * ファイルの内容からバイナリかどうかを判定
   */
  private async detectByContent(filePath: string): Promise<boolean> {
    const buffer = await this.readFileHead(filePath);

    // 空ファイルはテキストとして扱う
    if (buffer.length === 0) {
      return false;
    }

    // マジックバイトの確認
    if (this.hasBinaryMagicBytes(buffer)) {
      return true;
    }

    // NULLバイトの確認
    return this.bufferContainsNullBytes(buffer);
  }

  /**
   * ファイルの先頭を読み込む
   */
  private async readFileHead(filePath: string): Promise<Buffer> {
    const fileHandle = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(SAMPLE_SIZE);
      const { bytesRead } = await fileHandle.read(buffer, 0, SAMPLE_SIZE, 0);
      return buffer.subarray(0, bytesRead);
    } finally {
      await fileHandle.close();
    }
  }

  /**
   * バッファにバイナリファイルのマジックバイトが含まれているか確認
   */
  private hasBinaryMagicBytes(buffer: Buffer): boolean {
    return BINARY_MAGIC_BYTES.some(({ prefix }) => {
      if (buffer.length < prefix.length) {
        return false;
      }
      return prefix.every((byte, index) => buffer[index] === byte);
    });
  }

  /**
   * ファイルにNULLバイトが含まれているか確認
   */
  private async containsNullBytes(filePath: string): Promise<boolean> {
    const buffer = await this.readFileHead(filePath);
    return this.bufferContainsNullBytes(buffer);
  }

  /**
   * バッファにNULLバイトが含まれているか確認
   */
  private bufferContainsNullBytes(buffer: Buffer): boolean {
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === 0x00) {
        return true;
      }
    }
    return false;
  }
}
