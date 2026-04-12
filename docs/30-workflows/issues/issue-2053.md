# [#2053] [UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001] describe.skip 内の旧 testid 参照クリーンアップ

## メタ情報

```yaml
issue_number: 2053
title: [UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001] describe.skip 内の旧 testid 参照クリーンアップ
state: OPEN
priority: 中
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-08
updated_date: 2026-04-08
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2053
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001`（#2015）の実装完了後、`SkillLifecyclePanel` テストファイルの `describe.skip` ブロック内に削除済み testid (`skill-lifecycle-request-input`) の参照が残存している。

## 背景

Phase 12 `skill-feedback-report.md` でフィードバック #2 として記録された改善提案。現在は `describe.skip` によりテスト実行がスキップされているため CI への影響はないが、将来的に混乱を招く可能性がある。

## 対象ファイル

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

## 作業内容

- `describe.skip` ブロック内の `skill-lifecycle-request-input` testid 参照を削除または現行 testid に書き換える
- `pnpm --filter @repo/desktop test:run` の全 PASS を確認する

## 優先度

低（CI への即時影響なし）。W2-seq-03b / W3-seq-04 の完了後に着手可能。

## 関連

- 親タスク: #2015（CLOSED）
- タスク仕様書: `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001.md`
