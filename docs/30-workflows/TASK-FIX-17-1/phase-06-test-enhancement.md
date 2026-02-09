# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                 |
| --------- | ---------------------------------- |
| Phase     | 6                                  |
| タスクID  | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| タスク名  | skill:scan IPCハンドラーの新規追加 |
| 作成日    | 2026-02-08                         |
| 前提Phase | Phase 5（実装）                    |

## 目的

境界値テスト、エラー系テスト、セキュリティテストを追加し、テストカバレッジを向上させる。

---

## 実行タスク

### Task 1: 境界値・エラー系テスト追加

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`

**追加テストケース**:

| テストID | テスト項目                               | 期待結果                            |
| -------- | ---------------------------------------- | ----------------------------------- |
| SH-SC-06 | 空のスキルリストが返される場合           | `{ success: true, data: [] }` 形式  |
| SH-SC-07 | キャッシュがクリアされて再スキャンされる | `forceRefresh=true` で呼び出し確認  |
| SH-SC-08 | DevTools からの呼び出しが拒否される      | `validateIpcSender` が `false` 返却 |
| SH-SC-09 | 一般的なError以外の例外が発生した場合    | デフォルトエラーメッセージ返却      |
| SH-SC-10 | unregisterSkillHandlers で解除される     | `removeHandler` が呼び出される      |

**実装コード**:

```typescript
describe("skill:scan (extended)", () => {
  it("SH-SC-06: should return empty array when no skills found", async () => {
    const mockData: SkillScanResult = {
      skills: [],
      errors: [],
      scannedAt: new Date(),
    };
    mockSkillService.scanAvailableSkills.mockResolvedValue(mockData);

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When: スキルが0件の場合
    const result = await handler({});

    // Then: 空配列が返される
    const opResult = result as OperationResult<Skill[]>;
    expect(opResult.success).toBe(true);
    expect(opResult.data).toEqual([]);
  });

  it("SH-SC-07: should always use forceRefresh=true for cache clear", async () => {
    const mockData: SkillScanResult = {
      skills: [],
      errors: [],
      scannedAt: new Date(),
    };
    mockSkillService.scanAvailableSkills.mockResolvedValue(mockData);

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When: 複数回呼び出す
    await handler({});
    await handler({});

    // Then: 常にforceRefresh=trueで呼び出される
    expect(mockSkillService.scanAvailableSkills).toHaveBeenCalledTimes(2);
    expect(mockSkillService.scanAvailableSkills).toHaveBeenNthCalledWith(
      1,
      true,
    );
    expect(mockSkillService.scanAvailableSkills).toHaveBeenNthCalledWith(
      2,
      true,
    );
  });

  it("SH-SC-08: should reject calls from DevTools", async () => {
    const { validateIpcSender } =
      await import("../../infrastructure/security/ipc-validator.js");

    // Given: DevToolsからの呼び出し
    (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
      valid: false,
      errorCode: "IPC_DEVTOOLS_NOT_ALLOWED",
      errorMessage: "DevTools sender not allowed",
    });

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When & Then: 例外がスローされる
    await expect(handler({})).rejects.toMatchObject({
      success: false,
      error: expect.objectContaining({
        code: expect.stringContaining("IPC"),
      }),
    });
  });

  it("SH-SC-09: should return default error message for non-Error exceptions", async () => {
    // Given: Error以外の例外
    mockSkillService.scanAvailableSkills.mockRejectedValue("Unknown error");

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When: 例外が発生
    const result = await handler({});

    // Then: デフォルトメッセージが返される
    const opResult = result as OperationResult<Skill[]>;
    expect(opResult.success).toBe(false);
    expect(opResult.error).toBe("スキャンに失敗しました");
  });

  it("SH-SC-10: should be removed by unregisterSkillHandlers", async () => {
    try {
      const { unregisterSkillHandlers } = await import("../skillHandlers");

      // When: unregisterSkillHandlersを呼び出す
      unregisterSkillHandlers();

      // Then: SKILL_SCANのremoveHandlerが呼び出される
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("skill:scan");
    } catch {
      throw new Error("unregisterSkillHandlers not implemented");
    }
  });
});
```

### Task 2: セキュリティテスト拡充

**目的**: IPC セキュリティ原則に基づくテストを追加

**追加テストケース**:

| テストID | テスト項目                                     | 期待結果             |
| -------- | ---------------------------------------------- | -------------------- |
| SH-SC-11 | 未知のウィンドウからの呼び出しが拒否される     | バリデーションエラー |
| SH-SC-12 | 破棄されたウィンドウからの呼び出しが拒否される | バリデーションエラー |

**実装コード**:

```typescript
describe("skill:scan security", () => {
  it("SH-SC-11: should reject calls from unknown window", async () => {
    const { validateIpcSender } =
      await import("../../infrastructure/security/ipc-validator.js");

    // Given: 未知のウィンドウからの呼び出し
    (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
      valid: false,
      errorCode: "IPC_UNAUTHORIZED",
      errorMessage: "Unknown window",
    });

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When & Then: 例外がスローされる
    await expect(handler({})).rejects.toBeDefined();
  });

  it("SH-SC-12: should reject calls from destroyed window", async () => {
    const { validateIpcSender } =
      await import("../../infrastructure/security/ipc-validator.js");

    // Given: 破棄されたウィンドウからの呼び出し
    (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
      valid: false,
      errorCode: "IPC_WINDOW_DESTROYED",
      errorMessage: "Window has been destroyed",
    });

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When & Then: 例外がスローされる
    await expect(handler({})).rejects.toBeDefined();
  });
});
```

---

## 参照資料

| 資料名             | パス                                                     | 説明                |
| ------------------ | -------------------------------------------------------- | ------------------- |
| Phase 4成果物      | `phase-outputs/TASK-FIX-17-1/phase-04-test-creation.md`  | 基本テスト仕様      |
| Phase 5成果物      | `phase-outputs/TASK-FIX-17-1/phase-05-implementation.md` | 実装仕様            |
| セキュリティルール | `.claude/rules/04-electron-security.md`                  | IPCセキュリティ原則 |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                       | テスト設計の注意点  |

---

## テストカバレッジ目標

| 指標              | 現在値 | 目標値 | 達成基準 |
| ----------------- | ------ | ------ | -------- |
| Line Coverage     | -      | 80%+   | 最低基準 |
| Branch Coverage   | -      | 60%+   | 最低基準 |
| Function Coverage | -      | 80%+   | 最低基準 |

---

## 成果物

| 成果物           | パス                                                        | 説明             |
| ---------------- | ----------------------------------------------------------- | ---------------- |
| 拡充テストコード | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 追加テストケース |
| テスト拡充仕様書 | `phase-outputs/TASK-FIX-17-1/phase-06-test-enhancement.md`  | 本ドキュメント   |

---

## 完了条件

- [ ] SH-SC-06: 空配列テストが追加されている
- [ ] SH-SC-07: キャッシュクリア確認テストが追加されている
- [ ] SH-SC-08: DevTools拒否テストが追加されている
- [ ] SH-SC-09: 非Errorエラーハンドリングテストが追加されている
- [ ] SH-SC-10: unregister確認テストが追加されている
- [ ] SH-SC-11〜12: セキュリティテストが追加されている
- [ ] 全テストが PASS する

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "skill:scan"

# 確認項目
# - [ ] SH-SC-01 〜 SH-SC-12 がすべて PASS
# - [ ] カバレッジレポートで skill:scan 関連の行が網羅されている
```

---

## 次のPhase

Phase 7: カバレッジ確認
