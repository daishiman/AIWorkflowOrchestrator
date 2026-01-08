# Phase 13: PR作成

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 13              |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

変更をコミットし、Pull Requestを作成してCIを確認する。

## 使用スキル

| スキル           | 選定理由                                     |
| ---------------- | -------------------------------------------- |
| `/ai:diff-to-pr` | 差分確認・コミット・PR作成・CI確認を一括実行 |

## 参照資料

| 資料名           | パス                                       | 説明           |
| ---------------- | ------------------------------------------ | -------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`  | Phase 10成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`   | Phase 11成果物 |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md` | Phase 12成果物 |

## 実行手順

### ステップ1: `/ai:diff-to-pr` を実行

```
/ai:diff-to-pr
```

### ステップ2: 実行結果の確認

- PRが作成されていること
- CIが通過していること

### ステップ3: フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# 変更の確認
git status
git diff

# コミット
git add .
git commit -m "feat(logging): ConversionLoggerサービス実装

- ConversionLoggerクラス実装
- Zodスキーマによる型定義
- バッファリング/自動フラッシュ機能
- テストスイート完備

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin feature/logging-service

# PR作成
gh pr create --title "feat(logging): ConversionLoggerサービス実装" --body "..."
```

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/logging-service/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep logging-service

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): logging-serviceをcompleted-tasksに移動"
git push
```

### 未タスク指示書の処理

Phase 12で未タスクが検出されていない場合、元の未タスク指示書を削除する:

```bash
# 元の未タスク指示書を削除
rm docs/30-workflows/unassigned-task/task-05-01-logging-service.md

# 変更をコミット
git add docs/30-workflows/unassigned-task/
git commit -m "docs(workflows): task-05-01-logging-service完了により指示書削除"
git push
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 変更差分の確認
2. /ai:diff-to-pr の実行
3. PR作成確認
4. CI通過確認
5. タスクディレクトリの移動
6. 未タスク指示書の処理
7. PR情報の記録
8. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全作業を100%完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 13
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル         | 結果                        | 備考                     |
| -------------- | --------------------------- | ------------------------ |
| /ai:diff-to-pr | {{success/failure/partial}} | PR作成・CI確認の実施結果 |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### タスク完了記録

-

## 次のPhase

なし（ワークフロー完了）
