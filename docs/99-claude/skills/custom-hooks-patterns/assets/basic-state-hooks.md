# 基本状態管理フック

## useToggle

```typescript
import { useState, useCallback } from "react";

/**
 * ブール値の切り替えを管理するフック
 *
 * @param initialValue - 初期値（デフォルト: false）
 * @returns [value, toggle, setValue] - 現在値、切り替え関数、直接設定関数
 *
 * @example
 * const [isOpen, toggleOpen, setIsOpen] = useToggle();
 * <button onClick={toggleOpen}>Toggle</button>
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue] as const;
}
```

## useCounter

```typescript
import { useState, useCallback } from "react";

interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

/**
 * カウンター状態を管理するフック
 *
 * @param initialValue - 初期値
 * @param options - オプション（min, max, step）
 *
 * @example
 * const { count, increment, decrement, reset } = useCounter(0, { min: 0, max: 10 });
 */
export function useCounter(initialValue = 0, options: UseCounterOptions = {}) {
  const { min = -Infinity, max = Infinity, step = 1 } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => Math.min(prev + step, max));
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(prev - step, min));
  }, [step, min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback(
    (value: number) => {
      setCount(Math.max(min, Math.min(value, max)));
    },
    [min, max],
  );

  return { count, increment, decrement, reset, set };
}
```

## useInput

```typescript
import { useState, useCallback, ChangeEvent } from "react";

/**
 * 入力フィールドの状態を管理するフック
 *
 * @param initialValue - 初期値
 *
 * @example
 * const name = useInput('');
 * <input {...name.bind} />
 * // または
 * <input value={name.value} onChange={name.onChange} />
 */
export function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [],
  );

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  const clear = useCallback(() => {
    setValue("");
  }, []);

  return {
    value,
    setValue,
    onChange,
    reset,
    clear,
    bind: { value, onChange },
  };
}
```

## 使用例

```typescript
function FormExample() {
  // トグル
  const [isEnabled, toggle] = useToggle(false);

  // カウンター
  const { count, increment, decrement, reset } = useCounter(0, {
    min: 0,
    max: 100,
    step: 5,
  });

  // 入力
  const name = useInput('');
  const email = useInput('');

  return (
    <form>
      <label>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={toggle}
        />
        Enable notifications
      </label>

      <div>
        <button type="button" onClick={decrement}>-</button>
        <span>{count}</span>
        <button type="button" onClick={increment}>+</button>
        <button type="button" onClick={reset}>Reset</button>
      </div>

      <input {...name.bind} placeholder="Name" />
      <input {...email.bind} placeholder="Email" />

      <button type="button" onClick={() => {
        name.clear();
        email.clear();
      }}>
        Clear All
      </button>
    </form>
  );
}
```
