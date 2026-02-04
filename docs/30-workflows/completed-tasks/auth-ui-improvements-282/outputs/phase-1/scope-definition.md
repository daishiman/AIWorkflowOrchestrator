# Phase 1: スコープ定義

## メタ情報

| 項目     | 値          |
| -------- | ----------- |
| タスクID | AUTH-UI-001 |
| Phase    | 1           |
| 作成日   | 2026-02-04  |

---

## スコープ内（In Scope）

### 修正対象ファイル

| ファイル                                                                  | 修正内容                   |
| ------------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` | z-index修正（z-[9999]）    |
| `apps/desktop/src/main/ipc/profileHandlers.ts`                            | フォールバック処理実装     |
| `apps/desktop/src/renderer/store/slices/authSlice.ts`                     | fetchLinkedProviders()追加 |

### 修正対象機能

1. **アバター編集メニュー表示**
   - z-indexを`z-[9999]`に変更
   - React Portalによるレンダリング

2. **名前変更処理**
   - user_profilesテーブル不在時のフォールバック
   - user_metadataへの書き込み

3. **連携プロバイダーUI更新**
   - AUTH_STATE_CHANGED時のfetchLinkedProviders()呼び出し
   - 楽観的UI更新の実装

---

## スコープ外（Out of Scope）

| 項目                           | 理由                           |
| ------------------------------ | ------------------------------ |
| user_profilesテーブルの作成    | DBスキーマ変更は別タスクで対応 |
| 新規OAuthプロバイダーの追加    | 現行の3プロバイダー維持        |
| アバターアップロード機能の修正 | 本タスクの対象外               |
| パフォーマンス最適化           | 機能修正が優先                 |
| 多言語対応                     | 現行の日本語UIを維持           |
| アクセシビリティ改善           | 既存のARIA属性を維持           |

---

## 影響範囲

### 直接影響

| コンポーネント/モジュール | 影響内容                       |
| ------------------------- | ------------------------------ |
| AccountSection            | z-index変更によるスタイル変更  |
| profileHandlers           | エラーハンドリングロジック追加 |
| authSlice                 | 状態更新フロー変更             |

### 間接影響

| コンポーネント/モジュール | 影響内容                              |
| ------------------------- | ------------------------------------- |
| GlassPanel                | z-index競合の可能性（確認済み: なし） |
| 確認ダイアログ            | z-[100]で変更なし                     |
| サイドバー                | z-index競合の可能性（確認済み: なし） |

---

## 依存関係

### 外部依存

| 依存先        | 依存内容                     |
| ------------- | ---------------------------- |
| Supabase Auth | 認証・ユーザーメタデータ管理 |
| React Portal  | DOM最上位へのレンダリング    |
| Zustand       | 状態管理                     |

### 内部依存

| 依存元          | 依存先             |
| --------------- | ------------------ |
| AccountSection  | authSlice          |
| authSlice       | window.electronAPI |
| profileHandlers | Supabase Client    |

---

## 前提条件

1. Supabaseプロジェクトが設定済み
2. 開発環境が構築済み
3. pnpmがインストール済み
4. user_metadataへの書き込み権限がある

---

## 制約事項

1. Supabaseに`user_profiles`テーブルが存在しない
2. 認証にはSupabase Authを使用
3. Electronアプリ（Main-Renderer分離）
4. 既存のz-index階層を大きく変更しない
