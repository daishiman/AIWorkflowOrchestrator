# Phase 2: 設計書詳細

## 根本原因分析

```
[原因]
ターミナルが Rosetta 2 (x86_64) モードで起動
  ↓
[結果 1]
Volta が x86_64 版 Node.js v22.21.1 をインストール
(~/.volta/tools/image/node/22.21.1/bin/node = x86_64 専用)
  ↓
[結果 2]
pnpm install 時に process.arch = "x64" を検出
  ↓
[結果 3]
optional dependency として @esbuild/darwin-x64 のみをインストール
@esbuild/darwin-arm64 はインストールされない
  ↓
[結果 4]
arm64 シェルに切り替えて vitest を実行しようとした場合
  ↓
[エラー]
esbuild が @esbuild/darwin-arm64 をロードしようとするがバイナリ不在
"You installed esbuild for another platform" エラー発生
```

**重要**: この問題は esbuild のバグではなく、Node.js のアーキテクチャ不一致が根本原因。
pnpm install 時と実行時の `process.arch` が一致していれば発生しない。

## 修正アプローチ設計

### 即時修正: アーキテクチャ一貫性の確保

現在の環境（Volta x64 Node）で一貫して動作させる方針。

#### Step 1: アーキテクチャ診断

```bash
node -e "console.log(process.arch)"  # 現在: x64
uname -m                              # 現在: x86_64
ls node_modules/@esbuild/ 2>/dev/null # 現在: 未インストール
```

#### Step 2: node_modules の構築（worktree 用）

```bash
# この worktree には node_modules がないため新規インストール
pnpm install
```

#### Step 3: esbuild バイナリ検証

```bash
ls node_modules/@esbuild/
# 期待: darwin-x64（現在の process.arch = x64 に一致）
```

#### Step 4: vitest 実行確認

```bash
pnpm vitest run --reporter=verbose 2>&1 | head -50
pnpm --filter @repo/desktop test:run
```

### 将来の改善: arm64 完全移行

arm64 ネイティブへの完全移行手順（再発防止ドキュメントに記載）:

1. ターミナルの Rosetta 2 設定を解除
2. Volta の Node.js キャッシュをクリア
3. arm64 シェルで `volta install node@22` を再実行
4. `rm -rf node_modules && pnpm install` で再構築

## 再発防止策

### 策 1: CLAUDE.md への注意事項追記

worktree 作成時のアーキテクチャ確認手順を追記。

### 策 2: 環境診断スクリプトの検討

`process.arch` と esbuild バイナリの一致を確認する簡易チェック。

### 策 3: CI 環境での一貫性確保

GitHub Actions `macos-latest` は arm64 ランナーに移行済み（2024年後半以降）。
ローカル環境での不一致が主なリスク。

## 依存チェーン（統合テスト連携）

```
pnpm install (x64 環境)
  ↓
@esbuild/darwin-x64 バイナリがインストールされる
  ↓
tsup (内部で esbuild を使用) が @repo/shared をビルド可能
  ↓
vitest が esbuild 経由でテストファイルをトランスパイル
  ↓
テスト実行成功
```

## 設計判断

| 判断事項           | 決定                             | 根拠                                                   |
| ------------------ | -------------------------------- | ------------------------------------------------------ |
| 即時修正アプローチ | x64 一貫性で修正                 | Volta の x64 Node が既にインストール済み、シェルも x64 |
| arm64 移行         | 再発防止ドキュメントに手順を記載 | ユーザー判断事項（Volta/ターミナル設定変更が必要）     |
| CI 環境対応        | 現時点では未変更                 | macos-latest は既に arm64                              |
| pnpm store prune   | 通常不要                         | store は arch 別に管理される                           |
