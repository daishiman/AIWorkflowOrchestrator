# TASK-9C 統合テスト設計

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |
| Phase  | 4                                |

---

## 統合テストカテゴリ

| カテゴリ           | 検証内容                                    | テストファイル                  |
| ------------------ | ------------------------------------------- | ------------------------------- |
| IPC接続テスト      | skill:analyze/improve/optimize チャネル疎通 | `skillHandlers.improve.test.ts` |
| データフローテスト | Renderer→IPC→Service→SDK→FS の往復          | `*.flow.test.ts`                |
| エラーハンドリング | SDK/FS障害時のエラー伝播                    | `*.error.test.ts`               |
| バックアップテスト | 改善前バックアップ・復元                    | `*.backup.test.ts`              |

---

## 1. IPC接続テスト

### skill:analyze

```typescript
describe("skill:analyze IPC", () => {
  it("should return SkillAnalysis for valid skill", async () => {
    // Given: 有効なスキルが存在
    // When: skill:analyze を invoke
    // Then: { success: true, data: SkillAnalysis }
  });

  it("should return error for non-existent skill", async () => {
    // Given: スキルが存在しない
    // When: skill:analyze を invoke
    // Then: { success: false, error: 'スキルが見つかりません' }
  });
});
```

### skill:improve

```typescript
describe("skill:improve IPC", () => {
  it("should apply improvements and return result", async () => {
    // Given: 分析済みスキルと改善提案
    // When: skill:improve を invoke
    // Then: { success: true, data: ImprovementResult }
  });

  it("should respect options.autoFix", async () => {
    // Given: autoFix=true
    // When: skill:improve を invoke
    // Then: autoFixable=true の提案のみ適用
  });
});
```

### skill:optimize

```typescript
describe("skill:optimize IPC", () => {
  it("should optimize prompt and return result", async () => {
    // Given: 有効なプロンプト
    // When: skill:optimize を invoke
    // Then: { success: true, data: OptimizationResult }
  });
});
```

---

## 2. データフローテスト

### 分析→改善フロー

```typescript
describe("Analysis to Improvement Flow", () => {
  it("should analyze, improve, and verify skill", async () => {
    // 1. skill:analyze でスキルを分析
    // 2. 分析結果を確認
    // 3. skill:improve で改善を適用
    // 4. 改善結果を確認
    // 5. 改善後のスキルが有効であることを検証
  });
});
```

### エラー時のフロー

```typescript
describe("Error Flow", () => {
  it("should rollback on improvement failure", async () => {
    // 1. skill:analyze でスキルを分析
    // 2. バックアップが作成されることを確認
    // 3. 改善中にエラーを発生させる
    // 4. バックアップから復元されることを確認
  });
});
```

---

## 3. エラーハンドリングテスト

### SDK障害

```typescript
describe("SDK Error Handling", () => {
  it("should handle SDK timeout", async () => {
    // Given: SDKがタイムアウト
    // When: analyze() を呼び出し
    // Then: 適切なエラーメッセージが返される
  });

  it("should handle malformed JSON response", async () => {
    // Given: SDKが不正なJSONを返す
    // When: analyze() を呼び出し
    // Then: ParseError が処理される
  });
});
```

### ファイルシステム障害

```typescript
describe("FileSystem Error Handling", () => {
  it("should handle read permission error", async () => {
    // Given: ファイル読み取り権限なし
    // When: collectFiles() を呼び出し
    // Then: 適切なエラーメッセージが返される
  });

  it("should handle write permission error", async () => {
    // Given: ファイル書き込み権限なし
    // When: applyImprovements() を呼び出し
    // Then: バックアップから復元試行
  });
});
```

---

## 4. バックアップテスト

### バックアップ作成

```typescript
describe("Backup Creation", () => {
  it("should create timestamped backup directory", async () => {
    // When: createBackup() を呼び出し
    // Then: {skillName}.backup.{timestamp} ディレクトリが作成される
  });

  it("should copy all files to backup", async () => {
    // When: createBackup() を呼び出し
    // Then: 全ファイルがバックアップにコピーされる
  });
});
```

### バックアップ復元

```typescript
describe("Backup Restoration", () => {
  it("should restore from latest backup", async () => {
    // Given: バックアップが存在
    // When: restoreFromBackup() を呼び出し
    // Then: 元の状態に復元される
  });

  it("should handle missing backup", async () => {
    // Given: バックアップが存在しない
    // When: restoreFromBackup() を呼び出し
    // Then: 適切なエラーメッセージ
  });
});
```

---

## テストデータ

### テスト用スキル構造

```
test-skill/
├── SKILL.md
├── agents/
│   └── main-agent.md
└── references/
    └── guide.md
```

### テスト用SKILL.md

```markdown
---
name: test-skill
description: テスト用スキル
allowed_tools:
  - Read
  - Write
---

# Test Skill

テスト用のスキルです。
```

---

## 作成日時

- **作成**: 2026-02-03
- **作成者**: AI (Phase 4 自動生成)
