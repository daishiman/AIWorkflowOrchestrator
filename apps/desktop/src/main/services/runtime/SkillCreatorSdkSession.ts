/**
 * SkillCreatorSdkSession - SDK セッション管理クラス
 * TASK-SDK-SC-01: SDK Session Bridge
 *
 * @anthropic-ai/claude-agent-sdk の query() API を呼び出して
 * /skill-creator スキルを起動し、AskUserQuestion ツールコールを
 * IpcBridge 経由で Renderer に転送するブリッジを実装する。
 *
 * アーキテクチャ:
 * - IPC に直接依存しない（コールバック DI でテスタビリティを確保）
 * - custom MCP server を使って AskUserQuestion を実装する
 * - 30秒タイムアウトで応答なし時にエラーへ遷移
 */

import fs from "fs";
import path from "path";
import fg from "fast-glob";
import {
  createSdkMcpServer,
  query,
  tool,
} from "@anthropic-ai/claude-agent-sdk";
import type {
  SDKAssistantMessage,
  SDKMessage,
  SDKResultMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import type {
  ISkillCreatorSessionState,
  UserInputAnswer,
  UserInputQuestion,
  UserInputType,
} from "@repo/shared/types";

const TIMEOUT_MS = 30_000;
const ASK_USER_SERVER_NAME = "skill-creator-user-input";
const ASK_USER_TYPES: UserInputType[] = [
  "single_select",
  "multi_select",
  "free_text",
  "secret",
  "confirm",
];

type CallToolResult = {
  content: Array<{
    type: "text";
    text: string;
  }>;
};

export class SkillCreatorSdkSession {
  private readonly state: ISkillCreatorSessionState;
  private readonly askUserQuestionServerName = ASK_USER_SERVER_NAME;
  private pendingResolve: ((answerText: string) => void) | null = null;
  private pendingReject: ((error: Error) => void) | null = null;
  private pendingAnswerPromise: Promise<string> | null = null;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private abortController: AbortController | null = null;
  private mcpServer: ReturnType<typeof createSdkMcpServer> | null = null;
  private started = false;

  constructor(
    sessionId: string,
    private readonly skillCreatorDir: string,
    private readonly onQuestion: (question: UserInputQuestion) => void,
    private readonly onComplete: (result: string) => void,
    private readonly onError: (error: string) => void,
  ) {
    this.state = {
      sessionId,
      status: "running",
      startedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * セッションを開始する。
   * SKILL.md を読み込み、AskUserQuestion を custom MCP tool として SDK に提供し、
   * query() API を呼び出す。
   */
  async startSession(request: string): Promise<void> {
    if (this.started) {
      throw new Error("[SkillCreatorSdkSession] Session already started");
    }
    this.started = true;

    try {
      this.abortController = new AbortController();

      const skillMdPath = path.join(this.skillCreatorDir, "SKILL.md");
      const skillMdContent = fs.readFileSync(skillMdPath, "utf-8");

      const availableFiles = fg
        .sync(`${this.skillCreatorDir}/**/*.{md,js,json}`, { onlyFiles: true })
        .map((filePath) => path.relative(this.skillCreatorDir, filePath))
        .sort();

      this.mcpServer = createSdkMcpServer({
        name: this.askUserQuestionServerName,
        version: "1.0.0",
        tools: [this.buildAskUserQuestionTool()],
      });

      const prompt = [
        skillMdContent,
        "",
        "## 現在の利用可能ファイル一覧（動的取得）",
        availableFiles.map((file) => `- ${file}`).join("\n"),
        "",
        "---",
        `ユーザーの要求: ${request}`,
      ].join("\n");

      const conversation = query({
        prompt,
        options: {
          cwd: this.skillCreatorDir,
          sessionId: this.state.sessionId,
          abortController: this.abortController,
          tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "Task"],
          mcpServers: {
            [this.askUserQuestionServerName]: this.mcpServer!,
          },
        },
      });

      let resultText = "";

      for await (const message of conversation) {
        if (this.state.status === "error") {
          break;
        }

        const handled = await this.handleSdkMessage(message);
        if (handled?.result !== undefined) {
          resultText = handled.result;
        }
      }

      if (this.state.status !== "error") {
        this.updateState({
          status: "completed",
          result: resultText,
          currentQuestion: undefined,
        });
        this.onComplete(resultText);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (this.state.status !== "error") {
        this.handleError(message);
      }
    } finally {
      await this.closeMcpServer();
      this.abortController = null;
    }
  }

  /**
   * ユーザー回答を SDK セッションに注入する。
   * pending question と一致しない場合はエラーとする。
   */
  sendAnswer(answer: UserInputAnswer): void {
    const currentQuestion = this.state.currentQuestion;
    if (!currentQuestion || !this.pendingResolve) {
      throw new Error("[SkillCreatorSdkSession] No pending question to answer");
    }

    if (currentQuestion.toolCallId !== answer.toolCallId) {
      throw new Error(
        `[SkillCreatorSdkSession] toolCallId mismatch: expected ${currentQuestion.toolCallId}, got ${answer.toolCallId}`,
      );
    }

    const resolve = this.pendingResolve;
    const answerText = this.normalizeAnswerValue(answer.value);

    this.clearPendingQuestion();
    this.updateState({ status: "running", currentQuestion: undefined });
    resolve(answerText);
  }

  /**
   * セッションを中断する。
   * 現在待機中の質問があればキャンセルし、abortController も停止する。
   */
  abort(
    message = "[SkillCreatorSdkSession] Session aborted",
    options: { silent?: boolean } = {},
  ): void {
    if (this.state.status === "completed" || this.state.status === "error") {
      return;
    }

    this.abortController?.abort();

    if (options.silent) {
      this.clearPendingQuestion();
      this.updateState({
        status: "error",
        error: message,
        currentQuestion: undefined,
      });
      return;
    }

    this.handleError(message);
  }

  /**
   * 現在のセッション状態を返す（イミュータブルコピー）。
   */
  getState(): Readonly<ISkillCreatorSessionState> {
    return { ...this.state };
  }

  // ── Private ──────────────────────────────────────────

  /**
   * SDK メッセージを処理する。
   * AskUserQuestion は assistant メッセージの tool_use / text fallback を両対応する。
   */
  private async handleSdkMessage(
    message: SDKMessage,
  ): Promise<{ result?: string } | null> {
    if (message.type === "assistant") {
      await this.handleAssistantMessage(message);
      return null;
    }

    if (message.type === "result") {
      return this.handleResultMessage(message);
    }

    return null;
  }

  private async handleAssistantMessage(
    message: SDKAssistantMessage,
  ): Promise<void> {
    const blocks = Array.isArray(message.message?.content)
      ? message.message.content
      : [];

    for (const block of blocks) {
      if (block == null || typeof block !== "object") {
        continue;
      }

      const record = block as unknown as Record<string, unknown>;
      if (record.type === "tool_use" && record.name === "AskUserQuestion") {
        const toolCallId =
          typeof record.id === "string" ? record.id : `tc-${Date.now()}`;
        const input = this.asRecord(record.input);
        const question = this.buildUserInputQuestion(toolCallId, input);
        await this.handleUserInputToolCall(question);
        return;
      }
    }

    const textBlock = blocks.find(
      (block) =>
        block != null &&
        typeof block === "object" &&
        (block as unknown as Record<string, unknown>).type === "text",
    ) as unknown as Record<string, unknown> | undefined;

    if (textBlock && typeof textBlock.text === "string") {
      const askMatch = textBlock.text.match(/AskUserQuestion[:\s]+(.+)/s);
      if (askMatch) {
        const question: UserInputQuestion = {
          toolCallId: `fallback-${Date.now()}`,
          type: "free_text",
          question: askMatch[1].trim(),
        };
        await this.handleUserInputToolCall(question);
      }
    }
  }

  private handleResultMessage(
    message: SDKResultMessage,
  ): { result?: string } | null {
    if (message.subtype !== "success") {
      this.handleError(
        `[SkillCreatorSdkSession] SDK result ended with ${message.subtype}`,
      );
      return null;
    }

    return {
      result: message.result ?? "",
    };
  }

  /**
   * SDK の tool_use 入力から UserInputQuestion を構築する。
   */
  private buildUserInputQuestion(
    toolCallId: string,
    input: Record<string, unknown>,
  ): UserInputQuestion {
    const questionText =
      typeof input.question === "string" ? input.question : "";
    const type = this.normalizeInputType(input.type);

    const options = Array.isArray(input.options)
      ? (input.options as unknown[])
          .filter(
            (option): option is Record<string, unknown> =>
              option !== null && typeof option === "object",
          )
          .map((option) => ({
            value:
              typeof option.value === "string"
                ? option.value
                : typeof option.id === "string"
                  ? option.id
                  : typeof option.label === "string"
                    ? option.label
                    : String(option.value ?? option.id ?? option.label ?? ""),
            label:
              typeof option.label === "string"
                ? option.label
                : typeof option.value === "string"
                  ? option.value
                  : String(option.label ?? option.value ?? option.id ?? ""),
            ...(typeof option.description === "string" && {
              description: option.description,
            }),
            ...(typeof option.preview === "string" && {
              preview: option.preview,
            }),
          }))
      : undefined;

    const placeholder =
      typeof input.placeholder === "string" ? input.placeholder : undefined;

    return {
      toolCallId,
      type,
      question: questionText,
      ...(options !== undefined && { options }),
      ...(placeholder !== undefined && { placeholder }),
    };
  }

  /**
   * 入力値を UserInputType に正規化する。
   */
  private normalizeInputType(value: unknown): UserInputType {
    if (
      typeof value === "string" &&
      ASK_USER_TYPES.includes(value as UserInputType)
    ) {
      return value as UserInputType;
    }
    return "free_text";
  }

  /**
   * AskUserQuestion custom tool を構築する。
   */
  private buildAskUserQuestionTool() {
    return tool(
      "AskUserQuestion",
      "ユーザーに質問して回答を待つ",
      {
        toolCallId: z.string().optional(),
        type: z
          .enum([
            "single_select",
            "multi_select",
            "free_text",
            "secret",
            "confirm",
          ])
          .optional(),
        question: z.string(),
        options: z
          .array(
            z.object({
              value: z.string().optional(),
              label: z.string().optional(),
              description: z.string().optional(),
              preview: z.string().optional(),
            }),
          )
          .optional(),
        placeholder: z.string().optional(),
      },
      async (input): Promise<CallToolResult> => {
        if (this.pendingAnswerPromise && this.state.currentQuestion) {
          const answerText = await this.pendingAnswerPromise;
          return {
            content: [
              {
                type: "text",
                text: answerText,
              },
            ],
          };
        }

        const inputRecord = this.asRecord(input);
        const toolCallId =
          typeof inputRecord.toolCallId === "string"
            ? inputRecord.toolCallId
            : `tc-${Date.now()}`;
        const question = this.buildUserInputQuestion(toolCallId, inputRecord);
        const answerText = await this.handleUserInputToolCall(question);

        return {
          content: [
            {
              type: "text",
              text: answerText,
            },
          ],
        };
      },
    );
  }

  /**
   * UserInput ツールコールを処理する。
   * - ステータスを awaiting-input に遷移
   * - onQuestion コールバックを呼び出して IpcBridge に通知
   * - 30秒タイムアウト付きの Promise で sendAnswer() を待機
   */
  private async handleUserInputToolCall(
    question: UserInputQuestion,
  ): Promise<string> {
    if (this.pendingAnswerPromise) {
      const currentQuestion = this.state.currentQuestion;
      if (currentQuestion?.toolCallId === question.toolCallId) {
        return this.pendingAnswerPromise;
      }

      throw new Error(
        "[SkillCreatorSdkSession] A different question is already pending",
      );
    }

    this.updateState({ status: "awaiting-input", currentQuestion: question });

    this.pendingAnswerPromise = new Promise<string>((resolve, reject) => {
      this.pendingResolve = resolve;
      this.pendingReject = reject;
      this.timeoutHandle = setTimeout(() => {
        this.handleError(
          "[SkillCreatorSdkSession] UserInput timeout after 30 seconds",
        );
      }, TIMEOUT_MS);

      this.onQuestion(question);
    });

    return this.pendingAnswerPromise;
  }

  /**
   * エラー状態に遷移し onError コールバックを呼び出す。
   */
  private handleError(message: string): void {
    this.handleErrorInternal(message, false);
  }

  private handleErrorInternal(message: string, silent: boolean): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    this.abortController?.abort();

    const reject = this.pendingReject;
    this.clearPendingQuestion();

    this.updateState({
      status: "error",
      error: message,
      currentQuestion: undefined,
    });

    if (!silent) {
      reject?.(new Error(message));
      this.onError(message);
    }
  }

  /**
   * 保留中の質問状態をクリアする。
   */
  private clearPendingQuestion(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }

    this.pendingResolve = null;
    this.pendingReject = null;
    this.pendingAnswerPromise = null;
  }

  /**
   * 回答値を SDK への返却文字列に正規化する。
   */
  private normalizeAnswerValue(value: string | string[] | boolean): string {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }

    return value;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object") {
      return value as Record<string, unknown>;
    }
    return {};
  }

  private async closeMcpServer(): Promise<void> {
    if (!this.mcpServer) {
      return;
    }

    try {
      await this.mcpServer.instance.close();
    } catch (error) {
      console.warn(
        "[SkillCreatorSdkSession] Failed to close AskUserQuestion MCP server:",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      this.mcpServer = null;
    }
  }

  /**
   * 状態を更新する（updatedAt を自動更新）。
   */
  private updateState(
    partial: Partial<
      Pick<
        ISkillCreatorSessionState,
        "status" | "currentQuestion" | "result" | "error"
      >
    >,
  ): void {
    Object.assign(this.state, partial, { updatedAt: new Date() });
  }
}
