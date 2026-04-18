# TASK-AWR-COMPLETED-LEDGER-VERIFICATION-TYPE-001

## メタ情報

```yaml
issue_number: 2275
```

## メタ情報

| 項目       | 値                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | TASK-AWR-COMPLETED-LEDGER-VERIFICATION-TYPE-001                                                |
| 機能名     | awr-completed-ledger-verification-type                                                         |
| ステータス | open（未着手）                                                                                 |
| 作成日     | 2026-04-18                                                                                     |
| 親タスク   | なし                                                                                           |
| 優先度     | Low                                                                                            |
| タスク種別 | docs/requirements-improvement（要件書改善）                                                    |
| 関連Issue  | #2275                                                                                          |
| ソース     | FB-AWR-001（TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 Phase 12 skill-feedback-report） |

## 概要

`aiworkflow-requirements` スキルが管理する `task-workflow-completed.md`（完了台帳）には、タスク種別（`verification` / `implementation` / `docs-only`）を区別する記録フィールドが存在しない。verification task と実装 task が同一フォーマットで記録されているため、台帳を参照しても実際に実装変更があったかどうかの判断に余計な確認が必要になっている。

完了台帳の記録テンプレートに `種別: verification / implementation / docs-only` フィールドを追加し、台帳の可読性と検索性を向上させる。

## スコープ

### 含む

- `task-workflow-completed.md` の記録テンプレートへの `種別` フィールド追加
- 既存の完了記録エントリへの `種別` フィールド付与（主要なもの）
- `aiworkflow-requirements` スキルの SKILL.md または参照ドキュメントへの反映

### 含まない

- `task-workflow-completed.md` の既存フォーマット全体の変更
- `aiworkflow-requirements` 以外のスキルへの適用
- 台帳のデータベース化や自動化

## 受入基準

| ID   | 基準                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------- |
| AC-1 | `task-workflow-completed.md` テンプレートに `種別: verification / implementation / docs-only` が追加されている |
| AC-2 | 直近の完了エントリ（本タスク含む）に `種別` フィールドが付与されている                                         |
| AC-3 | SKILL.md または参照ドキュメントに種別定義と記録ルールが記述されている                                          |

## 苦戦箇所（発見元コンテキスト）

`TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001` の close-out 作業で判明した課題:

1. **verification task の誤認識**: 本タスクは「実装変更なし・現状確認のみ」の verification task だが、完了台帳に記録すると実装タスクと同一外観になる。後から台帳を参照した際、「このタスクはコードを変更したのか？」という疑問が生じ、タスク詳細を参照するコストが発生した。
2. **解決策**: `種別` フィールドを完了台帳テンプレートに追加することで、一覧参照時に台帳だけで実装の有無を判断できるようにする。
