# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 6                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

Phase 5 の実装が GREEN になった後、現在の `HooksFactory.producer.test.ts` がどこまでエッジケースをカバーしているかを整理する。mainWindow 破棄系と複数パターン系は既にカバー済みで、AbortSignal 系は別スコープとして扱う。

---

## 前提条件

| 条件                                                     | 確認コマンド                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| Phase 5 実装が完了し、全 7 件のテストが GREEN であること | `pnpm --filter @repo/desktop test -- HooksFactory.producer.test.ts` |
| 既存テストが PASS していること                           | `pnpm --filter @repo/desktop test -- HooksFactory.test.ts`          |
| `tsc --noEmit` が 0 エラーであること                     | `pnpm --filter @repo/desktop typecheck`                             |

---

## 現状のエッジケース整理

### `HooksFactory.producer.test.ts` への追加

| No. | テスト名                                                               | 対応要件   | 追加理由                                       |
| --- | ---------------------------------------------------------------------- | ---------- | ---------------------------------------------- |
| E-1 | mainWindow が破棄された状態でのフォールバック（send が呼ばれないこと） | 済み       | 既存ガードで確認済み                           |
| E-2 | 複数の危険パターンが 1 コマンドに含まれる場合に 1 回のみ発火すること   | 済み       | `for...of` の最初のマッチで return             |
| E-3 | AbortSignal による中断時に pushApprovalRequest が呼ばれないこと        | 別スコープ | 現在の HooksFactory は signal を直接見ていない |

---

## テストコード

### E-1: mainWindow 破棄済み時のフォールバック

```typescript
describe("エッジケース: mainWindow 破棄済み時のフォールバック", () => {
  it("mainWindow が破棄済みの場合に webContents.send が呼ばれないこと", async () => {
    // pushApprovalRequest の実装（approvalHandlers.ts）は
    // window.isDestroyed() / webContents.isDestroyed() を確認してガードしている
    // このテストでは HooksFactory 経由で pushApprovalRequest が呼ばれても
    // 実際の send が行われないことを確認する

    // 実際の pushApprovalRequest を使用するため、モックを解除する
    vi.unmock("../../ipc/approvalHandlers");

    const destroyedWindow = {
      webContents: {
        send: vi.fn(),
        isDestroyed: vi.fn().mockReturnValue(true),
      },
      isDestroyed: vi.fn().mockReturnValue(true),
    } as unknown as BrowserWindow;

    const { pushApprovalRequest: realPushApprovalRequest } =
      await import("../../ipc/approvalHandlers");
    const destroyedFactory = new HooksFactory(
      destroyedWindow,
      "test-execution-id",
      new PermissionResolver(),
      mockApprovalGate,
      "test-session-id",
    );

    // pushApprovalRequest 実装を差し替えてスパイ
    const spyPush = vi.spyOn(
      await import("../../ipc/approvalHandlers"),
      "pushApprovalRequest",
    );

    const hooks = destroyedFactory.createHooks();
    await hooks.PreToolUse!(
      { toolName: "Bash", args: { command: "rm -rf /tmp" } },
      "tool-use-id",
      { signal: new AbortController().signal },
    );

    // pushApprovalRequest は呼ばれるが、内部の send は呼ばれない
    expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();

    // クリーンアップ
    spyPush.mockRestore();
    vi.mock("../../ipc/approvalHandlers", () => ({
      pushApprovalRequest: vi.fn(),
    }));
  });
});
```

**実装のポイント**: `pushApprovalRequest` 関数（`approvalHandlers.ts`）は内部で `window.isDestroyed()` と `webContents.isDestroyed()` を確認している。破棄済みウィンドウではガードが働き `webContents.send` は呼ばれない。

---

### E-2: 複数パターンが 1 コマンドに含まれる場合

```typescript
describe("エッジケース: 複数危険パターンの 1 コマンド内共存", () => {
  it("複数の危険パターンが 1 コマンドに含まれる場合に pushApprovalRequest が 1 回のみ呼ばれること", async () => {
    const hooks = hooksFactory.createHooks();

    // "rm -rf" と "sudo" の両方を含むコマンド
    // for ループは最初にマッチしたパターンで return するため 1 回のみ呼ばれる
    const result = await hooks.PreToolUse!(
      {
        toolName: "Bash",
        args: { command: "sudo rm -rf /important && chmod 777 /etc" },
      },
      "tool-use-id",
      { signal: new AbortController().signal },
    );

    expect(pushApprovalRequestMock).toHaveBeenCalledTimes(1);
    expect(result.proceed).toBe(false);
  });

  it("pushApprovalRequest の description が最初にマッチしたパターンを含むこと", async () => {
    const hooks = hooksFactory.createHooks();

    await hooks.PreToolUse!(
      { toolName: "Bash", args: { command: "sudo rm -rf /" } },
      "tool-use-id",
      { signal: new AbortController().signal },
    );

    // 最初にマッチしたパターンが description に含まれる
    const calledPayload = pushApprovalRequestMock.mock.calls[0][1];
    expect(calledPayload.description).toMatch(/Dangerous command blocked:/);
  });
});
```

---

### E-3: AbortSignal による中断時の動作

```typescript
describe("エッジケース: AbortSignal による中断", () => {
  it("signal.aborted が true の場合に pushApprovalRequest が呼ばれないこと", async () => {
    const controller = new AbortController();
    controller.abort(); // 事前に中断済み

    const hooks = hooksFactory.createHooks();

    // AbortSignal が aborted 状態の場合
    // PreToolUse の実装が signal を考慮している場合はスキップされる
    // 現在の実装は signal を直接チェックしていないため、この挙動は実装依存
    // Phase 6 では「aborted でも危険コマンド検出は行われ pushApprovalRequest が呼ばれる」
    // ことを確認するか、signal チェックを追加する判断を記録する
    const result = await hooks.PreToolUse!(
      { toolName: "Bash", args: { command: "rm -rf /tmp" } },
      "tool-use-id",
      { signal: controller.signal },
    );

    // 現在の実装: AbortSignal のチェックなし → 危険コマンド検出は通常通り行われる
    // 将来的に signal チェックを追加する場合は期待値を変更する
    // 現状: pushApprovalRequest が呼ばれ、proceed: false が返る
    expect(result.proceed).toBe(false);
    // signal.aborted でも pushApprovalRequest は呼ばれる（現在の仕様）
    expect(pushApprovalRequestMock).toHaveBeenCalledTimes(1);
  });
});
```

**補足**: `AbortSignal` チェックを `createPreToolUseHook()` に追加する場合は、Phase 7 カバレッジ確認後に別タスクとして検討する。現フェーズでは現在の動作を文書化する。

---

## カバレッジ向上方針

### 対象ブランチ

Phase 4 (7 件) で以下のブランチをカバーする:

| ブランチ                                        | カバー方法               | 担当テスト      |
| ----------------------------------------------- | ------------------------ | --------------- |
| `command.includes(pattern)` → true              | 危険コマンド検出テスト   | テスト 1-4, E-2 |
| `command.includes(pattern)` → false             | 安全コマンドテスト       | テスト 5        |
| `input.toolName === "Bash"` → true              | Bash ツール検出テスト    | テスト 1-4      |
| `input.toolName === "Bash"` → false             | 非 Bash ツールテスト     | 既存テスト      |
| `mainWindow.isDestroyed()` → true               | 破棄済みウィンドウテスト | E-1             |
| 複数パターンマッチ（`for` ループ早期 `return`） | 複数パターン共存テスト   | E-2             |
| `signal.aborted` → true                         | 別スコープ               | -               |

### 除外してよいブランチ

| ブランチ                | 理由                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `approvalGate` 使用箇所 | HooksFactory では DI 受け渡しのみで、producer 本体の分岐対象ではない |

---

## 実行コマンド

```bash
# エッジケース追加後の全テスト実行
pnpm --filter @repo/desktop test -- HooksFactory.producer.test.ts

# 期待結果: 計 7 件 PASS

# カバレッジ付き実行（Phase 7 へのプレビュー）
pnpm --filter @repo/desktop test -- --coverage \
  apps/desktop/src/main/services/agent/HooksFactory.ts
```

---

## 参照資料

| 資料名                    | パス                                                   | 説明                         |
| ------------------------- | ------------------------------------------------------ | ---------------------------- |
| phase-4-test-creation.md  | `./phase-4-test-creation.md`                           | RED テスト仕様（7 件）       |
| phase-5-implementation.md | `./phase-5-implementation.md`                          | 実装仕様                     |
| HooksFactory.ts           | `apps/desktop/src/main/services/agent/HooksFactory.ts` | 実装対象                     |
| approvalHandlers.ts       | `apps/desktop/src/main/ipc/approvalHandlers.ts`        | `pushApprovalRequest()` 実装 |

---

## 成果物

| 成果物               | パス                                                                           | 説明          |
| -------------------- | ------------------------------------------------------------------------------ | ------------- |
| テスト拡充仕様書     | `phase-6-test-expansion.md`                                                    | 本ファイル    |
| テストファイル追加分 | `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts` | E-1〜E-3 追加 |

---

## 完了条件

- [ ] `HooksFactory.producer.test.ts` の 7 件が全て PASS している
- [ ] 既存テスト（`HooksFactory.test.ts`）が引き続き PASS している
- [ ] `tsc --noEmit` が 0 エラーで通過する
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## 次の Phase

Phase 7: カバレッジ確認 → [phase-7-coverage-check.md](phase-7-coverage-check.md)

## 実行タスク

- AbortSignal まわりのキャンセル経路を確認する
- dangerous command の追加エッジケースを洗い出す
- 失敗時のメッセージと status 送信を確認する

## 統合テスト連携

- Phase 5 の実装結果と併せて回帰を確認する
- Phase 7 の coverage 観点にエッジケースを引き継ぐ
