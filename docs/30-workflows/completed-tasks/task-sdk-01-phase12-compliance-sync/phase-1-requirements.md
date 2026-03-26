# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 1                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

TASK-SDK-01 の Phase 12 是正 task に必要な対象範囲、禁止事項、受入基準を固定する。

## 実行タスク

- 要件抽出: unassigned-task 指示書と親 workflow の差分から機能要件を抽出する
- スコープ固定: 親 workflow 是正、ledger sync、domain spec sync、未タスク canonical path の境界を明文化する
- 受入基準定義: Phase 4 以降が同じ順序で実行できる判定軸を定義する

## 参照資料

| 資料名            | パス                                                                                                           | 説明                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 元 task 指示書    | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md`        | follow-up 要件の正本                           |
| 親 workflow index | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/index.md`                  | 4点同期対象の 1 つ                             |
| 親 Phase 12       | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/phase-12-documentation.md` | 既存 close-out 手順                            |
| completed ledger  | `../../../.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                        | follow-up 記録済み箇所                         |
| backlog           | `../../../.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                          | canonical path 登録先                          |
| lessons           | `../../../.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`     | Phase 12 再発防止                              |
| Phase 12 guide    | `../../../.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                | 必須成果物と wording ルール                    |
| Step workflow     | `../../../.claude/skills/task-specification-creator/references/spec-update-workflow.md`                        | Step 1 と Step 2 の判断軸                      |
| manifest contract | `../../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`           | `WorkflowManifest*` と `ManifestLoader` の正本 |

## P50チェック: 既実装状態の調査

```bash
git log --oneline -20 -- docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation
rg -n "Phase 12|implementation-guide|system-spec-update-summary|documentation-changelog|phase12-task-spec-compliance-check" docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation
rg -n "TASK-SDK-01|task-imp-task-sdk-01-phase12-compliance-sync-001" .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md
```

確認結果:

- 親 workflow は `completed-tasks` 配下に存在し、Phase 12 close-out まで記録済み
- `task-workflow-completed.md` には follow-up 名が記録済み
- Phase 12 是正 task の execution workflow は未作成

## 要件整理

### 機能要件

| ID   | 要件                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------- |
| FR-1 | 4点同期対象と本文証跡の差分を列挙できる                                                                  |
| FR-2 | `implementation-guide.md` の Part 1 / Part 2 要件を validator 観点で検証できる                           |
| FR-3 | `system-spec-update-summary.md` と `documentation-changelog.md` に Step 1-A〜1-C / Step 2 の証跡を残せる |
| FR-4 | `task-workflow-backlog.md` と `task-workflow-completed.md`、lessons のリンク整合を保てる                 |
| FR-5 | `docs/30-workflows/unassigned-task/` の canonical path と execution workflow の関係を説明できる          |

### 非機能要件

| ID    | 要件                                                |
| ----- | --------------------------------------------------- |
| NFR-1 | commit、PR、push を行わない                         |
| NFR-2 | domain spec の no-op は理由付きで記録する           |
| NFR-3 | repo 既存 baseline 違反と今回差分を分離して記録する |

## スコープ

### 含む

- 親 workflow の Phase 12 成果物是正
- 4点同期と validator 実行順の定義
- backlog / completed ledger / lessons / topic-map 再生成
- `ManifestLoader` の参照整合 / cache hardening
- `packages/shared` の manifest cache contract 更新

### 含まない

- TASK-SDK-02 以降の runtime 実装
- コミット、PR 作成、push

## 受入基準

| ID   | 基準                                                                                  |
| ---- | ------------------------------------------------------------------------------------- |
| AC-1 | 是正対象ファイルと確認対象ファイルが file list で固定されている                       |
| AC-2 | Step 1-A〜1-C と Step 2 の順番と更新先が明記されている                                |
| AC-3 | `task-workflow-completed.md` の follow-up 行と backlog の path が接続されている       |
| AC-4 | `currentViolations=0` を判定基準にした unassigned-task 監査が workflow に含まれている |
| AC-5 | Phase 13 が `blocked_awaiting_user_instruction` のまま維持される                      |

## 実行手順

### ステップ1: 対象 inventory を固定する

親 workflow の Phase 12 文書、ledger、backlog、lessons、domain spec を一覧化し、是正対象と確認対象を分ける。

### ステップ2: 受入基準を Phase 実行順へ変換する

4点同期、Step 1、Step 2、validator、manual review、Phase 13 blocked の順序を実行フローへ落とす。

### ステップ3: Phase 2 へ渡す設計 input を確定する

変更面、lane、command suite、戻り条件を設計可能な粒度で整理する。

## 統合テスト連携

| 観点              | 内容                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| status parity     | `index.md` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` の同値確認 |
| document evidence | `implementation-guide.md` と Step 1 / Step 2 summary の対応確認                                   |
| ledger sync       | backlog / completed ledger / lessons の相互リンク確認                                             |
| validator         | `verify-all-specs`、`validate-phase-output`、`audit-unassigned-tasks` の実行結果確認              |

## 多角的チェック観点

| 観点       | この Phase で確認する内容                                                                  |
| ---------- | ------------------------------------------------------------------------------------------ |
| 演繹思考   | Step 1 と Step 2 を混同していないか                                                        |
| 因果関係   | completed ledger の記録だけで false complete が起きる経路を切れているか                    |
| 戦略的思考 | close-out 証跡是正を主対象に保ちつつ、最小の code hardening でユーザー要求を満たしているか |

## 30種思考法の適用マップ

| カテゴリ     | 思考法                                                                    | この workflow での使いどころ                                                                             |
| ------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考 / 演繹思考 / 帰納的思考 / アブダクション / 垂直思考            | close-out 完了主張と現物差分の矛盾、Step 1/2 の結論、既存運用からの例外仮説を検証する                    |
| 構造分解系   | 要素分解 / MECE / 2軸思考 / プロセス思考                                  | workflow 本体、Phase 12 outputs、ledger、index を漏れなく分割し、更新順を固定する                        |
| メタ・抽象系 | メタ思考 / 抽象化思考 / ダブル・ループ思考                                | 「close-out をどう証明するか」という前提自体を見直し、単なるファイル存在確認から証跡密度へ評価軸を上げる |
| 発想・拡張系 | ブレインストーミング / 水平思考 / 逆説思考 / 類推思考 / if思考 / 素人思考 | 親 workflow 追記のみ、follow-up workflow 分離、task 単票のみの代替案を比較し、最も誤解が少ない導線を選ぶ |
| システム系   | システム思考 / 因果関係分析 / 因果ループ                                  | completed ledger、backlog、index 再生成、validator の相互依存と false positive 再発ループを断つ          |
| 戦略・価値系 | トレードオン思考 / プラスサム思考 / 価値提案思考 / 戦略的思考             | close-out 是正を軸にしつつ、manifest hardening まで同時に閉じる                                          |
| 問題解決系   | why思考 / 改善思考 / 仮説思考 / 論点思考 / KJ法                           | 真の論点を「実装不足」ではなく「close-out 証跡ドリフト」に固定し、修正対象を収束させる                   |

## サブタスク管理

1. 元 task 指示書の要件抽出
2. 親 workflow と aiworkflow 正本の対象棚卸し
3. スコープと受入基準の固定
4. Phase 2 へ渡す inputs の整理

## 成果物

| 成果物              | パス                                         | 説明                         |
| ------------------- | -------------------------------------------- | ---------------------------- |
| 要件定義書          | `outputs/phase-1/requirements-definition.md` | FR / NFR / AC の確定         |
| スコープ定義        | `outputs/phase-1/scope-definition.md`        | 含む / 含まないの固定        |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md`     | system spec と task の対応表 |

## 完了条件

- [ ] FR-1 から FR-5 が表形式で定義されている
- [ ] NFR-1 から NFR-3 が実行制約として記録されている
- [ ] AC-1 から AC-5 が検証可能な形で列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 元 task 指示書と親 workflow を確認した
- [ ] aiworkflow 正本の対象ファイルを確認した
- [ ] 受入基準を定義した
- [ ] Phase 2 へ渡す input を整理した

## 次のPhase

Phase 2: 設計
