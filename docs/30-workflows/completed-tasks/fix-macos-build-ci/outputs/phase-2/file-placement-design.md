# ファイル配置設計書

## 作成日

2026-01-13

## 概要

`entitlements.mac.plist` ファイルの配置場所と、electron-builder.ymlとの整合性を設計する。

---

## ファイル配置設計

### ディレクトリ構造

```
apps/desktop/
├── build/
│   ├── icon.icns                    ← 既存（アプリアイコン）
│   ├── icon.ico                     ← 既存（Windowsアイコン）
│   ├── entitlements.mac.plist       ← 新規作成 ★
│   └── ...
├── electron-builder.yml             ← 既存（変更不要）
├── src/
│   └── ...
├── package.json
└── ...
```

### ファイルパス

| 項目                               | パス                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| 絶対パス                           | `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/apps/desktop/build/entitlements.mac.plist` |
| リポジトリルートからの相対パス     | `apps/desktop/build/entitlements.mac.plist`                                                   |
| electron-builder.ymlからの相対パス | `build/entitlements.mac.plist`                                                                |

---

## electron-builder.yml との整合性

### 現在の設定（変更不要）

```yaml
# apps/desktop/electron-builder.yml (抜粋)
mac:
  category: public.app-category.productivity
  artifactName: ${productName}-${version}-${arch}.${ext}
  hardenedRuntime: true # Hardened Runtime有効
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist # ← このファイルを作成
  entitlementsInherit: build/entitlements.mac.plist # 子プロセスも同じ権限
```

### パス解決の仕組み

```
electron-builder 実行時のパス解決フロー
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

electron-builder.yml の配置
   └─► apps/desktop/electron-builder.yml

entitlements 設定値
   └─► "build/entitlements.mac.plist"

パス解決（electron-builder.yml からの相対パス）
   └─► apps/desktop/ + build/entitlements.mac.plist
       = apps/desktop/build/entitlements.mac.plist
```

### 設定値の意味

| 設定キー              | 値                             | 説明                              |
| --------------------- | ------------------------------ | --------------------------------- |
| `hardenedRuntime`     | `true`                         | macOS Hardened Runtimeを有効化    |
| `entitlements`        | `build/entitlements.mac.plist` | メインアプリのentitlements        |
| `entitlementsInherit` | `build/entitlements.mac.plist` | 子プロセス/ヘルパーのentitlements |

### なぜ同じファイルを両方に指定するか

```
┌─────────────────────────────────────────────────────────────┐
│                  Electron Application Structure             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────┐                               │
│  │     Main Process        │ ◄── entitlements              │
│  │  (Electron Main)        │     (メインプロセス用権限)     │
│  └─────────────────────────┘                               │
│              │                                              │
│              │ fork/spawn                                   │
│              ▼                                              │
│  ┌─────────────────────────┐                               │
│  │   Renderer Processes    │ ◄── entitlementsInherit       │
│  │  (Chromium Sandboxed)   │     (子プロセス用権限)         │
│  └─────────────────────────┘                               │
│              │                                              │
│              │                                              │
│              ▼                                              │
│  ┌─────────────────────────┐                               │
│  │    Helper Processes     │ ◄── entitlementsInherit       │
│  │  (GPU, Network, etc.)   │     (ヘルパープロセス用権限)   │
│  └─────────────────────────┘                               │
│                                                             │
│  すべてのプロセスでJIT権限が必要                            │
│  → 同じentitlementsファイルを共有                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ビルドフローにおける位置づけ

### electron-builder 実行フロー

```
pnpm --filter @repo/desktop package:mac
              │
              ▼
┌────────────────────────────────────────┐
│         electron-builder 実行          │
├────────────────────────────────────────┤
│                                        │
│  1. アプリケーションバンドル作成       │
│     └─► out/ の内容を .app に格納      │
│                                        │
│  2. codesign 実行                      │
│     └─► --entitlements オプションに    │
│         build/entitlements.mac.plist   │
│         を渡す                         │
│                                        │
│  3. ZIP/DMG生成                        │
│     └─► 署名済みアプリをパッケージ     │
│                                        │
└────────────────────────────────────────┘
```

### codesign コマンドへの変換

electron-builder は内部で以下のような codesign コマンドを実行：

```bash
codesign --sign - \
         --force \
         --timestamp \
         --options runtime \
         --entitlements apps/desktop/build/entitlements.mac.plist \
         "path/to/AI Workflow Orchestrator.app"
```

---

## 整合性チェックリスト

| チェック項目                                             | 状態 |
| -------------------------------------------------------- | ---- |
| electron-builder.yml の `entitlements` パスと一致        | ✅   |
| electron-builder.yml の `entitlementsInherit` パスと一致 | ✅   |
| `hardenedRuntime: true` が設定されている                 | ✅   |
| `build/` ディレクトリが存在する                          | ✅   |
| ファイル名が正しい（`entitlements.mac.plist`）           | ✅   |

---

## 完了確認

- [x] ファイル配置場所を設計した
- [x] electron-builder.ymlとの整合性を確認した
- [x] パス解決の仕組みを文書化した
- [x] ビルドフローにおける位置づけを明記した
