# Phase 4 成果物: テストマトリクス

## 既存テスト確認

| テストファイル                      | 件数                    | 確認結果                               |
| ----------------------------------- | ----------------------- | -------------------------------------- |
| `ImprovementProposalPanel.test.tsx` | 8件 (P-1〜P-8)          | 既存テストあり、モック更新が必要       |
| `GovernanceSummaryPanel.test.tsx`   | 14件 (TC-R-01〜TC-R-14) | 既存テストあり、setupMockApi更新が必要 |

## Task 1: ImprovementProposalPanel テストケース

### 移行検証テスト（新規追加: TC-IPP-MIG-01）

```typescript
describe("ImprovementProposalPanel - IPC経路移行検証", () => {
  it("TC-IPP-MIG-01: window.skillCreatorAPI.applyRuntimeImprovement が呼ばれる（electronAPIではない）", async () => {
    const mockSkillCreatorAPI = vi
      .fn()
      .mockResolvedValue({ success: true, data: mockApplyResult });
    Object.defineProperty(window, "skillCreatorAPI", {
      value: { applyRuntimeImprovement: mockSkillCreatorAPI },
      writable: true,
      configurable: true,
    });
    // electronAPI.skillCreator は設定しない → 呼ばれないことを検証
    // 改善適用後 skillCreatorAPI 経由で呼ばれることを確認
  });
});
```

### 既存テスト更新方針

- `beforeEach` のモック設定を `window.electronAPI.skillCreator` → `window.skillCreatorAPI` に変更
- テストロジック変更なし（検証内容は同一）

## Task 2: GovernanceSummaryPanel テストケース

### 移行検証テスト（TC-R-11 更新）

```typescript
// 変更前: electronAPI.skillCreator が未定義の場合
// 変更後: skillCreatorAPI が未定義の場合
it("TC-R-11: window.skillCreatorAPI が未定義の場合はローディング表示", () => {
  Reflect.deleteProperty(window, "skillCreatorAPI");
  render(<GovernanceSummaryPanel />);
  expect(screen.getByTestId("governance-loading")).toBeInTheDocument();
});
```

### 既存テスト更新方針

- `setupMockApi`: `window.electronAPI.skillCreator` → `window.skillCreatorAPI`
- `afterEach`: `electronAPI` → `skillCreatorAPI` の cleanup

## Task 3: 旧経路不使用の静的チェック

```bash
# 実行コマンド（移行後に0件であることを確認）
grep -rn "window.electronAPI.skillCreator" apps/desktop/src/renderer --include="*.tsx" --include="*.ts"
# → 期待結果: 0件
```

## AC対応表

| AC   | テストケース                           | 検証方法                                         |
| ---- | -------------------------------------- | ------------------------------------------------ |
| AC-1 | TC-IPP-MIG-01（P-4のモック更新で検証） | ImprovementProposalPanel.test.tsx                |
| AC-2 | TC-R-01〜TC-R-14のsetupMockApi更新     | GovernanceSummaryPanel.test.tsx                  |
| AC-3 | Task 3 静的チェック                    | grep 0件確認                                     |
| AC-4 | -                                      | outputs/phase-2/design-document.md 存在確認      |
| AC-5 | -                                      | outputs/phase-6/channel-naming-guide.md 存在確認 |
| AC-6 | -                                      | `pnpm typecheck`                                 |
| AC-7 | -                                      | `pnpm lint`                                      |
| AC-8 | 全既存テスト PASS                      | CI                                               |

## 完了確認

- [x] ImprovementProposalPanel の移行検証テストが定義されている
- [x] GovernanceSummaryPanel の移行検証テストが定義されている
- [x] 旧経路不使用の静的チェックコマンドが確認されている
- [x] AC-1〜AC-8 とテストが対応している
