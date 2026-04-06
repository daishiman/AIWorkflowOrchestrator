# 実装ガイド: useAuthKeyManagement フック統合

## Part 1: 中学生レベルの説明

アプリを使うための「合言葉のような特別な文字列」を扱う場面があります。

以前は、同じような仕事をする2つの部品（AuthKeySectionとApiKeySettingsPanel）が、確認・保存・削除をそれぞれ別々に行っていました。たとえば、同じレストランのメニューを2人の店員がそれぞれ別々に管理していたような状態です。どちらかが更新しても、もう一方には伝わらず、間違いが起きやすい状況でした。

今回の改修では、「useAuthKeyManagement という担当者」に仕事をまとめました。2つの部品はこの担当者にお願いするだけでよくなり、ルールが統一されて同じ間違いが繰り返されにくくなります。

## Part 2: 技術者レベルの説明

### useAuthKeyManagement インターフェース定義

```typescript
// Current contract (TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001 実装後)
interface UseAuthKeyManagementReturn {
  status: ApiKeyStatus; // APIキーの現在ステータス
  keySource: "saved" | "env-fallback" | null; // キーの取得元
  inputValue: string; // 入力欄の値
  isSubmitting: boolean; // IPC呼び出し中フラグ
  validationError: string | null; // バリデーションエラー
  apiError: string | null; // APIエラー
  setInputValue: (value: string) => void; // 入力値を更新する
  handleSave: () => Promise<boolean>; // 保存（成功時 true）
  handleDelete: () => Promise<boolean>; // 削除（成功時 true）
  refresh: () => Promise<boolean>; // ステータス再取得（成功時 true）
}

interface UseAuthKeyManagementOptions {
  onStatusChange?: (status: ApiKeyStatus) => void; // ステータス変化時コールバック
}
```

> Target delta: 旧 Phase 2 設計では `handleSave`/`handleDelete`/`refresh` は `Promise<void>` だったが、コンポーネント側でメッセージ表示するため `Promise<boolean>` に変更。

### ApiKeyStatus 型定義（packages/shared/src/types/skillCreator.ts）

```typescript
export type ApiKeyStatus =
  | "not_set" // キー未設定
  | "validating" // 保存中/検証中
  | "configured" // 利用可能（saved または env-fallback）
  | "error" // 保存/削除時エラー
  | "check-failed"; // 初期確認時 IPC エラー（electronAPI 未利用環境含む）
```

### 使用例

**AuthKeySection（フルUI実装）:**

```typescript
export const AuthKeySection: React.FC<{
  onStatusChange?: (s: ApiKeyStatus) => void;
}> = ({ onStatusChange }) => {
  const {
    status,
    keySource,
    inputValue,
    isSubmitting,
    apiError,
    setInputValue,
    handleSave,
    handleDelete,
  } = useAuthKeyManagement({ onStatusChange });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // ... UI rendering
};
```

**ApiKeySettingsPanel（委譲ラッパー）:**

```typescript
export function ApiKeySettingsPanel({ onStatusChange }: { onStatusChange?: (s: ApiKeyStatus) => void }) {
  return <AuthKeySection onStatusChange={onStatusChange} />;
}
```

### エラーハンドリング

| シナリオ                                            | フックの動作                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `electronAPI.authKey` が未定義                      | `status = "check-failed"`, `apiError` に確認失敗メッセージ               |
| `authKey.exists()` が例外を throw                   | `status = "check-failed"`, `apiError` に確認失敗メッセージ               |
| `authKey.set()` が `{ success: false }`             | `status = "error"`, `apiError` に error メッセージ                       |
| `authKey.delete()` が `{ success: false }` / 未提供 | `status = "error"`, `apiError` に error メッセージ                       |
| `authKey.delete()` 後の `exists()` が失敗           | `status = "check-failed"`, `apiError` に再確認失敗メッセージ             |
| 二重送信（`isSubmitting === true` 中）              | `handleSave()` が即座に `false` を返す（isSubmittingRef による排他制御） |
