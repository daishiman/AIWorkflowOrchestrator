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

| 項目     | 内容                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| テスト名 | `handlePrepare does not call auth:login during skill generation`                                                                |
| 対象     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の `handlePrepare`                                         |
| 前提条件 | ユーザーはログイン済み状態                                                                                                      |
| 操作     | `SkillLifecyclePanel` を render し、依頼文を入力して `skill-lifecycle-prepare-button` を押下する                                |
| 期待結果 | `window.electronAPI.auth.login` が呼ばれないこと。`detectMode` が 1 回だけ呼ばれ、モード表示が `直作成` になること              |
| 確認方法 | `vi.fn()` で `auth.login` / `detectMode` / `planSkill` をモックし、呼び出し回数と `skill-lifecycle-mode-label` の更新を監視する |

```typescript
// テスト例（骨格）
it("スキル生成フローで auth:login が呼ばれないこと", async () => {
  render(
    <SkillLifecyclePanel isOpen={true} onClose={vi.fn()} defaultTab="create" />,
  );
  fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), {
    target: { value: "テスト用スキルを作成してください" },
  });
  fireEvent.click(screen.getByTestId("skill-lifecycle-prepare-button"));
  await waitFor(() => {
    expect(mockDetectMode).toHaveBeenCalledTimes(1);
  });
  expect(screen.getByTestId("skill-lifecycle-mode-label")).toHaveTextContent(
    "直作成",
  );
  expect(mockPlanSkill).not.toHaveBeenCalled();
  expect(mockAuthLogin).not.toHaveBeenCalled();
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

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| テスト名 | `skill generation completes without auth:login timeout`                                      |
| 対象     | スキル生成フロー全体（E2E または統合テスト）                                                 |
| 前提条件 | ユーザーはログイン済み状態・有効な API キーが設定されている                                  |
| 操作     | スキル生成ボタンを押下                                                                       |
| 期待結果 | `auth.login` が呼ばれず、`detectMode` の結果として `直作成` が表示されること                 |
| 確認方法 | `auth.login` を永続 pending にしても `skill-lifecycle-mode-label` が更新されることを確認する |

### TC-04: authSlice の login() がデバッグコード除去後も正常に動作すること

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| テスト名 | `authSlice.login thunk works correctly after debug cleanup`              |
| 対象     | `apps/desktop/src/renderer/store/slices/authSlice.ts`                    |
| 前提条件 | `[TEMP DEBUG]` コードが除去されていること                                |
| 操作     | `login()` thunk を dispatch する                                         |
| 期待結果 | 正常に IPC を呼び出し、`console.trace` は発火しないこと                  |
| 確認方法 | `auth:login` IPC モックの呼び出し確認と `console.trace` の未呼び出し確認 |

## テスト実行方法

```bash
# 関連テストのみ実行
pnpm --filter @repo/desktop test:run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 全体テスト実行
pnpm vitest run
```

## 参照資料

| 資料名   | パス                                                                 | 説明                 |
| -------- | -------------------------------------------------------------------- | -------------------- |
| 調査要件 | `phase-1-requirements.md`                                            | FR-3, FR-4           |
| 調査設計 | `phase-2-design.md`                                                  | 修正パターン         |
| 実装対象 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 実際の回帰テスト対象 |

## 成果物

| 成果物     | パス                       | 説明       |
| ---------- | -------------------------- | ---------- |
| テスト仕様 | `phase-4-test-creation.md` | 本ファイル |

補足:

- 実行結果の証跡は Phase 6 の `outputs/phase-6/regression-test-result.md` に集約する

## 完了条件

- [ ] TC-01〜TC-04 のテストケースが定義されている
- [ ] 各テストケースに前提条件・操作・期待結果が明記されている
- [ ] テスト実行コマンドが定義されている
- [ ] Phase 5 実行前に Red テスト（TC-01）が失敗することを確認する手順が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
