# デスクトップアプリ技術スタック（Electron/macOS）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorデスクトップアプリ（Electron）の技術スタックを定義します。

---

## Electron

### 基本情報

| 項目           | 値                           |
| -------------- | ---------------------------- |
| 推奨バージョン | `39.x`                       |
| 最小バージョン | `28.0.0`                     |
| Chromium       | 対応Electronバージョンに準拠 |
| Node.js        | 対応Electronバージョンに準拠 |

**選定理由:**

- Web技術でのデスクトップアプリ開発
- クロスプラットフォーム対応（macOS, Windows, Linux）
- Node.js APIへのアクセス
- 豊富なエコシステム

### プロセスアーキテクチャ

| プロセス | 役割                        | 実装場所                     |
| -------- | --------------------------- | ---------------------------- |
| Main     | システムAPI、ウィンドウ管理 | `apps/desktop/src/main/`     |
| Renderer | UI表示、React               | `apps/desktop/src/renderer/` |
| Preload  | IPC Bridge                  | `apps/desktop/src/preload/`  |

📖 詳細: [architecture-patterns.md](./architecture-patterns.md)

---

## ビルド・パッケージング

### electron-builder

| 項目           | 値                     |
| -------------- | ---------------------- |
| 推奨バージョン | `26.x`                 |
| 設定ファイル   | `electron-builder.yml` |

**出力形式:**

| プラットフォーム | 形式               |
| ---------------- | ------------------ |
| macOS            | DMG, PKG           |
| Windows          | NSIS, MSI          |
| Linux            | AppImage, deb, rpm |

### コード署名

| プラットフォーム | 方式                              |
| ---------------- | --------------------------------- |
| macOS            | Apple Developer ID + Notarization |
| Windows          | Authenticode証明書                |

📖 詳細: [deployment-electron.md](./deployment-electron.md)

---

## Main Process技術

### better-sqlite3

| 項目           | 値                   |
| -------------- | -------------------- |
| 推奨バージョン | `12.x`               |
| 用途           | ローカルデータベース |

**選定理由:**

- 同期API（Main Processに適合）
- パフォーマンス
- Electronとの互換性

**ABI 互換性（重要）:**

- `pnpm install` 直後は Node.js ABI（例: 127 = Node.js 22.x）でビルドされた prebuilt バイナリが入る
- Electron 39.x は内部 ABI が異なる（例: 140）ため、そのままでは `ERR_DLOPEN_FAILED` が発生する
- `apps/desktop/package.json` の `postinstall: "pnpm rebuild:native"` により `pnpm install` 後に自動で Electron ABI 向けに再コンパイルされる
- 詳細: [deployment-electron.md](./deployment-electron.md) の「Native Addon 再構築」セクション

### electron-store

| 項目           | 値         |
| -------------- | ---------- |
| 推奨バージョン | `11.x`     |
| 用途           | 設定永続化 |

**選定理由:**

- JSON形式の設定管理
- 暗号化オプション
- 型安全なアクセス

### safeStorage API

| 用途         | 説明               |
| ------------ | ------------------ |
| トークン保存 | OSキーチェーン活用 |
| APIキー保存  | 暗号化保存         |

📖 詳細: [security-principles.md](./security-principles.md)

---

## Renderer Process技術

### Vite

| 項目           | 値                           |
| -------------- | ---------------------------- |
| 推奨バージョン | `6.x`                        |
| 用途           | Renderer開発サーバー・ビルド |

**選定理由:**

- 高速なHMR
- ESModulesネイティブ
- Rollupベースの最適化ビルド

### React + TypeScript

| 項目       | 値     |
| ---------- | ------ |
| React      | `19.x` |
| TypeScript | `5.x`  |

📖 詳細: [technology-frontend.md](./technology-frontend.md)

---

## IPC通信

### contextBridge

| 設定             | 値    | 理由         |
| ---------------- | ----- | ------------ |
| contextIsolation | true  | Preload分離  |
| nodeIntegration  | false | セキュリティ |
| sandbox          | true  | プロセス分離 |

### チャンネル設計

| パターン      | 用途                        |
| ------------- | --------------------------- |
| invoke/handle | 同期的リクエスト/レスポンス |
| send/on       | 非同期イベント通知          |

📖 詳細: [security-electron-ipc.md](./security-electron-ipc.md), [arch-ipc-persistence.md](./arch-ipc-persistence.md)

---

## macOS固有

### Apple Human Interface Guidelines準拠

| 要素                     | 実装                     |
| ------------------------ | ------------------------ |
| トラフィックライト       | カスタムタイトルバー対応 |
| メニューバー             | Electronメニュー API     |
| キーボードショートカット | Cmd キー対応             |
| Touch Bar                | 将来対応                 |

### システム統合

| 機能               | API                            |
| ------------------ | ------------------------------ |
| 通知               | Notification API               |
| Dock               | app.dock                       |
| ファイル関連付け   | CFBundleDocumentTypes          |
| カスタムプロトコル | app.setAsDefaultProtocolClient |

📖 詳細: [ui-ux-design-principles.md](./ui-ux-design-principles.md)

---

## セキュリティ

### Electron Security Checklist

| 項目                        | 設定  |
| --------------------------- | ----- |
| nodeIntegration             | false |
| contextIsolation            | true  |
| sandbox                     | true  |
| webSecurity                 | true  |
| allowRunningInsecureContent | false |

### 追加対策

| 対策                      | 実装                        |
| ------------------------- | --------------------------- |
| CSP                       | Content Security Policy設定 |
| IPC Whitelist             | チャンネルホワイトリスト    |
| Sender Validation         | IPC送信元検証               |
| Path Traversal Prevention | パス検証                    |

📖 詳細: [security-electron-ipc.md](./security-electron-ipc.md)

---

## 自動更新

### electron-updater

| 項目       | 値                 |
| ---------- | ------------------ |
| パッケージ | `electron-updater` |
| 配信先     | GitHub Releases    |

**更新フロー:**

1. アプリ起動時に更新チェック
2. バックグラウンドでダウンロード
3. ユーザーに通知
4. 再起動で適用

📖 詳細: [deployment-electron.md](./deployment-electron.md)

---

## 開発ツール

### DevTools

| ツール            | 用途               |
| ----------------- | ------------------ |
| Chrome DevTools   | Renderer デバッグ  |
| React DevTools    | コンポーネント検査 |
| Electron DevTools | Main Process       |

### デバッグ

| 方法        | 対象             |
| ----------- | ---------------- |
| --inspect   | Main Process     |
| DevTools    | Renderer Process |
| console.log | 両プロセス       |

---

## ディレクトリ構造

| ディレクトリ/ファイル                 | 役割                                       |
| ------------------------------------- | ------------------------------------------ |
| apps/desktop/src/main/                | Main Process                               |
| apps/desktop/src/main/services/       | ビジネスロジック                           |
| apps/desktop/src/main/ipc/            | IPCハンドラ                                |
| apps/desktop/src/main/menu.ts         | アプリケーションメニュー（ズーム制御含む） |
| apps/desktop/src/main/infrastructure/ | インフラ層                                 |
| apps/desktop/src/renderer/            | Renderer Process                           |
| apps/desktop/src/renderer/components/ | UIコンポーネント                           |
| apps/desktop/src/renderer/store/      | Zustand Store                              |
| apps/desktop/src/renderer/hooks/      | カスタムHooks                              |
| apps/desktop/src/renderer/features/   | 機能モジュール                             |
| apps/desktop/src/preload/             | Preload Script                             |
| apps/desktop/electron-builder.yml     | electron-builder設定                       |
| apps/desktop/vite.config.ts           | Vite設定                                   |

---

## 関連ドキュメント

| ドキュメント                                             | 内容               |
| -------------------------------------------------------- | ------------------ |
| [technology-core.md](./technology-core.md)               | コア技術スタック   |
| [technology-frontend.md](./technology-frontend.md)       | フロントエンド技術 |
| [arch-electron-services.md](./arch-electron-services.md) | Electronサービス   |
| [security-electron-ipc.md](./security-electron-ipc.md)   | IPCセキュリティ    |
| [deployment-electron.md](./deployment-electron.md)       | デプロイ           |

---

## 関連未タスク

| タスクID                                        | 内容                                                         | 優先度 | 指示書                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001 | Main Process index.ts トップレベル副作用モジュール分離ガード | 中     | `docs/30-workflows/completed-tasks/TASK-FIX-ELECTRON-APP-MENU-ZOOM-001/unassigned-task/task-imp-main-process-module-extraction-guard-001.md` |

---

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                                 |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3.0   | 2026-03-31 | Electron 39.x / electron-builder 26.x / better-sqlite3 12.x / electron-store 11.x にバージョン更新。better-sqlite3 ABI 互換性セクション追加（TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001） |
| 1.2.0   | 2026-03-16 | 関連未タスクセクション追加（UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001）                                                                                                           |
| 1.1.0   | 2026-01-26 | 仕様ガイドライン準拠: ディレクトリ構造を表形式に変換                                                                                                                                    |
| 1.0.0   | 2026-01-26 | 初版作成                                                                                                                                                                                |
