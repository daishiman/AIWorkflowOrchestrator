# Phase 4: テスト作成（Red） -- Skill Output Integration

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 4                        |
| 機能名     | skill-output-integration |
| タスクID   | TASK-SDK-SC-04           |
| 作成日     | 2026-04-02               |
| 依存 Phase | Phase 3（設計レビュー）  |

## 目的

TDD の Red フェーズとして、`SkillCreatorOutputHandler` / `SkillCreatorResultPanel` に対するテストケース T-01 から T-06 を定義する。この時点ではテストが失敗する（Red）状態が正常である。

## 実行タスク

### Task 4-1: テストファイル構成

| テストファイル                                                                                  | 対象                        |
| ----------------------------------------------------------------------------------------------- | --------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorOutputHandler.test.ts`            | `SkillCreatorOutputHandler` |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx` | `SkillCreatorResultPanel`   |

### Task 4-2: T-01 — SDK セッション出力からスキル内容を正しく抽出

```typescript
// SkillCreatorOutputHandler.test.ts

describe("extractSkillFromOutput", () => {
  it("T-01: <!-- SKILL_START: {skillName} --> と <!-- SKILL_END: {skillName} --> マーカーで囲まれた内容を抽出する", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const sessionOutput = `
セッション実行中...
<!-- SKILL_START: my-test-skill -->
name: my-test-skill
description: テスト用スキル
<!-- SKILL_END: my-test-skill -->
セッション終了
    `;
    const result = handler.extractSkillFromOutput(sessionOutput);

    expect(result).not.toBeNull();
    expect(result?.name).toBe("my-test-skill");
    expect(result?.content).toContain("name: my-test-skill");
    expect(result?.dirName).toBe("my-test-skill");
  });

  it("T-01b: マーカーが存在しない場合はフォールバックで抽出し、name が無ければ null を返す", () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const result = handler.extractSkillFromOutput("マーカーなしの出力");
    expect(result).toBeNull();
  });
});
```

### Task 4-3: T-02 — スキルファイルが正しいパスに保存される

```typescript
// SkillCreatorOutputHandler.test.ts

describe("saveSkill", () => {
  it("T-02: {projectRoot}/.claude/skills/{dirName}/SKILL.md に保存する", async () => {
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );
    const skill: ParsedSkillOutput = {
      name: "my-test-skill",
      content: "name: my-test-skill\ndescription: テスト",
      dirName: "my-test-skill",
    };

    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);

    const savedPath = await handler.saveSkill(skill);

    expect(savedPath).toBe("/project/.claude/skills/my-test-skill/SKILL.md");
    expect(fs.writeFile).toHaveBeenCalledWith(
      "/project/.claude/skills/my-test-skill/SKILL.md",
      skill.content,
      "utf-8",
    );
  });
});
```

### Task 4-4: T-03 — `SkillRegistry` に登録される

```typescript
// SkillCreatorOutputHandler.test.ts

describe("registerToRegistry", () => {
  it("T-03: SkillRegistry.registerFromPath() が正しいパスで呼び出される", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWebContents,
    );

    await handler.registerToRegistry(
      "/project/.claude/skills/my-test-skill/SKILL.md",
    );

    expect(mockRegistry.registerFromPath).toHaveBeenCalledWith(
      "/project/.claude/skills/my-test-skill/SKILL.md",
    );
  });
});
```

### Task 4-5: T-04 — 既存スキルが存在する場合に上書き確認フラグが立つ

```typescript
// SkillCreatorOutputHandler.test.ts

describe("handleSessionComplete - overwrite confirmation", () => {
  it("T-04: 既存スキルが存在する場合 requiresOverwriteConfirm: true が設定される", async () => {
    vi.spyOn(fs, "access").mockResolvedValue(undefined); // ファイル存在

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents,
    );

    const sessionOutput = `
<!-- SKILL_START: existing-skill -->
name: existing-skill
description: 既存スキル
<!-- SKILL_END: existing-skill -->
    `;

    const notifySpy = vi.spyOn(handler, "notifyOutputReady");
    // 上書き確認が必要な場合は保存前に通知して確認を待つ
    await handler.handleSessionComplete(sessionOutput);

    expect(notifySpy).toHaveBeenCalledWith(
      expect.objectContaining({ requiresOverwriteConfirm: true }),
    );
  });

  it("T-04b: ユーザー承認後に handleOverwriteApproved() が保存・登録を続行する", async () => {
    const mockRegistry = {
      registerFromPath: vi.fn().mockResolvedValue(undefined),
    };
    const mockWC = { send: vi.fn() };
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined);

    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockRegistry as unknown as SkillRegistry,
      mockWC as unknown as Electron.WebContents,
    );

    await handler.handleOverwriteApproved({
      skillName: "existing-skill",
      savedPath: "/project/.claude/skills/existing-skill/SKILL.md",
      content: "name: existing-skill\ndescription: 既存スキル",
      requiresOverwriteConfirm: true,
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      "/project/.claude/skills/existing-skill/SKILL.md",
      "name: existing-skill\ndescription: 既存スキル",
      "utf-8",
    );
    expect(mockRegistry.registerFromPath).toHaveBeenCalledWith(
      "/project/.claude/skills/existing-skill/SKILL.md",
    );
    expect(mockWC.send).toHaveBeenCalledWith(
      SKILL_CREATOR_OUTPUT_READY,
      expect.objectContaining({ requiresOverwriteConfirm: false }),
    );
  });
});
```

### Task 4-6: T-05 — `skill-creator:output-ready` IPC が発行される

```typescript
// SkillCreatorOutputHandler.test.ts

describe("notifyOutputReady", () => {
  it("T-05: webContents.send() で SKILL_CREATOR_OUTPUT_READY チャネルに送信する", () => {
    const mockWebContents = { send: vi.fn() };
    const handler = new SkillCreatorOutputHandler(
      "/project",
      mockSkillRegistry,
      mockWebContents as unknown as Electron.WebContents,
    );
    const payload: SkillOutputReadyPayload = {
      skillName: "my-skill",
      savedPath: "/project/.claude/skills/my-skill/SKILL.md",
      content: "name: my-skill",
      requiresOverwriteConfirm: false,
    };

    handler.notifyOutputReady(payload);

    expect(mockWebContents.send).toHaveBeenCalledWith(
      SKILL_CREATOR_OUTPUT_READY,
      payload,
    );
  });
});
```

### Task 4-7: T-06 — `SkillCreatorResultPanel` がスキル名とプレビューを表示

```typescript
// SkillCreatorResultPanel.test.tsx

describe("SkillCreatorResultPanel", () => {
  it("T-06: スキル名と SKILL.md 内容プレビューを表示する", () => {
    const payload: SkillOutputReadyPayload = {
      skillName: "my-skill",
      savedPath: "/project/.claude/skills/my-skill/SKILL.md",
      content: "name: my-skill\ndescription: テスト用スキル",
      requiresOverwriteConfirm: false,
    };

    render(
      <SkillCreatorResultPanel
        payload={payload}
        onOpenSkill={vi.fn()}
        onConfirmOverwrite={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/スキルを生成しました: my-skill/),
    ).toBeInTheDocument();
    expect(screen.getByText(/description: テスト用スキル/)).toBeInTheDocument();
  });

  it("T-06b: payload が null の場合は何も表示しない", () => {
    const { container } = render(
      <SkillCreatorResultPanel
        payload={null}
        onOpenSkill={vi.fn()}
        onConfirmOverwrite={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("T-06c: requiresOverwriteConfirm が true の場合は上書きして保存ボタンを表示する", () => {
    const payload: SkillOutputReadyPayload = {
      skillName: "existing-skill",
      savedPath: "/project/.claude/skills/existing-skill/SKILL.md",
      content: "name: existing-skill\ndescription: 既存スキル",
      requiresOverwriteConfirm: true,
    };
    const confirmSpy = vi.fn();

    render(
      <SkillCreatorResultPanel
        payload={payload}
        onOpenSkill={vi.fn()}
        onConfirmOverwrite={confirmSpy}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "上書きして保存" });
    expect(confirmButton).toBeInTheDocument();
    fireEvent.click(confirmButton);
    expect(confirmSpy).toHaveBeenCalledWith(payload);
  });
});
```

## 参照資料

| 資料名           | パス                        |
| ---------------- | --------------------------- |
| Phase 1 要件定義 | `./phase-1-requirements.md` |
| Phase 2 設計     | `./phase-2-design.md`       |

## 成果物

| 成果物                     | パス                                                                                            | 形式       |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| テスト定義書（本ファイル） | `./phase-4-test-creation.md`                                                                    | Markdown   |
| OutputHandler テスト       | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorOutputHandler.test.ts`            | TypeScript |
| ResultPanel テスト         | `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx` | TypeScript |

## 完了条件

- [ ] T-01（SDK セッション出力からスキル内容を正しく抽出）を定義した
- [ ] T-02（スキルファイルが正しいパスに保存される）を定義した
- [ ] T-03（`SkillRegistry` に登録される）を定義した
- [ ] T-04（既存スキルが存在する場合に上書き確認フラグが立つ）を定義した
- [ ] T-05（`skill-creator:output-ready` IPC が発行される）を定義した
- [ ] T-06（`SkillCreatorResultPanel` がスキル名とプレビューを表示）を定義した
- [ ] テストを実行して Red（失敗）状態であることを確認した

## 次の Phase: Phase 5 (phase-5-implementation.md)
