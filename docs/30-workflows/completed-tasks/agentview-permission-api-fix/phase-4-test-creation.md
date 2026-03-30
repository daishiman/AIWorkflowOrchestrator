# Phase 4: テスト作成

## メタ情報

| 項目      | 内容                                               |
| --------- | -------------------------------------------------- |
| Phase     | 4                                                  |
| 名称      | テスト作成                                         |
| 前提Phase | Phase 3                                            |
| 成果物    | テストコード（修正前の状態で FAIL することを確認） |

## 目的

Phase 5 の実装に先立ち、修正後の正しい挙動を検証するテストを作成する。テストは修正前のコードに対して FAIL し、修正後に PASS することで、バグ修正の正当性を担保する。

## 実行タスク

- タスク 4-1: 既存テストの Permission API モック構造を確認する
- タスク 4-2: `window.permissionAPI` モックを追加する
- タスク 4-3: TypeError 解消と件数反映の Red テストを作成する
- タスク 4-4: `clearAll()` 呼び出しの Red テストを作成する
- タスク 4-5: 修正前コードで FAIL することを確認する

### タスク 4-1: 既存テストのモック構造を確認する

以下のコマンドで既存テストの `window.permissionAPI` または `window.electronAPI.permissions` のモック定義を確認する：

```bash
grep -rn "permissionAPI\|permissions" apps/desktop/src/renderer/views/AgentView/__tests__/
```

### タスク 4-2: Permission API のモック定義を作成する

`apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` の beforeEach に以下のモック定義を追加する（既存のモックに `permissionAPI` が含まれていない場合）：

```typescript
// window.permissionAPI のモック
const mockPermissionAPI = {
  getAllowedTools: vi.fn().mockResolvedValue({
    tools: [
      { toolName: "bash", allowedAt: "2026-03-30T00:00:00Z" },
      { toolName: "read", allowedAt: "2026-03-30T00:00:00Z" },
    ],
  }),
  revokeTool: vi.fn().mockResolvedValue({ success: true }),
  clearAll: vi.fn().mockResolvedValue({ success: true, clearedCount: 2 }),
};

Object.defineProperty(window, "permissionAPI", {
  value: mockPermissionAPI,
  writable: true,
  configurable: true,
});
```

### タスク 4-3: ランタイムエラー解消テストを追加する

`apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` に以下のテストケースを追加する：

```typescript
describe("Permission API 統合", () => {
  it("AgentView がマウント時に TypeError を発生させない", async () => {
    // Arrange: permissionAPI が存在する状態でレンダリング
    // Act
    const { container } = render(<AgentView />);
    // Assert: エラーなくレンダリングが完了する
    expect(container).toBeTruthy();
    await waitFor(() => {
      expect(mockPermissionAPI.getAllowedTools).toHaveBeenCalledTimes(1);
    });
  });

  it("permissionAPI が未定義の場合もエラーなくレンダリングされる", async () => {
    // Arrange: permissionAPI を undefined にする
    const original = window.permissionAPI;
    Object.defineProperty(window, "permissionAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Act
    const { container } = render(<AgentView />);

    // Assert: エラーなくレンダリングが完了する
    expect(container).toBeTruthy();

    // Cleanup
    Object.defineProperty(window, "permissionAPI", {
      value: original,
      writable: true,
      configurable: true,
    });
  });

  it("getAllowedTools の結果が rememberedCount に反映される", async () => {
    // Arrange
    mockPermissionAPI.getAllowedTools.mockResolvedValue({
      tools: [
        { toolName: "bash", allowedAt: "2026-03-30T00:00:00Z" },
        { toolName: "read", allowedAt: "2026-03-30T00:00:00Z" },
        { toolName: "write", allowedAt: "2026-03-30T00:00:00Z" },
      ],
    });

    // Act
    render(<AgentView />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("記憶された許可: 3件")).toBeInTheDocument();
    });
  });
});
```

### タスク 4-4: handleResetRemembered テストを追加する

```typescript
describe("handleResetRemembered", () => {
  it("リセットボタンで clearAll が呼び出される", async () => {
    // Arrange: AdvancedSettings を開いた状態にする
    render(<AgentView />);

    // Act: 設定パネルを開く → リセットボタンをクリック
    const settingsButton = screen.getByLabelText("詳細設定を開く");
    await userEvent.click(settingsButton);

    const resetButton = screen.getByLabelText("リセット");
    await userEvent.click(resetButton);

    // Assert
    await waitFor(() => {
      expect(mockPermissionAPI.clearAll).toHaveBeenCalledTimes(1);
    });
  });
});
```

### タスク 4-5: テストが修正前のコードで FAIL することを確認する

```bash
pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx
```

新しく追加したテストケースが FAIL することを確認する（修正前は `window.electronAPI.permissions` にアクセスするため、`window.permissionAPI` のモックが使用されない）。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名       | パス                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| Phase 2 設計 | `docs/30-workflows/agentview-permission-api-fix/phase-2-design.md`                |
| 既存テスト   | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`          |
| 既存テスト   | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.coverage.test.tsx` |

## 成果物

| 成果物               | 配置先                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| テストコード（修正） | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` |

## 完了条件

- [ ] `window.permissionAPI` のモック定義を追加した
- [ ] 「TypeError を発生させない」テストケースを追加した
- [ ] 「permissionAPI が未定義でもエラーなくレンダリング」テストケースを追加した
- [ ] 「getAllowedTools の結果が rememberedCount に反映」テストケースを追加した
- [ ] 「リセットボタンで clearAll が呼び出される」テストケースを追加した
- [ ] 追加したテストが修正前のコードで FAIL することを確認した

## 実行手順

### ステップ1: 既存テスト資産を再利用する

既存の `AgentView.test.tsx` モック構造と render helper を崩さず、最小差分で `permissionAPI` を追加する。

### ステップ2: バグの再現条件を固定する

誤った API パス起因のクラッシュが修正前に失敗し、修正後に成功する観点を先に確定する。

### ステップ3: 期待挙動を後続Phaseへ引き渡す

Phase 5 はこの Red テストを Green 化するだけで済むよう、期待値を明瞭にする。

## 統合テスト連携

- `permissionAPI` あり/なし両方の振る舞いを unit/integration 観点として固定する。
- Phase 6 で rejected path と 0件 path を拡充できるよう、基底モックを共通化する。

## 多角的チェック観点

| 観点         | 本Phaseでの確認内容                                    |
| ------------ | ------------------------------------------------------ |
| テスト整合性 | preload 契約と同じ戻り値形状を使っているか             |
| 最小実装     | 過剰な UI テストを増やさず、今回修正箇所へ絞れているか |
| 回帰防止     | 旧 API パスへ戻したとき確実に落ちるか                  |

## サブタスク管理

1. モック確認
2. Red テスト追加
3. 期待値の明文化
4. 命名規約確認
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Red テストが bugfix の必要性を説明できる
- [ ] テスト名と目的が要件へ対応している

## 次のPhase

Phase 5: 実装

## 統合テスト連携

| 観点         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| Red          | `permissionAPI` 基準の新規テストを追加し、旧 API パス前提では失敗することを証明する |
| 回帰         | `window.electronAPI.permissions` へ後戻りすると落ちるテストにする                   |
| Traceability | AC-01〜AC-04 をテスト名へ対応付けて Phase 10 で追跡できるようにする                 |
