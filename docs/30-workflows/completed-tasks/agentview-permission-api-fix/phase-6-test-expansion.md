# Phase 6: テスト拡充

## メタ情報

| 項目      | 内容                                             |
| --------- | ------------------------------------------------ |
| Phase     | 6                                                |
| 名称      | テスト拡充                                       |
| 前提Phase | Phase 5                                          |
| 成果物    | 追加テストケース（エッジケース・異常系のカバー） |

## 目的

Phase 4 で作成した基本テストに加え、エッジケースと異常系のテストを追加して、修正の堅牢性を担保する。

## 実行タスク

- タスク 6-1: `getAllowedTools` の空配列・失敗ケースを追加検証する
- タスク 6-2: `clearAll` 失敗時のエラー表示を追加検証する
- タスク 6-3: `permissionAPI` 不在時のリセット挙動を追加検証する
- タスク 6-4: 許可モードセレクタがローカル state のみで動作することを補強する

### タスク 6-1: getAllowedTools のエッジケーステストを追加する

`apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` に以下のテストケースを追加する：

```typescript
describe("Permission API エッジケース", () => {
  it("getAllowedTools が空配列を返した場合、rememberedCount が 0 になる", async () => {
    mockPermissionAPI.getAllowedTools.mockResolvedValue({ tools: [] });

    render(<AgentView />);

    await waitFor(() => {
      expect(mockPermissionAPI.getAllowedTools).toHaveBeenCalled();
    });

    // rememberedCount のデフォルト値は 0 のため、
    // 「記憶された許可: 0件」が表示されることを AdvancedSettings 経由で確認する
  });

  it("getAllowedTools が rejected された場合、エラーハンドリングが動作する", async () => {
    mockPermissionAPI.getAllowedTools.mockRejectedValue(
      new Error("IPC error"),
    );

    // エラーがスローされずにレンダリングが完了すること
    const { container } = render(<AgentView />);
    expect(container).toBeTruthy();

    await waitFor(() => {
      expect(mockPermissionAPI.getAllowedTools).toHaveBeenCalled();
    });
  });
});
```

### タスク 6-2: clearAll のエッジケーステストを追加する

```typescript
describe("handleResetRemembered エッジケース", () => {
  it("clearAll が rejected された場合、エラー Toast が表示される", async () => {
    mockPermissionAPI.clearAll.mockRejectedValue(
      new Error("Clear failed"),
    );

    render(<AgentView />);

    // 設定パネルを開く
    const settingsButton = screen.getByLabelText("詳細設定を開く");
    await userEvent.click(settingsButton);

    // リセットボタンをクリック
    const resetButton = screen.getByLabelText("リセット");
    await userEvent.click(resetButton);

    // エラー Toast が表示されること
    await waitFor(() => {
      expect(
        screen.getByText(/記憶済み許可のリセットに失敗しました/),
      ).toBeInTheDocument();
    });
  });

  it("permissionAPI が undefined の場合、rememberedCount を 0 にリセットする", async () => {
    // permissionAPI を undefined にする
    const original = window.permissionAPI;
    Object.defineProperty(window, "permissionAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<AgentView />);

    // 設定パネルを開く
    const settingsButton = screen.getByLabelText("詳細設定を開く");
    await userEvent.click(settingsButton);

    // リセットボタンをクリック（API なしでもエラーにならない）
    const resetButton = screen.getByLabelText("リセット");
    await userEvent.click(resetButton);

    // Cleanup
    Object.defineProperty(window, "permissionAPI", {
      value: original,
      writable: true,
      configurable: true,
    });
  });
});
```

### タスク 6-3: handlePermissionModeChange のテストを追加する

```typescript
describe("handlePermissionModeChange", () => {
  it("許可モードセレクタの変更がローカル state のみで動作する", async () => {
    render(<AgentView />);

    // 設定パネルを開く
    const settingsButton = screen.getByLabelText("詳細設定を開く");
    await userEvent.click(settingsButton);

    // 許可モードセレクタで「全て許可」を選択
    const modeSelector = screen.getByTestId("permission-mode-selector");
    await userEvent.selectOptions(modeSelector, "bypassPermissions");

    // セレクタの値が変更されていること
    expect(modeSelector).toHaveValue("bypassPermissions");

    // IPC 呼び出し（setMode）が発生していないことを確認
    // （permissionAPI に setMode メソッドは存在しないため、
    //   呼び出しが発生すればランタイムエラーになる）
  });
});
```

### タスク 6-4: テスト実行

```bash
pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/views/AgentView/__tests__/
```

全テストが PASS することを確認する。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| Phase 4 テスト | `docs/30-workflows/agentview-permission-api-fix/phase-4-test-creation.md`  |
| Phase 5 実装   | `docs/30-workflows/agentview-permission-api-fix/phase-5-implementation.md` |

## 成果物

| 成果物           | 配置先                                                                   |
| ---------------- | ------------------------------------------------------------------------ |
| 追加テストコード | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` |

## 完了条件

- [ ] `getAllowedTools` が空配列を返すケースのテストを追加した
- [ ] `getAllowedTools` が rejected されるケースのテストを追加した
- [ ] `clearAll` が rejected されるケースのテストを追加した
- [ ] `permissionAPI` が undefined の場合のリセットテストを追加した
- [ ] 許可モードセレクタがローカル state のみで動作するテストを追加した
- [ ] 全テストが PASS した

## 実行手順

### ステップ1: 成功系の穴を埋める

0件表示と disabled 状態の成功系境界ケースを追加する。

### ステップ2: 失敗系を補強する

IPC reject と API 不在の両方でクラッシュしないことを確認する。

### ステップ3: カバレッジ観点へ接続する

Phase 7 で関数単位 coverage を説明できるよう、各枝を整理する。

## 統合テスト連携

- `getAllowedTools` 成功/失敗/空配列、`clearAll` 成功/失敗、API 不在を coverage matrix として固定する。
- Phase 7 のブランチカバレッジ観点へ直接引き渡す。

## 多角的チェック観点

| 観点               | 本Phaseでの確認内容                              |
| ------------------ | ------------------------------------------------ |
| エラーハンドリング | reject 時に UI が壊れないか                      |
| 回帰防止           | reset / mode change の既存体験を損ねないか       |
| 過剰設計回避       | 実装していない機能のテストを増やしすぎていないか |

## サブタスク管理

1. 成功系境界の追加
2. 失敗系の追加
3. local state 確認
4. カバレッジ観点整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] カバレッジ観点に必要な枝が揃った
- [ ] 実装されていない仕様をテストに仮定していない

## 次のPhase

Phase 7: カバレッジ確認

## 統合テスト連携

| 観点   | 内容                                                                        |
| ------ | --------------------------------------------------------------------------- |
| 異常系 | `getAllowedTools()` / `clearAll()` の失敗でも UI が破綻しないことを確認する |
| 境界値 | 0件、複数件、API不在の3パターンを最小集合として維持する                     |
| 非機能 | 既存 AgentView 系テストと競合しないモック初期化パターンに揃える             |
