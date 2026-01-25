# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| Phase名    | テスト拡充                             |
| 前提Phase  | Phase 5（実装）                        |
| 後続Phase  | Phase 7（テストカバレッジ確認）        |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | TASK-3-2-skillexecutor-ipc-integration |

---

## 目的

Phase 5の実装に対して、エッジケース・異常系・境界値テストを追加し、テストカバレッジを向上させる。

## 背景

Phase 4〜5ではTDDの基本サイクル（Red→Green）を完了した。本Phaseでは、実装の品質を高めるために追加のテストを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: エッジケーステスト追加（Preload API）

**目的**: skillAPIのエッジケースをテストする

**実行手順**:

1. テストファイルを更新する
   - パス: `apps/desktop/src/preload/__tests__/skill-api.test.ts`

2. エッジケーステストを追加する

   ```typescript
   describe("skillAPI.onStream - edge cases", () => {
     it("should handle rapid consecutive messages");
     it("should handle empty message content");
     it("should handle very long message content");
     it("should handle special characters in message");
     it("should handle concurrent subscriptions from multiple components");
   });

   describe("skillAPI.abort - edge cases", () => {
     it("should handle abort on already completed execution");
     it("should handle abort on already aborted execution");
     it("should handle abort with invalid executionId format");
     it("should handle abort when IPC fails");
   });

   describe("skillAPI - error handling", () => {
     it("should handle IPC timeout");
     it("should handle IPC connection failure");
     it("should handle malformed message data");
   });
   ```

**期待される成果物**:

- `apps/desktop/src/preload/__tests__/skill-api.test.ts`（追加テスト）

---

### タスク2: エッジケーステスト追加（React Hook）

**目的**: useSkillExecutionのエッジケースをテストする

**実行手順**:

1. テストファイルを更新する
   - パス: `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`

2. エッジケーステストを追加する

   ```typescript
   describe("useSkillExecution - edge cases", () => {
     it("should handle execute called while already running");
     it("should handle rapid execute calls");
     it("should handle abort called with no active execution");
     it("should handle reset called while running");
     it("should handle component unmount during execution");
   });

   describe("useSkillExecution - message handling", () => {
     it("should handle out-of-order messages");
     it("should handle duplicate messages");
     it("should handle messages after completion");
     it("should preserve message order in state");
   });

   describe("useSkillExecution - error scenarios", () => {
     it("should handle execute failure");
     it("should handle network timeout");
     it("should recover from error state");
   });
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`（追加テスト）

---

### タスク3: エッジケーステスト追加（UIコンポーネント）

**目的**: SkillStreamDisplayのエッジケースをテストする

**実行手順**:

1. テストファイルを更新する
   - パス: `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`

2. エッジケーステストを追加する

   ```typescript
   describe("SkillStreamDisplay - edge cases", () => {
     it("should handle very long messages with scrolling");
     it("should handle rapid message updates");
     it("should handle empty skillId prop");
     it("should handle prop changes during execution");
   });

   describe("SkillStreamDisplay - accessibility", () => {
     it("should have proper ARIA labels");
     it("should be keyboard navigable");
     it("should announce status changes to screen readers");
   });

   describe("SkillStreamDisplay - callbacks", () => {
     it("should not call onComplete when error occurs");
     it("should not call onError when completed successfully");
     it("should handle callback throwing error");
   });
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`（追加テスト）

---

### タスク4: 統合テスト拡充

**目的**: End-to-End シナリオのテストを追加する

**実行手順**:

1. テストファイルを更新する
   - パス: `apps/desktop/src/__tests__/skill-stream-integration.test.ts`

2. 追加シナリオのテストを作成する

   ```typescript
   describe("Skill Stream Integration - advanced scenarios", () => {
     it("should handle rapid start/stop cycles");
     it("should handle concurrent executions with different skillIds");
     it("should maintain state consistency across re-renders");
     it("should cleanup properly on route change");
   });

   describe("Skill Stream Integration - error recovery", () => {
     it("should recover from temporary network failure");
     it("should show appropriate error UI on permanent failure");
     it("should allow retry after error");
   });
   ```

**期待される成果物**:

- `apps/desktop/src/__tests__/skill-stream-integration.test.ts`（追加テスト）

---

### タスク5: テスト実行・結果確認

**目的**: 追加したテストが全てパスすることを確認する

**実行手順**:

1. 全テストを実行する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "skillAPI|useSkillExecution|SkillStreamDisplay|Skill Stream Integration"
   ```

2. 全テストがパスすることを確認する

3. テスト結果を記録する

**期待される成果物**:

- `outputs/phase-6/test-results-expanded.md`

---

## 参照資料

| 参照資料       | パス                             | 内容               |
| -------------- | -------------------------------- | ------------------ |
| Phase 4テスト  | Phase 4で作成したテストファイル  | 基本テスト         |
| Phase 5実装    | Phase 5で作成した実装ファイル    | 実装コード         |
| テストパターン | `apps/desktop/src/**/__tests__/` | 既存テストパターン |

---

## 成果物

| 成果物                    | パス                                                                                   | 内容           |
| ------------------------- | -------------------------------------------------------------------------------------- | -------------- |
| Preload APIテスト（拡充） | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                                 | 追加テスト     |
| React Hookテスト（拡充）  | `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`                  | 追加テスト     |
| UIテスト（拡充）          | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx` | 追加テスト     |
| 統合テスト（拡充）        | `apps/desktop/src/__tests__/skill-stream-integration.test.ts`                          | 追加テスト     |
| テスト結果                | `outputs/phase-6/test-results-expanded.md`                                             | 拡充テスト結果 |

---

## 統合テスト連携

本Phaseで追加する統合テストシナリオ:

| シナリオID | シナリオ                | 検証内容                |
| ---------- | ----------------------- | ----------------------- |
| IT-005     | 高速開始/停止サイクル   | rapid start/stop cycles |
| IT-006     | 異なるskillIdの同時実行 | concurrent executions   |
| IT-007     | ネットワーク障害復旧    | error recovery          |
| IT-008     | エラー後のリトライ      | retry after error       |

---

## 完了条件

- [ ] Preload APIのエッジケース・エラーハンドリングテストが追加されている
- [ ] React Hookのエッジケース・メッセージハンドリングテストが追加されている
- [ ] UIコンポーネントのエッジケース・アクセシビリティテストが追加されている
- [ ] 統合テストの追加シナリオが作成されている
- [ ] 全ての追加テストがパスしている
- [ ] テスト結果が`outputs/phase-6/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/phase-7-test-coverage.md`
