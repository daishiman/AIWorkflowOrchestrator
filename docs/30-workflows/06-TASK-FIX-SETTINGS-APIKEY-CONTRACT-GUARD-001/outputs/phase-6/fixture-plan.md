# Phase 6: テストフィクスチャ計画

## タスク ID

06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

## テストデータファクトリ

### 既存ファクトリ（ApiKeysSection.test.tsx）

- `createMockProviderList()`: 正常な4プロバイダーリストを生成
  - Phase 4-5 で追加した GAP-01 ~ GAP-04 テストでも利用済み

### 新規テストのフィクスチャ戦略

#### apiKeyHandlers.list.test.ts

- `mockListProviders` のモック戻り値を各テストケースで直接設定
- 異常系フィクスチャ:
  - `{ providers: null }` - P48 準拠 null ガード
  - `{ providers: undefined }` - フィールド欠損
  - `{ providers: "not-an-array" }` - 型不正
  - `null` - 全体 null
  - `{ providers: [{ provider: "openai" }] }` - status 欠損

#### profileHandlers.identities.test.ts

- `mockUser` ベースオブジェクトの `identities` フィールドを差し替え
- 異常系フィクスチャ:
  - `{ ...mockUser, identities: null }` - null
  - `delete user.identities` - undefined
  - `{ ...mockUser, identities: { broken: true } }` - 非配列

## 共有ファクトリの必要性

- 現時点では各テストファイルが独立したモックを持つ設計で統一されている
- 共有ファクトリの抽出は不要（テストファイル間の依存を避ける方針）
