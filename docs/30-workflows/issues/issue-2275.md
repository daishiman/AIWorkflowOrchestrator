# [#2275] [TASK-AWR-COMPLETED-LEDGER-VERIFICATION-TYPE-001] aiworkflow-requirements 完了台帳 — verification/implementation/docs-only 種別フィールド追加

## メタ情報

```yaml
issue_number: 2275
title: [TASK-AWR-COMPLETED-LEDGER-VERIFICATION-TYPE-001] aiworkflow-requirements 完了台帳 — verification/implementation/docs-only 種別フィールド追加
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-04-18
updated_date: 2026-04-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2275
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

TASK-AWR-COMPLETED-LEDGER-VERIFICATION-TYPE-001

## 概要

`task-workflow-completed.md`（完了台帳）にタスク種別（verification / implementation / docs-only）を区別するフィールドが存在しない。verification task と実装 task が同一フォーマットで記録されており、台帳参照時に実装変更の有無を判断するために詳細確認が必要になっている。

完了台帳テンプレートに `種別` フィールドを追加し、台帳の可読性と検索性を向上させる。

## スコープ

- `task-workflow-completed.md` テンプレートへの `種別` フィールド追加
- 直近の完了エントリへの `種別` フィールド付与
- SKILL.md または参照ドキュメントへの種別定義・記録ルール追記

## 受入基準

| ID   | 基準                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| AC-1 | テンプレートに `種別: verification / implementation / docs-only` が追加されている |
| AC-2 | 直近の完了エントリに `種別` フィールドが付与されている                            |
| AC-3 | 種別定義と記録ルールがドキュメントに記述されている                                |

## 発見元

TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 Phase 12 skill-feedback-report (FB-AWR-001)

## 仕様書

`docs/30-workflows/unassigned-task/TASK-AWR-COMPLETED-LEDGER-VERIFICATION-TYPE-001.md`
