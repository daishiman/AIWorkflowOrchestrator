import type { WorkflowBase, WorkflowStatus, WorkflowType } from '../../types';

/**
 * ワークフローエンティティ
 */
export class Workflow implements WorkflowBase {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly type: WorkflowType,
    public triggerPath: string | null,
    public status: WorkflowStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * ワークフローを有効化
   */
  activate(): void {
    if (this.status === 'active') {
      return;
    }
    this.status = 'active';
    this.updatedAt = new Date();
  }

  /**
   * ワークフローを無効化
   */
  deactivate(): void {
    if (this.status === 'inactive') {
      return;
    }
    this.status = 'inactive';
    this.updatedAt = new Date();
  }

  /**
   * 監視パスを更新
   */
  updateTriggerPath(path: string | null): void {
    this.triggerPath = path;
    this.updatedAt = new Date();
  }

  /**
   * 名前を更新
   */
  updateName(name: string): void {
    if (!name.trim()) {
      throw new Error('Workflow name cannot be empty');
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  /**
   * 静的ファクトリメソッド
   */
  static create(params: {
    id: string;
    name: string;
    type?: WorkflowType;
    triggerPath?: string | null;
  }): Workflow {
    const now = new Date();
    return new Workflow(
      params.id,
      params.name,
      params.type ?? 'file_watch',
      params.triggerPath ?? null,
      'active',
      now,
      now
    );
  }
}
