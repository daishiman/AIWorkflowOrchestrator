# TASK-3-1-A 統合テスト設計書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-3-1-A |
| Phase      | 4          |
| 作成日     | 2026-01-24 |
| ステータス | 完了       |

---

## 統合テストシナリオ

### 1. SDK連携テスト

**目的**: Claude Agent SDK の query() API との連携を検証

**シナリオ**:

1. SkillExecutor.execute() を呼び出す
2. query() API が正しいパラメータで呼び出されることを確認
3. stream() からメッセージを受信
4. 全メッセージが処理されることを確認

**検証項目**:

- query() API の呼び出しパラメータ（prompt, options）
- stream() イテレーターの処理
- メッセージ変換の正確性

### 2. ストリーミングテスト

**目的**: Main → Renderer へのストリーミング配信を検証

**シナリオ**:

1. SDK から複数のストリームメッセージを受信
2. 各メッセージを SkillStreamMessage に変換
3. IPC 経由で Renderer に配信
4. 完了メッセージで終了

**検証項目**:

- IPC チャンネル名（skill:stream）
- メッセージ形式（SkillStreamMessage）
- メッセージ順序の保持
- isComplete フラグの設定

### 3. エラーハンドリングテスト

**目的**: SDK エラーの伝播と処理を検証

**シナリオ**:

1. SDK がエラーを発生させる
2. SkillExecutor がエラーをキャッチ
3. エラーを SkillExecutionError に変換
4. エラーメッセージを Renderer に配信
5. 状態を error に更新

**検証項目**:

- エラーコードの正確性
- エラーメッセージの内容
- リソースのクリーンアップ
- 状態の一貫性

### 4. 中断処理テスト

**目的**: AbortController による実行中断を検証

**シナリオ**:

1. execute() で実行を開始
2. abort() を呼び出す
3. AbortController.abort() が呼ばれる
4. SDK クエリが中断される
5. 中断通知が Renderer に配信される

**検証項目**:

- AbortController の signal 伝播
- 中断状態への遷移
- リソースのクリーンアップ
- 中断通知の配信

---

## テストデータ

### モックスキル

```typescript
const mockSkill: SkillMetadata = {
  id: "test-skill-001",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill for integration testing",
  path: "/test/path/to/skill",
  triggers: ["test", "integration"],
  anchors: [
    {
      source: "Test Source",
      application: "Testing",
      purpose: "Integration test verification",
    },
  ],
  allowedTools: ["Read", "Write", "Bash"],
};
```

### モックリクエスト

```typescript
const mockRequest: SkillExecutionRequest = {
  prompt: "Integration test prompt",
  skillId: "test-skill-001",
  timeout: 30000,
};
```

### モックストリームメッセージ

```typescript
const mockStreamMessages = [
  { type: "text", content: "Hello, " },
  { type: "text", content: "world!" },
  { type: "tool_use", tool_use: { name: "Read", input: { path: "/test" } } },
  { type: "complete" },
];
```

---

## モック構成

### SDK モック

```typescript
const mockQuery = vi.fn().mockResolvedValue({
  stream: vi.fn().mockReturnValue({
    [Symbol.asyncIterator]: async function* () {
      for (const msg of mockStreamMessages) {
        yield msg;
      }
    },
  }),
});

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: mockQuery,
}));
```

### エラーシナリオモック

```typescript
// タイムアウトエラー
const mockTimeoutError = new Error("Timeout");
mockTimeoutError.name = "TimeoutError";

// ネットワークエラー
const mockNetworkError = new Error("Network Error");
mockNetworkError.name = "NetworkError";

// 認証エラー
const mockAuthError = {
  code: "authentication_error",
  message: "Invalid API key",
};
```

---

## テスト実行手順

1. モックのセットアップ
2. SkillExecutor インスタンス作成
3. テストシナリオ実行
4. アサーション検証
5. クリーンアップ

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
