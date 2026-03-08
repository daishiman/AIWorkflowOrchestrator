# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 1                                             |
| タスクID | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名   | supabase-fallback-profile-avatar              |
| 作成日   | 2026-03-07                                    |
| 優先度   | 中                                            |
| 影響範囲 | Supabase未設定環境でのProfile/Avatar操作      |

## 目的

Supabase未設定環境において、Profile（11チャンネル）およびAvatar（3チャンネル）のIPCハンドラが未登録のままRendererからの呼び出しが発生し、`Error: No handler registered for 'profile:get'` 等の未処理例外により画面がクラッシュする問題を解決する。

## 背景

### 現状の問題

`apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` 内で `getSupabaseClient()` が null を返す場合:

1. **Auth関連**: `registerAuthFallbackHandlers()` が5チャンネル（login, logout, get-session, refresh, check-online）にフォールバックを登録済み → 正常動作
2. **Profile関連**: 11チャンネルにフォールバックなし → **クラッシュ**
3. **Avatar関連**: 3チャンネルにフォールバックなし → **クラッシュ**

### 再現シナリオ

1. Supabase環境変数（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`）を未設定でアプリを起動
2. Auth画面は正常表示（フォールバックハンドラあり）
3. Profile画面を開く
4. `Error: No handler registered for 'profile:get'` が発生
5. 画面がクラッシュ（白画面またはエラー表示）

## 実行タスク

- Task 1: 影響チャンネルの完全列挙: `channels.ts` を基準に Profile 11 チャンネル / Avatar 3 チャンネルの対象範囲を固定する
- Task 2: 受入基準の定義: Supabase 未設定時の fallback 応答とクラッシュ防止条件を AC として明文化する
- Task 3: 非機能要件の定義: P5 二重登録防止、エラー情報最小化、テスタビリティ要件を整理する

### Task 1: 影響チャンネルの完全列挙

Profile関連チャンネル（11個）:

| #   | チャンネル定数                              | チャンネル名                   |
| --- | ------------------------------------------- | ------------------------------ |
| 1   | `IPC_CHANNELS.PROFILE_GET`                  | `profile:get`                  |
| 2   | `IPC_CHANNELS.PROFILE_UPDATE`               | `profile:update`               |
| 3   | `IPC_CHANNELS.PROFILE_DELETE`               | `profile:delete`               |
| 4   | `IPC_CHANNELS.PROFILE_GET_PROVIDERS`        | `profile:get-providers`        |
| 5   | `IPC_CHANNELS.PROFILE_LINK_PROVIDER`        | `profile:link-provider`        |
| 6   | `IPC_CHANNELS.PROFILE_UNLINK_PROVIDER`      | `profile:unlink-provider`      |
| 7   | `IPC_CHANNELS.PROFILE_UPDATE_TIMEZONE`      | `profile:update-timezone`      |
| 8   | `IPC_CHANNELS.PROFILE_UPDATE_LOCALE`        | `profile:update-locale`        |
| 9   | `IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS` | `profile:update-notifications` |
| 10  | `IPC_CHANNELS.PROFILE_EXPORT`               | `profile:export`               |
| 11  | `IPC_CHANNELS.PROFILE_IMPORT`               | `profile:import`               |

Avatar関連チャンネル（3個）:

| #   | チャンネル定数                     | チャンネル名          |
| --- | ---------------------------------- | --------------------- |
| 1   | `IPC_CHANNELS.AVATAR_UPLOAD`       | `avatar:upload`       |
| 2   | `IPC_CHANNELS.AVATAR_USE_PROVIDER` | `avatar:use-provider` |
| 3   | `IPC_CHANNELS.AVATAR_REMOVE`       | `avatar:remove`       |

### Task 2: 受入基準の定義

| #    | 受入基準                                                                                              | 検証方法                                    |
| ---- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| AC-1 | Supabase未設定環境でProfile画面を開いてもクラッシュしない                                             | 手動テスト: 環境変数未設定でProfile画面遷移 |
| AC-2 | Profile関連11チャンネルが `{ success: false, error: { code: 'profile/not-configured', ... } }` を返す | ユニットテスト                              |
| AC-3 | Avatar関連3チャンネルが `{ success: false, error: { code: 'avatar/not-configured', ... } }` を返す    | ユニットテスト                              |
| AC-4 | Supabase設定済み環境では通常のハンドラが使用される（フォールバックは登録されない）                    | ユニットテスト                              |
| AC-5 | 既存の `registerAuthFallbackHandlers()` と同一パターンで実装されている                                | コードレビュー                              |
| AC-6 | フォールバックハンドラがipcMain.handleで二重登録されない（P5対策）                                    | ユニットテスト                              |

### Task 3: 非機能要件

| 項目           | 要件                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| パフォーマンス | フォールバックハンドラの登録は起動時に1回のみ、応答は即時（async/awaitの最小コスト） |
| セキュリティ   | エラーレスポンスに内部情報（ファイルパス、スタックトレース）を含めない               |
| 保守性         | 既存Auth フォールバックと同一パターン。チャンネル定数は `IPC_CHANNELS` から参照      |
| テスタビリティ | フォールバック関数を独立した関数として定義し、単体テスト可能にする                   |

## 参照資料

| 資料名                 | パス                                                                  | 説明                                         |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| IPCチャンネル定数      | `apps/desktop/src/preload/channels.ts`                                | Profile/Avatarチャンネル名の定義             |
| IPC登録ロジック        | `apps/desktop/src/main/ipc/index.ts:456-469`                          | 既存のSupabase分岐ロジック                   |
| Auth フォールバック    | `apps/desktop/src/main/ipc/index.ts:682-721`                          | 既存の `registerAuthFallbackHandlers()` 実装 |
| エラーハンドリング方針 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラーコード・レスポンス形式                 |
| 認証IPC仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`   | 認証IPC全体仕様                              |

### システム仕様（aiworkflow-requirements）

- `references/api-ipc-auth.md` - Auth/Profile/Avatar IPC チャネルと fallback 契約の正本
- `references/architecture-auth-security.md` - Supabase 未設定時の認証ドメイン責務と Main/Renderer 境界
- `references/security-electron-ipc.md` - fallback 登録と `ipcMain.handle` ライフサイクルの制約
- `references/ipc-contract-checklist.md` - 通常経路 / fallback 経路の同時監査手順
- `references/error-handling.md` - not configured 系エラーコードと error envelope の記録先

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. `apps/desktop/src/preload/channels.ts` からProfile/Avatarチャンネルの完全リストを取得
2. `apps/desktop/src/main/ipc/index.ts` の `registerAuthFallbackHandlers()` パターンを分析
3. 受入基準（AC-1〜AC-6）を確定
4. 非機能要件を確定
5. Phase 2（設計）への入力資料として要件を文書化

## 統合テスト連携

- Phase 4 では `ipc-double-registration.test.ts` に Profile 11 チャンネル / Avatar 3 チャンネルの fallback 契約テストを追加する
- Phase 6 では `channels.ts` の定義数と fallback 配列数の同期ズレを検出する回帰テストを固定する
- Phase 11 では Supabase 未設定 / 設定済みの 2 シナリオを AC-1〜AC-6 に対応付けて手動確認する

## 成果物

| 成果物     | パス                                                                                                         | 説明           |
| ---------- | ------------------------------------------------------------------------------------------------------------ | -------------- |
| 要件定義書 | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [x] Profile関連チャンネル11個を完全列挙済み
- [x] Avatar関連チャンネル3個を完全列挙済み
- [x] 受入基準（AC-1〜AC-6）が検証可能な形式で定義済み
- [x] 非機能要件が明示済み
- [x] 既存フォールバックパターン（`registerAuthFallbackHandlers`）の分析完了
- [x] 再現シナリオが具体的に記述済み

## 次のPhase

Phase 2: 設計
