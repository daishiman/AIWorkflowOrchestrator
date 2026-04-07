# Phase 2: 命名規則書

## 新規ファイル名一覧

### aiworkflow-requirements/references/ - 新規作成ファイル

| 新規ファイル名                                                 | 親ファイル                                                            | 内容概要                               |
| -------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| `task-workflow-completed-recent-2026-04b.md`                   | task-workflow-completed.md                                            | 2026-04-04以降のタスク                 |
| `task-workflow-completed-recent-2026-04a.md`                   | task-workflow-completed.md                                            | 2026-04-01〜2026-04-03のタスク         |
| `task-workflow-completed-recent-2026-03d.md`                   | task-workflow-completed.md                                            | 2026-03-29〜2026-03-31のタスク         |
| `task-workflow-completed-recent-2026-03c.md`                   | task-workflow-completed.md                                            | 2026-03-22〜2026-03-28のタスク         |
| `task-workflow-completed-recent-2026-03b.md`                   | task-workflow-completed.md                                            | 2026-03-10〜2026-03-21のタスク         |
| `lessons-learned-current-2026-04.md`                           | lessons-learned-current.md                                            | 2026-04系教訓                          |
| `lessons-learned-current-2026-03-late.md`                      | lessons-learned-current.md                                            | 2026-03下旬教訓                        |
| `lessons-learned-current-2026-03-mid.md`                       | lessons-learned-current.md                                            | 2026-03中旬教訓                        |
| `lessons-learned-current-2026-03-early.md`                     | lessons-learned-current.md                                            | 2026-03初旬教訓 + クイックリファレンス |
| `lessons-learned-phase12-lifecycle-recent.md`                  | lessons-learned-phase12-workflow-lifecycle.md                         | 2026-03-29以降教訓                     |
| `lessons-learned-phase12-lifecycle-mid.md`                     | lessons-learned-phase12-workflow-lifecycle.md                         | 2026-03-17〜2026-03-28教訓             |
| `lessons-learned-phase12-lifecycle-early.md`                   | lessons-learned-phase12-workflow-lifecycle.md                         | 2026-03-14〜2026-03-16教訓             |
| `lessons-learned-ipc-preload-runtime-2026-04.md`               | lessons-learned-ipc-preload-runtime.md                                | 2026-04系                              |
| `lessons-learned-ipc-preload-runtime-2026-03-late.md`          | lessons-learned-ipc-preload-runtime.md                                | 2026-03後半                            |
| `lessons-learned-ipc-preload-runtime-2026-03-early.md`         | lessons-learned-ipc-preload-runtime.md                                | 2026-03前半                            |
| `api-ipc-system-skill-creator.md`                              | api-ipc-system-core.md                                                | Skill Creator IPC系                    |
| `arch-state-management-skill-creator.md`                       | arch-state-management-core.md                                         | LLM/SkillCreator状態管理               |
| `task-workflow-completed-skill-lifecycle-ui-verify.md`         | task-workflow-completed-skill-lifecycle-ui.md                         | Verify/Improve UI記録                  |
| `task-workflow-backlog-part2.md`                               | task-workflow-backlog.md                                              | バックログテーブル後半                 |
| `interfaces-agent-sdk-skill-editor.md`                         | interfaces-agent-sdk-skill-reference.md                               | SkillEditor/Chain/Schedule型           |
| `security-electron-ipc-examples.md`                            | security-electron-ipc-core.md                                         | IPC実装例                              |
| `architecture-implementation-patterns-shared.md`               | architecture-implementation-patterns-core.md                          | 共有パッケージパターン                 |
| `ui-ux-feature-components-advanced.md`                         | ui-ux-feature-components-core.md                                      | Custom Execution/Workspace系           |
| `task-workflow-completed-ipc-preload-foundation.md`            | task-workflow-completed-ipc-contract-preload-alignment.md             | IPC/Preload基盤タスク                  |
| `ui-ux-feature-components-theme-chat.md`                       | ui-ux-feature-components-details.md                                   | テーマ/ChatPanel系                     |
| `security-skill-execution-permission.md`                       | security-skill-execution.md                                           | Permission Store系                     |
| `ui-ux-navigation-chat-patterns.md`                            | ui-ux-navigation.md                                                   | ChatViewナビ/パターン                  |
| `task-workflow-completed-chat-lifecycle-tests-part2.md`        | task-workflow-completed-chat-lifecycle-tests.md                       | テスト記録後半                         |
| `ui-ux-feature-components-skill-analysis.md`                   | ui-ux-feature-components-reference.md                                 | SkillAnalysis/CreateWizard UI          |
| `architecture-implementation-patterns-reference-ipc-naming.md` | architecture-implementation-patterns-reference-ipc-contract-audits.md | IPC命名監査パターン                    |

### task-specification-creator/references/ - 新規作成ファイル

| 新規ファイル名                     | 親ファイル               | 内容概要               |
| ---------------------------------- | ------------------------ | ---------------------- |
| `phase-11-guide.md`                | phase-11-12-guide.md     | Phase 11専用ガイド     |
| `phase-12-guide.md`                | phase-11-12-guide.md     | Phase 12専用ガイド     |
| `patterns-phase12-optimization.md` | patterns-parallel-ipc.md | Phase 12最適化パターン |

## 命名規則

| ルール           | 詳細                                                   |
| ---------------- | ------------------------------------------------------ |
| ケース           | ケバブケース（小文字 + ハイフン）                      |
| 拡張子           | `.md`                                                  |
| 日付サフィックス | `-YYYY-MM` または `-YYYY-MM-period`                    |
| 機能サフィックス | `-sdk`, `-ipc`, `-ui`, `-skill-creator`, `-permission` |
| 連番サフィックス | `-part1`, `-part2`                                     |

## 既存ファイルの変更（縮小）

| ファイル                                                              | 現在の行数 | 縮小後の目標行数               |
| --------------------------------------------------------------------- | ---------- | ------------------------------ |
| task-workflow-completed.md                                            | 2,444      | ~200（目次のみ）               |
| lessons-learned-current.md                                            | 1,299      | ~150（meta + index）           |
| lessons-learned-phase12-workflow-lifecycle.md                         | 1,269      | ~100（meta + index）           |
| api-ipc-system-core.md                                                | 958        | ~430（前半のみ）               |
| arch-state-management-core.md                                         | 759        | ~360（前半のみ）               |
| patterns.md                                                           | 2,225      | ~100（目次のみ）               |
| phase-templates.md                                                    | 1,247      | ~50（インデックスのみ）        |
| spec-update-workflow.md                                               | 974        | ~100（フロー図 + リンク）      |
| phase-11-12-guide.md                                                  | 590        | 削除→2ファイルに分割           |
| patterns-parallel-ipc.md                                              | 532        | ~180（並列+IPC型パターンのみ） |
| task-workflow-completed-skill-lifecycle-ui.md                         | 700        | ~350                           |
| task-workflow-completed-chat-lifecycle-tests.md                       | 540        | ~270                           |
| task-workflow-completed-ipc-contract-preload-alignment.md             | 561        | ~340                           |
| lessons-learned-ipc-preload-runtime.md                                | 728        | ~100（meta + index）           |
| interfaces-agent-sdk-skill-reference.md                               | 624        | ~430                           |
| task-workflow-backlog.md                                              | 640        | ~320                           |
| security-electron-ipc-core.md                                         | 583        | ~345                           |
| architecture-implementation-patterns-core.md                          | 580        | ~455                           |
| ui-ux-feature-components-core.md                                      | 574        | ~270                           |
| ui-ux-feature-components-details.md                                   | 556        | ~330                           |
| security-skill-execution.md                                           | 549        | ~285                           |
| ui-ux-navigation.md                                                   | 547        | ~375                           |
| ui-ux-feature-components-reference.md                                 | 530        | ~300                           |
| architecture-implementation-patterns-reference-ipc-contract-audits.md | 519        | ~260                           |
