# 実装ガイド: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

## Part 1: 中学生向けの説明

### なぜ必要か

設定画面は、アプリを安全に使うための入口です。  
ここが壊れると、APIキー設定や復旧操作ができなくなります。  
そのため「受け取ったデータが想定と違っても画面を止めない」仕組みが必要です。

### たとえば

宅配便を受け取るとき、本来は箱が届く想定でも、封筒や空箱が来ることがあります。  
そのときに毎回パニックにならず、受け取り窓口で中身を確認してから処理すれば、業務は止まりません。  
今回のガードはこの「受け取り窓口の確認係」に当たります。

### 何をしたか

1. `window.electronAPI` がない場合を先に検知
2. `apiKey.list` がない場合を先に検知
3. `providers` が配列か `Array.isArray` で検証
4. 壊れた値なら空配列へフォールバックし、画面は継続

## Part 2: 開発者向け詳細

### 型定義（TypeScript）

```ts
type ProviderItem = {
  provider: string;
  configured: boolean;
  maskedKey: string | null;
  updatedAt: string | null;
};

type ApiKeyListResult =
  | { success: true; data: { providers: ProviderItem[] } }
  | { success: false; error?: { message?: string } };
```

### APIシグネチャ

```ts
// preload exposed API
window.electronAPI?.apiKey?.list(): Promise<ApiKeyListResult | undefined>;
```

### 使用例

```ts
const apiKeyApi = window.electronAPI?.apiKey;
if (!apiKeyApi?.list) {
  setState((prev) => ({
    ...prev,
    providers: [],
    isLoading: false,
    error: "APIキー機能が利用できません",
  }));
  return;
}

const result = await apiKeyApi.list();
if (result?.success && result?.data) {
  const providers = Array.isArray(result.data.providers)
    ? result.data.providers
    : [];
  setState((prev) => ({ ...prev, providers, isLoading: false }));
  return;
}
setState((prev) => ({
  ...prev,
  isLoading: false,
  error: result?.error?.message || "Failed to load API keys",
}));
```

### エラーハンドリング

- `apiKeyApi?.list` が欠落: 固定文言でエラー表示しクラッシュ回避
- `result` が `undefined/null`: 失敗扱いに統一
- `result.error` 欠落: デフォルト文言へフォールバック

### エッジケース

- `providers: null`
- `providers: "string"` のような非配列
- `window.electronAPI` 自体が `undefined`

### 設定項目・定数

| 項目                   | 値                                     |
| ---------------------- | -------------------------------------- |
| エラー文言（API欠落）  | `APIキー機能が利用できません`          |
| エラー文言（取得失敗） | `Failed to load API keys`              |
| 正規化判定             | `Array.isArray(result.data.providers)` |

### 実装ファイル

- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`
- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx`
