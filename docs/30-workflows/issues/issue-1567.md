# [#1567] "[TASK-LLM-MOD-HEALTHCHECK-BODY] TASK"

## メタ情報

```yaml
task_id: TASK-LLM-MOD-HEALTHCHECK-BODY
task_name: TASK
category: -
target_feature: -
priority: 低
scale: -
status: 未実施
source_phase: TASK-LLM-MOD-02 Phase 6
created_date: 2026-03-24
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-llm-mod-healthcheck-body.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 目的

`checkHealth` リクエストの `max_tokens: 1` と `messages: [{ role: "user", content: "Hi" }]` が固定値として正しいことを検証するテストを追加する。HC-001（モデルID検証）と同じパターンでリクエストボディの他のフィールドも検証する。

## 対象ファイル

| ファイル                                                                | 変更内容                 |
| ----------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | HC-002/HC-003 テスト追加 |

## 実行タスク

1. HC-002: `checkHealth` リクエストの `max_tokens` が `1` であることを検証するテスト
2. HC-003: `checkHealth` リクエストの `messages` が `[{ role: "user", content: "Hi" }]` であることを検証するテスト
3. HC-001 と統合して `checkHealth` describe ブロック内にまとめることも検討

## テストコード例

```typescript
it("should send max_tokens: 1 in health check request", async () => {
  let capturedBody: Record<string, unknown> = {};
  server.use(
    http.post("https://api.anthropic.com/v1/messages", async ({ request }) => {
      capturedBody = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        content: [{ type: "text", text: "pong" }],
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }),
  );
  await adapter.checkHealth();
  expect(capturedBody.max_tokens).toBe(1);
});
```

## 完了条件

- [ ] `max_tokens` 検証テストが追加されている
- [ ] `messages` 検証テストが追加されている
- [ ] 全テストがPASS
