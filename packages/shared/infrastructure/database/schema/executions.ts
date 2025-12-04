import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { workflows } from './workflows';

export const executions = sqliteTable(
  'executions',
  {
    id: text('id').primaryKey(),
    workflowId: text('workflow_id')
      .notNull()
      .references(() => workflows.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('pending'),
    inputPayload: text('input_payload'),
    outputPayload: text('output_payload'),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').notNull().default(0),
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_executions_workflow_id').on(table.workflowId),
    index('idx_executions_status').on(table.status),
    index('idx_executions_created_at').on(table.createdAt),
  ]
);

export type ExecutionRecord = typeof executions.$inferSelect;
export type NewExecutionRecord = typeof executions.$inferInsert;
