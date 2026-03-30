# Implementation Guide — UT-RT-06-ESBUILD-ARCH-MISMATCH-001

## Part 1: 中学生向けの説明

### なぜ必要か

パソコンの中で動くプログラムには「部品」が必要です。esbuild はコードを高速に変換する部品で、Apple Silicon (arm64) 用と Intel (x64) 用の2種類があります。

たとえるなら、Nintendo Switch のゲームカードを PlayStation に入れても動かないのと同じです。arm64 の Node.js で動いているのに、x64 用の esbuild 部品が入っていると、テストは始まる前に「部品が見つからない」と止まります。

### 何をしたか

1. 今のパソコンが arm64 で動いているか確認した
2. esbuild の arm64 用部品が正しくインストールされているか確認した
3. テストが全部通ることを確認した
4. 今後同じ問題が起きないように、チェックリスト付きのガイドを作った

### なぜ重要か

この問題はコードのバグではなく、環境のずれが原因です。環境のずれは「テストが失敗した」という見た目になるため、原因を見つけるのに時間がかかります。チェックリストを残すことで、次に同じ状況になったとき、すぐに原因を特定して直せるようになります。

---

## Part 2: 技術者向け詳細

### 問題の概要

macOS 上で Rosetta 経由の x64 Node と native arm64 Node が混在する環境では、`pnpm install` 時に解決される esbuild の optional dependency と実行時の `process.arch` がずれることがある。

### 影響範囲

| 項目           | 詳細                                                             |
| -------------- | ---------------------------------------------------------------- |
| 対象テスト     | `RuntimeSkillCreatorFacade.sdk-normalization.test.ts` (27 tests) |
| 対象パッケージ | `@esbuild/darwin-arm64` / `@esbuild/darwin-x64`                  |
| 影響           | vitest 起動停止（esbuild binary not found）                      |

### 診断手順

```bash
# 1. 現在のアーキテクチャを確認
node -p "process.arch"
# → arm64

# 2. Expected Platform を算出
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
echo "$EXPECTED_PLATFORM"
# → darwin-arm64

# 3. pnpm 仮想ストアで esbuild パッケージを確認
find node_modules/.pnpm -maxdepth 1 -name "@esbuild+${EXPECTED_PLATFORM}@*" -type d
# → 1件以上表示されれば OK
```

### 修正手順

| 優先度   | コマンド                                                  | 用途                         |
| -------- | --------------------------------------------------------- | ---------------------------- |
| 第一候補 | `pnpm install --force`                                    | optional dependency の再解決 |
| 第二候補 | `rm -rf node_modules && pnpm store prune && pnpm install` | クリーンインストール         |
| 第三候補 | `pnpm rebuild esbuild`                                    | esbuild のみリビルド         |

### 検証手順

```bash
# esbuild パッケージの存在確認
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
find node_modules/.pnpm -maxdepth 1 -name "@esbuild+${EXPECTED_PLATFORM}@*" -type d

# target test の実行
pnpm --filter @repo/desktop exec -- npx vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### 実行結果

| 項目              | 結果                                                           |
| ----------------- | -------------------------------------------------------------- |
| Node arch         | arm64 (native Apple Silicon)                                   |
| esbuild packages  | darwin-arm64 × 4 バージョン (0.18.20, 0.21.5, 0.25.12, 0.27.2) |
| Target test       | 27 passed, exit 0                                              |
| 周辺 runtime test | 20 files, 314 passed                                           |
| mismatch エラー   | なし                                                           |

### Worktree Preflight チェックリスト

新しい worktree を作成した後、必ず以下を実行:

1. `pnpm install`
2. `node -p "process.arch"` で arch 確認
3. `find node_modules/.pnpm -maxdepth 1 -name "@esbuild+darwin-$(node -p process.arch)@*" -type d` で esbuild 確認
4. target test 実行で動作確認

### トラブルシューティング

| エラー                                     | 原因                                  | 対処                   |
| ------------------------------------------ | ------------------------------------- | ---------------------- |
| `@esbuild/darwin-arm64 could not be found` | x64 Node で install 後に arm64 で実行 | `pnpm install --force` |
| `@esbuild/darwin-x64 could not be found`   | arm64 で install 後に x64 で実行      | `pnpm install --force` |
| `node_modules/@esbuild/` が空              | pnpm の仮想ストア構造（正常）         | `.pnpm/` 内を確認      |

### 成果物

| 成果物         | パス                                                 |
| -------------- | ---------------------------------------------------- |
| 再発防止ガイド | `docs/40-guides/esbuild-arch-mismatch-prevention.md` |
| テスト実行結果 | `outputs/phase-5/test-result.md`                     |
| 本実装ガイド   | `outputs/phase-12/implementation-guide.md`           |

### 関連情報

- GitHub Issue: #1710
- 未タスク ID: `UT-RT-06-ESBUILD-ARCH-MISMATCH-001`
