# next lint 移行計画: TASK-CI-FIX-001

## 1. 移行概要

| 項目   | 内容                                               |
| ------ | -------------------------------------------------- |
| 移行元 | `next lint`（Next.js 内蔵 lint コマンド）          |
| 移行先 | `eslint .`（ESLint CLI 直接呼び出し）              |
| 理由   | Next.js 16 で `next lint` サブコマンドが削除された |

## 2. 移行手順

### Step 1: package.json の lint スクリプト変更

- ファイル: `apps/backend/package.json`
- 変更: `"lint": "next lint"` → `"lint": "eslint . --cache --cache-location .next/cache/eslint/"`

### Step 2: eslint.config.mjs の更新

- ファイル: `apps/backend/eslint.config.mjs`
- 変更: ignores のみの設定 → FlatCompat による eslint-config-next ルール統合

### Step 3: 動作確認

1. `pnpm --filter @repo/backend lint` が正常終了することを確認
2. `pnpm lint`（ルート）が正常終了することを確認
3. ESLint 設定ダンプで Next.js ルールの存在を確認

## 3. ロールバック計画

移行に問題が発生した場合:

1. `apps/backend/package.json` の `lint` スクリプトを `"next lint"` に戻す
2. `apps/backend/eslint.config.mjs` を元の ignores のみの設定に戻す

## 4. 検証項目

| 検証項目               | 検証方法                                      | 優先度 |
| ---------------------- | --------------------------------------------- | ------ |
| lint スクリプト動作    | `pnpm --filter @repo/backend lint` の実行確認 | 高     |
| ルート lint との非干渉 | `pnpm lint`（ルート）の実行確認               | 高     |
| ESLint 設定の正しさ    | 設定ファイルの構文チェック                    | 高     |
| キャッシュ動作         | 2回連続実行で2回目が高速であること            | 低     |
