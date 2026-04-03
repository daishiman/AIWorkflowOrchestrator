# Phase 6: テスト拡充 -- Skill Output Integration

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 6                        |
| 機能名     | skill-output-integration |
| タスクID   | TASK-SDK-SC-04           |
| 作成日     | 2026-04-02               |
| 依存 Phase | Phase 5（実装）          |

## 目的

Phase 4 の T-01 から T-06 に加え、エッジケース（出力パース失敗・ディレクトリ作成エラー・レジストリ登録重複）を T-07 から T-09 として追加し、実装の堅牢性を高める。

## 実行タスク

### Task 6-1: T-07 — 出力パース失敗時の安全な処理

```typescript
// SkillCreatorOutputHandler.test.ts

describe("extractSkillFromOutput - エッジケース", () => {
  it("T-07a: SKILL_START マーカーはあるが SKILL_END マーカーがない場合は null を返す", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const output = "前文 <!-- SKILL_START --> name: broken-skill 後文";
    expect(handler.extractSkillFromOutput(output)).toBeNull();
  });

  it("T-07b: マーカー間に name フィールドがない場合は null を返す", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const output =
      "<!-- SKILL_START --> description: nameなし <!-- SKILL_END -->";
    expect(handler.extractSkillFromOutput(output)).toBeNull();
  });

  it("T-07c: スキル名にスペースが含まれる場合は dirName をハイフン区切りにスラッグ化する", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const output =
      "<!-- SKILL_START -->\nname: My Test Skill\n<!-- SKILL_END -->";
    const result = handler.extractSkillFromOutput(output);
    expect(result?.dirName).toBe("my-test-skill");
  });

  it("T-07d: handleSessionComplete でパース失敗時は何も実行しない", async () => {
    const mockRegistry = { registerFromPath: vi.fn() };
    const mockWC = { send: vi.fn() };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as WebContents,
    );

    await handler.handleSessionComplete("マーカーなし出力");

    expect(mockRegistry.registerFromPath).not.toHaveBeenCalled();
    expect(mockWC.send).not.toHaveBeenCalled();
  });
});
```

### Task 6-2: T-08 — ディレクトリ作成エラー時の処理

```typescript
// SkillCreatorOutputHandler.test.ts

describe("saveSkill - エラーハンドリング", () => {
  it("T-08a: mkdir が失敗した場合は Error をスローする", async () => {
    vi.spyOn(fs, "mkdir").mockRejectedValue(
      new Error("EACCES: permission denied"),
    );

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const skill: ParsedSkillOutput = {
      name: "fail-skill",
      content: "name: fail-skill",
      dirName: "fail-skill",
    };

    await expect(handler.saveSkill(skill)).rejects.toThrow(
      "EACCES: permission denied",
    );
  });

  it("T-08b: writeFile が失敗した場合は Error をスローする", async () => {
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockRejectedValue(
      new Error("ENOSPC: no space left on device"),
    );

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const skill: ParsedSkillOutput = {
      name: "fail-skill",
      content: "name: fail-skill",
      dirName: "fail-skill",
    };

    await expect(handler.saveSkill(skill)).rejects.toThrow(
      "ENOSPC: no space left on device",
    );
  });
});
```

### Task 6-3: T-09 — レジストリ登録重複時の処理

```typescript
// SkillCreatorOutputHandler.test.ts

describe("registerToRegistry - 重複登録", () => {
  it("T-09a: SkillRegistry.registerFromPath() が失敗してもエラーをスローせず処理を継続する", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockRejectedValue(new Error("Registry error")),
    };
    const mockWC = { send: vi.fn() };

    vi.spyOn(fs, "access").mockRejectedValue(new Error("ENOENT")); // ファイル未存在
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as WebContents,
    );

    const sessionOutput =
      "<!-- SKILL_START -->\nname: my-skill\n<!-- SKILL_END -->";

    // Registry 失敗でもエラーがスローされないこと
    await expect(
      handler.handleSessionComplete(sessionOutput),
    ).resolves.not.toThrow();

    // Registry 失敗でも IPC 通知は送信されること
    expect(mockWC.send).toHaveBeenCalledWith(
      SKILL_CREATOR_OUTPUT_READY,
      expect.objectContaining({ skillName: "my-skill" }),
    );
  });

  it("T-09b: SkillRegistry.registerFromPath() で同名スキルを上書き登録できる", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWebContents,
    );

    await handler.registerToRegistry(
      "/project/.claude/skills/my-skill/SKILL.md",
    );
    await handler.registerToRegistry(
      "/project/.claude/skills/my-skill/SKILL.md",
    );

    // 2 回呼ばれること（重複でもエラーにならない）
    expect(mockRegistry.registerFromPath).toHaveBeenCalledTimes(2);
  });
});
```

## 参照資料

| 資料名         | パス                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 4 テスト | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-4-test-creation.md`  |
| Phase 5 実装   | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-5-implementation.md` |

## 成果物

| 成果物                     | パス                                                                                                                                                               | 形式     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| テスト拡充書（本ファイル） | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-6-test-expansion.md` | Markdown |

## 完了条件

- [ ] T-07（出力パース失敗時の安全な処理）を追加した
- [ ] T-08（ディレクトリ作成エラー時の処理）を追加した
- [ ] T-09（レジストリ登録重複時の処理）を追加した
- [ ] T-01 から T-09 が全件 PASS している

## 次の Phase: Phase 7 (phase-7-coverage.md)
