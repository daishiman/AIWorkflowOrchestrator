# API Key Management - 改善タスク記録

> Phase 7 最終レビューおよびPhase 8 手動テストで発見された改善項目

## ステータス

| 項目   | 内容               |
| ------ | ------------------ |
| 作成日 | 2025-12-10         |
| 発見元 | Phase 7/8 レビュー |
| 優先度 | 次スプリント対応   |

---

## 1. コード品質改善

### 1.1 コンポーネント分割 (MAJOR)

**対象**: `ApiKeysSection/index.tsx` (約800行)

**現状**: 単一ファイルに全ロジックとUIが集約

**推奨構成**:

```
ApiKeysSection/
├── index.tsx (100行 - 統合ロジック)
├── components/
│   ├── ApiKeyItem.tsx
│   ├── ApiKeyFormModal.tsx
│   ├── DeleteConfirmDialog.tsx
│   └── ValidationStatusDisplay.tsx
└── hooks/
    └── useApiKeyManager.ts
```

**工数見積**: 4-6時間

### 1.2 カスタムフック抽出 (MAJOR)

**対象**: ビジネスロジックのUI分離

**推奨**:

```typescript
// hooks/useApiKeyManager.ts
export function useApiKeyManager() {
  const handleSave = async (providerId: string, apiKey: string) => { ... };
  const handleDelete = async (providerId: string) => { ... };
  const handleValidate = async (providerId: string) => { ... };
  return { handleSave, handleDelete, handleValidate };
}
```

**工数見積**: 2-3時間

### 1.3 バリデーター関数分割 (MINOR)

**対象**: `apiKeyValidator.ts` のvalidateApiKey関数

**推奨**: プロバイダー別にバリデーター関数を分離

```typescript
const providerValidators: Record<
  AIProvider,
  (key: string) => ValidationResult
> = {
  openai: validateOpenAIKey,
  anthropic: validateAnthropicKey,
  google: validateGoogleKey,
  xai: validateXAIKey,
};
```

**工数見積**: 3-4時間

---

## 2. テスト品質改善

### 2.1 UI層エラーハンドリングテスト (MAJOR)

**対象**: `ApiKeysSection.test.tsx`

**不足テストケース**:

- 保存失敗時のトースト表示
- 読み込み失敗時のトースト表示
- 削除失敗時のトースト表示

**工数見積**: 2-3時間

### 2.2 境界値テスト追加 (MINOR)

**対象**: `apiKeyValidator.test.ts`

**追加テストケース**:

- 極端に長いキー (>1000文字)
- Unicode文字を含むキー
- ホワイトスペースのみのキー

**工数見積**: 1-2時間

---

## 3. アクセシビリティ改善

### 3.1 aria-live領域の強化 (MAJOR)

**対象**: 検証結果のスクリーンリーダー通知

**推奨**:

```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {validationMessage}
</div>
```

**工数見積**: 1時間

### 3.2 トグルボタン状態 (MINOR)

**対象**: パスワード表示切替ボタン

**推奨**:

```tsx
<button
  aria-pressed={showKey}
  aria-label={showKey ? 'APIキーを非表示' : 'APIキーを表示'}
>
```

**工数見積**: 30分

### 3.3 状態遷移アニメーション (MINOR)

**対象**: バリデーションステータス表示

**推奨**: `transition-colors duration-200 ease-in-out` 追加

**工数見積**: 30分

---

## 4. セキュリティ強化

### 4.1 Rate Limiting (MINOR)

**対象**: APIキー検証リクエスト

**推奨**: 短時間の連続検証を防ぐ仕組み

```typescript
const RATE_LIMIT_MS = 5000;
const validationRateLimit = new Map<string, number>();
```

**工数見積**: 1-2時間

### 4.2 safeStorage利用不可時の通知 (MINOR)

**対象**: 暗号化が利用できない環境への対応

**推奨**: ユーザーへの明確な警告表示

**工数見積**: 1時間

---

## 5. 将来拡張

### 5.1 追加プロバイダー対応

**候補**:

- Azure OpenAI
- AWS Bedrock
- Hugging Face

**必要な変更**:

1. `AIProvider` 型に追加
2. `PROVIDER_CONFIG` にエンドポイント追加
3. `AI_PROVIDERS_META` に表示名追加
4. `AIProviderIcon` にアイコン追加

### 5.2 APIキーのエクスポート/インポート

**用途**: 環境移行、バックアップ

**セキュリティ考慮**:

- パスワード保護付きエクスポート
- 暗号化されたファイル形式

---

## 優先度サマリー

| 優先度   | タスク             | 合計工数      |
| -------- | ------------------ | ------------- |
| MAJOR    | コンポーネント分割 | 4-6時間       |
| MAJOR    | カスタムフック抽出 | 2-3時間       |
| MAJOR    | UIテスト追加       | 2-3時間       |
| MAJOR    | aria-live領域      | 1時間         |
| MINOR    | バリデーター分割   | 3-4時間       |
| MINOR    | 境界値テスト       | 1-2時間       |
| MINOR    | その他a11y改善     | 1時間         |
| MINOR    | Rate Limiting      | 1-2時間       |
| **合計** |                    | **15-22時間** |

---

## 関連ドキュメント

- [Phase 7 最終レビュー結果](./design-review.md)
- [Phase 8 手動テスト結果](./manual-test-results.md)
- [セキュリティガイドライン](../../00-requirements/17-security-guidelines.md)
