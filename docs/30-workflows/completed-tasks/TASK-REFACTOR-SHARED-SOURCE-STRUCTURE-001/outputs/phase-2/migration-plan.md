# 移行計画書 — packages/shared ソースディレクトリ構造統一

## 移行手順

### Step 1: ファイルコピー（5ファイル）

```bash
# コピー（移動元を残して安全に実行）
cp packages/shared/types/auth.ts packages/shared/src/types/auth.ts
cp packages/shared/types/api-keys.ts packages/shared/src/types/api-keys.ts
cp packages/shared/types/common.ts packages/shared/src/types/common.ts
cp packages/shared/types/workflow.ts packages/shared/src/types/workflow.ts
cp packages/shared/types/file-selection.ts packages/shared/src/types/file-selection.ts
```

**file-selection.ts の import パス修正**:

```diff
- export type { ... } from "../schemas/file-selection.schema.js";
+ export type { ... } from "../../schemas/file-selection.schema.js";
```

### Step 2: テストファイルコピー

```bash
mkdir -p packages/shared/src/types/__tests__
cp packages/shared/types/__tests__/auth.test.ts packages/shared/src/types/__tests__/auth.test.ts
```

テストファイル内の import パスは `../auth` のまま変更不要（相対パスが同一のため）。

### Step 3: index.ts 統合

`packages/shared/src/types/index.ts` の末尾に追加:

```typescript
// 旧 types/ ディレクトリから統合 (TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001)
export * from "./workflow";
export * from "./common";
export * from "./auth";
export * from "./api-keys";
```

`file-selection` は `../../schemas/index.js` 経由で既にエクスポートされているため含めない。

### Step 4: 設定ファイル更新（一括）

#### 4-1: packages/shared/package.json

**exports 変更（2エントリ）**:

```json
"./types/auth": {
  "types": "./dist/src/types/auth.d.ts",
  "import": "./dist/src/types/auth.js"
},
"./types/api-keys": {
  "types": "./dist/src/types/api-keys.d.ts",
  "import": "./dist/src/types/api-keys.js"
},
```

**typesVersions 変更（2エントリ）**:

```json
"types/auth": ["./src/types/auth.ts"],
"types/api-keys": ["./src/types/api-keys.ts"],
```

#### 4-2: packages/shared/tsup.config.ts

**削除**:

- `"types/index.ts"`
- `"types/auth.ts"`
- `"types/api-keys.ts"`

**追加**（`"src/types/auth-mode.ts"` の次に配置）:

- `"src/types/auth.ts"`
- `"src/types/api-keys.ts"`

#### 4-3: apps/desktop/tsconfig.json

**paths 変更（2エントリ）**:

```json
"@repo/shared/types/auth": ["../../packages/shared/src/types/auth.ts"],
"@repo/shared/types/api-keys": ["../../packages/shared/src/types/api-keys.ts"],
```

### Step 5: ビルド検証

```bash
pnpm --filter @repo/shared clean && pnpm --filter @repo/shared build
```

**成功基準**: 終了コード 0、`dist/src/types/auth.d.ts` と `dist/src/types/api-keys.d.ts` が存在する。

### Step 6: 型チェック検証

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

**成功基準**: 両方とも 0 エラー。

### Step 7: テスト検証

```bash
pnpm --filter @repo/shared test:run
```

**成功基準**: `src/types/__tests__/auth.test.ts` を含む全テスト PASS。

### Step 8: 旧ディレクトリ削除

```bash
rm -rf packages/shared/types/
```

**前提条件**: Step 5-7 の全てが成功していること。

### Step 9: 最終ビルド検証

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop test:run
```

**成功基準**: ビルド成功 + 回帰テスト全 PASS。

## aiworkflow-requirements 抽出結果

| 参照仕様                    | 抽出した必須情報                                 | 移行手順への反映                             |
| --------------------------- | ------------------------------------------------ | -------------------------------------------- |
| `architecture-monorepo.md`  | 公開パス契約を維持したまま実体のみ移動する       | Step 4 の `exports/typesVersions/paths` 同期 |
| `directory-structure.md`    | ルート直下 `types/` から `src/types/` へ集約する | Step 1〜3 と Step 8                          |
| `quality-requirements.md`   | ビルド・型・テストを削除前に必ず通す             | Step 5〜7 を Step 8 の前提に設定             |
| `development-guidelines.md` | ロールバック可能性を残して段階実行する           | copy ベース移行 + ロールバック手順           |

## ロールバック手順

Step 8（旧ディレクトリ削除）実行前であれば、以下の手順でロールバック可能:

1. `src/types/` に追加したファイルを削除
2. 設定ファイルの変更を `git checkout` で復元
3. `src/types/index.ts` の追加行を削除

```bash
git checkout -- packages/shared/package.json packages/shared/tsup.config.ts apps/desktop/tsconfig.json
rm packages/shared/src/types/auth.ts packages/shared/src/types/api-keys.ts packages/shared/src/types/common.ts packages/shared/src/types/workflow.ts packages/shared/src/types/file-selection.ts
rm -rf packages/shared/src/types/__tests__/auth.test.ts
```
