# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 6                                                                            |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名     | skill-import-return-type-fix                                                 |
| 分類       | バグ修正                                                                     |
| 作成日     | 2026-02-21                                                                   |
| 前Phase    | Phase 5: 実装（TDD-Green）                                                   |
| 関連タスク | UT-FIX-SKILL-IMPORT-INTERFACE-001（引数形式修正）                            |

## 目的

Phase 5 で実装したハンドラの品質を高めるため、エラーケース、境界値テスト、セキュリティ検証テスト、統合テスト連携テストを追加する。カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成に向けてテストの網羅性を向上させる。

## 実行タスク

- エラーケーステスト追加（importSkills例外、getSkillByName例外）
- 境界値テスト追加（空文字列、スペースのみ、長い名前、特殊文字）
- セキュリティ検証テスト追加（validateIpcSender拒否、getAllowedWindowsコールバック）
- 統合テスト連携テスト追加（agentSlice.skill-integration.test.ts）
- P41準拠: getAllowedWindowsコールバック検証

## 参照資料

| 資料名               | パス                                                                                        | 説明               |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義     | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-1-requirements.md`             | FR/NFR/受入基準    |
| Phase 4 テスト仕様書 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-4-test-creation.md`            | 基本テストケース   |
| Phase 5 実装仕様書   | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-5-implementation.md`           | 実装コード         |
| SDK Skill型仕様書    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill定義  |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                        | P41/P42/P44        |
| 実装パターン集       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テストパターン参照 |

### システム仕様書参照（aiworkflow-requirements）

| 仕様書                                    | 該当セクション                         | 参照目的                               |
| ----------------------------------------- | -------------------------------------- | -------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | IPCチャンネル（スキル管理）            | skill:import 契約の完全性検証          |
| `security-electron-ipc.md`                | セキュリティ検証パターン               | validateIpcSender テスト（P41準拠）    |
| `architecture-implementation-patterns.md` | fireEvent vs userEvent使い分けパターン | happy-dom環境テスト制約（P39準拠）     |
| `ipc-contract-checklist.md`               | IPC契約チェックリスト                  | エラーケースの網羅                     |
| `api-ipc-agent.md`                        | エラーレスポンスパターン               | サニタイズされたエラーメッセージの検証 |

---

## 実行手順

### Task 1: エラーケーステスト追加

#### 1.1 importSkills() が例外をthrowした場合

```typescript
it("RT-07: should propagate importSkills exception", async () => {
  // Given: importSkills がランタイムエラーをthrow
  mockSkillService.importSkills.mockRejectedValue(
    new Error("File system error during import"),
  );

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When & Then: エラーが伝播する
  await expect(handler({}, "error-skill")).rejects.toThrow(
    "File system error during import",
  );
});
```

#### 1.2 getSkillByName() が例外をthrowした場合

```typescript
it("RT-08: should propagate getSkillByName exception", async () => {
  // Given: importSkills 成功、getSkillByName がエラーをthrow
  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 1,
    errors: [],
  });
  mockSkillService.getSkillByName.mockRejectedValue(
    new Error("Cache corruption"),
  );

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When & Then: エラーが伝播する
  await expect(handler({}, "cache-error-skill")).rejects.toThrow(
    "Cache corruption",
  );
});
```

#### 1.3 importSkills が success=true だが importedCount=0 の場合

```typescript
it("RT-09: should throw IMPORT_ERROR when importedCount is 0 despite success", async () => {
  // Given: success=true だが importedCount=0（既にインポート済み等）
  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 0,
    errors: [],
  });

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When & Then: IMPORT_ERROR がthrowされる
  try {
    await handler({}, "already-imported");
    throw new Error("Expected IMPORT_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("IMPORT_ERROR");
    expect((error as { message: string }).message).toContain(
      "already-imported",
    );
  }
});
```

#### 1.4 importSkills が複数エラーメッセージを返す場合

```typescript
it("RT-10: should join multiple error messages in IMPORT_ERROR", async () => {
  // Given: 複数のエラーメッセージ
  mockSkillService.importSkills.mockResolvedValue({
    success: false,
    importedCount: 0,
    errors: ["SKILL.md not found", "Invalid directory structure"],
  });

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When & Then: エラーメッセージが結合される
  try {
    await handler({}, "broken-skill");
    throw new Error("Expected IMPORT_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("IMPORT_ERROR");
    expect((error as { message: string }).message).toContain(
      "SKILL.md not found",
    );
    expect((error as { message: string }).message).toContain(
      "Invalid directory structure",
    );
  }
});
```

### Task 2: 境界値テスト追加

#### 2.1 スペースのみのスキル名（P42準拠）

```typescript
it("RT-11: should reject whitespace-only skillName (P42)", async () => {
  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: スペースのみの文字列を渡す
  try {
    await handler({}, "   ");
    throw new Error("Expected VALIDATION_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    expect((error as { message: string }).message).toBe(
      "skillName must be a non-empty string",
    );
  }
});
```

#### 2.2 タブ・改行のみのスキル名

```typescript
it("RT-12: should reject tab/newline-only skillName", async () => {
  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: タブ・改行のみの文字列を渡す
  try {
    await handler({}, "\t\n");
    throw new Error("Expected VALIDATION_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    expect((error as { message: string }).message).toBe(
      "skillName must be a non-empty string",
    );
  }
});
```

#### 2.3 undefined を渡した場合

```typescript
it("RT-13: should reject undefined skillName", async () => {
  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: undefinedを渡す
  try {
    await handler({}, undefined);
    throw new Error("Expected VALIDATION_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
  }
});
```

#### 2.4 数値を渡した場合

```typescript
it("RT-14: should reject non-string skillName (number)", async () => {
  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: 数値を渡す
  try {
    await handler({}, 123);
    throw new Error("Expected VALIDATION_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
  }
});
```

#### 2.5 空文字列

```typescript
it("RT-15: should reject empty string skillName", async () => {
  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: 空文字列を渡す
  try {
    await handler({}, "");
    throw new Error("Expected VALIDATION_ERROR");
  } catch (error) {
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    expect((error as { message: string }).message).toBe(
      "skillName must be a non-empty string",
    );
  }
});
```

### Task 3: セキュリティ検証テスト追加

#### 3.1 validateIpcSender で拒否された場合

```typescript
it("RT-16: should throw when validateIpcSender returns invalid", async () => {
  const { validateIpcSender, toIPCValidationError } =
    await import("../../infrastructure/security/ipc-validator.js");

  (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
    valid: false,
    errorCode: "IPC_UNAUTHORIZED",
    errorMessage: "Unauthorized sender",
  });

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When & Then: セキュリティエラーがthrowされる
  try {
    await handler({}, "valid-skill");
    throw new Error("Expected security error");
  } catch {
    expect(toIPCValidationError).toHaveBeenCalledWith({
      valid: false,
      errorCode: "IPC_UNAUTHORIZED",
      errorMessage: "Unauthorized sender",
    });
  }
});
```

#### 3.2 P41準拠: getAllowedWindows コールバック検証

```typescript
it("RT-17: should pass getAllowedWindows callback with mainWindow (P41)", async () => {
  const { validateIpcSender } =
    await import("../../infrastructure/security/ipc-validator.js");

  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 1,
    errors: [],
  });
  mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  await handler({}, "test-skill");

  // Then: validateIpcSender が正しい引数で呼ばれている
  expect(validateIpcSender).toHaveBeenCalledWith(
    expect.anything(),
    "skill:import",
    expect.objectContaining({
      getAllowedWindows: expect.any(Function),
    }),
  );

  // P41準拠: getAllowedWindows コールバックの戻り値を明示的に検証
  const callArgs = (
    validateIpcSender as ReturnType<typeof vi.fn>
  ).mock.calls.find((call: unknown[]) => call[1] === "skill:import");
  if (callArgs && callArgs[2]?.getAllowedWindows) {
    const windows = callArgs[2].getAllowedWindows();
    expect(windows).toContain(mockMainWindow);
  }
});
```

#### 3.3 DevToolsからの呼び出し拒否

```typescript
it("RT-18: should reject calls from DevTools", async () => {
  const { validateIpcSender } =
    await import("../../infrastructure/security/ipc-validator.js");

  (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
    valid: false,
    errorCode: "IPC_DEVTOOLS_NOT_ALLOWED",
    errorMessage: "DevTools sender not allowed",
  });

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When & Then: DevTools拒否エラー
  await expect(handler({}, "test-skill")).rejects.toBeDefined();
});
```

### Task 4: 統合テスト連携テスト

#### 4.1 agentSlice.skill-integration.test.ts の確認と修正

`agentSlice.skill-integration.test.ts` のモックが `ImportedSkill` 型の完全なオブジェクトを返していることを確認する。

**確認項目**:

- `mockAvailableSkills[0]` に `SkillMetadata` の全プロパティ（`agents`, `references`, `scripts`, `assets`, `schemas`, `indexes`, `otherFiles`）が含まれているか
- `importedAt` が `Date` オブジェクトとして設定されているか
- `status` が `"active"` として設定されているか

モックデータが不足している場合は以下のように修正:

```typescript
// agentSlice.skill-integration.test.ts のモック修正（必要な場合のみ）
import: vi.fn().mockResolvedValue({
  name: "test-skill",
  description: "A test skill",
  path: "/test/skills/test-skill/SKILL.md",
  updatedAt: new Date(),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  importedAt: new Date(),
  status: "active",
}),
```

### Task 5: テスト実行と結果確認

#### 5.1 全テスト実行

```bash
# skill:import テストのみ
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers

# agentSlice統合テスト
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.skill-integration
```

#### 5.2 期待結果

Phase 4 + Phase 6 の全テストがPASSする:

| テストID  | カテゴリ     | 期待結果 |
| --------- | ------------ | -------- |
| SH-IMP-01 | 基本動作     | PASS     |
| RT-01〜06 | 戻り値型検証 | PASS     |
| RT-07〜10 | エラーケース | PASS     |
| RT-11〜15 | 境界値       | PASS     |
| RT-16〜18 | セキュリティ | PASS     |

**テスト合計**: SH-IMP-01修正 + RT-01〜RT-18 = 19テスト

---

## 統合テスト連携

| 観点         | 確認内容                                                                         | 参照仕様                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC契約      | `skill:import` の引数・戻り値・エラー形式の整合を確認                            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` / `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| セキュリティ | `validateIpcSender` と入力バリデーション（`skillName` / `skillIds`）の整合を確認 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` / `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                          |
| E2E整合      | Main → Preload → Renderer で `ImportedSkill` が破綻なく流れることを確認          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                                                                                 |

## 成果物

| 成果物                               | パス                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充仕様書             | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-6-test-expansion.md`       |
| skillHandlers.test.ts（拡充後）      | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             |
| agentSlice.skill-integration.test.ts | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` |

## 完了条件

- [ ] エラーケーステスト RT-07〜RT-10 が追加されている
- [ ] 境界値テスト RT-11〜RT-15 が追加されている
- [ ] セキュリティ検証テスト RT-16〜RT-18 が追加されている
- [ ] P41準拠: getAllowedWindows コールバック検証が含まれている
- [ ] P42準拠: スペースのみ、タブ改行のみ、undefined、数値、空文字列のバリデーションテストが含まれている
- [ ] agentSlice.skill-integration.test.ts のモック戻り値が `ImportedSkill` 型の完全なオブジェクトである
- [ ] 全テスト（SH-IMP-01 + RT-01〜RT-18）がPASSする
- [ ] 既存テスト（skill:list, skill:scan 等）に影響がない

## 次Phase

→ Phase 7: テストカバレッジ確認（phase-7-coverage-verification.md）
