# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 1                                                                        |
| Phase名    | 要件定義                                                                 |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | なし                                                                     |
| 後続Phase  | Phase 2                                                                  |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

docs-only parent workflow の parent pointer、child workflow、system spec、capture script、dual root mirror を横断する guard の要件を確定する。Phase 2 が迷わず設計に入れる粒度で、監査対象・受入基準・責務境界を固定する。

## 背景

現状の repo では parent pointer doc が `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md` にあり、child workflow 04A / 04B / 04C は `docs/30-workflows/completed-tasks/` 配下に存在する。この非対称な構造のまま parent reference を部分更新すると、`interfaces-llm.md`、`interfaces-chat-history.md`、`apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs`、legacy index、`.agents` mirror に stale path が残りやすい。

## 実行タスク

- SubAgent-A: parent pointer、completed-task pointer docs、legacy index、master index の監査対象を列挙する
- SubAgent-B: `interfaces-llm.md`、`interfaces-chat-history.md`、capture script の stale path と status drift の論点を抽出する
- SubAgent-C: `.claude` / `.agents` dual root と `diff -qr` 運用の完了条件を要件化する
- Lead: スコープ、受入基準、Phase 2 へ渡す concern boundary を統合する

### タスク1: 監査対象 inventory の固定

**目的**: 監査対象を file class ごとに固定し、Phase 2 の manifest 設計へ接続する

**手順**:

1. parent pointer doc、child workflow、completed-task pointer docs、legacy index、master index を列挙する
2. 各対象について source of truth と expected target root を記録する
3. stale path と status drift を分けて記録する

### タスク2: system spec 参照要件の固定

**目的**: aiworkflow-requirements から読むべき正本を固定し、仕様ドリフトを防ぐ

**手順**:

1. `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md` を同期対象として固定する
2. `interfaces-llm.md`、`interfaces-chat-history.md` を stale evidence path 監査対象として固定する
3. dual root precedent として `UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001` を参照対象へ入れる

### タスク3: 受入基準と除外範囲の固定

**目的**: 仕様書作成の時点で in-scope / out-of-scope を曖昧にしない

**手順**:

1. UI 実装変更、screenshot policy 詳細、root 統合リファクタリングを除外範囲として固定する
2. sweep manifest、guard contract、Phase 12 同期計画を完了条件へ落とし込む
3. `verify-all-specs` と `validate-phase-output` で検証できる構造を前提にする

## 参照資料

| 参照資料              | パス                                                                                                                                              | 説明                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 元未タスク指示書      | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md` | Why/What/How と SubAgent 分担          |
| parent pointer doc    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md`                      | task-060 現行 root                     |
| child workflow 04A    | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/`                                                                | layout/filebrowser completed workflow  |
| child workflow 04B    | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/`                                                                        | chat panel completed workflow          |
| child workflow 04C    | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/`                                                               | preview/quicksearch completed workflow |
| create workflow       | `.claude/skills/task-specification-creator/references/create-workflow.md`                                                                         | create モードの直列 / 並列ルール       |
| unassigned guidelines | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                                                              | 指示書品質基準                         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                            | 内容                                            |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------- |
| resource-map             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                | 読み込む仕様の選定根拠                          |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 関連未タスクと Phase 12 運用の正本              |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | UI 機能仕様への同期先                           |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発防止知見の同期先                            |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | workspace chat evidence path の監査対象         |
| interfaces-chat-history  | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  | workspace chat/history evidence path の監査対象 |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | capture script と local root 参照の安全側基準   |

## 統合テスト連携

- Phase 4 で stale path / status drift / mirror drift の検出ケースをテスト仕様へ落とし込む
- Phase 6 で `rg`、`diff -qr`、`verify-unassigned-links` の再実行計画を拡充する
- Phase 11 で pointer doc、child workflow、system spec の参照導線を手動で確認する

## 成果物

| 成果物           | パス                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 要件定義書       | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-1/requirements-definition.md`   |
| 受入基準         | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-1/acceptance-criteria.md`       |
| 仕様参照マップ   | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-1/spec-reference-map.md`        |
| SubAgent責務分担 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-1/subagent-responsibilities.md` |

## 完了条件

- [x] 監査対象が parent pointer / child workflow / pointer docs / legacy index / interfaces / capture script / mirror root まで列挙されている
- [x] 同期対象の system spec が `task-workflow` / `ui-ux-feature-components` / `lessons-learned` / `interfaces-*` として固定されている
- [x] in-scope / out-of-scope が固定されている
- [x] Phase 2 が concern boundary をそのまま設計へ写せる
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 2: 設計へ進む。
