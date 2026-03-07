# Phase 6: テスト拡充計画

## タスク ID

06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

## 目的

Phase 4-5 で追加した GAP-01 ~ GAP-06 の実装に対して、Main Process 側のテストを拡充する。

## 拡充対象

### GAP-TEST-08: apiKeyHandlers list ハンドラ バリデーション

- **対象ファイル**: `apps/desktop/src/main/ipc/apiKeyHandlers.ts` の list ハンドラ
- **テストファイル**: `apps/desktop/src/main/ipc/__tests__/apiKeyHandlers.list.test.ts`（新規作成）
- **テスト内容**: GAP-05 で追加した `Array.isArray(result?.providers)` バリデーションの検証
- **テスト数**: 7件
- **カバーするケース**:
  - providers が null の場合
  - providers が undefined の場合
  - providers が非配列（文字列）の場合
  - listProviders が null を返す場合
  - 正常な providers 配列での registeredCount 再計算
  - status フィールド欠損時の registered カウント除外
  - listProviders が例外を投げる場合

### GAP-TEST-09: profileHandlers identities ガード

- **対象ファイル**: `apps/desktop/src/main/ipc/profileHandlers.ts` の identities 防御箇所（3箇所）
- **テストファイル**: `apps/desktop/src/main/ipc/__tests__/profileHandlers.identities.test.ts`（新規作成）
- **テスト内容**: GAP-06 で統一された `Array.isArray(user.identities)` ガードの検証
- **テスト数**: 6件
- **カバーするケース**:
  - PROFILE_GET_PROVIDERS: identities が null / undefined / 非配列 / 正常配列
  - PROFILE_UNLINK_PROVIDER: identities が null / undefined の場合のエラー

## テストデータファクトリ活用状況

- ApiKeysSection.test.tsx: `createMockProviderList()` ファクトリを活用済み（Phase 4-5 追加テストでも使用）
- apiKeyHandlers.list.test.ts: mockListProviders の戻り値を直接構成（既存テストパターンに準拠）
- profileHandlers.identities.test.ts: mockUser オブジェクトの identities フィールドを差し替え

## 結果

- 追加テスト: 13件（7 + 6）
- 全テスト PASS: 122件（既存109 + 新規13）
