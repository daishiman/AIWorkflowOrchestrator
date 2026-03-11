# [#1113] [UT-IMP-PHASE11-SCREENSHOT-COMMAND-AUTOMATION-001] Phase 11 screenshot コマンド自動登録基盤

## メタ情報

```yaml
issue_number: 1113
title: [UT-IMP-PHASE11-SCREENSHOT-COMMAND-AUTOMATION-001] Phase 11 screenshot コマンド自動登録基盤
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-09
updated_date: 2026-03-09
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1113
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

Phase 11 手動テストの screenshot コマンドを自動登録する基盤を構築する。

## 背景

- 各タスクごとに screenshot スクリプト（.mjs）を手動作成している
- package.json への script 登録も手動
- TC-ID と png の対応を手動管理
- Phase 11 の `phase-11-manual-test.md` に記載するコマンドと実際のスクリプトが乖離しやすい

## 完了条件

- screenshot スクリプトテンプレートの自動生成が動作
- package.json への script 登録が自動化
- TC-ID からメタデータ JSON を自動生成可能
- 既存の `validate-phase11-screenshot-coverage` との整合性が維持されている

## 仕様書

docs/30-workflows/unassigned-task/task-phase11-screenshot-command-automation.md
