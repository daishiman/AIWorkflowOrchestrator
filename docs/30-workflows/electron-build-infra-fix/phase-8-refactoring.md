# Phase 8: リファクタリング

## メタ情報

| 項目      | 内容                                     |
| --------- | ---------------------------------------- |
| Phase     | 8                                        |
| 名称      | リファクタリング                         |
| 前提Phase | Phase 7                                  |
| 成果物    | リファクタリング済みコード、重複排除結果 |

## 目的

Phase 5 で実装したコードと既存コードを見直し、重複排除・可読性向上・保守性改善を行う。ビルドインフラタスクの特性上、設定ファイルとシェルスクリプトが主な対象となる。

## 実行タスク

### Task 8-1: setup-native-modules.sh の構造整理

**対象ファイル**: `scripts/setup-native-modules.sh`

**リファクタリング内容**:

1. **関数化**: スクリプト内のロジックを関数に分割する
   - `check_architecture()`: アーキテクチャチェック
   - `check_node_abi()`: Node.js ABI バージョンチェック
   - `rebuild_for_nodejs()`: Node.js 向けリビルド
   - `rebuild_for_electron()`: Electron 向けリビルド（Phase 5 で追加した部分）
   - `rebuild_esbuild()`: esbuild リビルド

2. **エラーハンドリング統一**: 各関数の戻り値で成功/失敗を判定し、メイン処理で一括管理する

3. **ログ出力統一**: `echo` の前にタイムスタンプまたはプレフィックスを統一する

**変更例**:

```bash
# リファクタリング前
echo "🔧 ネイティブモジュールのセットアップを開始..."
# ... 100+ 行のフラットなスクリプト

# リファクタリング後
log() { echo "[native-modules] $1"; }

check_architecture() {
  NODE_ARCH=$(node -p "process.arch")
  # ...
}

rebuild_for_electron() {
  if ! npx electron --version >/dev/null 2>&1; then
    log "Electron 未インストール。スキップします。"
    return 1
  fi
  # ...
}

main() {
  log "セットアップを開始..."
  check_architecture
  check_node_abi
  rebuild_for_nodejs
  rebuild_for_electron
  rebuild_esbuild
  log "セットアップ完了"
}

main
```

### Task 8-2: electron.vite.config.ts の DRY 改善

**対象ファイル**: `apps/desktop/electron.vite.config.ts`

**リファクタリング内容**: main と preload で同じ `externalizeDepsPlugin({ exclude: ['@repo/shared'] })` を2回書いている。共通の変数に抽出する。

```typescript
// リファクタリング前
main: {
  plugins: [
    externalizeDepsPlugin({ exclude: ['@repo/shared'] }),
    tsconfigPaths({ projects: [sharedTsconfig] }),
  ],
},
preload: {
  plugins: [
    externalizeDepsPlugin({ exclude: ['@repo/shared'] }),
    tsconfigPaths({ projects: [sharedTsconfig] }),
  ],
},

// リファクタリング後
const sharedExternalize = externalizeDepsPlugin({ exclude: ['@repo/shared'] });
const sharedTsconfigPathsPlugin = tsconfigPaths({ projects: [sharedTsconfig] });

// ...
main: {
  plugins: [sharedExternalize, sharedTsconfigPathsPlugin],
},
preload: {
  plugins: [sharedExternalize, sharedTsconfigPathsPlugin],
},
```

**注意**: `externalizeDepsPlugin` がステートフルなプラグインオブジェクトを返す場合、共有は不可。その場合はファクトリ関数を使う：

```typescript
const createSharedPlugins = () => [
  externalizeDepsPlugin({ exclude: ['@repo/shared'] }),
  tsconfigPaths({ projects: [sharedTsconfig] }),
];

main: { plugins: createSharedPlugins() },
preload: { plugins: createSharedPlugins() },
```

### Task 8-3: package.json exports の構造レビュー

**対象ファイル**: `packages/shared/package.json`

**確認内容**:

1. 全 37 エントリの `require` キーの値が一貫したパターン（`.js` → `.cjs`）になっているか
2. `types` キーの順序が全エントリで統一されているか（推奨: `types` → `require` → `import`）
3. 不要な exports エントリがないか（使われていないモジュールの exports）

**順序統一のルール**: Node.js の条件付き exports では、最初にマッチした条件が使われるため、`types` → `require` → `import` の順序が推奨される。

### Task 8-4: テストコードの重複排除

**対象ファイル**: Phase 4/6 で作成した全テストファイル

**リファクタリング内容**:

1. テストファイル間で共通の `resolve()` パスを `__tests__/build/test-utils.ts` に抽出する
2. `readFileSync` + `JSON.parse` のパターンを共通ユーティリティにする

```typescript
// apps/desktop/src/__tests__/build/test-utils.ts
import { readFileSync } from "fs";
import { resolve } from "path";

export const DESKTOP_ROOT = resolve(__dirname, "../../..");
export const PRELOAD_BUNDLE = resolve(DESKTOP_ROOT, "out/preload/index.js");
export const MAIN_BUNDLE = resolve(DESKTOP_ROOT, "out/main/index.js");
export const DESKTOP_PKG = JSON.parse(
  readFileSync(resolve(DESKTOP_ROOT, "package.json"), "utf-8"),
);

export function readBundle(path: string): string {
  return readFileSync(path, "utf-8");
}
```

### Task 8-5: リファクタリング後の全テスト実行

```bash
pnpm --filter @repo/shared vitest run src/__tests__/build/
pnpm --filter @repo/desktop vitest run src/__tests__/build/
```

全 30 テストが PASS することを確認する。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                   |
| ---------------------- | -------------------------------------- |
| 開発ガイドライン       | `references/development-guidelines.md` |
| アーキテクチャパターン | `references/architecture-patterns.md`  |

## 成果物

| 成果物                         | 配置先                                           | 説明                     |
| ------------------------------ | ------------------------------------------------ | ------------------------ |
| リファクタリング済みスクリプト | `scripts/setup-native-modules.sh`                | 関数化・構造整理         |
| リファクタリング済み設定       | `apps/desktop/electron.vite.config.ts`           | DRY 改善                 |
| テストユーティリティ           | `apps/desktop/src/__tests__/build/test-utils.ts` | 共通パス・ユーティリティ |

## 完了条件

- [ ] `setup-native-modules.sh` が関数化され、Electron 向けリビルドロジックが `rebuild_for_electron()` 関数に分離されている
- [ ] `electron.vite.config.ts` で `externalizeDepsPlugin` の設定が DRY 化されている
- [ ] `packages/shared/package.json` の exports 順序が全エントリで統一されている
- [ ] テストユーティリティ `test-utils.ts` が作成され、テストファイルから利用されている
- [ ] 全 30 テストがリファクタリング後も PASS している
- [ ] **本Phase内の全タスクを100%実行完了**
