# Phase 1 成果物: 仕様抽出マップ（skill 要件 × workflow 対応表）

## 1. skill 要件と本タスク workflow の対応

| skill                      | skill 内での要求                                                                         | 本 workflow での対応                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| aiworkflow-requirements    | references/ 配下に正本追加 + 3 indexes（topic-map / quick-reference / resource-map）更新 | Phase 5 / Phase 12 で `references/logs-archive-policy.md` 正本作成＋3 indexes 反映 |
| task-specification-creator | Phase 12 で中学生レベル概念説明・canonical 6成果物                                       | Phase 12 文書内で Q1-Q3 + 用語表 + 6成果物を outputs/phase-12/ に出力              |
| github-issue-manager       | Issue #2282 の Close 状態維持（既に CLOSED）                                             | Phase 13 PR 本文で `Refs #2282`、再オープンしない                                  |
| skill-creator              | 正本/mirror mirror 対称性                                                                | Phase 5 / 9 / 10 で diff ゼロを検証                                                |
| TASK-CONFLICT-PREVENT-001  | mirror sync 機構を利用する前提                                                           | Phase 3 R-3 → Phase 4 TC-07/08 で実測検証、FAIL なら手動コピーにフォールバック     |

## 2. Issue #2282 要件 7 項目 × Phase 対応

| Req ID | 要件項目               | 確定 Phase | 検証 Phase            |
| ------ | ---------------------- | ---------- | --------------------- |
| R-01   | 閾値（行 / KB / 月次） | Phase 2    | Phase 4 TC-02         |
| R-02   | archive 先パス規則     | Phase 2    | Phase 4 TC-03/05      |
| R-03   | 手順 6 ステップ        | Phase 2    | Phase 4 TC-04         |
| R-04   | mirror 同期            | Phase 2    | Phase 4 TC-07/08      |
| R-05   | topic-map 参照         | Phase 2    | Phase 4 TC-09         |
| R-06   | 見直しサイクル         | Phase 2    | Phase 4 TC-11 (F-004) |
| R-07   | エスカレーション       | Phase 2    | Phase 4 TC-12 (F-005) |

## 3. Phase 3 Findings 予測と引き継ぎ方針

| 予測 Finding | 対応 Phase | 根拠                                                    |
| ------------ | ---------- | ------------------------------------------------------- |
| F-001        | Phase 5    | feb/march legacy と YYYY-MM 新規の共存（命名不一致）    |
| F-002        | Phase 4    | mirror sync が references/ を対象とするかの実測必要     |
| F-003        | Phase 5    | 月次判定のタイミング未確定（月初 or 月末）              |
| F-004        | Phase 5    | 見直し周期 6 か月の次回予定日（2026-10-19）をメタに明記 |
| F-005        | Phase 5    | ポリシー違反時のエスカレーション先を文書化              |

## 4. canonical 成果物マップ（Phase 12 完了条件）

| 成果物                      | パス                                                                       |
| --------------------------- | -------------------------------------------------------------------------- |
| 正本                        | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` |
| mirror                      | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` |
| topic-map 追加              | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              |
| quick-reference 追加        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`        |
| resource-map 追加           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`           |
| Phase 12 canonical 6 成果物 | `outputs/phase-12/*.md`（6 ファイル）                                      |
