# Phase 6: テスト拡充 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| Phase   | 6 - テスト拡充                              |
| 機能名  | task-rt-01-llm-adapter-error-propagation    |
| 作成日  | 2026-04-04                                  |
| 前Phase | [Phase 5: 実装](phase-05-implementation.md) |

## 目的

Phase 4 で作成した基本テストに加え、エッジケース・push 通知フロー・競合状態を追加テストする。
Phase 5 実装でカバーしきれなかった境界条件を網羅し、将来的なリグレッションを防止する。

## 実行タスク

- **push 通知統合テスト追加**: `setLLMAdapterFailed()` 〜 Renderer 受信までのエンドツーエンドフローをテスト
- **競合状態テスト追加**: マウント中のアンマウント・複数の連続 push を検証
- **境界値テスト追加**: `failureReason` の特殊文字・長大文字列・null/undefined
- **SkillLifecyclePanel 統合テスト追加**: バナーが正しく表示・非表示になることを統合レベルで確認

## 参照資料

| 資料名                     | パス                                                                                | 用途               |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------ |
| Phase 4 テストファイル     | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`         | 追加対象           |
| Phase 5 実装済みコード     | `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`              | テスト対象         |
| SkillLifecyclePanel テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | 統合テストパターン |

---

## テスト拡充 1: IPC ハンドラ追加テスト

**追加先**: `creatorHandlers.adapterStatus.test.ts`

### 追加テストケース

| テストID | 説明                            | テスト内容                                                                                                |
| -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| T-IPC-09 | initializing 状態               | `llmAdapterStatus === "initializing"` のとき `{ status: "initializing", failureReason: null }` が返ること |
| T-IPC-10 | onAdapterStatusChanged の冪等性 | 同一状態への遷移でも `webContents.send` が呼ばれること                                                    |
| T-IPC-11 | 複数回 push                     | `onAdapterStatusChanged` が連続して呼ばれたとき各々 `webContents.send` が呼ばれること                     |
| T-IPC-12 | sender validation 失敗時        | `validateIpcSender` が例外をスローしたとき、その例外が伝播すること                                        |

```typescript
// T-IPC-09
it("initializing 状態のとき { status: 'initializing', failureReason: null } が返る", async () => {
  service = createMockService("initializing", null);
  registerRuntimeSkillCreatorHandlers(mainWindow, service);

  const handler = handlerMap.get(
    IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
  )!;
  const result = await handler(createMockEvent());

  expect(result).toEqual({
    success: true,
    data: { status: "initializing", failureReason: null },
  });
});

// T-IPC-10
it("onAdapterStatusChanged が同一状態への遷移でも webContents.send を呼ぶ（冪等性）", () => {
  registerRuntimeSkillCreatorHandlers(mainWindow, service);
  service.onAdapterStatusChanged!("ready", null);
  service.onAdapterStatusChanged!("ready", null);

  expect(mainWindow.webContents.send).toHaveBeenCalledTimes(2);
});

// T-IPC-11
it("onAdapterStatusChanged が連続して呼ばれたとき各々 webContents.send が呼ばれる", () => {
  registerRuntimeSkillCreatorHandlers(mainWindow, service);
  service.onAdapterStatusChanged!("ready", null);
  service.onAdapterStatusChanged!("failed", "API key error");
  service.onAdapterStatusChanged!("ready", null);

  expect(mainWindow.webContents.send).toHaveBeenCalledTimes(3);
  expect(mainWindow.webContents.send).toHaveBeenNthCalledWith(
    2,
    IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
    { status: "failed", failureReason: "API key error" },
  );
});

// T-IPC-12
it("validateIpcSender が例外をスローしたとき例外が伝播する", async () => {
  vi.mocked(validateIpcSender).mockImplementationOnce(() => {
    throw new Error("unauthorized sender");
  });
  registerRuntimeSkillCreatorHandlers(mainWindow, service);

  const handler = handlerMap.get(
    IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
  )!;
  await expect(handler(createMockEvent())).rejects.toThrow(
    "unauthorized sender",
  );
});
```

---

## テスト拡充 2: LLMAdapterErrorBanner 追加テスト

**追加先**: `LLMAdapterErrorBanner.test.tsx`

### 追加テストケース

| テストID | 説明                        | テスト内容                                                                                 |
| -------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| T-BAN-10 | API key 大文字小文字        | `failureReason` に "API Key"（大文字混在）が含まれるとき APIキーメッセージが表示されること |
| T-BAN-11 | 長大な failureReason        | 1000文字の `failureReason` でもレンダリングが成功すること                                  |
| T-BAN-12 | status 変化の再レンダリング | `status` が `"failed"` → `"ready"` に変わったときバナーが消えること                        |
| T-BAN-13 | アクセシビリティ            | バナーに `role="alert"` があること                                                         |

```tsx
// T-BAN-10
it("failureReason に 'API Key'（大文字混在）が含まれるとき APIキーメッセージが表示される", () => {
  render(
    <LLMAdapterErrorBanner
      status="failed"
      failureReason="Invalid API Key provided"
    />,
  );
  expect(screen.getByText(/APIキーが設定されていないか/)).toBeInTheDocument();
});

// T-BAN-11
it("1000文字の failureReason でもレンダリングが成功する", () => {
  const longReason = "x".repeat(1000);
  expect(() => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason={longReason} />,
    );
  }).not.toThrow();
  expect(screen.getByRole("alert")).toBeInTheDocument();
});

// T-BAN-12
it("status が 'failed' から 'ready' に変わったときバナーが消える", () => {
  const { rerender } = render(
    <LLMAdapterErrorBanner status="failed" failureReason="error" />,
  );
  expect(screen.getByRole("alert")).toBeInTheDocument();

  rerender(<LLMAdapterErrorBanner status="ready" failureReason={null} />);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

// T-BAN-13
it("バナーに role='alert' がある（アクセシビリティ）", () => {
  render(<LLMAdapterErrorBanner status="failed" failureReason="error" />);
  const alert = screen.getByRole("alert");
  expect(alert).toBeInTheDocument();
});
```

---

## テスト拡充 3: useLLMAdapterStatus 追加テスト

**追加先**: `useLLMAdapterStatus.test.ts`

### 追加テストケース

| テストID | 説明                          | テスト内容                                                                        |
| -------- | ----------------------------- | --------------------------------------------------------------------------------- |
| T-HK-07  | pull 失敗時の状態維持         | `getAdapterStatus()` が `{ success: false }` を返したとき `"initializing"` のまま |
| T-HK-08  | 複数回 push の最終状態        | 連続して push が届いたとき最後の状態が保持されること                              |
| T-HK-09  | push の failureReason が null | push payload の `failureReason` が `null` でも状態が更新されること                |

```typescript
// T-HK-07
it("pull が success: false を返したとき状態は initializing のまま", async () => {
  const { api } = createMockApi({ success: false });
  vi.spyOn(window, "electronAPI", "get").mockReturnValue({
    skillCreator: api,
  } as unknown);

  const { result } = renderHook(() => useLLMAdapterStatus());
  await waitFor(() => expect(api.getAdapterStatus).toHaveBeenCalled());

  expect(result.current.status).toBe("initializing");
});

// T-HK-08
it("連続して push が届いたとき最後の状態が保持される", async () => {
  const { api, triggerPush } = createMockApi();
  vi.spyOn(window, "electronAPI", "get").mockReturnValue({
    skillCreator: api,
  } as unknown);

  const { result } = renderHook(() => useLLMAdapterStatus());
  await waitFor(() => expect(result.current.status).toBe("ready"));

  act(() => {
    triggerPush({ status: "failed", failureReason: "error 1" });
    triggerPush({ status: "failed", failureReason: "error 2" });
    triggerPush({ status: "ready", failureReason: null });
  });

  expect(result.current).toEqual({ status: "ready", failureReason: null });
});

// T-HK-09
it("push payload の failureReason が null でも状態が更新される", async () => {
  const { api, triggerPush } = createMockApi();
  vi.spyOn(window, "electronAPI", "get").mockReturnValue({
    skillCreator: api,
  } as unknown);

  const { result } = renderHook(() => useLLMAdapterStatus());
  await waitFor(() => expect(result.current.status).toBe("ready"));

  act(() => {
    triggerPush({ status: "ready", failureReason: null });
  });

  expect(result.current).toEqual({ status: "ready", failureReason: null });
});
```

---

## テスト拡充 4: SkillLifecyclePanel 統合テスト追加

**追加先**: `SkillLifecyclePanel.test.tsx`（または新規 `SkillLifecyclePanel.adapter-status.test.tsx`）

### 追加テストケース

| テストID | 説明                          | テスト内容                                                                                   |
| -------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| T-SLP-01 | failed 時にバナーが表示される | `useLLMAdapterStatus` が `"failed"` を返したとき `llm-adapter-error-banner` が表示されること |
| T-SLP-02 | ready 時にバナーが非表示      | `useLLMAdapterStatus` が `"ready"` を返したとき `llm-adapter-error-banner` が存在しないこと  |

```tsx
// SkillLifecyclePanel の useLLMAdapterStatus をモック
vi.mock("../hooks/useLLMAdapterStatus", () => ({
  useLLMAdapterStatus: vi
    .fn()
    .mockReturnValue({ status: "failed", failureReason: "API key error" }),
}));

// T-SLP-01
it("useLLMAdapterStatus が 'failed' を返したときエラーバナーが表示される", () => {
  // SkillLifecyclePanel の最小 props で render
  render(<SkillLifecyclePanel {...minimalProps} />);
  expect(screen.getByTestId("llm-adapter-error-banner")).toBeInTheDocument();
});

// T-SLP-02
it("useLLMAdapterStatus が 'ready' を返したときエラーバナーが非表示", () => {
  vi.mocked(useLLMAdapterStatus).mockReturnValue({
    status: "ready",
    failureReason: null,
  });
  render(<SkillLifecyclePanel {...minimalProps} />);
  expect(
    screen.queryByTestId("llm-adapter-error-banner"),
  ).not.toBeInTheDocument();
});
```

---

## テスト実行確認

```bash
# 拡充後の全テスト
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts
```

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                                                     |
| ------------------ | ------------------------------------------------------------ |
| 競合状態           | アンマウント中の非同期結果・連続 push が正しく処理されるか   |
| 境界値             | 長大文字列・null・大文字小文字の変形で動作が保証されているか |
| リグレッション防止 | `status` 変化による再レンダリングが正しくテストされているか  |

## サブタスク管理

| ID     | 内容                                   | ステータス |
| ------ | -------------------------------------- | ---------- |
| ST-6-1 | IPC ハンドラ追加テスト (4件)           | 未実施     |
| ST-6-2 | LLMAdapterErrorBanner 追加テスト (4件) | 未実施     |
| ST-6-3 | useLLMAdapterStatus 追加テスト (3件)   | 未実施     |
| ST-6-4 | SkillLifecyclePanel 統合テスト (2件)   | 未実施     |
| ST-6-5 | 全追加テストの PASS 確認               | 未実施     |

## 成果物

| 成果物               | パス                                        |
| -------------------- | ------------------------------------------- |
| 拡充後テスト実行ログ | `outputs/phase-6/test-expansion-results.md` |

## 完了条件

- [ ] 追加テスト（計 13 件）が全て実装されている
- [ ] 追加テストが全て PASS している
- [ ] 既存テストがリグレッションしていない

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-6/` に配置した
- [ ] `artifacts.json` の Phase 6 を `completed` に更新した

## 統合テスト連携

本 Phase のテスト成果物は後続 Phase の品質確認・ゲート判定に使用される。

| Phase   | 連携内容                                  |
| ------- | ----------------------------------------- |
| Phase 5 | テスト GREEN を確認してから実装完了とする |
| Phase 9 | 品質保証フェーズで最終確認する            |

## 次Phase

Phase 6 完了後 → [Phase 7: テストカバレッジ確認](phase-07-coverage.md) へ進む
