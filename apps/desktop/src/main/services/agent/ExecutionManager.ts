/**
 * ExecutionManager - 複数のエージェント実行を管理
 *
 * エグゼキュータのライフサイクル管理、キャンセル、Permission解決を担当
 *
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import type { BrowserWindow } from "electron";
import { v4 as uuidv4 } from "uuid";
import {
  AGENT_DEFAULTS,
  type AgentExecutionRequest,
  type PermissionResponse,
  type PermissionRules,
} from "@repo/shared";
import { AgentExecutor } from "./AgentExecutor";

/**
 * ExecutionManager - 複数実行管理クラス
 */
export class ExecutionManager {
  private executions: Map<string, AgentExecutor> = new Map();

  /**
   * 実行を開始する
   *
   * @param request 実行リクエスト
   * @param mainWindow BrowserWindow
   * @param customRules カスタム権限ルール
   * @returns 実行ID
   */
  async startExecution(
    request: AgentExecutionRequest,
    mainWindow: BrowserWindow,
    customRules?: PermissionRules,
  ): Promise<string> {
    // 最大同時実行数チェック
    if (this.executions.size >= AGENT_DEFAULTS.MAX_CONCURRENT_EXECUTIONS) {
      throw new Error(
        `Maximum concurrent executions (${AGENT_DEFAULTS.MAX_CONCURRENT_EXECUTIONS}) reached`,
      );
    }

    // 実行IDを生成（未指定の場合）
    const executionId = request.executionId || uuidv4();
    const requestWithId: AgentExecutionRequest = {
      ...request,
      executionId,
    };

    // AgentExecutorを作成
    const executor = new AgentExecutor(requestWithId, mainWindow, customRules);

    // Mapに登録
    this.executions.set(executionId, executor);

    // 非同期で実行開始（完了を待たない）
    executor.start().finally(() => {
      // 完了後にMapから削除
      this.executions.delete(executionId);
    });

    return executionId;
  }

  /**
   * 特定の実行を停止する
   *
   * @param executionId 実行ID
   * @returns 停止成功かどうか
   */
  stopExecution(executionId: string): boolean {
    const executor = this.executions.get(executionId);
    if (!executor) {
      return false;
    }

    executor.stop();
    return true;
  }

  /**
   * すべての実行を停止する
   */
  stopAllExecutions(): void {
    for (const executor of this.executions.values()) {
      executor.stop();
    }
  }

  /**
   * アクティブな実行ID一覧を取得する
   *
   * @returns 実行IDの配列
   */
  getActiveExecutions(): string[] {
    return Array.from(this.executions.keys());
  }

  /**
   * 特定の実行のPermissionを解決する
   *
   * @param executionId 実行ID
   * @param response Permission応答
   * @returns 解決成功かどうか
   */
  resolvePermission(
    executionId: string,
    response: PermissionResponse,
  ): boolean {
    const executor = this.executions.get(executionId);
    if (!executor) {
      return false;
    }

    executor.resolvePermission(response);
    return true;
  }
}
