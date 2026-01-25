import { FileContextInput } from "./types";
import * as path from "path";

const MAX_CONTEXT_SIZE = 100 * 1024; // 100KB

export class ContextBuilder {
  /**
   * FileContextからLLMプロンプト用文字列を構築
   */
  build(contexts: FileContextInput[]): string {
    if (contexts.length === 0) {
      return "";
    }

    const sections = contexts.map((ctx) => this.buildFileSection(ctx));
    return `## ファイルコンテキスト\n\n${sections.join("\n\n")}`;
  }

  /**
   * 単一ファイルのセクションを構築
   */
  private buildFileSection(ctx: FileContextInput): string {
    const fileName = path.basename(ctx.filePath);
    const selectionInfo = ctx.selection
      ? ` (選択範囲: L${ctx.selection.startLine}-L${ctx.selection.endLine})`
      : "";

    // 選択範囲がある場合は選択されたテキストを使用
    const content = ctx.selection ? ctx.selection.selectedText : ctx.content;

    return `### File: ${fileName}${selectionInfo}
\`\`\`${ctx.language}
${content}
\`\`\``;
  }

  /**
   * コンテキスト合計サイズを計算
   */
  calculateSize(contexts: FileContextInput[]): number {
    return contexts.reduce((total, ctx) => {
      // ファイル内容 + ファイルパスのサイズ
      const contentSize = Buffer.byteLength(ctx.content, "utf-8");
      const pathSize = Buffer.byteLength(ctx.filePath, "utf-8");
      return total + contentSize + pathSize;
    }, 0);
  }

  /**
   * サイズ制限チェック
   */
  validateSize(contexts: FileContextInput[]): boolean {
    return this.calculateSize(contexts) <= MAX_CONTEXT_SIZE;
  }
}

export { MAX_CONTEXT_SIZE };
