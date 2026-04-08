# Phase 1: ファイルインベントリ

## 対象ファイル一覧（500行超）

### aiworkflow-requirements/references/（19件）

| ファイル名                                                            | 行数  | H2数   | 分離優先度 | 備考                                  |
| --------------------------------------------------------------------- | ----- | ------ | ---------- | ------------------------------------- |
| task-workflow-completed.md                                            | 2,444 | 2      | 最高       | H3=79件、既存子ファイル多数あり       |
| lessons-learned-current.md                                            | 1,299 | 17     | 高         | H2=17件、日付タスク単位               |
| lessons-learned-phase12-workflow-lifecycle.md                         | 1,269 | 29     | 高         | H2=29件、日付別                       |
| api-ipc-system-core.md                                                | 958   | 13     | 高         | H2=13件、API/IPC別                    |
| arch-state-management-core.md                                         | 759   | 15     | 中         | H2=15件、機能別                       |
| lessons-learned-ipc-preload-runtime.md                                | 728   | 未確認 | 中         |                                       |
| task-workflow-completed-skill-lifecycle-ui.md                         | 700   | 8      | 中         | H2=8件、タスク記録別                  |
| task-workflow-backlog.md                                              | 640   | 1      | 中         | H2=1件、H3=1件 大規模バックログリスト |
| interfaces-agent-sdk-skill-reference.md                               | 624   | 5      | 中         | H2=5件、インターフェース別            |
| security-electron-ipc-core.md                                         | 583   | 7      | 低         | H2=7件、セキュリティドメイン別        |
| architecture-implementation-patterns-core.md                          | 580   | 5      | 低         | H2=5件、フロント/バック/共有別        |
| ui-ux-feature-components-core.md                                      | 574   | 6      | 低         | H2=6件、コンポーネント別              |
| task-workflow-completed-ipc-contract-preload-alignment.md             | 561   | 1      | 低         | H3=13件、IPC契約タスク                |
| ui-ux-feature-components-details.md                                   | 556   | 7      | 低         | H2=7件、Workspace別                   |
| security-skill-execution.md                                           | 549   | 10     | 低         | H2=10件、権限ドメイン別               |
| ui-ux-navigation.md                                                   | 547   | 9      | 低         | H2=9件、ナビ機能別                    |
| task-workflow-completed-chat-lifecycle-tests.md                       | 540   | 1      | 低         | H3未確認、テスト記録                  |
| ui-ux-feature-components-reference.md                                 | 530   | 5      | 低         | H2=5件、SkillCenter/SkillUI別         |
| architecture-implementation-patterns-reference-ipc-contract-audits.md | 519   | 7      | 低         | H2=7件、監査パターン別                |

### task-specification-creator/references/（5件）

| ファイル名               | 行数  | H2数 | 分離優先度 | 備考                            |
| ------------------------ | ----- | ---- | ---------- | ------------------------------- |
| patterns.md              | 2,225 | 14   | 最高       | H2=14件、既存子ファイル14件あり |
| phase-templates.md       | 1,247 | 41   | 高         | H2=41件、既存子ファイル8件あり  |
| spec-update-workflow.md  | 974   | 14   | 高         | H2=14件、既存子ファイル7件あり  |
| phase-11-12-guide.md     | 590   | 7    | 中         | H2=7件、Phase11/12別            |
| patterns-parallel-ipc.md | 532   | 18   | 低         | H2=18件、パターン別             |

## 既存子ファイル状況

### aiworkflow-requirements/references/

- lessons-learned-\*: 約40件の子ファイル存在
- task-workflow-completed-\*: 約20件の子ファイル存在（一部500行超）

### task-specification-creator/references/

- patterns-\*.md: 14件の子ファイル存在
- phase-template-\*.md: 8件の子ファイル存在
- spec-update-\*.md: 7件の子ファイル存在
- phase-11-\*.md: 2件の子ファイル存在

## mirror差異確認

.claude/skills/ と .agents/skills/ の差異確認は Phase 5 完了後に実施。

## セクション構造分析サマリー

### task-workflow-completed.md（最重要）

- 2つのH2セクション（「完了タスク」 + 「UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001」）
- H3エントリ79件（2026-03-10〜2026-04-06の完了タスク記録）
- 分離方針: H3タスクを日付帯別に新規ファイルへ切り出し、親は目次に縮小

### lessons-learned-current.md

- H2エントリ17件（各H2が1つのタスク教訓）
- 分割ポイント: line 287（H2 TASK-IMP-CHAT...）、line 619（H2 UT-TASK06-007...）、line 913（H2 TASK-RT-06...）
- 分離方針: 期間別に2〜3ファイルへ分割

### lessons-learned-phase12-workflow-lifecycle.md

- H2エントリ29件（日付順）
- 分割ポイント: line 437（2026-03-21）、line 703（2026-03-17再監査）
- 分離方針: 3ファイルへ分割

### patterns.md

- 既存子ファイル14件（patterns-\*.md）が既に存在
- 残コンテンツを既存子ファイルへ移動し、親を目次（100行以内）に縮小
