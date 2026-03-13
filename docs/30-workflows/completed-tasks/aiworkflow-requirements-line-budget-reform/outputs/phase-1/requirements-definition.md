# Phase 1 Output: Requirements Definition

## 目的

`aiworkflow-requirements` の non-script over-limit Markdown を、manual docs と generated index に分離したうえで、実行可能な reform task として固定する。

## 背景

- 現行 skill は 154 Markdown / 70123 行で運用されている
- non-script over-limit は 35 件で、manual docs 34 件、generated index 1 件である
- `SKILL.md` は 488 行で対象外であり、今回の病理は entrypoint ではなく ledger / domain spec / generated index に集中している
- `topic-map.md` は `generate-index.js` 生成物のため、script を触らない制約下では manual docs reform と分離しないと破綻する

## 要件

| 区分  | 要件                                                                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| FR-1  | `.claude/skills/aiworkflow-requirements/` 配下の non-script over-limit Markdown 35 件を対象化する                                   |
| FR-2  | 35 件を 34 manual docs と 1 generated index に分離して扱う                                                                          |
| FR-3  | 34 manual docs を F1-F6 の 6 family へ割り当てる                                                                                    |
| FR-4  | 各 family に対し parent index、child shard、history / archive companion の target shape を定義する                                  |
| FR-5  | `.claude` 正本 / `.agents` mirror の同期検証を plan に含める                                                                        |
| FR-6  | `validate-structure.js`、`list-specs.js --stats`、`split-reference.js --analyze`、`generate-index.js`、`wc -l` を検証 path に含める |
| NFR-1 | Phase 1-3 完了前は Phase 4 以降を開始しない                                                                                         |
| NFR-2 | SubAgent 並列数は 3 lane 以下、かつ 3 ファイル以下 / agent に制限する                                                               |
| NFR-3 | script 自体は変更しない                                                                                                             |
| NFR-4 | commit、PR、実タスク実行は開始しない                                                                                                |

## source からの拡張判断

| source                                                  | 元スコープ                                        | 拡張後スコープ                                      | 拡張理由                                                               |
| ------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| 2026-03-12 user request                                 | `aiworkflow-requirements` の 500 行超内容改善     | non-script over-limit 35 件の workflow 化           | task-specification-creator と aiworkflow の両 skill を満たす必要がある |
| `task-ref-quality-requirements-split-001.md`            | `quality-requirements.md` 単独 split              | family-wave reform の 1 要素として吸収              | 単発 split では cross-cutting docs を解消できない                      |
| `UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` | SKILL / quick-reference / resource-map の入口導線 | generated index と discovery 導線の dependency 設計 | entrypoint と generated index を混同しないため                         |
| `spec-guidelines.md` / `spec-splitting-guidelines.md`   | 500/700 行ルール                                  | 全 family に適用される品質基準                      | ルールの局所適用ではなく全体設計へ引き上げる必要がある                 |

## 受入基準との対応

| AC   | requirement | 判定方法                          |
| ---- | ----------- | --------------------------------- |
| AC-1 | FR-1, FR-2  | inventory table と `wc -l`        |
| AC-2 | FR-3, FR-4  | Phase 2 split plan                |
| AC-3 | FR-6        | command matrix                    |
| AC-4 | FR-2, NFR-3 | generated index dependency の明記 |
| AC-5 | NFR-2       | SubAgent lane plan                |
| AC-6 | NFR-1       | artifacts status                  |
| AC-7 | NFR-4       | workflow stop condition           |
