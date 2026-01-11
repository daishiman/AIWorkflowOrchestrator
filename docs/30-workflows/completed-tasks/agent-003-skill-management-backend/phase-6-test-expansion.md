# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 6                      |
| Phase名    | テスト拡充             |
| 前提Phase  | Phase 5                |
| 後続Phase  | Phase 7                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

Phase 5の実装完了後、テストカバレッジを目標値まで引き上げる。ユニットテスト・統合テストを拡充し、品質を確保する。

## 背景

実装が完了しテストがGreen状態になった。リファクタリングに進む前に、テストカバレッジを目標値まで引き上げ、リファクタリング時の品質を担保する。

---

## テストカバレッジ目標

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テスト

| 指標                            | 目標 |
| ------------------------------- | ---- |
| IPCエンドポイント               | 100% |
| モジュール間インターフェース    | 100% |
| 正常系シナリオ                  | 100% |
| 異常系シナリオ                  | 80%+ |
| 外部連携ポイント（ファイルI/O） | 100% |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測・分析

**目的**: 現在のカバレッジを計測し、不足箇所を特定する

**実行手順**:

1. カバレッジを計測する:

```bash
pnpm --filter @repo/desktop test:coverage
```

2. カバレッジレポートを確認し、不足箇所を特定する:

```markdown
## カバレッジ分析結果

### 現在のカバレッジ

| 指標              | 現在値 | 目標値 | 差分 |
| ----------------- | ------ | ------ | ---- |
| Line Coverage     | XX%    | 80%    | -XX% |
| Branch Coverage   | XX%    | 60%    | -XX% |
| Function Coverage | XX%    | 80%    | -XX% |

### カバレッジ不足箇所

| ファイル        | 未カバー行 | 未カバー分岐 |
| --------------- | ---------- | ------------ |
| SkillScanner.ts | L10-15     | if分岐 L20   |
| ...             | ...        | ...          |
```

**期待される成果物**:

- `outputs/phase-6/coverage-analysis.md`

---

### タスク2: ユニットテスト拡充（SkillScanner）

**目的**: SkillScannerのテストカバレッジを向上させる

**実行手順**:

1. 不足テストケースを追加する:

```typescript
// 追加テストケース例
describe("SkillScanner - edge cases", () => {
  it("should handle directories with special characters", async () => {});
  it("should handle very long directory names", async () => {});
  it("should handle permission denied errors", async () => {});
  it("should handle symbolic links correctly", async () => {});
  it("should handle concurrent scan requests", async () => {});
});
```

2. 各分岐のテストを追加する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`（拡充）

---

### タスク3: ユニットテスト拡充（SkillParser）

**目的**: SkillParserのテストカバレッジを向上させる

**実行手順**:

1. 不足テストケースを追加する:

```typescript
// 追加テストケース例
describe("SkillParser - edge cases", () => {
  it("should handle empty SKILL.md file", async () => {});
  it("should handle SKILL.md without frontmatter", async () => {});
  it("should handle malformed YAML frontmatter", async () => {});
  it("should handle very large SKILL.md files", async () => {});
  it("should handle Unicode characters in description", async () => {});
  it("should handle nested anchors format", async () => {});
  it("should handle multiple trigger formats", async () => {});
});
```

2. 各解析パターンのテストを追加する

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillParser.test.ts`（拡充）

---

### タスク4: ユニットテスト拡充（SkillImportManager）

**目的**: SkillImportManagerのテストカバレッジを向上させる

**実行手順**:

1. 不足テストケースを追加する:

```typescript
// 追加テストケース例
describe("SkillImportManager - edge cases", () => {
  it("should handle store read errors", async () => {});
  it("should handle store write errors", async () => {});
  it("should handle empty skill id array", async () => {});
  it("should handle very large number of imports", async () => {});
  it("should handle concurrent import/remove operations", async () => {});
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`（拡充）

---

### タスク5: ユニットテスト拡充（SkillService）

**目的**: SkillServiceのテストカバレッジを向上させる

**実行手順**:

1. 不足テストケースを追加する:

```typescript
// 追加テストケース例
describe("SkillService - edge cases", () => {
  it("should handle scanner errors gracefully", async () => {});
  it("should handle parser errors gracefully", async () => {});
  it("should handle partial scan failures", async () => {});
  it("should maintain cache consistency", async () => {});
  it("should handle race conditions in concurrent calls", async () => {});
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`（拡充）

---

### タスク6: 統合テスト拡充

**目的**: IPC統合テストを拡充する

**実行手順**:

1. 全統合テストシナリオを実装する:

```typescript
// apps/desktop/src/main/services/skill/__tests__/integration.test.ts
describe("Skill Management Integration - Full", () => {
  describe("IPC Connection Tests", () => {
    it("should handle agent:scan-available-skills with real file system", async () => {});
    it("should handle agent:get-imported-skills with persisted data", async () => {});
    it("should handle agent:import-skills and persist", async () => {});
    it("should handle agent:remove-skill and persist", async () => {});
    it("should handle agent:get-skill-detail for existing skill", async () => {});
    it("should handle agent:get-skill-detail for non-existent skill", async () => {});
  });

  describe("Data Flow Tests", () => {
    it("should complete full import workflow", async () => {
      // scan → import → get-imported → verify
    });
    it("should complete full remove workflow", async () => {
      // import → remove → get-imported → verify removed
    });
    it("should persist imports across service restart", async () => {
      // import → restart service → get-imported → verify persisted
    });
  });

  describe("Error Handling Tests", () => {
    it("should return proper error for invalid base path", async () => {});
    it("should return proper error for malformed SKILL.md", async () => {});
    it("should return proper error for invalid skill id format", async () => {});
  });

  describe("State Synchronization Tests", () => {
    it("should reflect new skills after re-scan", async () => {});
    it("should maintain import state after cache clear", async () => {});
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/integration.test.ts`（拡充）

---

### タスク7: カバレッジ再計測・確認

**目的**: カバレッジ目標達成を確認する

**実行手順**:

1. カバレッジを再計測する:

```bash
pnpm --filter @repo/desktop test:coverage
```

2. 目標達成を確認する:

```markdown
## カバレッジ最終結果

### 達成状況

| 指標              | 最終値 | 目標値 | 達成 |
| ----------------- | ------ | ------ | ---- |
| Line Coverage     | XX%    | 80%    | ✓/✗  |
| Branch Coverage   | XX%    | 60%    | ✓/✗  |
| Function Coverage | XX%    | 80%    | ✓/✗  |

### 結合テストカバレッジ

| 指標              | 最終値 | 目標値 | 達成 |
| ----------------- | ------ | ------ | ---- |
| IPCエンドポイント | XX%    | 100%   | ✓/✗  |
| 正常系シナリオ    | XX%    | 100%   | ✓/✗  |
| 異常系シナリオ    | XX%    | 80%    | ✓/✗  |
```

3. 未達の場合は追加テストを作成する

**期待される成果物**:

- `outputs/phase-6/coverage-final.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容           |
| ---------------------- | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | テストパターン |

---

## 成果物

| 成果物                   | パス                                                                        | 内容               |
| ------------------------ | --------------------------------------------------------------------------- | ------------------ |
| カバレッジ分析           | `outputs/phase-6/coverage-analysis.md`                                      | 初期カバレッジ分析 |
| SkillScannerテスト       | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       | 拡充版             |
| SkillParserテスト        | `apps/desktop/src/main/services/skill/__tests__/SkillParser.test.ts`        | 拡充版             |
| SkillImportManagerテスト | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | 拡充版             |
| SkillServiceテスト       | `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`       | 拡充版             |
| 統合テスト               | `apps/desktop/src/main/services/skill/__tests__/integration.test.ts`        | 拡充版             |
| カバレッジ最終結果       | `outputs/phase-6/coverage-final.md`                                         | 最終カバレッジ     |

---

## 統合テスト連携

**Phase 6での必須アクション**: IPC統合テストの拡充（全カテゴリのカバレッジ向上）

- [ ] IPC接続テストを実装完了
- [ ] データフローテストを実装完了
- [ ] エラーハンドリングテストを実装完了
- [ ] 状態同期テストを実装完了

---

## 完了条件

- [ ] ユニットテストカバレッジが Line 80%+ を達成
- [ ] ユニットテストカバレッジが Branch 60%+ を達成
- [ ] ユニットテストカバレッジが Function 80%+ を達成
- [ ] 統合テストの追加が完了している
- [ ] IPC統合テストが全カテゴリで実装されている
- [ ] カバレッジレポートが出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-003-skill-management-backend/phase-7-coverage-check.md`
