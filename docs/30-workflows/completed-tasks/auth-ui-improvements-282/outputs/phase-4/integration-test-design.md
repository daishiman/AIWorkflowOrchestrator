# Phase 4: 統合テスト設計書

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-001 |
| Phase      | 4           |
| 作成日     | 2026-02-04  |
| ステータス | 完了        |

---

## 統合テスト概要

### 目的

Main Process（Electron）とRenderer Process（React）間のIPC通信、およびSupabase Authとの連携を検証します。

### テスト対象レイヤー

```
┌─────────────────────────────────────────────────────────┐
│                    Renderer Process                      │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  AccountSection │───▶│  authSlice (Zustand)        │ │
│  └─────────────────┘    └─────────────────────────────┘ │
│           │                          │                   │
└───────────┼──────────────────────────┼───────────────────┘
            │ window.electronAPI       │
            ▼                          ▼
┌───────────────────────────────────────────────────────────┐
│                     Preload Script                        │
│                  (contextBridge.exposeInMainWorld)        │
└───────────────────────────────────────────────────────────┘
            │ IPC Channels             │
            ▼                          ▼
┌───────────────────────────────────────────────────────────┐
│                      Main Process                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              profileHandlers.ts                      │ │
│  │  - PROFILE_GET                                       │ │
│  │  - PROFILE_UPDATE                                    │ │
│  │  - PROFILE_GET_PROVIDERS                             │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │ Supabase SDK
                           ▼
┌───────────────────────────────────────────────────────────┐
│                     Supabase Auth                         │
│  - auth.getUser()                                         │
│  - auth.updateUser()                                      │
│  - auth.getUserIdentities()                               │
└───────────────────────────────────────────────────────────┘
```

---

## 統合テストシナリオ

### シナリオ1: プロフィール取得フロー（フォールバック付き）

```
[テストシナリオ: INT-001]
前提条件: user_profilesテーブルが存在しない
手順:
  1. RendererからfetchProfile()を呼び出す
  2. MainがPROFILE_GETを処理
  3. user_profilesテーブルへのクエリが失敗
  4. isUserProfilesTableError()がtrueを返す
  5. user_metadataへフォールバック
  6. Rendererに正常レスポンスを返す
期待結果:
  - エラーダイアログが表示されない
  - user_metadataのdisplay_nameがUIに表示される
  - コンソールに警告ログが出力される
```

**テストコード概要:**

```typescript
describe("INT-001: Profile fetch with fallback", () => {
  it("should fallback to user_metadata when user_profiles unavailable", async () => {
    // Arrange: モックでuser_profilesエラーを設定
    mockSupabase.from("user_profiles").mockRejectedValue({
      message: 'relation "public.user_profiles" does not exist',
      code: "42P01",
    });
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { user_metadata: { display_name: "Fallback Name" } } },
    });

    // Act: Rendererからプロフィール取得
    const result = await window.electronAPI.profile.get();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data.display_name).toBe("Fallback Name");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Fallback to user_metadata"),
    );
  });
});
```

---

### シナリオ2: プロフィール更新フロー（フォールバック付き）

```
[テストシナリオ: INT-002]
前提条件: user_profilesテーブルが存在しない
手順:
  1. ユーザーが名前を変更
  2. RendererからupdateProfile()を呼び出す
  3. MainがPROFILE_UPDATEを処理
  4. user_profilesテーブルへの更新が失敗
  5. user_metadataへフォールバック（auth.updateUser）
  6. 更新成功をRendererに返す
期待結果:
  - エラーダイアログが表示されない
  - user_metadataのdisplay_nameが更新される
  - UIに新しい名前が表示される
```

---

### シナリオ3: 連携解除フロー

```
[テストシナリオ: INT-003]
前提条件: Google, GitHubが連携済み
手順:
  1. ユーザーがGoogleの連携解除ボタンをクリック
  2. RendererからunlinkProvider()を呼び出す
  3. Mainがauth.unlinkIdentity()を実行
  4. AUTH_STATE_CHANGEDイベント発火
  5. Rendererがイベントを受信
  6. fetchLinkedProviders()が自動的に呼ばれる
  7. linkedProviders状態が更新される
期待結果:
  - 3秒以内にGoogleが「未連携」表示に変わる
  - リロードなしでUI更新完了
  - GitHubは「連携済み」のまま
```

---

### シナリオ4: z-indexスタッキング確認

```
[テストシナリオ: INT-004]
前提条件: アプリが正常起動
手順:
  1. アバターをクリック
  2. メニューが表示される
  3. サイドバーのz-indexを確認
  4. メニューのz-indexを確認
期待結果:
  - メニューのz-index(9999) > サイドバーのz-index
  - メニューがサイドバーの前面に表示される
```

---

## IPC通信契約

### チャンネル定義

| チャンネル名          | 方向            | ペイロード                    |
| --------------------- | --------------- | ----------------------------- |
| profile:get           | Renderer → Main | { userId: string }            |
| profile:update        | Renderer → Main | { userId, data: ProfileData } |
| profile:get-providers | Renderer → Main | { userId: string }            |
| auth:state-changed    | Main → Renderer | { user: User \| null }        |

### レスポンス形式

```typescript
interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
```

---

## モック戦略

### Supabaseモック

```typescript
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    updateUser: vi.fn(),
    getUserIdentities: vi.fn(),
    unlinkIdentity: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
};
```

### Electron APIモック

```typescript
const mockElectronAPI = {
  profile: {
    get: vi.fn(),
    update: vi.fn(),
    getProviders: vi.fn(),
  },
  auth: {
    onStateChanged: vi.fn(),
  },
};

vi.stubGlobal("window", {
  electronAPI: mockElectronAPI,
});
```

---

## テスト実行環境

### 必要条件

- Node.js 18+
- pnpm
- Vitest

### 実行コマンド

```bash
# 統合テストのみ実行
pnpm --filter @repo/desktop test --grep "INT-"

# 全テスト実行
pnpm --filter @repo/desktop test

# ウォッチモード
pnpm --filter @repo/desktop test --watch
```

---

## 結論

統合テスト設計により、以下の検証が可能になります：

1. **IPC通信の正確性**: Main-Renderer間のデータフロー
2. **フォールバック機能**: user_profilesエラー時の代替処理
3. **状態同期**: AUTH_STATE_CHANGED後のUI更新
4. **z-indexスタッキング**: コンポーネント間の重なり順序

既存のテストコードでこれらのシナリオがカバーされていることを確認しました。
