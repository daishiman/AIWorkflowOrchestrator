# Phase 4: テスト作成

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 4                              |
| Phase名   | テスト作成                     |
| 目的      | 失敗するテスト作成（TDD: Red） |
| 前提Phase | Phase 3: 設計レビューゲート    |
| 次Phase   | Phase 5: 実装                  |

---

## 1. 目的

修正要件を満たすテストケースを作成し、現在の実装では失敗することを確認する（TDD: Red Phase）。

---

## 2. 実行タスク

### Task 1: 永続化テストケースの作成

#### 手順

1. `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`を開く（または作成する）

2. 以下のテストケースを追加する：

   ```typescript
   describe("SkillImportManager - Persistence", () => {
     let mockStore: jest.Mocked<ElectronStore>;

     beforeEach(() => {
       mockStore = {
         get: jest.fn(),
         set: jest.fn(),
       } as unknown as jest.Mocked<ElectronStore>;
     });

     it("should persist imported skills to store", async () => {
       // Arrange
       mockStore.get.mockReturnValue([]);
       const manager = new SkillImportManager(mockStore);

       // Act
       await manager.importSkills(["skill-1", "skill-2"]);

       // Assert
       expect(mockStore.set).toHaveBeenCalledWith(
         "importedSkillIds",
         expect.arrayContaining(["skill-1", "skill-2"]),
       );
     });

     it("should restore imported skills from store on initialization", () => {
       // Arrange
       mockStore.get.mockReturnValue(["skill-1", "skill-2"]);

       // Act
       const manager = new SkillImportManager(mockStore);

       // Assert
       expect(manager.getImportedSkillIds()).toEqual(["skill-1", "skill-2"]);
     });

     it("should persist and restore imported skills across instances", async () => {
       // Arrange
       const storedData: string[] = [];
       mockStore.get.mockImplementation(() => [...storedData]);
       mockStore.set.mockImplementation((key, value) => {
         storedData.length = 0;
         storedData.push(...(value as string[]));
       });

       // Act - First instance: import
       const manager1 = new SkillImportManager(mockStore);
       await manager1.importSkills(["skill-1", "skill-2"]);

       // Act - Second instance: should have the imported skills
       const manager2 = new SkillImportManager(mockStore);

       // Assert
       expect(manager2.getImportedSkillIds()).toEqual(["skill-1", "skill-2"]);
     });
   });
   ```

3. テストを実行し、失敗することを確認する：

   ```bash
   pnpm --filter @repo/desktop test SkillImportManager
   ```

#### 成果物

- 永続化テストケース

#### 完了条件

- [ ] テストケースが作成されている
- [ ] テストが失敗することを確認（Red状態）

---

### Task 2: ストア初期化テストケースの作成

#### 手順

1. ストア初期化に関するテストケースを追加する：

   ```typescript
   describe("SkillImportManager - Store Initialization", () => {
     it("should initialize with empty set when store is empty", () => {
       // Arrange
       mockStore.get.mockReturnValue([]);

       // Act
       const manager = new SkillImportManager(mockStore);

       // Assert
       expect(manager.getImportedSkillIds()).toEqual([]);
     });

     it("should handle store read errors gracefully", () => {
       // Arrange
       mockStore.get.mockImplementation(() => {
         throw new Error("Store read error");
       });

       // Act
       const manager = new SkillImportManager(mockStore);

       // Assert
       expect(manager.getImportedSkillIds()).toEqual([]);
     });

     it("should use correct store key", async () => {
       // Arrange
       mockStore.get.mockReturnValue([]);
       const manager = new SkillImportManager(mockStore);

       // Act
       await manager.importSkills(["skill-1"]);

       // Assert
       expect(mockStore.set).toHaveBeenCalledWith(
         "importedSkillIds",
         expect.any(Array),
       );
     });
   });
   ```

2. テストを実行し、失敗することを確認する

#### 成果物

- ストア初期化テストケース

#### 完了条件

- [ ] テストケースが作成されている
- [ ] テストが失敗することを確認（Red状態）

---

### Task 3: テスト実行結果の記録

#### 手順

1. 全テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test SkillImportManager
   ```

2. テスト結果を`outputs/phase-04/test-results.md`に記録する：
   - 実行したテストケース数
   - 失敗したテストケース数
   - 失敗したテストの詳細

#### 成果物

- `outputs/phase-04/test-results.md`

#### 完了条件

- [ ] テスト結果が記録されている
- [ ] 失敗したテストが明確に識別されている

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | スキル管理サービス設計 |

### 前Phaseの成果物

| 成果物       | パス                                  |
| ------------ | ------------------------------------- |
| 設計書       | `outputs/phase-02/design-document.md` |
| レビュー結果 | `outputs/phase-03/review-result.md`   |

---

## 4. 成果物一覧

| 成果物             | 配置先                                            | 形式       |
| ------------------ | ------------------------------------------------- | ---------- |
| テストコード       | `apps/desktop/src/main/services/skill/__tests__/` | TypeScript |
| テスト結果レポート | `outputs/phase-04/test-results.md`                | Markdown   |

---

## 5. 完了条件チェックリスト

- [ ] Task 1: 永続化テストケースが作成されている
- [ ] Task 2: ストア初期化テストケースが作成されている
- [ ] Task 3: テスト結果が記録されている
- [ ] **TDD Red確認**: 新規テストが失敗している

---

## 6. 次Phaseへの引き継ぎ事項

- 作成したテストケース
- 失敗しているテストの一覧
- テスト実行コマンド

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
