# 認証・プロフィール インターフェース仕様 / history bundle

> 親仕様書: [interfaces-auth.md](interfaces-auth.md)
> 役割: history bundle

## 完了タスク

### AUTH-UI-004: Googleアバター取得修正（2026-02-04完了）

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | AUTH-UI-004                                    |
| ステータス   | **完了**                                       |
| テスト数     | 1265（自動テスト）+ 5（手動テスト項目）        |
| 発見課題     | 0件                                            |
| ドキュメント | `docs/30-workflows/AUTH-UI-004-google-avatar/` |

### TASK-FIX-GOOGLE-LOGIN-001: Googleログイン修正（2026-02-05完了）

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-FIX-GOOGLE-LOGIN-001                             |
| ステータス   | **完了**                                              |
| Phase        | Phase 1-12完了                                        |
| テスト数     | 約50件（oauth-error-handler, authSlice.listener等）   |
| ドキュメント | `docs/30-workflows/TASK-FIX-GOOGLE-LOGIN-001/`        |

#### 修正内容

| 問題 | 修正内容                                                            |
| ---- | ------------------------------------------------------------------- |
| 1    | OAuthコールバックのerrorパラメータ検出（parseOAuthError関数追加）   |
| 2    | Supabase未設定時エラー（`AUTH_ERROR_CODES.AUTH_NOT_CONFIGURED` 追加） |
| 3    | セッション管理（refreshTokenExpiresAtフィールド追加）               |
| 4    | リスナー二重登録防止（authListenerRegisteredフラグ追加）            |

#### 新規ファイル

| ファイル                                            | 内容                               |
| --------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/main/auth/oauth-error-handler.ts` | OAuthエラーパース・マッピング関数  |

#### 関数追加

| 関数名                         | 説明                                   |
| ------------------------------ | -------------------------------------- |
| `parseOAuthError()`            | URLからOAuthエラーパラメータを抽出     |
| `mapOAuthErrorToMessage()`     | エラーコードを日本語メッセージに変換   |
| `calculateRefreshTokenExpiry()`| リフレッシュトークン有効期限計算       |
| `waitForSession()`             | ポーリングベースのセッション待機       |
| `resetAuthListenerFlag()`      | テスト用リスナーフラグリセット         |

#### 変更内容

- SupabaseIdentity型にpictureプロパティを追加
- toLinkedProvider関数にフォールバック処理を実装（avatar_url → picture）

### TASK-AUTH-MODE-SELECTION-001: 認証方式選択機能（2026-02-09完了）

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-AUTH-MODE-SELECTION-001                          |
| ステータス   | **完了**                                              |
| Phase        | Phase 1-12完了                                        |
| テスト数     | 86件（AuthModeService, SubscriptionAuthProvider等）   |
| ドキュメント | `docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/`     |

#### 実装内容

| 機能                        | 説明                                                   |
| --------------------------- | ------------------------------------------------------ |
| 認証方式選択UI              | サブスクリプション/APIキー認証の切り替えUI             |
| AuthModeService             | 認証方式の永続化・管理サービス                         |
| SubscriptionAuthProvider    | Claude Code CLIトークン取得（macOS Keychain経由）      |
| IPCハンドラ                 | `auth-mode:get/set/status/validate/changed` チャンネル |
| authModeSlice               | Zustand状態管理（shared transport DTO を反映）         |

#### 新規ファイル

| ファイル                                                  | 内容                               |
| --------------------------------------------------------- | ---------------------------------- |
| `packages/shared/src/types/auth-mode.ts`                  | 共有型定義（AuthMode等）           |
| `apps/desktop/src/main/services/auth/AuthModeService.ts`  | 認証方式管理サービス               |
| `apps/desktop/src/main/services/auth/SubscriptionAuthProvider.ts` | CLIトークン取得          |
| `apps/desktop/src/main/ipc/authModeHandlers.ts`           | IPCハンドラ                        |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | Zustand slice                      |
| `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | UIコンポーネント |

### TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001: auth-mode 契約整合（2026-03-06完了）

| 項目 | 内容 |
| ---- | ---- |
| タスクID | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| ステータス | **完了** |
| Phase | Phase 1-12完了 |
| テスト数 | 252（自動）+ 5（Phase 11 手動テストケース） |
| ドキュメント | `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/` |

#### 実装内容

| 反映先 | 内容 |
| ------ | ---- |
| `packages/shared/src/types/auth-mode.ts` | `AuthModeStatus`, `IPCResponse<T>`, `AuthModeChangedEvent`, 公開 error code union を正本化 |
| `apps/desktop/src/main/ipc/authModeHandlers.ts` | `get/status/validate` を shared transport DTO に統一し、`changed` を `previousMode/mode/status/changedAt` へ更新 |
| `apps/desktop/src/preload/types.ts`, `apps/desktop/src/preload/index.ts` | Main/Renderer 間の公開型を shared から再exportし、`validate(request?)` を optional request 契約へ揃えた |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | `status` / `validate` / `onModeChanged` を canonical DTO 前提に統一し、error fallback を `AuthModeStatus` で扱う |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx` | `message`, `errorCode`, `guidance` を表示し、Phase 11 視覚検証用の `data-testid` を固定 |

#### 公開 transport DTO

| DTO | 主要フィールド | 用途 |
| --- | --- | --- |
| `AuthModeResponse` | `mode` | `auth-mode:get` の `data` payload |
| `AuthModeStatus` | `mode`, `isValid`, `hasCredentials`, `message`, `errorCode?`, `guidance?`, `lastCheckedAt` | `status` / `validate` / `changed.status` の共通 DTO |
| `AuthModeChangedEvent` | `previousMode`, `mode`, `status`, `changedAt` | Renderer の変更通知 |
| `IPCError` | `code`, `message`, `guidance?` | `IPCResponse<T>` のエラー payload |

#### 公開エラーコード

| コード | 意味 |
| ------ | ---- |
| `auth-mode/invalid-sender` | sender 検証失敗 |
| `auth-mode/invalid-mode` | `VALID_AUTH_MODES` 外の mode 指定 |
| `auth-mode/no-api-key` | API Key 認証情報なし |
| `auth-mode/no-subscription-token` | Claude Code CLI トークンなし |
| `auth-mode/storage-failed` / `auth-mode/storage-read-failed` | 永続化失敗 / 読み込み失敗 |
| `auth-mode/unknown-error` | 想定外の実行時エラー |

#### 実装上の苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| `AuthModeResponse` / `AuthModeStatus` / event payload の意味境界が曖昧化しやすい | `get/status/validate/changed` のどれか1つだけを修正し、残りを局所型のまま放置する場合 | shared 側に transport DTO を集約し、Preload/Renderer は再定義せず再exportに統一した | auth 系の interface 仕様は「mode を返す DTO」「status DTO」「event DTO」を明示分離し、見出し単位で並べて管理する |
| `message/errorCode/guidance` が UI 表示要件なのに transport 契約へ昇格しない | Renderer 側だけで補助情報を合成し、Main/Preload の仕様へ戻さない場合 | `SettingsView` 表示項目を `AuthModeStatus` / `IPCError` へ寄せ、UI と transport を同じ語彙に揃えた | 表示文字列の出所が契約起点なら、UI 実装ではなく interface 仕様へ先に記述する |
| P31 対策の旧説明が現行 `SettingsView` 実装とずれる | 過去の `useRef` ガード例を残したまま、`store/index.ts` の現行 selector 正本を更新しない場合 | 現行の `useInitializeAuthMode()` + selector パターンへ説明を是正した | 状態管理の暫定回避策は、正式パターンへ移行した時点で interface / architecture 両方から旧説明を外す |
| domain spec の標準3ブロックが Phase 12 の機械検証対象になっていない | template を追加した時点で満足し、更新した interface 仕様に `実装内容（要点）` / `苦戦箇所（再利用形式）` / `同種課題の5分解決カード` が揃っているかを確認しない場合 | auth-mode では本節へ3ブロックを手動同期し、残課題を `UT-IMP-PHASE12-DOMAIN-SPEC-SYNC-BLOCK-VALIDATOR-001` として formalize した | interface 仕様更新は契約表だけで完了扱いにせず、標準3ブロックの存在確認までを Phase 12 の完了条件に含める |

#### 同種課題の5分解決カード

1. shared に `IPCResponse<T>` / `AuthModeStatus` / event DTO を集約する。
2. Main / Preload / Renderer の local 型再定義を削り、import / re-export に寄せる。
3. `message/errorCode/guidance` のような UI 表示項目を contract 側へ昇格させる。
4. `interfaces-auth` と `api-ipc-system` を同一ターンで更新し、`ipc-contract-checklist` / `quick-reference` と更新した domain spec の標準3ブロックも追従させる。
5. Phase 11 は対象 view 専用 harness を使って再撮影し、coverage と一緒に固定する。

#### 関連未タスク

| 未タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| UT-IMP-PHASE12-DOMAIN-SPEC-SYNC-BLOCK-VALIDATOR-001 | 更新対象 domain spec に標準3ブロックが揃っているかを機械検証し、interface 仕様の後追い追記を防ぐ | `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/unassigned-task/task-imp-phase12-domain-spec-sync-block-validator-001.md` | 未実施 |
| UT-IMP-PROFILE-AVATAR-FALLBACK-ERROR-LOCALIZATION-001 | `profile/not-configured` / `avatar/not-configured` を Renderer で code ベースに日本語化する | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/unassigned-task/task-imp-profile-avatar-fallback-error-localization-001.md` | 未実施 |

---

### TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001: AuthKey source 表示契約整合（2026-03-11完了）

| 項目 | 内容 |
| ---- | ---- |
| タスクID | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| ステータス | **完了** |
| 反映対象 | `auth-key:exists` レスポンスの source 判定と Settings 表示整合 |
| ドキュメント | `docs/30-workflows/api-key-chat-tool-integration-alignment/outputs/phase-12/spec-update-summary.md` |

#### 追加した公開契約

| 型 | フィールド | 説明 |
| --- | --- | --- |
| `AuthKeyExistsResponse` | `exists: boolean` | キー存在可否 |
| `AuthKeyExistsResponse` | `source?: "saved" \| "env-fallback" \| "not-set"` | 判定起点（保存済み / 環境変数fallback / 未設定） |

#### 運用ルール

- `source` が存在する場合は UI 側で `source` を最優先して状態表示する
- `source` が未提供の場合は後方互換として既存 `hasCredentials` 判定を補助利用する
- `exists=false` のときは `source="not-set"` を返し、UI が曖昧状態にならないようにする

---

## 変更履歴

| Version    | Date           | Changes                                                                                 |
| ---------- | -------------- | --------------------------------------------------------------------------------------- |
| **1.5.3**  | **2026-03-11** | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 反映: `AuthKeyExistsResponse.source`（saved/env-fallback/not-set）を追加し、Settings の AuthKey 状態表示契約を `source` 優先へ同期 |
| **1.5.2**  | **2026-03-06** | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 追補2: auth-mode 節へ「domain spec の標準3ブロックが Phase 12 の機械検証対象になっていない」苦戦箇所と関連未タスク `UT-IMP-PHASE12-DOMAIN-SPEC-SYNC-BLOCK-VALIDATOR-001` を追加し、interface 仕様の後追い追記防止ルールを明文化 |
| **1.5.1**  | **2026-03-06** | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 追補: auth-mode 節へ `実装上の苦戦箇所（再利用形式）` と `同種課題の5分解決カード` を追加し、shared DTO 正本化・UI表示契約昇格・P31説明是正の再利用ルールを明文化 |
| **1.5.0**  | **2026-03-06** | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001: auth-mode transport DTO を `packages/shared/src/types/auth-mode.ts` に統一し、`auth-mode:get/set/status/validate/changed` の公開契約・error code union・Renderer 表示項目（message/errorCode/guidance）を現行実装へ同期 |
| **1.4.0**  | **2026-02-09** | TASK-AUTH-MODE-SELECTION-001: AuthMode型・AuthModeService・SubscriptionAuthProvider・authModeSlice追加（認証方式選択機能） |
| **1.3.0**  | **2026-02-06** | TASK-AUTH-SESSION-REFRESH-001: TokenRefreshCallbacks/TokenRefreshConfig型定義追加（Callback DIパターン、スケジューラー設定） |
| **1.2.0**  | **2026-02-05** | TASK-FIX-GOOGLE-LOGIN-001完了: AUTH_ERROR_CODES拡張(9コード)、AuthSession/AuthState型拡張、OAuthエラーハンドリング |
| 1.1.0      | 2026-02-04     | AUTH-UI-004完了: SupabaseIdentity型にpictureプロパティ追加、完了タスクセクション追加    |
| 1.0.0      | 2026-01-15     | 初版作成: 認証・プロフィール・ワークスペース型定義                                       |

