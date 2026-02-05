# Phase 2: バージョン管理設計書

## 設計概要

Node.jsバージョン管理の仕組みは既に実装されています。本Phaseでは既存設計の評価と必要な修正点を特定します。

## 既存設計の評価

### 1. バージョン管理方式

| 方式                   | ファイル                          | 状態                            | 評価 |
| ---------------------- | --------------------------------- | ------------------------------- | ---- |
| nvm                    | `.nvmrc`                          | ✅ 存在 (22.21.1)               | 適切 |
| volta                  | `package.json` (volta)            | ✅ 設定済み (22.21.1)           | 適切 |
| engines                | `package.json` (engines)          | ✅ 設定済み (>=22.21.1 <23.0.0) | 適切 |
| postinstall            | `package.json` (scripts)          | ✅ 設定済み                     | 適切 |
| セットアップスクリプト | `scripts/setup-native-modules.sh` | ✅ 実装済み                     | 優秀 |

### 2. setup-native-modules.sh 評価

**機能**:

- ✅ Node.jsアーキテクチャ検出（arm64/x86_64）
- ✅ バイナリアーキテクチャ確認
- ✅ Node.js ABIバージョン互換性テスト
- ✅ 自動リビルド機能
- ✅ pnpm store prune でキャッシュクリア

**評価**: 非常に堅牢な設計。現在の問題を解決できる。

### 3. pre-pushフック 評価

**機能**:

- ✅ .nvmrcとのバージョン比較（メジャーバージョン）
- ✅ fnm/nvm/volta自動切替
- ✅ バージョン不一致時のスキップモード
- ✅ ドキュメント専用変更の検出

**評価**: 適切に設計されている。

### 4. GitHub Actions CI 評価

**機能**:

- ✅ node-version: "22" 設定
- ✅ pnpm setup-node with cache

**改善提案**: `node-version-file: '.nvmrc'` に変更することで、.nvmrcとの同期が自動化される

## 問題分析

### 現在の問題

グローバルpnpmストアに古いバイナリ（x86_64向け）がキャッシュされており、それが読み込まれている。

**エラーパス**:

```
/Users/dm/Library/pnpm/global/5/.pnpm/better-sqlite3@12.6.2/node_modules/better-sqlite3/
```

### 解決策

`scripts/setup-native-modules.sh` を実行することで解決可能。このスクリプトは：

1. 現在のアーキテクチャを検出
2. バイナリのアーキテクチャを確認
3. 不一致の場合、`pnpm store prune` でキャッシュクリア
4. `pnpm rebuild better-sqlite3` で再ビルド

## 追加設計

### CONTRIBUTING.md 新規作成

現在CONTRIBUTING.mdが存在しないため、新規作成が必要。

**含めるべき内容**:

| セクション             | 内容                         |
| ---------------------- | ---------------------------- |
| 必須要件               | Node.js v22.21.1、pnpm v10.x |
| 環境セットアップ       | nvm/fnm/volta使用方法        |
| ネイティブモジュール   | リビルド手順                 |
| トラブルシューティング | よくある問題と解決方法       |

## 実装計画

| ステップ | アクション                             | 優先度 |
| -------- | -------------------------------------- | ------ |
| 1        | `scripts/setup-native-modules.sh` 実行 | 高     |
| 2        | テスト確認                             | 高     |
| 3        | CONTRIBUTING.md 新規作成               | 中     |
| 4        | CI/CD設定確認（オプション）            | 低     |

## 設計決定

### 決定1: 既存スクリプトの活用

`setup-native-modules.sh` は既に必要な機能を持っているため、新規スクリプト作成は不要。

### 決定2: CI設定は現状維持

`node-version: "22"` はメジャーバージョン指定として適切。.nvmrc参照への変更は将来の改善として記録。

### 決定3: CONTRIBUTING.md新規作成

開発者オンボーディングのためにCONTRIBUTING.mdを新規作成する。
