# 要件定義書

## 作成日

2026-01-13

## 概要

GitHub Actions CI で macOS ビルドが成功するよう `entitlements.mac.plist` ファイルを作成し、配布可能な成果物を生成する。

---

## 機能要件

### FR-01: entitlements.mac.plistファイルの作成

| 項目   | 内容                                                           |
| ------ | -------------------------------------------------------------- |
| 要件ID | FR-01                                                          |
| 要件名 | entitlements.mac.plistファイルの作成                           |
| 優先度 | 必須                                                           |
| 説明   | `apps/desktop/build/entitlements.mac.plist` ファイルを作成する |

**受け入れ基準**:

- [ ] `apps/desktop/build/entitlements.mac.plist` ファイルが存在する
- [ ] ファイルが有効なXML/plist形式である
- [ ] `plutil -lint` で検証が通る

### FR-02: macOS Hardened Runtime必須権限の定義

| 項目   | 内容                                                |
| ------ | --------------------------------------------------- |
| 要件ID | FR-02                                               |
| 要件名 | macOS Hardened Runtime必須権限の定義                |
| 優先度 | 必須                                                |
| 説明   | entitlementsにElectron/V8動作に必要な権限を定義する |

**受け入れ基準**:

- [ ] `com.apple.security.cs.allow-jit` 権限が含まれている
- [ ] `com.apple.security.cs.allow-unsigned-executable-memory` 権限が含まれている
- [ ] 必要最小限の権限のみが定義されている（最小権限原則）

### FR-03: CIビルドの成功

| 項目   | 内容                                               |
| ------ | -------------------------------------------------- |
| 要件ID | FR-03                                              |
| 要件名 | CIビルドの成功                                     |
| 優先度 | 必須                                               |
| 説明   | GitHub Actions の macOS ビルドジョブが成功すること |

**受け入れ基準**:

- [ ] `build-macos-arm64` ジョブが正常終了する
- [ ] ビルドログにエラーが含まれない
- [ ] `entitlements.mac.plist: cannot read entitlement data` エラーが発生しない

---

## 非機能要件

### NFR-01: electron-builder.yml設定との互換性

| 項目   | 内容                                                   |
| ------ | ------------------------------------------------------ |
| 要件ID | NFR-01                                                 |
| 要件名 | electron-builder.yml設定との互換性                     |
| 優先度 | 必須                                                   |
| 説明   | 既存のelectron-builder.yml設定を変更せずに対応すること |

**受け入れ基準**:

- [ ] electron-builder.yml の変更が不要
- [ ] 既存の `hardenedRuntime: true` 設定が維持される
- [ ] 既存の `entitlements` パス設定と整合している

### NFR-02: ローカルビルド互換性

| 項目   | 内容                                 |
| ------ | ------------------------------------ |
| 要件ID | NFR-02                               |
| 要件名 | ローカルビルド互換性                 |
| 優先度 | 中                                   |
| 説明   | ローカル環境でもビルドが成功すること |

**受け入れ基準**:

- [ ] ローカルでの `pnpm --filter @repo/desktop package:mac` が成功する
- [ ] CI環境とローカル環境で同じ設定ファイルが使用される

### NFR-03: 最小権限原則

| 項目   | 内容                                   |
| ------ | -------------------------------------- |
| 要件ID | NFR-03                                 |
| 要件名 | 最小権限原則                           |
| 優先度 | 必須                                   |
| 説明   | 必要最小限のentitlementsのみを付与する |

**受け入れ基準**:

- [ ] Electron/V8動作に必須の権限のみが定義されている
- [ ] 不要な権限（ネットワーク、ファイルアクセス等）が含まれていない

---

## 制約条件

| 制約               | 説明                                                   |
| ------------------ | ------------------------------------------------------ |
| GitHub Actions環境 | macos-14 runner の制限に従う                           |
| Hardened Runtime   | macOS公証に必要なため維持が必須                        |
| 署名               | 署名なしビルド（`CSC_IDENTITY_AUTO_DISCOVERY: false`） |

---

## 前提条件

| 前提                 | 説明                               |
| -------------------- | ---------------------------------- |
| pnpmの使用           | パッケージマネージャーはpnpmを使用 |
| Node.js 22           | Node.js 22を使用                   |
| electron-builder v26 | electron-builder v26.0.0を使用     |
| electron 39          | Electron 39.2.5を使用              |

---

## 受け入れ基準まとめ

| ID    | 基準                                               | 必須 |
| ----- | -------------------------------------------------- | ---- |
| AC-01 | `apps/desktop/build/entitlements.mac.plist` が存在 | ✅   |
| AC-02 | plistファイルが有効なXML/plist形式                 | ✅   |
| AC-03 | GitHub Actions `build-electron.yml` が成功         | ✅   |
| AC-04 | ビルド成果物（.zip）が生成される                   | ✅   |
| AC-05 | 生成されたアプリがmacOSで起動できる                | ✅   |

---

## 完了確認

- [x] 機能要件を定義した（ファイル作成、権限定義、CIビルド成功）
- [x] 非機能要件を定義した（設定互換性、ローカルビルド、最小権限）
- [x] 受け入れ基準を定義した
