# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 4                                  |
| タスクID   | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| タスク名   | skill:scan IPCハンドラーの新規追加 |
| 作成日     | 2026-02-08                         |
| 依存タスク | TASK-FIX-1-1-TYPE-ALIGNMENT        |

## 目的

`skill:scan` IPCハンドラーの期待される動作を検証するテストを、実装より先に作成する（Red状態）。

---

## 実行タスク

### Task 1: テストケース設計

**目的**: `skill:scan` ハンドラーの動作検証に必要なテストケースを設計する

**テストケース一覧**:

| テストID | テスト項目                                         | 期待結果                                  |
| -------- | -------------------------------------------------- | ----------------------------------------- |
| SH-SC-01 | skill:scan ハンドラーが登録されていることを確認    | `handlers.has('skill:scan')` が `true`    |
| SH-SC-02 | scanAvailableSkills(true) が呼び出されることを確認 | `forceRefresh: true` で呼び出される       |
| SH-SC-03 | 成功時に正しい形式でスキル一覧を返すことを確認     | `{ success: true, data: skills }` 形式    |
| SH-SC-04 | エラー時にエラーレスポンスを返すことを確認         | `{ success: false, error: message }` 形式 |
| SH-SC-05 | IPC sender バリデーションが実行されることを確認    | `validateIpcSender` が呼び出される        |

### Task 2: テストコード実装

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`

**追加するテストコード**:

```typescript
// ===========================================================================
// skill:scan
// ===========================================================================

describe("skill:scan", () => {
  it("SH-SC-01: should register skill:scan handler", () => {
    expect(handlers.has("skill:scan")).toBe(true);
  });

  it("SH-SC-02: should call skillService.scanAvailableSkills with forceRefresh=true", async () => {
    const mockData: SkillScanResult = {
      skills: [
        {
          id: "skill-1",
          name: "Test Skill",
          slug: "test-skill",
          description: "A test skill",
          path: "/test/skills/test-skill/SKILL.md",
          triggers: ["test"],
          anchors: [],
          category: "testing",
          lastModified: new Date(),
        },
      ],
      errors: [],
      scannedAt: new Date(),
    };
    mockSkillService.scanAvailableSkills.mockResolvedValue(mockData);

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When: ハンドラーを呼び出す
    await handler({});

    // Then: scanAvailableSkillsがforceRefresh=trueで呼び出される
    expect(mockSkillService.scanAvailableSkills).toHaveBeenCalledWith(true);
  });

  it("SH-SC-03: should return success response with skills data", async () => {
    const mockData: SkillScanResult = {
      skills: [
        {
          id: "skill-1",
          name: "Test Skill",
          slug: "test-skill",
          description: "A test skill",
          path: "/test/skills/test-skill/SKILL.md",
          triggers: ["test"],
          anchors: [],
          lastModified: new Date(),
        },
      ],
      errors: [],
      scannedAt: new Date(),
    };
    mockSkillService.scanAvailableSkills.mockResolvedValue(mockData);

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When: ハンドラーを呼び出す
    const result = await handler({});

    // Then: 成功レスポンスが返される
    const opResult = result as OperationResult<Skill[]>;
    expect(opResult.success).toBe(true);
    expect(opResult.data).toHaveLength(1);
    expect(opResult.data?.[0].name).toBe("Test Skill");
  });

  it("SH-SC-04: should return error response on service failure", async () => {
    mockSkillService.scanAvailableSkills.mockRejectedValue(
      new Error("Scan failed"),
    );

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When: エラーが発生する
    const result = await handler({});

    // Then: エラーレスポンスが返される
    const opResult = result as OperationResult<Skill[]>;
    expect(opResult.success).toBe(false);
    expect(opResult.error).toBe("Scan failed");
  });

  it("SH-SC-05: should validate IPC sender", async () => {
    const { validateIpcSender } =
      await import("../../infrastructure/security/ipc-validator.js");

    const handler = handlers.get("skill:scan");
    if (!handler) {
      throw new Error("skill:scan handler not registered");
    }

    // When: ハンドラーを呼び出す
    await handler({});

    // Then: validateIpcSenderが呼び出される
    expect(validateIpcSender).toHaveBeenCalledWith(
      expect.anything(),
      "skill:scan",
      expect.objectContaining({
        getAllowedWindows: expect.any(Function),
      }),
    );
  });
});
```

### Task 3: 参考テストパターン確認

**参考**: 既存の `skill:list` テストケース（SH-LA-01〜03）

| 参考テスト | 説明                         | 適用パターン                              |
| ---------- | ---------------------------- | ----------------------------------------- |
| SH-LA-01   | サービスメソッド呼び出し確認 | SH-SC-02 で同様のパターン適用             |
| SH-LA-02   | オプション引数の検証         | SH-SC-02 で `forceRefresh: true` 固定確認 |
| SH-LA-03   | エラーハンドリング確認       | SH-SC-04 で同様のパターン適用             |

---

## 参照資料

| 資料名                   | パス                                                                              | 説明                               |
| ------------------------ | --------------------------------------------------------------------------------- | ---------------------------------- |
| タスク指示書             | `tasks/02b-task-fix-17-1-skill-scan-handler.md`                                   | タスク仕様                         |
| 既存ハンドラー           | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      | 参考実装                           |
| 既存テスト               | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                       | 参考テストコード                   |
| チャネル定義             | `apps/desktop/src/preload/channels.ts`                                            | SKILL_SCAN チャネル定義            |
| 成功/失敗パターン集      | `.claude/skills/task-specification-creator/references/patterns.md`                | IPC統合パターン、モックパターン    |
| テストコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | ファクトリパターン、ESModuleモック |
| カバレッジ基準           | `.claude/skills/task-specification-creator/references/coverage-standards.md`      | 正常系100%/異常系80%+/API100%      |

---

## 成果物

| 成果物       | パス                                                        | 説明             |
| ------------ | ----------------------------------------------------------- | ---------------- |
| テストコード | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 追加テストケース |
| テスト仕様書 | `phase-outputs/TASK-FIX-17-1/phase-04-test-creation.md`     | 本ドキュメント   |

---

## 完了条件

- [ ] SH-SC-01: ハンドラー登録テストが作成されている
- [ ] SH-SC-02: scanAvailableSkills(true) 呼び出しテストが作成されている
- [ ] SH-SC-03: 成功レスポンステストが作成されている
- [ ] SH-SC-04: エラーレスポンステストが作成されている
- [ ] SH-SC-05: IPC sender バリデーションテストが作成されている
- [ ] すべてのテストが失敗状態（Red）を確認

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "skill:scan"

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] "skill:scan handler not registered" エラーが出力される
```

---

## 次のPhase

Phase 5: 実装（TDD: Green）
