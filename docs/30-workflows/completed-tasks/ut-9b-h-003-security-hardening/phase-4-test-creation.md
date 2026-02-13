# Phase 4: テスト作成 — SkillCreator IPCセキュリティ強化

## メタ情報

| 項目      | 内容                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------- |
| タスクID  | UT-9B-H-003                                                                                       |
| Phase     | 4                                                                                                 |
| タスク名  | SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト） |
| Issue     | #796                                                                                              |
| 作成日    | 2026-02-12                                                                                        |
| 依存Phase | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー: PASS）                               |

## 目的

TDD Red フェーズとして、Phase 2 の設計に基づくセキュリティテストケースを作成する。テストは実装前に作成するため、全テストが initially RED（失敗）の状態になる。

## テストファイル

| ファイル                                                                    | 役割                           |
| --------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` | セキュリティテスト（新規作成） |

## 実行タスク

- Task 1: モック設定設計: SkillCreatorService / BrowserWindow / IPC Event のテスト基盤を定義する。
- Task 2: 攻撃系テスト設計: パストラバーサルとschemaName不正値の RED ケースを定義する。
- Task 3: エラーサニタイズ設計: パス・スタック・機密値のマスク検証ケースを定義する。
- Task 4: 回帰テスト設計: 正常系が維持されることを検証するケースを定義する。
- Task 5: 受入基準マッピング: AC-01〜AC-10 とテストIDを対応付ける。

### Task 1: モック設定の設計

#### SkillCreatorService モック

```typescript
const mockSkillCreatorService = {
  detectMode: vi.fn(),
  create: vi.fn(),
  executeTasks: vi.fn(),
  validate: vi.fn(),
  validateSchema: vi.fn(),
  onProgress: vi.fn(),
};
```

#### BrowserWindow モック

```typescript
const mockMainWindow = {
  webContents: {
    id: 1,
    send: vi.fn(),
  },
  isDestroyed: vi.fn().mockReturnValue(false),
};
```

#### IPC Event モック

```typescript
const mockEvent = {
  sender: {
    getOwnerBrowserWindow: vi.fn().mockReturnValue(mockMainWindow),
  },
};
```

#### beforeEach リセット

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // 各モックのデフォルト戻り値を再設定
  mockSkillCreatorService.create.mockResolvedValue({ success: true });
  mockSkillCreatorService.executeTasks.mockResolvedValue({ success: true });
  mockSkillCreatorService.validate.mockResolvedValue({ success: true });
  mockSkillCreatorService.validateSchema.mockResolvedValue({ success: true });
});
```

### Task 2: テストケース設計

#### カテゴリ1: パストラバーサル攻撃テスト

| テストID | テスト名                                              | 受入基準 | 入力                                | 期待結果                                                            |
| -------- | ----------------------------------------------------- | -------- | ----------------------------------- | ------------------------------------------------------------------- |
| SEC-01a  | tasksDir に `../` を含むパスを指定すると拒否される    | AC-01    | `tasksDir: "../../etc/passwd"`      | `{ success: false, error: "無効なパスが指定されました: tasksDir" }` |
| SEC-01b  | skillDir に `../` を含むパスを指定すると拒否される    | AC-01    | `skillDir: "../../../tmp/evil"`     | `{ success: false, error: "無効なパスが指定されました: skillDir" }` |
| SEC-02a  | tasksDir に `..\` を含むパスを指定すると拒否される    | AC-02    | `tasksDir: "..\\windows\\system32"` | `{ success: false, error: "無効なパスが指定されました: tasksDir" }` |
| SEC-02b  | skillDir に `..\` を含むパスを指定すると拒否される    | AC-02    | `skillDir: "..\\..\\evil"`          | `{ success: false, error: "無効なパスが指定されました: skillDir" }` |
| SEC-03a  | tasksDir にNULLバイトを含むパスを指定すると拒否される | AC-03    | `tasksDir: "path\x00evil"`          | `{ success: false, error: "無効なパスが指定されました: tasksDir" }` |
| SEC-03b  | skillDir にNULLバイトを含むパスを指定すると拒否される | AC-03    | `skillDir: "valid\x00path"`         | `{ success: false, error: "無効なパスが指定されました: skillDir" }` |
| SEC-03c  | UNCパスを指定すると拒否される                         | AC-04    | `tasksDir: "\\\\server\\share"`     | `{ success: false, error: "無効なパスが指定されました: tasksDir" }` |
| SEC-03d  | 空文字列のパスを指定すると拒否される                  | -        | `tasksDir: ""`                      | `{ success: false, error: "無効なパスが指定されました: tasksDir" }` |

```typescript
describe("パストラバーサル攻撃テスト", () => {
  describe("skill-creator:create ハンドラー", () => {
    it("SEC-01a: tasksDir に ../ を含むパスを指定すると拒否される", async () => {
      // Arrange
      const maliciousArgs = {
        tasksDir: "../../etc/passwd",
        skillDir: "/valid/path",
        // ... other required args
      };

      // Act
      const result = await invokeHandler(
        "skill-creator:create",
        mockEvent,
        maliciousArgs,
      );

      // Assert
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なパス"),
      });
      expect(mockSkillCreatorService.create).not.toHaveBeenCalled();
    });

    it("SEC-01b: skillDir に ../ を含むパスを指定すると拒否される", async () => {
      const maliciousArgs = {
        tasksDir: "/valid/path",
        skillDir: "../../../tmp/evil",
      };

      const result = await invokeHandler(
        "skill-creator:create",
        mockEvent,
        maliciousArgs,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なパス"),
      });
      expect(mockSkillCreatorService.create).not.toHaveBeenCalled();
    });

    it("SEC-02a: tasksDir に ..\\ を含むパスを指定すると拒否される", async () => {
      const maliciousArgs = {
        tasksDir: "..\\windows\\system32",
        skillDir: "/valid/path",
      };

      const result = await invokeHandler(
        "skill-creator:create",
        mockEvent,
        maliciousArgs,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なパス"),
      });
      expect(mockSkillCreatorService.create).not.toHaveBeenCalled();
    });

    it("SEC-03a: NULLバイトを含むパスを指定すると拒否される", async () => {
      const maliciousArgs = {
        tasksDir: "path\x00evil",
        skillDir: "/valid/path",
      };

      const result = await invokeHandler(
        "skill-creator:create",
        mockEvent,
        maliciousArgs,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なパス"),
      });
      expect(mockSkillCreatorService.create).not.toHaveBeenCalled();
    });

    it("SEC-03c: UNCパスを指定すると拒否される", async () => {
      const maliciousArgs = {
        tasksDir: "\\\\server\\share",
        skillDir: "/valid/path",
      };

      const result = await invokeHandler(
        "skill-creator:create",
        mockEvent,
        maliciousArgs,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なパス"),
      });
      expect(mockSkillCreatorService.create).not.toHaveBeenCalled();
    });
  });

  describe("skill-creator:execute-tasks ハンドラー", () => {
    // SEC-01 ~ SEC-03 の同等テストを execute-tasks でも実施
    it("SEC-01a: tasksDir に ../ を含むパスを指定すると拒否される", async () => {
      // ... 同等の構造
    });
  });

  describe("skill-creator:validate ハンドラー", () => {
    // tasksDir パラメータのみ対象
    it("SEC-01a: tasksDir に ../ を含むパスを指定すると拒否される", async () => {
      // ... 同等の構造
    });
  });
});
```

#### カテゴリ2: エラーサニタイズテスト

| テストID | テスト名                                               | 受入基準 | 入力                                             | 期待結果                                 |
| -------- | ------------------------------------------------------ | -------- | ------------------------------------------------ | ---------------------------------------- |
| SEC-05a  | ファイルパスを含むエラーからパスが除去される           | AC-05    | `Error("Failed at /Users/user/project/file.ts")` | パスが `[path]` に置換される             |
| SEC-05b  | スタックトレースを含むエラーからスタックが除去される   | AC-06    | `Error("Error\nat Function.run (/app/src/...)")` | スタックトレース行が除去される           |
| SEC-05c  | Errorインスタンス以外のthrowで汎用メッセージが返される | AC-05/06 | `"string error thrown"`                          | `"スキル作成処理でエラーが発生しました"` |
| SEC-05d  | Windowsパスを含むエラーからパスが除去される            | AC-05    | `Error("Failed at C:\\Users\\user\\file.ts")`    | パスが `[path]` に置換される             |
| SEC-05e  | APIキーを含むエラーからキーが除去される                | AC-05/06 | `Error("api_key=sk-1234abcd...")`                | キー値が `[redacted]` に置換される       |

```typescript
describe("エラーサニタイズテスト", () => {
  it("SEC-05a: ファイルパスを含むエラーからパスが除去される", async () => {
    // Arrange
    mockSkillCreatorService.create.mockRejectedValue(
      new Error("Failed to read /Users/user/project/skills/task-spec.json"),
    );

    // Act
    const result = await invokeHandler(
      "skill-creator:create",
      mockEvent,
      validArgs,
    );

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).not.toContain("/Users/");
    expect(result.error).not.toContain("/project/");
  });

  it("SEC-05b: スタックトレースを含むエラーからスタックが除去される", async () => {
    const errorWithStack = new Error("Something failed");
    errorWithStack.stack =
      "Error: Something failed\n    at Function.run (/app/src/main.ts:42:10)";
    mockSkillCreatorService.create.mockRejectedValue(errorWithStack);

    const result = await invokeHandler(
      "skill-creator:create",
      mockEvent,
      validArgs,
    );

    expect(result.success).toBe(false);
    expect(result.error).not.toContain("at Function");
    expect(result.error).not.toContain("/app/src/");
  });

  it("SEC-05c: Errorインスタンス以外のthrowで汎用メッセージが返される", async () => {
    mockSkillCreatorService.create.mockRejectedValue("string error thrown");

    const result = await invokeHandler(
      "skill-creator:create",
      mockEvent,
      validArgs,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("スキル作成処理でエラーが発生しました");
  });

  it("SEC-05d: Windowsパスを含むエラーからパスが除去される", async () => {
    mockSkillCreatorService.create.mockRejectedValue(
      new Error("Failed at C:\\Users\\user\\project\\file.ts"),
    );

    const result = await invokeHandler(
      "skill-creator:create",
      mockEvent,
      validArgs,
    );

    expect(result.success).toBe(false);
    expect(result.error).not.toContain("C:\\Users");
    expect(result.error).not.toContain("\\project\\");
  });

  it("SEC-05e: APIキーを含むエラーからキーが除去される", async () => {
    mockSkillCreatorService.create.mockRejectedValue(
      new Error("Request failed: api_key=sk-1234abcdef5678"),
    );

    const result = await invokeHandler(
      "skill-creator:create",
      mockEvent,
      validArgs,
    );

    expect(result.success).toBe(false);
    expect(result.error).not.toContain("sk-1234");
    expect(result.error).not.toContain("api_key=");
  });
});
```

#### カテゴリ3: schemaNameホワイトリストテスト

| テストID | テスト名                                             | 受入基準 | 入力                             | 期待結果                                           |
| -------- | ---------------------------------------------------- | -------- | -------------------------------- | -------------------------------------------------- |
| SEC-04a  | 許可されたスキーマ名 `task-spec` は正常に処理される  | AC-09    | `schemaName: "task-spec"`        | サービス層に到達し正常レスポンス                   |
| SEC-04b  | 許可されたスキーマ名 `skill-spec` は正常に処理される | AC-09    | `schemaName: "skill-spec"`       | サービス層に到達し正常レスポンス                   |
| SEC-04c  | 許可されたスキーマ名 `mode` は正常に処理される       | AC-09    | `schemaName: "mode"`             | サービス層に到達し正常レスポンス                   |
| SEC-04d  | 未定義のスキーマ名は拒否される                       | AC-07    | `schemaName: "unknown-schema"`   | `{ success: false, error: "無効なスキーマ名..." }` |
| SEC-04e  | 空文字列のスキーマ名は拒否される                     | AC-08    | `schemaName: ""`                 | `{ success: false, error: "無効なスキーマ名..." }` |
| SEC-04f  | パスを含むスキーマ名は拒否される                     | AC-07    | `schemaName: "../../malicious"`  | `{ success: false, error: "無効なスキーマ名..." }` |
| SEC-04g  | 特殊文字を含むスキーマ名は拒否される                 | AC-07    | `schemaName: "schema; rm -rf /"` | `{ success: false, error: "無効なスキーマ名..." }` |

```typescript
describe("schemaNameホワイトリストテスト", () => {
  describe("許可されたスキーマ名", () => {
    it.each([["task-spec"], ["skill-spec"], ["mode"]])(
      'SEC-04a/b/c: スキーマ名 "%s" は正常に処理される',
      async (schemaName) => {
        const args = { schemaName, content: "{}" };

        const result = await invokeHandler(
          "skill-creator:validate-schema",
          mockEvent,
          args,
        );

        expect(result.success).toBe(true);
        expect(mockSkillCreatorService.validateSchema).toHaveBeenCalledWith(
          expect.objectContaining({ schemaName }),
        );
      },
    );
  });

  describe("拒否されるスキーマ名", () => {
    it.each([
      ["unknown-schema", "未定義のスキーマ名"],
      ["", "空文字列"],
      ["../../malicious", "パスを含むスキーマ名"],
      ["schema; rm -rf /", "特殊文字を含むスキーマ名"],
    ])('SEC-04d/e/f/g: "%s"（%s）は拒否される', async (schemaName) => {
      const args = { schemaName, content: "{}" };

      const result = await invokeHandler(
        "skill-creator:validate-schema",
        mockEvent,
        args,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なスキーマ名"),
      });
      expect(mockSkillCreatorService.validateSchema).not.toHaveBeenCalled();
    });
  });
});
```

#### カテゴリ4: 正常系回帰テスト

| テストID   | テスト名                                          | 受入基準 | 説明                                                 |
| ---------- | ------------------------------------------------- | -------- | ---------------------------------------------------- |
| SEC-REG-01 | 正常なパスでskill-creator:createが成功する        | AC-10    | セキュリティバリデーション追加後も正常パスは通過する |
| SEC-REG-02 | 正常なパスでskill-creator:execute-tasksが成功する | AC-10    | 同上                                                 |
| SEC-REG-03 | 正常なパスでskill-creator:validateが成功する      | AC-10    | 同上                                                 |

```typescript
describe("正常系回帰テスト", () => {
  it("SEC-REG-01: 正常なパスでcreateが成功する", async () => {
    const validCreateArgs = {
      tasksDir: "/Users/user/valid/tasks",
      skillDir: "/Users/user/valid/skills",
      // ... other required args
    };
    mockSkillCreatorService.create.mockResolvedValue({
      success: true,
      data: {},
    });

    const result = await invokeHandler(
      "skill-creator:create",
      mockEvent,
      validCreateArgs,
    );

    expect(result.success).toBe(true);
    expect(mockSkillCreatorService.create).toHaveBeenCalled();
  });

  it("SEC-REG-02: 正常なパスでexecute-tasksが成功する", async () => {
    const validArgs = {
      tasksDir: "/Users/user/valid/tasks",
      skillDir: "/Users/user/valid/skills",
    };
    mockSkillCreatorService.executeTasks.mockResolvedValue({ success: true });

    const result = await invokeHandler(
      "skill-creator:execute-tasks",
      mockEvent,
      validArgs,
    );

    expect(result.success).toBe(true);
    expect(mockSkillCreatorService.executeTasks).toHaveBeenCalled();
  });

  it("SEC-REG-03: 正常なパスでvalidateが成功する", async () => {
    const validArgs = {
      tasksDir: "/Users/user/valid/tasks",
    };
    mockSkillCreatorService.validate.mockResolvedValue({ success: true });

    const result = await invokeHandler(
      "skill-creator:validate",
      mockEvent,
      validArgs,
    );

    expect(result.success).toBe(true);
    expect(mockSkillCreatorService.validate).toHaveBeenCalled();
  });
});
```

### Task 3: テストカバレッジ目標

| 指標              | 目標値 | 備考                                            |
| ----------------- | ------ | ----------------------------------------------- |
| Line Coverage     | 90%    | セキュリティ関数の全パスを網羅                  |
| Branch Coverage   | 85%    | 各バリデーションの成功/失敗分岐を網羅           |
| Function Coverage | 100%   | validatePath, sanitizeErrorMessage を完全テスト |

### Task 4: テスト実行コマンド

```bash
# セキュリティテストのみ実行
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts

# カバレッジ付き実行
pnpm --filter @repo/desktop vitest run --coverage src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts
```

## テストIDと受入基準のマッピング

| 受入基準 | テストID                           |
| -------- | ---------------------------------- |
| AC-01    | SEC-01a, SEC-01b                   |
| AC-02    | SEC-02a, SEC-02b                   |
| AC-03    | SEC-03a, SEC-03b                   |
| AC-04    | SEC-03c                            |
| AC-05    | SEC-05a, SEC-05d                   |
| AC-06    | SEC-05b                            |
| AC-07    | SEC-04d, SEC-04f, SEC-04g          |
| AC-08    | SEC-04e                            |
| AC-09    | SEC-04a, SEC-04b, SEC-04c          |
| AC-10    | SEC-REG-01, SEC-REG-02, SEC-REG-03 |

## 参照資料

| 資料                      | パス                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 1 要件定義          | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-1-requirements.md`  |
| Phase 2 設計              | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-2-design.md`        |
| Phase 3 設計レビュー      | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-3-design-review.md` |
| IPC セキュリティ仕様      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| API/Electron セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| Skill Creator IPC型定義   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        |
| Agent SDK スキルI/F仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           |

## 統合テスト連携

| 層                   | テスト内容                                                           |
| -------------------- | -------------------------------------------------------------------- |
| バックエンド（Main） | ハンドラー単体テストで各分岐を RED で失敗させる                      |
| IPC通信              | invoke経路での入力バリデーション失敗時の戻り値を検証する             |
| Preload/セキュリティ | Renderer返却エラーがサニタイズ済み形式であることをテスト観点に含める |

## 成果物

| 成果物                     | パス                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| テスト設計書               | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-4-test-creation.md` |
| セキュリティテストファイル | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`                 |

## 完了条件

- [ ] テストファイルが作成されている
- [ ] 4カテゴリ（パストラバーサル、エラーサニタイズ、schemaNameホワイトリスト、正常系回帰）のテストが含まれている
- [ ] 全テストが RED（実装前のため失敗）の状態である
- [ ] 各テストケースが受入基準（AC-01 ~ AC-10）と1対1でマッピングされている
- [ ] モック設定が確実に構成されている
- [ ] beforeEach でモックがリセットされている

## 次Phase

Phase 5: 実装（TDD Green フェーズ）
