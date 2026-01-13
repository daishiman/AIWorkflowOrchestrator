# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 6                       |
| 機能名 | claude-code-integration |
| 作成日 | 2026-01-12              |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- 統合テスト拡充: IPC通信・SDK連携・Permission連携のテスト追加
- エッジケーステスト: 境界値・異常系テストの追加

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容       |
| -------- | --------------------------------------------------------------------------- | ---------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト基準 |

### Phase 4-5成果物

| 資料名             | パス                                         | 説明          |
| ------------------ | -------------------------------------------- | ------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | Phase 4成果物 |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | Phase 4成果物 |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### 2. ギャップ分析

以下の領域でカバレッジが不足している可能性が高い:

- HooksFactory: 複数危険コマンドパターンの検出
- AgentExecutor: ストリーミング中断時の処理
- ExecutionManager: 同時実行時の競合処理
- agentHandlers: 入力バリデーションエラー処理

### 3. 追加テスト作成

#### 3.1 HooksFactory追加テスト

```typescript
// 追加テストケース
describe("HooksFactory - Edge Cases", () => {
  it("should block dd if= command", async () => {});
  it("should block multiple dangerous patterns in one command", async () => {});
  it("should handle null/undefined command gracefully", async () => {});
  it("should handle empty command string", async () => {});
});
```

#### 3.2 AgentExecutor追加テスト

```typescript
// 追加テストケース
describe("AgentExecutor - Edge Cases", () => {
  it("should handle stream interruption", async () => {});
  it("should handle SDK timeout", async () => {});
  it("should handle invalid response from SDK", async () => {});
  it("should clean up resources on error", async () => {});
});
```

#### 3.3 ExecutionManager追加テスト

```typescript
// 追加テストケース
describe("ExecutionManager - Edge Cases", () => {
  it("should handle concurrent start requests", async () => {});
  it("should handle stop during startup", async () => {});
  it("should handle double stop", async () => {});
  it("should remove execution from map after completion", async () => {});
});
```

#### 3.4 統合テスト

```typescript
// apps/desktop/src/main/services/agent/__tests__/integration.test.ts
describe("Agent SDK Integration", () => {
  describe("IPC Communication", () => {
    it("should handle full execution flow", async () => {
      // Renderer → Main → SDK → Main → Renderer
    });

    it("should handle permission request flow", async () => {
      // agent:permission → Dialog → agent:permission:res
    });

    it("should handle cancellation flow", async () => {
      // agent:stop → AbortController → cancelled status
    });
  });

  describe("Error Handling", () => {
    it("should propagate SDK errors to Renderer", async () => {});
    it("should handle IPC communication failure", async () => {});
    it("should handle timeout scenarios", async () => {});
  });

  describe("Concurrent Executions", () => {
    it("should handle multiple simultaneous executions", async () => {});
    it("should isolate execution contexts", async () => {});
  });
});
```

### 4. 統合テスト実行

```bash
pnpm --filter @repo/desktop test:integration
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                                      | 目標 |
| ------------------ | --------------------------------------------- | ---- |
| IPC接続テスト      | agent:start/stop/stream/status/permission疎通 | 100% |
| データフローテスト | Renderer→Main→SDK→Main→Rendererの往復         | 100% |
| エラーハンドリング | SDK障害時のエラー伝播・Renderer表示           | 80%+ |
| Permission連携     | agent:permission→Dialog→agent:permission:res  | 100% |
| キャンセル処理     | AbortSignal伝播・キャンセル通知               | 100% |

## 成果物

| 成果物             | パス                                               | 説明               |
| ------------------ | -------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`               | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`              | 統合テスト実行結果 |
| 追加テストファイル | `apps/desktop/src/main/services/agent/__tests__/*` | 追加テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストの追加が完了している
- [ ] エッジケーステストが追加されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
