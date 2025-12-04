import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { executions } from './executions';

export const logs = sqliteTable(
  'logs',
  {
    id: text('id').primaryKey(),
    executionId: text('execution_id')
      .notNull()
      .references(() => executions.id, { onDelete: 'cascade' }),
    level: text('level').notNull().default('info'),
    message: text('message').notNull(),
    metadata: text('metadata'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_logs_execution_id').on(table.executionId),
    index('idx_logs_level').on(table.level),
    index('idx_logs_created_at').on(table.createdAt),
  ]
);

export type LogRecord = typeof logs.$inferSelect;
export type NewLogRecord = typeof logs.$inferInsert;
