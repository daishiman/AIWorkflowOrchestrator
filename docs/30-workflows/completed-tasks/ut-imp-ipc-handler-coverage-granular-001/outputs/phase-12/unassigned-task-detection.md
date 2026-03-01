# 未タスク検出レポート

## メタ情報

| 項目     | 値                                       |
| -------- | ---------------------------------------- |
| タスクID | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| Phase    | 12                                       |
| 検出日   | 2026-02-28                               |

## 検出ソース確認

| ソース                          | 確認結果                                                             | 未タスク件数 |
| ------------------------------- | -------------------------------------------------------------------- | ------------ |
| Phase 3 レビュー結果            | PASS判定、MINOR指摘なし                                              | 0件          |
| Phase 10 レビュー結果           | PASS判定、MINOR指摘なし                                              | 0件          |
| Phase 11 手動テスト             | P41影響の記録のみ、スコープ外発見なし                                | 0件          |
| コードベース (TODO/FIXME)       | `grep -rn "TODO\|FIXME" coverage-by-handler.ts` → 該当なし           | 0件          |
| documentation-changelog苦戦箇所 | Istanbul形式誤認・命名例外・Vitest include漏れの再発防止タスクを抽出 | 1件          |
| Phase 11 発見事項               | schedule/docs系ハンドラのテスト未作成（ただし本タスクのスコープ外）  | 参考情報     |

## 検出結果

**未タスク件数: 1件**

Phase 3, Phase 10ともにPASS判定であり、MINORの指摘事項なし。コードベースにTODO/FIXMEの残置もなし。  
一方で、`documentation-changelog.md` の苦戦箇所から再発防止が必要な改善タスクを1件検出した。

## 未タスク詳細（今回追加）

| タスクID                                   | タスク名                                        | 優先度 | 配置先                                                                                              |
| ------------------------------------------ | ----------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| UT-IMP-IPC-HANDLER-COVERAGE-GUARDRAILS-001 | IPCハンドラ単位カバレッジ計測ガードレール自動化 | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-ipc-handler-coverage-guardrails-001.md` |

## 監査補足（2026-03-01 再確認）

`node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` を再実行し、以下を確認した。

- `currentViolations: 0`（今回差分に起因する未タスクフォーマット/命名/配置違反はなし）
- `baselineViolations: 71`（既存バックログとして別管理）
- `misplacedFiles: 0`（`docs/30-workflows/unassigned-task/` 配置ルールは維持）

## 参考情報（スコープ外）

Phase 11の手動テストで、schedule/docs系ハンドラ（9ハンドラ）のテストが未作成であることが確認された。これは本タスク（カバレッジ測定基盤構築）のスコープ外であり、各ハンドラの実装タスクの一部として対応すべき事項。

## 3ステップ確認

- [x] `unassigned-task/` に指示書作成後、Phase 12完了移管により `completed-tasks/unassigned-task/` へ移動（`task-imp-ipc-handler-coverage-guardrails-001.md`）
- [x] `task-workflow.md` 残課題テーブルに登録
- [x] 関連仕様書（`quality-requirements.md`）に参照リンク追加
