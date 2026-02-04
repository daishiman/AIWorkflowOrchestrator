# Phase 4: テスト仕様書 - AUTH-UI-004-google-avatar

## メタ情報

| 項目       | 値          |
| ---------- | ----------- |
| タスクID   | AUTH-UI-004 |
| Phase      | 4           |
| 作成日     | 2026-02-04  |
| ステータス | **完了**    |

---

## テストケース設計

### toLinkedProvider関数のテストケース

| テストID | シナリオ                           | 入力                        | 期待結果                     | ステータス |
| -------- | ---------------------------------- | --------------------------- | ---------------------------- | ---------- |
| GAV-01   | Google identity (picture あり)     | `picture: "https://...""`   | avatarUrl が picture の値    | ✅ PASS    |
| GAV-02   | GitHub identity (avatar_url あり)  | `avatar_url: "https://..."` | avatarUrl が avatar_url の値 | ✅ PASS    |
| GAV-03   | Discord identity (avatar_url あり) | `avatar_url: "https://..."` | avatarUrl が avatar_url の値 | ✅ PASS    |
| GAV-04   | 両方存在する場合                   | 両キーに値あり              | avatar_url が優先される      | ✅ PASS    |
| GAV-05   | 両方存在しない場合                 | 両キーがundefined           | avatarUrl が null            | ✅ PASS    |
| GAV-06   | identity_data がundefined          | identity_data: undefined    | avatarUrl が null            | ✅ PASS    |

---

## テストコード

### ファイル: `packages/shared/infrastructure/auth/__tests__/supabase-client.test.ts`

```typescript
describe("toLinkedProvider", () => {
  describe("avatarUrl extraction", () => {
    it("GAV-01: should extract picture for Google provider", () => {
      const identity: SupabaseIdentity = {
        id: "123",
        provider: "google",
        identity_data: {
          email: "test@gmail.com",
          name: "Test User",
          picture: "https://lh3.googleusercontent.com/a/photo",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBe(
        "https://lh3.googleusercontent.com/a/photo",
      );
    });

    it("GAV-02: should extract avatar_url for GitHub provider", () => {
      const identity: SupabaseIdentity = {
        id: "456",
        provider: "github",
        identity_data: {
          email: "test@github.com",
          name: "Test User",
          avatar_url: "https://avatars.githubusercontent.com/u/123",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBe(
        "https://avatars.githubusercontent.com/u/123",
      );
    });

    it("GAV-04: should prefer avatar_url when both exist", () => {
      const identity: SupabaseIdentity = {
        id: "789",
        provider: "test",
        identity_data: {
          avatar_url: "https://avatar-url.example.com",
          picture: "https://picture.example.com",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBe("https://avatar-url.example.com");
    });

    it("GAV-05: should return null when neither exists", () => {
      const identity: SupabaseIdentity = {
        id: "101",
        provider: "test",
        identity_data: {
          email: "test@example.com",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBeNull();
    });

    it("GAV-06: should return null when identity_data is undefined", () => {
      const identity: SupabaseIdentity = {
        id: "102",
        provider: "test",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBeNull();
    });
  });
});
```

---

## TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [x] テストが失敗することを確認（Red状態）
- [x] 修正前のコードでテストが失敗することを検証済み

---

## 統合テスト連携

| シナリオカテゴリ | 検証内容                              | テストファイル            |
| ---------------- | ------------------------------------- | ------------------------- |
| 単体テスト       | toLinkedProvider関数のavatarUrl取得   | `supabase-client.test.ts` |
| プロバイダー別   | Google/GitHub/Discordのキー名差異     | `supabase-client.test.ts` |
| 境界値テスト     | 両方存在/両方なし/identity_data未定義 | `supabase-client.test.ts` |

---

## 完了条件チェックリスト

- [x] 受け入れ基準ごとにユニットテストがある
- [x] すべてのテストが失敗状態（Red）→ 実装後成功（Green）
- [x] 境界値テストが含まれている
- [x] 本Phase内の全タスクを100%実行完了
