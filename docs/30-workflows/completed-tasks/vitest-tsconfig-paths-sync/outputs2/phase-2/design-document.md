# Phase 2: 設計書 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 2                                   |
| タスクID | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| 実行日   | 2026-02-24                          |

## 設計概要

### D1: 4層構造対応

4つのパーサーが各設定ファイルを `Map` に変換する:

| パーサー             | 入力ファイル                    | 出力型                     |
| -------------------- | ------------------------------- | -------------------------- |
| `parseExports`       | `packages/shared/package.json`  | `Map<string, ExportEntry>` |
| `parsePaths`         | `apps/desktop/tsconfig.json`    | `Map<string, string[]>`    |
| `parseAliases`       | `apps/desktop/vitest.config.ts` | `Map<string, string>`      |
| `parseTypesVersions` | `packages/shared/package.json`  | `Map<string, string[]>`    |

### D2: 6つの双方向チェック

exports を正本として、3つの対象（paths / aliases / typesVersions）それぞれと双方向で比較する:

```
exports ←→ paths           (Check 1, 2)
exports ←→ aliases         (Check 3, 4)
exports ←→ typesVersions   (Check 5, 6)
```

共通ロジックは `checkMapContainment` 汎用関数に抽出し、`keyTransform` パラメータでキー変換を注入する（Strategy パターン）。

### D3: レポート出力形式

```
Check N: {checkName} (PASSED|FAILED)
[FAILEDの場合] Missing: {key1}, {key2}, ...

ALL CHECKS PASSED  または  SYNC CHECK FAILED: {count} issue(s) found
```

### D4: ファイルパスの定数管理

`CONFIG` オブジェクトで3つのファイルパスと共有プレフィックスを一元管理:

```typescript
export const CONFIG = {
  PACKAGE_JSON_PATH: "packages/shared/package.json",
  TSCONFIG_PATH: "apps/desktop/tsconfig.json",
  VITEST_CONFIG_PATH: "apps/desktop/vitest.config.ts",
  SHARED_PREFIX: "@repo/shared",
} as const;
```

### D5: キー変換ロジックの分離

3つの独立した変換関数:

| 関数名               | 変換                                  | 例                                    |
| -------------------- | ------------------------------------- | ------------------------------------- |
| `toModuleKey`        | exports サブパス → モジュール名       | `"."` → `"@repo/shared"`              |
| `toSubpath`          | モジュール名 → exports サブパス       | `"@repo/shared/core"` → `"./core"`    |
| `toTypesVersionsKey` | exports サブパス → typesVersions キー | `"./core"` → `"core"`, `"."` → `null` |

## vite-tsconfig-paths プラグイン設計

`vitest.config.ts` の `plugins` 配列に `tsconfigPaths()` を追加し、`tsconfig.json` の `compilerOptions.paths` から `@repo/shared` のalias解決を自動化する。これにより27個の手動alias定義を削除できる。

alias チェック（Check 3, 4）は alias 0件時に早期return でPASSを返す設計とし、プラグイン使用時も正常動作する。

## CI ジョブ設計

`.github/workflows/ci.yml` に `check-module-sync` ジョブを追加:

- ジョブ名: `Module Sync Check`
- 実行コマンド: `pnpm check:module-sync`
- タイムアウト: 2分
- Node.js: 22
- pnpm install: `--frozen-lockfile`

## 完了条件

- [x] D1-D5 の設計項目が全て定義されている
- [x] プラグイン設計が記述されている
- [x] CI ジョブ設計が記述されている
- [x] 本設計書が作成されている
