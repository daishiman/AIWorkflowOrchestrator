import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const workflows = sqliteTable(
  'workflows',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull().default('file_watch'),
    triggerPath: text('trigger_path'),
    status: text('status').notNull().default('active'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_workflows_status').on(table.status),
    index('idx_workflows_type').on(table.type),
  ]
);

export type WorkflowRecord = typeof workflows.$inferSelect;
export type NewWorkflowRecord = typeof workflows.$inferInsert;
