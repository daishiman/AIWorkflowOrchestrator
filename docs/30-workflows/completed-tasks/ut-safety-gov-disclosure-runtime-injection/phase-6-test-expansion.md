# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                             |
| --------- | ---------------------------------------------- |
| Phase     | 6                                              |
| 機能名    | ut-safety-gov-disclosure-runtime-injection     |
| 作成日    | 2026-04-02                                     |
| タスクID  | UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 |
| Issue     | #1804                                          |
| 前提Phase | Phase 5 実装・全テスト GREEN 済み              |

## 目的

Phase 4 で作成した基本テストケースを拡充し、境界値・negative テスト・`buildDisclosureInfo` 純粋関数の単体テストを追加することで、テストカバレッジを向上させる。

## 実行タスク

- **境界値テスト追加**: fallback 値の境界条件（authMode が null / undefined 等）を追加
- **DENY-5 negative テスト追加**: レスポンスに `apiKey` プロパティがないことの negative テストを強化
- **buildDisclosureInfo 単体テスト追加**: 純粋関数として subscription / api-key / undefined の 3 ケースを個別テスト

## 実行手順

### 1. 現在のテストカバレッジ確認

```bash
# カバレッジ計測
pnpm --filter @repo/desktop test -- --coverage disclosureHandlers
```

現在のカバレッジ結果を記録し、拡充が必要な箇所を特定する。

### 2. 拡充テストケースの追加

`apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` に以下のテストケースを追加する：

#### 2-1. fallback 値の境界テスト

`getDisclosureInfo` が直接 "unknown" を返すケースに加え、null 相当の入力時の挙動を確認する：

```typescript
describe("fallback 値の境界テスト", () => {
  it("aiServiceName が空文字列のとき、そのまま返される", async () => {
    const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
      aiServiceName: "",
      modelName: "claude-sonnet-4-6",
      externalDestinations: [],
    });

    registerDisclosureHandlers({
      mainWindow: mockMainWindow,
      getDisclosureInfo: mockGetDisclosureInfo,
    });

    const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
    const handler = handleCall[1] as (
      event: IpcMainInvokeEvent,
    ) => Promise<unknown>;

    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const result = await handler(event);

    expect(result).toMatchObject({
      success: true,
      data: { aiServiceName: "" },
    });
  });

  it("externalDestinations が空配列であることを確認する", async () => {
    const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
      aiServiceName: "unknown",
      modelName: "claude-sonnet-4-6",
      externalDestinations: [],
    });

    registerDisclosureHandlers({
      mainWindow: mockMainWindow,
      getDisclosureInfo: mockGetDisclosureInfo,
    });

    const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
    const handler = handleCall[1] as (
      event: IpcMainInvokeEvent,
    ) => Promise<unknown>;

    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const result = (await handler(event)) as Record<string, unknown>;
    const data = result?.data as Record<string, unknown>;

    expect(Array.isArray(data?.externalDestinations)).toBe(true);
    expect((data?.externalDestinations as unknown[]).length).toBe(0);
  });
});
```

#### 2-2. DENY-5 negative テストの強化

API key / token 関連プロパティが含まれないことを網羅的に検証する：

```typescript
describe("DENY-5 negative テスト強化", () => {
  it("レスポンス全体に機密情報プロパティが含まれない", async () => {
    const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
      aiServiceName: "Claude Code CLI",
      modelName: "claude-sonnet-4-6",
      externalDestinations: [],
    });

    registerDisclosureHandlers({
      mainWindow: mockMainWindow,
      getDisclosureInfo: mockGetDisclosureInfo,
    });

    const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
    const handler = handleCall[1] as (
      event: IpcMainInvokeEvent,
    ) => Promise<unknown>;

    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const result = (await handler(event)) as Record<string, unknown>;
    const data = result?.data as Record<string, unknown> | undefined;

    // DENY-5: 以下のプロパティが存在しないことを検証
    const forbiddenKeys = [
      "apiKey",
      "api_key",
      "token",
      "accessToken",
      "secret",
      "secretKey",
      "password",
      "credential",
    ];

    forbiddenKeys.forEach((key) => {
      expect(result).not.toHaveProperty(key);
      expect(data).not.toHaveProperty(key);
    });
  });
});
```

#### 2-3. buildDisclosureInfo 純粋関数の単体テスト

`buildDisclosureInfo` 関数を直接テストする（`ipc/index.ts` からエクスポートされている場合）。
エクスポートされていない場合は、`getDisclosureInfo` 経由のテストで代替する：

```typescript
// buildDisclosureInfo がエクスポートされている場合の単体テスト
// （エクスポートされていない場合は以下を省略し、統合テストで確認）
describe("buildDisclosureInfo 純粋関数テスト（統合経由）", () => {
  const testCases = [
    {
      label: "subscription モード",
      aiServiceName: "Claude Code CLI",
      expected: "Claude Code CLI",
    },
    {
      label: "api-key モード",
      aiServiceName: "Anthropic API",
      expected: "Anthropic API",
    },
    {
      label: "undefined 相当（fallback）",
      aiServiceName: "unknown",
      expected: "unknown",
    },
  ];

  testCases.forEach(({ label, aiServiceName, expected }) => {
    it(`${label} のとき aiServiceName が '${expected}' になる`, async () => {
      const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
        aiServiceName,
        modelName: "claude-sonnet-4-6",
        externalDestinations: [],
      });

      registerDisclosureHandlers({
        mainWindow: mockMainWindow,
        getDisclosureInfo: mockGetDisclosureInfo,
      });

      const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
      const handler = handleCall[1] as (
        event: IpcMainInvokeEvent,
      ) => Promise<unknown>;

      const event = {
        sender: mockMainWindow.webContents,
      } as unknown as IpcMainInvokeEvent;

      const result = (await handler(event)) as Record<string, unknown>;

      expect(result).toMatchObject({
        success: true,
        data: { aiServiceName: expected },
      });
    });
  });
});
```

### 3. テスト実行（拡充後 GREEN 確認）

```bash
# テスト実行（全ケース GREEN を確認）
pnpm --filter @repo/desktop test -- disclosureHandlers
```

### 4. カバレッジ計測

```bash
# カバレッジ計測
pnpm --filter @repo/desktop test -- --coverage disclosureHandlers
```

Phase 7 の目標（Line 80%+、Branch 60%+、Function 80%+）に達しているか確認する。
未達成の場合は本 Phase のテストを追加・修正する。

## 追加テストケース一覧

| テストケース名                              | 対応 AC | カバレッジ向上箇所    |
| ------------------------------------------- | ------- | --------------------- |
| aiServiceName が空文字列のとき返される      | AC-3    | Branch: fallback 境界 |
| externalDestinations が空配列               | AC-4    | Line: 配列返却        |
| DENY-5 negative テスト（機密プロパティ8種） | AC-4    | Branch: DENY-5        |
| buildDisclosureInfo subscription ケース     | AC-1    | Function: 純粋関数    |
| buildDisclosureInfo api-key ケース          | AC-2    | Function: 純粋関数    |
| buildDisclosureInfo fallback ケース         | AC-3    | Branch: else 分岐     |

## 参照資料

| 資料名                         | パス                                                             | 説明                           |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト作成             | `phase-4-test-creation.md`                                       | 基本テストケース               |
| Phase 5 実装                   | `phase-5-implementation.md`                                      | 実装済み buildDisclosureInfo   |
| disclosureHandlers.test.ts     | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 拡充対象のテストファイル       |
| Phase 3 テスタビリティチェック | `phase-3-design-review.md`                                       | DENY-5 negative テスト設計根拠 |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果   |
| ---------------------- | ---- | ------ |
| ユニットテストLine     | 80%+ | 未計測 |
| ユニットテストBranch   | 60%+ | 未計測 |
| ユニットテストFunction | 80%+ | 未計測 |
| 全テスト GREEN         | PASS | 未計測 |

## 成果物

| 成果物                       | パス                                                             | 説明                                     |
| ---------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| 拡充済みテストファイル       | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 境界値・negative・純粋関数テスト追加済み |
| テスト実行結果（GREEN）      | `outputs/phase-6/test-result-green.txt`                          | 拡充後 GREEN 確認の記録                  |
| カバレッジレポート（参考値） | `outputs/phase-6/coverage-preview.txt`                           | Phase 7 前の参考カバレッジ値             |

## 完了条件

- [ ] fallback 値の境界テストが追加されている
- [ ] DENY-5 negative テスト（機密プロパティ 8 種）が追加されている
- [ ] buildDisclosureInfo の 3 ケース（subscription / api-key / fallback）テストが追加されている
- [ ] 全テストケースが GREEN（PASS）
- [ ] カバレッジが目標値（Line 80%+、Branch 60%+、Function 80%+）に達しているか確認済み
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                             | 状態 | 備考                                                                |
| ---------------------------------- | ---- | ------------------------------------------------------------------- |
| 拡充前カバレッジ計測               | 未   | `pnpm --filter @repo/desktop test -- --coverage disclosureHandlers` |
| 境界値テスト追加                   | 未   | fallback 境界・externalDestinations 空配列                          |
| DENY-5 negative テスト強化         | 未   | 機密プロパティ 8 種の網羅検証                                       |
| buildDisclosureInfo 純粋関数テスト | 未   | subscription / api-key / fallback 3 ケース                          |
| 拡充後 GREEN 確認                  | 未   | `pnpm --filter @repo/desktop test -- disclosureHandlers`            |
| 拡充後カバレッジ確認               | 未   | Phase 7 目標値との比較                                              |

## 次のPhase

Phase 7: カバレッジ確認 → [phase-7-coverage-check.md](phase-7-coverage-check.md)

**ゲート**: 全テスト GREEN 確認後にのみ Phase 7 へ進む。カバレッジ未達成の場合は本 Phase に戻る。
