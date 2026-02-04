# Phase 1: 要件定義

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 1                        |
| 機能名 | auth-ui-improvements-282 |
| 作成日 | 2026-02-04               |

## 目的

認証UIの3つの問題に対する要件を明確化し、受け入れ基準を定義する。

---

## 実行タスク

### Task 1: z-index問題の要件定義（T-01-1）

#### 背景

現状のアバター編集メニューは`z-50`、確認ダイアログは`z-[100]`だが、他の要素との競合により表示が隠れている。

#### 機能要件（FR）

| ID       | 要件                                                     | 優先度 |
| -------- | -------------------------------------------------------- | ------ |
| FR-Z-001 | ポップアップメニューは他のUI要素より前面に表示される     | 高     |
| FR-Z-002 | ツールチップは他のUI要素より前面に表示される             | 高     |
| FR-Z-003 | 確認ダイアログはポップアップメニューより前面に表示される | 中     |

#### 受け入れ基準（AC）

| AC-ID    | 基準                                                     |
| -------- | -------------------------------------------------------- |
| AC-Z-001 | アバター編集メニューがサイドバーより前面に表示される     |
| AC-Z-002 | アバター編集メニューがヘッダーより前面に表示される       |
| AC-Z-003 | 確認ダイアログがアバター編集メニューより前面に表示される |

---

### Task 2: 名前変更エラーの要件定義（T-01-2）

#### 背景

Supabaseに`user_profiles`テーブルが存在しないため、「Could not find the table 'public.user_profiles' in the schema cache」エラーが発生する。`user_metadata`へのフォールバック処理が必要。

#### 機能要件（FR）

| ID        | 要件                                                           | 優先度 |
| --------- | -------------------------------------------------------------- | ------ |
| FR-FB-001 | user_profilesテーブル不在時はuser_metadataにフォールバックする | 高     |
| FR-FB-002 | フォールバック時もユーザーに対してエラーを表示しない           | 高     |
| FR-FB-003 | フォールバック処理はログに記録される                           | 中     |

#### 検出すべきエラーパターン

| エラーパターン                  | 検出方法            |
| ------------------------------- | ------------------- |
| schema cache エラー             | message.includes()  |
| テーブル不存在エラー            | message.includes()  |
| user_profiles関連エラー         | message.includes()  |
| relation不存在エラー            | message.includes()  |
| PostgreSQLエラーコード PGRST200 | code === "PGRST200" |
| PostgreSQLエラーコード PGRST116 | code === "PGRST116" |
| PostgreSQLエラーコード 42P01    | code === "42P01"    |

#### 受け入れ基準（AC）

| AC-ID     | 基準                                               |
| --------- | -------------------------------------------------- |
| AC-FB-001 | 名前変更時にエラーダイアログが表示されない         |
| AC-FB-002 | 名前変更後、user_metadataに正しく保存される        |
| AC-FB-003 | フォールバック発生時、コンソールにログが出力される |

---

### Task 3: 連携解除UI更新の要件定義（T-01-3）

#### 背景

連携解除のバックエンド処理は成功しているが、UIが更新されない。`AUTH_STATE_CHANGED`イベント受信時に`fetchLinkedProviders`が呼ばれていない可能性がある。

#### 機能要件（FR）

| ID        | 要件                                                | 優先度 |
| --------- | --------------------------------------------------- | ------ |
| FR-UI-001 | 連携解除後、UIが即座に「解除済み」表示に更新される  | 高     |
| FR-UI-002 | AUTH_STATE_CHANGED時にlinkedProvidersが再取得される | 高     |
| FR-UI-003 | 連携解除の成否がユーザーにフィードバックされる      | 中     |

#### 状態更新トリガー

| トリガー           | 更新が必要な状態               |
| ------------------ | ------------------------------ |
| AUTH_STATE_CHANGED | linkedProviders                |
| 連携解除API成功    | linkedProviders                |
| ログイン成功       | user, profile, linkedProviders |

#### 受け入れ基準（AC）

| AC-ID     | 基準                                                                 |
| --------- | -------------------------------------------------------------------- |
| AC-UI-001 | 連携解除ボタン押下後、3秒以内にUIが更新される                        |
| AC-UI-002 | 連携解除後、解除したプロバイダーが「連携済み」から「未連携」に変わる |
| AC-UI-003 | リロードなしでUI更新が完了する                                       |

---

## 統合テスト連携【必須】

接続要件を明記する:

| 接続要件カテゴリ | 記載内容                                               |
| ---------------- | ------------------------------------------------------ |
| 外部サービス連携 | Supabase Auth（認証、ユーザーメタデータ）              |
| IPC通信          | PROFILE_GET, PROFILE_UPDATE, AUTH_GET_LINKED_PROVIDERS |
| Store連携        | authSlice（user, profile, linkedProviders）            |

---

## アーキテクチャ層別要件（Electronデスクトップアプリ）

| 層                         | 要件                                               |
| -------------------------- | -------------------------------------------------- |
| フロントエンド（Renderer） | z-index階層遵守、状態変更時のUI即時更新            |
| バックエンド（Main）       | エラーフォールバック処理、Supabase API呼び出し     |
| IPC通信                    | PROFILE_GET/UPDATE、AUTH_STATE_CHANGEDイベント伝播 |
| セキュリティ               | Preload経由でのセキュアなAPI公開                   |

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する：

| 観点               | 適用判断                    | 仕様参照先（aiworkflow-requirements）         |
| ------------------ | --------------------------- | --------------------------------------------- |
| UI/UX              | z-index問題（Renderer実装） | ui-ux-portal-patterns.md, ui-ux-components.md |
| エラーハンドリング | フォールバック処理          | error-handling.md                             |
| 認証アーキテクチャ | Supabase+Electron構造       | architecture-auth-security.md                 |
| 状態管理           | authSlice拡張               | arch-state-management.md                      |
| IPC通信            | profile:get-providers等     | api-ipc-auth.md, interfaces-auth.md           |
| データベース       | user_profilesテーブル       | database-schema.md                            |
| セキュリティ       | Preload APIセキュリティ     | security-api-electron.md                      |

---

## 参照資料

| 資料名              | パス                                                               | 説明                        |
| ------------------- | ------------------------------------------------------------------ | --------------------------- |
| システム要件        | `docs/00-requirements/master_system_design.md`                     | 全体要件                    |
| UI/UXコンポーネント | `aiworkflow-requirements: ui-ux-components.md`                     | UI設計指針                  |
| UI/UXポータル       | `aiworkflow-requirements: ui-ux-portal-patterns.md`                | z-index階層、Portalパターン |
| エラーハンドリング  | `aiworkflow-requirements: error-handling.md`                       | エラー処理指針              |
| 状態管理            | `aiworkflow-requirements: arch-state-management.md`                | Store設計指針               |
| 認証アーキテクチャ  | `aiworkflow-requirements: architecture-auth-security.md`           | Supabase+Electron認証構造   |
| 認証IPC仕様         | `aiworkflow-requirements: api-ipc-auth.md`                         | IPC API詳細                 |
| 認証型定義          | `aiworkflow-requirements: interfaces-auth.md`                      | Auth/LinkedProvider型       |
| データベース        | `aiworkflow-requirements: database-schema.md`                      | user_profilesテーブル定義   |
| セキュリティ        | `aiworkflow-requirements: security-api-electron.md`                | Preload APIセキュリティ     |
| 実装パターン        | `aiworkflow-requirements: architecture-implementation-patterns.md` | フォールバックパターン      |
| 認証機能設計        | `docs/30-workflows/login-only-auth/`                               | 認証機能詳細                |

---

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 本ドキュメント内 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC一覧           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 完了条件

- [ ] z-index問題の要件が定義されている
- [ ] フォールバック処理の要件が定義されている
- [ ] UI更新の要件が定義されている
- [ ] 各要件に受け入れ基準がある
- [ ] 接続要件（Supabase Auth/IPC/Store）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 2: 設計
