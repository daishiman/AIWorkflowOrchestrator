# Phase 2: 設計

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 2                                   |
| 機能名 | step-11-par-task-docs-sdk-spec-sync |
| 作成日 | 2026-03-31                          |

## 目的

Phase 1 の要件定義をもとに、SDK-02（system spec 同期）と SDK-04（canonical path resync）の docs 更新設計を行う。更新ファイル・更新観点・更新順を確定し、Phase 5 実装の前提を固める。

## 実行タスク

- SDK-02 対象 3 ファイルの更新観点を詳細化する
- SDK-04 対象 4 ファイルの stale path と置換先の対応表を作成する
- 両タスクの更新順を依存関係に基づいて確定する
- canonical sync target matrix を作成する

## 設計概要

### SDK-02: system spec 同期設計

| ファイル                                  | 現状の問題                                  | 更新方針                             |
| ----------------------------------------- | ------------------------------------------- | ------------------------------------ |
| `architecture-overview-core.md`           | `SkillCreatorWorkflowEngine` が future 扱い | current owner として記述を更新       |
| `arch-electron-services-details-part2.md` | Electron サービス層の記述が実装前状態       | 実装済みファクトを反映した文面へ更新 |
| `api-ipc-system-core.md`                  | workflow engine の IPC/API が未実装前の記述 | 実装済み契約に合わせた記述へ更新     |

### SDK-04: canonical path resync 設計

| ファイル                     | stale path パターン                            | 置換先（current path）                                       |
| ---------------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `task-workflow-completed.md` | `skill-creator-agent-sdk-lane/.../step-03-...` | `docs/30-workflows/completed-tasks/step-03-par-task-04-.../` |
| `resource-map.md`            | `skill-creator-agent-sdk-lane/.../step-03-...` | `docs/30-workflows/completed-tasks/step-03-par-task-04-.../` |
| `quick-reference.md`         | `skill-creator-agent-sdk-lane/.../step-03-...` | `docs/30-workflows/completed-tasks/step-03-par-task-04-.../` |
| `topic-map.md`               | `skill-creator-agent-sdk-lane/.../step-03-...` | `docs/30-workflows/completed-tasks/step-03-par-task-04-.../` |

### 更新順

1. SDK-04: `task-workflow-completed.md` の path 修正（ledger の current fact を先に固める）
2. SDK-04: `resource-map.md` / `quick-reference.md` / `topic-map.md` の path 修正（index 系）
3. SDK-02: `architecture-overview-core.md` の current owner 化
4. SDK-02: `arch-electron-services-details-part2.md` の実装済み facts 反映
5. SDK-02: `api-ipc-system-core.md` の IPC/API 仕様更新

> 補足: `task-workflow-completed.md` を seed にした後、SDK-04 の index 群と SDK-02 の system spec 群は各群内で並列更新する。依存がない file 群を無理に直列化しない。

## 参照資料

| 資料名           | パス                                                                                              | 説明                             |
| ---------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件     | `phase-1-requirements.md`                                                                         | 要件・受入基準                   |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | SDK-02/04 current fact の正本    |
| lessons          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | no-op 根拠と partial update 防止 |

## 成果物

| 成果物                       | パス                                              | 説明                   |
| ---------------------------- | ------------------------------------------------- | ---------------------- |
| 設計書                       | `phase-2-design.md`                               | 更新観点・更新順の確定 |
| canonical sync target matrix | `outputs/phase-2/canonical-sync-target-matrix.md` | 対象ファイルと観点一覧 |

## 完了条件

- [ ] SDK-02 対象 3 ファイルの更新観点が詳細化されている
- [ ] SDK-04 対象 4 ファイルの stale path と置換先の対応表が作成されている
- [ ] 更新順が依存関係に基づいて確定されている
- [ ] Phase 3（設計レビュー）へ渡せる設計書が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. SDK-02 / SDK-04 の更新設計
3. 更新順の確定
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 3 へ引き継ぐ設計書と対応表が固定されている
