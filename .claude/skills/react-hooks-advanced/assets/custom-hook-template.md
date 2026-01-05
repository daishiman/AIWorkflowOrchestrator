# カスタムフックテンプレート

## 基本構造

````typescript
import { useState, useEffect, useCallback } from 'react';

/**
 * {{hookName}} - {{hookDescription}}
 *
 * @param {{paramName}} - {{paramDescription}}
 * @returns {{returnDescription}}
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = {{hookName}}({{exampleParam}});
 * ```
 */
export function {{hookName}}({{params}}): {{ReturnType}} {
  // 状態定義
  const [state, setState] = useState<State>(initialState);

  // メモ化されたコールバック
  const handler = useCallback(() => {
    // 処理
  }, [/* 依存配列 */]);

  // 副作用
  useEffect(() => {
    // 副作用の処理

    return () => {
      // クリーンアップ
    };
  }, [/* 依存配列 */]);

  // 戻り値
  return {
    // 状態と関数を返す
  };
}
````

## データフェッチフックテンプレート

```typescript
import { useState, useEffect, useCallback } from "react";

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseFetchReturn<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}
```

## トグルフックテンプレート

```typescript
import { useState, useCallback } from "react";

interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

export function useToggle(initialValue = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}
```

## フォーム入力フックテンプレート

```typescript
import { useState, useCallback, ChangeEvent } from "react";

interface UseInputReturn {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  reset: () => void;
  bind: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };
}

export function useInput(initialValue = ""): UseInputReturn {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [],
  );

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return {
    value,
    onChange,
    reset,
    bind: { value, onChange },
  };
}
```

## 命名規則

- Hookは必ず`use`で始める
- 名前は動作を表す動詞を使う（useFetch, useToggle, useInput）
- 戻り値の型は明示的に定義する

## チェックリスト

- [ ] `use`で始まる命名になっている
- [ ] 戻り値の型が明示的に定義されている
- [ ] JSDocコメントがある
- [ ] 使用例がある
- [ ] 依存配列が正しく設定されている
- [ ] クリーンアップ関数が必要な場合は実装されている
