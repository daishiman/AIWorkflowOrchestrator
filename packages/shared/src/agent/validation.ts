/**
 * Agent SDK Validation Schemas (Zod)
 * @module @repo/shared/agent/validation
 */

import { z } from "zod";

/**
 * UUID v4形式の正規表現
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * クエリオプションスキーマ
 * - timeout: 1000-300000ms
 * - sessionId: UUID v4形式
 * - systemPrompt: 最大5000文字
 */
export const queryOptionsSchema = z
  .object({
    timeout: z.number().min(1000).max(300000).optional(),
    sessionId: z
      .string()
      .regex(UUID_V4_REGEX, "Invalid UUID format")
      .optional(),
    systemPrompt: z.string().max(5000).optional(),
  })
  .strict();

export type QueryOptionsInput = z.input<typeof queryOptionsSchema>;
export type QueryOptionsOutput = z.output<typeof queryOptionsSchema>;

/**
 * クエリリクエストスキーマ
 * - prompt: 1-10000文字（必須）
 * - options: QueryOptions（オプション）
 */
export const queryRequestSchema = z
  .object({
    prompt: z.string().min(1).max(10000),
    options: queryOptionsSchema.optional(),
  })
  .strict();

export type QueryRequestInput = z.input<typeof queryRequestSchema>;
export type QueryRequestOutput = z.output<typeof queryRequestSchema>;

/**
 * セッション再開リクエストスキーマ
 * - sessionId: UUID v4形式（必須）
 */
export const resumeSessionRequestSchema = z
  .object({
    sessionId: z.string().regex(UUID_V4_REGEX, "Invalid UUID format"),
  })
  .strict();

export type ResumeSessionRequestInput = z.input<
  typeof resumeSessionRequestSchema
>;
export type ResumeSessionRequestOutput = z.output<
  typeof resumeSessionRequestSchema
>;

/**
 * セッション破棄リクエストスキーマ
 * - sessionId: UUID v4形式（必須）
 */
export const destroySessionRequestSchema = z
  .object({
    sessionId: z.string().regex(UUID_V4_REGEX, "Invalid UUID format"),
  })
  .strict();

export type DestroySessionRequestInput = z.input<
  typeof destroySessionRequestSchema
>;
export type DestroySessionRequestOutput = z.output<
  typeof destroySessionRequestSchema
>;

// ============================================
// Session Persistence Schemas
// ============================================

/**
 * PersistedSession スキーマ
 */
export const persistedSessionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.number().int().positive(),
  lastAccessedAt: z.number().int().positive(),
  isActive: z.boolean(),
  messageCount: z.number().int().nonnegative(),
  title: z.string().max(200).optional(),
});

export type PersistedSessionInput = z.input<typeof persistedSessionSchema>;
export type PersistedSessionOutput = z.output<typeof persistedSessionSchema>;

/**
 * PersistedMessage スキーマ
 */
export const persistedMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  role: z.enum(["user", "assistant"]),
  content: z.string().max(100000), // 100KB制限
  timestamp: z.number().int().positive(),
});

export type PersistedMessageInput = z.input<typeof persistedMessageSchema>;
export type PersistedMessageOutput = z.output<typeof persistedMessageSchema>;

/**
 * StorageMetadata スキーマ
 */
export const storageMetadataSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // semver format
  lastUpdated: z.number().int().positive(),
  totalSize: z.number().int().nonnegative(),
});

export type StorageMetadataInput = z.input<typeof storageMetadataSchema>;
export type StorageMetadataOutput = z.output<typeof storageMetadataSchema>;

/**
 * SessionStorageSchema スキーマ
 */
export const sessionStorageSchemaSchema = z.object({
  sessions: z.array(persistedSessionSchema),
  messages: z.record(z.string().uuid(), z.array(persistedMessageSchema)),
  metadata: storageMetadataSchema,
});

export type SessionStorageSchemaInput = z.input<
  typeof sessionStorageSchemaSchema
>;
export type SessionStorageSchemaOutput = z.output<
  typeof sessionStorageSchemaSchema
>;

/**
 * SessionPersistenceConfig スキーマ
 */
export const sessionPersistenceConfigSchema = z.object({
  maxSessions: z.number().int().positive().max(1000),
  maxStorageSize: z
    .number()
    .int()
    .positive()
    .max(200 * 1024 * 1024), // max 200MB
  maxMessagesPerSession: z.number().int().positive().max(10000),
  enableAutoBackup: z.boolean(),
  backupRetentionCount: z.number().int().positive().max(10),
  lruWarningThreshold: z.number().min(0.5).max(1.0),
});

export type SessionPersistenceConfigInput = z.input<
  typeof sessionPersistenceConfigSchema
>;
export type SessionPersistenceConfigOutput = z.output<
  typeof sessionPersistenceConfigSchema
>;
