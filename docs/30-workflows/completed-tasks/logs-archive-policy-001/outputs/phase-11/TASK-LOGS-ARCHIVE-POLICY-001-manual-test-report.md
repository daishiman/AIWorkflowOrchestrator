# TASK-LOGS-ARCHIVE-POLICY-001 Manual Test Report

## メタ情報

| 項目                | 内容                         |
| ------------------- | ---------------------------- |
| タスクID            | TASK-LOGS-ARCHIVE-POLICY-001 |
| 実行日              | 2026-04-19                   |
| taskType            | docs-only / NON_VISUAL       |
| implementation_mode | verify_existing              |
| 判定                | PASS                         |

## NON_VISUAL 宣言

UI/UX変更なしのため Phase 11 スクリーンショット不要。

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`
- `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`
- `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`

## 実施結果

### 1. 正本 / mirror / index 存在確認

| 観点            | 結果                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| 正本ポリシー    | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` 存在確認 |
| mirror ポリシー | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` 存在確認 |
| mirror 差分     | `diff` 差分ゼロ                                                                     |
| topic-map 参照  | `logs-archive-policy.md` エントリ存在確認                                           |

### 2. 閾値判定シミュレーション

| ケース | 条件                    | 期待判定       | 実判定 |
| ------ | ----------------------- | -------------- | ------ |
| A      | 350 行 / 20 KB          | archive 対象   | 一致   |
| B      | 200 行 / 35 KB          | archive 対象   | 一致   |
| C      | 150 行 / 15 KB / 前月分 | archive 対象   | 一致   |
| D      | 50 行 / 3 KB            | archive 対象外 | 一致   |

### 3. 命名規則・配置先確認

| 観点        | 結果                                                                |
| ----------- | ------------------------------------------------------------------- | --------------------------- |
| 命名規則    | `logs-archive-YYYY-MM.md` を採用                                    |
| 正規表現    | `^logs-archive-\\d{4}-(0[1-9]                                       | 1[0-2])\\.md$` を文書に明記 |
| 配置先      | 新規月次 archive は `references/` 配下を canonical とする方針へ統一 |
| legacy 共存 | `logs-archive-2026-feb.md` / `logs-archive-2026-march.md` は残置    |

### 4. エスカレーション・運用確認

| 観点                | 結果                                                     |
| ------------------- | -------------------------------------------------------- |
| 判定タイミング      | 毎月初の第1営業日に前月分を評価、3営業日以内に実行で統一 |
| 一次対応            | 管理者または担当者が実施                                 |
| mirror 不一致時対応 | 手動同期 + `diff` 再確認を明記                           |
| 失敗時手順          | 抽出ミス / 差分残存時の再実行条件を明記                  |
| 見直しサイクル      | 6か月ごと、次回見直し日を文書冒頭に記載                  |

## 結論

Phase 11 で要求されていた運用シミュレーション観点は記録済みであり、NON_VISUAL タスクとして必要な代替証跡も揃っている。Phase 12 close-out の根拠として使用可能。
