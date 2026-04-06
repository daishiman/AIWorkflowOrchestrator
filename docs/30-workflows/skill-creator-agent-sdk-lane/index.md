# Skill Creator Agent SDK Lane

## この階層の役割

このディレクトリは、`skill-creator` を動的に読み取り、ユーザーとの対話を通じてスキルを量産する機能の仕様書パックをまとめる入口である。

トップ直下には、実行タスクと補助資料だけを置く。

## この lane の共通前提

- `skill-creator` は単一の固定ディレクトリに存在するとは仮定しない
- repo 同梱、ユーザーホーム配下、環境変数指定、workflow/manifest が指す外部ディレクトリなど、複数候補 root を扱える前提で設計する
- resource 読み込みは固定相対パスではなく、manifest resource descriptor、candidate root、source provenance を使って解決する
- file / directory 構成差分があっても silent fallback せず、解決結果と degrade 理由を追跡できるようにする

## 現在の成熟度

この階層は「草案」を含むが、`root-workflow-pack/` と child task 分解は実装前提として固定済みである。

- 背景、制約、設計仮説の正本は `requirements-draft.md`
- 依存順、gate、task topology の正本は `root-workflow-pack/`
- 実装者向けの読順と着手判断は `executor-guide.md`

## 文書ロール

| 文書                          | 主な読者               | ここで固定するもの                          | ここで固定しないもの |
| ----------------------------- | ---------------------- | ------------------------------------------- | -------------------- |
| `requirements-draft.md`       | 企画・設計レビュー担当 | 背景、制約、設計仮説の境界                  | 実装順、PR 分割      |
| `root-workflow-pack/index.md` | 仕様設計者、実装リード | 依存順、gate、task topology                 | 個別 task の実装詳細 |
| `executor-guide.md`           | 実装者                 | 読順、着手判断、変更面                      | 依存順そのものの正本 |
| `step-*/index.md`             | task 担当者            | task ごとの scope / non-scope / quick guide | 他 task の最終責務   |

- [requirements-draft.md](./requirements-draft.md)
  - 実装前の認識合わせ用の草案
- [executor-guide.md](./executor-guide.md)
  - 実装者向けの読み順、task 選定、変更面の早見表
- [root-workflow-pack/index.md](./root-workflow-pack/index.md)
  - 親 workflow 全体の Phase 1-13
  - 実装タスクではなく、全体方針と gate を定義する親仕様

## 実装タスク一覧

| タスクID    | ディレクトリ                                                                  | パターン | 責務                                                                          |
| ----------- | ----------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| TASK-SDK-01 | `step-01-seq-task-01-manifest-contract-foundation`                            | seq      | manifest 契約と動的追従境界の定義                                             |
| TASK-SDK-02 | `step-02-seq-task-02-workflow-engine-runtime-orchestration`                   | seq      | workflow engine と runtime orchestration                                      |
| TASK-SDK-03 | `step-03-par-task-03-context-budget-and-resource-selection`                   | par      | selective loading / dynamic source resolution / context budget                |
| TASK-SDK-04 | `step-03-par-task-04-user-interaction-bridge-and-phase-ui`                    | par      | user interaction bridge / phase UI 契約                                       |
| TASK-SDK-05 | `../completed-tasks/step-04-par-task-05-create-entry-mainline-unification`    | par      | create 主導線の統合                                                           |
| TASK-SDK-06 | `../completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface` | par      | verify / improve surface と契約                                               |
| TASK-SDK-07 | `step-05-seq-task-07-execution-governance-and-handoff-alignment`              | seq      | lane contract の適用・hardening、API / handoff / approval / disclosure の整合 |
| TASK-SDK-08 | `step-06-seq-task-08-session-persistence-and-resume-contract`                 | seq      | session persistence / resume / checkpoint の互換性契約                        |

### P0 是正タスク

| タスクID   | ディレクトリ                                                      | パターン | 責務                                     |
| ---------- | ----------------------------------------------------------------- | -------- | ---------------------------------------- |
| TASK-P0-02 | `step-10-seq-task-p0-02-verify-improve-reverify-closed-loop`      | seq      | verify→improve→re-verify 閉ループ修復    |
| TASK-P0-04 | `step-10-seq-task-p0-04-manifest-loader-default-activation`       | seq      | ManifestLoader のデフォルト有効化        |
| TASK-P0-07 | `step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution` | seq      | ハードコードエージェント名の動的解決     |
| TASK-P0-08 | `step-10-seq-task-p0-08-session-resume-renderer-integration`      | seq      | セッション復元のレンダラー統合           |
| TASK-P0-09 | `step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance`   | seq      | Claude SDK permission hooks / governance |

### UI 統合タスク

| タスクID   | ディレクトリ                                                     | パターン | 責務                                     |
| ---------- | ---------------------------------------------------------------- | -------- | ---------------------------------------- |
| TASK-UI-01 | `step-11-seq-task-ui-01-lifecycle-panel-primary-route-promotion` | seq      | SkillLifecyclePanel の一次導線昇格       |
| TASK-UI-02 | `step-12-par-task-ui-02-conversation-panel-orphan-resolution`    | par      | SkillCreatorConversationPanel の孤立解消 |
| TASK-UI-03 | `step-12-par-task-ui-03-ipc-session-runtime-unification`         | par      | IPC session/runtime 二重経路統合         |
| TASK-UI-04 | `step-13-seq-task-ui-04-spec-status-drift-correction`            | seq      | 仕様書ステータス乖離修正                 |

補足:

- `TASK-SDK-08` は初回から保存機構を全面再設計する task ではなく、既存 session persistence への載せ方と invalidation 境界を固める contract-first task として扱う
- `TASK-UI-02` と `TASK-UI-03` は並列実行可能（step-12-par）。ただし両方とも `TASK-UI-01` 完了が前提
- `TASK-UI-04` は他の全 UI タスク完了後に実行（step-13-seq）。ステータス乖離修正は最終段階で行う

## UI 統合タスク推奨実行順

```text
P0 是正タスク完了後:
  -> TASK-UI-01 (seq: 一次導線昇格)
  -> TASK-UI-02 + TASK-UI-03 (par: 孤立解消 + IPC統合)
  -> TASK-UI-04 (seq: ステータス乖離修正)
```

## 読み方

1. まず [requirements-draft.md](./requirements-draft.md) で認識合わせを確認する
2. 次に [root-workflow-pack/index.md](./root-workflow-pack/index.md) で親 workflow の gate と依存順を確認する
3. その後 [executor-guide.md](./executor-guide.md) で実装者向けの読み順と task 選定を確認する
4. 最後に各 `step-*` ディレクトリの `index.md` と `phase-1`〜`phase-13` を読む

読むときの共通確認:

- その task が固定ディレクトリ前提を持ち込んでいないか
- `skill-creator` の source root と resource provenance を downstream へ渡しているか
- 構成差分が生じたときの degrade / warning / compatibility 条件が書かれているか
