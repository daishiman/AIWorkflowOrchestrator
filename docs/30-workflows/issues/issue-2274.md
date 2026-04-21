# [#2274] [TASK-TSC-NON-VISUAL-PARITY-VALIDATOR-001] task-specification-creator Phase 12 — NON_VISUAL artifacts parity validator 標準化

## メタ情報

```yaml
issue_number: 2274
title: [TASK-TSC-NON-VISUAL-PARITY-VALIDATOR-001] task-specification-creator Phase 12 — NON_VISUAL artifacts parity validator 標準化
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-04-18
updated_date: 2026-04-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2274
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

TASK-TSC-NON-VISUAL-PARITY-VALIDATOR-001

## 概要

`task-specification-creator` スキルの Phase 12 Step 6（準拠チェック）で、`artifacts.json` の root/outputs parity 確認が「存在確認」にとどまっており、存在時の `status` 差分を機械的に比較する手順が未定義。

NON_VISUAL タスクの Phase 12 に、root と outputs の artifacts.json を validator で比較する標準手順を追加し、parity drift の見落とし防止を実現する。

## スコープ

- Phase 12 Step 6 への parity validator 実行手順追加
- `artifacts.json` root/outputs status 比較コマンドの定義
- Phase 12 チェックリストへの「status 比較」項目追加

## 受入基準

| ID   | 基準                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| AC-1 | Phase 12 Step 6 に root/outputs artifacts.json status 比較手順が明示されている |
| AC-2 | 比較コマンド例がテンプレートに記載されている                                   |
| AC-3 | parity drift 検出時の対処手順が記述されている                                  |

## 発見元

TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 Phase 12 skill-feedback-report (FB-TSC-002)

## 仕様書

`docs/30-workflows/unassigned-task/TASK-TSC-NON-VISUAL-PARITY-VALIDATOR-001.md`
