# [#731] [fix] chat-history ExpandedTests フレーキーテスト境界値修正

## メタ情報

```yaml
task_id: fix-chat-history-flaky-test-001
task_name: chat-history ExpandedTests フレーキーテスト境界値修正
category: バグ修正
target_feature: chat-history テスト
priority: 低
scale: 小規模
status: 完了
source_phase: DEBT-SEC-001 品質検証時に発見
created_date: 2026-02-06
```

## 概要

`src/features/chat-history/__tests__/ExpandedTests.test.tsx` の `should handle rapid state changes without memory leaks` テストがフレーキー（非決定的）に失敗する問題。

## 原因

- `setInterval(10ms)` でカウンターをインクリメントし、`waitFor({ timeout: 200ms })` で `toBeGreaterThan(5)` をアサート
- 大量テスト実行時（9300+テスト）にヒープ使用量が増大し、GC圧迫でインターバルコールバックが遅延
- カウンターがちょうど5の場合、`toBeGreaterThan(5)` は5を許容しないため失敗

## 修正内容

```diff
- expect(count).toBeGreaterThan(5);
+ expect(count).toBeGreaterThanOrEqual(5);
```

## 修正PR

- #730 (feat(auth): State Parameter CSRF防御の実装とドキュメント整備) に含まれる

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
