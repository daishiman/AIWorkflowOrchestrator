# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成                    |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-24                    |
| 機能名     | TASK-2A: SkillScanner         |

---

## 目的

TDD（テスト駆動開発）の Red フェーズとして、実装前に失敗するテストを作成する。テストはフィクスチャを使用し、SkillScanner の全機能をカバーする。

## 背景

テスト先行により、実装の仕様を明確化し、リファクタリング時の安全網を確保する。フィクスチャを使用することで、実際のファイルシステム操作をシミュレートする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストフィクスチャ作成

**目的**: テストで使用するスキルディレクトリのフィクスチャを作成する

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/__fixtures__/` ディレクトリを作成する

2. 以下のフィクスチャを作成する：

**valid-skill/SKILL.md**:

```markdown
---
name: valid-skill
description: テスト用の有効なスキル
allowed-tools:
  - Read
  - Write
  - Edit
---

# Valid Skill

This is a valid skill for testing.
```

**valid-skill/agents/task-1.md**:

```markdown
# Task 1 Agent

This agent handles task 1.
```

**valid-skill/references/guide.md**:

```markdown
# Reference Guide

Reference documentation for the skill.
```

**invalid-skill/README.md**:

```markdown
# Invalid Skill

This directory has no SKILL.md file.
```

**malformed-skill/SKILL.md**:

```markdown
---
name: malformed-skill
description: This YAML has a syntax error
allowed-tools: [Read, Write
---

# Malformed Skill
```

**minimal-skill/SKILL.md**:

```markdown
---
name: minimal-skill
description: Minimal skill with no subdirectories
---

# Minimal Skill
```

3. `outputs/phase-04/fixtures-created.md` にフィクスチャ一覧を記録する

**期待される成果物**:

- `__fixtures__/valid-skill/` ディレクトリとファイル
- `__fixtures__/invalid-skill/` ディレクトリとファイル
- `__fixtures__/malformed-skill/` ディレクトリとファイル
- `__fixtures__/minimal-skill/` ディレクトリとファイル
- `outputs/phase-04/fixtures-created.md`

---

### タスク2: scanAll テスト作成

**目的**: scanAll() メソッドのテストを作成する

**実行手順**:

1. `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` を作成する

2. 以下のテストケースを実装する：

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SkillScanner } from "../SkillScanner";
import path from "path";
import fs from "fs/promises";

describe("SkillScanner", () => {
  describe("scanAll", () => {
    it("should return all skills in the directory", async () => {
      // Arrange
      const scanner = new SkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      // Act
      const skills = await scanner.scanAll();

      // Assert
      expect(skills).toBeInstanceOf(Array);
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.some((s) => s.name === "valid-skill")).toBe(true);
    });

    it("should return empty array when directory is empty", async () => {
      // Arrange
      const emptyDir = path.join(__dirname, "__fixtures__", "empty-dir");
      await fs.mkdir(emptyDir, { recursive: true });
      const scanner = new SkillScanner({
        aiworkflowSkillsDir: emptyDir,
        claudeSkillsDir: "/non-existent-path",
      });

      // Act
      const skills = await scanner.scanAll();

      // Assert
      expect(skills).toEqual([]);

      // Cleanup
      await fs.rmdir(emptyDir);
    });

    it("should skip invalid skill directories (no SKILL.md)", async () => {
      const scanner = new SkillScanner({
        aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
        claudeSkillsDir: "/non-existent-path",
      });

      const skills = await scanner.scanAll();

      expect(skills.some((s) => s.name === "invalid-skill")).toBe(false);
    });

    it("should set readonly flag for claude skills directory", async () => {
      const scanner = new SkillScanner({
        aiworkflowSkillsDir: "/non-existent-path",
        claudeSkillsDir: path.join(__dirname, "__fixtures__"),
      });

      const skills = await scanner.scanAll();

      skills.forEach((skill) => {
        expect(skill.readonly).toBe(true);
      });
    });
  });
});
```

3. テストが失敗することを確認する（Red 状態）

**期待される成果物**:

- `SkillScanner.test.ts` の scanAll テストセクション

---

### タスク3: parseSkill テスト作成

**目的**: parseSkill() メソッドのテストを作成する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("parseSkill", () => {
  it("should parse SKILL.md frontmatter correctly", async () => {
    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const validSkill = skills.find((s) => s.name === "valid-skill");

    expect(validSkill).toBeDefined();
    expect(validSkill?.description).toBe("テスト用の有効なスキル");
    expect(validSkill?.allowedTools).toEqual(["Read", "Write", "Edit"]);
  });

  it("should return null for invalid SKILL.md", async () => {
    // malformed-skill should be skipped
    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();

    expect(skills.some((s) => s.name === "malformed-skill")).toBe(false);
  });

  it("should extract allowed-tools", async () => {
    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const validSkill = skills.find((s) => s.name === "valid-skill");

    expect(validSkill?.allowedTools).toContain("Read");
    expect(validSkill?.allowedTools).toContain("Write");
    expect(validSkill?.allowedTools).toContain("Edit");
  });
});
```

**期待される成果物**:

- `SkillScanner.test.ts` の parseSkill テストセクション

---

### タスク4: scanSubDirectory テスト作成

**目的**: scanSubDirectory() メソッドのテストを作成する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("scanSubDirectory", () => {
  it("should scan agents directory", async () => {
    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const validSkill = skills.find((s) => s.name === "valid-skill");

    expect(validSkill?.agents).toBeInstanceOf(Array);
    expect(validSkill?.agents.length).toBeGreaterThan(0);
    expect(validSkill?.agents[0].filename).toBe("task-1.md");
  });

  it("should scan references directory", async () => {
    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const validSkill = skills.find((s) => s.name === "valid-skill");

    expect(validSkill?.references).toBeInstanceOf(Array);
    expect(validSkill?.references.length).toBeGreaterThan(0);
    expect(validSkill?.references[0].filename).toBe("guide.md");
  });

  it("should return empty array for non-existent directory", async () => {
    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const minimalSkill = skills.find((s) => s.name === "minimal-skill");

    expect(minimalSkill?.agents).toEqual([]);
    expect(minimalSkill?.references).toEqual([]);
    expect(minimalSkill?.scripts).toEqual([]);
    expect(minimalSkill?.assets).toEqual([]);
    expect(minimalSkill?.schemas).toEqual([]);
    expect(minimalSkill?.indexes).toEqual([]);
  });
});
```

**期待される成果物**:

- `SkillScanner.test.ts` の scanSubDirectory テストセクション

---

### タスク5: extractDescription テスト作成

**目的**: extractDescription() メソッドのテストを作成する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("extractDescription", () => {
  it("should extract first heading as description", async () => {
    const scanner = new SkillScanner({
      aiworkflowSkillsDir: path.join(__dirname, "__fixtures__"),
      claudeSkillsDir: "/non-existent-path",
    });

    const skills = await scanner.scanAll();
    const validSkill = skills.find((s) => s.name === "valid-skill");

    // agents/task-1.md の説明が抽出されていることを確認
    const agent = validSkill?.agents.find((a) => a.filename === "task-1.md");
    expect(agent?.description).toBeDefined();
  });

  it("should fallback to first paragraph if no heading", async () => {
    // テスト用のフィクスチャを追加で作成する場合のテスト
    // 実際の実装時に詳細を調整
  });
});
```

**期待される成果物**:

- `SkillScanner.test.ts` の extractDescription テストセクション

---

### タスク6: Red 状態確認

**目的**: テストが失敗することを確認する（TDD Red フェーズ）

**実行手順**:

1. 以下のコマンドでテストを実行する：

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
```

2. 全テストが失敗することを確認する（SkillScanner クラスが未実装のため）

3. `outputs/phase-04/test-red-status.md` にテスト実行結果を記録する

**期待される成果物**:

- `outputs/phase-04/test-red-status.md`

---

## 参照資料

| 参照資料            | パス                                 | 内容                 |
| ------------------- | ------------------------------------ | -------------------- |
| Phase 2 設計        | `outputs/phase-02/`                  | クラス・メソッド設計 |
| Vitest ドキュメント | https://vitest.dev/                  | テストフレームワーク |
| TASK-1-1 型定義     | `packages/shared/src/types/skill.ts` | SkillMetadata 型     |

---

## 成果物

| 成果物             | パス                                                                  | 内容                 |
| ------------------ | --------------------------------------------------------------------- | -------------------- |
| テストフィクスチャ | `apps/desktop/src/main/services/skill/__tests__/__fixtures__/`        | テスト用スキルデータ |
| ユニットテスト     | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | テストコード         |
| フィクスチャ一覧   | `outputs/phase-04/fixtures-created.md`                                | フィクスチャ記録     |
| Red状態確認        | `outputs/phase-04/test-red-status.md`                                 | テスト実行結果       |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 統合テスト連携

**Phase 4 では統合テストの準備として**:

- IPC ハンドラーテスト用のモックパターンを想定
- テストフィクスチャは統合テストでも再利用可能な形式で作成

---

## 完了条件

- [ ] テストフィクスチャが `__fixtures__/` に作成されている
- [ ] `SkillScanner.test.ts` が作成されている
- [ ] scanAll テストケースが実装されている
- [ ] parseSkill テストケースが実装されている
- [ ] scanSubDirectory テストケースが実装されている
- [ ] extractDescription テストケースが実装されている
- [ ] テストが Red 状態（失敗）であることが確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/phase-05-implementation.md`
