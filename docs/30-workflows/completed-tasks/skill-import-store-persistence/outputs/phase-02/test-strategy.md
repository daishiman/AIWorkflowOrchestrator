# Phase 2 - タスク3: テスト戦略

## 作成日

2026-01-22

---

## 1. 既存テストの分析

### 1.1 ユニットテスト（28件）

**ファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`

| カテゴリ             | テスト数 | 説明                       |
| -------------------- | -------- | -------------------------- |
| importSkills         | 6件      | インポート機能のテスト     |
| removeSkill          | 5件      | 削除機能のテスト           |
| getImportedSkillIds  | 4件      | ID取得機能のテスト         |
| isImported           | 2件      | インポート状態確認のテスト |
| Persistence          | 2件      | 永続化の基本テスト         |
| Edge Cases           | 3件      | エッジケーステスト         |
| Remove Additional    | 3件      | 削除の追加テスト           |
| Store Error Handling | 3件      | エラーハンドリングテスト   |

### 1.2 テストの特徴

**使用しているモック**:

```typescript
mockStore = {
  get: vi.fn().mockReturnValue([]),
  set: vi.fn(),
};
manager = new SkillImportManager(mockStore as never);
```

**問題点**:

- 実際のelectron-storeインスタンスを使用していない
- ファイルI/Oが発生しない
- 永続化の実際の挙動が検証されていない

---

## 2. テスト戦略

### 2.1 テスト階層

```
┌─────────────────────────────────────────────────────────────────┐
│ Level 3: E2Eテスト（本タスクのスコープ外）                        │
│ - Playwright/Spectronによるアプリ全体テスト                       │
│ - UI操作からストア永続化までの一連のフロー                        │
└─────────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│ Level 2: 統合テスト【新規追加】                                   │
│ - 実際のelectron-storeを使用                                     │
│ - ファイルI/Oを含む                                              │
│ - インスタンス間でのデータ永続化確認                              │
└─────────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│ Level 1: ユニットテスト【既存維持】                               │
│ - モックを使用                                                    │
│ - ロジックの単体テスト                                            │
│ - 高速実行                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 追加するテストカテゴリ

| カテゴリ             | 目的                                 | 優先度 |
| -------------------- | ------------------------------------ | ------ |
| ストアファイルI/O    | 実際のファイル読み書きを検証         | 高     |
| インスタンス間永続化 | 複数インスタンスでのデータ共有を検証 | 高     |
| エラーリカバリー     | ファイル破損時の回復を検証           | 中     |

---

## 3. 統合テスト設計

### 3.1 テストファイル構成

```
apps/desktop/src/main/services/skill/__tests__/
├── SkillImportManager.test.ts           # 既存ユニットテスト
└── SkillImportManager.integration.test.ts  # 新規統合テスト
```

### 3.2 テストケース一覧

#### カテゴリA: ストアファイルI/O

| ID     | テスト名                                            | 説明                                       |
| ------ | --------------------------------------------------- | ------------------------------------------ |
| INT-01 | should create store file on first write             | 初回書き込みでファイルが作成される         |
| INT-02 | should persist imported skills to actual store file | インポートしたスキルがファイルに保存される |
| INT-03 | should read existing data from store file           | 既存データがファイルから読み込まれる       |

#### カテゴリB: インスタンス間永続化

| ID     | テスト名                                            | 説明                                       |
| ------ | --------------------------------------------------- | ------------------------------------------ |
| INT-04 | should restore imported skills across instances     | インスタンス間でデータが保持される         |
| INT-05 | should reflect changes from one instance to another | 一方のインスタンスの変更が他方に反映される |

#### カテゴリC: エラーリカバリー

| ID     | テスト名                                       | 説明                               |
| ------ | ---------------------------------------------- | ---------------------------------- |
| INT-06 | should handle corrupted store file gracefully  | 破損ファイルでもエラーにならない   |
| INT-07 | should use defaults when store file is missing | ファイル不在時はデフォルト値を使用 |

### 3.3 テストコードテンプレート

```typescript
// SkillImportManager.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Store from "electron-store";
import { SkillImportManager } from "../SkillImportManager";
import fs from "fs";
import path from "path";
import os from "os";

describe("SkillImportManager Integration Tests", () => {
  let testStorePath: string;
  let store: Store<{ importedSkillIds: string[] }>;
  let manager: SkillImportManager;

  beforeEach(() => {
    // テスト用の一時ディレクトリを作成
    testStorePath = path.join(os.tmpdir(), `skill-test-${Date.now()}`);
    fs.mkdirSync(testStorePath, { recursive: true });

    store = new Store<{ importedSkillIds: string[] }>({
      name: "skills-test",
      cwd: testStorePath,
      defaults: { importedSkillIds: [] },
    });

    manager = new SkillImportManager(store);
  });

  afterEach(() => {
    // クリーンアップ
    try {
      fs.rmSync(testStorePath, { recursive: true, force: true });
    } catch {
      // クリーンアップ失敗は無視
    }
  });

  describe("Store File I/O", () => {
    it("INT-01: should create store file on first write", async () => {
      const storeFilePath = path.join(testStorePath, "skills-test.json");

      // Act
      await manager.importSkills(["skill-1"]);

      // Assert
      expect(fs.existsSync(storeFilePath)).toBe(true);
    });

    it("INT-02: should persist imported skills to actual store file", async () => {
      const storeFilePath = path.join(testStorePath, "skills-test.json");

      // Act
      await manager.importSkills(["skill-1", "skill-2"]);

      // Assert
      const fileContent = JSON.parse(fs.readFileSync(storeFilePath, "utf-8"));
      expect(fileContent.importedSkillIds).toEqual(
        expect.arrayContaining(["skill-1", "skill-2"]),
      );
    });

    it("INT-03: should read existing data from store file", () => {
      const storeFilePath = path.join(testStorePath, "skills-test.json");

      // Arrange: 直接ファイルにデータを書き込む
      fs.writeFileSync(
        storeFilePath,
        JSON.stringify({ importedSkillIds: ["pre-existing-skill"] }),
      );

      // Act: 新しいインスタンスを作成
      const newStore = new Store<{ importedSkillIds: string[] }>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);

      // Assert
      expect(newManager.getImportedSkillIds()).toContain("pre-existing-skill");
    });
  });

  describe("Cross-instance Persistence", () => {
    it("INT-04: should restore imported skills across instances", async () => {
      // Arrange
      await manager.importSkills(["skill-1"]);

      // Act
      const newStore = new Store<{ importedSkillIds: string[] }>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const newManager = new SkillImportManager(newStore);

      // Assert
      expect(newManager.getImportedSkillIds()).toContain("skill-1");
    });

    it("INT-05: should accumulate imports across instances", async () => {
      // Arrange: 最初のインスタンスでインポート
      await manager.importSkills(["skill-1"]);

      // Act: 2番目のインスタンスで追加インポート
      const store2 = new Store<{ importedSkillIds: string[] }>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const manager2 = new SkillImportManager(store2);
      await manager2.importSkills(["skill-2"]);

      // Assert: 3番目のインスタンスで両方確認
      const store3 = new Store<{ importedSkillIds: string[] }>({
        name: "skills-test",
        cwd: testStorePath,
        defaults: { importedSkillIds: [] },
      });
      const manager3 = new SkillImportManager(store3);
      expect(manager3.getImportedSkillIds()).toEqual(
        expect.arrayContaining(["skill-1", "skill-2"]),
      );
    });
  });

  describe("Error Recovery", () => {
    it("INT-06: should handle corrupted store file gracefully", () => {
      const storeFilePath = path.join(testStorePath, "skills-test.json");

      // Arrange: 破損したJSONを書き込む
      fs.writeFileSync(storeFilePath, "{ invalid json }");

      // Act & Assert: エラーにならないこと
      expect(() => {
        new Store<{ importedSkillIds: string[] }>({
          name: "skills-test",
          cwd: testStorePath,
          defaults: { importedSkillIds: [] },
          clearInvalidConfig: true,
        });
      }).not.toThrow();
    });
  });
});
```

---

## 4. テスト実行計画

### 4.1 実行順序

1. **既存ユニットテスト**: すべてパスすることを確認
2. **新規統合テスト**: 追加したテストを実行
3. **全テスト実行**: リグレッションがないことを確認

### 4.2 実行コマンド

```bash
# ユニットテストのみ
pnpm --filter @repo/desktop test -- SkillImportManager.test.ts

# 統合テストのみ
pnpm --filter @repo/desktop test -- SkillImportManager.integration.test.ts

# 全テスト
pnpm --filter @repo/desktop test
```

---

## 5. カバレッジ目標

### 5.1 ユニットテスト（既存）

| 指標              | 現在 | 目標 |
| ----------------- | ---- | ---- |
| Line Coverage     | 90%+ | 維持 |
| Branch Coverage   | 70%+ | 維持 |
| Function Coverage | 100% | 維持 |

### 5.2 統合テスト（新規）

| 指標                 | 目標 |
| -------------------- | ---- |
| ストアファイルI/O    | 100% |
| インスタンス間永続化 | 100% |
| エラーリカバリー     | 80%+ |

---

## 6. 完了条件

- [x] 既存テストの構成を分析している
- [x] テスト階層（ユニット/統合）を設計している
- [x] 統合テストケースを設計している
- [x] テストコードテンプレートを作成している
- [x] カバレッジ目標を設定している
