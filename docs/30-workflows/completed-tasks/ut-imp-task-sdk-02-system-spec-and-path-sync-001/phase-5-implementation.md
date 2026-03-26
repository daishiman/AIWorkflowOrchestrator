# Phase 5: 実装

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 5                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

system spec、ledger / lessons、workflow local artifacts を安全な順番で編集し、same-wave remediation を実施する。

## 実行タスク

- canonical system spec を更新する
- ledger / lessons / index を更新する
- parent workflow 本文と artifacts を更新する
- `outputs/phase-12/*` を実績文面へ正規化する

## 参照資料

| 資料名       | パス                                                                                    | 説明          |
| ------------ | --------------------------------------------------------------------------------------- | ------------- |
| Phase 2 設計 | `phase-2-design.md`                                                                     | 実装順        |
| test matrix  | `outputs/phase-4/test-matrix.md`                                                        | 実装後検証    |
| 親 workflow  | `../completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md` | path 修正対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                             |
| ---------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | current fact の正本              |
| lessons          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | no-op 根拠と partial update 防止 |

## 実行手順

### ステップ1: canonical docs を編集する

- current owner wording を基準に system spec を更新する。
- completed ledger の `TASK-SDK-02` 記録と矛盾しない文面にする。

### ステップ2: ledger / lessons / index を編集する

- `task-workflow` と `lessons` に再監査事実を記録する。
- `topic-map` と index 導線を再生成する。

### ステップ3: workflow local を編集する

- `index.md`、`phase-*`、`artifacts.json`、`outputs/artifacts.json` の stale path を修正する。
- `outputs/phase-12/*` の未完了表現を実績文へ置換する。

## 統合テスト連携

- Phase 5 では編集順を固定し、更新後に `outputs/phase-4/test-matrix.md` のコマンドをそのまま実行できる状態まで整える。
- コード実装追加は行わず、文書更新の same-wave closure を統合ゲート対象にする。

## 成果物

| 成果物                    | パス                                           | 説明             |
| ------------------------- | ---------------------------------------------- | ---------------- |
| 実装計画                  | `phase-5-implementation.md`                    | 編集順と編集対象 |
| implementation sequencing | `outputs/phase-5/implementation-sequencing.md` | 編集手順詳細     |

## 完了条件

- [ ] canonical docs の更新対象が明記されている
- [ ] ledger / lessons / index の更新対象が明記されている
- [ ] workflow local 4 点同期の対象が明記されている
- [ ] Phase 6 以降の検証へ渡せる
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. canonical / ledger / workflow local の編集順の固定
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 6 以降で再利用する検証導線が固定されている
