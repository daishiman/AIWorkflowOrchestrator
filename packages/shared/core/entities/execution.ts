import type { ExecutionBase, ExecutionStatus } from "../../types";

/**
 * 実行エンティティ
 */
export class Execution implements ExecutionBase {
  constructor(
    public readonly id: string,
    public readonly workflowId: string,
    public status: ExecutionStatus,
    public inputPayload: Record<string, unknown> | null,
    public outputPayload: Record<string, unknown> | null,
    public errorMessage: string | null,
    public retryCount: number,
    public startedAt: Date | null,
    public completedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * 実行を開始
   */
  start(): void {
    if (this.status !== "pending") {
      throw new Error(`Cannot start execution in ${this.status} status`);
    }
    this.status = "running";
    this.startedAt = new Date();
  }

  /**
   * 実行を完了
   */
  complete(output: Record<string, unknown>): void {
    if (this.status !== "running") {
      throw new Error(`Cannot complete execution in ${this.status} status`);
    }
    this.status = "completed";
    this.outputPayload = output;
    this.completedAt = new Date();
  }

  /**
   * 実行を失敗
   */
  fail(errorMessage: string): void {
    if (this.status !== "running") {
      throw new Error(`Cannot fail execution in ${this.status} status`);
    }
    this.status = "failed";
    this.errorMessage = errorMessage;
    this.completedAt = new Date();
  }

  /**
   * リトライ
   */
  retry(): void {
    if (this.status !== "failed") {
      throw new Error(`Cannot retry execution in ${this.status} status`);
    }
    this.status = "pending";
    this.retryCount += 1;
    this.errorMessage = null;
    this.completedAt = null;
    this.startedAt = null;
  }

  /**
   * 静的ファクトリメソッド
   */
  static create(params: {
    id: string;
    workflowId: string;
    inputPayload?: Record<string, unknown>;
  }): Execution {
    return new Execution(
      params.id,
      params.workflowId,
      "pending",
      params.inputPayload ?? null,
      null,
      null,
      0,
      null,
      null,
      new Date(),
    );
  }
}
