# UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 SkillExecutionStatus 型同期の再監査 - タスク指示書

## メタ情報

```yaml
issue_number: 1388
```

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| タスクID   | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001                                          |
| タスク名   | SkillExecutionStatus 型と system spec の同期条件を再監査し、同期 workflow を是正する      |
| 分類       | 仕様書同期                                                                                |
| 対象機能   | `packages/shared/src/types/skill.ts` と `.claude/skills/aiworkflow-requirements/` の整合  |
| 優先度     | 高                                                                                        |
| ステータス | 未実施                                                                                    |
| 関連タスク | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001                                                |
| トリガー   | Task12 実装前の docs-only readiness 監査と、実装後の actual system spec sync 条件の再確認 |

## 1. なぜこのタスクが必要か

Task12 の設計では `review` / `improve_ready` / `reuse_ready` を `SkillExecutionStatus` へ追加する方針が決まっている。一方、本 worktree の実コードはまだ 6 値であり、「9値へ更新済み」を前提に system spec を同期すると P65 の再発になる。

## 2. 何を達成するか

- `resource-map` / `topic-map` / `quick-reference-search-patterns-code` から必要仕様を抽出できる状態にする
- Phase 1 で `ready` / `blocked` を判定できる workflow を整える
- `ready` 時のみ `interfaces-agent-sdk-integration.md` と `arch-state-management-core.md` を同期する
- `blocked` 時は blocker と follow-up を docs-only で記録する

## 3. どのように実現するか

1. `packages/shared/src/types/skill.ts` を確認し、現行値を確定する
2. `resource-map.md` から Skill Lifecycle / docs-only sync の入口を選ぶ
3. `search-spec.js "SkillExecutionStatus"` と `search-spec.js "TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001"` で一次情報へ到達する
4. `topic-map.md` で `interfaces-agent-sdk-integration.md` / `arch-state-management-core.md` / `task-workflow-completed-skill-lifecycle-design.md` の section を特定する
5. readiness が満たされていれば system spec を更新し、満たされていなければ blocker と未タスクを記録する

## 3.1 実行タイミング

| タイミング    | 目的                                                   | 期待状態           |
| ------------- | ------------------------------------------------------ | ------------------ |
| Task12 実装前 | docs-only readiness 監査、抽出導線、blocked 条件の固定 | `blocked` を許容   |
| Task12 実装後 | actual `SkillExecutionStatus` と canonical spec の同期 | `ready` 時のみ更新 |

## 4. 前提条件

- Task12 の設計一次情報は `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md`
- P64/P65 の教訓は `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-electron-menu-docs-task0912.md`
- Task12 の設計一次情報は `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md`
- P64/P65 の教訓は `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-electron-menu-docs-task0912.md`
- `HEAD == origin/main` でも `git diff HEAD` と workflow 差分は別に記録する

## 5. 受入基準

- [ ] `resource-map` 起点の抽出手順が明文化されている
- [ ] readiness 判定結果を `ready` / `blocked` で残せる
- [ ] `ready` の場合だけ `interfaces-agent-sdk-integration.md` / `arch-state-management-core.md` の本文更新へ進む
- [ ] `blocked` の場合は blocker・根拠・follow-up・未タスク候補を docs-only で閉じる
- [ ] 更新対象と確認対象の区別が明確である
- [ ] Phase 12 成果物名が `unassigned-task-detection.md` を含む現行契約に一致している
- [ ] Phase 13 が user approval なしで進まない

## 6. 参照資料

| 資料                   | パス                                                                                                       | 用途                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 実コード               | `packages/shared/src/types/skill.ts`                                                                       | readiness 判定                   |
| resource map           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                           | 入口決定                         |
| topic map              | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                              | section 特定                     |
| quick reference search | `.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns-code.md`                   | 検索入口                         |
| Task12 一次情報        | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md`      | 設計根拠                         |
| Task12 UI 一次情報     | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`          | UI / selector 影響               |
| current task ledger    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                       | backlog / status 同期            |
| lessons learned        | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-electron-menu-docs-task0912.md` | P64/P65                          |
| current workflow       | `docs/30-workflows/completed-tasks/execution-status-type-spec-sync/index.md`                               | readiness-first guarded workflow |
