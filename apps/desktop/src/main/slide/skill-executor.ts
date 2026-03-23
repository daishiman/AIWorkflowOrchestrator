/**
 * スキル実行器
 * RuntimeResolver 経由でランタイムモードを判定し、
 * integrated モードでは Agent SDK 経由でスキルを実行、
 * handoff モードではガイダンスを返す。
 * @module main/slide/skill-executor
 */

import type {
  SkillPhase,
  SkillExecutionResult,
  HandoffGuidance,
} from "@repo/shared";
import { getAgentAPI } from "./agent-client";
import {
  RuntimeResolver,
  type RuntimeResolution,
} from "../services/runtime/RuntimeResolver";
import type { IAuthKeyService, IAuthModeService } from "../services/auth/types";
import { buildModifierPrompt, parseModifierResponse } from "./modifier-skill";
import type { ModifierContext } from "./modifier-skill";
import { readFile } from "fs/promises";

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
 * スキル実行器の依存関係
 */
export interface SkillExecutorDeps {
  authKeyService?: IAuthKeyService;
  authModeService?: IAuthModeService;
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
 * SDK実行タイムアウト（ミリ秒）
 */
const SDK_TIMEOUT = 30000;

/**
 * handoff モード時のガイダンスを生成する
 * @param phase - 実行フェーズ
 * @param projectPath - プロジェクトパス
 * @param reason - RuntimeResolver が handoff を選択した理由
 * @returns HandoffGuidance
 */
export function buildHandoffGuidance(
  phase: SkillPhase,
  projectPath: string,
  reason: string,
): HandoffGuidance {
  const phaseLabel: Record<SkillPhase, string> = {
    hearing: "ヒアリング",
    structure: "構造設計",
    html: "HTML生成",
    modifier: "逆同期",
  };

  return {
    terminalCommand: `claude --project "${projectPath}" --phase ${phase}`,
    contextSummary: `スライド「${phaseLabel[phase]}」フェーズの実行 (プロジェクト: ${projectPath})`,
    reason,
  };
}

/**
 * スキル実行器を作成する
 * @param deps - 依存関係（RuntimeResolver 用）
 * @returns SkillExecutorインスタンス
 */
export const createSkillExecutor = (
  deps?: SkillExecutorDeps,
): SkillExecutor => {
  let cancelled = false;
  let executing = false;
  let abortController: AbortController | null = null;
  const progressCallbacks: Array<(progress: number) => void> = [];

  // RuntimeResolver（DI で注入された場合のみ有効）
  const runtimeResolver =
    deps?.authKeyService && deps?.authModeService
      ? new RuntimeResolver(deps.authKeyService, deps.authModeService)
      : null;

  /**
   * 進捗を通知する
   */
  const emitProgress = (progress: number): void => {
    progressCallbacks.forEach((cb) => cb(progress));
  };

  /**
   * RuntimeResolver でモードを判定する
   */
  const resolveRuntime = async (): Promise<RuntimeResolution> => {
    if (!runtimeResolver) {
      // RuntimeResolver が未注入の場合は integrated をデフォルトとする
      return { type: "integrated" };
    }
    return runtimeResolver.resolve();
  };

  /**
   * integrated モードでスキルを実行する
   */
  const executeIntegrated = async (
    phase: SkillPhase,
    projectPath: string,
    startTime: number,
  ): Promise<SkillExecutionResult> => {
    const skillName = getSkillName(phase);

    // modifier フェーズは modifier-skill.ts のユーティリティを使用（AC-4）
    if (phase === "modifier") {
      const htmlPath = `${projectPath}/index.html`;
      const structurePath = `${projectPath}/structure.md`;

      const [htmlContent, structureContent] = await Promise.all([
        readFile(htmlPath, "utf-8"),
        readFile(structurePath, "utf-8"),
      ]);

      const context: ModifierContext = {
        projectPath,
        htmlContent,
        structureContent,
      };

      const prompt = buildModifierPrompt(context);
      const agentAPI = getAgentAPI();
      const response = await agentAPI.query({
        prompt,
        options: {
          systemPrompt:
            "You are a slide structure analyzer. Analyze HTML changes and output JSON format only.",
          timeout: SDK_TIMEOUT,
        },
      });

      const parsed = parseModifierResponse(response.content);
      return {
        phase,
        success: parsed.success,
        output: `Skill ${skillName} executed successfully`,
        duration: Date.now() - startTime,
        changes: parsed.changes || [],
        direction: "reverse" as const,
        projectPath,
      };
    }

    // 他のフェーズ
    const prompt = generateSkillPrompt(phase, projectPath);
    const systemPrompt = getSystemPromptForPhase(phase);

    const agentAPI = getAgentAPI();
    await agentAPI.query({
      prompt,
      options: {
        systemPrompt,
        timeout: SDK_TIMEOUT,
      },
    });

    return {
      phase,
      success: true,
      output: `Skill ${skillName} executed successfully`,
      duration: Date.now() - startTime,
    };
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

        // RuntimeResolver でモードを判定（AC-3）
        const resolution = await resolveRuntime();

        emitProgress(25);

        if (cancelled) {
          throw new Error("Cancelled");
        }

        // handoff モード: ガイダンスを返す
        if (resolution.type === "handoff") {
          emitProgress(100);
          return {
            phase,
            success: true,
            duration: Date.now() - startTime,
            isHandoff: true,
            guidance: buildHandoffGuidance(
              phase,
              projectPath,
              resolution.reason,
            ),
          };
        }

        // integrated モード: SDK 経由で実行
        emitProgress(50);
        const result = await executeIntegrated(phase, projectPath, startTime);
        emitProgress(100);
        return result;
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
