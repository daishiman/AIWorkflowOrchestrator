# TASK-10A-E-C Store駆動ライフサイクル統合設計

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-10A-E-C                                    |
| タイトル   | Store駆動ライフサイクル統合設計                 |
| 作成日     | 2026-03-06                                      |
| ステータス | spec_created                                    |
| 依存タスク | TASK-10A-E                                      |
| 並列タスク | TASK-10A-E-A, TASK-10A-E-B                      |
| ブロック先 | TASK-10A-E-D                                    |
| 対象       | SkillManagementPanel の state/selectors/actions |
| 実行モード | 仕様策定のみ（実装・コミット・PRなし）          |
| 方針       | 直接IPC呼び出し禁止、store action経由に統一     |

## 目的

import操作後に一覧が即時再計算される状態遷移を定義し、`TASK-10A-F`と衝突しないstore境界を設計する。

## Phase一覧

| Phase | 名称             | ファイル                       | ステータス | 説明                               |
| ----- | ---------------- | ------------------------------ | ---------- | ---------------------------------- |
| 1     | 要件定義         | `phase-1-requirements.md`      | pending    | 要件抽出・受入基準定義             |
| 2     | 設計             | `phase-2-design.md`            | pending    | selector/action/境界設計           |
| 3     | 設計レビュー     | `phase-3-design-review.md`     | pending    | 要件・設計の妥当性検証             |
| 4     | テスト作成       | `phase-4-test-creation.md`     | pending    | テストケース設計・テストコード作成 |
| 5     | 実装             | `phase-5-implementation.md`    | pending    | プロダクションコード実装           |
| 6     | テスト拡充       | `phase-6-test-expansion.md`    | pending    | カバレッジ不足箇所のテスト追加     |
| 7     | カバレッジ確認   | `phase-7-coverage-check.md`    | pending    | カバレッジ基準の充足確認           |
| 8     | リファクタリング | `phase-8-refactoring.md`       | pending    | コード品質改善                     |
| 9     | 品質検証         | `phase-9-quality-assurance.md` | pending    | Lint・型チェック・全テスト実行     |
| 10    | 最終レビュー     | `phase-10-final-review.md`     | pending    | 多角的品質・整合性検証             |
| 11    | 手動テスト       | `phase-11-manual-test.md`      | pending    | UIテスト・状態遷移確認・P31確認    |
| 12    | ドキュメント     | `phase-12-documentation.md`    | pending    | 実装ガイド・仕様更新・未タスク検出 |
| 13    | 完了             | `phase-13-pr-creation.md`      | pending    | 成果物最終確認・PR準備             |

## 実行タスク概要

- selector設計: imported / available / filtered の算出責務を定義
- action設計: import実行中フラグ、成功後再読込、失敗時エラー保持を定義
- 競合回避: `TASK-10A-F`のcreate/analyze経路と責務重複しない境界を定義
- 再レンダー方針: 個別selector優先、P31無限ループ回避条件を定義

## 参照資料

| 参照資料      | パス                                                                                        | 使用目的                     |
| ------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| 状態管理仕様  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector/action分離とP31対策 |
| Skill API仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | store actionの戻り値契約     |
| 実装パターン  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | React + storeの責務分離      |
| エラー仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | UI表示に渡すエラー分類       |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 状態遷移回帰を防ぐ品質ゲート |

## 親タスク仕様書

`../skill-import-agent-system/tasks/completed-task/task-043c-store-lifecycle-integration-design.md`
