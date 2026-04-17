/**
 * ScriptExecutor - スクリプト実行基盤
 * TASK-9B-G: skill-creator-service
 *
 * Script First原則に基づき、決定論的処理をスクリプトに委譲する
 */

import { spawn } from "child_process";
import path from "path";
import type { ScriptResult } from "@repo/shared/types";

interface ExecuteOptions {
  signal?: AbortSignal;
}

export class ScriptExecutor {
  private readonly scriptsDir: string;

  constructor(skillCreatorPath: string) {
    this.scriptsDir = path.join(skillCreatorPath, "scripts");
  }

  /**
   * スクリプト名を検証し、パストラバーサルを防止
   *
   * @param scriptName - 検証するスクリプト名
   * @throws Error - パストラバーサルが検出された場合
   */
  private validateScriptName(scriptName: string): void {
    // パストラバーサル文字列を検出
    if (
      scriptName.includes("..") ||
      scriptName.includes("/") ||
      scriptName.includes("\\")
    ) {
      throw new Error(
        `Invalid script name: ${scriptName}. Path traversal is not allowed.`,
      );
    }
  }

  private createAbortError(scriptName: string): Error {
    const error = new Error(`Script ${scriptName} was aborted`);
    error.name = "AbortError";
    return error;
  }

  /**
   * スクリプトを実行し、結果を返す
   *
   * @param scriptName - 実行するスクリプト名（例: "detect_mode.js"）
   * @param args - スクリプトに渡す引数
   * @param options - 実行オプション
   * @returns ScriptResult - 実行結果（success, stdout, stderr, exitCode）
   * @throws Error - パストラバーサルが検出された場合
   */
  async execute(
    scriptName: string,
    args: string[],
    options: ExecuteOptions = {},
  ): Promise<ScriptResult> {
    this.validateScriptName(scriptName);
    const scriptPath = path.join(this.scriptsDir, scriptName);

    if (options.signal?.aborted) {
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    }

    return new Promise((resolve, reject) => {
      if (options.signal?.aborted) {
        reject(this.createAbortError(scriptName));
        return;
      }

      const proc = spawn("node", [scriptPath, ...args]);
      let stdout = "";
      let stderr = "";
      let settled = false;

      const cleanup = () => {
        options.signal?.removeEventListener("abort", handleAbort);
      };

      const settle = (fn: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        fn();
      };

      const handleAbort = () => {
        settle(() => {
          try {
            proc.kill("SIGTERM");
          } catch {
            // noop: abort は失敗を握りつぶして AbortError を優先する
          }
          reject(this.createAbortError(scriptName));
        });
      };

      if (options.signal) {
        options.signal.addEventListener("abort", handleAbort, { once: true });
      }

      proc.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on("error", (error: Error) => {
        settle(() => {
          reject(
            new Error(
              `Failed to execute script ${scriptName}: ${error.message}`,
            ),
          );
        });
      });

      proc.on("close", (exitCode: number | null) => {
        settle(() => {
          resolve({
            success: exitCode === 0,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: exitCode ?? 1,
          });
        });
      });
    });
  }

  /**
   * JSON出力スクリプトを実行し、パース結果を返す
   *
   * @param scriptName - 実行するスクリプト名
   * @param args - スクリプトに渡す引数
   * @returns パースされたJSONオブジェクト
   * @throws Error - スクリプト失敗時またはJSONパース失敗時
   */
  async executeJson<T>(
    scriptName: string,
    args: string[],
    options: ExecuteOptions = {},
  ): Promise<T> {
    const result = await this.execute(scriptName, args, options);

    if (!result.success) {
      throw new Error(`Script ${scriptName} failed: ${result.stderr}`);
    }

    return JSON.parse(result.stdout) as T;
  }
}
