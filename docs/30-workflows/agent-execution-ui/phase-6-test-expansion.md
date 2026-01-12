# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 6                  |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- **カバレッジ分析**: テストカバレッジの測定と不足領域の特定
- **統合テスト拡充**: IPC通信・ストリーミング・Permissionの統合テスト追加
- **エッジケーステスト**: 境界値・異常系テストの追加
- **アクセシビリティテスト**: キーボード操作・スクリーンリーダー対応テスト

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容                 |
| ------------------- | --------------------------------------------------------------------------- | -------------------- |
| Agent SDK仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 統合テスト観点       |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | アクセシビリティ観点 |

### 前Phase成果物

| 資料         | パス                                                  | 説明          |
| ------------ | ----------------------------------------------------- | ------------- |
| 実装コード   | `apps/desktop/src/renderer/views/AgentExecutionView/` | Phase 5成果物 |
| テストコード | `apps/desktop/src/renderer/**/*.test.{ts,tsx}`        | Phase 4成果物 |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| IPCチャンネル                | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ       | 検証項目                               | 目標 |
| -------------------- | -------------------------------------- | ---- |
| IPC接続テスト        | agent:start/stop/stream チャンネル疎通 | 100% |
| ストリーミングテスト | Main→Rendererのリアルタイム配信        | 100% |
| Permission連携テスト | Request/Responseフローの検証           | 100% |
| エラーハンドリング   | IPC障害時のUI表示・リトライ            | 80%+ |
| 状態同期テスト       | Zustand状態とUI表示の同期              | 100% |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### ステップ2: ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### ステップ3: 追加テスト作成

**IPC統合テスト**

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.ipc.test.tsx

describe("AgentExecutionView IPC Integration", () => {
  describe("agent:start", () => {
    it("should send start message with skillId and prompt", () => {});
    it("should handle start failure gracefully", () => {});
  });

  describe("agent:stop", () => {
    it("should send stop message with executionId", () => {});
    it("should handle stop failure gracefully", () => {});
  });

  describe("agent:stream", () => {
    it("should receive and display streaming content", () => {});
    it("should handle stream interruption", () => {});
    it("should buffer rapid stream updates", () => {});
  });

  describe("agent:status", () => {
    it("should update status on status message", () => {});
    it("should handle error status", () => {});
  });
});
```

**Permission統合テスト**

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.permission.test.tsx

describe("AgentExecutionView Permission Integration", () => {
  describe("agent:permission", () => {
    it("should show dialog on permission request", () => {});
    it("should handle multiple permission requests", () => {});
  });

  describe("agent:permission:res", () => {
    it("should send approve response", () => {});
    it("should send deny response", () => {});
    it("should include rememberChoice flag", () => {});
  });

  describe("remembered choices", () => {
    it("should skip dialog for remembered approve", () => {});
    it("should skip dialog for remembered deny", () => {});
    it("should clear remembered choices on reset", () => {});
  });
});
```

**エラーハンドリングテスト**

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.error.test.tsx

describe("AgentExecutionView Error Handling", () => {
  describe("IPC errors", () => {
    it("should display error on IPC failure", () => {});
    it("should allow retry after error", () => {});
    it("should log errors for debugging", () => {});
  });

  describe("stream errors", () => {
    it("should display error message in chat", () => {});
    it("should update status to error", () => {});
  });

  describe("permission errors", () => {
    it("should handle permission timeout", () => {});
    it("should display error on permission failure", () => {});
  });
});
```

**アクセシビリティテスト**

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.a11y.test.tsx

describe("AgentExecutionView Accessibility", () => {
  describe("keyboard navigation", () => {
    it("should focus input on page load", () => {});
    it("should navigate with Tab key", () => {});
    it("should submit with Enter key", () => {});
    it("should cancel with Escape key", () => {});
  });

  describe("screen reader", () => {
    it("should announce new messages", () => {});
    it("should announce status changes", () => {});
    it("should have proper ARIA labels", () => {});
  });

  describe("focus management", () => {
    it("should trap focus in permission dialog", () => {});
    it("should return focus after dialog closes", () => {});
  });
});
```

### ステップ4: テスト再実行

```bash
pnpm --filter @repo/desktop test:coverage
pnpm --filter @repo/desktop test:integration
```

## 成果物

| 成果物             | パス                                           | 説明               |
| ------------------ | ---------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`           | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`          | 統合テスト実行結果 |
| 追加テストファイル | `apps/desktop/src/renderer/**/*.test.{ts,tsx}` | 追加テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 100%, シナリオ 100%/80%）
- [ ] IPC統合テストの追加が完了している
- [ ] Permission統合テストの追加が完了している
- [ ] エラーハンドリングテストの追加が完了している
- [ ] アクセシビリティテストの追加が完了している
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 5成果物）
2. カバレッジ測定の実行
3. ギャップ分析の実施
4. IPC統合テストの追加
5. Permission統合テストの追加
6. エラーハンドリングテストの追加
7. アクセシビリティテストの追加
8. カバレッジ再測定
9. カバレッジレポートの作成
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-execution-ui --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
