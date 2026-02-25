# Phase 4 テストケース一覧

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-B

## 正常系

- TC-001: `verify-unassigned-links.js` 参照切れ0件
- TC-002: `generate-index.js` 再生成成功
- TC-003: `task-workflow.md` 参照先実在
- TC-004: `quick_validate.py` 2スキル有効
- TC-005: 3点同期 grep 突合コマンド正常
- TC-006: baseline/current 分離判定（current 0件）

## 異常系

- TC-001-E1: 完了済みリンク残存時に missing を検知
- TC-005-E1: LOGS 片側更新時に不整合検知

## 境界値

- TC-005-B1: 残課題テーブル空でも検証コマンドが正常終了

## テストケース詳細（要約）

| TC-ID     | 区分 | 主コマンド                            | 期待結果             |
| --------- | ---- | ------------------------------------- | -------------------- | -------------- |
| TC-001    | 正常 | `node .../verify-unassigned-links.js` | `ALL_LINKS_EXIST`    |
| TC-001-E1 | 異常 | 同上                                  | missing出力/非0終了  |
| TC-002    | 正常 | `node .../generate-index.js`          | 再生成成功           |
| TC-003    | 正常 | `grep -oP ...                         | test -f`             | `MISSING:` 0件 |
| TC-004    | 正常 | `python3 .../quick_validate.py`       | `Skill is valid!`    |
| TC-005    | 正常 | `grep -c TASK_ID`                     | 5ファイルで集計      |
| TC-005-E1 | 異常 | `grep -c TASK_ID`                     | 片側0件を検知        |
| TC-005-B1 | 境界 | `verify-unassigned-links.js`          | 参照切れなし         |
| TC-006    | 正常 | `audit + detect`                      | baseline/current分離 |
