/**
 * フォームバリデーション統合テンプレート
 *
 * React Hook Form + Zod + zodResolver を使用した
 * 型安全なフォームバリデーションのテンプレート
 *
 * @template {{FormName}} フォーム名をPascalCaseで置換
 * @template {{formName}} フォーム名をcamelCaseで置換
 * @template {{fieldName}} フィールド名を置換
 */

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ============================================================
// スキーマ定義
// ============================================================

/**
 * フォームスキーマ
 * - 各フィールドにエラーメッセージを設定
 * - 必要に応じて .optional() / .nullable() を追加
 */
export const {{formName}}Schema = z.object({
  // 文字列フィールド
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください"),

  // メールフィールド
  email: z
    .string()
    .email("有効なメールアドレスを入力してください"),

  // パスワードフィールド（強度チェック付き）
  password: z
    .string()
    .min(8, "パスワードは8文字以上")
    .regex(/[A-Z]/, "大文字を含める必要があります")
    .regex(/[0-9]/, "数字を含める必要があります"),

  // オプショナルフィールド
  phone: z
    .string()
    .regex(/^0\d{9,10}$/, "有効な電話番号を入力")
    .optional()
    .or(z.literal("")),

  // 列挙型フィールド
  role: z.enum(["user", "admin", "moderator"], {
    errorMap: () => ({ message: "有効な役割を選択してください" }),
  }),

  // 真偽値フィールド（チェックボックス）
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "利用規約に同意が必要です" }),
  }),

  // 数値フィールド
  age: z.coerce
    .number()
    .int("整数を入力")
    .min(18, "18歳以上である必要があります")
    .max(120, "有効な年齢を入力")
    .optional(),
});

// パスワード確認付きスキーマ
export const {{formName}}WithConfirmSchema = {{formName}}Schema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

// ============================================================
// 型定義
// ============================================================

export type {{FormName}}Data = z.infer<typeof {{formName}}Schema>;
export type {{FormName}}WithConfirmData = z.infer<typeof {{formName}}WithConfirmSchema>;

// ============================================================
// フォームコンポーネント
// ============================================================

interface {{FormName}}FormProps {
  /** 送信成功時のコールバック */
  onSuccess?: (data: {{FormName}}Data) => void;
  /** 送信エラー時のコールバック */
  onError?: (error: Error) => void;
  /** デフォルト値 */
  defaultValues?: Partial<{{FormName}}Data>;
}

export function {{FormName}}Form({
  onSuccess,
  onError,
  defaultValues,
}: {{FormName}}FormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
    setError,
  } = useForm<{{FormName}}Data>({
    resolver: zodResolver({{formName}}Schema),
    mode: "onBlur", // フォーカス離脱時にバリデーション
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "user",
      agreeToTerms: false as unknown as true,
      age: undefined,
      ...defaultValues,
    },
  });

  const onSubmit: SubmitHandler<{{FormName}}Data> = async (data) => {
    try {
      // API呼び出しなど
      console.log("Form submitted:", data);

      // 成功時
      onSuccess?.(data);
      reset(); // フォームリセット
    } catch (error) {
      // サーバーエラー時
      if (error instanceof Error) {
        // 特定フィールドにエラーをセット
        setError("root", { message: error.message });
        onError?.(error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* グローバルエラー */}
      {errors.root && (
        <div role="alert" className="error-banner">
          {errors.root.message}
        </div>
      )}

      {/* 名前フィールド */}
      <div className="field">
        <label htmlFor="name">
          名前 <span aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <span id="name-error" role="alert" className="error">
            {errors.name.message}
          </span>
        )}
      </div>

      {/* メールフィールド */}
      <div className="field">
        <label htmlFor="email">
          メールアドレス <span aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="error">
            {errors.email.message}
          </span>
        )}
      </div>

      {/* パスワードフィールド */}
      <div className="field">
        <label htmlFor="password">
          パスワード <span aria-hidden="true">*</span>
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <span id="password-error" role="alert" className="error">
            {errors.password.message}
          </span>
        )}
      </div>

      {/* 電話番号フィールド（オプション） */}
      <div className="field">
        <label htmlFor="phone">電話番号</label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          aria-invalid={errors.phone ? "true" : "false"}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {errors.phone && (
          <span id="phone-error" role="alert" className="error">
            {errors.phone.message}
          </span>
        )}
      </div>

      {/* 役割選択（Select + Controller） */}
      <div className="field">
        <label htmlFor="role">
          役割 <span aria-hidden="true">*</span>
        </label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <select
              id="role"
              {...field}
              aria-invalid={errors.role ? "true" : "false"}
            >
              <option value="user">ユーザー</option>
              <option value="admin">管理者</option>
              <option value="moderator">モデレーター</option>
            </select>
          )}
        />
        {errors.role && (
          <span role="alert" className="error">
            {errors.role.message}
          </span>
        )}
      </div>

      {/* 年齢フィールド（オプション、数値） */}
      <div className="field">
        <label htmlFor="age">年齢</label>
        <input
          id="age"
          type="number"
          {...register("age")}
          aria-invalid={errors.age ? "true" : "false"}
          aria-describedby={errors.age ? "age-error" : undefined}
        />
        {errors.age && (
          <span id="age-error" role="alert" className="error">
            {errors.age.message}
          </span>
        )}
      </div>

      {/* 利用規約同意（チェックボックス） */}
      <div className="field checkbox">
        <label>
          <input
            type="checkbox"
            {...register("agreeToTerms")}
            aria-invalid={errors.agreeToTerms ? "true" : "false"}
          />
          <span>
            利用規約に同意します <span aria-hidden="true">*</span>
          </span>
        </label>
        {errors.agreeToTerms && (
          <span role="alert" className="error">
            {errors.agreeToTerms.message}
          </span>
        )}
      </div>

      {/* 送信ボタン */}
      <div className="actions">
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          aria-disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? "送信中..." : "送信"}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          disabled={!isDirty || isSubmitting}
        >
          リセット
        </button>
      </div>
    </form>
  );
}

// ============================================================
// スタイル（CSS-in-JS or CSS Modules推奨）
// ============================================================

/**
 * 最低限のスタイル例（実際のプロジェクトではCSS Modules等を使用）
 *
 * .field {
 *   margin-bottom: 1rem;
 * }
 *
 * .field label {
 *   display: block;
 *   margin-bottom: 0.25rem;
 * }
 *
 * .field input,
 * .field select {
 *   width: 100%;
 *   padding: 0.5rem;
 *   border: 1px solid #ccc;
 * }
 *
 * .field input[aria-invalid="true"],
 * .field select[aria-invalid="true"] {
 *   border-color: #dc2626;
 * }
 *
 * .error {
 *   color: #dc2626;
 *   font-size: 0.875rem;
 * }
 *
 * .error-banner {
 *   background: #fef2f2;
 *   border: 1px solid #dc2626;
 *   padding: 1rem;
 *   margin-bottom: 1rem;
 * }
 *
 * .checkbox label {
 *   display: flex;
 *   align-items: center;
 *   gap: 0.5rem;
 * }
 *
 * .actions {
 *   display: flex;
 *   gap: 1rem;
 * }
 *
 * button:disabled {
 *   opacity: 0.5;
 *   cursor: not-allowed;
 * }
 */
