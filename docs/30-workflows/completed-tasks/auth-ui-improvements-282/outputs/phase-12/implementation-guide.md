# Phase 12: 実装ガイド

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-001 |
| Phase      | 12          |
| 作成日     | 2026-02-04  |
| ステータス | 完了        |

---

## 概要

本ドキュメントは、認証UIの3つのバグ修正について、実装の詳細と理解を助けるためのガイドです。

---

## 修正1: z-index問題

### 問題の背景

アバター編集メニューがサイドバーやヘッダーの背面に隠れてしまう問題がありました。

### 解決策

**React Portal + 高いz-index値の適用**

```tsx
// AccountSection/index.tsx:501
className =
  "fixed w-48 bg-[var(--bg-secondary)] border border-white/10 rounded-lg shadow-lg z-[9999]";
```

### 技術的解説（中学生向け）

**z-indexとは？**

z-indexは、ウェブページ上で要素が重なったときの「前後関係」を決める数字です。

数字が大きいほど「手前」に表示されます。例えば：

- z-index: 1 → 一番奥
- z-index: 50 → 中間
- z-index: 9999 → 一番手前

**React Portalとは？**

通常、Reactコンポーネントは親要素の中に表示されます。しかし、Portalを使うと、コンポーネントをページの一番外側（body直下）に「テレポート」させることができます。

これにより、他の要素に影響されずに最前面に表示できます。

---

## 修正2: 名前変更エラー

### 問題の背景

名前を変更しようとすると「user_profilesテーブルが見つからない」というエラーが表示されていました。

### 解決策

**フォールバック処理の実装**

```typescript
// profileHandlers.ts:66-85
function isUserProfilesTableError(error: { message: string; code?: string }): boolean {
  const errorPatterns = ["schema cache", "does not exist", "user_profiles", ...];
  const errorCodes = ["PGRST200", "PGRST116", "42P01", "42703"];
  return errorPatterns.some(p => error.message.toLowerCase().includes(p.toLowerCase()))
    || errorCodes.includes(error.code ?? "");
}
```

### 技術的解説（中学生向け）

**フォールバックとは？**

「フォールバック」は、メインの方法がうまくいかないときに使う「バックアップの方法」です。

例えば：

1. まず「user_profiles」テーブルからデータを取得しようとする
2. テーブルがなくてエラーになる
3. エラーを検出して、代わりに「user_metadata」からデータを取得する

これにより、ユーザーはエラーを見ずに操作を続けられます。

**エラーコードとは？**

データベースはエラーが起きたとき、コード（例：42P01）で問題の種類を教えてくれます。このコードを見て「テーブルが存在しないエラーだ」と判断できます。

---

## 修正3: 連携解除UI更新

### 問題の背景

OAuthプロバイダー（Google、GitHubなど）の連携を解除しても、UIがすぐに更新されず、リロードが必要でした。

### 解決策

**AUTH_STATE_CHANGED後の状態取得**

```typescript
// authSlice.ts:342-345
// Refresh profile and linked providers after auth state change
// (連携解除時などにUIを即座に更新するため)
get().fetchProfile();
get().fetchLinkedProviders();
```

### 技術的解説（中学生向け）

**認証状態の変更イベントとは？**

ユーザーがログイン、ログアウト、または連携解除すると、「認証状態が変わった」というイベントが発生します。

このイベントを検知して、自動的に最新の情報を取得し直すことで、UIを即座に更新できます。

**状態管理（State Management）とは？**

アプリの「今の状態」（誰がログインしているか、どのプロバイダーと連携しているか）を保存しておく仕組みです。

状態が変わったら、それに応じて画面の表示も自動的に変わります。

---

## z-index階層設計

プロジェクト全体のz-index階層：

| z-index値    | 用途                     | 例                       |
| ------------ | ------------------------ | ------------------------ |
| z-0          | 通常のコンテンツ         | メインコンテンツ         |
| z-10         | 浮遊要素                 | カード、パネル           |
| z-50         | ドロップダウン           | 通常のドロップダウン     |
| z-[100]      | モーダル                 | 確認ダイアログ           |
| **z-[9999]** | **ポップアップメニュー** | **アバター編集メニュー** |
| z-[10000]    | 緊急通知                 | エラートースト           |

---

## テスト戦略

### ユニットテスト

| 対象           | テストファイル                 | カバー内容                |
| -------------- | ------------------------------ | ------------------------- |
| z-index        | AccountSection.portal.test.tsx | Portal描画、z-indexクラス |
| フォールバック | profileHandlers.test.ts        | エラー検出、代替処理      |
| 状態更新       | authSlice.test.ts              | イベント処理、状態更新    |

### 手動テスト

手動テストチェックリストは `phase-11/manual-test-checklist.md` を参照してください。

---

## トラブルシューティング

### メニューが隠れる場合

1. ブラウザのDevToolsで要素を検査
2. z-indexの値を確認（9999であるべき）
3. Portalがbody直下にレンダリングされているか確認

### 名前変更がエラーになる場合

1. コンソールで警告ログを確認
2. フォールバックが発動しているか確認
3. user_metadataに保存されているか確認

### 連携解除後にUIが更新されない場合

1. AUTH_STATE_CHANGEDイベントが発火しているか確認
2. fetchLinkedProviders()が呼ばれているか確認
3. linkedProviders状態が更新されているか確認

---

## 関連ファイル

| ファイル                                                                  | 役割                     |
| ------------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` | アバター編集メニュー表示 |
| `apps/desktop/src/main/ipc/profileHandlers.ts`                            | プロフィール操作IPC      |
| `apps/desktop/src/renderer/store/slices/authSlice.ts`                     | 認証状態管理             |

---

## まとめ

本タスクで実装された3つの修正は、ユーザー体験を向上させるための重要な改善です：

1. **z-index修正**: メニューが正しく表示されるようになった
2. **フォールバック処理**: エラーなく名前変更ができるようになった
3. **状態更新フロー**: 連携解除後にUIが即座に更新されるようになった

すべての修正は、テストでカバーされ、品質基準を満たしています。
