# Phase 1 成果物: 要件定義サマリー

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| タスクID   | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 作成日     | 2026-03-08                                    |
| ステータス | 完了（P50: 既実装確認済み）                   |

## 要件サマリー

### 問題の概要

Supabase未設定環境（`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 未設定）において、Profile（11チャンネル）およびAvatar（3チャンネル）のIPCフォールバックハンドラが未登録の場合、Rendererからの呼び出しで `Error: No handler registered for 'profile:get'` 等の未処理例外が発生し、画面がクラッシュする。

### 対象チャンネルリスト

#### Profile関連チャンネル（11個）

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

#### Avatar関連チャンネル（3個）

| #   | チャンネル定数                     | チャンネル名          |
| --- | ---------------------------------- | --------------------- |
| 1   | `IPC_CHANNELS.AVATAR_UPLOAD`       | `avatar:upload`       |
| 2   | `IPC_CHANNELS.AVATAR_USE_PROVIDER` | `avatar:use-provider` |
| 3   | `IPC_CHANNELS.AVATAR_REMOVE`       | `avatar:remove`       |

### 受入基準（AC-1 -- AC-6）

| #    | 受入基準                                                                                           | 検証方法       |
| ---- | -------------------------------------------------------------------------------------------------- | -------------- |
| AC-1 | Supabase未設定環境でProfile画面を開いてもクラッシュしない                                          | 手動テスト     |
| AC-2 | Profile 11チャンネルが `{ success: false, error: { code: 'profile/not-configured', ... } }` を返す | ユニットテスト |
| AC-3 | Avatar 3チャンネルが `{ success: false, error: { code: 'avatar/not-configured', ... } }` を返す    | ユニットテスト |
| AC-4 | Supabase設定済み環境では通常ハンドラが使用される（フォールバック未登録）                           | ユニットテスト |
| AC-5 | 既存 `registerAuthFallbackHandlers()` と同一パターンで実装されている                               | コードレビュー |
| AC-6 | フォールバックハンドラが `ipcMain.handle` で二重登録されない（P5対策）                             | ユニットテスト |

### 非機能要件

| 項目           | 要件                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| パフォーマンス | フォールバックハンドラの登録は起動時に1回のみ、応答は即時                       |
| セキュリティ   | エラーレスポンスに内部情報（ファイルパス、スタックトレース）を含めない          |
| 保守性         | 既存Auth フォールバックと同一パターン。チャンネル定数は `IPC_CHANNELS` から参照 |
| テスタビリティ | フォールバック関数を独立した関数として定義し、単体テスト可能                    |

## P50パターン記録: 既実装防御の発見

### 発見内容

Phase 1 の要件定義後、対象コードを精査した結果、`registerProfileFallbackHandlers()` と `registerAvatarFallbackHandlers()` は**既に実装済み**であることが判明した。

### 既存実装の所在

| 実装要素                                 | ファイル                             | 行番号   |
| ---------------------------------------- | ------------------------------------ | -------- |
| `registerProfileFallbackHandlers()`      | `apps/desktop/src/main/ipc/index.ts` | L746-769 |
| `registerAvatarFallbackHandlers()`       | `apps/desktop/src/main/ipc/index.ts` | L775-787 |
| `createNotConfiguredResponse()` ヘルパー | `apps/desktop/src/main/ipc/index.ts` | L689-697 |
| `registerFallbackHandlers()` ヘルパー    | `apps/desktop/src/main/ipc/index.ts` | L699-703 |
| else分岐での呼び出し                     | `apps/desktop/src/main/ipc/index.ts` | L469-477 |
| テスト                                   | `ipc-double-registration.test.ts`    | L401-542 |

### 既存実装の検証結果

| 検証項目                                               | 結果                             |
| ------------------------------------------------------ | -------------------------------- |
| Profile 11チャンネル全登録                             | 合致（L751-766に全11チャンネル） |
| Avatar 3チャンネル全登録                               | 合致（L780-784に全3チャンネル）  |
| エラーコード `PROFILE_ERROR_CODES.NOT_CONFIGURED` 使用 | 合致（L748）                     |
| エラーコード `AVATAR_ERROR_CODES.NOT_CONFIGURED` 使用  | 合致（L776）                     |
| `IPC_CHANNELS` 定数参照                                | 合致（ハードコード文字列なし）   |
| `createNotConfiguredResponse()` 共通ヘルパー使用       | 合致（L689-697）                 |
| if/else排他分岐                                        | 合致（L462-477）                 |
| テスト6件存在                                          | 合致（L401-542）                 |

### P50 適用判定

要件定義で想定した修正は全て既に実装されている。Phase 4-5 は「検証・補完」モードに切り替える。

## 完了条件チェックリスト

- [x] Profile関連チャンネル11個を完全列挙済み
- [x] Avatar関連チャンネル3個を完全列挙済み
- [x] 受入基準（AC-1 -- AC-6）が検証可能な形式で定義済み
- [x] 非機能要件が明示済み
- [x] 既存フォールバックパターン（`registerAuthFallbackHandlers`）の分析完了
- [x] 再現シナリオが具体的に記述済み
- [x] P50パターン記録: 既実装であることの発見と検証結果を記録済み

## 次のPhase

Phase 2: 設計 -> `outputs/phase-2/design-summary.md`
