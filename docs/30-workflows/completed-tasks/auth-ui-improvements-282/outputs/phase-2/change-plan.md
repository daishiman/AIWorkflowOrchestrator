# Phase 2: 変更計画

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-001 |
| Phase      | 2           |
| 作成日     | 2026-02-04  |
| ステータス | 完了        |

---

## 変更計画概要

### 実装状況

コード調査の結果、**3つの修正すべてが既に実装済み**であることを確認しました。

---

## 変更詳細

### 1. z-index修正（実装済み）

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` |
| 変更箇所 | 501行目                                                                   |
| 変更前   | （記録なし - 既に修正済み）                                               |
| 変更後   | `z-[9999]`                                                                |
| 実装状況 | ✅ 完了                                                                   |

**確認コード（501行目）:**

```tsx
className =
  "fixed w-48 bg-[var(--bg-secondary)] border border-white/10 rounded-lg shadow-lg z-[9999]";
```

---

### 2. フォールバック処理（実装済み）

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| ファイル | `apps/desktop/src/main/ipc/profileHandlers.ts`  |
| 変更箇所 | 66-85行目（共通関数）、183-206行目、318-366行目 |
| 実装状況 | ✅ 完了                                         |

**確認コード（66-85行目）:**

```typescript
function isUserProfilesTableError(error: {
  message: string;
  code?: string;
}): boolean {
  const errorPatterns = [
    "schema cache",
    "does not exist",
    "user_profiles",
    "relation",
    "column",
    "notification_settings",
  ];
  const errorCodes = ["PGRST200", "PGRST116", "42P01", "42703"];

  return (
    errorPatterns.some((pattern) =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    ) || errorCodes.includes(error.code ?? "")
  );
}
```

**フォールバック適用箇所:**

- PROFILE_GET: 183-206行目
- PROFILE_UPDATE: 318-366行目
- PROFILE_UPDATE_NOTIFICATIONS: 959-1010行目
- PROFILE_EXPORT: 1222-1236行目
- PROFILE_IMPORT: 1391-1432行目
- PROFILE_DELETE: 686-698行目

---

### 3. 状態更新フロー（実装済み）

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/store/slices/authSlice.ts` |
| 変更箇所 | 342-345行目                                           |
| 実装状況 | ✅ 完了                                               |

**確認コード（342-345行目）:**

```typescript
// Refresh profile and linked providers after auth state change
// (連携解除時などにUIを即座に更新するため)
get().fetchProfile();
get().fetchLinkedProviders();
```

---

## テスト計画

既存実装の検証として、以下のテストを確認・拡充する必要があります:

### ユニットテスト

| テストファイル                | 対象機能                     | 優先度 |
| ----------------------------- | ---------------------------- | ------ |
| AccountSection/index.test.tsx | z-index適用確認              | 高     |
| profileHandlers.test.ts       | フォールバック処理           | 高     |
| authSlice.test.ts             | fetchLinkedProviders呼び出し | 高     |

### 統合テスト

| テストシナリオ                     | 検証内容                  |
| ---------------------------------- | ------------------------- |
| 名前変更→フォールバック→成功       | user_metadataへの正常保存 |
| 連携解除→AUTH_STATE_CHANGED→UI更新 | linkedProvidersの即時更新 |
| アバターメニュー表示→z-index確認   | メニューが最前面に表示    |

---

## 今後のPhaseでの確認事項

| Phase   | 確認事項                                       |
| ------- | ---------------------------------------------- |
| Phase 4 | 既存テストの確認、不足テストの追加             |
| Phase 5 | 実装は完了済みのため、テスト通過を確認         |
| Phase 6 | カバレッジ向上のための追加テスト               |
| Phase 7 | カバレッジ基準達成確認                         |
| Phase 9 | 品質ゲート（Lint、型チェック、テスト）通過確認 |
