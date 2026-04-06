# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 9                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

lint・typecheck・ビルド・テストの全チェックが通過することを確認し、`package.json` の変更が品質基準を満たすことを保証する。

## 品質チェック手順

### 1. Lint チェック

```bash
# リポジトリ全体の lint を実行（root scripts）
pnpm lint

# 期待結果: エラー・警告なし
```

### 2. TypeScript 型チェック

```bash
# desktop パッケージの typecheck を実行
pnpm --filter @repo/desktop typecheck

# 期待結果: 型エラーなし
# （package.json の変更は TypeScript 型に影響しない）
```

### 3. テスト実行

```bash
# desktop パッケージのテストを実行
pnpm --filter @repo/desktop test:run

# 期待結果: 全テストケース通過
# - better-sqlite3-abi.test.ts の全テストが PASS
# - 既存テストに退行がない
```

### 4. ビルド確認

```bash
# desktop パッケージのビルドを実行
pnpm --filter @repo/desktop build

# 期待結果: ビルド成功（エラーなし）
# postinstall の追加によりビルドが壊れていないことを確認
```

### 5. 変更内容の最終確認

```bash
# 変更ファイルを確認（package.json の1行追加のみであることを確認）
git diff apps/desktop/package.json
```

期待される diff:

```diff
  "rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)",
+  "postinstall": "pnpm rebuild:native",
```

## 品質チェック結果サマリー

| チェック項目          | コマンド                                | 期待結果     | 確認結果 |
| --------------------- | --------------------------------------- | ------------ | -------- |
| Lint                  | `pnpm lint`                             | エラーなし   | -        |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck` | 型エラーなし | -        |
| テスト                | `pnpm --filter @repo/desktop test:run`  | 全 PASS      | -        |
| ビルド                | `pnpm --filter @repo/desktop build`     | ビルド成功   | -        |
| 変更差分              | `git diff apps/desktop/package.json`    | 1行追加のみ  | -        |

## JSON バリデーション確認

`package.json` の変更後、JSON として有効であることを確認する:

```bash
# JSON 構文チェック
node -e "require('./apps/desktop/package.json')" && echo "JSON is valid"

# scripts セクションを直接確認
node -e "const s = require('./apps/desktop/package.json').scripts; console.log(s.postinstall); console.log(s['rebuild:native'])"
```

期待出力:

```
pnpm rebuild:native
pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)
```

## 完了条件

- [ ] `pnpm lint` がエラーなしで通過している
- [ ] `pnpm --filter @repo/desktop typecheck` が型エラーなしで通過している
- [ ] `pnpm --filter @repo/desktop test:run` が全テストケース通過している
- [ ] `pnpm --filter @repo/desktop build` がビルド成功している
- [ ] `git diff apps/desktop/package.json` が `postinstall` の1行追加のみであることが確認されている
- [ ] `node -e "require('./apps/desktop/package.json')"` で JSON が有効であることが確認されている
