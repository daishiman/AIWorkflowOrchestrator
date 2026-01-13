# 実装サマリー

## 作成日

2026-01-13

## 概要

macOS CIビルドエラー（`cannot read entitlement data`）を修正するための実装内容をまとめる。

---

## 変更ファイル一覧

| ファイル                                    | 変更種別 | 変更内容                                     |
| ------------------------------------------- | -------- | -------------------------------------------- |
| `apps/desktop/build/entitlements.mac.plist` | 新規作成 | macOS Hardened Runtime用entitlementsファイル |

---

## 変更内容詳細

### 新規作成: entitlements.mac.plist

**パス**: `apps/desktop/build/entitlements.mac.plist`

**内容**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- JIT compilation for V8/Electron -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <!-- Unsigned executable memory for V8/Electron -->
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
</dict>
</plist>
```

---

## 変更理由

### 問題の原因

`electron-builder.yml` で以下の設定が定義されていた:

```yaml
mac:
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
```

しかし、参照先の `build/entitlements.mac.plist` ファイルが存在しなかったため、codesign実行時に以下のエラーが発生:

```
build/entitlements.mac.plist: cannot read entitlement data
```

### 解決策

参照先のファイルを作成し、Electron/V8アプリケーションに必要な最小限のentitlements権限を定義した。

---

## 採用した権限

| 権限キー                                                 | 値     | 理由                                   |
| -------------------------------------------------------- | ------ | -------------------------------------- |
| `com.apple.security.cs.allow-jit`                        | `true` | V8 JITコンパイルに必須                 |
| `com.apple.security.cs.allow-unsigned-executable-memory` | `true` | V8 JITコード（未署名メモリ）実行に必須 |

### 最小権限原則

- 分析対象: 11権限
- 採用: 2権限（18%）
- 不採用: 9権限

---

## 影響範囲

### 影響あり

| 対象                 | 影響                                 |
| -------------------- | ------------------------------------ |
| macOS CI ビルド      | エラー解消、ビルド成功               |
| macOS ローカルビルド | 同様にエラー解消                     |
| アプリ署名           | ad-hoc署名にentitlementsが適用される |

### 影響なし

| 対象                 | 理由                             |
| -------------------- | -------------------------------- |
| Windows/Linuxビルド  | entitlementsはmacOS専用          |
| electron-builder.yml | 設定は変更していない             |
| .github/workflows/   | ワークフロー定義は変更していない |
| アプリ機能           | entitlementsは署名設定のみに影響 |

---

## 注意点・制約

### 1. ファイルパス

`electron-builder.yml` の設定と一致する必要がある:

```
electron-builder.yml からの相対パス: build/entitlements.mac.plist
```

### 2. 署名方式

現在の設定は ad-hoc 署名（`CSC_IDENTITY_AUTO_DISCOVERY=false`）:

- Apple Developer ID なしでビルド可能
- 公証（Notarization）は行われない
- Gatekeeper で初回起動時に警告が出る可能性あり

### 3. 将来的な考慮

Mac App Store 配布時は追加のentitlementsが必要になる可能性:

- `com.apple.security.app-sandbox`
- `com.apple.security.network.client`
- 等

---

## 検証結果

| 検証項目       | 結果   |
| -------------- | ------ |
| plist構文      | OK     |
| ローカルビルド | 成功   |
| エラー解消     | 確認済 |
| 成果物生成     | 確認済 |

---

## 完了確認

- [x] entitlements.mac.plist を作成した
- [x] plist構文が有効であることを確認した
- [x] ローカルビルドが成功することを確認した
- [x] `cannot read entitlement data` エラーが解消されたことを確認した
- [x] 変更理由と影響範囲を文書化した
- [x] 注意点・制約を記録した
