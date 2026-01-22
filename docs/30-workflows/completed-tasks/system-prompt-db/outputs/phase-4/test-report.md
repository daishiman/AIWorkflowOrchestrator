# Phase 4: TDD Red Phase - テスト作成レポート

## 実行日時

2026-01-22

## 概要

TDD Red Phaseとして、システムプロンプトのデータベース永続化機能に必要な全テストを作成し、すべてのテストが失敗する状態（Red）を確認しました。

## 作成したテストファイル

### 1. Repository Unit Tests

**ファイル**: `packages/shared/src/repositories/__tests__/system-prompt-repository.test.ts`

| カテゴリ              | テスト数 | 状態              |
| --------------------- | -------- | ----------------- |
| findAllByUserId       | 7        | ❌ Failed         |
| findById              | 3        | ❌ Failed         |
| findAllPresets        | 2        | ❌ Failed         |
| create                | 4        | ❌ Failed         |
| update                | 5        | ❌ Failed         |
| delete                | 2        | ❌ Failed         |
| isPreset              | 3        | ❌ Failed         |
| existsByUserIdAndName | 4        | ❌ Failed         |
| exists                | 2        | ❌ Failed         |
| authorization         | 1        | ❌ Failed         |
| **合計**              | **33**   | **❌ All Failed** |

### 2. Repository Integration Tests

**ファイル**: `packages/shared/src/repositories/__tests__/system-prompt-repository.integration.test.ts`

| カテゴリ             | テスト数 | 状態              |
| -------------------- | -------- | ----------------- |
| Full CRUD workflow   | 2        | ❌ Failed         |
| Multi-user isolation | 3        | ❌ Failed         |
| Preset protection    | 4        | ❌ Failed         |
| Error handling       | 5        | ❌ Failed         |
| Concurrency          | 1        | ❌ Failed         |
| **合計**             | **15**   | **❌ All Failed** |

### 3. Migration Unit Tests

**ファイル**: `apps/desktop/src/main/migration/__tests__/electronStoreMigration.test.ts`

| カテゴリ              | テスト数 | 状態              |
| --------------------- | -------- | ----------------- |
| needsMigration        | 3        | ❌ Failed         |
| migrate               | 4        | ❌ Failed         |
| createBackup          | 1        | ❌ Failed         |
| restoreFromBackup     | 1        | ❌ Failed         |
| markMigrationComplete | 1        | ❌ Failed         |
| resetMigrationStatus  | 1        | ❌ Failed         |
| Full workflow         | 1        | ❌ Failed         |
| **合計**              | **12**   | **❌ All Failed** |

### 4. IPC Handler Tests

**ファイル**: `apps/desktop/src/main/ipc/__tests__/systemPromptHandlers.test.ts`

| カテゴリ                       | テスト数 | 状態              |
| ------------------------------ | -------- | ----------------- |
| system-prompt:list             | 3        | ❌ Failed         |
| system-prompt:get              | 2        | ❌ Failed         |
| system-prompt:create           | 3        | ❌ Failed         |
| system-prompt:update           | 3        | ❌ Failed         |
| system-prompt:delete           | 3        | ❌ Failed         |
| system-prompt:migrate          | 1        | ❌ Failed         |
| system-prompt:get-presets      | 1        | ❌ Failed         |
| registerSystemPromptHandlers   | 7        | ❌ Failed         |
| unregisterSystemPromptHandlers | 1        | ❌ Failed         |
| **合計**                       | **24**   | **❌ All Failed** |

### 5. Slice Unit Tests

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/systemPromptTemplateSlice.test.ts`

| カテゴリ            | テスト数 | 状態              |
| ------------------- | -------- | ----------------- |
| initial state       | 1        | ❌ Failed         |
| loadTemplates       | 4        | ❌ Failed         |
| saveTemplate        | 3        | ❌ Failed         |
| updateTemplate      | 2        | ❌ Failed         |
| deleteTemplate      | 3        | ❌ Failed         |
| selectTemplate      | 2        | ❌ Failed         |
| getSelectedTemplate | 2        | ❌ Failed         |
| **合計**            | **17**   | **❌ All Failed** |

## テスト総数

| パッケージ                  | テスト数 | 状態              |
| --------------------------- | -------- | ----------------- |
| @repo/shared (Repository)   | 48       | ❌ Failed         |
| @repo/desktop (Migration)   | 12       | ❌ Failed         |
| @repo/desktop (IPC Handler) | 24       | ❌ Failed         |
| @repo/desktop (Slice)       | 17       | ❌ Failed         |
| **総合計**                  | **101**  | **❌ All Failed** |

## 失敗理由

すべてのテストは以下のエラーで失敗しています：

```
Error: Not implemented - TDD Red Phase
```

これはTDD Red Phaseとして意図した結果であり、Phase 5（実装）でこれらのテストを通過させます。

## テストパターン

### Repository Tests

- In-memory SQLite (`better-sqlite3`)を使用
- 各テスト前にスキーマを作成
- プレースホルダークラスが`Not implemented`エラーをthrow

### Migration Tests

- Mock Store patternを使用
- Mock Repositoryを使用
- 一時ディレクトリでバックアップテスト

### IPC Handler Tests

- `vi.mock("electron")`でElectronモジュールをモック
- Mock Repositoryを使用
- プレースホルダー関数が`Not implemented`エラーをthrow

### Slice Tests

- `vi.stubGlobal`でwindow.systemPromptAPIをモック
- プレースホルダー関数が`Not implemented`エラーをthrow

## 次フェーズへの引き継ぎ

### Phase 5で実装が必要なファイル

1. **Repository実装**
   - `packages/shared/src/repositories/system-prompt-repository.ts`
   - Drizzle ORMを使用したCRUD操作の実装

2. **Migration実装**
   - `apps/desktop/src/main/migration/electron-store-migration.ts`
   - electron-storeからTursoDB への移行ロジック

3. **IPC Handler実装**
   - `apps/desktop/src/main/ipc/system-prompt-handler.ts`
   - 7つのIPCチャンネルのハンドラー登録

4. **Slice実装**
   - `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`
   - Zustand sliceの実装

### 実装順序推奨

1. Repository (依存なし)
2. Migration (Repository依存)
3. IPC Handler (Repository依存)
4. Slice (IPC API依存)

## 検証コマンド

```bash
# Repository tests
pnpm --filter @repo/shared test src/repositories/__tests__/system-prompt-repository.test.ts --run
pnpm --filter @repo/shared test src/repositories/__tests__/system-prompt-repository.integration.test.ts --run

# Migration tests
pnpm --filter @repo/desktop test src/main/migration/__tests__/electronStoreMigration.test.ts --run

# IPC Handler tests
pnpm --filter @repo/desktop test src/main/ipc/__tests__/systemPromptHandlers.test.ts --run

# Slice tests
pnpm --filter @repo/desktop test src/renderer/store/slices/__tests__/systemPromptTemplateSlice.test.ts --run
```

## 結論

- ✅ 101テストを作成完了
- ✅ すべてのテストがRed状態（失敗）であることを確認
- ✅ Phase 5（TDD Green）への準備完了
