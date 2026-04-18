# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 4                                             |
| 機能名 | task-ut-rt-01-notify-helper-consolidation-001 |
| 作成日 | 2026-04-18                                    |

## 目的

`notifySkillCreationFailure()` ヘルパーと3箇所の置換動作を検証するテストを作成する。

## テストマトリクス

| テストID | シナリオ                                            | 検証項目                                           | 優先度 |
| -------- | --------------------------------------------------- | -------------------------------------------------- | ------ |
| T-HC-01  | `notifySkillCreationFailure()` が notify を呼び出す | `notify("スキル作成失敗", message)` が呼ばれること | HIGH   |
| T-HC-02  | `notificationService` が未設定の場合                | エラーなく終了すること                             | HIGH   |
| T-HC-03  | `notify()` が例外を投げた場合                       | 例外が外部に漏れないこと                           | HIGH   |
| T-HC-04  | `_executeInternal()` での adapter エラー時          | 既存の通知テストがリグレッションなし               | HIGH   |
| T-HC-05  | `improve()` での adapter エラー時                   | 既存テストがリグレッションなし                     | HIGH   |
| T-HC-06  | `verifyAndImproveLoop()` での adapter エラー時      | 既存テストがリグレッションなし                     | HIGH   |

## テストコードスニペット（T-HC-01）

```typescript
describe("notifySkillCreationFailure() ヘルパー", () => {
  it("T-HC-01: notify('スキル作成失敗', message) を呼び出す", () => {
    const mockNotify = vi.fn();
    const notificationService = { notify: mockNotify };

    const facade = new RuntimeSkillCreatorFacade({
      // ... 最小構成 ...
      notificationService,
    });

    // プライベートメソッドを直接テスト（通知サービス経由）
    (facade as any).notifySkillCreationFailure("テストメッセージ");

    expect(mockNotify).toHaveBeenCalledWith(
      "スキル作成失敗",
      "テストメッセージ",
    );
  });
});
```

## 実行コマンド

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

## 成果物

| 成果物       | 配置先                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------- |
| テストコード | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` |

## 完了条件

- [ ] T-HC-01〜06 が全て作成されている
- [ ] テストが失敗状態（実装前のため正常）
- [ ] Phase 5 開始条件が整っている

## タスク100%実行確認【必須】

Phase 4 完了時に以下を確認すること:

- [ ] T-HC-01〜06 のテストコードを作成した
- [ ] テスト実行コマンドを確認した

## 次Phase

→ [Phase 5: 実装](phase-5-implementation.md)

**Phase 4→5 の遷移条件**: テストコードが作成され、FAIL状態であること
