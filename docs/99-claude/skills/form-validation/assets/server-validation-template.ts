import { z } from "zod";
import { userRegistrationSchema } from "./zod-schema-template";

/**
 * サーバー側バリデーションテンプレート
 *
 * このテンプレートは、APIエンドポイントでのサーバー側バリデーション実装例を提供します。
 * セキュリティ要件として、すべての入力はサーバー側で再検証する必要があります。
 */

// ========================================
// エラーレスポンス型定義
// ========================================

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

interface ErrorResponse {
  success: false;
  errors: ValidationError[];
  message?: string;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ========================================
// バリデーションヘルパー関数
// ========================================

/**
 * Zodエラーを整形されたエラーレスポンスに変換
 */
function formatZodError(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}

/**
 * 汎用バリデーション関数
 */
function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: formatZodError(result.error),
  };
}

// ========================================
// Next.js API Route例（App Router）
// ========================================

/**
 * ユーザー登録APIエンドポイント
 * Next.js App Router (app/api/users/register/route.ts)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // リクエストボディの取得
    const body = await request.json();

    // バリデーション実行
    const validation = validateRequest(userRegistrationSchema, body);

    if (!validation.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        errors: validation.errors || [],
        message: "バリデーションエラーが発生しました",
      };

      return Response.json(errorResponse, { status: 400 });
    }

    // バリデーション成功後の処理
    const userData = validation.data;

    // データベース保存等の処理
    // const user = await createUser(userData);

    // 成功レスポンス
    const successResponse: SuccessResponse<{ id: string; email: string }> = {
      success: true,
      data: {
        id: "generated-user-id",
        email: userData.email,
      },
      message: "ユーザー登録が完了しました",
    };

    return Response.json(successResponse, { status: 201 });
  } catch (error) {
    // サーバーエラーハンドリング
    console.error("Registration error:", error);

    const errorResponse: ErrorResponse = {
      success: false,
      errors: [],
      message: "サーバーエラーが発生しました",
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

// ========================================
// Express.js例
// ========================================

/**
 * ユーザー登録APIエンドポイント（Express.js）
 */
export function createUserRegistrationHandler() {
  return async (req: any, res: any) => {
    try {
      const validation = validateRequest(userRegistrationSchema, req.body);

      if (!validation.success) {
        const errorResponse: ErrorResponse = {
          success: false,
          errors: validation.errors || [],
          message: "バリデーションエラーが発生しました",
        };

        return res.status(400).json(errorResponse);
      }

      const userData = validation.data;

      // データベース保存等の処理
      // const user = await createUser(userData);

      const successResponse: SuccessResponse<{ id: string; email: string }> = {
        success: true,
        data: {
          id: "generated-user-id",
          email: userData.email,
        },
        message: "ユーザー登録が完了しました",
      };

      return res.status(201).json(successResponse);
    } catch (error) {
      console.error("Registration error:", error);

      const errorResponse: ErrorResponse = {
        success: false,
        errors: [],
        message: "サーバーエラーが発生しました",
      };

      return res.status(500).json(errorResponse);
    }
  };
}

// ========================================
// バリデーションミドルウェア（Express.js）
// ========================================

/**
 * 汎用バリデーションミドルウェア
 */
export function validationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    const validation = validateRequest(schema, req.body);

    if (!validation.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        errors: validation.errors || [],
        message: "バリデーションエラーが発生しました",
      };

      return res.status(400).json(errorResponse);
    }

    // バリデーション成功時、検証済みデータを req.validatedData に設定
    req.validatedData = validation.data;
    next();
  };
}

// 使用例:
// app.post('/api/users/register',
//   validationMiddleware(userRegistrationSchema),
//   async (req, res) => {
//     const userData = req.validatedData;
//     // 処理続行
//   }
// );

// ========================================
// カスタムバリデーション例（サーバー側のみ）
// ========================================

/**
 * メールアドレスの重複チェック（データベース確認）
 */
async function checkEmailUnique(email: string): Promise<boolean> {
  // データベースでメールアドレスの存在確認
  // const existingUser = await db.user.findUnique({ where: { email } });
  // return !existingUser;

  // 仮実装
  return true;
}

/**
 * サーバー側追加バリデーション付きスキーマ
 */
export async function validateUserRegistrationWithDb(data: unknown): Promise<{
  success: boolean;
  data?: z.infer<typeof userRegistrationSchema>;
  errors?: ValidationError[];
}> {
  // 基本バリデーション
  const baseValidation = validateRequest(userRegistrationSchema, data);

  if (!baseValidation.success) {
    return baseValidation;
  }

  const userData = baseValidation.data;

  // データベース依存のカスタムバリデーション
  const isEmailUnique = await checkEmailUnique(userData.email);

  if (!isEmailUnique) {
    return {
      success: false,
      errors: [
        {
          field: "email",
          message: "このメールアドレスは既に登録されています",
          code: "email_already_exists",
        },
      ],
    };
  }

  return {
    success: true,
    data: userData,
  };
}
