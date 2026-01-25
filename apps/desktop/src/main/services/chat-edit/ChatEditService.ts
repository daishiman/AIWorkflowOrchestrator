/**
 * ChatEditService
 *
 * LLM統合を担当するFacadeサービス。
 * コード編集コマンドの処理、プロンプト生成、レスポンス解析を行う。
 */
import { v4 as uuidv4 } from "uuid";
import { ContextBuilder } from "./ContextBuilder";
import {
  SendWithContextRequest,
  SendWithContextResponse,
  EditCommand,
  GeneratedResult,
  DiffHunk,
} from "./types";
import { isValidCommandType, buildPromptFromTemplate } from "./prompts";

/**
 * LLMアダプタインターフェース
 *
 * LLMプロバイダへのリクエストを抽象化
 */
export interface LLMAdapter {
  /**
   * LLMにメッセージを送信
   *
   * @param prompt - 送信するプロンプト
   * @returns LLMレスポンス
   */
  sendMessage: (prompt: string) => Promise<{
    success: boolean;
    data?: { message: string };
    error?: { message: string };
  }>;
}

/**
 * ChatEditService
 *
 * ファイル編集のためのLLM統合サービス
 */
export class ChatEditService {
  /**
   * ChatEditServiceのコンストラクタ
   *
   * @param llmAdapter - LLMアダプタ
   * @param contextBuilder - コンテキストビルダー
   */
  constructor(
    private readonly llmAdapter: LLMAdapter,
    private readonly contextBuilder: ContextBuilder,
  ) {}

  /**
   * コンテキスト付きでLLMにリクエストを送信
   *
   * ファイルコンテキストとコマンドを受け取り、LLMに送信して
   * 生成されたコードを返す。
   *
   * @param request - 送信リクエスト
   * @returns 送信レスポンス（成功時は生成結果を含む）
   */
  async sendWithContext(
    request: SendWithContextRequest,
  ): Promise<SendWithContextResponse> {
    // コンテキストサイズ検証
    if (!this.contextBuilder.validateSize(request.contexts)) {
      return {
        success: false,
        error: {
          code: "CONTEXT_TOO_LARGE",
          message: "コンテキストサイズが制限を超えています",
          retryable: false,
        },
      };
    }

    // コマンドタイプ検証
    if (!isValidCommandType(request.command.type)) {
      return {
        success: false,
        error: {
          code: "INVALID_COMMAND",
          message: `Unknown command type: ${request.command.type}`,
          retryable: false,
        },
      };
    }

    try {
      // コンテキスト構築
      const contextString = this.contextBuilder.build(request.contexts);

      // プロンプト生成
      const prompt = this.buildPrompt(request.command, contextString);

      // LLMリクエスト
      const llmResponse = await this.llmAdapter.sendMessage(prompt);

      if (!llmResponse.success) {
        return {
          success: false,
          error: {
            code: "LLM_ERROR",
            message:
              llmResponse.error?.message || "LLMリクエストに失敗しました",
            retryable: true,
          },
        };
      }

      // 元のコンテンツ取得（targetContextIdに一致するものを優先、なければ最初のコンテキスト）
      const targetContext = this.findTargetContext(request);
      const originalContent = targetContext?.content || "";

      // 結果をパース
      const generatedResult = this.parseResponse(
        llmResponse.data?.message || "",
        request.command,
        originalContent,
        targetContext?.filePath || "",
      );

      return {
        success: true,
        result: generatedResult,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return {
        success: false,
        error: {
          code: "LLM_ERROR",
          message: err.message || "Unknown error",
          retryable: true,
        },
      };
    }
  }

  /**
   * コマンドタイプ別プロンプト生成
   *
   * @param command - 編集コマンド
   * @param context - コンテキスト文字列
   * @returns 生成されたプロンプト
   */
  buildPrompt(command: EditCommand, context: string): string {
    return buildPromptFromTemplate(
      command.type,
      context,
      command.type === "custom" ? command.instruction : undefined,
    );
  }

  /**
   * LLM応答をGeneratedResultに変換
   *
   * @param response - LLMからの応答テキスト
   * @param command - 実行されたコマンド
   * @param originalContent - 元のコンテンツ
   * @param filePath - ターゲットファイルパス
   * @returns 生成結果
   */
  parseResponse(
    response: string,
    command: EditCommand,
    originalContent: string,
    filePath: string,
  ): GeneratedResult {
    // コードブロック抽出
    const generatedContent = this.extractCodeFromResponse(response);

    // 差分計算（簡易版）
    const diffHunks = this.calculateDiff(originalContent, generatedContent);

    return {
      id: uuidv4(),
      contextId: command.targetContextId,
      originalContent,
      generatedContent,
      diffHunks,
      status: "pending",
      createdAt: new Date(),
      targetFilePath: filePath,
      command,
    };
  }

  /**
   * ターゲットコンテキストを検索
   *
   * @param request - リクエスト
   * @returns ターゲットコンテキスト（見つからない場合は最初のコンテキスト）
   */
  private findTargetContext(request: SendWithContextRequest) {
    return (
      request.contexts.find(
        (ctx) => ctx.filePath === request.command.targetContextId,
      ) || request.contexts[0]
    );
  }

  /**
   * レスポンスからコードを抽出
   *
   * Markdownコードブロックがある場合はその中身を、
   * ない場合はレスポンス全体を返す。
   *
   * @param response - LLMレスポンス
   * @returns 抽出されたコード
   */
  private extractCodeFromResponse(response: string): string {
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    return codeBlockMatch ? codeBlockMatch[1].trim() : response.trim();
  }

  /**
   * 差分計算（簡易版）
   *
   * 現在は単純な全体比較のみ。将来的にはLCSアルゴリズムを使用予定。
   *
   * @param original - 元のコンテンツ
   * @param generated - 生成されたコンテンツ
   * @returns 差分ハンク配列
   */
  private calculateDiff(original: string, generated: string): DiffHunk[] {
    // 同一の場合は差分なし
    if (original === generated) {
      return [];
    }

    const originalLines = original.split("\n");
    const generatedLines = generated.split("\n");

    // 簡易的な差分：全体を1つのhunkとして返す
    return [
      {
        type: "modify",
        originalStartLine: 1,
        originalEndLine: originalLines.length,
        newStartLine: 1,
        newEndLine: generatedLines.length,
        originalLines,
        newLines: generatedLines,
      },
    ];
  }
}
