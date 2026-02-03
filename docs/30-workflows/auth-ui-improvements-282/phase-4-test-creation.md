# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 4                        |
| 機能名 | auth-ui-improvements-282 |
| 作成日 | 2026-02-04               |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

---

## 実行タスク

### Task 1: z-indexテスト作成（T-04-1）

#### テストファイル

`apps/desktop/src/renderer/components/organisms/AccountSection/index.test.tsx`

#### テストケース

| テストID | テスト名                                       | 検証内容                                 |
| -------- | ---------------------------------------------- | ---------------------------------------- |
| Z-UT-001 | アバターメニューがz-[9999]クラスを持つ         | メニュー開時にz-[9999]クラスが適用される |
| Z-UT-002 | アバターメニューがポップアップとして表示される | absoluteポジショニングが正しく適用される |

#### テストコード例

```typescript
describe("AccountSection - Avatar Menu", () => {
  it("should render avatar menu with z-[9999] when open", async () => {
    // Arrange: 認証済み状態でセットアップ
    // Act: アバターボタンをクリック
    // Assert: メニューがz-[9999]クラスを持つ
  });
});
```

---

### Task 2: フォールバックテスト作成（T-04-2）

#### テストファイル

`apps/desktop/src/main/ipc/profileHandlers.test.ts`

#### テストケース

| テストID  | テスト名                                    | 検証内容                                      |
| --------- | ------------------------------------------- | --------------------------------------------- |
| FB-UT-001 | user_profiles含むエラーでフォールバック     | エラーメッセージにuser_profilesが含まれる場合 |
| FB-UT-002 | relation含むエラーでフォールバック          | エラーメッセージにrelationが含まれる場合      |
| FB-UT-003 | PGRST116コードでフォールバック              | エラーコードがPGRST116の場合                  |
| FB-UT-004 | フォールバック成功時にuser_metadataから取得 | displayNameがuser_metadataから返される        |
| FB-UT-005 | 想定外エラーではフォールバックしない        | 他のエラーは通常通りスロー                    |

#### テストコード例

```typescript
describe("profileHandlers - fallback to user_metadata", () => {
  it("should fallback when error contains 'user_profiles'", async () => {
    // Arrange: user_profilesエラーをモック
    // Act: プロフィール取得を実行
    // Assert: フォールバック成功、displayNameが返される
  });

  it("should fallback when error code is PGRST116", async () => {
    // Arrange: PGRST116エラーをモック
    // Act: プロフィール取得を実行
    // Assert: フォールバック成功
  });
});
```

---

### Task 3: 状態更新テスト作成（T-04-3）

#### テストファイル

`apps/desktop/src/renderer/store/slices/authSlice.test.ts`

#### テストケース

| テストID  | テスト名                                             | 検証内容                           |
| --------- | ---------------------------------------------------- | ---------------------------------- |
| UI-UT-001 | AUTH_STATE_CHANGED時にfetchLinkedProvidersが呼ばれる | ユーザー認証時にプロバイダー再取得 |
| UI-UT-002 | linkedProvidersが更新される                          | 状態が正しく更新される             |
| UI-UT-003 | 未認証時はfetchLinkedProvidersが呼ばれない           | ログアウト時は呼ばない             |

#### テストコード例

```typescript
describe("authSlice - onAuthStateChanged", () => {
  it("should call fetchLinkedProviders when auth state changes with user", async () => {
    // Arrange: fetchLinkedProvidersをスパイ
    // Act: AUTH_STATE_CHANGEDをシミュレート
    // Assert: fetchLinkedProvidersが呼ばれる
  });

  it("should not call fetchLinkedProviders when user is null", async () => {
    // Arrange: 未認証状態
    // Act: AUTH_STATE_CHANGEDをシミュレート
    // Assert: fetchLinkedProvidersが呼ばれない
  });
});
```

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                  | テストファイル    |
| ------------------ | ----------------------------------------- | ----------------- |
| IPC通信テスト      | PROFILE_GET/UPDATEの正常・異常系          | `*.ipc.test.ts`   |
| データフローテスト | Supabase→Main→Renderer→UIの往復           | `*.flow.test.ts`  |
| エラーハンドリング | フォールバック発生時のUI状態              | `*.error.test.ts` |
| 状態同期テスト     | AUTH_STATE_CHANGED後のlinkedProviders更新 | `*.sync.test.ts`  |

---

## アーキテクチャ層別テスト

| 層               | テスト観点                      | テストファイル配置                             |
| ---------------- | ------------------------------- | ---------------------------------------------- |
| Renderer Process | UIコンポーネント、z-index       | `apps/desktop/src/renderer/**/*.test.tsx`      |
| Main Process     | profileHandlers、フォールバック | `apps/desktop/src/main/**/*.test.ts`           |
| Store            | authSlice、状態更新             | `apps/desktop/src/renderer/store/**/*.test.ts` |

---

## TDD検証: Red状態確認

```bash
# テスト実行
pnpm --filter @repo/desktop test:run src/renderer/components/organisms/AccountSection
pnpm --filter @repo/desktop test:run src/main/ipc/profileHandlers.test.ts
pnpm --filter @repo/desktop test:run src/renderer/store/slices/authSlice.test.ts

# 確認項目
# - [ ] すべてのテストが失敗することを確認（Red状態）
```

---

## 参照資料

| 資料名        | パス                                               | 説明         |
| ------------- | -------------------------------------------------- | ------------ |
| Phase 1成果物 | `outputs/phase-1/`                                 | 要件定義     |
| Phase 2成果物 | `outputs/phase-2/`                                 | 設計書       |
| Phase 3成果物 | `outputs/phase-3/`                                 | レビュー結果 |
| テスト戦略    | `aiworkflow-requirements: quality-requirements.md` | テスト指針   |

---

## 成果物

| 成果物             | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テスト設計     |
| テストケース一覧   | `outputs/phase-4/test-cases.md`              | ケース一覧     |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | 統合テスト設計 |
| テストファイル     | `apps/desktop/src/**/*.test.ts(x)`           | テストコード   |

---

## 完了条件

- [ ] z-indexテストが作成されている（2ケース以上）
- [ ] フォールバックテストが作成されている（5ケース以上）
- [ ] 状態更新テストが作成されている（3ケース以上）
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 5: 実装（TDD: Green）
