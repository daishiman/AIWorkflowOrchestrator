---
id: TASK-8A
tier: 1
title: 単体テスト
phase: 8
depends_on: [TASK-2A, TASK-2B, TASK-3-1, TASK-3-2, TASK-6-1]
parallel_with: [TASK-8B, TASK-8C]
blocks: []
status: pending
priority: high
estimated_complexity: medium
tags: [test, unit-test, backend, frontend]
---

# 単体テスト

## 概要

サービス層・状態管理層の単体テストを実装する。

## 入力

- TASK-2A: SkillScanner
- TASK-2B: SkillImportStore
- TASK-3-1: SkillExecutor
- TASK-3-2: PermissionResolver
- TASK-6-1: SkillSlice

## 出力

- 各サービスの単体テストファイル
- 全テスト通過

## 実装詳細

### SkillScanner テスト

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillScanner } from "../SkillScanner";
import fs from "fs/promises";

vi.mock("fs/promises");

describe("SkillScanner", () => {
  let scanner: SkillScanner;

  beforeEach(() => {
    scanner = new SkillScanner("/test/skills");
    vi.clearAllMocks();
  });

  describe("scanAll", () => {
    it("should return empty array when skills directory does not exist", async () => {
      vi.mocked(fs.readdir).mockRejectedValue(
        new Error("ENOENT: no such file or directory"),
      );

      const result = await scanner.scanAll();

      expect(result).toEqual([]);
    });

    it("should scan all skill directories", async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: "skill-a", isDirectory: () => true },
        { name: "skill-b", isDirectory: () => true },
        { name: ".hidden", isDirectory: () => true },
        { name: "file.txt", isDirectory: () => false },
      ] as unknown as Dirent[]);

      vi.mocked(fs.readFile).mockResolvedValue(`---
allowed_tools:
  - Bash
  - Read
---
# Test Skill
Description here
`);

      const result = await scanner.scanAll();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe("skill-a");
      expect(result[1].name).toBe("skill-b");
    });

    it("should skip directories without SKILL.md", async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: "skill-a", isDirectory: () => true },
      ] as unknown as Dirent[]);

      vi.mocked(fs.readFile).mockRejectedValue(
        new Error("ENOENT: no such file or directory"),
      );

      const result = await scanner.scanAll();

      expect(result).toEqual([]);
    });
  });

  describe("parseSkill", () => {
    it("should parse SKILL.md frontmatter", async () => {
      vi.mocked(fs.readFile).mockResolvedValue(`---
allowed_tools:
  - Bash
  - Read
  - Write
---
# My Skill
This is a description.
`);

      vi.mocked(fs.readdir).mockResolvedValue([]);

      const result = await scanner.parseSkill("/test/skills/my-skill");

      expect(result).not.toBeNull();
      expect(result!.name).toBe("my-skill");
      expect(result!.allowedTools).toEqual(["Bash", "Read", "Write"]);
      expect(result!.description).toContain("This is a description");
    });

    it("should scan subdirectories", async () => {
      vi.mocked(fs.readFile).mockResolvedValue(`---
allowed_tools: []
---
# Skill
`);

      vi.mocked(fs.readdir)
        .mockResolvedValueOnce([]) // root
        .mockResolvedValueOnce([
          // agents/
          { name: "agent1.md", isFile: () => true },
          { name: "agent2.md", isFile: () => true },
        ] as unknown as Dirent[])
        .mockResolvedValueOnce([]) // references/
        .mockResolvedValueOnce([]) // scripts/
        .mockResolvedValueOnce([]) // assets/
        .mockResolvedValueOnce([]) // schemas/
        .mockResolvedValueOnce([]); // indexes/

      const result = await scanner.parseSkill("/test/skills/my-skill");

      expect(result!.agents.length).toBe(2);
    });
  });

  describe("parseFrontmatter", () => {
    it("should extract YAML frontmatter", () => {
      const content = `---
key: value
list:
  - item1
  - item2
---
Body content here.
`;

      const result = scanner.parseFrontmatter(content);

      expect(result.frontmatter).toEqual({
        key: "value",
        list: ["item1", "item2"],
      });
      expect(result.body).toBe("Body content here.\n");
    });

    it("should handle missing frontmatter", () => {
      const content = "No frontmatter here.";

      const result = scanner.parseFrontmatter(content);

      expect(result.frontmatter).toEqual({});
      expect(result.body).toBe(content);
    });
  });
});
```

### SkillImportStore テスト

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImportStore.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillImportStore } from "../SkillImportStore";
import Store from "electron-store";

vi.mock("electron-store");

describe("SkillImportStore", () => {
  let store: SkillImportStore;
  let mockElectronStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    has: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockElectronStore = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
    };
    vi.mocked(Store).mockImplementation(() => mockElectronStore as never);
    store = new SkillImportStore();
  });

  describe("get", () => {
    it("should return all imported skills", () => {
      const mockSkills = [
        { name: "skill-a", importedAt: Date.now() },
        { name: "skill-b", importedAt: Date.now() },
      ];
      mockElectronStore.get.mockReturnValue(mockSkills);

      const result = store.get();

      expect(result).toEqual(mockSkills);
    });

    it("should return empty array when no skills imported", () => {
      mockElectronStore.get.mockReturnValue([]);

      const result = store.get();

      expect(result).toEqual([]);
    });
  });

  describe("add", () => {
    it("should add a new skill", () => {
      const existingSkills = [{ name: "existing", importedAt: 1000 }];
      mockElectronStore.get.mockReturnValue(existingSkills);

      const newSkill = {
        name: "new-skill",
        description: "Test",
        allowedTools: ["Bash"],
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
      };

      store.add(newSkill);

      expect(mockElectronStore.set).toHaveBeenCalledWith(
        "importedSkills",
        expect.arrayContaining([
          expect.objectContaining({ name: "new-skill" }),
        ]),
      );
    });

    it("should not add duplicate skill", () => {
      const existingSkills = [{ name: "skill-a", importedAt: 1000 }];
      mockElectronStore.get.mockReturnValue(existingSkills);

      const newSkill = {
        name: "skill-a",
        description: "Test",
        allowedTools: [],
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
      };

      expect(() => store.add(newSkill)).toThrow(
        "Skill skill-a is already imported",
      );
    });
  });

  describe("remove", () => {
    it("should remove a skill by name", () => {
      const existingSkills = [
        { name: "skill-a", importedAt: 1000 },
        { name: "skill-b", importedAt: 2000 },
      ];
      mockElectronStore.get.mockReturnValue(existingSkills);

      store.remove("skill-a");

      expect(mockElectronStore.set).toHaveBeenCalledWith("importedSkills", [
        { name: "skill-b", importedAt: 2000 },
      ]);
    });
  });

  describe("exists", () => {
    it("should return true when skill exists", () => {
      const existingSkills = [{ name: "skill-a", importedAt: 1000 }];
      mockElectronStore.get.mockReturnValue(existingSkills);

      const result = store.exists("skill-a");

      expect(result).toBe(true);
    });

    it("should return false when skill does not exist", () => {
      mockElectronStore.get.mockReturnValue([]);

      const result = store.exists("skill-a");

      expect(result).toBe(false);
    });
  });
});
```

### SkillExecutor テスト

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillExecutor } from "../SkillExecutor";

vi.mock("@anthropic-ai/claude-agent-sdk");

describe("SkillExecutor", () => {
  let executor: SkillExecutor;
  let mockCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    executor = new SkillExecutor();
    mockCallback = vi.fn();
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should return execution ID", async () => {
      const result = await executor.execute(
        {
          skillName: "test-skill",
          prompt: "Test prompt",
        },
        mockCallback,
      );

      expect(result.executionId).toBeDefined();
      expect(typeof result.executionId).toBe("string");
    });

    it("should not execute when skill is not found", async () => {
      await expect(
        executor.execute(
          {
            skillName: "non-existent",
            prompt: "Test",
          },
          mockCallback,
        ),
      ).rejects.toThrow("Skill not found");
    });
  });

  describe("abort", () => {
    it("should abort running execution", async () => {
      const { executionId } = await executor.execute(
        {
          skillName: "test-skill",
          prompt: "Test prompt",
        },
        mockCallback,
      );

      const result = executor.abort(executionId);

      expect(result).toBe(true);
    });

    it("should return false for non-existent execution", () => {
      const result = executor.abort("non-existent-id");

      expect(result).toBe(false);
    });
  });

  describe("buildPrompt", () => {
    it("should build prompt with skill context", () => {
      const skill = {
        name: "test-skill",
        description: "Test description",
        agents: [
          {
            filename: "agent.md",
            relativePath: "agents/agent.md",
            description: "Agent desc",
          },
        ],
        references: [],
      };

      const prompt = executor.buildPrompt(skill, "User input");

      expect(prompt).toContain("test-skill");
      expect(prompt).toContain("Test description");
      expect(prompt).toContain("agent.md");
      expect(prompt).toContain("User input");
    });
  });
});
```

### PermissionResolver テスト

```typescript
// apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PermissionResolver } from "../PermissionResolver";

describe("PermissionResolver", () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    resolver = new PermissionResolver();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("waitForResponse", () => {
    it("should resolve when response is provided", async () => {
      const requestId = "test-request-id";
      const promise = resolver.waitForResponse(requestId);

      resolver.resolveRequest(requestId, true);

      const result = await promise;

      expect(result.approved).toBe(true);
    });

    it("should reject when aborted", async () => {
      const requestId = "test-request-id";
      const abortController = new AbortController();

      const promise = resolver.waitForResponse(
        requestId,
        abortController.signal,
      );

      abortController.abort();

      await expect(promise).rejects.toThrow("Aborted");
    });

    it("should handle remember choice", async () => {
      const requestId = "test-request-id";
      const promise = resolver.waitForResponse(requestId);

      resolver.resolveRequest(requestId, true, true);

      const result = await promise;

      expect(result.approved).toBe(true);
      expect(result.rememberChoice).toBe(true);
    });
  });

  describe("resolveRequest", () => {
    it("should resolve pending request", () => {
      const requestId = "test-request-id";
      resolver.waitForResponse(requestId);

      const result = resolver.resolveRequest(requestId, true);

      expect(result).toBe(true);
    });

    it("should return false for non-existent request", () => {
      const result = resolver.resolveRequest("non-existent", true);

      expect(result).toBe(false);
    });
  });
});
```

### skillSlice テスト

```typescript
// apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSkillSlice } from "../skillSlice";

const mockSkillAPI = {
  list: vi.fn(),
  getImported: vi.fn(),
  rescan: vi.fn(),
  import: vi.fn(),
  remove: vi.fn(),
  execute: vi.fn(),
  abort: vi.fn(),
  respondToPermission: vi.fn(),
};

vi.stubGlobal("window", {
  electronAPI: {
    skill: mockSkillAPI,
  },
});

describe("skillSlice", () => {
  let slice: ReturnType<typeof createSkillSlice>;
  let set: ReturnType<typeof vi.fn>;
  let get: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    set = vi.fn();
    get = vi.fn(() => slice);
    slice = createSkillSlice(set, get, {} as never);
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      expect(slice.availableSkills).toEqual([]);
      expect(slice.importedSkills).toEqual([]);
      expect(slice.selectedSkillName).toBeNull();
      expect(slice.isExecuting).toBe(false);
      expect(slice.executionStatus).toBeNull();
    });
  });

  describe("fetchSkills", () => {
    it("should fetch available and imported skills", async () => {
      const available = [{ name: "skill-a" }];
      const imported = [{ name: "skill-b" }];
      mockSkillAPI.list.mockResolvedValue(available);
      mockSkillAPI.getImported.mockResolvedValue(imported);

      await slice.fetchSkills();

      expect(set).toHaveBeenCalledWith({
        isLoadingSkills: true,
        skillError: null,
      });
      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({
          availableSkills: available,
          importedSkills: imported,
          isLoadingSkills: false,
        }),
      );
    });

    it("should handle errors", async () => {
      mockSkillAPI.list.mockRejectedValue(new Error("Network error"));

      await slice.fetchSkills();

      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({
          skillError: expect.stringContaining("スキル一覧の取得に失敗"),
          isLoadingSkills: false,
        }),
      );
    });
  });

  describe("importSkill", () => {
    it("should import skill and update state", async () => {
      const importedSkill = { name: "new-skill", importedAt: Date.now() };
      mockSkillAPI.import.mockResolvedValue(importedSkill);

      await slice.importSkill("new-skill");

      expect(set).toHaveBeenCalledWith({
        isImporting: true,
        importingSkillName: "new-skill",
        skillError: null,
      });
    });
  });

  describe("selectSkill", () => {
    it("should set selected skill name", () => {
      slice.selectSkill("test-skill");

      expect(set).toHaveBeenCalledWith({ selectedSkillName: "test-skill" });
    });

    it("should allow null selection", () => {
      slice.selectSkill(null);

      expect(set).toHaveBeenCalledWith({ selectedSkillName: null });
    });
  });

  describe("executeSkill", () => {
    it("should not execute when no skill selected", async () => {
      get.mockReturnValue({ ...slice, selectedSkillName: null });

      await slice.executeSkill("test prompt");

      expect(mockSkillAPI.execute).not.toHaveBeenCalled();
    });
  });

  describe("_handleStreamMessage", () => {
    it("should append message to streamingMessages", () => {
      const message = {
        type: "assistant",
        content: { text: "Hello" },
        timestamp: Date.now(),
      };
      get.mockReturnValue({ ...slice, streamingMessages: [] });

      slice._handleStreamMessage(message as never);

      expect(set).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("_handlePermissionRequest", () => {
    it("should set pendingPermission", () => {
      const request = { requestId: "req-1", toolName: "Bash", args: {} };

      slice._handlePermissionRequest(request as never);

      expect(set).toHaveBeenCalledWith({
        pendingPermission: request,
        executionStatus: "permission_pending",
      });
    });
  });
});
```

## ファイル

| 操作 | パス                                                                        |
| ---- | --------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       |
| 作成 | `apps/desktop/src/main/services/skill/__tests__/SkillImportStore.test.ts`   |
| 作成 | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`      |
| 作成 | `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` |
| 作成 | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`       |

## 依存パッケージ

- `vitest` - テストフレームワーク（既存）

## 完了条件

- [ ] SkillScanner テストが全て通過する
- [ ] SkillImportStore テストが全て通過する
- [ ] SkillExecutor テストが全て通過する
- [ ] PermissionResolver テストが全て通過する
- [ ] skillSlice テストが全て通過する
- [ ] カバレッジ 80% 以上

## テストケース一覧

### SkillScanner (10ケース)

1. scanAll - 空ディレクトリ
2. scanAll - 複数スキルスキャン
3. scanAll - SKILL.md なしスキップ
4. parseSkill - Frontmatter パース
5. parseSkill - サブディレクトリスキャン
6. parseSkill - エラーハンドリング
7. parseFrontmatter - 正常パース
8. parseFrontmatter - Frontmatter なし
9. extractDescription - 説明抽出
10. scanSubDirectory - ファイル一覧

### SkillImportStore (8ケース)

1. get - 全スキル取得
2. get - 空配列
3. add - 新規スキル追加
4. add - 重複防止
5. remove - スキル削除
6. exists - 存在確認（true）
7. exists - 存在確認（false）
8. update - スキル更新

### SkillExecutor (8ケース)

1. execute - 実行ID返却
2. execute - スキル未発見エラー
3. abort - 実行中止
4. abort - 存在しない実行
5. buildPrompt - プロンプト構築
6. buildContextInfo - コンテキスト構築
7. createHooks - Hooks作成
8. handlePermissionResponse - 権限応答

### PermissionResolver (6ケース)

1. waitForResponse - 応答受信
2. waitForResponse - アボート
3. waitForResponse - 記憶選択
4. resolveRequest - リクエスト解決
5. resolveRequest - 存在しないリクエスト
6. hasPending - 保留中確認

### skillSlice (12ケース)

1. initial state
2. fetchSkills - 成功
3. fetchSkills - エラー
4. importSkill - 成功
5. importSkill - エラー
6. removeSkill - 成功
7. selectSkill - スキル選択
8. selectSkill - null選択
9. executeSkill - スキル未選択時
10. \_handleStreamMessage - メッセージ追加
11. \_handleComplete - 完了処理
12. \_handlePermissionRequest - 権限リクエスト

## 参考資料

- [Vitest ドキュメント](https://vitest.dev/)
- 既存テストパターン: `apps/desktop/src/main/services/__tests__/`
