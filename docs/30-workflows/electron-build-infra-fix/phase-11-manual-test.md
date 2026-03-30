# Phase 11: 手動テスト

## メタ情報

| 項目      | 内容                                                     |
| --------- | -------------------------------------------------------- |
| Phase     | 11                                                       |
| 名称      | 手動テスト                                               |
| 前提Phase | Phase 10                                                 |
| 成果物    | 手動テスト結果、スクリーンショット（任意）、動作確認ログ |

## 目的

Electron アプリを実際に起動し、問題A（Preload モジュール解決エラー）と問題B（better-sqlite3 ABI 不整合）が修正されていることを手動で検証する。自動テストではカバーできないランタイム動作を確認する。

## 実行タスク

### Task 11-1: クリーンインストールからの起動テスト

この手順は、新しいクローンまたはクリーン環境での動作を再現する。

1. `node_modules` を削除する

   ```bash
   rm -rf node_modules apps/desktop/node_modules packages/shared/node_modules
   ```

2. `pnpm install` を実行する

   ```bash
   pnpm install
   ```

3. コンソール出力を確認する
   - `scripts/setup-native-modules.sh` が実行されていること
   - Electron 向けリビルドが実行されていること（「Electron 向けネイティブモジュールリビルド...」のログ出力）
   - `electron-rebuild` が成功していること（「Electron 向けリビルド完了」のログ出力）
   - エラーが出ていないこと

4. 結果を記録する
   - [ ] `pnpm install` が正常に完了した
   - [ ] Electron 向けリビルドログが出力された
   - [ ] エラーなし

### Task 11-2: 問題A の修正確認 - Preload モジュール解決

1. shared パッケージをビルドする

   ```bash
   pnpm --filter @repo/shared build
   ```

2. CJS ファイルの存在を確認する

   ```bash
   ls -la packages/shared/dist/src/ipc/channels.cjs
   ```

   - [ ] `channels.cjs` ファイルが存在する

3. desktop パッケージをビルドする

   ```bash
   pnpm --filter @repo/desktop build
   ```

4. preload バンドルの内容を確認する

   ```bash
   grep -c 'require.*@repo/shared' apps/desktop/out/preload/index.js
   ```

   - [ ] 結果が `0` である（`@repo/shared` の require が残っていない）

5. Electron アプリを起動する

   ```bash
   pnpm --filter @repo/desktop dev
   ```

6. DevTools のコンソールを確認する
   - [ ] `Error: module not found: @repo/shared/src/ipc/channels` が出ていないこと
   - [ ] preload スクリプトが正常に読み込まれていること
   - [ ] IPC チャネルが正常に動作していること（画面が表示される）

7. アプリを終了する（Cmd+Q / Alt+F4）

### Task 11-3: 問題B の修正確認 - better-sqlite3 ABI 一致

1. Electron アプリを起動する

   ```bash
   pnpm --filter @repo/desktop dev
   ```

2. DevTools のコンソールを確認する
   - [ ] `NODE_MODULE_VERSION` 不整合エラーが出ていないこと
   - [ ] better-sqlite3 が正常に読み込まれていること
   - [ ] DB 初期化が成功していること

3. ABI バージョンの一致を確認する

   ```bash
   # Node.js の ABI バージョン
   node -p "process.versions.modules"
   # Electron の ABI バージョン
   npx electron -e "console.log(process.versions.modules)"
   ```

   - [ ] 両者の ABI バージョンを記録した

4. better-sqlite3 を Electron コンテキストで読み込みテストする

   ```bash
   npx electron -e "try { require('better-sqlite3'); console.log('OK: better-sqlite3 loaded'); } catch(e) { console.error('FAIL:', e.message); }"
   ```

   - [ ] `OK: better-sqlite3 loaded` が出力された

5. アプリを終了する

### Task 11-4: 基本機能の動作確認

Electron アプリが起動した状態で、以下の基本機能が動作することを確認する：

1. **画面表示**
   - [ ] メイン画面が正常にレンダリングされる
   - [ ] サイドバーのナビゲーションが表示される

2. **IPC 通信**
   - [ ] テーマの切り替え（ダーク/ライト）が動作する
   - [ ] 設定画面が開ける

3. **データベース操作**
   - [ ] ワークスペース一覧が表示される（DB からの読み込み）
   - [ ] 新規アイテムの作成が可能（DB への書き込み）

### Task 11-5: エラーログの確認

1. Electron アプリを起動した状態で DevTools（F12）を開く

2. Console タブで以下を確認する
   - [ ] `Error` レベルのログが0件であること（既知の無害なエラーを除く）
   - [ ] `Warning` レベルで `module not found` や `NODE_MODULE_VERSION` 関連の警告がないこと

3. Electron のメインプロセスログを確認する
   - ターミナルの `pnpm --filter @repo/desktop dev` 出力を確認
   - [ ] `Error` や `FATAL` レベルのログがないこと

### Task 11-6: ワークツリー環境での動作確認

ワークツリーは `node_modules` の共有方法が異なるため、追加の確認が必要。

1. 現在のワークツリーで `pnpm install` を実行する

   ```bash
   pnpm install
   ```

   - [ ] Electron 向けリビルドが実行される

2. `pnpm --filter @repo/desktop dev` でアプリが起動する
   - [ ] 起動成功

### Task 11-7: 手動テスト結果サマリ

| テスト項目                | 結果 | 備考 |
| ------------------------- | ---- | ---- |
| クリーンインストール→起動 |      |      |
| preload モジュール解決    |      |      |
| better-sqlite3 ABI 一致   |      |      |
| 基本機能動作              |      |      |
| エラーログなし            |      |      |
| ワークツリー環境          |      |      |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名            | パス                                   |
| ----------------- | -------------------------------------- |
| E2E テスト        | `references/quality-e2e-testing.md`    |
| Electron サービス | `references/arch-electron-services.md` |

## 成果物

| 成果物         | 配置先                                  | 説明             |
| -------------- | --------------------------------------- | ---------------- |
| 手動テスト結果 | `phase-11-manual-test.md`（本ファイル） | テスト結果の記録 |

## 完了条件

- [ ] クリーンインストールからの起動テスト（Task 11-1）が成功している
- [ ] Preload モジュール解決エラーが発生しないことを確認した（Task 11-2）
- [ ] better-sqlite3 ABI 不整合エラーが発生しないことを確認した（Task 11-3）
- [ ] 基本機能（画面表示、IPC、DB操作）が動作することを確認した（Task 11-4）
- [ ] エラーログに問題がないことを確認した（Task 11-5）
- [ ] ワークツリー環境での動作を確認した（Task 11-6）
- [ ] 手動テスト結果サマリが全て記録されている（Task 11-7）
- [ ] **本Phase内の全タスクを100%実行完了**
