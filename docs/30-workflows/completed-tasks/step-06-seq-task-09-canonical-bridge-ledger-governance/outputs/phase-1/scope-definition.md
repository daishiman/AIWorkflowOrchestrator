# Phase 1 成果物: スコープ定義

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 1 - 要件定義

## 1. 対象スコープ（In Scope）

### 1.1 定義対象

| カテゴリ                  | 対象                                                | 成果物                   |
| ------------------------- | --------------------------------------------------- | ------------------------ |
| Canonical Source Table    | governance 対象の全正本ファイル一覧                 | table 形式の正本定義     |
| Compatibility Bridge Rule | 旧パス → canonical パスの対応ルール                 | bridge rule 文書         |
| State 遷移定義            | spec_created / implementation_ready / completed     | state machine 定義       |
| Same-Wave 更新ルール      | Phase 12 同期チェックリスト                         | チェックリスト文書       |
| Follow-up Formalization   | 未タスクの3ステップ管理 + current/baseline 切り分け | formalization ルール文書 |

### 1.2 対象ファイル（読み取り + ルール定義）

| ファイル                                                                               | 操作                        |
| -------------------------------------------------------------------------------------- | --------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | 構造分析 + ルール定義       |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`            | 構造分析                    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`         | 構造分析                    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`           | 構造分析 + ルール定義       |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                 | 構造分析 + ルール定義       |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`         | 構造分析                    |
| `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`  | 構造分析 + bridge rule 定義 |
| `.claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md` | 構造分析                    |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                          | 同期ルール定義              |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                         | 同期ルール定義              |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                       | 同期ルール定義              |

## 2. 除外スコープ（Out of Scope）

| 除外対象                     | 理由                                                                       |
| ---------------------------- | -------------------------------------------------------------------------- |
| プロダクションコードの変更   | 本タスクは設計タスク（type: design）であり、コード変更は後続タスクで実施   |
| IPC ハンドラの実装・修正     | governance ルールの定義のみ、IPC 契約の変更は含まない                      |
| UI コンポーネントの変更      | governance 仕様が UI に影響する場合でも、変更自体は後続実装タスクで実施    |
| Electron Main Process の変更 | 同上                                                                       |
| テストコードの新規作成       | Phase 4 でテスト設計を行うが、テストコードファイルの作成は後続タスクで実施 |
| `.agents/skills/` の直接編集 | Mirror sync は `.claude/` canonical → `.agents/` mirror の一方向のみ       |
| GitHub Issue の作成・変更    | Issue 操作は Phase 12 Task 4 または後続タスクで実施                        |

## 3. 依存タスク

### 3.1 前提依存（本タスクが依存するタスク）

| タスクID                                                  | 名称                     | 依存内容                                                  |
| --------------------------------------------------------- | ------------------------ | --------------------------------------------------------- |
| TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | foundation 契約          | canonical source / state 語彙 / CTA 契約の基盤定義        |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                | runtime policy 集約      | policy 集約の完了が governance 定義の前提                 |
| TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001        | settings shell access    | access matrix の定義が governance scope に含まれない前提  |
| TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001        | chat workspace guidance  | workspace guidance の wiring が governance scope 外の前提 |
| TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001         | terminal handoff surface | handoff surface の実装が governance scope 外の前提        |
| TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001        | transcript provenance    | provenance linkage の実装が governance scope 外の前提     |
| TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001           | chatpanel review harness | review harness の実装が governance scope 外の前提         |
| TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001     | slide modifier fallback  | manual fallback の実装が governance scope 外の前提        |

### 3.2 後続依存（本タスクに依存するタスク）

本タスクの governance 仕様は、全後続タスクの Phase 12（ドキュメント）で参照される。governance 仕様が未確定のまま Phase 12 に入ると、同期ルールが不確定になり drift が再発する。

## 4. Gate 条件

### 4.1 Phase 1-3 設計ゲート

Phase 4 以降の着手条件:

- Phase 1: 要件定義書 + スコープ定義 + 現状棚卸し → 全成果物が outputs/phase-1/ に存在
- Phase 2: 設計サマリー + 契約マトリクス + 検証マトリクス → 全成果物が outputs/phase-2/ に存在
- Phase 3: 設計レビュー PASS または MINOR（MINOR は未タスク化後に Phase 4 進行可）

### 4.2 Phase 13 Blocked 条件

- ユーザー指示なしに commit / PR を作成しない
- Phase 12 の全チェックリスト完了が前提
