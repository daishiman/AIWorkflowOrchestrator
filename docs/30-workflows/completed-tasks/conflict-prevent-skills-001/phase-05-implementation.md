# Phase 5: 実装

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 5 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

競合防止の中核となる `.gitattributes`、custom merge driver bootstrap、deterministic generator 変更、warning/check を実装する。

## 実行タスク

1. `.gitattributes` に category 別 policy を追加する
2. `keep-ours` custom merge driver の登録スクリプトを作成または更新する
3. `session-init.sh` などの warning 導線へ driver 未設定チェックを入れる
4. `generate-index.js` から `topic-map.md` の日付依存を除去し、行番号索引契約は維持する
5. `LOGS.md` archive policy を適用する
6. EVALS は schema を変えず、JSON 向け merge policy のみ実装する

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| phase execution template | `.agents/skills/task-specification-creator/references/phase-template-execution.md` | Phase 5 骨格 |
| session init hook | `.claude/hooks/session-init.sh` | warning 導線 |
| aiworkflow generator | `.agents/skills/aiworkflow-requirements/scripts/generate-index.js` | deterministic 化対象 |

## 実行手順

### ステップ1: merge policy 実装

- generated index: custom `keep-ours`
- mirror tree: custom `keep-ours`
- append-only log: `merge=union`
- EVALS: schema 不変のまま JSON 向け `keep-ours` policy を適用する

### ステップ2: bootstrap と警告導線

- repo 内スクリプトで `merge.keep-ours.driver = true` を設定する
- session start で未設定なら warn する
- hook / README / implementation guide で再現手順を同期する

### ステップ3: generator deterministic 化

- `topic-map.md` から日付ヘッダを削除する
- 行番号索引契約は維持する
- regenerate 実行後の差分が安定することを確認する

## 統合テスト連携

- Phase 4 の TC-4-01〜05 を Phase 5 で RED/GREEN 管理する

## 多角的チェック観点（AIが判断）

- 演繹思考: 実装内容が Phase 2 設計から逸脱していないか
- 逆説思考: 自動化を増やし過ぎて再現手順が見えなくなっていないか
- 因果関係分析: driver 未登録が PR merge でどう失敗するかを trace できるか
- 価値提案思考: 実装コストに対して衝突削減の効果が高い順に着手しているか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-13 | `.gitattributes` と driver setup | Lane A |
| ST-14 | generator deterministic 化 | Lane B |
| ST-15 | LOGS / EVALS / warning flow | Lane C |

## 成果物

- `outputs/phase-5/implementation-log.md`
- `outputs/phase-5/changed-files-summary.md`
- `outputs/phase-5/consumer-audit-decision.md`

## 完了条件

- [ ] `.gitattributes` policy が実装されている
- [ ] custom driver の再現手順が定義されている
- [ ] `topic-map.md` の日付依存が除去されている
- [ ] EVALS は schema 不変で扱われている

## タスク100%実行確認【必須】

- [ ] policy 実装項目を列挙した
- [ ] bootstrap / warning / regenerate を含めた
- [ ] 条件付き実装の扱いを記載した

## 次Phase

Phase 6 では edge case、回帰、consumer audit の追加検証を行う。
