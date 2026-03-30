# Phase 12: 実装ガイド - esbuild darwin アーキテクチャ不整合修正

## Part 1: 中学生レベル（概念的説明）

### なぜ必要か（Why）

コンピューターには「言語」（アーキテクチャ）があります。Apple の新しい Mac は「arm64」という言語を話しますが、古い Intel の Mac は「x64」という別の言語を話します。プログラムの道具（esbuild）は、コンピューターの言語に合ったものを使わないと動きません。

### 何をしたか（What）

Node.js の言語（アーキテクチャ）を統一して、esbuild というテスト実行に必要な道具を正しくインストールし直しました。

### 日常の例え

英語の本を日本語しか読めない人に渡しても読めないのと同じです。arm64 の Mac に x64 の道具を入れても動きません。反対に、x64 モードで動いている Mac には x64 の道具が必要です。**大事なのは、道具を入れるときと使うときの「言語」を統一すること**です。

### 今回やったこと

1. 今の Mac がどの「言語」で動いているか確認した（→ x64 だった）
2. x64 環境で道具（node_modules）を入れ直した（`pnpm install`）
3. テストツール（vitest）が正常に動くことを確認した
4. 将来同じ問題が起きないように手順書を作った

---

## Part 2: 技術者レベル（技術的詳細）

### esbuild optionalDependencies 機構

esbuild は platform-specific なネイティブバイナリを `optionalDependencies` として配布している。
この worktree では `x64` に統一して動かしているが、原理は `arm64` でも同じで、**install 時と実行時の `process.arch` を一致させる**ことが重要。

```json
{
  "optionalDependencies": {
    "@esbuild/darwin-arm64": "0.25.12",
    "@esbuild/darwin-x64": "0.25.12",
    "@esbuild/linux-x64": "0.25.12"
  }
}
```

### TypeScript 型定義

```ts
type HostPlatform = "darwin" | "linux" | "win32";
type HostArch = "x64" | "arm64";

interface EsbuildBinaryProfile {
  platform: HostPlatform;
  arch: HostArch;
  packageName: `@esbuild/${string}`;
  installCommand: "pnpm install" | "pnpm install --force";
}
```

### CLI シグネチャ

```bash
node -e "console.log(process.arch)"
node -e "console.log(process.platform)"
uname -m
arch
file $(which node)
ls node_modules/.pnpm/@esbuild+darwin-*/
pnpm install
pnpm install --force
pnpm vitest run --reporter=verbose
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### pnpm install 時のバイナリ選択

pnpm は install 時に `process.arch` と `process.platform` を参照し、該当する optional dependency のみを解決する。
cache に両アーキテクチャのバイナリが残っていても、**実行時に見えるバイナリは現在の Node.js アーキテクチャに依存する**。

### 使用例

```bash
# 1. 現在の Node.js アーキテクチャを確認する
node -e "console.log(process.arch)"

# 2. 期待するアーキテクチャでシェルを起動する
arch -arm64 /bin/zsh

# 3. node_modules を再構築する
rm -rf node_modules
pnpm install

# 4. esbuild バイナリと vitest 起動を確認する
ls node_modules/.pnpm/@esbuild+darwin-*/
pnpm vitest run --reporter=verbose
```

### エラーハンドリング

- `process.arch` とインストール済みバイナリが一致しない場合は、`node_modules` を削除して再インストールする
- Rosetta 2 経由の Node.js を検出した場合は、`arch -arm64 /bin/zsh` で native shell に切り替える
- `pnpm vitest run` が起動直後に esbuild エラーで止まる場合は、`file $(which node)` と `ls node_modules/.pnpm/@esbuild+darwin-*/` を先に確認する

### エッジケース

- Rosetta 2 の Terminal.app / iTerm2 で x64 Node が起動している
- Volta が x64 版 Node.js を指したままになっている
- worktree をまたいで `node_modules` を流用している
- `pnpm install` 後に `pnpm install --force` が必要なキャッシュ状態が残っている
- `darwin-arm64` と `darwin-x64` の両方が store にあるが、現在の `process.arch` が片方にしか一致しない

### 設定項目 / 定数一覧

| 項目         | 値 / 方針                                         |
| ------------ | ------------------------------------------------- |
| `.nvmrc`     | `22.21.1`                                         |
| shell 切替   | `arch -arm64 /bin/zsh`                            |
| Node 確認    | `node -e "console.log(process.arch)"`             |
| インストール | `rm -rf node_modules && pnpm install`             |
| 再解決       | `pnpm install --force`                            |
| 予防メモ     | install 時と run 時の `process.arch` を一致させる |

### 環境診断コマンド一覧

| コマンド                                         | 確認内容                    | 期待結果                           |
| ------------------------------------------------ | --------------------------- | ---------------------------------- |
| `node -e "console.log(process.arch)"`            | Node.js のアーキテクチャ    | `x64` or `arm64`                   |
| `node -e "console.log(process.platform)"`        | Node.js のプラットフォーム  | `darwin`                           |
| `uname -m`                                       | OS カーネルのアーキテクチャ | `x86_64` or `arm64`                |
| `arch`                                           | シェルのアーキテクチャ      | `i386` (Rosetta) or `arm64`        |
| `sysctl -n hw.optional.arm64`                    | Apple Silicon 判定          | `1` = Apple Silicon                |
| `file $(which node)`                             | Node バイナリの種類         | `Mach-O ... x86_64` or `arm64`     |
| `ls node_modules/.pnpm/ \| grep @esbuild+darwin` | esbuild バイナリの存在      | `darwin-x64` and/or `darwin-arm64` |

### 再発防止設定

#### Rosetta 2 経由 Node.js の検出・回避

```bash
# Rosetta 2 で動作中かの判定
if [ "$(arch)" = "i386" ]; then
  echo "WARNING: Running under Rosetta 2"
  echo "Consider: arch -arm64 /bin/zsh"
fi
```

#### .nvmrc の設定

```
22.21.1
# NOTE: Apple Silicon Mac では arch を確認してから nvm use を実行すること
```

#### worktree 作成時の手順

```bash
# 1. アーキテクチャ確認
node -e "console.log(process.arch)"

# 2. node_modules 構築
pnpm install

# 3. esbuild バイナリ確認
ls node_modules/.pnpm/ | grep @esbuild+darwin
```

### 根本原因の因果連鎖

```text
Rosetta 2 (x86_64) ターミナル
  ↓
Volta が x86_64 版 Node.js をインストール
  ↓
process.arch = "x64"
  ↓
pnpm install → @esbuild/darwin-x64 をインストール
  ↓
arm64 シェルに切替 → process.arch = "arm64"
  ↓
esbuild が @esbuild/darwin-arm64 をロード試行
  ↓
バイナリ不在 → "You installed esbuild for another platform" エラー
```

**解決策**: install 時と実行時の `process.arch` を一致させる。
