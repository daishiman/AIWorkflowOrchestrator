# plist構造設計書

## 作成日

2026-01-13

## 概要

`apps/desktop/build/entitlements.mac.plist` ファイルのXML構造設計を定義する。

---

## plistファイル形式

### Apple Property List (plist) 概要

Apple Property List（plist）は、macOS/iOSアプリケーションの設定データを格納するためのXML形式のファイル。entitlementsファイルはこの形式を使用してアプリケーションに付与する権限を定義する。

### XML構造

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- 権限のkey-valueペアをここに記述 -->
</dict>
</plist>
```

### 構造要素

| 要素                                     | 説明                             |
| ---------------------------------------- | -------------------------------- |
| `<?xml version="1.0" encoding="UTF-8"?>` | XML宣言（UTF-8エンコーディング） |
| `<!DOCTYPE plist ...>`                   | Apple plist DTD参照              |
| `<plist version="1.0">`                  | plistルート要素（バージョン1.0） |
| `<dict>`                                 | 辞書（key-valueペアのコンテナ）  |
| `<key>`                                  | 権限キー                         |
| `<true/>`                                | ブール値（有効）                 |

---

## entitlements.mac.plist 設計

### 最終設計

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

### 権限定義

| キー                                                     | 値     | 説明                                           |
| -------------------------------------------------------- | ------ | ---------------------------------------------- |
| `com.apple.security.cs.allow-jit`                        | `true` | JITコンパイルを許可（V8/Electronに必須）       |
| `com.apple.security.cs.allow-unsigned-executable-memory` | `true` | 署名なしの実行可能メモリを許可（V8 JITに必須） |

---

## 設計根拠

### なぜこの2つの権限が必要か

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Application                      │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐ │
│  │  Chromium   │ ─► │ V8 Engine   │ ─► │ JIT Compilation  │ │
│  │  (Browser)  │    │(JavaScript) │    │ (Machine Code)   │ │
│  └─────────────┘    └─────────────┘    └──────────────────┘ │
│                                               │               │
│                                               ▼               │
│                          ┌───────────────────────────────┐   │
│                          │  Executable Memory Required   │   │
│                          │  - allow-jit                  │   │
│                          │  - allow-unsigned-executable  │   │
│                          │    -memory                    │   │
│                          └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

1. **V8エンジンのJITコンパイル**
   - Electronは内部でChromiumとV8エンジンを使用
   - V8はJavaScriptをJust-In-Time(JIT)でネイティブコードにコンパイル
   - JITはメモリ上でマシンコードを生成・実行する必要がある

2. **Hardened Runtimeの制限**
   - macOS Hardened Runtimeはデフォルトでメモリ上のコード実行を制限
   - 明示的なentitlementsなしではV8のJITが動作しない
   - `allow-jit` と `allow-unsigned-executable-memory` で制限を緩和

---

## 検証方法

### 構文検証

```bash
# plistファイルの構文検証
plutil -lint apps/desktop/build/entitlements.mac.plist

# 期待結果
# apps/desktop/build/entitlements.mac.plist: OK
```

### 内容確認

```bash
# plistファイルの内容をXML形式で表示
plutil -p apps/desktop/build/entitlements.mac.plist

# 期待結果
# {
#   "com.apple.security.cs.allow-jit" => 1
#   "com.apple.security.cs.allow-unsigned-executable-memory" => 1
# }
```

---

## 完了確認

- [x] Apple plistファイル形式を確認した
- [x] XML構造を設計した
- [x] 権限キーと値を定義した
- [x] 検証方法を記述した
