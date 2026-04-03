# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 6                                        |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 0.5h                                     |

## 目的

AC-6・AC-7 に対応する追加テスト（TC-B-04・TC-B-05）を `beforeQuitGuard.test.ts` に追加し、カバレッジ目標を達成する。

## 実行タスク

1. `beforeQuitGuard.test.ts` に TC-B-04・TC-B-05 を追加
2. 全テスト（TC-B-01〜TC-B-05, TC-F-04〜TC-F-08）が Green になることを確認
3. カバレッジレポートを取得して記録

## 参照資料

| 参照資料               | パス                                                                                              | 用途               |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 5 実装記録       | `phase-5-implementation.md`                                                                       | 実装不要方針の確認 |
| beforeQuitGuard テスト | `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                     | 追加ケースの配置先 |
| Facade 既存テスト      | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | Green 状態確認     |

## 追加テストケース設計

### TC-B-04: response=0 時に app.exit(0) が呼ばれる（AC-6）

```typescript
it("TC-B-04: app.exit(0) is called when user selects '中断して終了'", async () => {
  const mockApp = createMockApp();
  const mockDialog = {
    showMessageBox: vi.fn().mockResolvedValue({ response: 0 }), // 「中断して終了」
  };
  const mockFacade = { hasRunningExecution: vi.fn().mockReturnValue(true) };

  registerBeforeQuitGuard({
    app: mockApp as never,
    dialog: mockDialog as never,
    facade: mockFacade as never,
  });

  const mockEvent = { preventDefault: vi.fn() };
  mockApp.emit("before-quit", mockEvent);

  // dialog の Promise 解決を待つ
  await Promise.resolve();

  expect(mockApp.exit).toHaveBeenCalledWith(0);
});
```

### TC-B-05: dialog.showMessageBox が reject した場合に console.warn が呼ばれる（AC-7）

```typescript
it("TC-B-05: console.warn is called when showMessageBox rejects", async () => {
  const mockApp = createMockApp();
  const mockDialog = {
    showMessageBox: vi.fn().mockRejectedValue(new Error("dialog error")),
  };
  const mockFacade = { hasRunningExecution: vi.fn().mockReturnValue(true) };
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  registerBeforeQuitGuard({
    app: mockApp as never,
    dialog: mockDialog as never,
    facade: mockFacade as never,
  });

  const mockEvent = { preventDefault: vi.fn() };
  mockApp.emit("before-quit", mockEvent);

  await Promise.resolve();

  expect(warnSpy).toHaveBeenCalledWith(
    expect.stringContaining("beforeQuitGuard"),
    expect.any(Error),
  );
  warnSpy.mockRestore();
});
```

## テスト実行

```bash
# beforeQuitGuard テスト（追加分含む）
pnpm --filter @repo/desktop test \
  apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts

# カバレッジ付き実行
pnpm --filter @repo/desktop test --coverage \
  apps/desktop/src/main/ipc/beforeQuitGuard.ts
```

## 成果物

| 成果物                | パス                                       | 説明                 |
| --------------------- | ------------------------------------------ | -------------------- |
| test-expansion-report | `outputs/phase-6/test-expansion-report.md` | 追加テスト結果の記録 |

## 統合テスト連携

- TC-B-04 / TC-B-05 は beforeQuitGuard の単体テストとして実行する
- Phase 11 の手動テストで実アプリ動作を補完する

## 完了条件

- [ ] TC-B-04・TC-B-05 を `beforeQuitGuard.test.ts` に追加
- [ ] 全テスト（TC-B-01〜TC-B-05, TC-F-04〜TC-F-08）が Green
- [ ] `beforeQuitGuard.ts` のカバレッジ 100%（分岐含む）を確認
- [ ] `outputs/phase-6/test-expansion-report.md` に結果記録

## タスク 100% 実行確認【必須】

- [ ] 追加テストケース 2 件（TC-B-04〜TC-B-05）を実装した
- [ ] 全テストが Green であることを確認した
- [ ] カバレッジ結果を記録した

## 次 Phase

Phase 6 完了後、Phase 7（カバレッジ確認）に進む。
