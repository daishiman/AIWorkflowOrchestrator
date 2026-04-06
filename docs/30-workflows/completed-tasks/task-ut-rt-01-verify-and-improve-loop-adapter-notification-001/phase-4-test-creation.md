# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 4                                                              |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

Phase 2 の設計に基づき、`verifyAndImproveLoop()` での `improve()` adapter エラーシナリオのテストを作成する。TDDアプローチで先にテストを作成し、Phase 5 実装の品質基準とする。

## 実行タスク

- Task 4-1: テストマトリクス確定（T-VL-01〜05）
- Task 4-2: テストコード作成
- Task 4-3: テスト実行確認（実装前なのでFAILが期待値）

## 参照資料

| 資料名               | パス                                                                                                | 説明                 |
| -------------------- | --------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 3 成果物       | [phase-3-design-review.md](phase-3-design-review.md)                                                | APPROVED判定の確認   |
| 既存テストファイル   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`   | 既存通知テストの参照 |
| adapter-statusテスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts` | モックパターンの参照 |
| 対象実装ファイル     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               | テスト対象の実装     |

## 実行手順

### Step 1: Task 4-1 テストマトリクス確定

| テストID | シナリオ                                           | 検証項目                                          | 優先度 |
| -------- | -------------------------------------------------- | ------------------------------------------------- | ------ |
| T-VL-01  | `improve()` が `llm_adapter_unavailable` を返す    | `notify("スキル作成失敗", errorMessage)` 呼び出し | HIGH   |
| T-VL-02  | `improve()` が adapter エラー → 戻り値 `errorCode` | `errorCode: "llm_adapter_unavailable"` が含まれる | HIGH   |
| T-VL-03  | `notificationService` が未設定の場合               | エラーなく正常終了する                            | MEDIUM |
| T-VL-04  | `notify()` が例外を投げた場合                      | ループ戻り値に影響しない                          | MEDIUM |
| T-VL-05  | `improve()` が `success: true` の場合              | 通知が呼ばれない（リグレッション確認）            | HIGH   |

### Step 2: Task 4-2 テストコード作成

**テスト対象ファイル**:
`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`
（既存ファイルに追加、または新規作成）

**テストコード参照（T-VL-01の例）**:

```typescript
describe("verifyAndImproveLoop() adapter エラー時の通知", () => {
  it("T-VL-01: improve() が llm_adapter_unavailable を返した場合 notify() を呼び出す", async () => {
    const mockNotify = vi.fn();
    const notificationService = { notify: mockNotify };

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      verificationEngine: createMockVerificationEngine({ hasFailures: true }),
      notificationService,
    });
    facade.setLLMAdapter(createMockAdapter());

    // improve() が adapter エラーを返すようにモック
    vi.spyOn(facade as any, "improve").mockResolvedValueOnce({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "APIキーを設定してください",
      },
    });

    await facade.verifyAndImproveLoop(
      "plan-1",
      "/skills/test",
      "test",
      "api-key",
    );

    expect(mockNotify).toHaveBeenCalledWith(
      "スキル作成失敗",
      "APIキーを設定してください",
    );
  });
});
```

### Step 3: Task 4-3 テスト実行確認

```bash
# テスト実行（実装前なのでFAILが期待値）
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

**期待結果**: T-VL-01〜05が FAIL（実装前のため正常）

## 統合テスト連携【必須】

| 連携アクション         | 内容                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| 統合テストシナリオ作成 | `notify()` 呼び出し → `INotificationService` 契約の検証           |
| モジュール間I/F確認    | `RuntimeSkillCreatorFacade` ↔ `INotificationService` の型契約確認 |

## 成果物

| 成果物                      | 配置先                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| テストマトリクス            | 本ファイル内（上記 Step 1 に記載）                                                                |
| テストコード（T-VL-01〜05） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` |

## 完了条件

- [ ] T-VL-01〜05 のテストが作成されている
- [ ] テストが実行可能（コンパイルエラーなし）
- [ ] 実装前なのでテストが FAIL することを確認済み

## タスク100%実行確認【必須】

Phase 4 完了時に以下を確認すること:

- [ ] Task 4-1（テストマトリクス確定）を完全に実行した
- [ ] Task 4-2（テストコード作成）を完全に実行した
- [ ] Task 4-3（テスト実行確認）を完全に実行した

## 次Phase

→ [Phase 5: 実装](phase-5-implementation.md)

**Phase 4→5 の遷移条件**: T-VL-01〜05 のテストが作成されていること（FAIL状態でOK）
