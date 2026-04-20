---
phase: 12
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
artifact: unassigned-task-detection
created_date: 2026-04-20
status: completed
---

# Phase 12 成果物: 未タスク検出レポート

## 検出結果サマリー

| 区分                     | 件数 |
| ------------------------ | ---- |
| 緊急（blocker）          | 0    |
| 推奨（nice-to-have）     | 2    |
| scope 外（別タスク起票） | 2    |
| 合計                     | 4    |

## 推奨（nice-to-have）

### UT-001: markdownlint-cli2 導入

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| 優先度     | 推奨                                                                           |
| 検出元     | Phase 9 品質ゲート実行中                                                       |
| 現状       | プロジェクトに Markdown lint ツールが未導入、目視確認で代替                    |
| 提案       | `markdownlint-cli2` を devDependency 追加、`pnpm lint:md` スクリプト定義       |
| 影響       | docs-sync wave の品質ゲート自動化                                              |
| 関連スキル | task-specification-creator（品質ゲート設計）                                   |
| 起票先     | `docs/30-workflows/unassigned-task/task-markdownlint-cli2-introduction-001.md` |

### UT-002: repo-wide sync wave template 化

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 優先度     | 推奨                                                                                            |
| 検出元     | 本タスク設計時点                                                                                |
| 現状       | repo-wide sync wave が 1 回目の実施で、テンプレート化されていない                               |
| 提案       | `phase-templates.md`（task-spec-creator）に `NON_VISUAL repo-wide sync wave` テンプレートを追加 |
| 影響       | 将来の親タスク close-out 波及を高速化                                                           |
| 関連スキル | task-specification-creator, aiworkflow-requirements                                             |
| 起票先     | `docs/30-workflows/unassigned-task/task-nonvisual-repo-wide-sync-wave-template-001.md`          |

## scope 外（別タスクで扱う）

### UT-003: Issue #2229 再実装

| 項目   | 内容                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 優先度 | scope 外（別系統）                                                       |
| 検出元 | 親タスク Phase 1 要件定義時点で明示除外                                  |
| 内容   | キャンセル時の UI 警告の再実装                                           |
| 理由   | 親タスクと本タスクは「既存実装の差分確認 + close-out 波及」に scope 限定 |
| 起票先 | Issue #2229（既存）                                                      |

### UT-004: mirror 配下 parity 自動化（`.claude/agents/` / canonical）

| 項目    | 内容                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------- |
| 優先度  | scope 外（別タスク候補）                                                                                               |
| 検出元  | Phase 12 mirror 同期時の観察                                                                                           |
| 内容    | canonical ↔ mirror の parity guard 自動化                                                                              |
| 理由    | 既存 `TASK-AGENTS-SKILLS-FULL-SYNC-001`（Issue #2341）で canonical/mirror parity guard 導入済のため、本タスク scope 外 |
| 関連 PR | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/`                                                                  |

## 本タスク（TASK-SC-CANCEL-LOGS-SYNC-001）の位置づけ

本タスクは親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の follow-up として発足し、
Issue #2313 で報告された同期漏れ 6 項目のうち scope 内 5 項目（AC-1〜AC-5）を解決した。

| 親タスク                                                      | 本タスク                                            |
| ------------------------------------------------------------- | --------------------------------------------------- |
| TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001（branch 内 close-out） | TASK-SC-CANCEL-LOGS-SYNC-001（repo-wide sync wave） |

親 `index.md` → 本タスク逆参照は以下の 2 経路で確保：

1. 親 `index.md` の `## Follow-up 同期` セクション（直接リンク）
2. 本 `unassigned-task-detection.md`（本ファイル）経由（Phase 12 成果物として）

## 参照（本タスクへの逆参照）

- 親タスク: [TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001](../../../TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md)
- 本タスク: [TASK-SC-CANCEL-LOGS-SYNC-001](../../index.md)
- 関連 Issue: #2313

## 参照資料

- [implementation-guide.md](implementation-guide.md)
- [skill-feedback-report.md](skill-feedback-report.md)
- [../phase-11/discovered-issues.md](../phase-11/discovered-issues.md)
