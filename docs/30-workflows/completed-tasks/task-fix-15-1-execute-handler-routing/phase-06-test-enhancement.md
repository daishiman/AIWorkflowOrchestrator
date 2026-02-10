# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 6                                          |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日   | 2026-02-09                                 |
| 規模     | 小規模                                     |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。
エッジケース、エラーハンドリング、型変換の境界値テストを追加する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- エラーハンドリングテスト: 各種エラーケースの網羅
- 型変換検証テスト: 型変換の境界値・異常値テスト
- 既存機能との互換性テスト: abort/getStatus機能の継続動作確認

## 参照資料

| 資料名            | パス                                                                                | 説明       |
| ----------------- | ----------------------------------------------------------------------------------- | ---------- |
| Phase 4テスト仕様 | `docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-4-test-creation.md`  | テスト設計 |
| Phase 5実装       | `docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-5-implementation.md` | 実装詳細   |
| 既存テスト        | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`                 | 既存テスト |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                   |
| ----------------- | -------- | -------- | ---------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `skillHandlers.ts` (SKILL_EXECUTE関連行)       |
| Branch Coverage   | 60%      | 70%      | 条件分岐（バリデーション、エラーハンドリング） |
| Function Coverage | 80%      | 90%      | 型変換ヘルパー関数                             |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage --testPathPattern="skillHandlers.execute"
```

### ステップ2: 追加テストケース設計

#### エラーハンドリングテスト

| テストID      | テスト名                                | 検証内容                               |
| ------------- | --------------------------------------- | -------------------------------------- |
| SH-EXE-ERR-01 | SkillExecutor.execute()がエラーをスロー | catchされてOperationResultで返却される |
| SH-EXE-ERR-02 | SkillExecutor.execute()がタイムアウト   | TIMEOUT エラーが返却される             |
| SH-EXE-ERR-03 | SkillExecutor.execute()がアボート       | ABORTED エラーが返却される             |
| SH-EXE-ERR-04 | getSkillById()がエラーをスロー          | catchされて適切なエラーが返却される    |
| SH-EXE-ERR-05 | getImportedSkills()がエラーをスロー     | catchされて適切なエラーが返却される    |
| SH-EXE-ERR-06 | ネットワークエラーのハンドリング        | NETWORK_ERRORコードが返却される        |
| SH-EXE-ERR-07 | 認証エラーのハンドリング                | AUTHENTICATION_ERRORコードが返却される |

#### 型変換テスト

| テストID       | テスト名                            | 検証内容                    |
| -------------- | ----------------------------------- | --------------------------- |
| SH-EXE-CONV-01 | params.promptがundefinedの場合      | 空文字列が設定される        |
| SH-EXE-CONV-02 | params.promptが空文字の場合         | 空文字列がそのまま渡される  |
| SH-EXE-CONV-03 | params.timeoutがundefinedの場合     | undefinedがそのまま渡される |
| SH-EXE-CONV-04 | params.timeoutが0の場合             | 0が渡される                 |
| SH-EXE-CONV-05 | Skill.allowedToolsがundefinedの場合 | undefinedがそのまま渡される |
| SH-EXE-CONV-06 | Skill.anchorsが空配列の場合         | 空配列が渡される            |
| SH-EXE-CONV-07 | Skill.categoryがundefinedの場合     | undefinedがそのまま渡される |

#### 互換性テスト

| テストID         | テスト名                            | 検証内容                                     |
| ---------------- | ----------------------------------- | -------------------------------------------- |
| SH-EXE-COMPAT-01 | skill:abort が引き続き動作する      | SkillExecutor.abort()が呼ばれる              |
| SH-EXE-COMPAT-02 | skill:get-status が引き続き動作する | SkillExecutor.getExecutionStatus()が呼ばれる |
| SH-EXE-COMPAT-03 | 他のskill:\*ハンドラーに影響がない  | skill:list, skill:import等が正常動作         |

### ステップ3: テストコード実装

```typescript
describe("エラーハンドリング拡充テスト", () => {
  // SH-EXE-ERR-01
  it("should catch SkillExecutor.execute() errors and return OperationResult", async () => {
    mockSkillService.getSkillById.mockResolvedValue(mockSkill);
    mockImportManager.isImported.mockReturnValue(true);
    mockSkillExecutor.execute.mockRejectedValue(new Error("SDK Error"));

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    const result = await handler(
      {},
      { skillId: "skill-1", params: { prompt: "test" } },
    );

    expect(result).toMatchObject({
      success: false,
      error: "SDK Error",
    });
  });

  // SH-EXE-ERR-02
  it("should handle timeout errors from SkillExecutor", async () => {
    mockSkillService.getSkillById.mockResolvedValue(mockSkill);
    mockImportManager.isImported.mockReturnValue(true);
    mockSkillExecutor.execute.mockResolvedValue({
      executionId: "exec-123",
      success: false,
      error: { code: "TIMEOUT", message: "Execution timed out" },
    });

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    const result = await handler(
      {},
      { skillId: "skill-1", params: { prompt: "test" } },
    );

    expect(result).toMatchObject({
      success: false,
    });
    expect(result.data?.error?.code).toBe("TIMEOUT");
  });

  // SH-EXE-ERR-03
  it("should handle aborted errors from SkillExecutor", async () => {
    mockSkillService.getSkillById.mockResolvedValue(mockSkill);
    mockImportManager.isImported.mockReturnValue(true);
    mockSkillExecutor.execute.mockResolvedValue({
      executionId: "exec-123",
      success: false,
      error: { code: "ABORTED", message: "Execution was aborted" },
    });

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    const result = await handler(
      {},
      { skillId: "skill-1", params: { prompt: "test" } },
    );

    expect(result.data?.error?.code).toBe("ABORTED");
  });

  // SH-EXE-ERR-04
  it("should handle getSkillById throwing an error", async () => {
    mockSkillService.getSkillById.mockRejectedValue(
      new Error("Database error"),
    );

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    const result = await handler(
      {},
      { skillId: "skill-1", params: { prompt: "test" } },
    );

    expect(result).toMatchObject({
      success: false,
      error: "Database error",
    });
    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });

  // SH-EXE-ERR-05
  it("should handle getImportedSkills throwing an error", async () => {
    mockSkillService.getSkillById.mockResolvedValue(mockSkill);
    mockSkillService.getImportedSkills.mockRejectedValue(
      new Error("Import check failed"),
    );

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    const result = await handler(
      {},
      { skillId: "skill-1", params: { prompt: "test" } },
    );

    expect(result).toMatchObject({
      success: false,
      error: "Import check failed",
    });
    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });
});

describe("型変換拡充テスト", () => {
  beforeEach(() => {
    mockSkillService.getSkillById.mockResolvedValue(mockSkill);
    mockImportManager.isImported.mockReturnValue(true);
    mockSkillExecutor.execute.mockResolvedValue({
      executionId: "test",
      success: true,
    });
  });

  // SH-EXE-CONV-01
  it("should set empty string when params.prompt is undefined", async () => {
    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    await handler({}, { skillId: "skill-1", params: {} });

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "" }),
      expect.any(Object),
    );
  });

  // SH-EXE-CONV-02
  it("should pass empty string prompt as-is", async () => {
    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    await handler({}, { skillId: "skill-1", params: { prompt: "" } });

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "" }),
      expect.any(Object),
    );
  });

  // SH-EXE-CONV-03
  it("should pass undefined timeout when not specified", async () => {
    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    await handler({}, { skillId: "skill-1", params: { prompt: "test" } });

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: undefined }),
      expect.any(Object),
    );
  });

  // SH-EXE-CONV-04
  it("should pass zero timeout when specified as 0", async () => {
    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    await handler(
      {},
      { skillId: "skill-1", params: { prompt: "test", timeout: 0 } },
    );

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: 0 }),
      expect.any(Object),
    );
  });
});

describe("互換性テスト", () => {
  // SH-EXE-COMPAT-01
  it("skill:abort should continue to work with SkillExecutor", async () => {
    mockSkillExecutor.abort.mockReturnValue(true);

    const handler = handlers.get("skill:abort");
    const result = await handler({}, "exec-123");

    expect(mockSkillExecutor.abort).toHaveBeenCalledWith("exec-123");
    expect(result).toBe(true);
  });

  // SH-EXE-COMPAT-02
  it("skill:get-status should continue to work with SkillExecutor", async () => {
    const mockStatus = {
      id: "exec-123",
      skillId: "skill-1",
      state: "running",
      startedAt: Date.now(),
    };
    mockSkillExecutor.getExecutionStatus.mockReturnValue(mockStatus);

    const handler = handlers.get("skill:get-status");
    const result = await handler({}, "exec-123");

    expect(mockSkillExecutor.getExecutionStatus).toHaveBeenCalledWith(
      "exec-123",
    );
    expect(result).toEqual(mockStatus);
  });
});
```

### ステップ4: カバレッジ再測定

```bash
pnpm --filter @repo/desktop test:coverage --testPathPattern="skillHandlers.execute"
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ       | 検証項目                                        | 目標 |
| -------------------- | ----------------------------------------------- | ---- |
| エラーハンドリング   | SkillExecutor.execute()のエラー伝播             | 100% |
| 型変換テスト         | 全フィールドの変換（正常値、境界値、異常値）    | 100% |
| 互換性テスト         | abort/getStatus機能の継続動作                   | 100% |
| バリデーションテスト | skillId検証、インポート確認、Executor初期化確認 | 100% |

## 多角的チェック観点（AIが判断）

本タスク（SKILL_EXECUTEハンドラーのSkillExecutor委譲）では以下の観点を適用：

| 観点                 | 確認内容                                    | 仕様参照先                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ         | IPC送信元検証、エラーメッセージのサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`            |
| API設計              | チャンネル定義、入出力型の統一性            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| エラーハンドリング   | SkillExecutionErrorCode準拠                 | `aiworkflow-requirements: error-handling.md`                |
| Electronセキュリティ | Main Process実装、validateIpcSender使用     | `aiworkflow-requirements: security-api-electron.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                         | 仕様参照先                    |
| -------------------- | -------------------------------- | ----------------------------- |
| バックエンド（Main） | エラーケーステスト、境界値テスト | `architecture-*.md`           |
| IPC通信              | 型変換テスト拡充、互換性テスト   | `interfaces-*.md`, `api-*.md` |

---

## 成果物

| 成果物             | パス                                                                                         | 説明               |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `docs/30-workflows/task-fix-15-1-execute-handler-routing/outputs/phase-6/coverage-report.md` | カバレッジ分析結果 |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`                          | 追加テストコード   |

## 完了条件

- [ ] エラーハンドリングテスト7件（SH-EXE-ERR-01〜07）が追加されている
- [ ] 型変換テスト7件（SH-EXE-CONV-01〜07）が追加されている
- [ ] 互換性テスト3件（SH-EXE-COMPAT-01〜03）が追加されている
- [ ] Line Coverage 80%以上を達成
- [ ] Branch Coverage 60%以上を達成
- [ ] Function Coverage 80%以上を達成
- [ ] 全テストがPASS
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
