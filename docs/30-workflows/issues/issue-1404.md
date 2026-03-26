# [#1404] [UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001] AgentView.cta.test.tsx act() ラップ未適用 warning 解消

## メタ情報

```yaml
issue_number: 1404
title: [UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001] AgentView.cta.test.tsx act() ラップ未適用 warning 解消
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1404
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`AgentView.cta.test.tsx` のテスト実行時に `act()` ラップが未適用の箇所があり、React のテスト warning が出力されている。CI ログが汚染され、将来の実際の問題の発見が遅れるリスクがある。

## 背景

Phase 10/11 レビューにて検出。`act()` ラップなしで状態更新を伴う操作を行うと `Warning: An update to ... inside a test was not wrapped in act(...)` が出力される（P20 パターン）。

## 対象ファイル

- `apps/desktop/src/renderer/components/agent/__tests__/AgentView.cta.test.tsx`

## 対応内容

1. テストを実行して warning 発生箇所を特定
2. 非同期状態更新を伴う `fireEvent` 呼び出しを `await act(async () => { fireEvent.xxx(el) })` でラップ
3. P39 準拠: happy-dom 環境では `userEvent` 使用禁止 → `fireEvent` + `act()` パターンに統一

```typescript
// P39 準拠パターン
await act(async () => {
  fireEvent.click(ctaButton);
});
```

## 完了条件

- [ ] `AgentView.cta.test.tsx` の全テストが PASS
- [ ] テスト実行時に `act()` 関連 warning が出力されない
- [ ] P39 準拠: `fireEvent` + `act()` パターンが使用されている

## 参照

- タスク指示書: `docs/30-workflows/unassigned-task/task-04-agentview-cta-act-wrap.md`
- 発見元: Phase 10/11 最終レビュー（TASK-04）
- 関連パターン: P39（happy-dom 環境での userEvent 非互換）、P40（テスト実行ディレクトリ依存）
