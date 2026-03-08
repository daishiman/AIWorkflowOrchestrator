# React Hook 仕様テンプレート

> 用途: カスタムフック、状態管理、副作用処理の仕様定義
> 参考: interfaces-chat-history.md, ui-ux-components.md

---

## 概要

[機能名]のReact Hook仕様を定義する。

---

## Hook 概要

### useXxx

| 項目   | 内容                 |
| ------ | -------------------- |
| 目的   | [Hookの目的]         |
| 入力   | [パラメータ]         |
| 出力   | [戻り値]             |
| 副作用 | [副作用の有無と内容] |

---

## インターフェース定義

### パラメータ型

```typescript
export interface UseXxxOptions {
  /** 初期値 */
  initialValue?: XxxType;
  /** 自動フェッチ */
  autoFetch?: boolean;
  /** 依存値 */
  deps?: unknown[];
}
```

### 戻り値型

```typescript
export interface UseXxxReturn {
  /** 現在の状態 */
  data: XxxType | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: Error | null;
  /** アクション関数 */
  execute: (params: XxxParams) => Promise<void>;
  /** リセット関数 */
  reset: () => void;
}
```

---

## 実装仕様

### 状態管理

```typescript
export function useXxx(options: UseXxxOptions = {}): UseXxxReturn {
  const { initialValue, autoFetch = true } = options;

  const [data, setData] = useState<XxxType | null>(initialValue ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 実装...
}
```

### 副作用処理

```typescript
useEffect(() => {
  if (!autoFetch) return;

  const controller = new AbortController();

  fetchData(controller.signal)
    .then(setData)
    .catch(setError)
    .finally(() => setIsLoading(false));

  return () => controller.abort();
}, [autoFetch]);
```

### メモ化

```typescript
const execute = useCallback(async (params: XxxParams) => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await xxxService.execute(params);
    setData(result);
  } catch (e) {
    setError(e instanceof Error ? e : new Error(String(e)));
  } finally {
    setIsLoading(false);
  }
}, []);

const memoizedValue = useMemo(() => computeValue(data), [data]);
```

---

## IPC統合パターン

### Preload API呼び出し

```typescript
useEffect(() => {
  const unsubscribe = window.xxxAPI.onEvent((payload) => {
    setData(payload.data);
  });
  return unsubscribe;
}, []);
```

### エラーハンドリング

```typescript
const execute = useCallback(async (params: XxxParams) => {
  const result = await window.xxxAPI.action(params);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
}, []);
```

---

## 使用例

### 基本使用

```tsx
function MyComponent() {
  const { data, isLoading, error, execute } = useXxx();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <Display data={data} />
      <Button onClick={() => execute({ action: "refresh" })}>Refresh</Button>
    </div>
  );
}
```

### オプション指定

```tsx
const { data } = useXxx({
  initialValue: defaultData,
  autoFetch: false,
  deps: [userId],
});
```

---

## テスト仕様

### テストユーティリティ

```typescript
// renderHookラッパー
import { renderHook, act } from '@testing-library/react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

const { result } = renderHook(() => useXxx(), { wrapper });
```

### テストケース

| テストID | テスト名       | 検証内容                    |
| -------- | -------------- | --------------------------- |
| HOOK-001 | 初期状態       | data=null, isLoading=false  |
| HOOK-002 | ローディング   | isLoading=true during fetch |
| HOOK-003 | 成功時         | data更新, isLoading=false   |
| HOOK-004 | エラー時       | error設定, isLoading=false  |
| HOOK-005 | クリーンアップ | unsubscribe呼び出し         |

---

## アクセシビリティ考慮

| 状態    | ARIA属性           | スクリーンリーダー対応   |
| ------- | ------------------ | ------------------------ |
| loading | aria-busy="true"   | 「読み込み中」           |
| error   | role="alert"       | エラーメッセージ読み上げ |
| success | aria-live="polite" | 更新通知                 |

---

## パフォーマンス考慮

| 項目                 | 対策                 |
| -------------------- | -------------------- |
| 不要な再レンダリング | useMemo, useCallback |
| メモリリーク         | クリーンアップ関数   |
| 重複リクエスト       | AbortController      |

---

## 関連ドキュメント

| ドキュメント               | 説明                 |
| -------------------------- | -------------------- |
| ui-ux-components.md        | UIコンポーネント設計 |
| interfaces-chat-history.md | Hook実装例           |
| architecture-patterns.md   | 状態管理パターン     |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
