# 問題分析レポート

## 作成日

2026-01-13

## 概要

GitHub Actions CI で macOS ビルドが `entitlements.mac.plist: cannot read entitlement data` エラーで失敗する。

## エラー詳細

### エラーメッセージ

```
⨯ Command failed: codesign --sign - --force --timestamp --options runtime
  --entitlements build/entitlements.mac.plist
  /path/to/app.asar.unpacked/node_modules/@anthropic-ai/claude-agent-sdk/vendor/ripgrep/arm64-darwin/rg
build/entitlements.mac.plist: cannot read entitlement data
```

### 発生箇所

- **ワークフロー**: `.github/workflows/build-electron.yml`
- **ジョブ**: `build-macos-arm64`
- **ステップ**: `Package (without signing)`
- **コマンド**: `pnpm --filter @repo/desktop package:mac`
- **Runner**: `macos-14` (Apple Silicon)

### エラー発生の流れ

```
1. electron-builder 実行
2. macOSビルド開始
3. Hardened Runtime設定でcodesignが呼び出される
4. codesignが --entitlements build/entitlements.mac.plist を参照
5. ファイルが存在しないためエラー発生
6. ビルド全体が失敗
```

## 根本原因分析

### 1. 設定と実体の不一致

`electron-builder.yml` で以下の設定がある:

```yaml
mac:
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
```

しかし、参照されている `apps/desktop/build/entitlements.mac.plist` ファイルが存在しない。

### 2. macOS Hardened Runtime の要件

- macOS 10.14以降、公証（Notarization）にはHardened Runtimeが必須
- Hardened Runtimeを有効にする場合、entitlementsファイルが必要
- ElectronアプリはJITコンパイルを使用するため、特定の権限が必要

### 3. electron-builder の動作

- `hardenedRuntime: true` が設定されている場合、codesignに `--options runtime` が追加される
- `entitlements` が設定されている場合、codesignに `--entitlements <path>` が追加される
- ファイルが存在しないとcodesignがエラーを返す

## 現在の設定

### electron-builder.yml (関連部分)

```yaml
mac:
  category: public.app-category.productivity
  artifactName: ${productName}-${version}-${arch}.${ext}
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  target:
    - target: zip
      arch:
        - x64
        - arm64
```

### ファイル存在確認

```bash
$ ls -la apps/desktop/build/
# entitlements.mac.plist は存在しない
```

### 影響範囲

| 項目                         | 影響                               |
| ---------------------------- | ---------------------------------- |
| macOS (Apple Silicon) ビルド | 失敗（entitlementsファイル不足）   |
| macOS (Intel) ビルド         | 無効化中（同様の問題が予想される） |
| Windows ビルド               | 無効化中（影響なし）               |
| Linux ビルド                 | 無効化中（影響なし）               |
| ローカルビルド               | 失敗（同様にentitlementsが必要）   |

## 必要なentitlements

Electron/V8のJITコンパイルに必要な最小限の権限:

| 権限                                                     | 目的                           |
| -------------------------------------------------------- | ------------------------------ |
| `com.apple.security.cs.allow-jit`                        | JITコンパイルを許可            |
| `com.apple.security.cs.allow-unsigned-executable-memory` | 署名なしの実行可能メモリを許可 |

## 結論

`electron-builder.yml` で参照されている `entitlements.mac.plist` ファイルが存在しないことがビルドエラーの根本原因。このファイルを作成し、Electron/V8のJIT動作に必要な最小限の権限を定義する必要がある。

## 完了確認

- [x] GitHub Actions のビルドログを詳細に分析した
- [x] `codesign` エラーの発生箇所を特定した
- [x] `electron-builder.yml` の entitlements 設定を確認した
- [x] `apps/desktop/build/` ディレクトリの状況を確認した
