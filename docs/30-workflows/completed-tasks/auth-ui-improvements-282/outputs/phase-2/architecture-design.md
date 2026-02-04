# Phase 2: アーキテクチャ設計書

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-001 |
| Phase      | 2           |
| 作成日     | 2026-02-04  |
| ステータス | 完了        |

---

## z-index階層設計

### 全体z-index階層定義

アプリ全体で一貫したz-index階層を定義（ui-ux-portal-patterns.md準拠）:

| z-index値    | 用途                                   | 対象コンポーネント例               |
| ------------ | -------------------------------------- | ---------------------------------- |
| z-0          | 通常のコンテンツ                       | メインコンテンツエリア             |
| z-10         | 浮遊要素（カード等）                   | カード、パネル                     |
| z-50         | ドロップダウン・ポップオーバー（既存） | 通常のドロップダウン               |
| **z-[100]**  | **ダイアログ・モーダル**               | **確認ダイアログ（既存）**         |
| **z-[9999]** | **ポップアップメニュー・ツールチップ** | **アバター編集メニュー（実装済）** |
| z-[10000]    | 緊急通知・トースト                     | エラートースト                     |

### 実装状況確認

`AccountSection/index.tsx:501行目`を確認した結果:

```tsx
className =
  "fixed w-48 bg-[var(--bg-secondary)] border border-white/10 rounded-lg shadow-lg z-[9999]";
```

**→ z-[9999]は既に実装済み**

---

## フォールバック処理設計

### エラー検出ロジック

`profileHandlers.ts:66-85行目`の`isUserProfilesTableError`関数:

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

**→ フォールバック処理は既に実装済み**

### フォールバック処理フロー

```
user_profiles取得試行
    ↓
エラー発生?
    ├─ Yes → isUserProfilesTableError(error)?
    │           ├─ Yes → user_metadataにフォールバック
    │           │         └─ コンソールに警告ログ出力
    │           └─ No  → エラーをスロー
    └─ No  → 正常データ返却
```

---

## 状態更新フロー設計

### onAuthStateChanged内の処理

`authSlice.ts:342-345行目`を確認した結果:

```typescript
// Refresh profile and linked providers after auth state change
// (連携解除時などにUIを即座に更新するため)
get().fetchProfile();
get().fetchLinkedProviders();
```

**→ fetchLinkedProviders()呼び出しは既に実装済み**

### データフロー図

```
Supabase Auth
    ↓ AUTH_STATE_CHANGED
Main Process (profileHandlers.ts)
    ↓ IPC: auth:state-changed
Renderer Process (authSlice.ts)
    ↓ onAuthStateChanged
    ├─ fetchProfile()（実装済み）
    └─ fetchLinkedProviders()（実装済み）
        ↓ IPC: profile:get-providers
    Main Process
        ↓ Supabase getUserIdentities()
    Renderer Process
        ↓ setLinkedProviders(providers)
    UI更新
```

---

## 統合ポイント設計

| 統合ポイント      | 契約定義                                                      |
| ----------------- | ------------------------------------------------------------- |
| Renderer→Main IPC | PROFILE_GET, PROFILE_UPDATE, PROFILE_GET_PROVIDERS            |
| Main→Supabase     | supabase.auth.updateUser(), supabase.auth.getUserIdentities() |
| Main→Renderer     | AUTH_STATE_CHANGED event                                      |

---

## アーキテクチャ層別設計

| 層                         | 設計内容                                           | 実装状況 |
| -------------------------- | -------------------------------------------------- | -------- |
| フロントエンド（Renderer） | z-index階層遵守、authSlice状態監視                 | ✅完了   |
| バックエンド（Main）       | isUserProfilesTableError()共通関数、フォールバック | ✅完了   |
| IPC通信                    | 既存チャンネル活用、エラーレスポンス統一           | ✅完了   |
| 状態管理                   | authSlice拡張（fetchLinkedProviders連動）          | ✅完了   |

---

## 変更対象ファイルサマリー

| ファイル                 | 変更内容                       | 実装状況 |
| ------------------------ | ------------------------------ | -------- |
| AccountSection/index.tsx | z-50 → z-[9999]に変更          | ✅完了   |
| profileHandlers.ts       | エラー検出条件の追加           | ✅完了   |
| authSlice.ts             | fetchLinkedProviders()呼び出し | ✅完了   |

---

## 結論

コード調査の結果、**3つの修正すべてが既に実装済み**であることが確認されました:

1. **z-index修正**: `z-[9999]`が適用済み
2. **フォールバック処理**: `isUserProfilesTableError`関数と関連処理が実装済み
3. **状態更新フロー**: `fetchLinkedProviders()`が`onAuthStateChanged`内で呼び出し済み

Phase 4以降では、これらの実装が正しく動作することを検証するテストの作成・確認に注力します。
