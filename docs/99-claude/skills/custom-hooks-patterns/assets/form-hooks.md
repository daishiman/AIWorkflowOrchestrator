# フォームフック

## useForm

```typescript
import { useState, useCallback, ChangeEvent, FormEvent } from "react";

type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean;
  message: string;
};

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (
    field: keyof T,
  ) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  reset: () => void;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
}

/**
 * フォーム状態を管理するフック
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>,
): UseFormResult<T> {
  const { initialValues, validationSchema, onSubmit } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validationSchema?.[field];
      if (!rules) return undefined;

      for (const rule of rules) {
        if (!rule.validate(value, values)) {
          return rule.message;
        }
      }
      return undefined;
    },
    [validationSchema, values],
  );

  const validateAllFields = useCallback((): boolean => {
    if (!validationSchema) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field of Object.keys(values) as (keyof T)[]) {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationSchema]);

  const handleChange = useCallback(
    (field: keyof T) =>
      (
        e: ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        const value =
          e.target.type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : e.target.value;

        setValues((prev) => ({ ...prev, [field]: value }));

        if (touched[field]) {
          const error = validateField(field, value as T[keyof T]);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, values[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [values, validateField],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>,
      );
      setTouched(allTouched);

      if (!validateAllFields()) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAllFields, onSubmit],
  );

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChange: handleChange(field),
      onBlur: handleBlur(field),
    }),
    [values, handleChange, handleBlur],
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    getFieldProps,
  };
}
```

## 使用例

```typescript
interface LoginForm {
  email: string;
  password: string;
}

function LoginPage() {
  const form = useForm<LoginForm>({
    initialValues: { email: '', password: '' },
    validationSchema: {
      email: [
        { validate: (v) => !!v, message: 'メールアドレスは必須です' },
        { validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v as string), message: '有効なメールアドレスを入力してください' },
      ],
      password: [
        { validate: (v) => !!v, message: 'パスワードは必須です' },
        { validate: (v) => (v as string).length >= 8, message: 'パスワードは8文字以上必要です' },
      ],
    },
    onSubmit: async (values) => {
      await loginApi(values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        type="email"
        {...form.getFieldProps('email')}
        placeholder="メールアドレス"
      />
      {form.touched.email && form.errors.email && (
        <span className="error">{form.errors.email}</span>
      )}

      <input
        type="password"
        {...form.getFieldProps('password')}
        placeholder="パスワード"
      />
      {form.touched.password && form.errors.password && (
        <span className="error">{form.errors.password}</span>
      )}

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  );
}
```
