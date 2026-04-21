# [#2221] [UT-SW-VISUAL-REGRESSION-SNAPSHOT-001] Visual回帰スナップショット補完（transition検証強化）

## メタ情報

```yaml
issue_number: 2221
title: [UT-SW-VISUAL-REGRESSION-SNAPSHOT-001] Visual回帰スナップショット補完（transition検証強化）
state: OPEN
priority: 低
scale: 小規模
category: testing
status: 未実施
created_date: 2026-04-16
updated_date: 2026-04-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2221
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

TASK-SW-UI-POLISH-001 Phase 12 Skill Feedback で検出された改善候補。CSS transition アニメーションはユニットテスト（JSDOM環境）では実動作を確認できないため、手動テスト手順の標準化またはPlaywright visual snapshotを補完する。

## タスク仕様書

`docs/30-workflows/unassigned-task/UT-SW-VISUAL-REGRESSION-SNAPSHOT-001.md`

## 発見元

TASK-SW-UI-POLISH-001 Phase 12 Skill Feedback（2026-04-16）

## 主な成果物

- `docs/30-workflows/templates/phase11-animation-verification-checklist.md`（アニメーション確認チェックリスト）
- `docs/30-workflows/templates/phase11-visual-regression-guide.md`（Visual 回帰確認ガイド）

## 苦戦箇所（発見時の知見）

JSDOM では CSS アニメーションが実行されないため、`transition-all duration-300 ease-in-out` クラスの「存在確認」しかできなかった。手動テストの静止画スクリーンショットではアニメーション動作の回帰検出が困難。DevTools の "Slow down animations" を活用した確認手順の標準化が有効。

## 関連タスク

- 発見元: #2157 (TASK-SW-UI-POLISH-001)
- 依存推奨: UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001
