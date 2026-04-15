# Phase 4 成果物: テスト設計書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| Phase名    | テスト設計                        |
| タスクID   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| ステータス | 完了                              |
| 作成日     | 2026-04-14                        |

## テストケース一覧（TC-01〜TC-07）

| テスト ID | 対象 AC | 入力条件                                                   | 期待結果                                                                                 | 備考                                     |
| --------- | ------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| TC-01     | AC-1    | `createSkill` を正常呼び出し                               | `execute("generate_skill_md.js", args)` の args に `"--plan"` と `"--output"` が含まれる | 旧引数 `"--path"` が含まれないことも確認 |
| TC-02     | AC-1    | `createSkill` を正常呼び出し                               | `--plan` の次要素が `os.tmpdir()` 配下のパス文字列である                                 | tmp ファイルパスの形式確認               |
| TC-03     | AC-1    | `createSkill` を正常呼び出し                               | `--output` の次要素が `skillDir/SKILL.md` である                                         | 出力パスの確認                           |
| TC-04     | AC-4    | `execute` が `{ success: false }` を返す（スクリプト失敗） | `ensureSkillMdExists` が呼び出される                                                     | フォールバック動作の確認                 |
| TC-05     | AC-4    | `execute` がスクリプト不在エラーを返す                     | `ensureSkillMdExists` が呼び出され、例外が throw されない                                | isMissingScriptError 経路の確認          |
| TC-06     | AC-5    | `execute` が `{ success: true }` を返す（スクリプト成功）  | `fs.unlink(tmpPlanPath)` が呼び出される                                                  | 成功時 cleanup 確認                      |
| TC-07     | AC-5    | `execute` が `{ success: false }` を返す（スクリプト失敗） | `fs.unlink(tmpPlanPath)` が呼び出される                                                  | 失敗時も cleanup される確認              |

## テストコードスケルトン

### TC-01〜TC-03: --plan / --output 引数検証

```typescript
describe("generate_skill_md.js 引数検証", () => {
  it("TC-01: --plan と --output 引数で呼び出す", async () => {
    // arrange
    const executeSpy = vi
      .spyOn(scriptExecutor, "execute")
      .mockResolvedValue({ success: true, stdout: "", stderr: "" });

    // act
    await service.createSkill({ name: "test", description: "desc" });

    // assert
    const [scriptName, args] = executeSpy.mock.calls[0];
    expect(scriptName).toBe("generate_skill_md.js");
    expect(args).toContain("--plan");
    expect(args).toContain("--output");
    expect(args).not.toContain("--path"); // 旧引数の排除確認
  });

  it("TC-02: --plan の次要素が os.tmpdir() 配下のパスである", async () => {
    const executeSpy = vi
      .spyOn(scriptExecutor, "execute")
      .mockResolvedValue({ success: true, stdout: "", stderr: "" });

    await service.createSkill({ name: "test", description: "desc" });

    const args = executeSpy.mock.calls[0][1];
    const planIdx = args.indexOf("--plan");
    expect(planIdx).toBeGreaterThan(-1);
    expect(args[planIdx + 1]).toContain(os.tmpdir());
  });

  it("TC-03: --output の次要素が skillDir/SKILL.md である", async () => {
    const executeSpy = vi
      .spyOn(scriptExecutor, "execute")
      .mockResolvedValue({ success: true, stdout: "", stderr: "" });

    await service.createSkill({ name: "test", description: "desc" });

    const args = executeSpy.mock.calls[0][1];
    const outputIdx = args.indexOf("--output");
    expect(outputIdx).toBeGreaterThan(-1);
    expect(args[outputIdx + 1]).toMatch(/SKILL\.md$/);
  });
});
```

### TC-04〜TC-05: フォールバック動作

```typescript
describe("フォールバック動作", () => {
  it("TC-04: generate_skill_md.js が失敗した場合に ensureSkillMdExists を呼ぶ", async () => {
    vi.spyOn(scriptExecutor, "execute").mockResolvedValue({
      success: false,
      stdout: "",
      stderr: "error",
    });
    const fallbackSpy = vi.spyOn(
      service as unknown as { ensureSkillMdExists: () => Promise<void> },
      "ensureSkillMdExists",
    );

    await service.createSkill({ name: "test", description: "desc" });

    expect(fallbackSpy).toHaveBeenCalled();
  });

  it("TC-05: スクリプト不在時もフォールバックし例外が投げられない", async () => {
    vi.spyOn(scriptExecutor, "execute").mockResolvedValue({
      success: false,
      stdout: "",
      stderr: "ENOENT: no such file",
    });

    await expect(
      service.createSkill({ name: "test", description: "desc" }),
    ).resolves.not.toThrow();
  });
});
```

### TC-06〜TC-07: finally cleanup

```typescript
describe("tmp ファイル cleanup", () => {
  it("TC-06: スクリプト成功時に tmp json ファイルを削除する", async () => {
    vi.spyOn(scriptExecutor, "execute").mockResolvedValue({
      success: true,
      stdout: "",
      stderr: "",
    });
    const unlinkSpy = vi.spyOn(fs, "unlink").mockResolvedValue();

    await service.createSkill({ name: "test", description: "desc" });

    expect(unlinkSpy).toHaveBeenCalledWith(
      expect.stringContaining(os.tmpdir()),
    );
  });

  it("TC-07: スクリプト失敗時も tmp json ファイルを削除する", async () => {
    vi.spyOn(scriptExecutor, "execute").mockResolvedValue({
      success: false,
      stdout: "",
      stderr: "error",
    });
    const unlinkSpy = vi.spyOn(fs, "unlink").mockResolvedValue();

    await service.createSkill({ name: "test", description: "desc" });

    expect(unlinkSpy).toHaveBeenCalled();
  });
});
```

## TDD 確認コマンド

```bash
# Red フェーズ（実装前にテストが失敗することを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# Green フェーズ（実装後にテストが全件パスすることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"
```

## 参照資料

- `phase-4-test-creation.md` — テスト設計仕様書（本成果物の親仕様）
- `TASK-SC-FIX-GENERATE-SKILL-MD-001/index.md` — 受入条件 AC-1〜AC-5
