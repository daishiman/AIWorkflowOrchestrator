# Phase 2 実行記録: 設計

## 実行日: 2026-04-06

## useAuthKeyManagement フックインターフェース

```typescript
export interface UseAuthKeyManagementReturn {
  status: ApiKeyStatus;
  keySource: "saved" | "env-fallback" | null;
  inputValue: string;
  isSubmitting: boolean;
  validationError: string | null;
  apiError: string | null;
  setInputValue: (value: string) => void;
  handleSave: () => Promise<boolean>;
  handleDelete: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export interface UseAuthKeyManagementOptions {
  onStatusChange?: (status: ApiKeyStatus) => void;
}
```

## 型統一方針

ApiKeyStatus を拡張して check-failed を追加:

- "not_set" | "validating" | "configured" | "error" | "check-failed"

移行マッピング:

- AuthKeyStatus "saved" → ApiKeyStatus "configured" + keySource="saved"
- AuthKeyStatus "env-fallback" → ApiKeyStatus "configured" + keySource="env-fallback"
- AuthKeyStatus "not-set" → ApiKeyStatus "not_set"
- AuthKeyStatus "check-failed" → ApiKeyStatus "check-failed"

## コンポーネント統合設計

ApiKeySettingsPanel: Option A（委譲パターン）採用

```typescript
export function ApiKeySettingsPanel({ onStatusChange }: ApiKeySettingsPanelProps) {
  return <AuthKeySection onStatusChange={onStatusChange} />;
}
```

## IPC 4層整合性確認

新規 IPC チャンネル追加なし。既存 authKey.{exists, set, delete} を使用。

## タスク100%実行確認

- [x] タスク1: concern 分解・topology
- [x] タスク2: フックインターフェース設計
- [x] タスク3: 型統一設計
- [x] タスク4: コンポーネント統合設計
- [x] タスク5: IPC 4層整合確認
- [x] タスク6: 型互換性検証テーブル
- [x] タスク7: ファイル変更計画
- [x] タスク8: SubAgent lane 設計
