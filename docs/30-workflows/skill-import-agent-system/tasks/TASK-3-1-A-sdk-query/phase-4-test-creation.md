# Phase 4: テスト作成（TDD: Red） - TASK-3-1-A SDK query() 基本実装

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 4                      |
| Phase名    | テスト作成（TDD: Red） |
| 前提Phase  | Phase 3 (設計レビュー) |
| 後続Phase  | Phase 5 (実装)         |
| ステータス | 未実施                 |
| 作成日     | 2026-01-24             |
| 機能名     | TASK-3-1-A-sdk-query   |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。
TDD原則に従い、まず失敗するテストを作成する。

## 背景

SkillExecutor クラスの品質を確保するため、実装前にテストを作成する。
テストファーストアプローチにより、設計の妥当性を早期に検証できる。

---

## 実行タスク

### タスク1: ユニットテスト設計

**目的**: SkillExecutor の各メソッドをテストする

**実行手順**:

1. テストシナリオをリストアップ
2. テストファイルを作成
3. 各テストケースを実装（Red状態）

**テストケース**:

```typescript
describe("SkillExecutor", () => {
  describe("execute", () => {
    it("should return executionId when execution starts");
    it("should call query() with correct prompt");
    it("should handle stream messages");
    it("should return success response on completion");
    it("should return error response on failure");
  });

  describe("abort", () => {
    it("should return true when execution is aborted");
    it("should return false when executionId not found");
    it("should call AbortController.abort()");
  });

  describe("buildPrompt", () => {
    it("should include skill context information");
    it("should include user prompt");
  });

  describe("handleStreamMessage", () => {
    it("should convert and send assistant messages");
    it("should handle tool_use messages");
    it("should handle error messages");
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`

### タスク2: 統合テストシナリオ設計

**目的**: SDK連携・IPC連携のテストシナリオを設計

**実行手順**:

1. 統合テストシナリオをカテゴリ別に設計
2. モック戦略を決定
3. テストファイルを作成

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.integration.test.ts`

### タスク3: テスト仕様書作成

**目的**: テスト設計をドキュメント化

**実行手順**:

1. テストカテゴリとカバレッジ目標を記載
2. モック戦略を記載
3. 統合テストシナリオを記載

**期待される成果物**:

- `outputs/phase-4/test-specification.md`
- `outputs/phase-4/test-cases.md`

---

## 参照資料

| 参照資料           | パス                                                                        | 内容          |
| ------------------ | --------------------------------------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                                | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                    | Phase 2成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`                                   | Phase 3成果物 |
| Agent SDK仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK API仕様   |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                                    | テストファイル          |
| -------------------- | ------------------------------------------- | ----------------------- |
| SDK連携テスト        | query() API呼び出し・stream()イテレーション | `*.integration.test.ts` |
| ストリーミングテスト | メッセージ変換・IPC配信                     | `*.stream.test.ts`      |
| エラーハンドリング   | SDKエラー・タイムアウト・ネットワークエラー | `*.error.test.ts`       |
| 中断処理テスト       | AbortController連携・リソースクリーンアップ | `*.abort.test.ts`       |

---

## モック戦略

### SDK モック

```typescript
// __mocks__/@anthropic-ai/claude-agent-sdk.ts
export const mockQuery = vi.fn();
export const mockStream = vi.fn();

export const query = vi.fn().mockReturnValue({
  stream: mockStream.mockReturnValue({
    [Symbol.asyncIterator]: async function* () {
      yield { type: "assistant", message: "Hello" };
      yield { type: "complete" };
    },
  }),
});
```

### BrowserWindow モック

```typescript
const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
} as unknown as BrowserWindow;
```

---

## 成果物

| 成果物                 | パス                                                                               | 内容             |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| テスト仕様書           | `outputs/phase-4/test-specification.md`                                            | テスト設計       |
| テストケース一覧       | `outputs/phase-4/test-cases.md`                                                    | ケース一覧       |
| 統合テストシナリオ     | `outputs/phase-4/integration-test-design.md`                                       | 統合テスト設計   |
| ユニットテストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`             | テストコード     |
| 統合テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.integration.test.ts` | 統合テストコード |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] SDKモック・IPC モックが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-1-A-sdk-query/phase-5-implementation.md`
