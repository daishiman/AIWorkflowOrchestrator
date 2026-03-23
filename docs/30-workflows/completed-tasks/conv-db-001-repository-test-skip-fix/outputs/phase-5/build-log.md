# Phase 5: リビルド実行記録

## 実行日時

2026-03-22

## 環境情報

| 項目           | 値                                       |
| -------------- | ---------------------------------------- |
| Node.js        | v22.21.1 (v22.20.0 in execution context) |
| ABI            | 127                                      |
| OS             | darwin x86_64 (macOS, Rosetta 2 経由)    |
| better-sqlite3 | 12.8.0                                   |
| pnpm           | workspace monorepo                       |

## 事前診断

### 根本原因（Phase 1 分析との差分）

Phase 1 では「`.node` バイナリが存在しない（ABI 不一致）」と診断されたが、実際の原因は**CPU アーキテクチャの不一致**だった:

- **バイナリ**: arm64 でビルド済み（ファイルは存在）
- **Node.js 実行環境**: x86_64（Rosetta 2 経由）
- **エラー**: `mach-o file, but is an incompatible architecture (have 'arm64', need 'x86_64')`

P7 パターンの変種: ABI バージョン不一致ではなく、CPU アーキテクチャ不一致。

### K3 確認（worktree 環境）

- `apps/desktop/node_modules` はシンボリックリンクではなく独立ディレクトリ: PASS
- worktree 内でリビルド可能: YES

## リビルド実行

### 方法D: pnpm rebuild（第1候補）- 成功

```bash
pnpm rebuild better-sqlite3
```

- gyp info: `node@22.20.0 | darwin | x64`
- コンパイル: `CC(target)` → `CXX(target)` → `SOLINK_MODULE(target)` → `better_sqlite3.node` 生成
- 警告1件: `-Wcast-function-type-mismatch`（機能影響なし）
- 結果: `gyp info ok`

### 追加リビルド: esbuild

Vitest 実行時に esbuild も同じアーキテクチャ不一致が発生したため、追加でリビルド:

```bash
pnpm rebuild esbuild
```

- esbuild 3バージョン（0.21.5, 0.25.12, 0.27.2）のすべてで `@esbuild/darwin-x64` をインストール
- 結果: Done

### フォールバック

方法D が成功したため、方法A / 方法C は実行不要だった。

## リビルド後の検証

| 検証項目               | コマンド                              | 結果                                                  |
| ---------------------- | ------------------------------------- | ----------------------------------------------------- |
| バイナリ存在           | `find ... -name "*.node"`             | `better_sqlite3.node` + `test_extension.node`         |
| バイナリアーキテクチャ | `file better_sqlite3.node`            | `Mach-O 64-bit bundle x86_64` (arm64 → x86_64 に変更) |
| ロードテスト           | `node -e "require('better-sqlite3')"` | OK                                                    |
| メモリDB作成           | `new s(':memory:')` → `db.close()`    | OK                                                    |

## リビルド手順（再現用）

```bash
# 1. better-sqlite3 リビルド
pnpm rebuild better-sqlite3

# 2. esbuild リビルド（Vitest 実行に必要）
pnpm rebuild esbuild

# 3. 検証
node -e "const s = require('better-sqlite3'); const db = new s(':memory:'); db.close(); console.log('OK')"
```
