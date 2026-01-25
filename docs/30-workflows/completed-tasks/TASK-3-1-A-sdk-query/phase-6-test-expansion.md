# Phase 6: テスト拡充 - TASK-3-1-A SDK query() 基本実装

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| Phase名    | テスト拡充               |
| 前提Phase  | Phase 5 (実装)           |
| 後続Phase  | Phase 7 (カバレッジ確認) |
| ステータス | 未実施                   |
| 作成日     | 2026-01-24               |
| 機能名     | TASK-3-1-A-sdk-query     |

---

## 目的

Phase 5 の実装に対してテストを拡充し、カバレッジ目標を達成する。
エッジケース、エラーケース、境界値テストを追加する。

## 背景

基本実装のテストカバレッジを向上させ、品質を確保する。
統合テストも拡充し、SDK連携・IPC連携の信頼性を高める。

---

## 実行タスク

### タスク1: カバレッジ分析

**目的**: 現在のテストカバレッジを測定し、不足領域を特定

**実行手順**:

1. カバレッジレポートを生成
2. 未カバーの行/分岐/関数を特定
3. 追加テストの優先順位を決定

**コマンド**:

```bash
pnpm --filter @repo/desktop test:coverage
```

### タスク2: エッジケーステスト追加

**目的**: 境界値・異常系のテストを追加

**追加テストケース**:

```typescript
describe("SkillExecutor - Edge Cases", () => {
  describe("execute", () => {
    it("should handle empty prompt");
    it("should handle very long prompt");
    it("should handle special characters in prompt");
    it("should handle null skill metadata fields");
  });

  describe("stream handling", () => {
    it("should handle empty stream");
    it("should handle stream with only errors");
    it("should handle rapid message bursts");
    it("should handle malformed messages gracefully");
  });

  describe("abort", () => {
    it("should handle abort before stream starts");
    it("should handle multiple abort calls");
    it("should handle abort after completion");
  });
});
```

### タスク3: エラーハンドリングテスト追加

**目的**: エラーケースの網羅的テスト

**追加テストケース**:

```typescript
describe("SkillExecutor - Error Handling", () => {
  it("should handle SDK initialization error");
  it("should handle network timeout");
  it("should handle authentication error");
  it("should handle rate limit error");
  it("should handle invalid response format");
  it("should clean up resources on error");
});
```

### タスク4: 統合テスト拡充

**目的**: SDK連携・IPC連携の統合テストを拡充

**追加テストケース**:

```typescript
describe("SkillExecutor - Integration", () => {
  it("should send messages to correct IPC channel");
  it("should maintain message order");
  it("should handle IPC send failure");
  it("should properly serialize message content");
});
```

---

## 参照資料

| 参照資料     | パス                                                    | 内容          |
| ------------ | ------------------------------------------------------- | ------------- |
| 実装コード   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | Phase 5成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                 | Phase 4成果物 |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 現在値 |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | -      |
| Branch Coverage   | 60%      | 70%      | -      |
| Function Coverage | 80%      | 90%      | -      |

---

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ       | 検証項目                                     | 目標 |
| -------------------- | -------------------------------------------- | ---- |
| SDK連携テスト        | query() 呼び出し・stream() 処理              | 100% |
| ストリーミングテスト | メッセージ変換・IPC配信                      | 100% |
| エラーハンドリング   | SDK エラー・タイムアウト・ネットワークエラー | 80%+ |
| 中断処理テスト       | AbortController 連携・リソースクリーンアップ | 100% |

---

## 成果物

| 成果物             | パス                                                       | 内容               |
| ------------------ | ---------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                       | カバレッジ分析結果 |
| 追加テスト一覧     | `outputs/phase-6/additional-tests.md`                      | 追加テストケース   |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/*.test.ts` | 追加テストコード   |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] エッジケーステストが追加されている
- [ ] エラーハンドリングテストが追加されている
- [ ] 統合テストが拡充されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-1-A-sdk-query/phase-7-coverage-check.md`
