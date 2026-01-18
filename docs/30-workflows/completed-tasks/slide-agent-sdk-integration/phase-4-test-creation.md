# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成（TDD: Red）      |
| 前提Phase  | Phase 3                     |
| 後続Phase  | Phase 5                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-16                  |
| 機能名     | slide-agent-sdk-integration |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。Claude Agent SDK統合に必要なユニットテスト・統合テストを作成し、TDD原則に従ってテストファーストで開発を進める。

## 背景

Phase 3で承認された設計に基づき、skill-executor.tsとagent-client.tsのSDK統合をテスト駆動で開発する。テストを先に作成することで、実装の仕様を明確化し、回帰を防止する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ユニットテスト作成（skill-executor）

**目的**: skill-executor.tsのSDK統合に対するユニットテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`
2. 以下のテストケースを作成する:

```typescript
// テストケース一覧
describe("SkillExecutor", () => {
  describe("execute", () => {
    it("should call Agent SDK with correct skill name for 'hearing' phase");
    it("should call Agent SDK with correct skill name for 'structure' phase");
    it("should call Agent SDK with correct skill name for 'html' phase");
    it("should call Agent SDK with correct skill name for 'modifier' phase");
    it("should pass projectPath as context to Agent SDK");
    it("should return SkillExecutionResult on success");
    it("should return error result when SDK call fails");
    it("should emit progress callbacks during execution");
  });

  describe("cancel", () => {
    it("should call AbortController.abort when cancel is invoked");
    it("should return cancelled error in execution result");
  });

  describe("isExecuting", () => {
    it("should return true during execution");
    it("should return false after execution completes");
  });
});
```

3. モックを作成:
   - AgentClient のモック
   - AbortController のモック

**期待される成果物**:

- `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts` - ユニットテスト

---

### タスク2: ユニットテスト作成（agent-client）

**目的**: agent-client.tsのSDK統合に対するユニットテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`
2. 以下のテストケースを作成する:

```typescript
// テストケース一覧
describe("AgentClient", () => {
  describe("query", () => {
    it("should call Claude Agent SDK with prompt and options");
    it("should handle streaming responses via onMessage callback");
    it("should resolve with response content on completion");
    it("should reject with timeout error after 30 seconds");
    it("should reject with abort error when aborted");
    it("should reject with SDK error when API call fails");
  });

  describe("abort", () => {
    it("should trigger AbortController signal");
    it("should set status to idle after abort");
  });

  describe("getStatus", () => {
    it("should return 'idle' initially");
    it("should return 'running' during query execution");
    it("should return 'error' after failed query");
  });

  describe("onMessage", () => {
    it("should register message listener");
    it("should unregister listener when unsubscribe is called");
    it("should notify listeners on SDK message");
  });
});
```

3. モックを作成:
   - Claude Agent SDK のモック
   - safeStorage のモック

**期待される成果物**:

- `apps/desktop/src/main/slide/__tests__/agent-client.test.ts` - ユニットテスト

---

### タスク3: 統合テスト作成

**目的**: SDK統合のエンドツーエンド動作を検証する統合テストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts`
2. 以下のテストシナリオを作成する:

| シナリオカテゴリ   | テストケース                                           |
| ------------------ | ------------------------------------------------------ |
| API接続テスト      | SDK初期化と認証が正常に行われる                        |
| API接続テスト      | 無効なAPIキーでエラーが発生する                        |
| データフローテスト | structure.md変更 → html-generator実行 → index.html更新 |
| データフローテスト | index.html変更 → modifier実行 → structure.md更新       |
| エラーハンドリング | SDK障害時にエラーメッセージがUIに表示される            |
| エラーハンドリング | タイムアウト時にエラーメッセージが表示される           |
| 状態同期テスト     | 進捗コールバックがSyncStatusIndicatorに反映される      |
| キャンセルテスト   | 実行中のスキルがキャンセルできる                       |

3. テストヘルパーを作成:
   - SDK モックファクトリ
   - テスト用 projectPath 生成

**期待される成果物**:

- `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` - 統合テスト
- `outputs/phase-4/test-specification.md` - テスト仕様書
- `outputs/phase-4/integration-test-design.md` - 統合テスト設計書

---

### タスク4: テスト仕様書作成

**目的**: テスト設計を文書化する

**実行手順**:

1. テストケース一覧を整理する
2. テストカバレッジ目標を定義する:
   - Line Coverage: 80%+
   - Branch Coverage: 60%+
   - Function Coverage: 80%+
3. テスト実行方法を記載する

**期待される成果物**:

- `outputs/phase-4/test-specification.md` - テスト仕様書

---

## 参照資料

| 参照資料      | パス                                                                        | 内容          |
| ------------- | --------------------------------------------------------------------------- | ------------- |
| 要件定義書    | `outputs/phase-1/requirements-definition.md`                                | Phase 1成果物 |
| 設計書        | `outputs/phase-2/architecture-design.md`                                    | Phase 2成果物 |
| 設計レビュー  | `outputs/phase-3/design-review-result.md`                                   | Phase 3成果物 |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK仕様       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                        | 内容                    |
| ------------- | --------------------------------------------------------------------------- | ----------------------- |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK統合インターフェース |

---

## 成果物

| 成果物               | パス                                                            | 内容           |
| -------------------- | --------------------------------------------------------------- | -------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md`                         | テスト設計     |
| テストケース一覧     | `outputs/phase-4/test-cases.md`                                 | ケース一覧     |
| 統合テスト設計       | `outputs/phase-4/integration-test-design.md`                    | 統合テスト設計 |
| skill-executorテスト | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | ユニットテスト |
| agent-clientテスト   | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | ユニットテスト |
| 統合テスト           | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | 統合テスト     |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                   | テストファイル            |
| ------------------ | ------------------------------------------ | ------------------------- |
| API接続テスト      | SDK初期化・認証・エンドポイント疎通        | `sdk-integration.test.ts` |
| データフローテスト | structure.md → html-generator → index.html | `sdk-integration.test.ts` |
| エラーハンドリング | SDK障害時のエラー表示・タイムアウト処理    | `sdk-integration.test.ts` |
| 状態同期テスト     | 進捗コールバック・SyncStatusIndicator反映  | `sdk-integration.test.ts` |

---

## 完了条件

- [ ] skill-executor.tsのユニットテストが作成されている（Red状態）
- [ ] agent-client.tsのユニットテストが作成されている（Red状態）
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている（タイムアウト、空入力等）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

Phase 5: 実装（TDD: Green）
