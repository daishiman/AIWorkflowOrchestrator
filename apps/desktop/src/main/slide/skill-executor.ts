/**
 * スキル実行器
 * Claude Agent SDK経由でスキルを実行する
 * @module main/slide/skill-executor
 */

import type { SkillPhase, SkillExecutionResult } from "@repo/shared";

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
    async execute(phase, _projectPath) {
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

        emitProgress(25);

        // キャンセルチェック
        if (cancelled) {
          throw new Error("Cancelled");
        }

        emitProgress(50);

        // TODO: Claude Agent SDK統合後に実装
        // 現在はシミュレーション
        // const result = await executeWithAgentSDK(skillName, projectPath, abortController.signal);

        // スキル実行のシミュレーション（Agent SDK統合まで）
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve();
          }, 1000);

          // キャンセル時のクリーンアップ
          abortController?.signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(new Error("Cancelled"));
          });
        });

        // キャンセルチェック
        if (cancelled) {
          throw new Error("Cancelled");
        }

        emitProgress(100);

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
