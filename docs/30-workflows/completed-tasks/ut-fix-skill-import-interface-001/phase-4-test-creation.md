# Phase 4: テスト作成 — skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| Phase    | 4（テスト作成）                      |
| 機能名   | skill:import IPCインターフェース修正 |
| タスクID | UT-FIX-SKILL-IMPORT-INTERFACE-001    |
| 作成日   | 2026-02-21                           |

## 目的

TDD Red段階として、修正後のskill:importハンドラインターフェース（`string`直接受け取り + P42準拠3段バリデーション）に合わせたテストケースを作成する。既存テスト（SH-IMP-01〜SH-IMP-06）は旧インターフェース（`{ skillIds: string[] }`）を前提としているため、新インターフェース（`skillName: string`）に合わせて書き換える。

## 実行タスク

- テストセクション置換: 既存の skill:import テスト（SH-IMP-01〜SH-IMP-06）を新インターフェース対応の7ケースへ置換する
- Red確認: 現行実装（`{ skillIds: string[] }`）ではテストがFAILすることを確認する

## 参照資料

| 資料                                     | パス / 説明                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件定義                         | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-1-requirements.md`       | 受入基準（FR/QR）の確認  |
| Phase 2 設計                             | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-2-design.md`             | テスト観点と設計整合確認 |
| Phase 3 設計レビュー                     | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-3-design-review.md`      | レビュー判定の反映       |
| 現行実装                                 | `apps/desktop/src/main/ipc/skillHandlers.ts:120-138`                                |
| 現行テスト                               | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts:633-740`                 |
| skill:remove修正済みテスト               | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts:746-982`（パターン参考） |
| Preload側テスト（変更不要）              | `apps/desktop/src/preload/__tests__/skill-api.test.ts:1042-1046`                    |
| P42: .trim()バリデーション               | `.claude/rules/06-known-pitfalls.md` — 3段バリデーション必須                        |
| P44: import/removeインターフェース不整合 | `.claude/rules/06-known-pitfalls.md` — 本タスクの根本原因                           |
| P41: v8カバレッジ                        | `.claude/rules/06-known-pitfalls.md` — getAllowedWindowsコールバック検証            |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                            |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------- |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | `skill:import` 契約のテスト観点 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill API型・戻り値整合         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | sender検証・入力検証            |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P23/P32/P42/P44 統合確認        |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 異常系テスト観点                |

## 実行手順

### Step 1: テストケース設計

以下の7テストケースを設計する。skill:remove のテストパターン（SH-RM-01〜SH-RM-11）を参考に、skill:import 固有の仕様（`importSkills([skillName])`で配列化して渡す）を反映する。

| テストID  | テスト名                                                           | 入力値              | 期待結果                                                                                | 検証観点         |
| --------- | ------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------- | ---------------- |
| SH-IMP-01 | 正常なスキル名で`importSkills([skillName])`が呼ばれること          | `"test-skill"`      | `mockSkillService.importSkills(["test-skill"])` が呼ばれる                              | 正常系・配列化   |
| SH-IMP-02 | `typeof !== "string"` の場合VALIDATION_ERROR                       | `123`（数値）       | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` をthrow | 型バリデーション |
| SH-IMP-03 | 空文字列の場合VALIDATION_ERROR                                     | `""`                | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` をthrow | 空文字列         |
| SH-IMP-04 | スペースのみの文字列の場合VALIDATION_ERROR（P42）                  | `"   "`             | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` をthrow | P42 trim()       |
| SH-IMP-05 | sender検証が正しいチャンネルとオプションで呼ばれること             | `"valid-skill"`     | `validateIpcSender(event, "skill:import", { getAllowedWindows })` が呼ばれる            | セキュリティ     |
| SH-IMP-06 | `skillService.importSkills()`が配列引数`[skillName]`で呼ばれること | `"my-skill"`        | `mockSkillService.importSkills(["my-skill"])` が呼ばれる                                | 配列ラップ       |
| SH-IMP-07 | サービスエラーがそのまま伝播すること                               | （サービスがthrow） | サービスのエラーがそのまま呼び出し元にthrowされる                                       | エラーサニタイズ |

### Step 2: テストコード作成

`apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` の skill:import セクション（`describe("skill:import", ...)` ブロック、行633〜740）を以下のコードで置換する。

```typescript
// ===========================================================================
// skill:import
// ===========================================================================

describe("skill:import", () => {
  it("SH-IMP-01: should call skillService.importSkills with [skillName]", async () => {
    const mockResult: ImportResult = {
      success: true,
      importedCount: 1,
      errors: [],
    };
    mockSkillService.importSkills.mockResolvedValue(mockResult);

    const handler = handlers.get(SKILL_CHANNELS.IMPORT);
    if (!handler) {
      throw new Error("skill:import handler not registered");
    }

    // When: 文字列skillNameを渡してハンドラーを呼び出す
    const result = await handler({}, "test-skill");

    // Then: skillService.importSkillsが配列["test-skill"]で呼び出される
    expect(mockSkillService.importSkills).toHaveBeenCalledWith(["test-skill"]);
    expect((result as ImportResult).importedCount).toBe(1);
  });

  it("SH-IMP-02: should throw VALIDATION_ERROR when skillName is not a string", async () => {
    const handler = handlers.get(SKILL_CHANNELS.IMPORT);
    if (!handler) {
      throw new Error("skill:import handler not registered");
    }

    // When: 数値を渡す
    try {
      await handler({}, 123);
      throw new Error("Expected validation error");
    } catch (error) {
      // Then: VALIDATION_ERRORがスローされる
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-IMP-03: should throw VALIDATION_ERROR for empty string", async () => {
    const handler = handlers.get(SKILL_CHANNELS.IMPORT);
    if (!handler) {
      throw new Error("skill:import handler not registered");
    }

    // When: 空文字列を渡す
    try {
      await handler({}, "");
      throw new Error("Expected validation error");
    } catch (error) {
      // Then: VALIDATION_ERRORがスローされる
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-IMP-04: should throw VALIDATION_ERROR for whitespace-only string (P42)", async () => {
    const handler = handlers.get(SKILL_CHANNELS.IMPORT);
    if (!handler) {
      throw new Error("skill:import handler not registered");
    }

    // When: スペースのみの文字列を渡す
    try {
      await handler({}, "   ");
      throw new Error("Expected validation error");
    } catch (error) {
      // Then: .trim()によりVALIDATION_ERRORがスローされる
      expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      expect((error as { message: string }).message).toBe(
        "skillName must be a non-empty string",
      );
    }
  });

  it("SH-IMP-05: should call validateIpcSender with correct channel and options", async () => {
    const { validateIpcSender } =
      await import("../../infrastructure/security/ipc-validator.js");

    mockSkillService.importSkills.mockResolvedValue({
      success: true,
      importedCount: 1,
      errors: [],
    });

    const handler = handlers.get(SKILL_CHANNELS.IMPORT);
    if (!handler) {
      throw new Error("skill:import handler not registered");
    }

    await handler({}, "valid-skill");

    // Then: validateIpcSender が正しい引数で呼ばれている
    expect(validateIpcSender).toHaveBeenCalledWith(
      {},
      SKILL_CHANNELS.IMPORT,
      expect.objectContaining({
        getAllowedWindows: expect.any(Function),
      }),
    );

    // P41準拠: getAllowedWindows コールバックの戻り値を明示的に検証
    const callArgs = (
      validateIpcSender as ReturnType<typeof vi.fn>
    ).mock.calls.find((call: unknown[]) => call[1] === SKILL_CHANNELS.IMPORT);
    if (callArgs && callArgs[2]?.getAllowedWindows) {
      const windows = callArgs[2].getAllowedWindows();
      expect(windows).toContain(mockMainWindow);
    }
  });

  it("SH-IMP-06: should wrap skillName in array when calling importSkills", async () => {
    mockSkillService.importSkills.mockResolvedValue({
      success: true,
      importedCount: 1,
      errors: [],
    });

    const handler = handlers.get(SKILL_CHANNELS.IMPORT);
    if (!handler) {
      throw new Error("skill:import handler not registered");
    }

    // When: 単一のskillNameを渡す
    await handler({}, "my-skill");

    // Then: importSkillsが配列["my-skill"]で呼ばれる（配列ラップの確認）
    const callArgs = mockSkillService.importSkills.mock.calls[0];
    expect(callArgs[0]).toEqual(["my-skill"]);
    expect(Array.isArray(callArgs[0])).toBe(true);
    expect(callArgs[0]).toHaveLength(1);
  });

  it("SH-IMP-07: should propagate skillService.importSkills error", async () => {
    const serviceError = new Error("Import failed");
    mockSkillService.importSkills.mockRejectedValue(serviceError);

    const handler = handlers.get(SKILL_CHANNELS.IMPORT);
    if (!handler) {
      throw new Error("skill:import handler not registered");
    }

    // When: サービスがエラーをスローする
    try {
      await handler({}, "error-skill");
      throw new Error("Expected service error");
    } catch (error) {
      // Then: サービスのエラーがそのまま伝播する
      expect(error).toBe(serviceError);
      expect((error as Error).message).toBe("Import failed");
    }
  });
});
```

### Step 3: Red段階の確認

テスト作成後、現行実装（`{ skillIds: string[] }`受け取り）のままでテストを実行し、新テストがFAILすることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

期待されるFAIL結果:

- SH-IMP-01: `importSkills` が `["test-skill"]` ではなく `undefined`（`args.skillIds`が`undefined`）でエラー
- SH-IMP-02: `{ code: "VALIDATION_ERROR" }` ではなく `{ code: "VALIDATION_ERROR", message: "skillIds must be an array" }` で異なるメッセージ
- SH-IMP-03: 同上
- SH-IMP-04: 旧実装に `.trim()` チェックがないためPASSしない
- SH-IMP-05: PASSする可能性あり（sender検証は既存）
- SH-IMP-06: SH-IMP-01と同じ理由でFAIL
- SH-IMP-07: PASSする可能性あり（エラー伝播は既存挙動）

最低4テスト（SH-IMP-01〜SH-IMP-04）がFAILすることでRed段階が成立する。

## 統合テスト連携

| 連携テスト                  | 確認内容                                                             |
| --------------------------- | -------------------------------------------------------------------- |
| skill-api.test.ts:1042-1046 | Preload側が `"test-skill"` 文字列を送信していること（変更不要）      |
| skillHandlers.test.ts全体   | 他のハンドラテスト（skill:list, skill:remove等）が影響を受けないこと |

## 多角的チェック観点

| 観点                   | 確認内容                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| P42準拠                | SH-IMP-04でスペースのみ文字列が`.trim()`によりVALIDATION_ERRORとなること        |
| P44準拠                | テストが `string` 直接渡し（Preloadと同じインターフェース）を前提にしていること |
| P41準拠                | SH-IMP-05で `getAllowedWindows` コールバックの戻り値を明示的に検証していること  |
| skill:removeとの対称性 | SH-RM-01〜SH-RM-11と同じバリデーションパターンを踏襲していること                |
| 既存テスト非破壊       | skill:import以外のテスト（skill:list, skill:remove等）が全てPASSすること        |

## 成果物

| 成果物               | 配置先                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| 修正済みテストコード | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（skill:importセクションのみ修正） |

## 完了条件

- [ ] skill:import テストセクション（SH-IMP-01〜SH-IMP-07）が新インターフェースに対応して書き換えられていること
- [ ] テストケース7件が全て記述されていること（正常系1件 + バリデーション3件 + セキュリティ1件 + 配列ラップ1件 + エラー伝播1件）
- [ ] P42準拠: スペースのみ文字列のテスト（SH-IMP-04）が含まれていること
- [ ] P41準拠: `getAllowedWindows` コールバック戻り値の明示的検証（SH-IMP-05）が含まれていること
- [ ] Red段階: 現行実装で最低4テストがFAILすること
- [ ] skill:import以外の既存テストが全てPASSすること

## 次のPhase

Phase 5（実装）へ進む。テストをPASSさせるための最小実装を行う。
