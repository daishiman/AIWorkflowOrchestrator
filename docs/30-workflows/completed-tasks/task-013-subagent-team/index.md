# TASK-013 SubAgent Team 編成

## 目的

`TASK-IMP-TASK9-UI-BE-CONSISTENCY-001` を SubAgent Team 想定で分担実行できるよう、監査観点を4つの SubAgent に分割する。

## チーム構成

| SubAgent | 仕様書                           | 役割                                     | 実行順序        | ステータス |
| -------- | -------------------------------- | ---------------------------------------- | --------------- | ---------- |
| A        | `task-013a-contract-audit.md`    | IPC 契約監査（チャネル名/引数/戻り値）   | 並列            | 完了       |
| B        | `task-013b-dataflow-audit.md`    | データフロー監査（Date/イベント/境界型） | 並列            | 完了       |
| C        | `task-013c-ui-boundary-audit.md` | UI-Backend 責務境界監査                  | 並列            | 完了       |
| D        | `task-013d-sequence-redesign.md` | 実行順序再設計と最終統合                 | 直列（A/B/C後） | 完了       |

## 仕様書担当範囲

| SubAgent | 主要監査対象仕様書                                                                       |
| -------- | ---------------------------------------------------------------------------------------- |
| A        | `task-020b`, `task-022`, `task-030`, `task-031b`                                         |
| B        | `task-022`, `task-023a`, `task-023b`, `task-023c`, `task-023d`                           |
| C        | `task-030`, `task-031a`, `task-031b`, `task-020a`, `task-020b`, `task-023b`              |
| D        | `task-000-master-index.md`, `task-013本文`, `task-013a/b/c`, `task-041a/b/c`, `task-042` |

## 成果物一覧

### SubAgent-A 出力

| ファイル                             | 内容                       |
| ------------------------------------ | -------------------------- |
| `outputs/contract-diff-matrix.md`    | 全56チャネル差分マトリクス |
| `outputs/channel-ownership-table.md` | 全57チャネル所有権テーブル |

### SubAgent-B 出力

| ファイル                               | 内容                      |
| -------------------------------------- | ------------------------- |
| `outputs/ipc-date-boundary-rules.md`   | 18 Dateフィールド準拠状況 |
| `outputs/event-payload-consistency.md` | DebugEvent型推奨定義      |

### SubAgent-C 出力

| ファイル                                   | 内容                            |
| ------------------------------------------ | ------------------------------- |
| `outputs/ui-props-dto-mapping.md`          | 全コンポーネントProps↔DTO対応表 |
| `outputs/ui-layer-responsibility-table.md` | 全ビュー責務分担テーブル        |

### SubAgent-D 出力

| ファイル                                                  | 内容                              |
| --------------------------------------------------------- | --------------------------------- |
| `task-013d-sequence-redesign.md`                          | 統合分析＋実行順序設計仕様        |
| `outputs/final-execution-sequence.md`                     | 最終確定版実行順序表              |
| `outputs/parallelization-boundary.md`                     | 並列化境界定義書                  |
| `outputs/subagent-audit-report-2026-02-25.md`             | A/B/C/D統合監査レポート           |
| `outputs/compliance-recheck-2026-02-25.md`                | 再確認レポート（再評価含む）      |
| `outputs/unassigned-task-detection-recheck-2026-02-25.md` | 未タスク再検出レポート            |
| `outputs/phase-12/*.md`                                   | Phase 12 必須5成果物 + 準拠再確認 |
| `outputs/phase-12/phase12-compliance-recheck.md`          | Phase 12 チェックリスト監査結果   |

## 検出結果サマリ（SubAgent-D 統合）

| 重要度   | 件数 | 検出元 | 是正Wave |
| -------- | ---- | ------ | -------- |
| CRITICAL | 2    | A      | Wave 0   |
| MAJOR    | 2    | A/B    | Wave 0/2 |
| MEDIUM   | 4    | B      | Wave 2   |
| LOW      | 2    | B      | Wave 2   |
| MINOR    | 2    | A      | Wave 0/1 |
| INFO     | 4    | C      | Wave 3/— |

## 再監査アップデート（2026-02-25）

- `UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001` は再評価でクローズ（実装上 `skillId` 契約が妥当）。
- 旧監査成果物の「未解消」記載は履歴として保持し、最新判定は `outputs/compliance-recheck-2026-02-25.md` を正本とする。

## 実行ルール

- A/B/C は同時に進行し、成果物を D に引き渡す。
- D は A/B/C の不足観点を統合し、最終順序表を `task-013` 本文に反映する。
- 本チームは仕様書作成のみを担当し、実装・テスト実行は行わない。

## aiworkflow-requirements 抽出手順

1. `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` で監査観点ごとの必読仕様を特定する。
2. `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` で IPC/型/セキュリティの要点を確認する。
3. `.claude/skills/aiworkflow-requirements/scripts/search-spec.js` でキーワード（`skill:get-detail`, `skill:importFromSource`, `safeOn`, `P44`, `P45`, `security-skill-ipc`, `spec-guidelines`）を横断検索する。
4. 抽出結果を SubAgent-A/B/C の入力資料・参照資料に反映する。
5. `ipc-contract-checklist.md` と `ipc-type-resolution-guide.md` を全SubAgentの共通必須参照にする。
6. `quick-reference.md` は入口情報として扱い、最終契約は `interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-skill-ipc.md` を正本として確定する。

## task-specification-creator 準拠チェック

| 仕様書       | メタ情報 | 目的 | 実行タスク | 参照資料 | 実行手順 | 成果物 | 完了条件 |
| ------------ | -------- | ---- | ---------- | -------- | -------- | ------ | -------- |
| task-013本文 | ✅       | ✅   | ✅         | ✅       | ✅       | ✅     | ✅       |
| task-013a    | ✅       | ✅   | ✅         | ✅       | ✅       | ✅     | ✅       |
| task-013b    | ✅       | ✅   | ✅         | ✅       | ✅       | ✅     | ✅       |
| task-013c    | ✅       | ✅   | ✅         | ✅       | ✅       | ✅     | ✅       |
| task-013d    | ✅       | ✅   | ✅         | ✅       | ✅       | ✅     | ✅       |

## 参照正本

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
- `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
