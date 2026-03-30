# esbuild アーキテクチャ不整合 - 再発防止手順書

## 概要

Apple Silicon Mac で esbuild のアーキテクチャ不整合が発生した場合の診断・修正・予防手順。

## 1. 診断手順

### 1-1: アーキテクチャ状態の確認

```bash
# Node.js アーキテクチャ確認
node -e "console.log('arch:', process.arch, 'platform:', process.platform)"

# OS カーネルのアーキテクチャ確認
uname -m

# Apple Silicon かどうかの確認
sysctl -n hw.optional.arm64  # 1 = Apple Silicon

# シェルのアーキテクチャ確認
arch  # arm64 or i386(Rosetta 2)

# 現在の Node バイナリの種類
file $(which node)
```

### 1-2: esbuild バイナリの確認

```bash
# esbuild バイナリの存在確認
ls node_modules/.pnpm/@esbuild+darwin-*/

# 期待: process.arch に対応するバイナリが存在すること
# x64 → @esbuild+darwin-x64
# arm64 → @esbuild+darwin-arm64
```

### 1-3: 不整合の判定

以下の場合に不整合が発生している:

- `process.arch` = `x64` だが `@esbuild/darwin-x64` がない
- `process.arch` = `arm64` だが `@esbuild/darwin-arm64` がない
- install 時と実行時の `process.arch` が異なる

## 2. 修正手順

### パターン A: node_modules を再構築（最も一般的）

```bash
# 1. 現在のアーキテクチャを確認
node -e "console.log(process.arch)"

# 2. node_modules を削除して再インストール
rm -rf node_modules
pnpm install

# 3. esbuild バイナリが正しく配置されたことを確認
ls node_modules/.pnpm/@esbuild+darwin-*/

# 4. vitest が起動することを確認
pnpm vitest run --reporter=verbose 2>&1 | head -20
```

### パターン B: arm64 ネイティブに切り替える場合

```bash
# 1. ターミナルの Rosetta 2 設定を解除
#    - Terminal.app: 情報を見る → 「Rosettaを使用して開く」のチェックを外す
#    - iTerm2: 同様の設定を確認

# 2. arm64 シェルを起動（一時的）
arch -arm64 /bin/zsh

# 3. Node.js のバージョンマネージャーで arm64 版を再インストール
#    Volta の場合:
#    - ~/.volta/tools/image/node/<version>/ を削除
#    - ~/.volta/tools/inventory/node/ の該当 tarball を削除
#    - volta install node@22 を実行

# 4. node_modules を再構築
rm -rf node_modules
pnpm install

# 5. 確認
node -e "console.log(process.arch)"  # arm64 であること
ls node_modules/.pnpm/@esbuild+darwin-arm64*/
```

## 3. 予防策

### 3-1: worktree 作成時の確認

新しい worktree を作成した場合、必ず以下を実行:

```bash
# アーキテクチャ確認
node -e "console.log(process.arch)"

# node_modules が存在しない場合はインストール
pnpm install

# esbuild バイナリ確認
ls node_modules/.pnpm/@esbuild+darwin-*/
```

### 3-2: アーキテクチャ切替時の必須作業

シェルのアーキテクチャを切り替えた場合（例: Rosetta 2 → arm64）:

```bash
# 必ず node_modules を再構築
rm -rf node_modules
pnpm install
```

### 3-3: CI 環境での注意事項

GitHub Actions `macos-latest` は arm64 ランナーに移行済み（2024年後半以降）。
ローカル開発環境との不一致がリスク。CI ログで `process.arch` を確認する:

```yaml
- name: Verify architecture
  run: |
    echo "Node arch: $(node -e 'console.log(process.arch)')"
    echo "OS arch: $(uname -m)"
```

## 4. 根本原因の理解

```
pnpm install 時の process.arch
  ↓
esbuild の optional dependency 解決
  ↓
process.arch に対応するバイナリのみインストール
  (@esbuild/darwin-x64 or @esbuild/darwin-arm64)
  ↓
vitest 実行時の process.arch
  ↓
対応するバイナリをロード
  ↓
install 時と実行時の arch が異なる場合 → ロードエラー
```

**重要**: この問題は esbuild のバグではなく、Node.js のアーキテクチャ不一致が根本原因。
