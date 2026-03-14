# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 13                                                                                                                                                                                                                                    |
| Phase名    | PR作成                                                                                                                                                                                                                                |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001                                                                                                                                                                                             |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト）、Phase 12（ドキュメント） |
| 後続Phase  | なし                                                                                                                                                                                                                                  |
| ステータス | not_started                                                                                                                                                                                                                           |
| 作成日     | 2026-03-13                                                                                                                                                                                                                            |
| 機能名     | claude-code-terminal-surface                                                                                                                                                                                                          |

## 目的

Claude Code terminal surface と手動操作境界の整流に関する変更範囲と証跡を、PR作成前レビュー用に整理する。

## 実行タスク

- PR サマリ整理: launch / session / transcript / boundary 変更の要点を整理する
- 証跡整理: Phase 10 までのレビュー結果、Phase 11 手動テスト、Phase 12 仕様同期成果物を束ねる
- リスク整理: release risk、rollback、follow-up 未タスクを明記する
- ブロック管理: ユーザー明示承認がない場合は PR 実行を行わず `blocked` として記録する

## 参照資料

| 参照資料                    | パス                                        | 内容                                 |
| --------------------------- | ------------------------------------------- | ------------------------------------ |
| Phase 1（要件定義）         | `phase-1-requirements.md`                   | 依存する前提成果物を確認する         |
| Phase 2（設計）             | `phase-2-design.md`                         | 依存する前提成果物を確認する         |
| Phase 5（実装）             | `phase-5-implementation.md`                 | 依存する前提成果物を確認する         |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                 | 依存する前提成果物を確認する         |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                 | 依存する前提成果物を確認する         |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                    | 依存する前提成果物を確認する         |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`              | 依存する前提成果物を確認する         |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                  | 依存する前提成果物を確認する         |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                   | 依存する前提成果物を確認する         |
| Phase 12（ドキュメント）    | `phase-12-documentation.md`                 | 依存する前提成果物を確認する         |
| 最終レビュー報告            | `outputs/phase-10/final-review-report.md`   | 判定根拠と戻り先を確認する           |
| 手動テスト結果              | `outputs/phase-11/manual-test-result.md`    | 代表シナリオ結果と証跡計画を確認する |
| 仕様同期計画                | `outputs/phase-12/system-spec-sync-plan.md` | system spec 同期範囲と根拠を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                 | パス                                                                                            | 内容                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------- |
| workflow-ai-runtime-authmode-unification | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | Step-01 foundation 契約の最終参照先 |
| task-workflow                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了台帳と未タスク導線の正本        |
| lessons-learned                          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再利用手順の正本          |
| legacy-ordinal-family-register           | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧 filename 互換管理の正本          |
| resource-map                             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | 必要仕様の抽出順を確認する          |
| quick-reference                          | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | 検索キーワードと読込順を確認する    |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Claude Code terminal surface と手動操作境界の整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

PR作成 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: blocked 条件を確認する

ユーザー明示承認がない場合は commit / PR 作成を実施せず、`blocked` と理由を成果物に記録する。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物          | パス                                   | 内容                   |
| --------------- | -------------------------------------- | ---------------------- |
| PR サマリ下書き | `outputs/phase-13/pr-summary-draft.md` | 変更点と証跡をまとめる |

## 完了条件

- [ ] PR 用の説明素材が揃っている
- [ ] ユーザー承認前は `blocked` として記録し、commit / PR を実行していない

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PR実行可否（承認有無）を成果物へ明記
- [ ] blocked 条件と解除条件を成果物へ明記
- [ ] Phase 12 までの完了根拠リンクを成果物へ明記

## 次のPhase

- なし（仕様書作成完了）
