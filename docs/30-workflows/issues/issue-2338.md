# [#2338] [TASK-LOGS-ARCHIVE-RETROACTIVE-001] 既存 LOGS.md への新規アーカイブポリシー遡及適用

## メタ情報

```yaml
issue_number: 2338
title: [TASK-LOGS-ARCHIVE-RETROACTIVE-001] 既存 LOGS.md への新規アーカイブポリシー遡及適用
state: OPEN
priority: 低
scale: 小規模
category: -
status: -
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2338
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | -      |

---

## 背景

`TASK-LOGS-ARCHIVE-POLICY-001` にてアーカイブポリシーが確定し、正本として `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` に収録された。しかし既存スキルの LOGS.md への遡及適用は意図的にスコープ外として切り出されており、閾値超過のファイルがポリシー確定後も手つかずのまま残っている。

### 閾値超過状況（2026-04-19 計測）

| skill                      | 行数 | サイズ(KB) | 300行超 | 30KB超 |
| -------------------------- | ---- | ---------- | ------- | ------ |
| skill-creator              | 2542 | 123.0      | 超      | 超     |
| aiworkflow-requirements    | 2908 | 571.4      | 超      | 超     |
| task-specification-creator | 3158 | 233.9      | 超      | 超     |
| claude-agent-sdk           | 336  | 26.4       | 超      | 未達   |

## 重要な注意事項

**F-001 legacy 表記リネーム禁止**: `logs-archive-2026-feb.md` / `logs-archive-2026-march.md` 等の legacy 形式ファイルはリネーム・削除禁止。残置すること。

## 目標

確定済みアーカイブポリシーを、既存の全対象スキルの LOGS.md に遡及適用する。

1. `.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md` のうち閾値超過しているファイルがアーカイブ済みであること
2. 各スキルの `references/` 配下に `logs-archive-YYYY-MM.md`（YYYY-MM 数値形式）が少なくとも 1 つ作成されていること
3. legacy ファイル（`logs-archive-2026-feb.md` 等）がリネームされずにそのまま残置されていること（F-001）
4. `.claude/` と `.agents/` の両側で diff ゼロが確認されていること
5. 現役 LOGS.md のサイズが閾値（300 行以下 AND 30 KB 以下）に収まっていること

## 参照

- ポリシー正本: `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`
- 仕様書: `docs/30-workflows/unassigned-task/TASK-LOGS-ARCHIVE-RETROACTIVE-001.md`

## 依存タスク

- TASK-LOGS-ARCHIVE-POLICY-001（前提: アーカイブポリシー確定元）
