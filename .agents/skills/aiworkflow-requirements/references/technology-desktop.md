# デスクトップアプリ技術スタック（Electron/macOS）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorデスクトップアプリ（Electron）の技術スタックを定義します。

---

## Electron

### 基本情報

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `39.x` |
| 最小バージョン | `28.0.0` |
| Chromium | 対応Electronバージョンに準拠 |
| Node.js | 対応Electronバージョンに準拠 |

**選定理由:**

- Web技術でのデスクトップアプリ開発
- クロスプラットフォーム対応（macOS, Windows, Linux）
- Node.js APIへのアクセス
- 豊富なエコシステム

### プロセスアーキテクチャ

| プロセス | 役割 | 実装場所 |
|---------|-----|---------|
| Main | システムAPI、ウィンドウ管理 | `apps/desktop/src/main/` |
| Renderer | UI表示、React | `apps/desktop/src/renderer/` |
| Preload | IPC Bridge | `apps/desktop/src/preload/` |

📖 詳細: [architecture-patterns.md](./architecture-patterns.md)

---

## ビルド・パッケージング

### electron-builder

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `26.x` |
| 設定ファイル | `electron-builder.yml` |

**出力形式:**

| プラットフォーム | 形式 |
|----------------|-----|
| macOS | DMG, zip |
| Windows | NSIS, zip |
| Linux | AppImage, deb |

### コード署名

| プラットフォーム | 方式 |
|----------------|-----|
| macOS | Apple Developer ID + Notarization |
| Windows | Authenticode証明書 |

📖 詳細: [deployment-electron.md](./deployment-electron.md)

---

## Main Process技術

### better-sqlite3

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `12.x` |
| 用途 | ローカルデータベース |

**選定理由:**

- 同期API（Main Processに適合）
- パフォーマンス
- Electronとの互換性

### ネイティブモジュール再ビルド運用

| 項目 | 値 |
| --- | --- |
| Node ABI 再整合 | `pnpm rebuild better-sqlite3 && pnpm rebuild esbuild` |
| Electron ABI 再整合 | `pnpm --filter @repo/desktop run rebuild:electron` |
| postinstall hook | `bash scripts/setup-native-modules.sh || pnpm rebuild better-sqlite3 || true` |
| package afterPack | `apps/desktop/scripts/rebuild-native-for-electron.mjs` |

**標準ルール:**

- worktree / Rosetta / CI で native binary が drift しやすいため、Node ABI と Electron ABI を分けて検査する
- `afterPack` hook では electron-builder の `arch` 数値 enum を `x64` / `arm64` などの CLI 文字列へ正規化してから `@electron/rebuild` に渡す
- preload で consuming する shared package は CJS 実行条件と bundle 方針の両方を確認する

**Rosetta 2 環境での arch 検出確認（Phase 4 テスト計画必須）:**

| 確認観点 | コマンド / 方法 |
| --- | --- |
| 実行環境 arch 確認 | `node -p "process.platform + ' ' + process.arch"` |
| Electron バイナリ arch 確認 | `file $(which electron)` または `lipo -info <electron-binary>` |
| Rosetta 2 動作確認 | `arch -x86_64 node -p "process.arch"` → `x64` を返す場合は Rosetta 2 |
| native module arch 確認 | `file apps/desktop/node_modules/better-sqlite3/build/Release/better_sqlite3.node` |

- Apple Silicon Mac で x86_64 Electron を使う場合、`process.arch` は `x64` を返す（Rosetta 2）。native module のビルド arch と一致しないことがあるため、Electron バイナリの実 arch を直接読み取ること
- Phase 4 テスト計画には「Rosetta 2 / CI / worktree」3環境での arch 検出確認を必須項目として含める

### electron-store

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `10.x` |
| 用途 | 設定永続化 |

**選定理由:**

- JSON形式の設定管理
- 暗号化オプション
- 型安全なアクセス

### safeStorage API

| 用途 | 説明 |
|-----|-----|
| トークン保存 | OSキーチェーン活用 |
| APIキー保存 | 暗号化保存 |

📖 詳細: [security-principles.md](./security-principles.md)

---

## Renderer Process技術

### Vite

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `6.x` |
| 用途 | Renderer開発サーバー・ビルド |

**選定理由:**

- 高速なHMR
- ESModulesネイティブ
- Rollupベースの最適化ビルド

### React + TypeScript

| 項目 | 値 |
|-----|---|
| React | `19.x` |
| TypeScript | `5.x` |

📖 詳細: [technology-frontend.md](./technology-frontend.md)

---

## IPC通信

### contextBridge

| 設定 | 値 | 理由 |
|-----|---|-----|
| contextIsolation | true | Preload分離 |
| nodeIntegration | false | セキュリティ |
| sandbox | true | プロセス分離 |

### チャンネル設計

| パターン | 用途 |
|---------|-----|
| invoke/handle | 同期的リクエスト/レスポンス |
| send/on | 非同期イベント通知 |

📖 詳細: [security-electron-ipc.md](./security-electron-ipc.md), [arch-ipc-persistence.md](./arch-ipc-persistence.md)

---

## macOS固有

### Apple Human Interface Guidelines準拠

| 要素 | 実装 |
|-----|-----|
| トラフィックライト | カスタムタイトルバー対応 |
| メニューバー | Electronメニュー API |
| キーボードショートカット | Cmd キー対応 |
| Touch Bar | 将来対応 |

### システム統合

| 機能 | API |
|-----|-----|
| 通知 | Notification API |
| Dock | app.dock |
| ファイル関連付け | CFBundleDocumentTypes |
| カスタムプロトコル | app.setAsDefaultProtocolClient |

📖 詳細: [ui-ux-design-principles.md](./ui-ux-design-principles.md)

---

## セキュリティ

### Electron Security Checklist

| 項目 | 設定 |
|-----|-----|
| nodeIntegration | false |
| contextIsolation | true |
| sandbox | true |
| webSecurity | true |
| allowRunningInsecureContent | false |

### 追加対策

| 対策 | 実装 |
|-----|-----|
| CSP | Content Security Policy設定 |
| IPC Whitelist | チャンネルホワイトリスト |
| Sender Validation | IPC送信元検証 |
| Path Traversal Prevention | パス検証 |

📖 詳細: [security-electron-ipc.md](./security-electron-ipc.md)

---

## 自動更新

### electron-updater

| 項目 | 値 |
|-----|---|
| パッケージ | `electron-updater` |
| 配信先 | GitHub Releases |

**更新フロー:**

1. アプリ起動時に更新チェック
2. バックグラウンドでダウンロード
3. ユーザーに通知
4. 再起動で適用

📖 詳細: [deployment-electron.md](./deployment-electron.md)

---

## 開発ツール

### DevTools

| ツール | 用途 |
|-------|-----|
| Chrome DevTools | Renderer デバッグ |
| React DevTools | コンポーネント検査 |
| Electron DevTools | Main Process |

### デバッグ

| 方法 | 対象 |
|-----|-----|
| --inspect | Main Process |
| DevTools | Renderer Process |
| console.log | 両プロセス |

---

## ディレクトリ構造

| ディレクトリ/ファイル | 役割 |
|---------------------|-----|
| apps/desktop/src/main/ | Main Process |
| apps/desktop/src/main/services/ | ビジネスロジック |
| apps/desktop/src/main/ipc/ | IPCハンドラ |
| apps/desktop/src/main/menu.ts | アプリケーションメニュー（ズーム制御含む） |
| apps/desktop/src/main/infrastructure/ | インフラ層 |
| apps/desktop/src/renderer/ | Renderer Process |
| apps/desktop/src/renderer/components/ | UIコンポーネント |
| apps/desktop/src/renderer/store/ | Zustand Store |
| apps/desktop/src/renderer/hooks/ | カスタムHooks |
| apps/desktop/src/renderer/features/ | 機能モジュール |
| apps/desktop/src/preload/ | Preload Script |
| apps/desktop/electron-builder.yml | electron-builder設定 |
| apps/desktop/vite.config.ts | Vite設定 |

---

## 関連ドキュメント

| ドキュメント | 内容 |
|------------|-----|
| [technology-core.md](./technology-core.md) | コア技術スタック |
| [technology-frontend.md](./technology-frontend.md) | フロントエンド技術 |
| [arch-electron-services.md](./arch-electron-services.md) | Electronサービス |
| [security-electron-ipc.md](./security-electron-ipc.md) | IPCセキュリティ |
| [deployment-electron.md](./deployment-electron.md) | デプロイ |

---

## 関連未タスク

| タスクID | 内容 | 優先度 | 指示書 |
|---------|------|--------|--------|
| UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001 | Main Process index.ts トップレベル副作用モジュール分離ガード | 中 | `docs/30-workflows/completed-tasks/TASK-FIX-ELECTRON-APP-MENU-ZOOM-001/unassigned-task/task-imp-main-process-module-extraction-guard-001.md` |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-16 | 関連未タスクセクション追加（UT-IMP-MAIN-PROCESS-MODULE-EXTRACTION-GUARD-001） |
| 1.1.0 | 2026-01-26 | 仕様ガイドライン準拠: ディレクトリ構造を表形式に変換 |
| 1.0.0 | 2026-01-26 | 初版作成 |
