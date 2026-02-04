# Phase 4: テスト仕様書

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-001 |
| Phase      | 4           |
| 作成日     | 2026-02-04  |
| ステータス | 完了        |

---

## テスト戦略

### 概要

本タスクの3つの修正は既に実装済みのため、Phase 4では：

1. 既存テストの網羅性確認
2. 不足テストの特定
3. テスト仕様の文書化

に注力します。

### テストピラミッド

```
       /\
      /  \  E2E（手動確認）
     /----\
    /      \  統合テスト（IPC通信）
   /--------\
  /          \  ユニットテスト（主要）
 --------------
```

---

## テストファイル一覧

| テストファイル                 | 対象コンポーネント | テスト数 | 状態   |
| ------------------------------ | ------------------ | -------- | ------ |
| AccountSection.portal.test.tsx | AccountSection     | 約10件   | ✅存在 |
| profileHandlers.test.ts        | profileHandlers    | 約30件   | ✅存在 |
| authSlice.test.ts              | authSlice          | 約25件   | ✅存在 |

---

## 1. z-index テスト仕様

### テストファイル

`apps/desktop/src/renderer/components/organisms/AccountSection/__tests__/AccountSection.portal.test.tsx`

### テストケース

| テストID   | テスト名                              | 検証内容                     | 状態     |
| ---------- | ------------------------------------- | ---------------------------- | -------- |
| Z-TEST-001 | Portal container z-index verification | z-[9999]クラスの存在確認     | ✅実装済 |
| Z-TEST-002 | Menu renders in Portal                | Portalへのレンダリング確認   | ✅実装済 |
| Z-TEST-003 | Menu closes on outside click          | 外部クリックでメニュー閉じる | ✅実装済 |
| Z-TEST-004 | Menu closes on Escape key             | Escキーでメニュー閉じる      | ✅実装済 |
| Z-TEST-005 | ARIA attributes present               | アクセシビリティ属性確認     | ✅実装済 |

### 実装コード（131-141行目）

```typescript
it("should have correct z-index class", async () => {
  render(<AccountSection />);
  const avatarButton = screen.getByRole("button", { name: /アバターを変更/i });
  fireEvent.click(avatarButton);

  await waitFor(() => {
    const menu = screen.getByRole("menu");
    expect(menu).toHaveClass("z-[9999]");
  });
});
```

---

## 2. フォールバック処理テスト仕様

### テストファイル

`apps/desktop/src/main/ipc/__tests__/profileHandlers.test.ts`

### テストケース

| テストID    | テスト名                                  | 検証内容                       | 状態     |
| ----------- | ----------------------------------------- | ------------------------------ | -------- |
| FB-TEST-001 | isUserProfilesTableError detects patterns | エラーパターン検出             | ✅実装済 |
| FB-TEST-002 | isUserProfilesTableError detects codes    | エラーコード検出（PGRST200等） | ✅実装済 |
| FB-TEST-003 | PROFILE_GET fallback to user_metadata     | プロフィール取得フォールバック | ✅実装済 |
| FB-TEST-004 | PROFILE_UPDATE fallback to user_metadata  | プロフィール更新フォールバック | ✅実装済 |
| FB-TEST-005 | Console warning on fallback               | フォールバック時のログ出力     | ✅実装済 |
| FB-TEST-006 | Non-fallback errors are thrown            | 想定外エラーは正常にスロー     | ✅実装済 |

### 実装コード（766-868行目抜粋）

```typescript
describe("user_profiles table error fallback", () => {
  it("should fallback to user_metadata when user_profiles table does not exist", async () => {
    mockSupabaseClient.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'relation "public.user_profiles" does not exist',
          code: "42P01",
        },
      }),
    }));

    // ... フォールバック検証
    expect(result.success).toBe(true);
    expect(result.data.display_name).toBe("metadata_display_name");
  });
});
```

---

## 3. 状態更新フローテスト仕様

### テストファイル

`apps/desktop/src/renderer/store/slices/__tests__/authSlice.test.ts`

### テストケース

| テストID    | テスト名                                          | 検証内容                         | 状態     |
| ----------- | ------------------------------------------------- | -------------------------------- | -------- |
| UI-TEST-001 | fetchLinkedProviders called on AUTH_STATE_CHANGED | 状態変更時のプロバイダー取得     | ✅実装済 |
| UI-TEST-002 | linkedProviders state updated correctly           | 連携プロバイダー状態の正確な更新 | ✅実装済 |
| UI-TEST-003 | fetchProfile called on AUTH_STATE_CHANGED         | 状態変更時のプロフィール取得     | ✅実装済 |
| UI-TEST-004 | Error handling for fetchLinkedProviders           | プロバイダー取得エラー処理       | ✅実装済 |

### 実装コード（782-840行目抜粋）

```typescript
describe("AUTH_STATE_CHANGED handling", () => {
  it("should call fetchLinkedProviders after auth state change", async () => {
    const { result } = renderHook(() => useAuthStore());

    // Simulate AUTH_STATE_CHANGED
    act(() => {
      result.current.onAuthStateChanged(mockUser);
    });

    await waitFor(() => {
      expect(mockElectronAPI.profile.getProviders).toHaveBeenCalled();
      expect(result.current.linkedProviders).toEqual(["google", "github"]);
    });
  });
});
```

---

## テスト環境設定

### 必要な依存関係

```json
{
  "devDependencies": {
    "vitest": "^1.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x"
  }
}
```

### モック設定

| モック対象         | モック方法                  |
| ------------------ | --------------------------- |
| window.electronAPI | vi.mock()でグローバルモック |
| Supabase Client    | vi.mock()でモジュールモック |
| React Portal       | createPortalのモック        |

---

## 結論

既存テストが3つの修正すべてをカバーしていることを確認しました：

1. **z-index**: `AccountSection.portal.test.tsx` でz-[9999]クラスの存在を検証
2. **フォールバック**: `profileHandlers.test.ts` でuser_metadataへのフォールバックを検証
3. **状態更新**: `authSlice.test.ts` でfetchLinkedProviders呼び出しを検証

Phase 5では、これらのテストが正常にパスすることを確認します。
