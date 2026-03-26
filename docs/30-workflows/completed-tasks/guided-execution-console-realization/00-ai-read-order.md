# Guided Execution Console AI読順ガイド

## 位置づけ

この workflow では、`design-audit-matrix.md` や `ui-ux-realization.md` のような補助資料を `references/` に退避しない。  
理由は、このパックが `AI にディレクトリをそのまま渡して実行してもらう` 運用を前提にしており、pack 全体の前提契約や読順が root で即座に見える方が安全だからである。

つまり、root 直下の補助資料は `参考資料だから奥に置くもの` ではなく、`pack 全体の判断根拠と実行順を支える shared contract` として扱う。
この pack は厳密な dependency graph を運用するためのものではなく、`順番どおりに進めれば最終成果物へ到達できる` ように読む順番と実行順を整えることを目的にする。

## root 配下の役割

| 種別            | ファイル / ディレクトリ           | 役割                                                                  | 読む優先度               |
| --------------- | --------------------------------- | --------------------------------------------------------------------- | ------------------------ |
| 最初の入口      | `00-ai-read-order.md`             | AI 向けの読順、補助資料の立ち位置、親パックへの遡り方を示す           | 最優先                   |
| 親パック概要    | `index.md`                        | 目的、責務分離、実行順、task 一覧の正本                               | 必読                     |
| 実行順整理      | `execution-topology.md`           | 実行順マップとして、親Phase、子task、外部 task の立ち位置と順序を示す | 2周目で読む              |
| 周辺task整理    | `system-alignment-matrix.md`      | 既存実装、未着手 task、先に見るとよい周辺task の対応関係              | 条件付き必読             |
| UI 正本         | `ui-ux-realization.md`            | Guided Execution UI / UX / 文言 / 情報設計の正本                      | UI を触るとき必読        |
| 設計根拠        | `design-audit-matrix.md`          | なぜこの task 分割と命名にしたかの判断根拠                            | 判断理由が必要なとき必読 |
| pack governance | `phase-1-*.md` 〜 `phase-13-*.md` | 親パック全体の gate、完了定義、品質管理                               | gate 確認時に読む        |
| 実行単位        | `tasks/step-*`                    | 実装責務ごとの standalone task root                                   | 着手対象のみ読む         |
| 検証証跡        | `outputs/`                        | 検証結果や summary の置き場                                           | 必要時のみ               |

## 親 workflow ディレクトリを AI に渡す場合の最小読順

1. `00-ai-read-order.md`
2. `index.md`
3. 着手対象 task の `index.md`
4. 着手対象 task の `phase-1-requirements.md` 〜 `phase-3-design-review.md`

次の文書は 2 周目以降に用途に応じて読む。

- `ui-ux-realization.md`
  - UI 文言、画面構成、表示順を変えるとき
- `system-alignment-matrix.md`
  - 他 workflow や未着手 task をどの順で見ればよいか判断するとき
- `design-audit-matrix.md`
  - 設計判断の理由や代替案の不採用理由を確認したいとき
- root `phase-1` 〜 `phase-3`
  - 親パック全体の scope、task 分割、gate を再確認したいとき

## 迷ったらこの実装順だけで進める

実装の主ルートは次の 4 段だけでよい。

1. root `Phase 1-3`
2. `Task01: guided-execution-shell-foundation`
3. `Task02: session-dock-artifact-bridge`
4. `Task03: advanced-console-safety-governance`

他 workflow の task は、次の場合だけ順番へ差し込む。

- Skill Creator を end-to-end で含めたい
  - `w4` → `w5a` → `Task02` → `w5b` → `Task03`
- provider reliability も同時に上げたい
  - `TASK-LLM-MOD-02/03/04` を supporting lane として並走させる
- ledger / canonical 同期まで閉じたい
  - 最後に `TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001`

## 子task ディレクトリだけを AI に渡す場合の最小読順

1. 子task の `index.md`
2. 親パックの `../../00-ai-read-order.md`
3. 親パックの `../../index.md`
4. 子task の `phase-1-requirements.md` 〜 `phase-3-design-review.md`

必要に応じて次を追加する。

- `../../execution-topology.md`
- `../../ui-ux-realization.md`
- `../../system-alignment-matrix.md`
- `../../design-audit-matrix.md`

## 運用ルール

- root 直下の補助資料は `references/` 扱いではなく、AI が最初に見つけられる shared contract として維持する
- 子task を単独で渡す場合でも、親パックの `00-ai-read-order.md` と `index.md` までは必ず遡る
- 最初の1周では `execution-topology.md` と `system-alignment-matrix.md` を必読にしない
- 実装順の正本は `index.md` の `推奨実行順`、2周目以降の補助順は `execution-topology.md`、設計意図の正本は `ui-ux-realization.md` と `design-audit-matrix.md` とする
