# Phase 1: 要件定義書

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-001 |
| Phase      | 1           |
| 作成日     | 2026-02-04  |
| ステータス | 完了        |

---

## 概要

認証UIの3つの問題に対する要件を明確化する。

---

## 問題1: z-index問題

### 背景

アバター編集メニューやツールチップが他のUI要素（サイドバー、ヘッダー）に隠れて表示されない。

### 機能要件

| ID       | 要件                                                     | 優先度 |
| -------- | -------------------------------------------------------- | ------ |
| FR-Z-001 | ポップアップメニューは他のUI要素より前面に表示される     | 高     |
| FR-Z-002 | ツールチップは他のUI要素より前面に表示される             | 高     |
| FR-Z-003 | 確認ダイアログはポップアップメニューより前面に表示される | 中     |

### 技術要件

- `z-[9999]` クラスを使用（ui-ux-portal-patterns.md準拠）
- React Portalを使用してDOMの最上位にレンダリング
- 既存のz-index階層と競合しないこと

---

## 問題2: 名前変更エラー

### 背景

Supabaseに`user_profiles`テーブルが存在しないため、名前変更時に「Could not find the table 'public.user_profiles' in the schema cache」エラーが発生。

### 機能要件

| ID        | 要件                                                           | 優先度 |
| --------- | -------------------------------------------------------------- | ------ |
| FR-FB-001 | user_profilesテーブル不在時はuser_metadataにフォールバックする | 高     |
| FR-FB-002 | フォールバック時もユーザーに対してエラーを表示しない           | 高     |
| FR-FB-003 | フォールバック処理はログに記録される                           | 中     |

### 検出すべきエラーパターン

| エラーパターン                  | 検出方法                             |
| ------------------------------- | ------------------------------------ |
| schema cache エラー             | `message.includes("schema cache")`   |
| テーブル不存在エラー            | `message.includes("does not exist")` |
| user_profiles関連エラー         | `message.includes("user_profiles")`  |
| relation不存在エラー            | `message.includes("relation")`       |
| カラム不存在エラー              | `message.includes("column")`         |
| PostgreSQLエラーコード PGRST200 | `code === "PGRST200"`                |
| PostgreSQLエラーコード PGRST116 | `code === "PGRST116"`                |
| PostgreSQLエラーコード 42P01    | `code === "42P01"`                   |
| PostgreSQLエラーコード 42703    | `code === "42703"`                   |

---

## 問題3: 連携解除UI更新

### 背景

連携解除のバックエンド処理は成功しているが、UIが更新されない。`AUTH_STATE_CHANGED`イベント受信時に`fetchLinkedProviders`が呼ばれていない。

### 機能要件

| ID        | 要件                                                | 優先度 |
| --------- | --------------------------------------------------- | ------ |
| FR-UI-001 | 連携解除後、UIが即座に「解除済み」表示に更新される  | 高     |
| FR-UI-002 | AUTH_STATE_CHANGED時にlinkedProvidersが再取得される | 高     |
| FR-UI-003 | 連携解除の成否がユーザーにフィードバックされる      | 中     |

### 状態更新トリガー

| トリガー           | 更新が必要な状態               |
| ------------------ | ------------------------------ |
| AUTH_STATE_CHANGED | linkedProviders                |
| 連携解除API成功    | linkedProviders                |
| ログイン成功       | user, profile, linkedProviders |

---

## 接続要件（統合テスト連携）

| カテゴリ         | 要件                                                   |
| ---------------- | ------------------------------------------------------ |
| 外部サービス連携 | Supabase Auth（認証、ユーザーメタデータ）              |
| IPC通信          | PROFILE_GET, PROFILE_UPDATE, AUTH_GET_LINKED_PROVIDERS |
| Store連携        | authSlice（user, profile, linkedProviders）            |

---

## アーキテクチャ層別要件

| 層                         | 要件                                               |
| -------------------------- | -------------------------------------------------- |
| フロントエンド（Renderer） | z-index階層遵守、状態変更時のUI即時更新            |
| バックエンド（Main）       | エラーフォールバック処理、Supabase API呼び出し     |
| IPC通信                    | PROFILE_GET/UPDATE、AUTH_STATE_CHANGEDイベント伝播 |
| セキュリティ               | Preload経由でのセキュアなAPI公開                   |

---

## 参照仕様

| 仕様書                        | 適用理由                   |
| ----------------------------- | -------------------------- |
| ui-ux-portal-patterns.md      | z-index値（z-[9999]）根拠  |
| architecture-auth-security.md | Supabase+Electron認証構造  |
| error-handling.md             | フォールバック処理パターン |
| arch-state-management.md      | authSlice設計              |
| api-ipc-auth.md               | profile:get-providers等    |
