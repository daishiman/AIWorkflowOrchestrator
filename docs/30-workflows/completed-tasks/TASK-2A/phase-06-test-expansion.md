# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| 前提Phase  | Phase 5（実装）                 |
| 後続Phase  | Phase 7（テストカバレッジ確認） |
| ステータス | 未実施                          |
| 作成日     | 2026-01-24                      |
| 機能名     | TASK-2A: SkillScanner           |

---

## 目的

カバレッジ目標（Line 80%+、Branch 60%+）達成に向けた追加テストを作成する。エッジケース、エラーケース、境界値テストを追加し、実装の堅牢性を検証する。

## 背景

Phase 4 で基本的なテストは作成したが、全ての分岐やエッジケースをカバーしていない可能性がある。本フェーズでは、カバレッジレポートを参考に追加テストを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現在のカバレッジ確認

**目的**: 現在のテストカバレッジを確認し、不足箇所を特定する

**実行手順**:

1. カバレッジ付きでテストを実行する：

```bash
pnpm --filter @repo/desktop test -- --coverage --run apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
```

2. カバレッジレポートを確認し、以下を記録する：
   - Line Coverage: XX%
   - Branch Coverage: XX%
   - Function Coverage: XX%

3. カバーされていない行・分岐を特定する

4. `outputs/phase-06/initial-coverage.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-06/initial-coverage.md`

---

### タスク2: エラーケーステスト追加

**目的**: 異常系のテストを追加する

**実行手順**:

1. 以下のエラーケーステストを追加する：

```typescript
describe("error handling", () => {
  it("should handle permission error when reading directory", async () => {
    // ディレクトリ読み取り権限がない場合のテスト
    // モックを使用してENOENTエラーをシミュレート
  });

  it("should skip skill with unreadable SKILL.md", async () => {
    // SKILL.md が読み取れない場合にスキップされることを確認
  });

  it("should handle invalid YAML in frontmatter gracefully", async () => {
    // malformed-skill フィクスチャを使用
    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();

    // エラーなくスキャンが完了し、不正スキルはスキップされる
    expect(skills.some((s) => s.name === "malformed-skill")).toBe(false);
  });

  it("should create aiworkflow directory if not exists", async () => {
    const tempDir = path.join(__dirname, "__fixtures__", "temp-aiworkflow");

    const scanner = new SkillScanner({
      aiworkflowSkillsDir: tempDir,
      claudeSkillsDir: "/non-existent-path",
    });

    await scanner.scanAll();

    // ディレクトリが作成されていることを確認
    const exists = await fs
      .access(tempDir)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    // クリーンアップ
    await fs.rmdir(tempDir);
  });
});
```

**期待される成果物**:

- エラーケーステストの追加

---

### タスク3: 境界値テスト追加

**目的**: 境界値のテストを追加する

**実行手順**:

1. 以下の境界値テストを追加する：

```typescript
describe("boundary cases", () => {
  it("should handle empty SKILL.md", async () => {
    // 空のSKILL.mdを持つフィクスチャを作成
    const emptySkillDir = path.join(__dirname, "__fixtures__", "empty-skillmd");
    await fs.mkdir(emptySkillDir, { recursive: true });
    await fs.writeFile(path.join(emptySkillDir, "SKILL.md"), "");

    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();

    // 空のSKILL.mdでもエラーにならない
    const emptySkill = skills.find((s) => s.name === "empty-skillmd");
    expect(emptySkill).toBeDefined();
    expect(emptySkill?.description).toBe("");

    // クリーンアップ
    await fs.rm(emptySkillDir, { recursive: true });
  });

  it("should handle SKILL.md without frontmatter", async () => {
    const noFrontmatterDir = path.join(
      __dirname,
      "__fixtures__",
      "no-frontmatter",
    );
    await fs.mkdir(noFrontmatterDir, { recursive: true });
    await fs.writeFile(
      path.join(noFrontmatterDir, "SKILL.md"),
      "# No Frontmatter Skill\n\nJust markdown content.",
    );

    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const skill = skills.find((s) => s.name === "no-frontmatter");

    expect(skill).toBeDefined();
    expect(skill?.description).toBe("");

    await fs.rm(noFrontmatterDir, { recursive: true });
  });

  it("should handle very long description", async () => {
    const longDescDir = path.join(__dirname, "__fixtures__", "long-desc");
    await fs.mkdir(longDescDir, { recursive: true });
    const longDesc = "A".repeat(5000);
    await fs.writeFile(
      path.join(longDescDir, "SKILL.md"),
      `---\nname: long-desc\ndescription: ${longDesc}\n---\n# Long Description Skill`,
    );

    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const skill = skills.find((s) => s.name === "long-desc");

    expect(skill).toBeDefined();
    expect(skill?.description.length).toBe(5000);

    await fs.rm(longDescDir, { recursive: true });
  });
});
```

**期待される成果物**:

- 境界値テストの追加

---

### タスク4: サブディレクトリテスト拡充

**目的**: 全6種類のサブディレクトリのテストを追加する

**実行手順**:

1. 以下のテストを追加する：

```typescript
describe("all subdirectory types", () => {
  it("should scan scripts directory", async () => {
    // scripts/ ディレクトリを持つフィクスチャを作成
    const skillDir = path.join(__dirname, "__fixtures__", "full-skill");
    await fs.mkdir(path.join(skillDir, "scripts"), { recursive: true });
    await fs.writeFile(
      path.join(skillDir, "SKILL.md"),
      "---\nname: full-skill\ndescription: Full skill test\n---",
    );
    await fs.writeFile(
      path.join(skillDir, "scripts", "helper.js"),
      'console.log("helper");',
    );

    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const skill = skills.find((s) => s.name === "full-skill");

    expect(skill?.scripts).toHaveLength(1);
    expect(skill?.scripts[0].filename).toBe("helper.js");

    await fs.rm(skillDir, { recursive: true });
  });

  it("should scan assets directory", async () => {
    // assets/ テスト
  });

  it("should scan schemas directory", async () => {
    // schemas/ テスト
  });

  it("should scan indexes directory", async () => {
    // indexes/ テスト
  });
});
```

**期待される成果物**:

- サブディレクトリテストの追加

---

### タスク5: その他ファイルテスト追加

**目的**: EVALS.json, LOGS.md, package.json の検出テストを追加する

**実行手順**:

1. 以下のテストを追加する：

```typescript
describe("other files detection", () => {
  it("should detect EVALS.json", async () => {
    const skillDir = path.join(__dirname, "__fixtures__", "with-evals");
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(
      path.join(skillDir, "SKILL.md"),
      "---\nname: with-evals\ndescription: Skill with EVALS\n---",
    );
    await fs.writeFile(
      path.join(skillDir, "EVALS.json"),
      '{"evaluations": []}',
    );

    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const skill = skills.find((s) => s.name === "with-evals");

    expect(skill?.otherFiles).toContainEqual(
      expect.objectContaining({ filename: "EVALS.json", type: "evals" }),
    );

    await fs.rm(skillDir, { recursive: true });
  });

  it("should detect LOGS.md", async () => {
    // LOGS.md テスト
  });

  it("should detect package.json", async () => {
    // package.json テスト
  });
});
```

**期待される成果物**:

- その他ファイルテストの追加

---

### タスク6: 最終カバレッジ確認

**目的**: 追加テスト後のカバレッジを確認する

**実行手順**:

1. カバレッジ付きでテストを実行する：

```bash
pnpm --filter @repo/desktop test -- --coverage --run apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
```

2. カバレッジが目標を達成していることを確認する：
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上

3. `outputs/phase-06/final-coverage.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-06/final-coverage.md`

---

## 参照資料

| 参照資料       | パス                                                                  | 内容           |
| -------------- | --------------------------------------------------------------------- | -------------- |
| Phase 4 テスト | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | 元テストコード |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/SkillScanner.ts`                | 実装コード     |

---

## 成果物

| 成果物         | パス                                                                  | 内容             |
| -------------- | --------------------------------------------------------------------- | ---------------- |
| 拡充テスト     | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | 追加テスト       |
| 初期カバレッジ | `outputs/phase-06/initial-coverage.md`                                | 追加前カバレッジ |
| 最終カバレッジ | `outputs/phase-06/final-coverage.md`                                  | 追加後カバレッジ |

---

## 統合テスト連携

**Phase 6 では統合テスト用のテストパターンを参考に**:

- IPC ハンドラーテストで使用可能なモックパターンを確認
- フィクスチャの再利用可能性を確認

---

## 完了条件

- [ ] 初期カバレッジが記録されている
- [ ] エラーケーステストが追加されている
- [ ] 境界値テストが追加されている
- [ ] 全6種類のサブディレクトリテストが追加されている
- [ ] その他ファイル検出テストが追加されている
- [ ] 最終カバレッジが目標（Line 80%+、Branch 60%+）を達成している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/phase-07-coverage.md`
