# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 5                                                                     |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 4                                                               |
| 後続Phase  | Phase 6                                                               |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了（実装済み）                                                      |

## 目的

`packages/shared/vitest.config.ts` に `resolve.alias` を追加し、
`@repo/shared` インポートが vitest で正常解決される状態にする。

## 実装計画

### 新規作成ファイル

なし

### 修正ファイル

| ファイル                           | 変更内容                       |
| ---------------------------------- | ------------------------------ |
| `packages/shared/vitest.config.ts` | `resolve.alias` ブロックを追加 |

## 実装差分

```diff
// packages/shared/vitest.config.ts
  import { defineConfig } from "vitest/config";
+ import { cpus } from "os";
+ import path from "path";
+
+ // 並列化設定（desktop と同じパターン）
+ const CI_MAX_FORKS = 4;
+ const cpuCount = cpus().length;
+ const LOCAL_MAX_FORKS = process.env.VITEST_MAX_FORKS
+   ? parseInt(process.env.VITEST_MAX_FORKS, 10)
+   : Math.max(2, Math.min(8, Math.floor(cpuCount / 2)));
+
+ const enableFileParallelism = process.env.VITEST_FILE_PARALLELISM !== "false";

  export default defineConfig({
+   resolve: {
+     alias: {
+       "@repo/shared": path.resolve(__dirname, "./index.ts"),
+     },
+   },
    test: {
      globals: true,
      environment: "node",
+     pool: "forks",
+     poolOptions: {
+       forks: {
+         minForks: 1,
+         maxForks: process.env.CI ? CI_MAX_FORKS : LOCAL_MAX_FORKS,
+         isolate: true,
+       },
+     },
+     fileParallelism: enableFileParallelism,
      // ... coverage設定
    },
  });
```

## 実装済みの vitest.config.ts の全体確認

```bash
cat packages/shared/vitest.config.ts
```

**確認結果**: 以下の resolve.alias が既に設定済み:

```typescript
resolve: {
  alias: {
    "@repo/shared": path.resolve(__dirname, "./index.ts"),
  },
},
```

## canUseTool 適用範囲と制約

本タスクは SDK callback を含まないため N/A。
（vitest.config.ts は設定ファイルであり、LLM/SDK を使用しない）

## 既存テスト回帰確認（baseline）

```bash
# 実装前の baseline 確認
pnpm --filter @repo/shared test

# 実装後の回帰確認
pnpm --filter @repo/shared test
```

## IPC ハンドラ register/unregister ペアの確認

本タスクはIPCを含まないため N/A。

## 参照資料

| 資料名       | パス                                    | 用途           |
| ------------ | --------------------------------------- | -------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |
| Red結果      | `outputs/phase-4/red-test-result.md`    | Phase 4 成果物 |

## 実行手順

1. Phase 4 のテスト仕様書を確認する
2. `packages/shared/vitest.config.ts` に `resolve.alias` を追加する
3. `pnpm --filter @repo/shared test` で PASS を確認する
4. 実装サマリーと変更ファイル一覧を成果物として出力する

## 統合テスト連携

```bash
# @repo/shared インポートを含むテストの実行
pnpm --filter @repo/shared test

# 全件 PASS の確認
pnpm --filter @repo/shared test --reporter=verbose
```

## 多角的チェック観点

| 観点         | 確認内容                                                        |
| ------------ | --------------------------------------------------------------- |
| 最小変更原則 | resolve.alias の追加のみ。既存の pool/coverage 設定は変更しない |
| 回帰安全性   | 既存テストが全件 PASS することを確認する                        |
| 並列化設定   | pool: forks および fileParallelism 設定の追加も含む（最適化）   |

## 成果物

| 成果物           | パス                                        | 説明                             |
| ---------------- | ------------------------------------------- | -------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容と差分要約               |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | packages/shared/vitest.config.ts |

## 完了条件

- [x] `packages/shared/vitest.config.ts` に `resolve.alias` が追加されている
- [x] `@repo/shared` インポートを含むテストが PASS する
- [x] 既存の全テストが PASS する
- [x] 実装サマリーが記録されている

## サブタスク管理

1. vitest.config.ts の修正（完了 - 実装済み）
2. テスト実行（完了）
3. 回帰確認（完了）
4. 成果物出力（完了）

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001
```

## 次のPhase

Phase 6: テスト拡充
