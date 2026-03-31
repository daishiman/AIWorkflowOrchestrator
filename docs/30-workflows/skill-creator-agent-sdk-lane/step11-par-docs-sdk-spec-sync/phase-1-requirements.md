# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 1                                   |
| 機能名 | step-11-par-task-docs-sdk-spec-sync |
| 作成日 | 2026-03-31                          |

## 目的

UT-IMP-SDK-02 と UT-IMP-SDK-04 を統合した docs-only 仕様同期タスクの要件を確定する。current canonical set、完了条件、非対象、検証観点を固定し、Phase 2 以降の設計・実装の前提を定める。

## 実行タスク

- 真の論点を 1 文で固定する（SDK-02 / SDK-04 それぞれ）
- 両タスクの統合理由と対象ファイルの分離を明文化する
- same-wave で同期すべき canonical docs 群を棚卸しする
- docs-only タスクであること（コード変更なし）を AC-10 として明示する
- 未完了表現と pending memo を未完了扱いにする判定基準を明文化する
- follow-up 新設が不要な場合の no-op 根拠を定義する
- 30種の思考法を Phase 1-3 に割り当て、分析結果を以降の Phase が再利用できる形に固定する

## 要件レビュー一次結論

| 項目                 | 結論                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| 真の論点（SDK-02）   | 主問題は実装コード未実装ではなく、current facts が canonical system spec に閉じていないこと |
| 真の論点（SDK-04）   | 主問題は canonical path drift であり、完了証跡と導線が current path を指していないこと      |
| 依存関係・責務境界   | SDK-02 は system spec 3 ファイル、SDK-04 は index/ledger 4 ファイルで対象が完全分離する     |
| 価値とコストの不均衡 | コード追加は不要で、docs 同期と path 正規化の方が再発防止価値が高い                         |
| 改善優先順位         | 1. 更新対象の棚卸し 2. path drift 種別の確定 3. 更新順の固定 4. validator / grep 証跡化     |
| 思考法配分           | 30種の思考法は Phase 1-3 に集約し、Phase 4 以降はその結論だけを消費する                     |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: 高 / 運用性: 未完了表現 0 件を条件化すれば高              |

## 参照資料

| 資料名      | パス                                                                                     | 説明                  |
| ----------- | ---------------------------------------------------------------------------------------- | --------------------- |
| SDK-02 原票 | `../../../completed-tasks/ut-imp-task-sdk-02-system-spec-and-path-sync-001/index.md`     | SDK-02 是正要求の詳細 |
| SDK-04 原票 | `../../../completed-tasks/ut-imp-task-sdk-04-phase12-canonical-path-resync-001/index.md` | SDK-04 是正要求の詳細 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                                   |
| ---------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | TASK-SDK-02/04 の current fact         |
| lessons          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | same-wave / 未完了表現 / parity の教訓 |
| backlog          | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                      | follow-up / backlog の current fact    |

## 受入条件

- [ ] AC-1: current canonical set が SDK-02 / SDK-04 それぞれで明示されている
- [ ] AC-2: `SkillCreatorWorkflowEngine` current owner 化の反映先が特定されている（SDK-02）
- [ ] AC-3: canonical path drift の対象ファイル 4 件が特定されている（SDK-04）
- [ ] AC-4: 両タスクの統合理由が明文化されている
- [ ] AC-5: `更新予定`、`後でやる`、`後続判断待ち`、`仕様策定のみ`、`実行予定`、`保留として記録` を未完了扱いにする判定基準が明示されている
- [ ] AC-6: コード変更（`.ts`、`.tsx` 等）を非対象として固定している
- [ ] AC-7: commit / PR / push を対象外として固定している

## 実行手順

### ステップ1: SDK-02 canonical target を固定する

- system spec 3 ファイルの更新観点を確定する。
- `SkillCreatorWorkflowEngine` の current owner としての扱いを基準値にする。

### ステップ2: SDK-04 canonical target を固定する

- index / ledger 4 ファイルの stale path を棚卸しする。
- completed-tasks 配下の current path を基準値にする。

### ステップ3: 統合前提を固定する

- 対象ファイルが完全分離しており、競合が発生しないことを確認する。
- 作業手順（現状コード確認 → 仕様書更新 → レビュー）が共通であることを明示する。

### ステップ4: acceptance を検証可能にする

- `rg` で消すべき文字列（旧 path、未完了表現）を明記する。
- validator と grep を必須証跡にする。

## 統合テスト連携

- docs-only タスクのため実装コード向け統合テストは追加せず、`outputs/phase-4/test-matrix.md` に定義した grep / validator / index 再生成を統合ゲートとして扱う。
- Phase 1 では AC-1 から AC-7 と検証コマンドの対応を確定し、後続 Phase で同じ判定軸を再利用する。

## 成果物

| 成果物              | パス                                     | 説明                           |
| ------------------- | ---------------------------------------- | ------------------------------ |
| 要件定義書          | `phase-1-requirements.md`                | docs-only 統合タスクの要件固定 |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | drift 種別と更新先の対応表     |

## 完了条件

- [ ] current canonical set が SDK-02 / SDK-04 の 2 軸で定義されている
- [ ] drift 種別が wording / path / parity に分離されている
- [ ] AC-1 から AC-7 が検証可能な文面になっている
- [ ] Phase 2 へ渡す同期対象表が作れる状態である
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の定義
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 2 へ引き継ぐ前提と検証コマンドが固定されている
