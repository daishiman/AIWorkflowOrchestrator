# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 6                           |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

型統合後のテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

### Task 1: 型ガード関数テストの拡充

```typescript
describe("SkillStreamMessage Type Guards - Extended", () => {
  describe("Edge Cases", () => {
    it("should handle null content gracefully", () => {
      // 型ガードがnullを正しく処理
    });

    it("should handle undefined properties", () => {
      // undefinedプロパティの処理
    });
  });

  describe("Type Narrowing", () => {
    it("should narrow type correctly after guard check", () => {
      // TypeScriptの型絞り込みが正しく動作
    });
  });
});
```

### Task 2: IPC型整合性テストの追加

```typescript
describe("IPC Type Consistency", () => {
  it("should serialize SkillStreamMessage correctly", () => {
    // IPC通信でのシリアライズ/デシリアライズ
  });

  it("should maintain type consistency across processes", () => {
    // Main-Renderer間での型一貫性
  });
});
```

### Task 3: ランタイム型検証テストの追加

```typescript
describe("Runtime Type Validation", () => {
  it("should validate SkillStreamMessage at runtime", () => {
    // ランタイムでの型検証
  });

  it("should throw appropriate error for invalid type", () => {
    // 不正な型に対するエラー処理
  });
});
```

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 現在 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | TBD  |
| Branch Coverage   | 60%      | 70%      | TBD  |
| Function Coverage | 80%      | 90%      | TBD  |

## 統合テスト連携【必須】

統合テストの拡充:

| テストカテゴリ      | 検証項目                                | 目標 |
| ------------------- | --------------------------------------- | ---- |
| IPC型整合性テスト   | Main-Renderer間のSkillStreamMessage伝播 | 100% |
| Store型整合性テスト | skillSliceでの型使用                    | 100% |
| 型インポートテスト  | 正しいモジュールからのインポート        | 100% |
| エッジケーステスト  | null/undefined/不正値の処理             | 80%+ |

## 成果物

| 成果物             | パス                                       | 説明               |
| ------------------ | ------------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`       | カバレッジ分析結果 |
| 追加テストファイル | `packages/shared/src/types/__tests__/*.ts` | 追加テストコード   |

## 完了条件

- [ ] 型ガードテストが拡充されている
- [ ] IPC型整合性テストが追加されている
- [ ] ランタイム型検証テストが追加されている
- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 全テストがPASS
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
