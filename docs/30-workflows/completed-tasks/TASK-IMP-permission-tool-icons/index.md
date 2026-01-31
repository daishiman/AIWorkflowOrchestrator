# TASK-IMP-permission-tool-icons: PermissionDialog ツール別アイコン表示

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | task-imp-permission-tool-icons-001    |
| Issue        | #586                                  |
| タスク名     | PermissionDialog ツール別アイコン表示 |
| 分類         | 改善（UX向上）                        |
| 対象機能     | PermissionDialog（Desktop Renderer）  |
| 優先度       | 中                                    |
| 見積もり規模 | 小規模                                |
| ステータス   | Phase仕様書作成済み                   |
| 発見元       | TASK-7C 元タスク仕様書                |
| 発見日       | 2026-01-30                            |
| 依存タスク   | TASK-7C（完了済み）                   |

## 概要

PermissionDialogのツール名表示にEmoji アイコンを追加し、ユーザーがツールの種類を視覚的に即座に識別できるようにする。現状はテキストバッジのみの表示であり、元タスク仕様書に含まれていたtoolIconsマッピング機能を実装する。

## 対象ファイル

| ファイル               | パス                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| 修正対象コンポーネント | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                |
| テストファイル         | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` |

## Phase一覧

| Phase | 名称                 | カテゴリ     | ステータス |
| ----- | -------------------- | ------------ | ---------- |
| 1     | 要件定義             | 要件         | 未実施     |
| 2     | 設計                 | 設計         | 未実施     |
| 3     | 設計レビューゲート   | ゲート       | 未実施     |
| 4     | テスト作成           | TDD-Red      | 未実施     |
| 5     | 実装                 | TDD-Green    | 未実施     |
| 6     | テスト拡充           | 品質         | 未実施     |
| 7     | テストカバレッジ確認 | 品質         | 未実施     |
| 8     | リファクタリング     | TDD-Refactor | 未実施     |
| 9     | 品質保証             | 品質         | 未実施     |
| 10    | 最終レビューゲート   | ゲート       | 未実施     |
| 11    | 手動テスト検証       | 検証         | 未実施     |
| 12    | ドキュメント更新     | 文書化       | 未実施     |
| 13    | PR作成               | 完了         | 未実施     |

## 参照情報

| ドキュメント               | パス                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| 元タスク仕様書             | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-7c-permission-dialog.md` |
| 未タスク指示書             | `docs/30-workflows/unassigned-task/task-imp-permission-tool-icons-001.md`                       |
| PermissionDialog実装ガイド | `docs/30-workflows/TASK-7C-permission-dialog/outputs/phase-12/implementation-guide.md`          |
| UI/UX仕様書                | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    |
| UI/UXデザインシステム      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                      |
| インターフェース仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                  |
