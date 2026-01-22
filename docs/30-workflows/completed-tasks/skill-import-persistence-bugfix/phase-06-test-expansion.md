# Phase 6: テスト拡充

## メタ情報

| 項目      | 内容                             |
| --------- | -------------------------------- |
| Phase     | 6                                |
| Phase名   | テスト拡充                       |
| 目的      | カバレッジ向上のための追加テスト |
| 前提Phase | Phase 5: 実装                    |
| 次Phase   | Phase 7: テストカバレッジ確認    |

---

## 1. 目的

修正されたコードに対して、追加のテストケースを作成し、テストカバレッジを向上させる。

---

## 2. 実行タスク

### Task 1: エッジケーステストの追加

#### 手順

1. `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`に以下のテストケースを追加する：

   ```typescript
   describe("SkillImportManager - Edge Cases", () => {
     it("should handle empty skill array import", async () => {
       // Arrange
       mockStore.get.mockReturnValue([]);
       const manager = new SkillImportManager(mockStore);

       // Act
       await manager.importSkills([]);

       // Assert
       expect(mockStore.set).not.toHaveBeenCalled();
     });

     it("should handle duplicate skill imports", async () => {
       // Arrange
       mockStore.get.mockReturnValue(["skill-1"]);
       const manager = new SkillImportManager(mockStore);

       // Act
       await manager.importSkills(["skill-1", "skill-2"]);

       // Assert
       expect(manager.getImportedSkillIds()).toContain("skill-1");
       expect(manager.getImportedSkillIds()).toContain("skill-2");
       // skill-1 should not be duplicated
       const ids = manager.getImportedSkillIds();
       expect(ids.filter((id) => id === "skill-1").length).toBe(1);
     });

     it("should handle special characters in skill IDs", async () => {
       // Arrange
       mockStore.get.mockReturnValue([]);
       const manager = new SkillImportManager(mockStore);

       // Act
       await manager.importSkills(["skill/with/slash", "skill-with-dash"]);

       // Assert
       expect(manager.getImportedSkillIds()).toContain("skill/with/slash");
       expect(manager.getImportedSkillIds()).toContain("skill-with-dash");
     });
   });
   ```

2. テストを実行して全てパスすることを確認する

#### 成果物

- エッジケーステストコード

#### 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 全テストがパス

---

### Task 2: 削除機能のテスト追加

#### 手順

1. 削除機能に関するテストケースを追加する：

   ```typescript
   describe("SkillImportManager - Remove", () => {
     it("should remove skill and persist", async () => {
       // Arrange
       mockStore.get.mockReturnValue(["skill-1", "skill-2"]);
       const manager = new SkillImportManager(mockStore);

       // Act
       await manager.removeSkill("skill-1");

       // Assert
       expect(manager.getImportedSkillIds()).not.toContain("skill-1");
       expect(mockStore.set).toHaveBeenCalledWith("importedSkillIds", [
         "skill-2",
       ]);
     });

     it("should handle removing non-existent skill gracefully", async () => {
       // Arrange
       mockStore.get.mockReturnValue(["skill-1"]);
       const manager = new SkillImportManager(mockStore);

       // Act
       await manager.removeSkill("non-existent");

       // Assert
       expect(manager.getImportedSkillIds()).toEqual(["skill-1"]);
     });

     it("should persist empty array when last skill is removed", async () => {
       // Arrange
       mockStore.get.mockReturnValue(["skill-1"]);
       const manager = new SkillImportManager(mockStore);

       // Act
       await manager.removeSkill("skill-1");

       // Assert
       expect(manager.getImportedSkillIds()).toEqual([]);
       expect(mockStore.set).toHaveBeenCalledWith("importedSkillIds", []);
     });
   });
   ```

2. テストを実行して全てパスすることを確認する

#### 成果物

- 削除機能テストコード

#### 完了条件

- [ ] 削除機能テストが追加されている
- [ ] 全テストがパス

---

### Task 3: ストアエラーハンドリングテストの追加

#### 手順

1. ストアエラーに関するテストケースを追加する：

   ```typescript
   describe("SkillImportManager - Store Error Handling", () => {
     it("should handle store.set errors gracefully", async () => {
       // Arrange
       mockStore.get.mockReturnValue([]);
       mockStore.set.mockImplementation(() => {
         throw new Error("Store write error");
       });
       const manager = new SkillImportManager(mockStore);

       // Act & Assert - should not throw
       await expect(manager.importSkills(["skill-1"])).resolves.not.toThrow();
     });

     it("should handle corrupted store data", () => {
       // Arrange
       mockStore.get.mockReturnValue("invalid-data");

       // Act & Assert - should not throw
       expect(() => new SkillImportManager(mockStore)).not.toThrow();
     });

     it("should handle null store value", () => {
       // Arrange
       mockStore.get.mockReturnValue(null);

       // Act
       const manager = new SkillImportManager(mockStore);

       // Assert
       expect(manager.getImportedSkillIds()).toEqual([]);
     });
   });
   ```

2. テストを実行して全てパスすることを確認する

#### 成果物

- エラーハンドリングテストコード

#### 完了条件

- [ ] エラーハンドリングテストが追加されている
- [ ] 全テストがパス

---

## 3. 参照資料

### 前Phaseの成果物

| 成果物       | パス                                              |
| ------------ | ------------------------------------------------- |
| 修正コード   | `apps/desktop/src/main/services/skill/`           |
| テストコード | `apps/desktop/src/main/services/skill/__tests__/` |

---

## 4. 成果物一覧

| 成果物           | 配置先                                            | 形式       |
| ---------------- | ------------------------------------------------- | ---------- |
| 追加テストコード | `apps/desktop/src/main/services/skill/__tests__/` | TypeScript |

---

## 5. 完了条件チェックリスト

- [ ] Task 1: エッジケーステストが追加されている
- [ ] Task 2: 削除機能テストが追加されている
- [ ] Task 3: エラーハンドリングテストが追加されている
- [ ] 全テストがパス

---

## 6. 次Phaseへの引き継ぎ事項

- 追加されたテストケース
- テスト実行結果

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
