/**
 * Validation Schema Template
 *
 * このファイルをコピーしてプロジェクトに合わせてカスタマイズしてください。
 *
 * Usage:
 *   1. このファイルを src/schemas/ にコピー
 *   2. スキーマをプロジェクトに合わせて定義
 *   3. ミドルウェアまたはハンドラーで使用
 */

import { z } from "zod";

// =============================================================================
// 基本的なスキーマパーツ
// =============================================================================

/** UUID検証 */
export const uuidSchema = z.string().uuid();

/** Email検証 */
export const emailSchema = z.string().email().max(254);

/** 安全な文字列（XSS対策） */
export const safeStringSchema = z
  .string()
  .max(10000)
  .refine((val) => !/<script/i.test(val), {
    message: "Script tags are not allowed",
  });

/** ページネーション */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** ソート */
export const sortSchema = <T extends readonly string[]>(allowedColumns: T) =>
  z.object({
    sortBy: z
      .enum(allowedColumns as unknown as [string, ...string[]])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  });

// =============================================================================
// APIリクエストスキーマ例
// =============================================================================

/**
 * ユーザー作成スキーマ
 */
export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain alphanumeric characters and underscores",
      ),
    email: emailSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];

/**
 * ユーザー取得スキーマ
 */
export const getUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/**
 * ユーザー一覧スキーマ
 */
export const listUsersSchema = z.object({
  query: paginationSchema
    .merge(sortSchema(["name", "email", "createdAt"] as const))
    .extend({
      search: z.string().max(100).optional(),
      role: z.enum(["user", "admin", "moderator"]).optional(),
    }),
});

// =============================================================================
// ファイルアップロードスキーマ
// =============================================================================

export const fileUploadSchema = z.object({
  filename: z
    .string()
    .max(255)
    .regex(/^[\w\-. ]+$/, "Invalid filename characters"),
  mimetype: z.enum(["image/jpeg", "image/png", "image/gif", "application/pdf"]),
  size: z.number().max(10 * 1024 * 1024, "File size must be under 10MB"),
});

// =============================================================================
// カスタムバリデーター
// =============================================================================

/**
 * 日付範囲バリデーション
 */
export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be before end date",
    path: ["endDate"],
  });

/**
 * URLバリデーション（HTTP/HTTPSのみ）
 */
export const safeUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "Only HTTP/HTTPS URLs are allowed" },
  );

// =============================================================================
// 使用例
// =============================================================================

/*
// Express ミドルウェアでの使用例

import { Request, Response, NextFunction } from 'express';

export const validate = <T extends z.ZodSchema>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

// ルートでの使用
app.post('/users', validate(createUserSchema), createUserHandler);
app.get('/users/:id', validate(getUserSchema), getUserHandler);
app.get('/users', validate(listUsersSchema), listUsersHandler);
*/
