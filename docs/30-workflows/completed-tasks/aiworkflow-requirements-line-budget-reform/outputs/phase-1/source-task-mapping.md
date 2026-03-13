# Phase 1 Output: Source Task Mapping

## source 一覧

| source                                                  | 種別           | 元の責務                                                                             | 今回抽出した requirement                                            | workflow への反映                |
| ------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------- |
| 2026-03-12 user request                                 | direct request | `aiworkflow-requirements` の 500 行超内容改善、script 除外、SubAgent 分離、spec only | non-script over-limit 全件の inventory、3 lane 上限、commit/PR 禁止 | index、Phase 1-3 gate、lane plan |
| `task-ref-quality-requirements-split-001.md`            | 既存未タスク   | `quality-requirements.md` 単独 split                                                 | 単発 split を family reform に吸収する                              | F2 rulebook family               |
| `UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` | 既存未タスク   | SKILL / index / validator の入口導線整合                                             | discovery 導線と generated index dependency を分離する              | G0 と discovery rule に反映      |
| `spec-guidelines.md`                                    | 正本仕様       | 500/700 行ルール、命名規則                                                           | manual docs は 500 行以下へ収める                                   | AC-3、validation matrix          |
| `spec-splitting-guidelines.md`                          | 正本仕様       | family 別 split パターン、generate-index 更新条件                                    | family-first topology を採用する                                    | Phase 2 split plan               |
| `agents/validate-spec.md`                               | 正本仕様       | validate-structure の品質観点                                                        | `references/` 監査と index 監査の gap を把握する                    | topic-map 用の別 `wc -l` 追加    |
| `agents/update-spec.md`                                 | 正本仕様       | topic-map は `generate-index.js` で更新                                              | generated index を hand-edit 対象にしない                           | G0 blocked dependency            |

## scope 再定義

| 観点               | 旧理解                        | 新理解                                                          |
| ------------------ | ----------------------------- | --------------------------------------------------------------- |
| 対象粒度           | 個別ファイル split の寄せ集め | `aiworkflow-requirements` 全体の line budget reform             |
| 問題の本質         | 数ファイルの長文化            | ledger / rulebook / domain spec / generated index の責務混線    |
| entrypoint         | SKILL を主対象にする発想      | SKILL は対象外、index / family docs が主対象                    |
| generated artifact | inventory 外扱いになりやすい  | `topic-map.md` を明示 inventory 化し、blocked dependency にする |

## 追加で分かったこと

1. `validate-structure.js` は `references/` over-limit を検出するが、`indexes/topic-map.md` の line budget を quality gate としては担保しない。
2. `topic-map.md` は `generate-index.js` の生成物なので、script 変更なしでの持続的 sharding は設計上無理がある。
3. よって今回の workflow は「manual docs 34 件の reform」と「generated index 1 件の blocked dependency 管理」を同時に扱う構成が最も整合的である。
