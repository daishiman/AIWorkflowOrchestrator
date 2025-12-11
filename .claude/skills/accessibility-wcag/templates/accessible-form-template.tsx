/**
 * アクセシブルフォーム テンプレート
 *
 * WCAG 2.1 AA準拠のフォームコンポーネント
 */

import {
  forwardRef,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

// =============================================================================
// ユーティリティ
// =============================================================================

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// =============================================================================
// FormField コンポーネント
// =============================================================================

interface FormFieldProps {
  /** フィールドID */
  id?: string;
  /** ラベルテキスト */
  label: string;
  /** 必須フィールドか */
  required?: boolean;
  /** エラーメッセージ */
  error?: string;
  /** ヘルプテキスト */
  helpText?: string;
  /** 子要素（input, select, textarea など） */
  children: ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

export function FormField({
  id: propId,
  label,
  required = false,
  error,
  helpText,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const id = propId || generatedId;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  // aria-describedby の値を構築
  const describedBy =
    [error && errorId, helpText && helpId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("form-field", className)}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-red-500 ml-1">
              *
            </span>
            <span className="sr-only">（必須）</span>
          </>
        )}
      </label>

      {/* 子要素に必要な属性を渡す */}
      <div className="form-input-wrapper">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id,
              "aria-required": required,
              "aria-invalid": !!error,
              "aria-describedby": describedBy,
              ...child.props,
            } as any);
          }
          return child;
        })}
      </div>

      {/* ヘルプテキスト */}
      {helpText && !error && (
        <p id={helpId} className="form-help text-sm text-gray-600 mt-1">
          {helpText}
        </p>
      )}

      {/* エラーメッセージ */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="form-error text-sm text-red-600 mt-1"
        >
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Input コンポーネント
// =============================================================================

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  /** 左側アイコン */
  leftIcon?: ReactNode;
  /** 右側アイコン */
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leftIcon, rightIcon, ...props },
  ref,
) {
  return (
    <div className="relative">
      {leftIcon && (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-gray-300 px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className,
        )}
        {...props}
      />
      {rightIcon && (
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          {rightIcon}
        </div>
      )}
    </div>
  );
});

// =============================================================================
// Select コンポーネント
// =============================================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<
  ComponentPropsWithoutRef<"select">,
  "children"
> {
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, options, placeholder, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-md border border-gray-300 px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);

// =============================================================================
// Textarea コンポーネント
// =============================================================================

interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  /** 文字数カウントを表示 */
  showCount?: boolean;
  /** 最大文字数 */
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, showCount, maxLength, value, ...props }, ref) {
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-md border border-gray-300 px-3 py-2 min-h-[100px]",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500",
            className,
          )}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {showCount && maxLength && (
          <div
            className="absolute bottom-2 right-2 text-xs text-gray-500"
            aria-live="polite"
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  },
);

// =============================================================================
// Checkbox コンポーネント
// =============================================================================

interface CheckboxProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type"
> {
  /** ラベルテキスト */
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, label, id: propId, ...props }, ref) {
    const generatedId = useId();
    const id = propId || generatedId;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={cn(
            "h-4 w-4 rounded border-gray-300",
            "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
      </div>
    );
  },
);

// =============================================================================
// RadioGroup コンポーネント
// =============================================================================

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  /** グループ名 */
  name: string;
  /** ラベル */
  label: string;
  /** オプション */
  options: RadioOption[];
  /** 現在の値 */
  value?: string;
  /** 変更ハンドラ */
  onChange?: (value: string) => void;
  /** 必須か */
  required?: boolean;
  /** エラーメッセージ */
  error?: string;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  required,
  error,
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset
      aria-required={required}
      aria-invalid={!!error}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="text-sm font-medium mb-2">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-red-500 ml-1">
              *
            </span>
            <span className="sr-only">（必須）</span>
          </>
        )}
      </legend>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              id={`${groupId}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor={`${groupId}-${option.value}`} className="text-sm">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// =============================================================================
// 使用例
// =============================================================================

/*
import {
  FormField,
  Input,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
} from './accessible-form-template';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
    newsletter: false,
    contactMethod: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // バリデーションとエラーハンドリング
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label="お名前"
        required
        error={errors.name}
      >
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="山田 太郎"
        />
      </FormField>

      <FormField
        label="メールアドレス"
        required
        error={errors.email}
        helpText="確認メールを送信します"
      >
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="example@email.com"
        />
      </FormField>

      <FormField
        label="カテゴリ"
        required
        error={errors.category}
      >
        <Select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="選択してください"
          options={[
            { value: 'general', label: '一般的なお問い合わせ' },
            { value: 'support', label: 'サポート' },
            { value: 'feedback', label: 'フィードバック' },
          ]}
        />
      </FormField>

      <FormField
        label="メッセージ"
        required
        error={errors.message}
      >
        <Textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          maxLength={500}
          showCount
          placeholder="お問い合わせ内容を入力してください"
        />
      </FormField>

      <RadioGroup
        name="contactMethod"
        label="ご希望の連絡方法"
        required
        value={formData.contactMethod}
        onChange={(value) => setFormData({ ...formData, contactMethod: value })}
        error={errors.contactMethod}
        options={[
          { value: 'email', label: 'メール' },
          { value: 'phone', label: '電話' },
        ]}
      />

      <Checkbox
        label="ニュースレターを購読する"
        checked={formData.newsletter}
        onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
      />

      <button type="submit" className="btn btn-primary">
        送信
      </button>
    </form>
  );
}
*/
