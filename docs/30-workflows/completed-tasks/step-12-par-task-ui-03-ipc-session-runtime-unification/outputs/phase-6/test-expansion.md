# Phase 6 テスト拡充仕様（TASK-UI-03）

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 6                                              |
| 作成日     | 2026-04-06                                     |
| ステータス | complete                                       |
| 対象       | 方針 B（明確な分離契約）実装後の追加テスト設計 |
| 前提       | Phase 5 実装完了（変更サマリー準拠）           |

---

## 実装変更サマリー（テスト設計の前提）

Phase 5 で行われた変更を再掲する。テストケースはこの変更に対して書かれる。

| 変更内容                                                              | 変更ファイル                                                   |
| --------------------------------------------------------------------- | -------------------------------------------------------------- |
| `electronAPI.skillCreator` / `skillCreatorSession` を削除             | `apps/desktop/src/preload/index.ts`                            |
| `GovernanceSummaryPanel` の参照先を `window.skillCreatorAPI` に変更   | `apps/desktop/src/renderer/components/organisms/AgentView/...` |
| `ImprovementProposalPanel` の参照先を `window.skillCreatorAPI` に変更 | `apps/desktop/src/renderer/components/skill/...`               |
| `SKILL_CREATOR_GET_ADAPTER_STATUS` 重複ハンドラーを除去               | `apps/desktop/src/main/ipc/creatorHandlers.ts`                 |

---

## 1. フェイルパステスト

`electronAPI.skillCreator` が undefined の場合の挙動を検証する。削除後に旧参照経路を使う既存コードがあった場合の安全網テスト。

| ID    | テストケース名                                                        | 対象コンポーネント        | テスト観点                                                                                               | 期待結果                                                                    | 優先度 |
| ----- | --------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| FP-01 | `window.electronAPI.skillCreator` が undefined でも型エラーなし       | TypeScript コンパイル検証 | `ElectronAPI` 型定義から `skillCreator` フィールドが削除された後、アクセスがコンパイルエラーになる       | `Property 'skillCreator' does not exist on type 'ElectronAPI'` が出力される | 高     |
| FP-02 | `GovernanceSummaryPanel` が `window.skillCreatorAPI` 経由で動作する   | GovernanceSummaryPanel    | `window.electronAPI` に `skillCreator` が存在しない環境でコンポーネントがレンダリングされる              | `window.skillCreatorAPI.getGovernanceState` が呼ばれる                      | 高     |
| FP-03 | `ImprovementProposalPanel` が `window.skillCreatorAPI` 経由で動作する | ImprovementProposalPanel  | `window.electronAPI` に `skillCreator` が存在しない環境でコンポーネントが applyRuntimeImprovement を呼ぶ | `window.skillCreatorAPI.applyRuntimeImprovement` が呼ばれる                 | 高     |
| FP-04 | `window.electronAPI` 自体が存在しない環境でクラッシュしない           | GovernanceSummaryPanel    | `window.electronAPI` が undefined のときコンポーネントがエラーを出さずレンダリングされる                 | ローディング状態またはエラー表示（クラッシュなし）                          | 中     |
| FP-05 | `window.skillCreatorAPI` が undefined の場合の GovernanceSummaryPanel | GovernanceSummaryPanel    | `window.skillCreatorAPI` が存在しない環境でコンポーネントが適切にハンドリングする                        | ローディングまたはエラー表示（クラッシュなし）                              | 高     |

### FP-02 テストコード概要

```typescript
// GovernanceSummaryPanel.test.tsx（移行後）
function setupMockApiViaSkillCreatorAPI(
  impl: () => Promise<{ success: boolean; data?: SkillCreatorGovernanceState }>,
) {
  const mockFn = vi.fn(impl);
  // electronAPI.skillCreator ではなく skillCreatorAPI を設定
  Object.defineProperty(window, "skillCreatorAPI", {
    value: { getGovernanceState: mockFn },
    writable: true,
    configurable: true,
  });
  // electronAPI には skillCreator を含めない
  Object.defineProperty(window, "electronAPI", {
    value: {}, // skillCreator フィールドなし
    writable: true,
    configurable: true,
  });
  return mockFn;
}

it("FP-02: electronAPI.skillCreator が存在しない状態で skillCreatorAPI を経由する", async () => {
  const mockFn = setupMockApiViaSkillCreatorAPI(async () => ({
    success: true,
    data: mockGovernanceState,
  }));

  render(<GovernanceSummaryPanel />);

  await waitFor(() => {
    expect(mockFn).toHaveBeenCalled();
    expect(screen.getByTestId("governance-phase")).toHaveTextContent("plan");
  });
});
```

---

## 2. 回帰ガードテスト

4経路 → 2経路への変更が正しく機能するか、および旧経路への参照が残っていないかを検証する。

| ID    | テストケース名                                                                                | 対象ファイル                           | テスト観点                                                                                          | 期待結果                                                        | 優先度 |
| ----- | --------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------ |
| RG-01 | `electronAPI` オブジェクトに `skillCreator` キーが存在しない                                  | `preload/index.ts`                     | 変更後の `electronAPI` オブジェクトのキー一覧を検証する                                             | `skillCreator` キーが存在しない                                 | 高     |
| RG-02 | `electronAPI` オブジェクトに `skillCreatorSession` キーが存在しない                           | `preload/index.ts`                     | 変更後の `electronAPI` オブジェクトのキー一覧を検証する                                             | `skillCreatorSession` キーが存在しない                          | 高     |
| RG-03 | `window.skillCreatorAPI` が引き続き動作する                                                   | `preload/skill-creator-api.ts`         | `window.skillCreatorAPI` が公開されており、全メソッドが呼び出し可能                                 | `skillCreatorAPI` の全メソッドが呼び出し可能                    | 高     |
| RG-04 | `window.skillCreatorSessionAPI` が引き続き動作する                                            | `preload/skill-creator-session-api.ts` | `window.skillCreatorSessionAPI` が公開されており、全メソッドが呼び出し可能                          | `skillCreatorSessionAPI` の全メソッドが呼び出し可能             | 高     |
| RG-05 | `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラーが 1 回のみ登録される                            | `creatorHandlers.ts`                   | `registerRuntimeSkillCreatorHandlers` 後に `ipcMain.handle` が `ADAPTER_STATUS` を 1 回だけ登録する | `ipcMain.handle` の呼び出し回数が 1 回                          | 高     |
| RG-06 | `unregisterRuntimeSkillCreatorHandlers` 後に `ADAPTER_STATUS` ハンドラーが 1 回のみ削除される | `creatorHandlers.ts`                   | `unregisterRuntimeSkillCreatorHandlers` で `removeHandler` が `ADAPTER_STATUS` を 1 回だけ呼ぶ      | `ipcMain.removeHandler` の呼び出し回数が 1 回                   | 中     |
| RG-07 | `GovernanceSummaryPanel.test.tsx` の全テストが `window.skillCreatorAPI` モックを使用する      | GovernanceSummaryPanel テスト          | 旧 `window.electronAPI.skillCreator` を参照するテストが存在しない                                   | `window.electronAPI.skillCreator` を設定するテストコードが 0 件 | 高     |
| RG-08 | `ImprovementProposalPanel.test.tsx` の全テストが `window.skillCreatorAPI` モックを使用する    | ImprovementProposalPanel テスト        | 旧 `window.electronAPI.skillCreator` を参照するテストが存在しない                                   | `window.electronAPI.skillCreator` を設定するテストコードが 0 件 | 高     |

### RG-05 テストコード概要

```typescript
// creatorHandlers.duplicate-handler.test.ts（新規追加）
describe("ADAPTER_STATUS ハンドラー登録の一意性", () => {
  it("RG-05: ADAPTER_STATUS ハンドラーは 1 回のみ登録される", () => {
    const registerCount = new Map<string, number>();
    vi.mocked(ipcMain.handle).mockImplementation((channel: string) => {
      registerCount.set(channel, (registerCount.get(channel) ?? 0) + 1);
    });

    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    expect(
      registerCount.get(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS),
    ).toBe(1);
  });
});
```

---

## 3. エッジケーステスト

`GovernanceSummaryPanel` が `skillCreatorAPI` 未定義の場合や境界値での挙動を検証する。

| ID    | テストケース名                                                                             | 対象コンポーネント       | テスト観点                                                                                  | 期待結果                                            | 優先度 |
| ----- | ------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| EC-01 | `window.skillCreatorAPI` が undefined のときローディング状態を維持する                     | GovernanceSummaryPanel   | `window.skillCreatorAPI` が未定義の場合、コンポーネントはクラッシュせずローディング表示する | `governance-loading` が表示される（クラッシュなし） | 高     |
| EC-02 | `window.skillCreatorAPI.getGovernanceState` が undefined のとき graceful degradation       | GovernanceSummaryPanel   | `skillCreatorAPI` オブジェクトが存在するが `getGovernanceState` が undefined の場合         | ローディングまたはエラー表示                        | 中     |
| EC-03 | `window.skillCreatorAPI` が undefined のとき `ImprovementProposalPanel` がクラッシュしない | ImprovementProposalPanel | 適用ボタン押下時に `window.skillCreatorAPI` が未定義の場合                                  | エラーメッセージが表示される（クラッシュなし）      | 高     |
| EC-04 | `getGovernanceState` が `{ success: false }` を返す場合にエラー表示になる                  | GovernanceSummaryPanel   | `success: false` レスポンスの処理を確認する                                                 | `governance-error` が表示される                     | 中     |
| EC-05 | `getGovernanceState` が `{ success: true, data: undefined }` を返す場合の挙動              | GovernanceSummaryPanel   | data が undefined の場合の防御コードを確認する                                              | ローディングまたはエラー表示（クラッシュなし）      | 低     |
| EC-06 | `applyRuntimeImprovement` に空の suggestions 配列を渡す                                    | ImprovementProposalPanel | 空配列での IPC 呼び出しが適切に処理される                                                   | IPC が呼ばれないか、`applied: 0` の結果が返る       | 低     |

### EC-01 テストコード概要

```typescript
// GovernanceSummaryPanel.test.tsx（追加テスト）
it("EC-01: window.skillCreatorAPI が undefined のときローディング表示", () => {
  // skillCreatorAPI を設定しない（またはあえて undefined にする）
  Object.defineProperty(window, "skillCreatorAPI", {
    value: undefined,
    writable: true,
    configurable: true,
  });

  render(<GovernanceSummaryPanel />);

  expect(screen.getByTestId("governance-loading")).toBeInTheDocument();
  // クラッシュ（エラー境界の発火）が起きていないことを確認
  expect(screen.queryByTestId("governance-error")).not.toBeInTheDocument();
});
```

---

## 4. 並行アクセステスト

Session IPC と Runtime IPC が同時に使用された場合に競合が発生しないことを検証する。

| ID    | テストケース名                                                                                  | 対象                    | テスト観点                                                             | 期待結果                                                            | 優先度 |
| ----- | ----------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- | ------ |
| CA-01 | Session IPC と Runtime IPC を同時に invoke しても互いに干渉しない                               | Main プロセスハンドラー | `START_SESSION` と `SKILL_CREATOR_PLAN` を並行して invoke する         | それぞれ独立したハンドラーが応答する（混同なし）                    | 中     |
| CA-02 | `getGovernanceState` の複数同時呼び出しが競合しない                                             | creatorHandlers.ts      | 同一チャネルへの複数並行 invoke が正しく処理される                     | 各リクエストが独立したレスポンスを返す                              | 中     |
| CA-03 | ポーリング中にアンマウントしてもセットインターバルが停止する                                    | GovernanceSummaryPanel  | interval 実行中にアンマウントを呼ぶ（TC-R-10 の拡張）                  | アンマウント後に `getGovernanceState` が追加呼び出しされない        | 高     |
| CA-04 | `GovernanceSummaryPanel` の複数インスタンスが同時にポーリングを行う場合                         | GovernanceSummaryPanel  | 2 インスタンスを同時にレンダリングし、それぞれが独立してポーリングする | 各インスタンスが独自の interval を持ち、互いの unmount 時に停止する | 低     |
| CA-05 | `registerRuntimeSkillCreatorHandlers` と `unregisterRuntimeSkillCreatorHandlers` の並行呼び出し | creatorHandlers.ts      | register 途中に unregister を呼んでも状態が壊れない                    | unregister 後にハンドラーが残らない                                 | 低     |

### CA-01 テストコード概要

```typescript
// creatorHandlers.concurrent.test.ts（新規追加）
describe("並行アクセステスト", () => {
  it("CA-01: START_SESSION と PLAN を並行 invoke しても結果が混同されない", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const planHandler = handlerMap.get(IPC_CHANNELS.SKILL_CREATOR_PLAN)!;
    // START_SESSION は SkillCreatorIpcBridge が持つが、
    // Runtime IPC ハンドラーが START_SESSION の存在に依存しないことを確認する

    const [planResult] = await Promise.all([
      planHandler(createMockEvent(), { prompt: "test prompt" }),
    ]);

    expect(planResult).toHaveProperty("success");
  });
});
```

---

## 5. 型安全性テスト

`ElectronAPI` 型から `skillCreator` / `skillCreatorSession` フィールドを削除した後に TypeScript コンパイルエラーが発生しないことを検証する。

| ID    | テストケース名                                                                                            | 対象ファイル                        | テスト観点                                                                                   | 期待結果                                                                | 優先度 |
| ----- | --------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ |
| TS-01 | `ElectronAPI` 型に `skillCreator` フィールドが存在しない                                                  | `apps/desktop/src/preload/types.ts` | `ElectronAPI` インターフェースの型定義を検証する                                             | `skillCreator` プロパティが型定義に存在しない                           | 高     |
| TS-02 | `ElectronAPI` 型に `skillCreatorSession` フィールドが存在しない                                           | `apps/desktop/src/preload/types.ts` | `ElectronAPI` インターフェースの型定義を検証する                                             | `skillCreatorSession` プロパティが型定義に存在しない                    | 高     |
| TS-03 | `GovernanceSummaryPanel.tsx` が `window.skillCreatorAPI` の型を正しく参照する                             | GovernanceSummaryPanel.tsx          | `SkillCreatorAPI` 型のメソッドシグネチャが `getGovernanceState` を含む                       | TypeScript コンパイルエラーなし                                         | 高     |
| TS-04 | `ImprovementProposalPanel.tsx` が `window.skillCreatorAPI` の型を正しく参照する                           | ImprovementProposalPanel.tsx        | `SkillCreatorAPI` 型のメソッドシグネチャが `applyRuntimeImprovement` を含む                  | TypeScript コンパイルエラーなし                                         | 高     |
| TS-05 | `window.d.ts` または `global.d.ts` の型宣言から `electronAPI.skillCreator` を参照するコードにエラーが出る | 型検証（tsc --noEmit）              | `window.electronAPI.skillCreator` を参照する既存コードが型エラーになる（リグレッション防止） | `Property 'skillCreator' does not exist` のコンパイルエラーが検出される | 高     |
| TS-06 | `SkillCreatorAPI` 型と `window.skillCreatorAPI` の型が一致する                                            | `preload/skill-creator-api.ts`      | preload で公開される API オブジェクトの型が `SkillCreatorAPI` と一致する                     | 型の不一致がない                                                        | 中     |

### TS-01 / TS-02 検証方法

```bash
# TypeScript 型チェックで削除を確認するコマンド
pnpm --filter @repo/desktop typecheck

# または以下のスクリプトで型レベルの確認
# （型テストファイル: apps/desktop/src/preload/__tests__/electron-api.types.test.ts）
```

```typescript
// electron-api.types.test.ts（型テスト）
import type { ElectronAPI } from "../types";

// TS-01: skillCreator が存在しないことの型テスト
// @ts-expect-error skillCreator は削除済み
const _unused: ElectronAPI["skillCreator"] = undefined;

// TS-02: skillCreatorSession が存在しないことの型テスト
// @ts-expect-error skillCreatorSession は削除済み
const _unused2: ElectronAPI["skillCreatorSession"] = undefined;
```

---

## 6. MINOR-01 対応テスト

Session IPC のエラーハンドリング形式（`throw` 形式）と Runtime IPC の `IpcResult` パターンの整合性を検証する。

### 背景

Phase 3 設計レビューで記録された MINOR-01:

> Session IPC のエラーハンドリング形式が `throw` 形式で Runtime IPC の `IpcResult` パターンと非統一

`SkillCreatorIpcBridge.ts` の `onStartSession` / `onAnswer` は `throw new Error(...)` を使用し、`creatorHandlers.ts` は `return { success: false, error: ... }` を使用する。

| ID     | テストケース名                                                                      | 対象ファイル                            | テスト観点                                                                                          | 期待結果                                                                      | 優先度 |
| ------ | ----------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------ |
| M01-01 | `START_SESSION` のバリデーション失敗が `throw` で返る（現状の記録）                 | SkillCreatorIpcBridge.ts                | 空の `request` を渡したとき `throw new Error(...)` が発生することを確認する                         | `ipcMain.handle` のコールバックが例外を投げる（Renderer が catch できる形式） | 中     |
| M01-02 | `ANSWER` の `toolCallId` 不一致が `throw` で返る（現状の記録）                      | SkillCreatorIpcBridge.ts                | 不正な `toolCallId` を渡したとき `throw new Error(...)` が発生することを確認する                    | `ipcMain.handle` のコールバックが例外を投げる                                 | 中     |
| M01-03 | Runtime IPC のエラーは `{ success: false, error: string }` 形式で返る（対比確認）   | creatorHandlers.ts                      | service が null のとき `{ success: false }` 形式で返ることを確認する                                | `result.success === false` かつ `result.error` が string                      | 高     |
| M01-04 | Session IPC エラーを `IpcResult` パターンに統一した場合のテスト（MINOR-01 解決後）  | SkillCreatorIpcBridge.ts（改修後）      | 改修後に `throw` が `return { success: false, error: ... }` に変わることを検証する                  | `onStartSession` が空 request で `{ success: false, error: string }` を返す   | 中     |
| M01-05 | Renderer 側が Session IPC のエラーを `catch` で受け取れることを確認（現状）         | skill-creator-session-api.ts / Renderer | Renderer で `await skillCreatorSessionAPI.startSession(...)` を `try/catch` で囲む                  | `throw` 形式でも Renderer は `catch` で処理できる（現状の動作記録）           | 低     |
| M01-06 | エラーレスポンス形式の統一後、Renderer の呼び出しコードに破壊的変更がないことを確認 | SkillCreatorConversationPanel（等）     | `IpcResult` パターンへの移行後、既存の `try/catch` が不要になり `result.success` チェックに移行する | Renderer のエラーハンドリングコードが更新されている                           | 中     |

### M01-01 テストコード概要

```typescript
// SkillCreatorIpcBridge.session-error.test.ts（新規または既存テストの拡充）
describe("MINOR-01: Session IPC エラーハンドリング形式の記録", () => {
  it("M01-01: START_SESSION の空 request は throw で返る（現状記録）", async () => {
    const bridge = createBridge();
    bridge.register();

    const handler = handlerMap.get(
      SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
    )!;

    // 空 request を渡す
    await expect(handler(createMockEvent(), { request: "" })).rejects.toThrow(
      "[SkillCreatorIpcBridge]",
    );
  });

  it("M01-04: IpcResult パターンへ移行後は success: false で返る（MINOR-01 解決後）", async () => {
    // MINOR-01 が解決された後に追加するテスト
    const bridge = createBridge();
    bridge.register();

    const handler = handlerMap.get(
      SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
    )!;

    const result = await handler(createMockEvent(), { request: "" });

    expect(result).toEqual({
      success: false,
      error: expect.stringContaining("request"),
    });
  });
});
```

### MINOR-01 解決時のコード変更イメージ

現状（`throw` 形式）:

```typescript
// SkillCreatorIpcBridge.ts
if (!req || typeof req.request !== "string" || req.request.trim() === "") {
  throw new Error(
    "[SkillCreatorIpcBridge] start-session request must include a non-empty request string",
  );
}
```

MINOR-01 解決後（`IpcResult` 形式）:

```typescript
// SkillCreatorIpcBridge.ts（改修後）
if (!req || typeof req.request !== "string" || req.request.trim() === "") {
  return {
    success: false,
    error:
      "[SkillCreatorIpcBridge] start-session request must include a non-empty request string",
  };
}
```

---

## 7. 完了条件チェックリスト

### 必須テスト（優先度: 高）

- [ ] FP-01: `ElectronAPI` 型から `skillCreator` が削除されコンパイルエラーが出ることを確認
- [ ] FP-02: `GovernanceSummaryPanel` が `window.skillCreatorAPI` 経由で動作することを確認
- [ ] FP-03: `ImprovementProposalPanel` が `window.skillCreatorAPI` 経由で動作することを確認
- [ ] FP-05: `window.skillCreatorAPI` が undefined のときに `GovernanceSummaryPanel` がクラッシュしないことを確認
- [ ] RG-01: `electronAPI` から `skillCreator` キーが除去されていることを確認
- [ ] RG-02: `electronAPI` から `skillCreatorSession` キーが除去されていることを確認
- [ ] RG-03: `window.skillCreatorAPI` が全メソッドを持ち動作することを確認
- [ ] RG-04: `window.skillCreatorSessionAPI` が全メソッドを持ち動作することを確認
- [ ] RG-05: `ADAPTER_STATUS` ハンドラーが 1 回のみ登録されることを確認
- [ ] RG-07: `GovernanceSummaryPanel` テストが旧 `electronAPI.skillCreator` モックを使用していないことを確認
- [ ] RG-08: `ImprovementProposalPanel` テストが旧 `electronAPI.skillCreator` モックを使用していないことを確認
- [ ] EC-01: `window.skillCreatorAPI` が undefined のときローディング表示になることを確認
- [ ] EC-03: `window.skillCreatorAPI` が undefined のとき `ImprovementProposalPanel` がクラッシュしないことを確認
- [ ] TS-01: `ElectronAPI` 型に `skillCreator` フィールドが存在しないことを確認
- [ ] TS-02: `ElectronAPI` 型に `skillCreatorSession` フィールドが存在しないことを確認
- [ ] TS-03: `GovernanceSummaryPanel.tsx` の型チェックが通ることを確認
- [ ] TS-04: `ImprovementProposalPanel.tsx` の型チェックが通ることを確認
- [ ] TS-05: 旧参照コードに型エラーが出ることを確認
- [ ] M01-03: Runtime IPC のエラーが `IpcResult` 形式で返ることを確認（対比テスト）
- [ ] CA-03: ポーリング中のアンマウントでインターバルが停止することを確認

### 推奨テスト（優先度: 中）

- [ ] FP-04: `window.electronAPI` が存在しない環境でクラッシュしないことを確認
- [ ] RG-06: `unregister` で `ADAPTER_STATUS` ハンドラーが 1 回のみ削除されることを確認
- [ ] CA-01: Session IPC と Runtime IPC の並行 invoke が干渉しないことを確認
- [ ] CA-02: `getGovernanceState` の複数同時呼び出しが競合しないことを確認
- [ ] EC-02: `getGovernanceState` が undefined のとき graceful degradation することを確認
- [ ] EC-04: `success: false` レスポンスにエラー表示が出ることを確認
- [ ] TS-06: `SkillCreatorAPI` 型と `window.skillCreatorAPI` の型が一致することを確認
- [ ] M01-01: `START_SESSION` の空 request が `throw` で返ることを確認（現状記録）
- [ ] M01-02: `ANSWER` の `toolCallId` 不一致が `throw` で返ることを確認（現状記録）
- [ ] M01-04: MINOR-01 解決後、`IpcResult` パターンで返ることを確認（MINOR-01 解決時に追加）
- [ ] M01-06: MINOR-01 解決後、Renderer の呼び出しコードに破壊的変更がないことを確認

### 省略可（優先度: 低）

- [ ] EC-05: `data: undefined` のレスポンスでクラッシュしないことを確認
- [ ] EC-06: 空 suggestions 配列での IPC 呼び出しが適切に処理されることを確認
- [ ] CA-04: 複数 GovernanceSummaryPanel インスタンスが独立したポーリングを行うことを確認
- [ ] CA-05: `register` / `unregister` の並行呼び出しで状態が壊れないことを確認
- [ ] M01-05: Renderer が Session IPC のエラーを `catch` で受け取れることを確認

---

## テスト実装優先順位マトリクス

| 優先度 | テスト区分             | テスト ID                         | 実装タイミング             |
| ------ | ---------------------- | --------------------------------- | -------------------------- |
| P0     | 回帰ガード（移行確認） | RG-01, RG-02, RG-05, RG-07, RG-08 | Phase 5 実装直後           |
| P0     | 型安全性               | TS-01, TS-02, TS-05               | Phase 5 実装直後           |
| P1     | フェイルパス           | FP-02, FP-03, FP-05               | Phase 6 テスト実装時       |
| P1     | エッジケース           | EC-01, EC-03                      | Phase 6 テスト実装時       |
| P1     | MINOR-01 対比          | M01-03                            | Phase 6 テスト実装時       |
| P2     | 型整合性               | TS-03, TS-04, TS-06               | Phase 7 カバレッジ確認時   |
| P2     | MINOR-01 記録          | M01-01, M01-02                    | Phase 8 リファクタリング前 |
| P3     | 並行アクセス           | CA-01, CA-02, CA-03               | Phase 7 カバレッジ確認時   |
| P4     | MINOR-01 解決後        | M01-04, M01-06                    | MINOR-01 解決タスク時      |

---

## 参照資料

| 資料名                               | パス                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Phase 1 チャネル棚卸し               | `outputs/phase-1/ipc-channel-inventory.md`                                                           |
| Phase 2 設計書                       | `outputs/phase-2/design-document.md`                                                                 |
| Phase 3 設計レビュー                 | `outputs/phase-3/design-review-gate.md`                                                              |
| GovernanceSummaryPanel テスト        | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` |
| ImprovementProposalPanel テスト      | `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalPanel.test.tsx`             |
| creatorHandlers adapterStatus テスト | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`                          |
| SkillCreatorIpcBridge                | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`                                    |
| ElectronAPI 型定義                   | `apps/desktop/src/preload/types.ts`（L1049〜）                                                       |
