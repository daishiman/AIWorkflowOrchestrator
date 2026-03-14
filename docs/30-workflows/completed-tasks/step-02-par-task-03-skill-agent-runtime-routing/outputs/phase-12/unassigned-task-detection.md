# 未タスク検出レポート

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 12                                       |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

## 検出方針

- 実コード（`apps/desktop/src/main/services/runtime/*` ほか）と workflow outputs の差分を優先監査。
- 「設計上は定義済み、実装導線は未接続」の項目を未タスク候補として抽出。
- global backlog は `current` と `baseline` を分離して扱う。

## 検出結果

| ID                | カテゴリ   | 内容                                                           | 優先度 | 対応                     |
| ----------------- | ---------- | -------------------------------------------------------------- | ------ | ------------------------ |
| UNASSIGNED-RT-001 | 実装配線   | runtime resolver が Skill/Agent 実行導線へ未配線               | high   | **formalized**           |
| UNASSIGNED-RT-002 | 契約配線   | `creator:plan/execute/improve` が preload/API 公開経路へ未接続 | high   | UNASSIGNED-RT-001 に統合 |
| UNASSIGNED-RT-003 | UI導線     | `TerminalHandoffCard` が表示導線へ未接続                       | medium | UNASSIGNED-RT-001 に統合 |
| UNASSIGNED-RT-004 | テスト境界 | 契約テスト/回帰テストの責務境界整理                            | low    | 既存未タスクを継続       |

## formalize 実施

| 未タスクID                                                 | タスク名                           | 指示書                                                                                                                                                              |
| ---------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 | runtime ルーティング統合クロージャ | `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/unassigned-task/task-imp-skill-agent-runtime-routing-integration-closure-001.md` |
| UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001                 | 契約/回帰テスト境界の明文化        | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`                                                                             |

## 監査コマンド結果

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                            | 結果                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `verify-unassigned-links.js --root docs/30-workflows`                                                                                                                                                                                                                                                                                                                                                                               | PASS（223/223）                                                        |
| `audit-unassigned-tasks.js --json --diff-from HEAD --unassigned-dir docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/unassigned-task --completed-unassigned-dir docs/30-workflows/completed-tasks/unassigned-task --target-file docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/unassigned-task/task-imp-skill-agent-runtime-routing-integration-closure-001.md` | `scope.currentFiles=1`, `currentViolations=0`, `baselineViolations=38` |
| `audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                                                                                                                                                                                                                                                                                                 | `currentViolations=0`, `baselineViolations=134`                        |

## 判定

- 本タスクで新規に formalize が必要な未タスクは **1件**（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）。
- 既存 follow-up（UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001）は継続監視とする。
- `--target-file` 監査で対象ファイル単位の合格（`scope.currentFiles=1`）を確認済み。
