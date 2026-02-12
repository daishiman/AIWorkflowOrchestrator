# テスト設計書

## タスク情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| Phase    | 4                                     |
| 作成日   | 2026-02-11                            |
| 状態     | 完了                                  |

## テスト対象

### 対象メソッド

| メソッド名                      | クラス       | 責務                             |
| ------------------------------- | ------------ | -------------------------------- |
| `setSkillExecutor()`            | SkillService | SkillExecutor を Setter 注入する |
| `executeSkill(skillId, params)` | SkillService | SkillExecutor に実行を委譲する   |

### テスト範囲

```
SkillService.executeSkill()
  ├── 1. SkillExecutor 初期化確認
  ├── 2. スキル存在確認（getSkillById）
  ├── 3. インポート状態確認（isImported）
  ├── 4. 型変換（Skill → SkillMetadata）
  └── 5. SkillExecutor.execute() への委譲
```

## モック設計

### mockSkillExecutor

```typescript
interface MockSkillExecutor {
  execute: vi.Mock<
    [SkillExecutionRequest, SkillMetadata],
    Promise<SkillExecutionResponse>
  >;
}

const mockSkillExecutor: MockSkillExecutor = {
  execute: vi.fn(),
};
```

### 使用パターン

```typescript
// 正常系: 成功レスポンスを返す
mockSkillExecutor.execute.mockResolvedValue({
  executionId: "test-execution-id",
  success: true,
});

// 異常系: エラーをスローする
mockSkillExecutor.execute.mockRejectedValue(new Error("SDK Error"));
```

### mockSkillImportManager

```typescript
const mockSkillImportManager = {
  isImported: vi.fn(),
  getImportedSkillIds: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
};
```

### mockSkillScanner / mockSkillParser

```typescript
const mockSkillScanner = {
  scanDirectory: vi.fn(),
  getBasePath: vi.fn(),
};

const mockSkillParser = {
  parse: vi.fn(),
};
```

## テストファイル構成

| ファイル                     | テスト範囲                       |
| ---------------------------- | -------------------------------- |
| `SkillService.test.ts`       | 委譲ロジック、初期化状態、型変換 |
| `SkillService.error.test.ts` | エラー伝播、例外処理             |

## テストデータ

### テスト用スキル

```typescript
const testSkill: Skill = {
  id: "test-skill-id",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill for unit testing",
  path: "/path/to/test-skill",
  triggers: ["@test"],
  anchors: [
    {
      source: "test-source",
      application: "test-app",
      purpose: "testing",
    },
  ],
  allowedTools: ["Read", "Write", "Bash"],
  category: "testing",
  lastModified: new Date("2026-01-01"),
};
```

### 期待される SkillMetadata

```typescript
const expectedMetadata: SkillMetadata = {
  id: "test-skill-id",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill for unit testing",
  path: "/path/to/test-skill",
  triggers: ["@test"],
  anchors: [
    {
      source: "test-source",
      application: "test-app",
      purpose: "testing",
    },
  ],
  allowedTools: ["Read", "Write", "Bash"],
  category: "testing",
};
```

## P35 対応（既知の落とし穴）

### DI 追加時のテストモック大規模修正

`SkillService` に `SkillExecutor` を DI で追加したため、既存のテストファイルにも `mockSkillExecutor` を追加する必要がある。

**対応内容**:

1. 各テストファイルに `mockSkillExecutor` を定義
2. `beforeEach` で `mockSkillExecutor.execute.mockReset()` を実行
3. `SkillService` インスタンス生成後に `setSkillExecutor()` を呼び出す

**テンプレート**:

```typescript
describe("SkillService", () => {
  let skillService: SkillService;
  let mockSkillExecutor: { execute: vi.Mock };

  beforeEach(() => {
    mockSkillExecutor = {
      execute: vi.fn(),
    };

    skillService = new SkillService(
      mockSkillScanner,
      mockSkillParser,
      mockSkillImportManager,
    );
    skillService.setSkillExecutor(
      mockSkillExecutor as unknown as SkillExecutor,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
});
```

## カバレッジ目標

### 最低基準（プロジェクト品質基準: 02-code-quality.md 準拠）

| 指標              | 最低基準 | 根拠                           |
| ----------------- | -------- | ------------------------------ |
| Line Coverage     | 80%      | プロジェクト品質基準の最低要件 |
| Branch Coverage   | 60%      | プロジェクト品質基準の最低要件 |
| Function Coverage | 80%      | プロジェクト品質基準の最低要件 |

### 目標値（推奨基準）

| 指標              | 目標値 | 根拠                                     |
| ----------------- | ------ | ---------------------------------------- |
| Line Coverage     | 90%    | 新規メソッドは全行テスト                 |
| Branch Coverage   | 70%    | 全分岐（初期化、存在、インポート）テスト |
| Function Coverage | 90%    | setSkillExecutor, executeSkill           |

## テスト実行コマンド

```bash
# 対象テストのみ実行
pnpm test -- --grep "SkillService.executeSkill"

# カバレッジ付き実行
pnpm test -- --coverage --grep "SkillService"
```
