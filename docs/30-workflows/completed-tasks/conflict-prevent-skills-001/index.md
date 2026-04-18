# TASK-CONFLICT-PREVENT-001: `.claude/skills` 系コンフリクト防止仕様の再設計

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-CONFLICT-PREVENT-001 |
| タスク種別 | NON_VISUAL / docs-only / spec_created |
| 作成日 | 2026-04-18 |
| ステータス | spec_created |
| 依存タスク | なし |
| 実装対象 | `.claude/skills/` と `.agents/skills/` の競合要因整理、merge policy、再生成運用、close-out 仕様 |

## ユーザー要求の要約

本ブランチで追加された `docs/30-workflows/conflict-prevent-skills-001/` を、`task-specification-creator` と `aiworkflow-requirements` の両方に準拠する形へ改善する。差分を検証し、30種の思考法で過不足と矛盾を洗い出し、過剰設計を除いたエレガントな実行仕様へ再構成する。commit / PR / push は行わない。

## 真の論点

共有 skill 資産のうち、`generated index`、`mirror tree`、`append-only log`、`volatile metadata` を同じ方法で扱おうとしていることが主問題である。競合源ごとの性質を分けずに一律対策を入れると、競合は減っても仕様整合や運用再現性を壊しやすい。

## why now

- 10本並列 worktree 開発で、`.claude/skills/` と `.agents/skills/` に競合が集中している
- 既存仕様書は validator で多数の骨格違反を出しており、改善策以前に workflow 文書が信頼できない
- `.gitattributes`、generator、mirror policy、Phase 12 close-out を同時に設計しないと再発する

## why this way

- generated file は「手マージ」ではなく「keep ours + deterministic regenerate」で扱う
- mirror tree は canonical `.claude` と mirror `.agents` を明確に分離する
- append-only log だけを `union` 候補として扱い、JSON や mirror 全体へ乱用しない
- EVALS は本 task では schema を変えず、短期は JSON 向け merge policy と再生成運用だけを扱う

## スコープ

**含む**

- branch diff 対象 workflow の全面再構成
- `task-specification-creator` 準拠の 13 phase 仕様
- `aiworkflow-requirements` 準拠の canonical root / mirror / regenerate policy
- 30種思考法による多角的レビュー観点の組み込み
- 4条件（矛盾なし・漏れなし・整合性あり・依存関係整合）の明文化

**含まない**

- 実コードの commit / push / PR 作成
- 未監査 consumer を持つ EVALS 仕様の断定変更
- `.agents/skills/` 廃止そのもの

## 受入基準

1. 13 phase すべてが `task-specification-creator` の必須セクションを満たす
2. generated index / mirror / log / volatile metadata の4分類が混同なく定義される
3. `merge=ours` を使う箇所は custom merge driver 登録前提で記述し、Git 組み込み仕様と矛盾しない
4. `.claude` canonical / `.agents` mirror の方針が Phase 2 / 5 / 9 / 12 で一貫する
5. `topic-map.md` の日付など diff 増幅要因に deterministic 対策があり、行番号索引契約は維持される
6. EVALS の schema はこの task で変更しない
7. Phase 13 は user approval 取得まで `blocked` を維持する

## 4条件の初期判定

| 条件 | 現状 | 改善方針 |
| --- | --- | --- |
| 矛盾なし | NG | built-in merge driver 誤認、spec_created と実装済み記述の混在を解消する |
| 漏れなし | NG | 全 phase の必須セクションと artifacts parity を補完する |
| 整合性あり | NG | canonical root / mirror / close-out wording を統一する |
| 依存関係整合 | NG | merge policy、generator、hooks、Phase 12 ledger sync を依存順に並べ直す |

## 30種思考法の適用方針

| グループ | 本タスクでの使い方 |
| --- | --- |
| 論理分析系 | Git 仕様、skill 仕様、現在の workflow 文面の矛盾検出 |
| 構造分解系 | 競合源を generated / mirror / log / metadata に分解 |
| メタ・抽象系 | 「競合防止」と「仕様汚染防止」を分離して再設計 |
| 発想・拡張系 | keep-ours、deterministic regenerate、follow-up 分離の代替案比較 |
| システム系 | Phase 5 実装、Phase 9 検証、Phase 12 close-out の波及確認 |
| 戦略・価値系 | 即効性の高い対策と高リスク変更の切り分け |
| 問題解決系 | why 分析、仮説、論点整理、KJ 法で優先順位づけ |

## 改善対象の再分類

| 区分 | 対象 | 優先度 | 本 wave の方針 |
| --- | --- | --- | --- |
| G1 | generated index (`keywords.json`, `topic-map.md`, `resource-map.md`, `quick-reference.md`) | CRITICAL | merge policy と deterministic regenerate を設計する |
| G2 | mirror tree (`.agents/skills/**`) | CRITICAL | canonical / mirror policy と custom keep-ours driver を設計する |
| G3 | append-only log (`LOGS.md`, archive) | HIGH | `union` 適用条件と archive ルールを設計する |
| G4 | volatile metadata (`EVALS.json`) | HIGH | schema 変更は follow-up、短期は JSON 向け merge policy に留める |

## SubAgent レーン

| レーン | 役割 | 並列可否 |
| --- | --- | --- |
| Lane A | task-specification-creator 準拠監査 | 並列 |
| Lane B | aiworkflow-requirements 抽出監査 | 並列 |
| Lane C | 実装計画の統合、30思考法レビュー、最終整形 | A/B 完了後 |

## Phase 一覧

| Phase | 名称 | ステータス |
| --- | --- | --- |
| 1 | 要件定義 | spec_created |
| 2 | 設計 | spec_created |
| 3 | 設計レビュー | spec_created |
| 4 | テスト作成 | spec_created |
| 5 | 実装 | spec_created |
| 6 | テスト拡充 | spec_created |
| 7 | カバレッジ確認 | spec_created |
| 8 | リファクタリング | spec_created |
| 9 | 品質保証 | spec_created |
| 10 | 最終レビュー | spec_created |
| 11 | 手動テスト | spec_created |
| 12 | ドキュメント更新 | spec_created |
| 13 | PR 作成 | blocked |

## 成果物ナビ

- [phase-01-requirements.md](./phase-01-requirements.md)
- [phase-02-design.md](./phase-02-design.md)
- [phase-03-design-review.md](./phase-03-design-review.md)
- [phase-04-test-creation.md](./phase-04-test-creation.md)
- [phase-05-implementation.md](./phase-05-implementation.md)
- [phase-06-test-expansion.md](./phase-06-test-expansion.md)
- [phase-07-coverage.md](./phase-07-coverage.md)
- [phase-08-refactoring.md](./phase-08-refactoring.md)
- [phase-09-quality-assurance.md](./phase-09-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr.md](./phase-13-pr.md)
- [artifacts.json](./artifacts.json)
- [outputs/artifacts.json](./outputs/artifacts.json)
