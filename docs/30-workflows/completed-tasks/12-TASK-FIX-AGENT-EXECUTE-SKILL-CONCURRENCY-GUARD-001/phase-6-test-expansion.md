# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 6                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 5の実装に対して、カバレッジ不足箇所のテストを追加する。境界値テスト、エラーパス、結合テストを追加してテスト網羅性を向上させる。

## 実行タスク

- 境界値テスト追加: ガードのタイミング境界（isExecuting がtrueになる直前/直後）のテストを追加
- エラーパステスト追加: executeSkillがエラーで終了した後にisExecutingがfalseに戻ることを検証
- 結合テスト追加: Store層ガード + UI層disabledの連携動作を検証

## 参照資料

| 資料名                         | パス                                                                                                                | 説明                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 4 テスト設計             | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md`  | 既存テストケース定義     |
| Phase 5 実装                   | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-5-implementation.md` | 実装詳細                 |
| agentSlice実装                 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                              | テスト対象（L742-797）   |
| preflight テスト               | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.executeSkill.preflight.test.ts`                        | IPC モックパターン参考   |
| skill listener                 | `apps/desktop/src/renderer/store/setupSkillListeners.ts`                                                            | 完了・エラーイベント復元 |
| 品質要件                       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                         | coverage /回帰基準       |
| fixture 指針                   | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`                                             | モック再利用             |
| Store層ガードテスト T-01〜T-05 | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`                             | Phase 4 成果物           |

### 前提Phase成果物

| 資料名           | パス                                                                                                                | 用途                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件     | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md`   | 受入基準 AC-01〜AC-06    |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md`         | ガード設計詳細           |
| Phase 3 レビュー | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-3-design-review.md`  | 設計レビュー結果（PASS） |
| Phase 4 テスト   | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md`  | テストケース T-01〜T-08  |
| Phase 5 実装     | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-5-implementation.md` | 実装詳細                 |

## 実行手順

### ステップ1: カバレッジ現状確認

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

カバレッジ不足箇所を特定し、以下の追加テストで補完する。

### ステップ2: 追加テストケース

| テストID | テスト内容                                                       | テスト種別 |
| -------- | ---------------------------------------------------------------- | ---------- |
| T-09     | executeSkillがエラーで終了した後、isExecutingがfalseに戻る       | エラーパス |
| T-10     | executeSkill完了後に再度executeSkillを呼ぶと正常に実行される     | 状態遷移   |
| T-11     | selectedSkillNameが未設定の場合、isExecutingガード前にreturnする | 境界値     |
| T-12     | 3回連続呼び出しで2回目と3回目がガードされる                      | 連続操作   |

### ステップ2-B: 拡充方針

- Store 層の新規変更点は小さいため、拡充は「未到達分岐の補完」と「状態復元経路の確認」に集中する
- `setupSkillListeners.ts` の `_handleComplete` / `_handleError` 連携を前提に、完了後・失敗後の再実行可能性を重点確認する
- `testing-fixtures.md` に従い、新しい専用 fixture を増やさず既存の store/electronAPI モックを継続利用する

### ステップ3: テストコードの追加

**配置先:** `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts` に追記

**テストコード例（createStore + electronAPI モックパターン）:**

```typescript
describe("executeSkill concurrency guard - extended", () => {
  it("T-09: executeSkill がエラーで終了した後、isExecuting が false に戻る", async () => {
    // IPC呼び出しがエラーを返すよう electronAPI をモック
    const executeMock = vi.fn().mockRejectedValue(new Error("IPC error"));
    Object.defineProperty(window, "electronAPI", {
      configurable: true,
      value: {
        authKey: { exists: vi.fn().mockResolvedValue({ exists: true }) },
        skill: { execute: executeMock },
      },
    });

    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    await store.getState().executeSkill("hello");

    // エラー後に isExecuting が false に戻ることを検証
    expect(store.getState().isExecuting).toBe(false);
    // skillExecutionStatus が "error" であることを検証
    expect(store.getState().skillExecutionStatus).toBe("error");
  });

  it("T-10: executeSkill 完了後に再度 executeSkill を呼ぶと正常に実行される", async () => {
    const executeMock = vi.fn().mockResolvedValue({ executionId: "exec-1" });
    mockElectronAPI(executeMock);
    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    // 1回目の実行・完了
    await store.getState().executeSkill("first");
    // isExecuting が false に戻った状態で
    // 2回目の実行
    await store.getState().executeSkill("second");

    // 2回目も正常に実行されたことを検証
    expect(executeMock).toHaveBeenCalledTimes(2);
  });

  it("T-11: selectedSkillName 未設定の場合、isExecuting ガード前に return する", async () => {
    const executeMock = vi.fn();
    mockElectronAPI(executeMock);
    const store = createStore();
    // selectedSkillName を設定しない

    await store.getState().executeSkill("hello");

    // selectedSkillName チェックで return し、execute は呼ばれない
    expect(executeMock).not.toHaveBeenCalled();
    // isExecuting は false のまま
    expect(store.getState().isExecuting).toBe(false);
  });

  it("T-12: 3回連続呼び出しで2回目と3回目がガードされる", async () => {
    const executeMock = vi.fn().mockResolvedValue({ executionId: "exec-1" });
    mockElectronAPI(executeMock);
    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    // 3回連続呼び出し（await せずに並行実行）
    const p1 = store.getState().executeSkill("first");
    const p2 = store.getState().executeSkill("second");
    const p3 = store.getState().executeSkill("third");
    await Promise.all([p1, p2, p3]);

    // execute は1回のみ呼ばれる（2回目・3回目はガード）
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "first" }),
    );
  });
});
```

### ステップ4: 追加テスト実行確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

- T-09〜T-12が全てPASSすることを確認

## 統合テスト連携（Phase 1〜11は必須）

- T-10（実行完了後の再実行）は実際のライフサイクルを検証する結合テスト的性質を持つ
- T-12（3回連続呼び出し）は負荷テスト的な観点を含む
- listener を直接発火させるテスト、または同等の復元経路を観測できる結合テストを追加し、完了・失敗通知後に `isExecuting` が解放されることを検証する

## 成果物

| 成果物           | パス                                                                                                                | 説明             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------- |
| テスト拡充仕様書 | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-6-test-expansion.md` | 本ドキュメント   |
| 拡充テスト       | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`                             | 追加テストケース |

## 完了条件

- [ ] T-09〜T-12の追加テストコードが作成されている
- [ ] 追加テストが全てPASSしている
- [ ] 既存テスト（T-01〜T-08含む）に回帰がないことを確認済み
- [ ] listener 復元経路または同等の状態復元観点がテストへ反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認
