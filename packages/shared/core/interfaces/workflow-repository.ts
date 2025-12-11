import type { Workflow } from "../entities/workflow";
import type { PaginationParams, PaginatedResult } from "../../types";

/**
 * ワークフローリポジトリインターフェース
 */
export interface IWorkflowRepository {
  /**
   * IDでワークフローを検索
   */
  findById(id: string): Promise<Workflow | null>;

  /**
   * すべてのワークフローを取得（ページネーション対応）
   */
  findAll(params?: PaginationParams): Promise<PaginatedResult<Workflow>>;

  /**
   * アクティブなワークフローを取得
   */
  findActive(): Promise<Workflow[]>;

  /**
   * ワークフローを保存
   */
  save(workflow: Workflow): Promise<void>;

  /**
   * ワークフローを更新
   */
  update(workflow: Workflow): Promise<void>;

  /**
   * ワークフローを削除
   */
  delete(id: string): Promise<void>;

  /**
   * IDが存在するか確認
   */
  exists(id: string): Promise<boolean>;
}
