import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userRegistrationSchema,
  type UserRegistrationFormData,
} from "./zod-schema-template";

/**
 * React Hook Form + Zod統合テンプレート
 *
 * このテンプレートは、react-hook-formとZodを統合したフォームコンポーネントの実装例を提供します。
 */

// ========================================
// フォームコンポーネント
// ========================================

export function UserRegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserRegistrationFormData>({
    resolver: zodResolver(userRegistrationSchema),
    mode: "onBlur", // バリデーションタイミング: フォーカスアウト時
  });

  const onSubmit = async (data: UserRegistrationFormData) => {
    try {
      // サーバー側バリデーションとデータ送信
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Server validation error:", error);
        // サーバー側エラーの処理
        return;
      }

      const result = await response.json();
      console.log("Registration successful:", result);
      // 成功時の処理（リダイレクト等）
    } catch (error) {
      console.error("Network error:", error);
      // ネットワークエラーの処理
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* メールアドレス */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          メールアドレス *
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`mt-1 block w-full rounded-md ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* パスワード */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          パスワード *
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className={`mt-1 block w-full rounded-md ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={
            errors.password ? "password-error password-hint" : "password-hint"
          }
        />
        <p id="password-hint" className="mt-1 text-sm text-gray-500">
          8文字以上、英大文字・小文字・数字を各1文字以上含む
        </p>
        {errors.password && (
          <p
            id="password-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {/* パスワード確認 */}
      <div>
        <label
          htmlFor="passwordConfirmation"
          className="block text-sm font-medium"
        >
          パスワード（確認） *
        </label>
        <input
          id="passwordConfirmation"
          type="password"
          {...register("passwordConfirmation")}
          className={`mt-1 block w-full rounded-md ${
            errors.passwordConfirmation ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={errors.passwordConfirmation ? "true" : "false"}
          aria-describedby={
            errors.passwordConfirmation
              ? "password-confirmation-error"
              : undefined
          }
        />
        {errors.passwordConfirmation && (
          <p
            id="password-confirmation-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.passwordConfirmation.message}
          </p>
        )}
      </div>

      {/* 姓 */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium">
          姓 *
        </label>
        <input
          id="lastName"
          type="text"
          {...register("lastName")}
          className={`mt-1 block w-full rounded-md ${
            errors.lastName ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={errors.lastName ? "true" : "false"}
          aria-describedby={errors.lastName ? "lastName-error" : undefined}
        />
        {errors.lastName && (
          <p
            id="lastName-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.lastName.message}
          </p>
        )}
      </div>

      {/* 名 */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium">
          名 *
        </label>
        <input
          id="firstName"
          type="text"
          {...register("firstName")}
          className={`mt-1 block w-full rounded-md ${
            errors.firstName ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={errors.firstName ? "true" : "false"}
          aria-describedby={errors.firstName ? "firstName-error" : undefined}
        />
        {errors.firstName && (
          <p
            id="firstName-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.firstName.message}
          </p>
        )}
      </div>

      {/* 電話番号（任意） */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium">
          電話番号（任意）
        </label>
        <input
          id="phoneNumber"
          type="tel"
          {...register("phoneNumber")}
          className={`mt-1 block w-full rounded-md ${
            errors.phoneNumber ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={errors.phoneNumber ? "true" : "false"}
          aria-describedby={
            errors.phoneNumber ? "phoneNumber-error" : undefined
          }
        />
        {errors.phoneNumber && (
          <p
            id="phoneNumber-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* 利用規約同意 */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            id="agreeToTerms"
            type="checkbox"
            {...register("agreeToTerms")}
            className={
              errors.agreeToTerms ? "border-red-500" : "border-gray-300"
            }
            aria-invalid={errors.agreeToTerms ? "true" : "false"}
            aria-describedby={
              errors.agreeToTerms ? "agreeToTerms-error" : undefined
            }
          />
          <span className="text-sm">利用規約に同意する *</span>
        </label>
        {errors.agreeToTerms && (
          <p
            id="agreeToTerms-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.agreeToTerms.message}
          </p>
        )}
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? "送信中..." : "登録する"}
      </button>
    </form>
  );
}

// ========================================
// エラー表示コンポーネント（再利用可能）
// ========================================

interface FieldErrorProps {
  error?: {
    message?: string;
  };
  id: string;
}

export function FieldError({ error, id }: FieldErrorProps) {
  if (!error || !error.message) {
    return null;
  }

  return (
    <p id={id} className="mt-1 text-sm text-red-600" role="alert">
      {error.message}
    </p>
  );
}

// ========================================
// フィールドコンポーネント（再利用可能）
// ========================================

interface TextFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "tel";
  required?: boolean;
  error?: { message?: string };
  register: any; // UseFormRegister型
  hint?: string;
}

export function TextField({
  id,
  label,
  type = "text",
  required = false,
  error,
  register,
  hint,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label} {required && "*"}
      </label>
      <input
        id={id}
        type={type}
        {...register}
        className={`mt-1 block w-full rounded-md ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={[
          error ? `${id}-error` : null,
          hint ? `${id}-hint` : null,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-gray-500">
          {hint}
        </p>
      )}
      <FieldError error={error} id={`${id}-error`} />
    </div>
  );
}
