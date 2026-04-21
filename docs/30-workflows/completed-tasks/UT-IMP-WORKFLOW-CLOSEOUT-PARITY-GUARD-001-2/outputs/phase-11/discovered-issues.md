# Phase 11 発見事項記録（雛形）

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| Phase      | 11                                        |
| 作成日     | 2026-04-19                                |
| ステータス | pending（未実行）                         |

---

## 発見事項一覧

| ID  | 区分             | 概要 | 発生シナリオ | 影響範囲 | 是正要否                           | ステータス |
| --- | ---------------- | ---- | ------------ | -------- | ---------------------------------- | ---------- |
| -   | MAJOR/MINOR/INFO | -    | -            | -        | Phase 9 戻し / 条件付き / 記録のみ | -          |

> 実行時に Phase 11 手動テストで発見した事項を記録する。未実行のため空欄。

---

## 区分基準

| 区分  | 条件                                                       | 対応先                                 |
| ----- | ---------------------------------------------------------- | -------------------------------------- |
| MAJOR | AC 違反 / exit code 誤り / rollback 失敗 / 責務境界違反    | Phase 9（品質保証）へ戻し              |
| MINOR | 表現揺れ / 追加ログの推奨 / `--json` キー命名微調整        | 条件付き PASS、Phase 12 入口までに是正 |
| INFO  | 次タスク候補 / 設計改善メモ / lessons-learned への追記候補 | 記録のみ、lessons-learned へ転記       |

---

## lessons-learned 転記先

- `.claude/skills/task-specification-creator/references/lessons-learned.md` の `L-CLOSEOUT-PARITY-001`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` の mirror 転記

---

## 完了条件

- [ ] MAJOR 発見事項は全て Phase 9 へ戻し済み
- [ ] MINOR 発見事項は是正計画が確定
- [ ] INFO 発見事項は lessons-learned へ転記済み
