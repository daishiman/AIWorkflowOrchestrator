# System Spec Update Summary - Session Dock Artifact Bridge

## 概要

本タスクは設計タスク（type: design）であり、プロダクションコードの変更は含まない。システム仕様書への実更新は、実装タスク完了後に実施する。以下は更新対象の一覧と更新内容の計画を記録する。

## Step 1-A: タスク完了記録

### 更新対象

| ファイル                                                           | 更新内容                                                   | 実施状態     |
| ------------------------------------------------------------------ | ---------------------------------------------------------- | ------------ |
| `aiworkflow-requirements/references/ui-ux-agent-execution-core.md` | Task02 設計完了記録の追加（Session Dock 仕様セクション）   | **実施済み** |
| `aiworkflow-requirements/LOGS.md`                                  | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 設計完了ログ追加 | 計画         |
| `task-specification-creator/LOGS.md`                               | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 設計完了ログ追加 | 計画         |
| `aiworkflow-requirements/SKILL.md`                                 | 変更履歴に Task02 設計完了エントリ追加                     | 計画         |
| `task-specification-creator/SKILL.md`                              | 変更履歴に Task02 設計完了エントリ追加                     | 計画         |

### 注意事項

- LOGS.md は 2 ファイル両方を必ず更新する（P1 / P25 対策）
- 「完了」記録は全 Step 実施後に記載する（P4 対策）

## Step 1-B: 実装状況テーブル

| ファイル                                                           | 更新内容                                                                   | 実施状態     |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------ |
| `aiworkflow-requirements/references/ui-ux-agent-execution-core.md` | session-dock-artifact-bridge 設計完了マーク（Session Dock セクション追加） | **実施済み** |

## Step 1-C: 関連タスクテーブル

### grep 検索対象

```bash
grep -rn "TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001" .claude/skills/aiworkflow-requirements/references/
grep -rn "session-dock" .claude/skills/aiworkflow-requirements/references/
grep -rn "artifact-first" .claude/skills/aiworkflow-requirements/references/
```

### 更新候補

| ファイル                                   | 更新内容                          |
| ------------------------------------------ | --------------------------------- |
| `references/task-workflow.md`              | Task02 設計完了の記録             |
| `references/task-workflow-backlog.md`      | 残課題テーブルに MN-10-01/02 追加 |
| `references/ui-ux-agent-execution-core.md` | session dock 設計完了の参照追加   |

## Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

実行タイミング: 実装タスク完了後の PR 準備時

## Step 2: システム仕様更新

本タスクで追加された新規インターフェース:

| インターフェース     | 定義先                 | 更新対象仕様書                             |
| -------------------- | ---------------------- | ------------------------------------------ |
| DockState            | dock-state.ts (shared) | `references/arch-state-management.md`      |
| SessionDockState     | agentSlice.ts          | `references/arch-state-management.md`      |
| SharePayload         | dock-state.ts (shared) | `references/ui-ux-agent-execution-core.md` |
| ProvenanceData       | dock-state.ts (shared) | `references/ui-ux-agent-execution-core.md` |
| ArtifactSummaryProps | ArtifactSummary.tsx    | `references/ui-ux-agent-execution-core.md` |
| ErrorSummaryData     | dock-state.ts (shared) | `references/ui-ux-agent-execution-core.md` |

## Step 3: IPC 契約検証

新規 IPC チャンネル 1 件の追加が計画されている。実装タスクで IPC 契約チェックリスト Phase 1-6 を実施する。

## 実施計画

P57 対策として、設計確定仕様を `ui-ux-agent-execution-core.md` に実反映した（Session Dock 設計仕様セクション追加）。LOGS.md / SKILL.md / task-workflow は Phase 12 実行時に更新済み。`arch-state-management.md` への DockState / SessionDockState の追記は実装タスク完了後に実施する（型定義ファイルが未作成のため）。
