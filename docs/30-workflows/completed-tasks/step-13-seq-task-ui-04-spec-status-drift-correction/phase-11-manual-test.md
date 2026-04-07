# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 11                                  |
| Phase名    | 手動テスト                          |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 10: 最終レビュー              |
| 次Phase    | Phase 12: ドキュメント更新          |
| ステータス | completed                           |
| 作成日     | 2026-04-06                          |

## 目的

ドキュメントリンクの手動確認を行い、開発者が実際にドキュメントをナビゲートした際に問題がないことを保証する。

## 実行タスク

### Task 1: ドキュメントナビゲーション確認

開発者の視点で以下のナビゲーションパスを手動で確認する。

| #   | ナビゲーションパス                                 | 期待結果                  | 結果 |
| --- | -------------------------------------------------- | ------------------------- | ---- |
| 1   | executor-guide.md → 各タスクの index.md            | リンクが正しく遷移する    | -    |
| 2   | 親 index.md → 各タスクディレクトリ                 | リンクが正しく遷移する    | -    |
| 3   | 各 index.md → phase ファイル                       | 全 phase へのリンクが有効 | -    |
| 4   | completed-tasks/ 内のタスク → outputs ディレクトリ | 構造が保持されている      | -    |
| 5   | 各タスクの index.md → 依存タスクの index.md        | 相互参照が有効            | -    |

### Task 2: ステータス表示の視覚確認

各タスク仕様書を開き、ステータスが直感的に正しく表示されていることを確認する。

| タスクID   | index.md ステータス | artifacts.json status | 表示が正しい |
| ---------- | ------------------- | --------------------- | ------------ |
| TASK-P0-01 | -                   | -                     | -            |
| TASK-P0-02 | -                   | -                     | -            |
| TASK-P0-04 | -                   | -                     | -            |
| TASK-P0-05 | -                   | -                     | -            |
| TASK-P0-06 | -                   | -                     | -            |
| TASK-P0-07 | -                   | -                     | -            |
| TASK-P0-08 | -                   | -                     | -            |
| TASK-P0-09 | -                   | -                     | -            |

### Task 3: 残作業記録の確認

部分完了タスクの残作業記録が、次の開発者が見たときに何をすべきか明確に理解できる内容であることを確認する。

確認観点:

- 残作業が具体的で actionable であるか
- 見積もりが妥当であるか
- ブロッカーが明確であるか

### Task 4: 「初見者テスト」

プロジェクトに初めて参加する開発者の視点で、以下を確認する:

- executor-guide.md を読んで、どのタスクが完了済みでどのタスクが残っているか判断できるか
- 残作業があるタスクを見つけた場合、何をすべきか理解できるか

## 統合テスト連携

- `index.md` / `artifacts.json` の `タスク種別` を `docs-only` に揃える。
- `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` を手動確認の正本として揃える。
- スクリーンショットは生成せず、`NON_VISUAL` として扱う。

## 参照資料

| 資料名               | パス                                                               | 説明       |
| -------------------- | ------------------------------------------------------------------ | ---------- |
| 修正計画             | `outputs/phase-2/correction-plan.md`                               | 上流設計   |
| 実装記録             | `outputs/phase-5/implementation-record.md`                         | 実装の参照 |
| テスト拡充記録       | `outputs/phase-6/test-expansion.md`                                | 検証の参照 |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                               | 検証入力   |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                               | 整理内容   |
| 品質保証レポート     | `outputs/phase-9/qa-report.md`                                     | 品質結果   |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                          | ゲート入力 |
| executor-guide       | `docs/30-workflows/skill-creator-agent-sdk-lane/executor-guide.md` | 確認対象   |
| 親 index.md          | `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`          | 確認対象   |

## 成果物

| 成果物                   | パス                                        | 説明                             |
| ------------------------ | ------------------------------------------- | -------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 手動確認項目の一覧               |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | ナビゲーション結果、視覚確認結果 |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     | 発見した課題（0件でも出力）      |

## 完了条件

- [ ] 全ナビゲーションパスが確認されている
- [ ] ステータス表示が視覚的に正しいことが確認されている
- [ ] 残作業記録の可読性が確認されている
- [ ] 「初見者テスト」が実施されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
