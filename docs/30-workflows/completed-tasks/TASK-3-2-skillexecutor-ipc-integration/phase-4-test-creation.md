# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| Phase名    | テスト作成（TDD: Red）                 |
| 前提Phase  | Phase 3（設計レビューゲート）          |
| 後続Phase  | Phase 5（実装）                        |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | TASK-3-2-skillexecutor-ipc-integration |

---

## 目的

TDDのRedフェーズとして、実装前に失敗するテストを作成する。テストファーストで開発を進めることで、要件を確実に満たす実装を保証する。

## 背景

Phase 2で設計したインターフェースに基づき、Preload API・React Hook・UIコンポーネントのテストを作成する。この段階では実装がないため、テストは全て失敗する（Red状態）。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Preload API テスト作成

**目的**: skillAPI拡張（onStream, abort）のユニットテストを作成する

**実行手順**:

1. テストファイルを作成する
   - パス: `apps/desktop/src/preload/__tests__/skill-api.test.ts`

2. onStreamのテストケースを作成する

   ```typescript
   describe("skillAPI.onStream", () => {
     it("should register callback and return unsubscribe function");
     it("should call callback when skill:stream message is received");
     it("should not call callback after unsubscribe");
     it("should handle multiple listeners");
   });
   ```

3. abortのテストケースを作成する

   ```typescript
   describe("skillAPI.abort", () => {
     it("should call ipcRenderer.invoke with skill:abort channel");
     it("should return true when abort is successful");
     it("should return false when execution not found");
   });
   ```

4. getExecutionStatusのテストケースを作成する

   ```typescript
   describe("skillAPI.getExecutionStatus", () => {
     it("should return execution info when found");
     it("should return null when not found");
   });
   ```

**期待される成果物**:

- `apps/desktop/src/preload/__tests__/skill-api.test.ts`

---

### タスク2: React Hook テスト作成

**目的**: useSkillExecutionフックのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する
   - パス: `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`

2. 初期状態のテストケースを作成する

   ```typescript
   describe("useSkillExecution - initial state", () => {
     it("should return idle status initially");
     it("should return empty messages array initially");
     it("should return null error initially");
   });
   ```

3. execute関数のテストケースを作成する

   ```typescript
   describe("useSkillExecution - execute", () => {
     it("should set status to running when execute is called");
     it("should clear previous messages when execute is called");
     it("should store executionId from response");
   });
   ```

4. onStreamのテストケースを作成する

   ```typescript
   describe("useSkillExecution - stream handling", () => {
     it("should add message to messages array when received");
     it("should set status to completed when complete message received");
     it("should set status to error when error message received");
     it("should ignore messages with different executionId");
   });
   ```

5. abort関数のテストケースを作成する

   ```typescript
   describe("useSkillExecution - abort", () => {
     it("should call skillAPI.abort with executionId");
     it("should not call abort when no active execution");
   });
   ```

6. クリーンアップのテストケースを作成する

   ```typescript
   describe("useSkillExecution - cleanup", () => {
     it("should unsubscribe from stream on unmount");
     it("should not cause memory leaks");
   });
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`

---

### タスク3: UIコンポーネント テスト作成

**目的**: SkillStreamDisplayコンポーネントのテストを作成する

**実行手順**:

1. テストファイルを作成する
   - パス: `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`

2. レンダリングのテストケースを作成する

   ```typescript
   describe("SkillStreamDisplay - rendering", () => {
     it("should render without crashing");
     it("should display idle state initially");
     it("should display loading state when running");
     it("should display completed state when done");
     it("should display error state when error occurs");
   });
   ```

3. メッセージ表示のテストケースを作成する

   ```typescript
   describe("SkillStreamDisplay - message display", () => {
     it("should display text messages");
     it("should display tool_use messages with tool name");
     it("should display error messages with error styling");
     it("should display messages in order");
   });
   ```

4. インタラクションのテストケースを作成する

   ```typescript
   describe("SkillStreamDisplay - interactions", () => {
     it("should call abort when abort button is clicked");
     it("should disable abort button when not running");
   });
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`

---

### タスク4: 統合テスト作成

**目的**: Main Process→Preload→Rendererの統合テストを作成する

**実行手順**:

1. テストファイルを作成する
   - パス: `apps/desktop/src/__tests__/skill-stream-integration.test.ts`

2. 統合テストケースを作成する

   ```typescript
   describe("Skill Stream Integration", () => {
     it("should receive stream messages from SkillExecutor");
     it("should handle abort request correctly");
     it("should handle multiple concurrent executions");
     it("should cleanup on component unmount");
   });
   ```

**期待される成果物**:

- `apps/desktop/src/__tests__/skill-stream-integration.test.ts`

---

### タスク5: テスト実行（Red状態確認）

**目的**: 全てのテストが失敗することを確認する

**実行手順**:

1. テストを実行する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "skillAPI|useSkillExecution|SkillStreamDisplay"
   ```

2. 全テストが失敗（Red状態）であることを確認する

3. テスト結果を記録する

**期待される成果物**:

- `outputs/phase-4/test-results-red.md`

---

## 参照資料

| 参照資料              | パス                                                    | 内容                 |
| --------------------- | ------------------------------------------------------- | -------------------- |
| Phase 2設計           | `outputs/phase-2/`                                      | 設計ドキュメント     |
| 既存テストパターン    | `apps/desktop/src/preload/__tests__/`                   | 参考テスト           |
| Vitest Documentation  | https://vitest.dev/                                     | テストフレームワーク |
| React Testing Library | https://testing-library.com/docs/react-testing-library/ | React テスト         |

---

## 成果物

| 成果物                 | パス                                                                                   | 内容           |
| ---------------------- | -------------------------------------------------------------------------------------- | -------------- |
| Preload APIテスト      | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                                 | skillAPIテスト |
| React Hookテスト       | `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`                  | Hookテスト     |
| UIコンポーネントテスト | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx` | UIテスト       |
| 統合テスト             | `apps/desktop/src/__tests__/skill-stream-integration.test.ts`                          | 統合テスト     |
| Red状態確認            | `outputs/phase-4/test-results-red.md`                                                  | テスト失敗確認 |

---

## 統合テスト連携

本Phaseで以下の統合テストを作成する:

| シナリオID | シナリオ         | 検証内容                        |
| ---------- | ---------------- | ------------------------------- |
| IT-001     | スキル実行〜完了 | execute→onStream受信→完了状態   |
| IT-002     | スキル実行中断   | execute→abort→中断状態          |
| IT-003     | エラー発生時     | execute→エラー受信→エラー表示   |
| IT-004     | 複数実行         | 複数executionIdのメッセージ分離 |

---

## 完了条件

- [ ] Preload API（skillAPI）のテストが作成されている
- [ ] React Hook（useSkillExecution）のテストが作成されている
- [ ] UIコンポーネント（SkillStreamDisplay）のテストが作成されている
- [ ] 統合テストが作成されている
- [ ] 全てのテストがRed状態（失敗）であることを確認
- [ ] テスト結果が`outputs/phase-4/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "skillAPI|useSkillExecution|SkillStreamDisplay"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）がPASSしていること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/phase-5-implementation.md`
