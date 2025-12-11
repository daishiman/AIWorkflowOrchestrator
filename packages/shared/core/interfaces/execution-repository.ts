import type { Execution } from "../entities/execution";
import type {
  PaginationParams,
  PaginatedResult,
  ExecutionStatus,
} from "../../types";

/**
 * 実行リポジトリインターフェース
 */
export interface IExecutionRepository {
  /**
   * IDで実行を検索
   */
  findById(id: string): Promise<Execution | null>;

  /**
   * ワークフローIDで実行を検索
   */
  findByWorkflowId(
    workflowId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResult<Execution>>;

  /**
   * ステータスで実行を検索
   */
  findByStatus(status: ExecutionStatus): Promise<Execution[]>;

  /**
   * 実行を保存
   */
  save(execution: Execution): Promise<void>;

  /**
   * 実行を更新
   */
  update(execution: Execution): Promise<void>;

  /**
   * 実行を削除
   */
  delete(id: string): Promise<void>;

  /**
   * ワークフローに紐づく実行をすべて削除
   */
  deleteByWorkflowId(workflowId: string): Promise<void>;
}
