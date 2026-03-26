# Guided Execution Console Realization 仕様書パック

## ユーザーからの元の指示

```text
ターミナルをアプリ上で開きつつ、一般ユーザーが直感的に触れるようなUI/UXへ整えたい。
Apple のデザイナー / デザインエンジニア視点で、責務を分離した形のタスク仕様書を作成してほしい。
docs/30-workflows/ 配下には親ディレクトリを1つだけ作り、その配下に責務ごとのディレクトリタスク仕様書を階層構造で作成する。
```

## 概要

本パックは、既存の `terminal handoff` を一般ユーザー向けの `Guided Execution` へ再構成するための spec-only workflow である。

主語は `terminal` ではなく `AI が何をするか` に置く。front UI は `実行コンソール` を中心にし、raw terminal は `高度な表示` に退避する。これにより、初心者には安心感と一貫性を、上級者には詳細確認手段を提供する。

## 目的

- 一般ユーザーが shell 知識なしで AI 実行を理解できる情報設計を定義する
- `API で実行` と `端末で続ける` を同格レーンとして整理する
- App Shell / Chat / Workspace / Skill Creator の入口を統一し、no-op CTA と silent fallback を除去する
- session dock、transcript、artifact summary、manual share を一つの実行体験へ統合する
- no auto-send、AI 開示、外部送信開示、consumer auth 非流用などの safety / compliance を UI と契約で固定する

## AI にディレクトリを渡すときの入口

この pack は、`design-audit-matrix.md` や `ui-ux-realization.md` のような補助資料を root 直下へ残す。  
理由は、AI に親ディレクトリまたは子task ディレクトリをそのまま渡す運用で、pack 全体の読順と shared contract がすぐ見える方が安全だからである。

最初の入口は [00-ai-read-order.md](./00-ai-read-order.md) とし、補助資料の立ち位置と最小読順をそこで固定する。

## 最初の1周

最初の1周は、次の 4 ステップで十分である。

1. [00-ai-read-order.md](./00-ai-read-order.md)
2. この `index.md`
3. 着手対象 task の `index.md`
4. 着手対象 task の `phase-1-requirements.md` 〜 `phase-3-design-review.md`

`execution-topology.md` と `system-alignment-matrix.md` は、周辺task まで含めて見通したい 2 周目以降に読む。

## 追加成果物

| 成果物         | パス                           | 用途                                                              |
| -------------- | ------------------------------ | ----------------------------------------------------------------- |
| AI読順ガイド   | `00-ai-read-order.md`          | AI にディレクトリを渡したときの入口と読順を固定する               |
| root artifacts | `artifacts.json`               | parent workflow の phase 状態、受入基準、順番管理の骨格を固定する |
| 親パック index | `index.md`                     | 全体方針、実行順、責務分離、task 一覧を固定する                   |
| Phase 1        | `phase-1-requirements.md`      | root 要件、対象範囲、受入条件を固定する                           |
| Phase 2        | `phase-2-design.md`            | task 分割、実行順、設計境界を固定する                             |
| Phase 3        | `phase-3-design-review.md`     | Phase 4 以降の task 仕様書に進める gate を固定する                |
| Phase 4        | `phase-4-test-creation.md`     | task 間の test strategy と coverage 連携を固定する                |
| Phase 5        | `phase-5-implementation.md`    | 実装着手順と shared contract 更新順を固定する                     |
| Phase 6        | `phase-6-test-expansion.md`    | cross-task regression と edge case を固定する                     |
| Phase 7        | `phase-7-coverage-check.md`    | root acceptance criteria と task 証跡の対応を固定する             |
| Phase 8        | `phase-8-refactoring.md`       | 構造簡素化と命名正規化の方針を固定する                            |
| Phase 9        | `phase-9-quality-assurance.md` | spec 一貫性とリスクの最終棚卸しを固定する                         |
| Phase 10       | `phase-10-final-review.md`     | 実装準備完了の最終 gate を固定する                                |
| Phase 11       | `phase-11-manual-test.md`      | 人手レビューと walkthrough 観点を固定する                         |
| Phase 12       | `phase-12-documentation.md`    | pack documentation と unassigned task 棚卸しを固定する            |
| Phase 13       | `phase-13-pr-creation.md`      | commit/PR 禁止前提の PR preparation を固定する                    |
| UI/UX 正本     | `ui-ux-realization.md`         | Guided Execution の UI 契約を固定する                             |
| 監査マトリクス | `design-audit-matrix.md`       | 30思考法を束ねた設計判断の根拠を固定する                          |
| 実行順マップ   | `execution-topology.md`        | 親Phase / 子task / 外部 task の立ち位置と順序を固定する           |
| 整合マトリクス | `system-alignment-matrix.md`   | 現行実装と未着手 task 群との親和性・進め方を整理する              |

## 方針

| 項目       | 方針                                         | 理由                                             |
| ---------- | -------------------------------------------- | ------------------------------------------------ |
| front 名称 | `実行コンソール` を primary label にする     | `terminal` は一般ユーザーに心理的抵抗が強いため  |
| 入口       | `openExecutionConsole()` に集約する          | surface ごとの drift を防ぐため                  |
| 表示順     | `目的 → 実行 → 結果 → 詳細` を守る           | Apple 的な progressive disclosure を徹底するため |
| 主役       | Action Card / Timeline / Artifact Summary    | ログや shell を主役にしないため                  |
| 詳細       | raw terminal は `高度な表示` のみで露出      | 初心者導線を壊さないため                         |
| safety     | no auto-send / manual share / approval sheet | Anthropic 規約と manual boundary を守るため      |

## root フェーズ一覧

| Phase | 名称             | 仕様書                                                         | ステータス                        |
| ----- | ---------------- | -------------------------------------------------------------- | --------------------------------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | complete                          |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | complete                          |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | complete                          |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | complete                          |
| 5     | 実装計画         | [phase-5-implementation.md](./phase-5-implementation.md)       | complete                          |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | complete                          |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | complete                          |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | complete                          |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | complete                          |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | complete                          |
| 11    | 手動テスト検証   | [phase-11-manual-test.md](./phase-11-manual-test.md)           | complete                          |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | complete                          |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked_awaiting_user_instruction |

## 親Phaseの立ち位置

親ディレクトリ直下の Phase 1-13 は、`実装タスク` ではなく `親パックを成立させるためのオーケストレーションPhase` である。  
ここで行うのは、scope 固定、責務分解、推奨実行順整理、test/QA/documentation の gate 定義であり、実際の責務実装は配下の task ディレクトリで扱う。

整理の要点は次のとおり。

| 種別                   | 実体                                          | 役割                                          | 実行単位                   |
| ---------------------- | --------------------------------------------- | --------------------------------------------- | -------------------------- |
| 親Phase                | root `phase-1`〜`phase-13`                    | パック全体の gate、実行順、完了定義を固定する | `pack governance`          |
| 子task                 | `tasks/step-01`〜`step-03`                    | 実装責務ごとの standalone task root           | `task execution unit`      |
| 外部 task              | 他 workflow / modernization / governance task | 前後で参照・補完すると進めやすい周辺task      | `cross-workflow reference` |
| legacy phase-only pack | `skill-creator-llm-integration/w3b`〜`w5b`    | 旧 wave の設計メモ群。単独 task root ではない | `reference only`           |

詳細は実行順マップとしての [execution-topology.md](./execution-topology.md) を参照。

## 責務分離

| lane            | task                                            | ディレクトリ                                                   | 責務                                                                      |
| --------------- | ----------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Foundation lane | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001  | `tasks/step-01-seq-task-01-guided-execution-shell-foundation`  | front 名称、route、shared launcher、mainline entry の正規化               |
| Session lane    | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001       | `tasks/step-02-seq-task-02-session-dock-artifact-bridge`       | session dock、transcript persistence、artifact-first result、manual share |
| Safety lane     | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 | `tasks/step-03-seq-task-03-advanced-console-safety-governance` | advanced console、approval、AI 開示、manual boundary、compliance guard    |

## 推奨実行順

```text
root Phase 1-3 -> Task01 -> Task02 -> Task03
```

| 順番 | 対象           | この順番にする理由                                                                    |
| ---- | -------------- | ------------------------------------------------------------------------------------- |
| 1    | root Phase 1-3 | pack 全体の目的、分割、進め方を先に固定するため                                       |
| 2    | Task01         | front vocabulary と shared action を先に固定するため                                  |
| 3    | Task02         | 入口・route・surface label が決まってから dock / transcript / artifact をまとめるため |
| 4    | Task03         | safety / disclosure / advanced layer を最後に仕上げるため                             |

## 読む順番と実装順

このパックは `読む順番` と `実装順` を分けて考える。

| 観点     | 順番                                                                                                                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 読む順番 | `00-ai-read-order` → `index` → 着手対象 task `index` → 着手対象 task `Phase 1-3` → 必要に応じて `execution-topology` / `system-alignment-matrix` / `ui-ux-realization` / `design-audit-matrix` / root Phase 1-3 |
| 実装順   | `Task01` → `Task02` → `Task03` を基本軸にし、必要なときだけ Skill Creator lane と provider / governance lane を前後に差し込む                                                                                   |

AI へ渡すときの最小読順は [00-ai-read-order.md](./00-ai-read-order.md)、外部 task を含めた推奨順は実行順マップとしての [execution-topology.md](./execution-topology.md)、現行実装との差分は [system-alignment-matrix.md](./system-alignment-matrix.md) に整理している。

## 最短進行ルート

目的に到達するための最短ルートは、まず core route を通し、その後に必要な周辺task を差し込む考え方にする。

| ルート                   | 順番                                                               | 使いどころ                                             |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------ |
| core route               | `root Phase 1-3 → Task01 → Task02 → Task03`                        | 実行コンソールの基本体験を先に閉じたいとき             |
| Skill Creator 拡張 route | `root Phase 1-3 → Task01 → w4 → w5a → Task02 → w5b → Task03 → w3b` | Skill Creator を含めた end-to-end 体験まで通したいとき |
| reliability 補強 route   | `core route` の前後で `TASK-LLM-MOD-02/03/04` を追加               | `APIで実行` の信頼性を先に上げたいとき                 |
| governance close route   | すべての最後に `TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001`   | state / ledger / 正本同期を閉じるとき                  |

## システム仕様参照

| 参照資料                  | パス                                                                                                            | 用途                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| canonical workflow        | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | runtime lane と manual boundary の正本               |
| navigation                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                         | `ViewType` / 画面導線 / render view の正本           |
| agent execution core      | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`                               | handoff card / transcript / dock の正本              |
| state management core     | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                               | renderer state / selector / surface ownership の正本 |
| IPC core                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | Main-Renderer IPC 契約の正本                         |
| Electron security core    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                               | secret 非露出、auto-send 禁止の正本                  |
| existing parent UX        | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`                        | terminal-only / handoff / guidance-only の既存語彙   |
| existing unassigned tasks | `docs/30-workflows/unassigned-task/`                                                                            | 既存 GAP を再編対象として参照する                    |

## 完了定義

| 状態                   | 意味                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `spec_created`         | task spec 一式が揃い、受入条件と実行順が定義された状態              |
| `implementation_ready` | 各 task の Phase 1-3 gate が閉じ、実装者が Phase 4 以降へ進める状態 |
| `completed`            | 実装、証跡、Phase 12 同期まで閉じた状態                             |

## 注意事項

- 本パックは仕様書作成のみを対象とし、実装・コミット・PR は行わない
- `claude.ai` consumer 認証をアプリに抱え込む構成は採用しない
- `terminal` は front の主役にしない。必要な人だけが `高度な表示` で raw terminal を開く
- transcript は自動で chat 化せず、手動共有のみを許可する
