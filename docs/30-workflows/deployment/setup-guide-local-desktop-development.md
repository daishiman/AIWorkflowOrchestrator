# ローカルデスクトップアプリ開発ガイド

## 概要

このドキュメントでは、AIWorkflowOrchestratorのElectronデスクトップアプリをローカル環境で開発・実行するために必要な設定を説明します。

**対象**: 自分のMacでのみ開発・テスト・実行する場合

---

## 現在の設定状況

### ✅ 設定済み（追加作業不要）

| 項目                    | 状態 | 説明                           |
| ----------------------- | :--: | ------------------------------ |
| Electron本体            |  ✅  | v39.2.4 インストール済み       |
| electron-vite           |  ✅  | ビルドツール設定済み           |
| electron-builder        |  ✅  | パッケージング設定済み         |
| TypeScript              |  ✅  | 型定義設定済み                 |
| React                   |  ✅  | UIフレームワーク設定済み       |
| Tailwind CSS            |  ✅  | スタイリング設定済み           |
| SQLite (better-sqlite3) |  ✅  | ローカルDB設定済み             |
| Vitest                  |  ✅  | テストフレームワーク設定済み   |
| electron-updater        |  ✅  | 自動更新機能（配布時のみ使用） |
| electron-builder.yml    |  ✅  | ビルド設定済み                 |

### ❌ ローカル開発では不要

| 項目                    |  状態   | 理由                            |
| ----------------------- | :-----: | ------------------------------- |
| Apple Developer Program | ❌ 不要 | 配布時のみ必要（$99/年）        |
| コード署名証明書        | ❌ 不要 | 自分のMacでは署名なしで実行可能 |
| 公証 (Notarization)     | ❌ 不要 | 配布時のみ必要                  |
| GitHub Secrets設定      | ❌ 不要 | CI/CDリリース時のみ必要         |

---

## ローカル開発の手順

### Step 1: 依存関係のインストール

```bash
# プロジェクトルートで実行
pnpm install
```

### Step 2: 共有パッケージのビルド

```bash
# sharedパッケージを先にビルド（desktopが依存）
pnpm --filter @repo/shared build
```

### Step 3: 開発モードで実行

```bash
# 開発サーバー起動（ホットリロード有効）
pnpm --filter @repo/desktop dev
```

これでアプリが起動します。コードを変更すると自動的にリロードされます。

---

## ローカルビルド（パッケージング）

自分用にアプリをパッケージ化する場合：

### macOS向けビルド

```bash
# 署名なしでビルド
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --filter @repo/desktop package:mac
```

**出力先**: `apps/desktop/dist/`

生成されるファイル：

- `AI Workflow Orchestrator-1.0.0-arm64.dmg` （Apple Silicon）
- `AI Workflow Orchestrator-1.0.0-x64.dmg` （Intel）
- `AI Workflow Orchestrator-1.0.0-arm64.zip`
- `AI Workflow Orchestrator-1.0.0-x64.zip`

### Windows向けビルド（クロスコンパイル）

```bash
pnpm --filter @repo/desktop package:win
```

### すべてのプラットフォーム

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --filter @repo/desktop package
```

---

## よく使うコマンド一覧

| コマンド                                                                    | 説明                      |
| --------------------------------------------------------------------------- | ------------------------- |
| `pnpm --filter @repo/desktop dev`                                           | 開発モード起動            |
| `pnpm --filter @repo/desktop build`                                         | プロダクションビルド      |
| `pnpm --filter @repo/desktop test`                                          | テスト実行（watchモード） |
| `pnpm --filter @repo/desktop test:run`                                      | テスト実行（1回）         |
| `pnpm --filter @repo/desktop typecheck`                                     | 型チェック                |
| `CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --filter @repo/desktop package:mac` | 署名なしパッケージング    |

---

## プロジェクト構造

```
apps/desktop/
├── src/
│   ├── main/           # メインプロセス（Node.js）
│   │   ├── index.ts    # エントリーポイント
│   │   ├── updater.ts  # 自動更新（配布時のみ動作）
│   │   └── ...
│   ├── preload/        # プリロードスクリプト
│   │   └── index.ts
│   └── renderer/       # レンダラープロセス（React）
│       ├── src/
│       │   ├── App.tsx
│       │   └── ...
│       └── index.html
├── build/              # ビルドリソース
│   └── entitlements.mac.plist
├── scripts/            # ビルドスクリプト
│   └── notarize.mjs    # 公証スクリプト（配布時のみ使用）
├── electron-builder.yml  # パッケージング設定
├── electron.vite.config.ts
└── package.json
```

---

## トラブルシューティング

### 「pnpm --filter @repo/desktop dev」でエラーが出る

1. 共有パッケージをビルドしているか確認：

   ```bash
   pnpm --filter @repo/shared build
   ```

2. node_modulesを再インストール：
   ```bash
   rm -rf node_modules apps/desktop/node_modules
   pnpm install
   ```

### 「better-sqlite3」関連のエラー

ネイティブモジュールの再ビルドが必要：

```bash
cd apps/desktop
pnpm rebuild better-sqlite3
```

### パッケージング時に署名エラー

ローカルビルドでは署名をスキップ：

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --filter @repo/desktop package:mac
```

### Electronのバージョン不一致

```bash
# electron-builderのキャッシュをクリア
rm -rf ~/Library/Caches/electron-builder
pnpm --filter @repo/desktop package:mac
```

---

## 次のステップ

ローカル開発が完了したら、以下のドキュメントを参照：

| 目的                           | ドキュメント                                                        |
| ------------------------------ | ------------------------------------------------------------------- |
| 他人に配布したい               | [macOSコード署名ガイド](./setup-guide-macos-codesigning.md)         |
| バックエンドをデプロイしたい   | [Railwayデプロイガイド](./task-step1-railway-backend-deployment.md) |
| リリースワークフローを知りたい | [Electronデプロイ仕様](./task-step2-electron-desktop-deployment.md) |

---

## 設定ファイル一覧

### electron-builder.yml（抜粋）

```yaml
appId: com.aiworkflow.orchestrator
productName: AI Workflow Orchestrator

mac:
  category: public.app-category.productivity
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist

# 公証は CI環境でのみ自動実行
afterSign: scripts/notarize.mjs
```

### package.json スクリプト

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "package": "electron-builder --config electron-builder.yml",
    "package:mac": "electron-builder --mac --config electron-builder.yml",
    "package:win": "electron-builder --win --config electron-builder.yml"
  }
}
```

---

## まとめ

**ローカル開発に必要な作業:**

1. ✅ `pnpm install` - 依存関係インストール
2. ✅ `pnpm --filter @repo/shared build` - 共有パッケージビルド
3. ✅ `pnpm --filter @repo/desktop dev` - 開発開始

**これだけでOKです。** コード署名やApple Developer Programへの登録は不要です。
