# Phase 1: 要件サマリー

## タスク概要

esbuild darwin アーキテクチャ不整合を解消し、vitest を正常に実行可能にする。

## 環境診断結果

| 項目                   | コマンド                                          | 結果                                        | 備考                              |
| ---------------------- | ------------------------------------------------- | ------------------------------------------- | --------------------------------- |
| Node.js アーキテクチャ | `node -e "console.log(process.arch)"`             | `x64`                                       | Rosetta 2 経由                    |
| OS アーキテクチャ      | `uname -m`                                        | `x86_64`                                    | シェルが Rosetta 2 で起動         |
| ハードウェア           | `sysctl -n machdep.cpu.brand_string`              | Apple M1 Pro                                | arm64 ネイティブ                  |
| Apple Silicon 判定     | `sysctl -n hw.optional.arm64`                     | `1`                                         | arm64 対応ハードウェア            |
| esbuild バイナリ       | `ls node_modules/@esbuild/`                       | 未インストール                              | worktree で node_modules 未構築   |
| Node バイナリパス      | `which node`                                      | `/usr/local/bin/node` → `~/.volta/bin/node` | Volta 管理                        |
| Node バイナリ種別      | `file ~/.volta/tools/image/node/22.21.1/bin/node` | x86_64 専用                                 | Volta が x64 版をインストール済み |
| シェルアーキテクチャ   | `arch`                                            | `i386`                                      | Rosetta 2                         |
| Node.js バージョン     | `node --version`                                  | v22.21.1                                    | .nvmrc: 22.21.1                   |

## 根本原因の特定

Apple Silicon (M1 Pro) Mac において、ターミナルが Rosetta 2 (x86_64) モードで起動されており、
Volta が x86_64 版の Node.js v22.21.1 をインストールしている。このため:

1. `process.arch` = `x64` → pnpm が `@esbuild/darwin-x64` をインストール
2. arm64 シェルに切り替えた場合、`@esbuild/darwin-arm64` が不在でエラー発生

## スコープ

### 含む

- アーキテクチャ一貫性の確保（install 時と実行時の arch を統一）
- `node_modules` の再構築（worktree 用）
- vitest 起動確認（esbuild エラーなし）
- 再発防止ドキュメントの作成
- arm64 完全移行手順の文書化

### 含まない

- esbuild バージョンアップグレード
- テストケースの追加・修正
- CI/CD パイプラインの全面見直し
- pnpm バージョンアップグレード
- Volta 自体の再インストール（ユーザー判断事項）

## esbuild バイナリ接続要件（統合テスト連携）

- esbuild は `process.arch` と `process.platform` の組み合わせで optional dependency を解決する
- x64 Node.js 環境では `@esbuild/darwin-x64` が必須
- arm64 Node.js 環境では `@esbuild/darwin-arm64` が必須
- **install 時と実行時で arch が異なる場合**、バイナリ不在エラーが発生する
- 修正方針: install と実行で同一アーキテクチャを使用することで一貫性を保証
