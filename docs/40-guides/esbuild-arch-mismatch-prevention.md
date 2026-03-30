# esbuild アーキテクチャ不整合の防止と復旧ガイド

## 概要

macOS 上で Rosetta 経由の x64 Node と native arm64 Node が混在する環境では、`pnpm install` 時に解決される esbuild の optional dependency（`@esbuild/darwin-arm64` / `@esbuild/darwin-x64`）と実行時の `process.arch` がずれることがある。このガイドでは、不整合の診断・修正・再発防止を手順化する。

## 発生条件

| 条件                  | 詳細                                                                           |
| --------------------- | ------------------------------------------------------------------------------ |
| Rosetta / native 混在 | 同一マシンで x64 Node と arm64 Node を切り替えている                           |
| Worktree 作成         | git worktree は `node_modules` を共有しないため、個別に `pnpm install` が必要  |
| Node バージョン切替   | nvm/fnm で異なるアーキテクチャの Node に切り替えた後に `pnpm install` を忘れた |

## 診断方法

### Step 1: 現在の Node アーキテクチャを確認

```bash
node -p "process.arch"
# 期待値: arm64 (Apple Silicon) または x64 (Intel/Rosetta)

file "$(which node)"
# 期待値: Mach-O 64-bit executable arm64 (Apple Silicon の場合)
```

### Step 2: Expected Platform を算出

```bash
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
echo "$EXPECTED_PLATFORM"
# 例: darwin-arm64
```

### Step 3: esbuild パッケージの整合を確認

```bash
# pnpm は .pnpm/ 仮想ストアに配置する
find node_modules/.pnpm -maxdepth 1 -name "@esbuild+${EXPECTED_PLATFORM}@*" -type d
# 1件以上表示されれば OK
```

## 修正手順

### 第一候補: pnpm install --force

```bash
pnpm install --force
```

ほとんどの場合、これだけで esbuild の optional dependency が現在の `process.arch` に合わせて再解決される。

### 第二候補: node_modules 再生成

```bash
rm -rf node_modules
pnpm store prune
pnpm install
```

`--force` で解消しない場合は、`node_modules` を完全に削除してからクリーンインストールする。

### 第三候補: esbuild 個別リビルド

```bash
pnpm rebuild esbuild
```

他のパッケージに影響を与えず esbuild のみ再ビルドしたい場合に使用する。

## 検証方法

修正後に以下を確認する:

```bash
# 1. esbuild パッケージの存在確認
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
find node_modules/.pnpm -maxdepth 1 -name "@esbuild+${EXPECTED_PLATFORM}@*" -type d

# 2. 対象テストの実行
pnpm --filter @repo/desktop exec -- npx vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts

# 3. mismatch エラーが出力に含まれないことを確認
```

## 再発防止: Worktree Preflight チェックリスト

新しい worktree を作成した後、以下を必ず実行する:

```bash
# 1. worktree 作成
git worktree add .worktrees/<name> -b <branch>

# 2. worktree に移動
cd .worktrees/<name>

# 3. 依存関係インストール（必須）
pnpm install

# 4. Node アーキテクチャと esbuild の整合確認
node -p "process.arch"
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
find node_modules/.pnpm -maxdepth 1 -name "@esbuild+${EXPECTED_PLATFORM}@*" -type d

# 5. テスト実行確認
pnpm --filter @repo/desktop exec -- npx vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

## トラブルシューティング

| エラー                                                      | 原因                                               | 対処                                  |
| ----------------------------------------------------------- | -------------------------------------------------- | ------------------------------------- |
| `The package "@esbuild/darwin-arm64" could not be found`    | x64 Node で install 後に arm64 Node で実行         | `pnpm install --force`                |
| `The package "@esbuild/darwin-x64" could not be found`      | arm64 Node で install 後に Rosetta x64 Node で実行 | `pnpm install --force`                |
| `ENOENT: no such file or directory, open '.../esbuild.exe'` | esbuild バイナリが欠損                             | `pnpm rebuild esbuild`                |
| テストが mismatch エラーで失敗                              | runtime と binary の不一致                         | 本ガイドの「修正手順」を順番に実行    |
| `node_modules/@esbuild/` が空                               | pnpm の仮想ストア構造                              | `.pnpm/` 内を確認（正常な可能性あり） |

## 関連情報

- GitHub Issue: #1710
- 未タスク: `UT-RT-06-ESBUILD-ARCH-MISMATCH-001`
- 対象テスト: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts`
