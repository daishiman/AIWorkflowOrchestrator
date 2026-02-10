# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 4                                          |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日   | 2026-02-09                                 |
| 規模     | 小規模                                     |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。
SKILL_EXECUTEハンドラーがSkillExecutorに委譲されることを検証するテストケースを設計・実装する。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- ハンドラーテスト作成: skill:executeハンドラーがSkillExecutor.execute()を呼び出すことを検証
- 型変換テスト作成: params → SkillExecutionRequest, Skill → SkillMetadataの変換を検証
- エラーケーステスト: バリデーションエラー、スキル未発見、未インポートエラーを検証

## 参照資料

| 資料名                 | パス                                                                   | 説明                                              |
| ---------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| 既存テスト             | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`    | 既存のSKILL_EXECUTEテスト                         |
| SkillExecutorテスト    | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` | SkillExecutorのテスト例                           |
| skillHandlers.ts       | `apps/desktop/src/main/ipc/skillHandlers.ts`                           | 現在の実装                                        |
| SkillExecutor.ts       | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                | 委譲先の実装                                      |
| skill型定義            | `packages/shared/src/types/skill.ts`                                   | SkillMetadata, Skill型定義                        |
| エラーハンドリング仕様 | `aiworkflow-requirements: error-handling.md`                           | SkillExecutionErrorCode（SE-01〜SE-07）テスト設計 |

## 実行手順

### ステップ1: テストファイルの更新

`apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts` を更新し、新しいテストケースを追加する。

#### テストケース設計

| テストID       | テスト名                            | 検証内容                                      |
| -------------- | ----------------------------------- | --------------------------------------------- |
| SH-EXE-EXEC-01 | SkillExecutor.execute()呼び出し確認 | ハンドラーがskillExecutor.execute()を呼ぶこと |
| SH-EXE-EXEC-02 | params→SkillExecutionRequest変換    | 引数が正しく変換されること                    |
| SH-EXE-EXEC-03 | Skill→SkillMetadata変換             | スキル情報が正しく変換されること              |
| SH-EXE-EXEC-04 | 存在しないスキルでエラー            | SKILL_NOT_FOUNDエラーが返ること               |
| SH-EXE-EXEC-05 | 未インポートスキルでエラー          | VALIDATION_FAILEDエラーが返ること             |
| SH-EXE-EXEC-06 | SkillExecutor未初期化でエラー       | \_skillExecutorInstanceがnullの場合のエラー   |
| SH-EXE-EXEC-07 | 成功レスポンス形式                  | OperationResult<SkillExecutionResponse>形式   |
| SH-EXE-EXEC-08 | promptパラメータの受け渡し          | params.promptがrequestに渡されること          |
| SH-EXE-EXEC-09 | skillIdからスキル情報取得           | skillService.getSkillById呼び出し確認         |
| SH-EXE-EXEC-10 | インポートマネージャー確認          | isImported()による確認                        |

### ステップ2: モック更新

SkillExecutorのモックを追加する。

```typescript
// モック: SkillExecutor
const mockSkillExecutor = {
  execute: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
  getActiveExecutions: vi.fn(),
};
```

### ステップ3: テストコード実装

```typescript
// SH-EXE-EXEC-01: SkillExecutor.execute()呼び出し確認
describe("SkillExecutor委譲", () => {
  it("SH-EXE-EXEC-01: should call SkillExecutor.execute() instead of SkillService.executeSkill()", async () => {
    // Given: スキルが存在しインポート済み
    mockSkillService.getSkillById.mockResolvedValue(mockSkill);
    mockImportManager.isImported.mockReturnValue(true);

    const mockResponse = {
      executionId: "exec-123",
      success: true,
    };
    mockSkillExecutor.execute.mockResolvedValue(mockResponse);

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);

    // When: ハンドラー呼び出し
    const result = await handler(
      {},
      {
        skillId: "skill-1",
        params: { prompt: "Hello" },
      },
    );

    // Then: SkillExecutor.execute()が呼ばれる
    expect(mockSkillExecutor.execute).toHaveBeenCalled();
    // SkillService.executeSkill()は呼ばれない
    expect(mockSkillService.executeSkill).not.toHaveBeenCalled();
  });
});
```

### ステップ4: 型変換テスト実装

```typescript
// SH-EXE-EXEC-02: params→SkillExecutionRequest変換
it("SH-EXE-EXEC-02: should convert params to SkillExecutionRequest", async () => {
  mockSkillService.getSkillById.mockResolvedValue(mockSkill);
  mockImportManager.isImported.mockReturnValue(true);
  mockSkillExecutor.execute.mockResolvedValue({
    executionId: "test",
    success: true,
  });

  const handler = handlers.get(SKILL_EXECUTE_CHANNEL);

  await handler(
    {},
    {
      skillId: "skill-1",
      params: { prompt: "Test prompt", timeout: 5000 },
    },
  );

  // SkillExecutionRequest形式で渡される
  expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
    expect.objectContaining({
      prompt: "Test prompt",
      skillId: "skill-1",
      timeout: 5000,
    }),
    expect.any(Object), // SkillMetadata
  );
});

// SH-EXE-EXEC-03: Skill→SkillMetadata変換
it("SH-EXE-EXEC-03: should convert Skill to SkillMetadata", async () => {
  const mockSkillData = {
    id: "skill-1",
    name: "Test Skill",
    slug: "test-skill",
    description: "A test skill",
    path: "/path/to/skill",
    triggers: ["test"],
    anchors: [{ source: "Test", application: "Testing", purpose: "Test" }],
    allowedTools: ["Read", "Write"],
    lastModified: new Date(),
  };
  mockSkillService.getSkillById.mockResolvedValue(mockSkillData);
  mockImportManager.isImported.mockReturnValue(true);
  mockSkillExecutor.execute.mockResolvedValue({
    executionId: "test",
    success: true,
  });

  const handler = handlers.get(SKILL_EXECUTE_CHANNEL);

  await handler({}, { skillId: "skill-1", params: { prompt: "Hello" } });

  // SkillMetadata形式で渡される
  expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
    expect.any(Object),
    expect.objectContaining({
      id: "skill-1",
      name: "Test Skill",
      description: "A test skill",
      path: "/path/to/skill",
      allowedTools: ["Read", "Write"],
      anchors: expect.any(Array),
    }),
  );
});
```

### ステップ5: エラーケーステスト実装

```typescript
// SH-EXE-EXEC-04: 存在しないスキルでエラー
it("SH-EXE-EXEC-04: should return SKILL_NOT_FOUND error when skill does not exist", async () => {
  mockSkillService.getSkillById.mockResolvedValue(null);

  const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
  const result = await handler(
    {},
    { skillId: "nonexistent", params: { prompt: "Hello" } },
  );

  expect(result).toMatchObject({
    success: false,
    error: expect.stringContaining("見つかりません"),
  });
  expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
});

// SH-EXE-EXEC-05: 未インポートスキルでエラー
it("SH-EXE-EXEC-05: should return error when skill is not imported", async () => {
  mockSkillService.getSkillById.mockResolvedValue(mockSkill);
  mockImportManager.isImported.mockReturnValue(false);

  const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
  const result = await handler(
    {},
    { skillId: "skill-1", params: { prompt: "Hello" } },
  );

  expect(result).toMatchObject({
    success: false,
    error: expect.stringContaining("インポート"),
  });
  expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
});

// SH-EXE-EXEC-06: SkillExecutor未初期化でエラー
it("SH-EXE-EXEC-06: should return error when SkillExecutor is not initialized", async () => {
  // _skillExecutorInstance = null をシミュレート
  // （registerSkillHandlers呼び出し前の状態）

  const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
  const result = await handler(
    {},
    { skillId: "skill-1", params: { prompt: "Hello" } },
  );

  expect(result).toMatchObject({
    success: false,
    error: expect.any(String),
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを設計する:

| シナリオカテゴリ   | 検証内容                                  | テストファイル                  |
| ------------------ | ----------------------------------------- | ------------------------------- |
| IPC通信テスト      | SKILL_EXECUTEハンドラー→SkillExecutor連携 | `skillHandlers.execute.test.ts` |
| エラーハンドリング | バリデーションエラーの適切な返却          | `skillHandlers.execute.test.ts` |
| 型変換テスト       | Skill→SkillMetadata変換の正確性           | `skillHandlers.execute.test.ts` |

## アーキテクチャ層別テスト

| 層           | テスト観点                      | テストファイル配置                     |
| ------------ | ------------------------------- | -------------------------------------- |
| Main Process | IPCハンドラー→SkillExecutor連携 | `apps/desktop/src/main/ipc/__tests__/` |
| IPC通信      | チャンネル登録、パラメータ検証  | `apps/desktop/src/main/ipc/__tests__/` |

## 多角的チェック観点（AIが判断）

本タスク（SKILL_EXECUTEハンドラーのSkillExecutor委譲）では以下の観点を適用：

| 観点                 | 確認内容                                    | 仕様参照先                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ         | IPC送信元検証、エラーメッセージのサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`            |
| API設計              | チャンネル定義、入出力型の統一性            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| エラーハンドリング   | SkillExecutionErrorCode準拠                 | `aiworkflow-requirements: error-handling.md`                |
| Electronセキュリティ | Main Process実装、validateIpcSender使用     | `aiworkflow-requirements: security-api-electron.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                     | 仕様参照先                    |
| -------------------- | -------------------------------------------- | ----------------------------- |
| バックエンド（Main） | SkillExecutor呼び出しテスト、モック設計      | `architecture-*.md`           |
| IPC通信              | skill:execute チャンネルテスト、型変換テスト | `interfaces-*.md`, `api-*.md` |

---

## 成果物

| 成果物                 | パス                                                                                            | 説明                 |
| ---------------------- | ----------------------------------------------------------------------------------------------- | -------------------- |
| テスト仕様書           | `docs/30-workflows/task-fix-15-1-execute-handler-routing/outputs/phase-4/test-specification.md` | テスト設計           |
| テストファイル（更新） | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`                             | 更新済みテストコード |

## 完了条件

- [ ] テストケース10件（SH-EXE-EXEC-01〜10）が実装されている
- [ ] SkillExecutor.execute()呼び出しを検証するテストがある
- [ ] params→SkillExecutionRequest変換を検証するテストがある
- [ ] Skill→SkillMetadata変換を検証するテストがある
- [ ] エラーケース（スキル未発見、未インポート）のテストがある
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test skillHandlers.execute

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] mockSkillService.executeSkill が呼ばれないテストが失敗
# - [ ] mockSkillExecutor.execute が呼ばれるテストが失敗
```

## 次のPhase

Phase 5: 実装（TDD: Green）
