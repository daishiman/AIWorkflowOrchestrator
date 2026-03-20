# UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001: SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| タスクID   | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001                                     |
| タスク名   | SkillExecutionStatus 型と system spec の同期条件を再監査し、同期 workflow を是正する |
| タスク分類 | docs                                                                                 |
| 優先度     | 高                                                                                   |
| Issue      | [#1388](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1388)             |
| 作成日     | 2026-03-20                                                                           |
| 関連タスク | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001                                           |

## 背景と目的

Task12 由来の `review` / `improve_ready` / `reuse_ready` 追加は、設計仕様上は存在する一方で、本 worktree の [packages/shared/src/types/skill.ts](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260320-140156-wt-4/packages/shared/src/types/skill.ts) にはまだ反映されていない。

そのため本 workflow は「9値へ更新済み」を前提に system spec を同期するのではなく、まず P50/P65 に基づいて現物を確認し、前提未充足なら blocked として記録し、前提充足後に canonical spec を同一 change set で同期する readiness-first の guarded workflow として扱う。

## 前提確認ポイント

| 項目                                  | 現在値                                                                           | 判定          |
| ------------------------------------- | -------------------------------------------------------------------------------- | ------------- |
| `packages/shared/src/types/skill.ts`  | 6値 (`idle`, `running`, `permission_pending`, `completed`, `cancelled`, `error`) | Task12 未反映 |
| `interfaces-agent-sdk-integration.md` | 6値テーブル                                                                      | 要更新候補    |
| `arch-state-management-core.md`       | Task12 3状態の配置ルールなし                                                     | 要更新候補    |
| ブランチ差分                          | `HEAD == origin/main`、未コミット差分は本 workflow 一式のみ                      | docs-only     |

## スコープ

| 含まれるもの                                                                           | 含まれないもの              |
| -------------------------------------------------------------------------------------- | --------------------------- |
| P50 readiness 判定                                                                     | Task12 のプロダクション実装 |
| `aiworkflow-requirements` からの canonical 参照抽出                                    | 3状態そのものの設計変更     |
| `interfaces-agent-sdk-integration.md` / `arch-state-management-core.md` の同期条件定義 | UI コンポーネント実装       |
| Phase 11-13 docs-only 契約の是正                                                       | コミット、PR の自動作成     |

## 前提条件

- Phase 1 で `packages/shared/src/types/skill.ts` の実値を確認する
- `resource-map.md` と `topic-map.md` から current canonical set を確定する
- user の明示承認がない限り Phase 13 は blocked のままにする

## 受入基準

- [ ] `resource-map.md` 起点で今回必要な仕様群を抽出できる
- [ ] `task-workflow-completed-skill-lifecycle-design.md` を一次情報として参照している
- [ ] `task-workflow-completed-skill-lifecycle-ui.md` を UI 側の一次情報として参照している
- [ ] `lessons-learned-current-electron-menu-docs-task0912.md` を P64/P65 の直接参照に使っている
- [ ] Phase 1 で readiness を `ready` / `blocked` のどちらかに判定できる
- [ ] `ready` の場合だけ canonical spec / mirror / index 更新へ進む
- [ ] `blocked` の場合は blocker 記録、未タスク検出、Phase 13 blocked までを docs-only で完結できる
- [ ] Phase 12 の成果物名と Step 1-A〜1-G / Task 12-6 が task-specification-creator 現行契約に一致している

## 必要仕様の抽出セット

| 種別     | 参照先                                                                                                     | 用途                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 入口     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                           | current canonical set の決定                         |
| 行位置   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                              | 対象 section の特定                                  |
| 検索補助 | `.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns-code.md`                   | `SkillExecutionStatus` / `reuse_ready` / Task12 検索 |
| 一次情報 | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md`      | Task12 の 3状態追加、P32/P65 修正                    |
| 一次情報 | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`          | UI / state / selector 側の影響                       |
| 更新対象 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`                    | 型テーブル同期                                       |
| 更新対象 | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                          | 状態配置同期                                         |
| 台帳     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                       | current workflow / backlog 同期                      |
| 教訓     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-electron-menu-docs-task0912.md` | P64/P65 再発防止                                     |

## 設計判断

| 選択肢                                                          | 判定 | 理由                                                                                 |
| --------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------ |
| 旧仕様書を維持し 9 値同期前提で進める                           | 却下 | 現物 6 値と矛盾し P50/P65 に反する                                                   |
| readiness 監査と将来同期を別 workflow に完全分割する            | 保留 | SRP には合うが Issue 1388 の current branch 差分としては過剰分割になり、導線が増える |
| 現 workflow を readiness-first の guarded workflow に再構成する | 採用 | 現 branch で即実行可能、かつ将来の actual sync への橋渡しも保持できる                |

## Phase 一覧

| Phase | 名称             | 仕様書                                                       | 状態    |
| ----- | ---------------- | ------------------------------------------------------------ | ------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | pending |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       | pending |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | pending |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | pending |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | pending |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       | pending |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked |

## 参照資料

| 資料                | パス                                                                                                       | 用途                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 元タスク指示書      | `docs/30-workflows/unassigned-task/task-lifecycle-execution-status-type-spec-sync-001.md`                  | 元要件                        |
| 実コード            | `packages/shared/src/types/skill.ts`                                                                       | readiness 判定                |
| Task12 一次情報     | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md`      | 3状態の導入根拠               |
| Task12 UI 一次情報  | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`          | UI / selector 影響            |
| 親 completed record | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md`      | 親タスク entry / handoff 起点 |
| current task ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                       | backlog / status 同期         |
| lessons learned     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-electron-menu-docs-task0912.md` | P64/P65 対策                  |
