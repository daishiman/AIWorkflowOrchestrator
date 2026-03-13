# 開発ガイドライン / detail specification

> 親仕様書: [development-guidelines.md](development-guidelines.md)
> 役割: detail specification

## 命名規則

### ファイル命名

| 種類           | 規則                  | 例                                |
| -------------- | --------------------- | --------------------------------- |
| コンポーネント | PascalCase            | UserAvatar.tsx, SettingsPanel.tsx |
| フック         | camelCase + use接頭辞 | useAuth.ts, useChatHistory.ts     |
| ユーティリティ | camelCase             | formatDate.ts, validateInput.ts   |
| 型定義         | camelCase             | types.ts, schema.ts               |
| テスト         | 元ファイル名 + .test  | UserAvatar.test.tsx               |
| 仕様書         | kebab-case            | api-endpoints.md, ui-ux-design.md |

### 変数・関数命名

| 種類              | 規則                    | 例                             |
| ----------------- | ----------------------- | ------------------------------ |
| 変数              | camelCase               | userName, isLoading            |
| 定数              | UPPER_SNAKE_CASE        | MAX_RETRY_COUNT, API_BASE_URL  |
| Boolean           | is/has/can/should接頭辞 | isVisible, hasError, canSubmit |
| イベントハンドラ  | handle接頭辞            | handleClick, handleSubmit      |
| コールバックProps | on接頭辞                | onClick, onSubmit, onChange    |
| 非同期関数        | 動詞で開始              | fetchUsers, saveSettings       |

### コンポーネント命名

| パターン   | 規則            | 例                          |
| ---------- | --------------- | --------------------------- |
| 基本       | 名詞            | Button, Modal, Card         |
| バリアント | 修飾語 + 名詞   | PrimaryButton, ConfirmModal |
| 機能特化   | 機能 + 基本名   | UserAvatar, SearchInput     |
| レイアウト | Layout接尾辞    | MainLayout, SidebarLayout   |
| コンテナ   | Container接尾辞 | UserListContainer           |
| プロバイダ | Provider接尾辞  | AuthProvider, ThemeProvider |

### TypeScript型命名

| 種類             | 規則                        | 例                      |
| ---------------- | --------------------------- | ----------------------- |
| インターフェース | I接頭辞（任意）+ PascalCase | User, IRepository       |
| 型エイリアス     | PascalCase                  | UserId, ApiResponse     |
| Enum             | PascalCase（単数形）        | Status, ErrorCode       |
| ジェネリクス     | 単一大文字 or 説明的        | T, TData, TError        |
| Props            | コンポーネント名 + Props    | ButtonProps, ModalProps |
| State            | State接尾辞                 | AuthState, ChatState    |

---

## デバッグガイド

### Electron DevTools

| 対象     | 開き方             | 用途                         |
| -------- | ------------------ | ---------------------------- |
| Renderer | Cmd+Option+I / F12 | UIデバッグ、ネットワーク確認 |
| Main     | --inspect フラグ   | Main Processデバッグ         |

### Main Processデバッグ

| 手順             | 説明                                  |
| ---------------- | ------------------------------------- |
| 起動コマンド     | pnpm --filter @repo/desktop dev:debug |
| VSCode接続       | launch.jsonでattach設定（port: 9229） |
| ブレークポイント | Main Processコードに設置可能          |

### よくある問題と解決策

| 問題                  | 原因                 | 解決策                      |
| --------------------- | -------------------- | --------------------------- |
| IPC通信が動かない     | チャンネル名不一致   | Whitelist確認、型定義確認   |
| Preload API undefined | contextIsolation設定 | window.\*APIの公開確認      |
| ホットリロードしない  | Vite設定             | vite.config.tsのHMR設定確認 |
| SQLite接続エラー      | パス問題             | app.getPath('userData')確認 |
| メモリリーク          | イベントリスナー     | removeListener呼び出し確認  |

### Vitestテスト固有の問題と解決策（TASK-9A-A 2026-02-03追加）

| 問題                                 | 原因                                 | 解決策                                                                |
| ------------------------------------ | ------------------------------------ | --------------------------------------------------------------------- |
| `Cannot redefine property: readFile` | ESModuleエクスポートは読み取り専用   | vi.spyOn()を使わず、実際のエラー条件（存在しないパス等）を使用        |
| 期待と異なるエラークラス発生         | 入力条件により複数のエラーパスが存在 | `.rejects.toThrow()`で汎用的に検証、特定クラスに依存しない            |
| act()警告が大量発生                  | 非同期状態更新がテスト外で発生       | vi.useFakeTimers() + vi.advanceTimersByTime()、または waitFor()を使用 |
| jsdomでClipboard APIがundefined      | happy-domからの移行不完全            | setup.tsでvi.fn().mockResolvedValue()でモック設定                     |

**ESModuleモッキング回避パターン**:

| 対象モジュール   | 推奨アプローチ           | 理由                                   |
| ---------------- | ------------------------ | -------------------------------------- |
| node:fs/promises | 存在しないパスを使用     | ENOENTエラーを自然に発生               |
| node:path        | モック不要（純粋関数）   | 副作用なし                             |
| electron-store   | vi.doMock() + 動的import | コンストラクタ初期化をテストごとに制御 |

### ログ確認方法

| 環境           | ログ場所                                        |
| -------------- | ----------------------------------------------- |
| 開発           | ターミナル + DevTools Console                   |
| 本番 (macOS)   | ~/Library/Logs/{app-name}/                      |
| 本番 (Windows) | %USERPROFILE%\AppData\Roaming\{app-name}\logs\  |

---

## リリースプロセス

### バージョニング（Semantic Versioning）

| 変更種別   | バージョン    | 例                       |
| ---------- | ------------- | ------------------------ |
| 破壊的変更 | MAJOR (X.0.0) | APIの互換性なし変更      |
| 新機能追加 | MINOR (0.X.0) | 後方互換性のある機能追加 |
| バグ修正   | PATCH (0.0.X) | 後方互換性のあるバグ修正 |

### リリースチェックリスト

| フェーズ         | チェック項目                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| **Pre-release**  | 全テストがパス、TypeScript型チェックがパス、ESLintエラーなし、CHANGELOG更新、バージョン番号更新 |
| **Build**        | プロダクションビルド成功、Electronパッケージング成功、コード署名（macOS: notarization）         |
| **Post-release** | GitHubリリース作成、リリースノート公開、本番環境動作確認                                        |

### リリースコマンド

| ステップ       | コマンド                            | 説明                    |
| -------------- | ----------------------------------- | ----------------------- |
| バージョン更新 | pnpm version patch                  | patch/minor/majorを選択 |
| ビルド         | pnpm --filter @repo/desktop build   | プロダクションビルド    |
| パッケージ     | pnpm --filter @repo/desktop package | パッケージング          |
| リリース       | pnpm --filter @repo/desktop release | DMG/インストーラー作成  |

---

## バックアップ・リカバリ

### SQLiteバックアップ戦略

| 方式                | 頻度         | 用途             |
| ------------------- | ------------ | ---------------- |
| 自動バックアップ    | アプリ起動時 | 直近状態の保存   |
| 手動エクスポート    | ユーザー操作 | データ移行、保存 |
| WALチェックポイント | 定期         | データ整合性確保 |

### バックアップ実装

| 要素       | 説明                             |
| ---------- | -------------------------------- |
| 保存元     | app.getPath('userData')/data.db  |
| 保存先     | app.getPath('userData')/backups/ |
| ファイル名 | data-{timestamp}.db              |
| 実装       | fs.copyFileSync()で同期コピー    |

### リカバリ手順

| 状況                 | 対応                                 |
| -------------------- | ------------------------------------ |
| データ破損           | 最新バックアップから復元             |
| マイグレーション失敗 | ロールバック後、バックアップから復元 |
| 誤削除               | バックアップから該当データを抽出     |

### バックアップローテーション

| 保持期間 | バックアップ数 |
| -------- | -------------- |
| 日次     | 7個            |
| 週次     | 4個            |
| 月次     | 3個            |

---

## 環境構築ガイド

### 前提条件

| ツール                   | バージョン    |
| ------------------------ | ------------- |
| Node.js                  | 20.x LTS      |
| pnpm                     | 9.x           |
| Git                      | 2.x           |
| Xcode Command Line Tools | 最新（macOS） |

### セットアップ手順

| ステップ        | 操作                              |
| --------------- | --------------------------------- |
| 1. クローン     | git clone {repository-url}        |
| 2. 移動         | cd AIWorkflowOrchestrator         |
| 3. インストール | pnpm install                      |
| 4. 環境変数     | cp .env.example .env.local → 編集 |
| 5. 起動         | pnpm --filter @repo/desktop dev   |

### 推奨VS Code拡張機能

| 拡張機能                  | 用途           |
| ------------------------- | -------------- |
| ESLint                    | リント         |
| Prettier                  | フォーマット   |
| TypeScript Importer       | 自動インポート |
| Tailwind CSS IntelliSense | Tailwind補完   |
| Error Lens                | エラー可視化   |
| GitLens                   | Git操作        |

### トラブルシューティング

| 問題                       | 解決策                                      |
| -------------------------- | ------------------------------------------- |
| pnpm install失敗           | pnpm store prune && pnpm install            |
| ネイティブモジュールエラー | pnpm rebuild                                |
| Electronが起動しない       | pnpm --filter @repo/desktop rebuild         |
| 型エラーが大量に出る       | pnpm --filter @repo/shared build を先に実行 |

### `@repo/shared` サブパス追加時の同期手順（TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001）

`@repo/shared` のサブパスを追加・変更する場合は、以下4ファイルを同一コミットで更新する。

| 順番 | ファイル | 更新内容 |
| --- | --- | --- |
| 1 | `packages/shared/package.json` | `exports` と `typesVersions` にエントリ追加 |
| 2 | `apps/desktop/tsconfig.json` | `compilerOptions.paths` にマッピング追加（順序注意: 具体的→汎用） |
| 3 | `apps/desktop/vitest.config.ts` | `resolve.alias` にエントリ追加 |
| 4 | `packages/shared/tsup.config.ts` | `entry` にビルドエントリ追加（ビルド対象の場合） |

#### サブパス追加チェックリスト

新しいサブパスを追加する場合、以下を全て実施:

- [ ] `packages/shared/package.json` — `exports` にサブパスの import 先を追加
- [ ] `packages/shared/package.json` — `typesVersions` に型解決エントリを追加
- [ ] `apps/desktop/tsconfig.json` — `compilerOptions.paths` にマッピング追加（`@repo/shared/*` より前に配置）
- [ ] `apps/desktop/vitest.config.ts` — `resolve.alias` にエントリ追加
- [ ] `packages/shared/tsup.config.ts` — `entry` にビルドエントリ追加（ビルド対象の場合）
- [ ] 3層整合性テストを実行して全PASS確認

**検証コマンド**:

| 順序 | コマンド | 検証対象 |
| --- | --- | --- |
| 1 | `pnpm --filter @repo/shared build` | shared パッケージのビルド成功 |
| 2 | `pnpm --filter @repo/desktop exec tsc --noEmit` | TypeScript 型解決の整合性 |
| 3 | `cd apps/desktop && pnpm vitest run src/__tests__/shared-module-resolution.test.ts src/__tests__/vitest-alias-consistency.test.ts` | Vitest alias 整合性 |
| 4 | `pnpm --filter @repo/shared exec vitest run src/__tests__/module-resolution.test.ts` | shared 側 exports 整合性 |

#### 補足

- `apps/desktop` が shared ソースを直接参照する場合、`apps/desktop/tsconfig.json` の `include` に shared 側補助型宣言（`packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`）を含める
- paths の定義順序は「具体的なサブパス → 汎用パターン（`@repo/shared/*`）→ ルート（`@repo/shared`）」を厳守する。詳細は [architecture-monorepo.md#paths-定義順序ルール](./architecture-monorepo.md) を参照

#### 関連テスト一覧

| テストファイル | テスト数 | 検証内容 |
| --- | --- | --- |
| `packages/shared/src/__tests__/module-resolution.test.ts` | 57 | shared パッケージの exports / typesVersions 整合性 |
| `apps/desktop/src/__tests__/shared-module-resolution.test.ts` | 59 | desktop → shared の paths マッピング整合性 |
| `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` | 108 | 3層（exports / paths / alias）の完全一致検証 |

#### トラブルシューティング

| エラー | 原因 | 対処法 |
| --- | --- | --- |
| `TS2307: Cannot find module '@repo/shared/xxx'` | `tsconfig.json` の paths にマッピングが未追加 | `compilerOptions.paths` にエントリを追加（`@repo/shared/*` より前に配置） |
| `TS2307` が特定サブパスのみ発生 | paths の定義順序が誤っている（汎用パターンが先にマッチ） | 具体的なサブパスを `@repo/shared/*` より前に移動 |
| テスト時に `Cannot find module` | `vitest.config.ts` の `resolve.alias` に未追加 | alias にエントリを追加（tsconfig の paths は Vitest に自動反映されない） |
| ビルド後に `Module not found` | `package.json` の `exports` / `typesVersions` に未追加 | exports と typesVersions の両方にエントリを追加 |
| `paths` は正しいのに解決されない | 解決先ファイルパスの誤り（`src/` 有無の混在） | `packages/shared` のソース構造を確認し、実際のファイルパスを指定 |

#### 関連未タスク

| 未タスクID | 概要 |
| --- | --- |
| UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 | vitest-tsconfig-paths プラグイン導入により `resolve.alias` の手動同期を自動化 |

---

