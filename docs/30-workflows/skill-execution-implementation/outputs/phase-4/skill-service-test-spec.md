# SkillService.executeSkill テスト仕様書

## Phase 4 - タスク3: SkillService.executeSkill のテスト

### 作成日

2026-01-18

---

## テストファイル

**パス**: `apps/desktop/src/main/services/skill/__tests__/SkillService.execute.test.ts`

---

## テストケース一覧

| TC-ID    | テストケース                   | 期待結果                       | カテゴリ |
| -------- | ------------------------------ | ------------------------------ | -------- |
| TC-4-008 | スキルを実行して成功結果を返す | success: true, data.status定義 | 正常系   |
| TC-4-009 | 存在しないスキルでエラーを返す | success: false, error定義      | 異常系   |

---

## 詳細仕様

### TC-4-008: スキルを実行して成功結果を返す

**目的**: SkillService.executeSkill がスキルを実行し、SkillExecutionResult を返すことを確認

**前提条件**:

- スキルがスキャン済みでキャッシュに存在
- スキルがインポート済み

**テスト内容**:

```typescript
// Given: スキルがスキャン済み＆インポート済み
await service.scanAvailableSkills();
mockImportManager.isImported.mockReturnValue(true);

// When: executeSkillを呼び出す
const result = await service.executeSkill("skill-id-1");

// Then: 成功結果が返される
expect(result).toBeDefined();
expect(result.executionId).toBeDefined();
expect(result.status).toBe("success");
expect(result.startedAt).toBeInstanceOf(Date);
expect(result.completedAt).toBeInstanceOf(Date);
```

**追加テスト項目**:

| テスト内容                     | 期待結果           |
| ------------------------------ | ------------------ |
| executionIdがユニーク          | 2回実行で異なるID  |
| startedAt <= completedAt       | 時系列が正しい     |
| paramsオプション対応           | params渡しても成功 |
| outputが含まれる（オプション） | string型           |

---

### TC-4-009: 存在しないスキルでエラーを返す

**目的**: 存在しないスキルIDに対してエラーをスローすることを確認

**テスト内容**:

```typescript
// Given: スキルがスキャン済み
await service.scanAvailableSkills();

// When & Then: 存在しないスキルIDでエラーがスローされる
await expect(service.executeSkill("nonexistent-id")).rejects.toThrow(
  "スキルが見つかりません",
);
```

**追加テスト項目**:

| テスト内容         | 期待結果                           |
| ------------------ | ---------------------------------- |
| 空のスキルID       | エラーをスロー                     |
| 未インポートスキル | "スキルがインポートされていません" |

---

## サービス実装パターン

```typescript
class SkillService {
  async executeSkill(
    skillId: string,
    params?: Record<string, unknown>,
  ): Promise<SkillExecutionResult> {
    // 1. スキルの存在確認
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error("スキルが見つかりません");
    }

    // 2. インポート状態確認
    if (!this.importManager.isImported(skillId)) {
      throw new Error("スキルがインポートされていません");
    }

    // 3. 実行開始
    const executionId = randomUUID();
    const startedAt = new Date();

    try {
      // 4. 実行ロジック（初期実装は成功を返す）
      const output = `Skill ${skill.name} executed successfully`;

      // 5. 結果返却
      return {
        executionId,
        status: "success",
        output,
        startedAt,
        completedAt: new Date(),
      };
    } catch (error) {
      return {
        executionId,
        status: "failed",
        error: error instanceof Error ? error.message : "実行に失敗しました",
        startedAt,
        completedAt: new Date(),
      };
    }
  }
}
```

---

## 型定義

```typescript
interface SkillExecutionResult {
  executionId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}
```

---

## 依存関係

| 依存                     | 用途               |
| ------------------------ | ------------------ |
| getSkillById             | スキルの存在確認   |
| importManager.isImported | インポート状態確認 |
| randomUUID               | executionId生成    |

---

## キャッシュ動作

| シナリオ                   | 動作                             |
| -------------------------- | -------------------------------- |
| キャッシュ空の状態で実行   | 自動スキャン実行                 |
| キャッシュ済みの状態で実行 | キャッシュ使用（再スキャンなし） |

---

## 完了確認

- [x] TC-4-008 テストケース作成
- [x] TC-4-009 テストケース作成
- [x] テストファイル作成完了
