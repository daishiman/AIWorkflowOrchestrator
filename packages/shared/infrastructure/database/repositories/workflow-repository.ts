import { eq, sql, count } from 'drizzle-orm';
import type { DbClient } from '../client';
import type { IWorkflowRepository } from '../../../core/interfaces';
import { Workflow } from '../../../core/entities';
import { workflows, type WorkflowRecord } from '../schema';
import type { PaginationParams, PaginatedResult, WorkflowStatus, WorkflowType } from '../../../types';

/**
 * ワークフローリポジトリ実装
 */
export class WorkflowRepository implements IWorkflowRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: string): Promise<Workflow | null> {
    const result = await this.db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<Workflow>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const offset = (page - 1) * limit;

    const [items, totalResult] = await Promise.all([
      this.db
        .select()
        .from(workflows)
        .limit(limit)
        .offset(offset)
        .orderBy(workflows.createdAt),
      this.db.select({ count: count() }).from(workflows),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return {
      items: items.map((r) => this.toEntity(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActive(): Promise<Workflow[]> {
    const result = await this.db
      .select()
      .from(workflows)
      .where(eq(workflows.status, 'active'));

    return result.map((r) => this.toEntity(r));
  }

  async save(workflow: Workflow): Promise<void> {
    await this.db.insert(workflows).values(this.toRecord(workflow));
  }

  async update(workflow: Workflow): Promise<void> {
    await this.db
      .update(workflows)
      .set({
        name: workflow.name,
        triggerPath: workflow.triggerPath,
        status: workflow.status,
        updatedAt: workflow.updatedAt.toISOString(),
      })
      .where(eq(workflows.id, workflow.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(workflows).where(eq(workflows.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db
      .select({ id: workflows.id })
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1);

    return result.length > 0;
  }

  private toEntity(record: WorkflowRecord): Workflow {
    return new Workflow(
      record.id,
      record.name,
      record.type as WorkflowType,
      record.triggerPath,
      record.status as WorkflowStatus,
      new Date(record.createdAt),
      new Date(record.updatedAt)
    );
  }

  private toRecord(entity: Workflow): typeof workflows.$inferInsert {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      triggerPath: entity.triggerPath,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
