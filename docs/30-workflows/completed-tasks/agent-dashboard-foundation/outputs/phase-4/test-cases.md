# テストケース一覧 - エージェントダッシュボード基盤

## 概要情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | AGENT-001                  |
| 機能名   | agent-dashboard-foundation |
| Phase    | 4                          |
| 作成日   | 2026-01-10                 |

---

## agentSlice テストケース

### ファイル: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`

| テストID  | テスト名                                     | 分類       | 受け入れ基準 |
| --------- | -------------------------------------------- | ---------- | ------------ |
| SLICE-001 | should initialize with empty skills array    | 初期状態   | AC-005       |
| SLICE-002 | should initialize with isLoading false       | 初期状態   | AC-005       |
| SLICE-003 | should initialize with error null            | 初期状態   | AC-005       |
| SLICE-004 | should initialize with idle execution status | 初期状態   | AC-005       |
| SLICE-005 | should set skills                            | スキル操作 | -            |
| SLICE-006 | should select skill                          | スキル操作 | -            |
| SLICE-007 | should clear selected skill                  | スキル操作 | -            |
| SLICE-008 | should set skill filter                      | スキル操作 | -            |
| SLICE-009 | should set skill category                    | スキル操作 | -            |
| SLICE-010 | should set execution status                  | 実行操作   | -            |
| SLICE-011 | should append output                         | 実行操作   | -            |
| SLICE-012 | should clear execution                       | 実行操作   | -            |
| SLICE-013 | should set loading state                     | 共通操作   | -            |
| SLICE-014 | should set error                             | 共通操作   | -            |
| SLICE-015 | should reset agent state                     | 共通操作   | -            |

### テストコード構造

```typescript
describe("agentSlice", () => {
  describe("初期状態", () => {
    it("should initialize with empty skills array");
    it("should initialize with isLoading false");
    it("should initialize with error null");
    it("should initialize with idle execution status");
  });

  describe("スキル操作", () => {
    it("should set skills");
    it("should select skill");
    it("should clear selected skill");
    it("should set skill filter");
    it("should set skill category");
  });

  describe("実行操作", () => {
    it("should set execution status");
    it("should append output");
    it("should clear execution");
  });

  describe("共通操作", () => {
    it("should set loading state");
    it("should set error");
    it("should reset agent state");
  });
});
```

---

## AgentView テストケース

### ファイル: `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`

| テストID | テスト名                             | 分類             | 受け入れ基準 |
| -------- | ------------------------------------ | ---------------- | ------------ |
| VIEW-001 | should render without crashing       | レンダリング     | AC-004       |
| VIEW-002 | should display "Agent" header        | レンダリング     | AC-004       |
| VIEW-003 | should display description text      | レンダリング     | AC-004       |
| VIEW-004 | should have data-testid="agent-view" | レンダリング     | AC-004       |
| VIEW-005 | should display loading state         | ローディング状態 | -            |
| VIEW-006 | should display placeholder message   | 空状態           | AC-004       |
| VIEW-007 | should display error message         | エラー状態       | -            |
| VIEW-008 | should accept custom className       | Props            | -            |
| VIEW-009 | should have displayName set          | メタデータ       | -            |
| VIEW-010 | should have accessible heading       | アクセシビリティ | AC-010       |

### テストコード構造

```typescript
describe("AgentView", () => {
  describe("レンダリング", () => {
    it("should render without crashing");
    it('should display "Agent" header');
    it("should display description text");
    it('should have data-testid="agent-view"');
  });

  describe("ローディング状態", () => {
    it("should display loading state when isLoading is true");
  });

  describe("空状態", () => {
    it("should display placeholder message");
  });

  describe("エラー状態", () => {
    it("should display error message when error exists");
  });

  describe("className", () => {
    it("should accept custom className");
  });

  describe("displayName", () => {
    it("should have displayName set");
  });

  describe("アクセシビリティ", () => {
    it("should have accessible heading");
  });
});
```

---

## navigationSlice 追加テストケース

### ファイル: `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts` （追加分）

| テストID | テスト名                              | 分類         | 受け入れ基準 |
| -------- | ------------------------------------- | ------------ | ------------ |
| NAV-A001 | should navigate to agent view         | ビュー遷移   | AC-002       |
| NAV-A002 | should add agent to viewHistory       | 履歴管理     | AC-007       |
| NAV-A003 | should not duplicate agent in history | エッジケース | EC-001       |
| NAV-A004 | should go back from agent to previous | 履歴管理     | AC-007       |

### テストコード構造

```typescript
describe("navigationSlice - agent view", () => {
  it("should navigate to agent view");
  it("should add agent to viewHistory");
  it("should not duplicate agent in history when same view clicked");
  it("should go back from agent to previous view");
});
```

---

## IPCチャネル テストケース

### ファイル: `apps/desktop/src/preload/__tests__/channels.test.ts`

| テストID | テスト名                                                 | 分類           | 受け入れ基準 |
| -------- | -------------------------------------------------------- | -------------- | ------------ |
| IPC-001  | should define AGENT_GET_SKILLS                           | チャネル定義   | AC-006       |
| IPC-002  | should define AGENT_GET_SKILL_DETAIL                     | チャネル定義   | AC-006       |
| IPC-003  | should define AGENT_EXECUTE                              | チャネル定義   | AC-006       |
| IPC-004  | should define AGENT_ABORT                                | チャネル定義   | AC-006       |
| IPC-005  | should define AGENT_GET_STATUS                           | チャネル定義   | AC-006       |
| IPC-006  | should define AGENT_STATUS_CHANGED                       | チャネル定義   | AC-006       |
| IPC-007  | should define AGENT_STREAM_CHUNK                         | チャネル定義   | AC-006       |
| IPC-008  | should define AGENT_STREAM_END                           | チャネル定義   | AC-006       |
| IPC-009  | should define AGENT_STREAM_ERROR                         | チャネル定義   | AC-006       |
| IPC-010  | should include agent channels in ALLOWED_INVOKE_CHANNELS | ホワイトリスト | AC-006       |
| IPC-011  | should include agent channels in ALLOWED_ON_CHANNELS     | ホワイトリスト | AC-006       |

---

## 統合テストケース

### ナビゲーション統合テスト

| テストID    | テスト名                              | 分類        | 受け入れ基準 |
| ----------- | ------------------------------------- | ----------- | ------------ |
| INT-NAV-001 | should render Agent icon in AppDock   | AppDock統合 | AC-001       |
| INT-NAV-002 | should navigate to AgentView on click | 遷移統合    | AC-002       |
| INT-NAV-003 | should update currentView to agent    | 状態同期    | AC-002       |
| INT-NAV-004 | should set Agent icon as active       | UI状態      | AC-002       |

### 状態同期テスト

| テストID     | テスト名                               | 分類     | 受け入れ基準 |
| ------------ | -------------------------------------- | -------- | ------------ |
| INT-SYNC-001 | should sync agentSlice with navigation | 状態同期 | AC-007       |
| INT-SYNC-002 | should maintain viewHistory correctly  | 状態同期 | AC-007       |

### Store永続化テスト

| テストID     | テスト名                                   | 分類       | 受け入れ基準 |
| ------------ | ------------------------------------------ | ---------- | ------------ |
| INT-PERS-001 | should exclude agentSlice from persistence | 永続化除外 | -            |

---

## テスト優先度

| 優先度 | テストカテゴリ              | 理由                     |
| ------ | --------------------------- | ------------------------ |
| 1      | agentSlice初期状態テスト    | 最もシンプルで基礎となる |
| 2      | AgentViewレンダリングテスト | UI確認に必須             |
| 3      | IPCチャネル定義テスト       | 後続タスクの前提         |
| 4      | navigationSlice追加テスト   | 既存機能との連携確認     |
| 5      | 統合テスト                  | 全体動作確認             |

---

## 境界値テストケース

| テストID | テスト対象      | 境界値                         |
| -------- | --------------- | ------------------------------ |
| BV-001   | skills配列      | 空配列、1要素、多数要素        |
| BV-002   | skillFilter     | 空文字、1文字、長い文字列      |
| BV-003   | executionOutput | 空配列、1要素、多数の出力      |
| BV-004   | error           | null、空文字、長いエラー文字列 |
