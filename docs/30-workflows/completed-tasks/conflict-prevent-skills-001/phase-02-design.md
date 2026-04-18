# Phase 2: 設計

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 2 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

generated file、mirror、log、volatile metadata の4分類に対し、最小の複雑性で運用可能な conflict prevention 設計を確定する。

## 実行タスク

1. merge policy を file category ごとに設計する
2. deterministic regenerate の責務を `generate-index.js` と hook / close-out に割り当てる
3. `.claude` canonical / `.agents` mirror の同期ルールを確定する
4. EVALS / lessons のような high-risk 領域を本 wave と follow-up に切り分ける
5. Phase 4-12 で使う validator matrix を定義する

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| phase template core | `.agents/skills/task-specification-creator/references/phase-template-core.md` | Phase 2 骨格 |
| phase template execution | `.agents/skills/task-specification-creator/references/phase-template-execution.md` | Phase 4-10 接続 |
| phase 12 guide | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | close-out 同期 |
| aiworkflow references | `.agents/skills/aiworkflow-requirements/indexes/resource-map.md` | regenerate / skill structure 起点 |
| git attributes manual | `git help attributes` | merge driver 仕様 |

## 実行手順

### ステップ1: file category ごとの方針決定

| category | 対象例 | 方針 |
| --- | --- | --- |
| generated index | `indexes/*.md`, `indexes/*.json` | custom `keep-ours` + post-merge / explicit regenerate |
| mirror tree | `.agents/skills/**` | custom `keep-ours`、canonical は `.claude` |
| append-only log | `LOGS.md` | `merge=union` 候補、archive policy を併記 |
| volatile metadata | `EVALS.json` | schema は不変、短期は JSON 向け `keep-ours` policy のみ |

### ステップ2: elegant solution の確定

- `union` は append-only markdown だけに限定する
- `keep-ours` は `.gitattributes` だけでは成立しないため、repo bootstrap と確認フローを仕様へ含める
- generated index の diff 縮小は `topic-map.md` の日付など揮発情報を対象にし、行番号索引契約は維持する
- EVALS は schema 変更を入れず、短期は merge policy に留める

### ステップ3: レーン設計

| lane | 担当 | 並列可否 |
| --- | --- | --- |
| Lane A | `.gitattributes`、custom merge driver、hook/check | 並列 |
| Lane B | `generate-index.js`、topic-map deterministic 化 | 並列 |
| Lane C | LOGS / EVALS / Phase 12 close-out / follow-up 判定 | A/B 依存あり |

## 統合テスト連携

- Phase 4: merge simulation、generator snapshot、log merge ケース
- Phase 5: `.claude` 正本変更 → `.agents` mirror parity
- Phase 9: validator / grep / driver registration / regenerate 実測

## 多角的チェック観点（AIが判断）

- 演繹思考: Git 仕様から custom driver 必須条件を導けるか
- 水平思考: `all union` や `all ours` のような単純化がなぜ危険か
- システム思考: regenerate を Phase 5 だけに閉じず hook / Phase 12 まで接続できるか
- 戦略的思考: 即効性の高い対策を先に、consumer 監査必須領域は後ろに置けているか
- 仮説思考: EVALS 変更が必要という仮説を、事実として扱っていないか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-4 | merge policy table 作成 | Lane C |
| ST-5 | validation matrix 作成 | Lane C |
| ST-6 | close-out / follow-up 境界整理 | Lane C |

## 成果物

- `outputs/phase-2/merge-policy-matrix.md`
- `outputs/phase-2/subagent-lane-plan.md`
- `outputs/phase-2/validation-and-regenerate-plan.md`

## 完了条件

- [ ] category ごとの方針が table 化されている
- [ ] custom driver と built-in の役割が分離されている
- [ ] EVALS schema 不変方針が明記されている

## タスク100%実行確認【必須】

- [ ] category 設計を記載した
- [ ] レーン数を 3 以下にした
- [ ] validation path を記載した

## 次Phase

Phase 3 では 30種思考法を使って、過剰設計・前提誤認・依存抜けをレビューする。
