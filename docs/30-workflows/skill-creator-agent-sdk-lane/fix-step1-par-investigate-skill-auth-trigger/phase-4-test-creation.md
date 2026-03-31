# Phase 4: テスト仕様作成

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 4                         |
| 機能名 | TASK-TRACE-SKILL-AUTH-001 |
| 作成日 | 2026-04-01                |

## 目的

スキル生成フローが `auth:login` を呼ばないことを確認するテスト仕様を定義する。
Phase 5（調査実行+修正）の前にテストを定義することで、Red → Green の TDD サイクルを確立する。

## テスト方針

このタスクは調査・修正タスクのため、以下の2種類のテストを定義する:

1. **回帰テスト**: 修正前に RED になり、修正後に GREEN になるテスト
2. **正常系テスト**: 既存の `auth:login` の正当な呼び出し（AccountSection等）が壊れていないことを確認するテスト

## テストケース一覧

### TC-01: スキル生成ボタン押下で auth:login が呼ばれないこと（回帰テスト）

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| テスト名 | `handlePrepare does not dispatch auth/login during skill generation`      |
| 対象     | `apps/desktop/src/renderer/store/slices/agentSlice.ts` の `handlePrepare` |
| 前提条件 | ユーザーはログイン済み状態                                                |
| 操作     | スキル生成のための `handlePrepare` または同等の thunk を dispatch する    |
| 期待結果 | `auth/login` アクションが dispatch されないこと                           |
| 確認方法 | `jest.spyOn` または Vitest の `vi.spyOn` で dispatch を監視する           |

```typescript
// テスト例（骨格）
it("スキル生成フローで auth/login が dispatch されないこと", async () => {
  const mockDispatch = vi.fn();
  // ... セットアップ
  await handlePrepare(/* args */)(mockDispatch, getState, extra);
  const loginActions = mockDispatch.mock.calls.filter(
    ([action]) =>
      action.type === "auth/login" || action.type?.startsWith?.("auth/login"),
  );
  expect(loginActions).toHaveLength(0);
});
```

### TC-02: AccountSection から auth:login が正常に呼ばれること（正常系テスト）

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| テスト名 | `AccountSection triggers auth:login on demand`     |
| 対象     | AccountSection コンポーネント                      |
| 前提条件 | ユーザーは未ログイン状態                           |
| 操作     | ログインボタンをクリック                           |
| 期待結果 | `auth:login` IPC が呼ばれること                    |
| 確認方法 | `window.electronAPI.auth.login` のモックを確認する |

### TC-03: 修正後にスキル生成フローが正常に動作すること（回帰テスト）

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| テスト名 | `skill generation completes without auth:login timeout`     |
| 対象     | スキル生成フロー全体（E2E または統合テスト）                |
| 前提条件 | ユーザーはログイン済み状態・有効な API キーが設定されている |
| 操作     | スキル生成ボタンを押下                                      |
| 期待結果 | エラーなくスキル生成が完了すること                          |
| 確認方法 | タイムアウトエラーが発生しないこと                          |

### TC-04: authSlice の login() がデバッグコード除去後も正常に動作すること

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| テスト名 | `authSlice.login thunk works correctly after debug cleanup` |
| 対象     | `apps/desktop/src/renderer/store/slices/authSlice.ts`       |
| 前提条件 | `[TEMP DEBUG]` コードが除去されていること                   |
| 操作     | `login()` thunk を dispatch する                            |
| 期待結果 | 正常に IPC を呼び出し、結果を返すこと                       |
| 確認方法 | `auth:login` IPC モックの呼び出し確認                       |

## テスト実行方法

```bash
# 関連テストのみ実行
pnpm --filter @repo/desktop test -- --grep "auth:login"

# agentSlice テスト実行
pnpm --filter @repo/desktop test -- agentSlice

# 全体テスト実行
pnpm vitest run
```

## 参照資料

| 資料名   | パス                      | 説明         |
| -------- | ------------------------- | ------------ |
| 調査要件 | `phase-1-requirements.md` | FR-3, FR-4   |
| 調査設計 | `phase-2-design.md`       | 修正パターン |

## 成果物

| 成果物         | パス                       | 説明                 |
| -------------- | -------------------------- | -------------------- |
| テスト仕様     | `phase-4-test-creation.md` | 本ファイル           |
| Red テスト結果 | `red-test-result.md`       | Phase 5 実行後に作成 |

## 完了条件

- [ ] TC-01〜TC-04 のテストケースが定義されている
- [ ] 各テストケースに前提条件・操作・期待結果が明記されている
- [ ] テスト実行コマンドが定義されている
- [ ] Phase 5 実行前に Red テスト（TC-01）が失敗することを確認する手順が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
