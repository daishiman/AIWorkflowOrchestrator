/**
 * TerminalHandoffBuilder
 *
 * LLM integrated モードが使えない場合に、
 * ユーザーがターミナルから Claude Code CLI で続行するための
 * HandoffGuidance を生成するビルダー。
 *
 * セキュリティ: API キー値は一切 terminalCommand に含めない。
 */
import path from "path";
import type { SendWithContextRequest, HandoffGuidance } from "./types";

export class TerminalHandoffBuilder {
  build(request: SendWithContextRequest, reason: string): HandoffGuidance {
    const contextSummary = this.buildContextSummary(request);
    const terminalCommand = this.buildTerminalCommand(request, contextSummary);
    return { terminalCommand, contextSummary, reason };
  }

  private buildContextSummary(request: SendWithContextRequest): string {
    const fileParts = request.contexts.map((ctx) => {
      const fileName = path.basename(ctx.filePath);
      if (ctx.selection) {
        return `${fileName}:${ctx.selection.startLine}-${ctx.selection.endLine}`;
      }
      return fileName;
    });

    let summary = `command=${request.command.type} files=${fileParts.join(",")}`;
    if (request.workspacePath) {
      summary += ` workspace=${path.basename(request.workspacePath)}`;
    }
    return summary;
  }

  private buildTerminalCommand(
    request: SendWithContextRequest,
    contextSummary: string,
  ): string {
    const parts = ["claude"];
    if (request.workspacePath) {
      parts.push(`--add-dir "${request.workspacePath}"`);
    }

    const userMessage =
      request.message ??
      `Please ${request.command.type} the selected code. Context: ${contextSummary}`;

    // ダブルクォートをエスケープして安全なコマンドを生成
    parts.push(`"${userMessage.replace(/"/g, '\\"')}"`);
    return parts.join(" ");
  }
}
