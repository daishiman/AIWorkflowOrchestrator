/**
 * スキル実行器
 * Claude Agent SDK経由でスキルを実行する
 * @module main/slide/skill-executor
 */

import type {
  SkillPhase,
  SkillExecutionResult,
  StructureChange,
} from "@repo/shared";
import { getAgentAPI } from "./agent-client";

/**
 * スキル実行器インターフェース
 */
export interface SkillExecutor {
  /** スキルを実行する */
  execute(
    phase: SkillPhase,
    projectPath: string,
  ): Promise<SkillExecutionResult>;
  /** 実行をキャンセルする */
  cancel(): void;
  /** 進捗コールバックを登録 */
  onProgress(callback: (progress: number) => void): void;
  /** 実行中かどうか */
  isExecuting(): boolean;
}

/**
 * スキルフェーズからスキル名を取得する
 */
const getSkillName = (phase: SkillPhase): string => {
  const skillMap: Record<SkillPhase, string> = {
    hearing: "hearing-facilitator",
    structure: "structure-designer",
    html: "html-generator",
    modifier: "slide-modifier",
  };
  return skillMap[phase];
};

/**
 * スキルフェーズ用のプロンプトを生成する
 */
const generateSkillPrompt = (
  phase: SkillPhase,
  projectPath: string,
): string => {
  const prompts: Record<SkillPhase, string> = {
    hearing: `プロジェクトパス: ${projectPath}\n\nプレゼンテーションの要件をヒアリングし、構造化してください。`,
    structure: `プロジェクトパス: ${projectPath}\n\nヒアリング結果を基に、スライドの構造を設計してください。`,
    html: `プロジェクトパス: ${projectPath}\n\n構造定義を基に、Reveal.js HTMLスライドを生成してください。`,
    modifier: `プロジェクトパス: ${projectPath}\n\nHTMLスライドの変更を解析し、構造定義を更新してください。変更内容をJSON形式で返してください。`,
  };
  return prompts[phase];
};

/**
 * スキルフェーズ用のシステムプロンプトを取得する
 */
const getSystemPromptForPhase = (phase: SkillPhase): string => {
  const systemPrompts: Record<SkillPhase, string> = {
    hearing:
      "あなたはプレゼンテーション要件のヒアリングを行うファシリテーターです。",
    structure: "あなたはプレゼンテーション構造を設計するデザイナーです。",
    html: "あなたはReveal.jsを使用したHTMLスライドを生成するジェネレーターです。",
    modifier:
      "あなたはHTMLスライドの変更を解析し、構造定義との同期を行うモディファイアです。",
  };
  return systemPrompts[phase];
};

/**
 * スキルレスポンスをパースする
 */
const parseSkillResponse = (
  phase: SkillPhase,
  content: string,
): { output: string; changes?: StructureChange[] } => {
  if (phase === "modifier") {
    try {
      const parsed = JSON.parse(content) as { changes?: StructureChange[] };
      return {
        output: content,
        changes: parsed.changes || [],
      };
    } catch {
      return { output: content, changes: [] };
    }
  }
  return { output: content };
};

/**
 * SDK実行タイムアウト（ミリ秒）
 */
const SDK_TIMEOUT = 30000;

/**
 * スキル実行器を作成する
 * @returns SkillExecutorインスタンス
 */
export const createSkillExecutor = (): SkillExecutor => {
  let cancelled = false;
  let executing = false;
  let abortController: AbortController | null = null;
  const progressCallbacks: Array<(progress: number) => void> = [];

  /**
   * 進捗を通知する
   */
  const emitProgress = (progress: number): void => {
    progressCallbacks.forEach((cb) => cb(progress));
  };

  return {
    async execute(phase, projectPath) {
      if (executing) {
        return {
          phase,
          success: false,
          error: "Another skill is already executing",
          duration: 0,
        };
      }

      cancelled = false;
      executing = true;
      abortController = new AbortController();
      const startTime = Date.now();

      try {
        emitProgress(0);

        // スキル名を取得
        const skillName = getSkillName(phase);

        // プロンプトを生成
        const prompt = generateSkillPrompt(phase, projectPath);
        const systemPrompt = getSystemPromptForPhase(phase);

        emitProgress(25);

        // キャンセルチェック
        if (cancelled) {
          throw new Error("Cancelled");
        }

        emitProgress(50);

        // Agent SDKを使用してスキルを実行
        const agentAPI = getAgentAPI();
        const response = await agentAPI.query({
          prompt,
          options: {
            systemPrompt,
            timeout: SDK_TIMEOUT,
          },
        });

        // キャンセルチェック
        if (cancelled) {
          throw new Error("Cancelled");
        }

        // レスポンスをパース
        const parsed = parseSkillResponse(phase, response.content);

        emitProgress(100);

        // modifierスキルの場合は追加情報を含める
        if (phase === "modifier") {
          return {
            phase,
            success: true,
            output: `Skill ${skillName} executed successfully`,
            duration: Date.now() - startTime,
            changes: parsed.changes || [],
            direction: "reverse" as const,
            projectPath,
          };
        }

        return {
          phase,
          success: true,
          output: `Skill ${skillName} executed successfully`,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        return {
          phase,
          success: false,
          error: errorMessage,
          duration: Date.now() - startTime,
        };
      } finally {
        executing = false;
        abortController = null;
      }
    },

    cancel() {
      cancelled = true;
      if (abortController) {
        abortController.abort();
      }
    },

    onProgress(callback) {
      progressCallbacks.push(callback);
    },

    isExecuting() {
      return executing;
    },
  };
};
