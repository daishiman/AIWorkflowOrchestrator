# Phase 6 検証カバレッジレポート

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 実施日: 2026-02-25
- 担当SubAgent: SubAgent-B（検証実行）, SubAgent-A（結果記録）

## 実行結果

| TC-ID  | シナリオ         | 実行コマンド                                                                                             | 結果 | 実測                                                     |
| ------ | ---------------- | -------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------- |
| TC-001 | VS-001           | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                      | PASS | `total: 90, existing: 90, missing: 0`, `ALL_LINKS_EXIST` |
| TC-002 | VS-002           | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                  | PASS | 再生成成功（topic-map/keywords更新）                     |
| TC-003 | VS-003           | `verify-unassigned-links.js` の参照実在検証結果を代替利用                                                | PASS | missing 0件                                              |
| TC-004 | VS-004           | `python3 .../quick_validate.py .claude/skills/aiworkflow-requirements` / `...task-specification-creator` | PASS | 両方 `Skill is valid!`                                   |
| TC-005 | VS-005           | `grep -c "UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001" <5 files>`                                          | PASS | 5,2,1,4,1（5ファイルすべて1件以上）                      |
| TC-006 | baseline/current | `audit-unassigned-tasks.js` + `detect-unassigned-tasks.js --scan ...`                                    | PASS | baseline 78件, current 0件                               |

## 補足

- `task-specification-creator/scripts/generate-index.js` は `--workflow` 必須のため、
  `node .../generate-index.js --workflow docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001 --regenerate` で実行した。
