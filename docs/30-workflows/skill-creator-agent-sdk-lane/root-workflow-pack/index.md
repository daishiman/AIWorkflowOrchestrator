# Skill Creator Agent SDK Lane 親 Workflow パック

## 概要

本パックは、`skill-creator` を動的に読み取り、ユーザーとの対話を通じてスキルを量産できる機能を、本システムへ組み込むための親 workflow pack である。

主題は単なる LLM 生成ではない。  
次の 3 責務をまとめて閉じる。

- `skill-creator` 更新追従コストを下げる動的解釈基盤
- 量産品質を閉じる verify / improve 閉ループ
- 分散した生成導線を統合する UI / UX 主導線

## 目的

- `skill-creator` の変更を毎回ハードコードせずに追従できる構造を定義する
- ユーザーが質問に答えながら skill を組み立てられる体験を UI / UX と runtime の両面で成立させる
- API 実行レーンと terminal handoff レーンの責務を分離する
- verify / improve を正式 lane として定義し、量産品質を閉じる
- `skill-creator` が複数ディレクトリや可変 file layout を取り得る前提で、source discovery と provenance を lane 全体へ通す

## 位置づけ

このディレクトリは実装タスクそのものではない。

- 役割は child task 群の共通前提、gate、依存順、品質観点をまとめること
- `step-01` 以降が実装単位の task spec
- そのため番号付きの実行タスクとして扱わず、親仕様の入れ物として読む
- 背景と制約の正本は `../requirements-draft.md`
- task 選定の補助は `../executor-guide.md`

## 最小読順

1. [../requirements-draft.md](../requirements-draft.md)
2. この `index.md`
3. [phase-1-requirements.md](./phase-1-requirements.md)
4. [phase-2-design.md](./phase-2-design.md)
5. [phase-3-design-review.md](./phase-3-design-review.md)
6. [../executor-guide.md](../executor-guide.md)
7. 関連 task の `index.md`

## タスク一覧

| タスクID    | ディレクトリ                                                                  | パターン | 責務                                                                          |
| ----------- | ----------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| TASK-SDK-01 | `step-01-seq-task-01-manifest-contract-foundation`                            | seq      | manifest 契約と動的追従境界の定義                                             |
| TASK-SDK-02 | `step-02-seq-task-02-workflow-engine-runtime-orchestration`                   | seq      | workflow engine と runtime orchestration                                      |
| TASK-SDK-03 | `step-03-par-task-03-context-budget-and-resource-selection`                   | par      | selective loading / context budget                                            |
| TASK-SDK-04 | `step-03-par-task-04-user-interaction-bridge-and-phase-ui`                    | par      | user interaction bridge / phase UI 契約                                       |
| TASK-SDK-05 | `../completed-tasks/step-04-par-task-05-create-entry-mainline-unification`    | par      | SkillLifecyclePanel / SkillCreateWizard の主導線統合                          |
| TASK-SDK-06 | `../completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface` | par      | verify / improve surface と契約                                               |
| TASK-SDK-07 | `step-05-seq-task-07-execution-governance-and-handoff-alignment`              | seq      | lane contract の適用・hardening、API / handoff / approval / disclosure の整合 |
| TASK-SDK-08 | `step-06-seq-task-08-session-persistence-and-resume-contract`                 | seq      | session persistence / resume / checkpoint の互換性契約                        |

## 推奨実行順

```text
root Phase 1-3
  -> Task01
  -> Task02
  -> Task03 + Task04
  -> Task05 + Task06
  -> Task07
  -> Task08
```

`seq/par` は大まかな並列グループを示す。厳密な predecessor は次の matrix を正本とする。

## lane 共通不変条件

- 単一固定 root だけを読んでよい task は存在しない
- resource 読み込みは `manifest resource descriptor -> explicit path -> env -> home -> repo bundle` の候補列を前提にする
- source root、resolved resource path、hash/snapshot は downstream task と session compatibility 判定へ渡す

## 依存マトリクス

| Task   | 必須 predecessor                       | この task で固定する境界                                                                  | 補足                                                     |
| ------ | -------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Task01 | なし                                   | manifest scope / non-scope                                                                | foundation                                               |
| Task02 | Task01                                 | workflow state owner、lane response baseline、workflow state envelope                     | `resumeToken` の互換性はここで閉じない                   |
| Task03 | Task01, Task02                         | resource selection、dynamic source resolution、token budget、lane-neutral degrade trigger | lane choice / disclosure は Task07                       |
| Task04 | Task01, Task02                         | interaction bridge、`awaitingUserInput` 契約                                              | lifecycle state owner は Task02 前提                     |
| Task05 | Task03, Task04                         | create mainline UI                                                                        | Task06 と shared lifecycle state contract を同期して並列 |
| Task06 | Task03, Task04                         | verify / improve / re-entry surface                                                       | Task05 と shared lifecycle state contract を同期して並列 |
| Task07 | Task02, Task03, Task04, Task05, Task06 | governance bundle の適用、handoff / approval / disclosure hardening                       | lane baseline の初定義は Task02                          |
| Task08 | Task02, Task07                         | persistence / invalidation / compatibility contract、source snapshot compatibility        | contract-first、保存機構の全面再設計は対象外             |

## root Phase 一覧

| Phase | 名称             | 仕様書                                                         |
| ----- | ---------------- | -------------------------------------------------------------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         |
| 5     | 実装計画         | [phase-5-implementation.md](./phase-5-implementation.md)       |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           |

## 参照資料

| 資料名                        | パス                                                                         | 内容                                 |
| ----------------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| 草案                          | `../requirements-draft.md`                                                   | 認識合わせ済み要件草案               |
| Skill Creator LLM Integration | `docs/30-workflows/skill-creator-llm-integration/index.md`                   | create / verify / improve の既存設計 |
| Guided Execution              | `docs/30-workflows/guided-execution-console-realization/index.md`            | guided execution の親仕様            |
| Execution Responsibility      | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md` | runtime / handoff / policy authority |
| task-specification-creator    | `.agents/skills/task-specification-creator/references/create-workflow.md`    | task-spec 作成の正本手順             |

## 完了定義

- root Phase 1-3 が PASS している
- 各 task の責務が単一責務で分離されている
- `seq/par` 命名と dependency matrix から依存順が追える
- 各 task が単独で実装者へ渡せる粒度になっている
