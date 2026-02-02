# TASK-8C-C: E2Eテスト - インポート・実行フロー

## 概要

| 項目         | 値                              |
| ------------ | ------------------------------- |
| タスクID     | TASK-8C-C                       |
| Tier         | 1                               |
| 優先度       | high                            |
| 複雑度       | medium                          |
| ステータス   | pending                         |
| 依存タスク   | TASK-7D, TASK-8C-E              |
| 並列実行可能 | TASK-8C-A, TASK-8C-B, TASK-8C-D |
| タグ         | test, e2e, playwright           |

## 目的

スキルインポートと実行のE2Eテストを実装する（6ケース + 追加テスト）。

## 入力

- **TASK-7D**: ChatPanel統合
- **TASK-8C-E**: テストフィクスチャ

## 出力

- `apps/desktop/src/__tests__/skillImportExecution.e2e.ts`

## テストケース一覧

| TC   | テストケース名           | カテゴリ             |
| ---- | ------------------------ | -------------------- |
| TC-1 | インポートダイアログ表示 | Skill Import Flow    |
| TC-2 | スキル詳細表示           | Skill Import Flow    |
| TC-3 | インポート実行           | Skill Import Flow    |
| TC-4 | ストリーミング表示       | Skill Execution Flow |
| TC-5 | 停止ボタン表示           | Skill Execution Flow |
| TC-6 | 実行中止                 | Skill Execution Flow |
| TC-7 | 再スキャン実行           | Rescan Flow          |

## Phase構成

| Phase | 名称                 | 成果物                                   |
| ----- | -------------------- | ---------------------------------------- |
| 1     | 要件定義             | 要件定義書、受け入れ基準                 |
| 2     | 設計                 | アーキテクチャ設計、セレクタ設計         |
| 3     | 設計レビューゲート   | レビュー結果                             |
| 4     | テスト作成           | skillImportExecution.e2e.ts（Red状態）   |
| 5     | 実装                 | skillImportExecution.e2e.ts（Green状態） |
| 6     | テスト拡充           | 追加テストケース                         |
| 7     | テストカバレッジ確認 | カバレッジレポート                       |
| 8     | リファクタリング     | 品質改善済みテスト                       |
| 9     | 品質保証             | 品質レポート                             |
| 10    | 最終レビューゲート   | レビュー結果                             |
| 11    | 手動テスト検証       | 手動テスト結果                           |
| 12    | ドキュメント更新     | 実装ガイド、更新履歴                     |
| 13    | PR作成               | PR情報                                   |

## 完了条件

- [ ] 6件のインポート・実行E2Eテストが実装されている
- [ ] 全テストが通過する
- [ ] インポートフローがテストされている
- [ ] 実行フローがテストされている

## 参照資料

| 資料                   | パス                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------- |
| 元タスク仕様書         | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-c-e2e-import-execute.md` |
| E2Eテスト仕様          | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`          |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`   |
| テストフィクスチャ     | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`             |

## 変更履歴

| バージョン | 日付       | 変更内容                 |
| ---------- | ---------- | ------------------------ |
| 1.0.0      | 2026-02-02 | Phase 1-13仕様書初版作成 |
