# クロスプラットフォーム環境構築要件書

## 1. プロジェクト概要

### 1.1 目的

Mac環境での開発を主体としつつ、将来的なWindows対応を見据えたクロスプラットフォーム環境要件を定義する。プラットフォーム固有の差異を最小限に抑え、コードの再利用性を最大化する。

### 1.2 対象プラットフォーム

- **プライマリ**: macOS 10.15 (Catalina) 以降
- **セカンダリ**: Windows 10 以降（将来対応）
- **対象外**: Linux（当面は考慮しない）

### 1.3 設計方針

- **プラットフォーム分離**: プラットフォーム固有のコードは専用ディレクトリに分離
- **共通コード最大化**: 最大95%のコードを共通化、プラットフォーム固有は5%以内
- **条件分岐最小化**: 実行時の条件分岐ではなく、ビルド時の条件分岐を優先
- **設定の外部化**: プラットフォーム固有の設定はelectron-builder設定で管理

---

## 2. プラットフォーム共通要件

### 2.1 共通ツール

| ツール           | バージョン | Mac | Windows | 用途                       |
| ---------------- | ---------- | --- | ------- | -------------------------- |
| Node.js          | 22.x LTS   | ✅  | ✅      | ランタイム                 |
| pnpm             | 10.x       | ✅  | ✅      | パッケージマネージャー     |
| Electron         | 39.x       | ✅  | ✅      | デスクトップフレームワーク |
| electron-vite    | 2.x        | ✅  | ✅      | ビルドツール               |
| electron-builder | 26.x       | ✅  | ✅      | パッケージング             |
| TypeScript       | 5.x        | ✅  | ✅      | 言語                       |
| React            | 18.x       | ✅  | ✅      | UI                         |
| Drizzle ORM      | 0.39.x     | ✅  | ✅      | DB ORM                     |
| better-sqlite3   | 最新       | ✅  | ✅      | SQLite                     |
| Vitest           | 2.x        | ✅  | ✅      | テスト                     |

### 2.2 共通ライブラリ

| ライブラリ   | バージョン | Mac | Windows | 用途             |
| ------------ | ---------- | --- | ------- | ---------------- |
| Tailwind CSS | 3.x        | ✅  | ✅      | スタイリング     |
| shadcn/ui    | 最新       | ✅  | ✅      | UIコンポーネント |
| Radix UI     | 最新       | ✅  | ✅      | UIプリミティブ   |
| Zustand      | 最新       | ✅  | ✅      | 状態管理         |
| Zod          | 3.x        | ✅  | ✅      | バリデーション   |
| Chart.js     | 4.x        | ✅  | ✅      | グラフ           |
| jsPDF        | 最新       | ✅  | ✅      | PDF生成          |
| csv-writer   | 最新       | ✅  | ✅      | CSV出力          |

---

## 3. Mac固有要件

### 3.1 Mac固有ツール

| ツール                       | バージョン | インストール方法                                                                                  | 用途                           |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Homebrew**                 | 最新       | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` | パッケージマネージャー         |
| **Xcode Command Line Tools** | 最新       | `xcode-select --install`                                                                          | ネイティブモジュールビルド     |
| **Rosetta 2**                | -          | `softwareupdate --install-rosetta`                                                                | M1/M2でのx64互換（オプション） |

### 3.2 Macビルド設定

**electron-builder設定**:

- **ターゲット**: DMG（ディスクイメージ）
- **アーキテクチャ**: universal（Intel + Apple Silicon）
- **hardenedRuntime**: true（セキュリティ強化）
- **gatekeeperAssess**: true（Gatekeeper検証）

**DMG設定**:

- 背景画像のカスタマイズ
- アイコンサイズ: 100px
- ウィンドウサイズ: 500x500
- Applicationsフォルダへのショートカット

### 3.3 Mac固有の考慮事項

- **ファイルパス**: POSIXスタイル（`/Users/...`）
- **パス区切り文字**: スラッシュ（`/`）
- **改行コード**: LF（`\n`）
- **実行権限**: `chmod +x` が必要
- **App Sandboxing**: 将来的にサンドボックス対応を検討

---

## 4. Windows固有要件（将来対応）

### 4.1 Windows固有ツール

| ツール                        | バージョン | インストール方法     | 用途                       |
| ----------------------------- | ---------- | -------------------- | -------------------------- |
| **Chocolatey**                | 最新       | PowerShellスクリプト | パッケージマネージャー     |
| **Visual Studio Build Tools** | 2022       | 公式インストーラー   | ネイティブモジュールビルド |
| **Python**                    | 3.x        | Chocolatey or 公式   | node-gypに必要             |
| **Windows SDK**               | 最新       | VS Build Toolsに含む | Electronビルド             |

### 4.2 Windowsビルド設定

**electron-builder設定**:

- **ターゲット**: NSIS（Nullsoft Scriptable Install System）
- **アーキテクチャ**: x64（64bit）、ia32（32bit）オプション
- **deleteAppDataOnUninstall**: true（アンインストール時にデータ削除）
- **oneClick**: false（インストールウィザード表示）

**NSIS設定**:

- インストールディレクトリのカスタマイズ
- スタートメニューショートカット
- デスクトップショートカット（オプション）
- アンインストーラー

### 4.3 Windows固有の考慮事項

- **ファイルパス**: Windowsスタイル（`C:\Users\...`）
- **パス区切り文字**: バックスラッシュ（`\`）またはスラッシュ（`/`）
- **改行コード**: CRLF（`\r\n`）
- **実行権限**: 不要（.exeファイルは実行可能）
- **UAC**: インストーラー実行時に管理者権限が必要

---

## 5. プラットフォーム差異の吸収戦略

### 5.1 パス処理

**戦略**: Node.js `path`モジュールを使用

- `path.join()`: プラットフォーム固有の区切り文字を自動選択
- `path.resolve()`: 絶対パスへの変換
- `path.sep`: 区切り文字を動的に取得

**禁止事項**:

- ハードコードされたパス区切り文字（`/` や `\`）
- プラットフォーム固有のパス（`C:\` や `/Users/`）

### 5.2 ネイティブモジュール

**戦略**: electron-rebuildで再ビルド

- Mac環境でビルド後、Windowsターゲット用に再ビルド
- CI/CD環境で各プラットフォーム別にビルド
- better-sqlite3は特に注意が必要（ネイティブバインディング）

**設定**:

- `electron-builder`の`beforeBuild`フックでelectron-rebuildを実行
- アーキテクチャごとに個別ビルド（x64、arm64、ia32）

### 5.3 ファイルシステム

**戦略**: Node.js `fs` モジュールを使用

- `fs.promises` APIで非同期処理
- パスはすべて`path`モジュール経由で生成
- ファイル名は英数字のみ（特殊文字を避ける）

**注意事項**:

- Mac: ファイル名は大文字小文字を区別
- Windows: ファイル名は大文字小文字を区別しない

### 5.4 プロセス管理

**戦略**: プラットフォーム固有のプロセス管理は使用しない

- PM2はローカルエージェント用（Electronアプリ自体には不使用）
- Electronアプリは単一プロセス（Main + Renderer）

---

## 6. electron-builder設定要件

### 6.1 共通設定

- **appId**: com.example.app（ユニークなアプリケーションID）
- **productName**: アプリ名（日本語可）
- **directories**: 出力先、リソース配置
- **files**: バンドル対象ファイル
- **compression**: normal（テスト時はstore）
- **asar**: true（ソースコード保護）

### 6.2 Mac設定

- **target**: dmg
- **arch**: universal（Intel + Apple Silicon）
- **category**: public.app-category.productivity
- **hardenedRuntime**: true
- **entitlements**: com.apple.security.cs.allow-unsigned-executable-memory
- **gatekeeperAssess**: true

### 6.3 Windows設定（将来）

- **target**: nsis
- **arch**: x64（必須）、ia32（オプション）
- **icon**: app.ico（256x256）
- **requestedExecutionLevel**: asInvoker
- **deleteAppDataOnUninstall**: true

---

## 7. 開発ワークフロー

### 7.1 開発サーバー起動

**Mac**:

```bash
pnpm dev
```

**Windows（将来）**:

```bash
pnpm dev
```

**共通**: electron-viteが自動的にプラットフォームを検出

### 7.2 ビルド

**Mac環境でMacアプリをビルド**:

```bash
pnpm build:mac
```

**Mac環境でWindowsアプリをビルド（将来）**:

```bash
pnpm build:win
```

注意: Parallels Desktop等の仮想環境が必要

**Windows環境でWindowsアプリをビルド（将来）**:

```bash
pnpm build:win
```

### 7.3 テスト

**共通**:

```bash
pnpm test
```

プラットフォーム固有のテストは不要（ロジックは共通のため）

---

## 8. 受け入れ基準

### AC-001: Mac環境でのビルド成功

- **Given**: Mac環境が整っている
- **When**: `pnpm build:mac` を実行する
- **Then**: `dist/mac/AppName.app` が生成される
- **And**: アプリケーションが起動する

### AC-002: Windows設定の準備完了

- **Given**: electron-builder設定ファイルが存在する
- **When**: Windows設定セクションを確認する
- **Then**: NSIS設定が正しく記述されている
- **And**: アイコンファイル（.ico）が配置されている

### AC-003: プラットフォーム分離の実現

- **Given**: ソースコードが存在する
- **When**: プラットフォーム固有のコードを検索する
- **Then**: プラットフォーム固有コードが5%以下である
- **And**: 共通コードが95%以上である

### AC-004: パス処理の統一

- **Given**: ファイルパスを扱うコードが存在する
- **When**: コードレビューを実施する
- **Then**: すべてのパスが`path`モジュール経由で処理されている
- **And**: ハードコードされたパス区切り文字が存在しない

---

## 9. リスク管理

### 9.1 識別されたリスク

| リスク                                 | 影響度 | 発生確率 | 軽減策                                           |
| -------------------------------------- | ------ | -------- | ------------------------------------------------ |
| better-sqlite3のElectron互換性問題     | 高     | 中       | electron-rebuildの確実な実行、代替ライブラリ検討 |
| Macビルド環境でWindowsビルドができない | 中     | 高       | Parallels Desktop使用またはCI/CD分離             |
| プラットフォーム固有のバグ             | 中     | 中       | クロスプラットフォームテストの実施               |
| コード署名証明書の取得困難             | 低     | 低       | 開発時は署名なしで進行                           |

---

## 10. 依存関係

### 10.1 前提条件

- T-00-1（環境構築要件の明確化）が完了している
- master_system_design.mdが最新である

### 10.2 後続タスク

- T-01-1（開発環境セットアップフローの設計）
- electron-builder設定ファイルの作成
- プラットフォーム別ビルドスクリプトの作成

---

## 11. プラットフォーム別インストール手順（概要）

### 11.1 Mac環境

**前提条件**:

- macOS 10.15以降
- 10GB以上の空きディスク容量
- インターネット接続

**インストール手順**:

1. Homebrewのインストール
2. Node.jsのインストール（Homebrew経由）
3. pnpmの有効化（corepack経由）
4. Xcode Command Line Toolsのインストール
5. プロジェクト依存関係のインストール（pnpm install）
6. electron-rebuildの実行（better-sqlite3用）
7. 開発サーバー起動確認

### 11.2 Windows環境（将来）

**前提条件**:

- Windows 10以降
- 10GB以上の空きディスク容量
- インターネット接続
- 管理者権限

**インストール手順**:

1. Chocolateyのインストール
2. Node.jsのインストール（Chocolatey経由）
3. pnpmの有効化（corepack経由）
4. Visual Studio Build Toolsのインストール
5. Python 3のインストール
6. プロジェクト依存関係のインストール（pnpm install）
7. electron-rebuildの実行
8. 開発サーバー起動確認

---

## 12. 設定ファイル要件

### 12.1 electron-builder設定（electron-builder.yml）

**共通設定**:

- appId: アプリケーションID
- productName: アプリ名
- directories: 出力先ディレクトリ
- files: バンドル対象ファイル
- asar: true（ソースコード保護）

**Mac設定**:

- target: dmg
- arch: universal
- category: public.app-category.productivity
- icon: build/icon.icns（1024x1024）
- hardenedRuntime: true

**Windows設定**:

- target: nsis
- arch: x64
- icon: build/icon.ico（256x256）
- requestedExecutionLevel: asInvoker

### 12.2 package.json設定

**scripts設定**:

- `dev`: electron-viteで開発サーバー起動
- `build:mac`: Mac用ビルド
- `build:win`: Windows用ビルド（将来）
- `test`: Vitestでテスト実行
- `lint`: ESLintでリント
- `format`: Prettierでフォーマット

**main設定**:

- `main`: out/main/index.js（ビルド後のMainプロセス）

---

## 13. ディレクトリ構造（クロスプラットフォーム対応）

```
apps/desktop/
├── src/
│   ├── main/                    # Mainプロセス（共通）
│   │   ├── index.ts
│   │   ├── window.ts
│   │   └── ipc/
│   ├── preload/                 # Preloadスクリプト（共通）
│   │   └── index.ts
│   ├── renderer/                # Rendererプロセス（共通）
│   │   ├── App.tsx
│   │   └── components/
│   ├── shared/                  # プラットフォーム共通コード
│   │   ├── types/
│   │   └── utils/
│   └── platform/                # プラットフォーム固有コード（5%以下）
│       ├── mac/
│       │   └── notifications.ts  # Mac専用通知
│       └── windows/
│           └── notifications.ts  # Windows専用通知
├── database/                    # SQLiteスキーマ（共通）
├── templates/                   # 成果物テンプレート（共通）
├── build/                       # ビルドリソース
│   ├── icon.icns               # Mac用アイコン
│   ├── icon.ico                # Windows用アイコン
│   └── dmg-background.png      # DMG背景
├── out/                        # ビルド出力（electron-vite）
└── dist/                       # パッケージング出力（electron-builder）
    ├── mac/
    └── win/
```

---

## 14. 検証チェックリスト

### 14.1 Mac環境検証

- [ ] Homebrewがインストールされている
- [ ] Node.js 22.x LTSがインストールされている
- [ ] pnpm 10.xが動作する
- [ ] Xcode Command Line Toolsがインストールされている
- [ ] プロジェクト依存関係がインストールされている
- [ ] electron-rebuildが成功する
- [ ] 開発サーバーが起動する
- [ ] Macアプリがビルドできる
- [ ] ビルドしたアプリが起動する

### 14.2 Windows対応準備検証

- [ ] electron-builder設定にWindows設定が含まれている
- [ ] .icoアイコンファイルが配置されている
- [ ] パス処理がpath モジュール経由である
- [ ] 改行コードがLF統一されている（gitattributes設定）
- [ ] プラットフォーム固有コードが分離されている

### 14.3 クロスプラットフォーム検証

- [ ] 共通コードが95%以上である
- [ ] プラットフォーム条件分岐がビルド時である
- [ ] ファイルパスがハードコードされていない
- [ ] ネイティブモジュールが両プラットフォーム対応である

---

## 15. 参考資料

### 15.1 公式ドキュメント

- [Electron公式 - macOSビルド](https://www.electronjs.org/docs/latest/development/build-instructions-macos)
- [Electron公式 - Windowsビルド](https://www.electronjs.org/docs/latest/development/build-instructions-windows)
- [electron-builder - Multi Platform Build](https://www.electron.build/multi-platform-build)
- [electron-vite - Getting Started](https://electron-vite.org/guide/)

### 15.2 トラブルシューティング

- [better-sqlite3 Electron Integration](https://github.com/WiseLibs/better-sqlite3)
- [electron-rebuild Documentation](https://github.com/electron/rebuild)
- [Stack Overflow - Electron + better-sqlite3](https://stackoverflow.com/questions/73904974/how-to-use-electron-with-better-sqlite3)

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 作成者              |
| ---------- | ---------- | -------- | ------------------- |
| 1.0.0      | 2025-12-03 | 初版作成 | .claude/agents/electron-architect.md |
