# Phase 12 実装ガイド

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 12                                |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## Part 1: やさしい説明（中学生向け）

このタスクでは、アプリの「状態管理の地図」を作りました。

- どの機能がどの Slice で管理されているか
- 新しく Slice を作るべきか、今のままでいいか
- 画面だけで持つ一時状態（`useState`）にするか

を、先に決めてブレないようにしています。

今回作った `sliceBaseline.ts` を見ると、

1. Sliceの一覧（台帳）
2. 境界判定（new / extend / no-change / local-useState）
3. セレクタ命名ルール（P31対策）

が1箇所にまとまっているので、後続タスクが迷いにくくなります。

## Part 2: 技術者向け詳細

### 1. 追加した型

`apps/desktop/src/renderer/store/types.ts`

- `StoreBoundaryDecision`
- `StoreSlicePersistenceStrategy`
- `StoreSliceInventoryItem`
- `StoreBoundaryMatrixItem`
- `StoreSelectorPolicy`

### 2. 追加した baseline 定数

`apps/desktop/src/renderer/store/sliceBaseline.ts`

- `STORE_PERSISTED_KEYS_BASELINE`
- `STORE_SLICE_INVENTORY_BASELINE`
- `STORE_BOUNDARY_MATRIX_BASELINE`
- `STORE_SELECTOR_POLICY_BASELINE`

### 3. Store公開面の同期

`apps/desktop/src/renderer/store/index.ts`

- `export * from "./sliceBaseline";` を追加して、他モジュールから参照可能にした。

### 4. テスト

`apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts`

- Unit: 境界判定と必須ドメイン
- Integration: 台帳件数、persist key 整合、store再export
- Regression: 合成Hook非推奨、命名規約後退防止

### 5. 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/store/__tests__/sliceBaseline.test.ts
pnpm --filter @repo/desktop exec vitest run --coverage src/renderer/store/__tests__/sliceBaseline.test.ts --coverage.include=src/renderer/store/sliceBaseline.ts --coverage.all=false
pnpm --filter @repo/desktop typecheck
```
