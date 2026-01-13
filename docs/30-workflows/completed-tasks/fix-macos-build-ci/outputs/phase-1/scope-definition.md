# スコープ定義書

## 作成日

2026-01-13

## 概要

macOS CI ビルドエラー（entitlements.mac.plist不足）修正の対象範囲と対象外を明確に定義する。

---

## 修正対象（In Scope）

### ファイル

| ファイルパス                                | 修正内容                                |
| ------------------------------------------- | --------------------------------------- |
| `apps/desktop/build/entitlements.mac.plist` | 新規作成：Electron/V8用entitlements定義 |

### 作成内容

1. **entitlements.mac.plist の新規作成**
   - `apps/desktop/build/` ディレクトリにファイルを配置
   - macOS Hardened Runtime用のentitlementsを定義
   - JITコンパイルに必要な最小限の権限のみを付与

### 作成するファイルの内容

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- JITコンパイル許可 (Electron/V8に必須) -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <!-- 署名なしの実行可能メモリ許可 (Electron/V8に必須) -->
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
</dict>
</plist>
```

---

## 修正対象外（Out of Scope）

### ファイル

| ファイルパス                           | 理由                                                 |
| -------------------------------------- | ---------------------------------------------------- |
| `apps/desktop/electron-builder.yml`    | 既存設定は正しい（entitlementsパスが正確に設定済み） |
| `.github/workflows/build-electron.yml` | ワークフロー自体は正しい（変更不要）                 |
| `apps/desktop/package.json`            | スクリプトに変更なし                                 |
| `apps/desktop/scripts/notarize.mjs`    | 署名なしビルドのため現在は無効                       |

### 機能

| 機能                         | 理由                           |
| ---------------------------- | ------------------------------ |
| コード署名証明書の設定       | 別タスクで対応予定             |
| 公証（Notarization）の有効化 | 署名付きビルドに移行時に対応   |
| Windows/Linux ビルドの有効化 | 別タスクで対応（現在無効化中） |
| リリースワークフローの作成   | 別タスクで対応                 |
| electron-builder.ymlの変更   | 既存設定は正しいため変更不要   |

---

## 前提条件

| 項目                   | 内容                      |
| ---------------------- | ------------------------- |
| リポジトリ             | AIWorkflowOrchestrator    |
| ブランチ               | `task/fix-macos-build-ci` |
| パッケージマネージャー | pnpm                      |
| Node.js                | v22                       |
| electron-builder       | v26.0.0                   |
| Electron               | v39.2.5                   |

---

## 制約

| 制約                 | 説明                                                           |
| -------------------- | -------------------------------------------------------------- |
| 最小権限原則         | 必要最小限のentitlementsのみを定義（過剰な権限付与を避ける）   |
| Hardened Runtime維持 | macOS公証に必要なため、hardenedRuntime: trueの設定を変更しない |
| 署名なしビルド       | 現在は `CSC_IDENTITY_AUTO_DISCOVERY: false` で署名なしビルド   |
| CI 時間制限          | GitHub Actions の実行時間制限に従う                            |

---

## 依存関係

| 依存             | 説明                                             |
| ---------------- | ------------------------------------------------ |
| @repo/shared     | デスクトップアプリの依存パッケージ（ビルド順序） |
| electron-builder | パッケージング用ツール（entitlements参照）       |
| codesign         | macOSコードサイニングツール（entitlements使用）  |

---

## リスク

| リスク                   | 影響度 | 対策                                                |
| ------------------------ | ------ | --------------------------------------------------- |
| entitlements権限の過不足 | 中     | 最小限のJIT権限のみ定義、テストで動作確認           |
| plist構文エラー          | 低     | plutil -lintで構文検証                              |
| ローカルビルドへの影響   | 低     | CI/ローカル共に同じファイルを使用するため一貫性あり |

---

## 成功基準

| 基準                                               | 必須 |
| -------------------------------------------------- | ---- |
| `apps/desktop/build/entitlements.mac.plist` が存在 | ✅   |
| plistファイルが有効なXML/plist形式                 | ✅   |
| GitHub Actions の macOS ビルドが成功               | ✅   |
| ビルド成果物（.zip）が生成される                   | ✅   |
| エラーが発生しない                                 | ✅   |

---

## 完了確認

- [x] 修正対象ファイルを特定した（新規作成: entitlements.mac.plist）
- [x] 修正対象外（スコープ外）を明記した
- [x] 前提条件と制約を整理した
