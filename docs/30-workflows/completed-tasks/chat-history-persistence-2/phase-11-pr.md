# Phase 11: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 11                     |
| Phase名    | PR作成                 |
| 前提Phase  | Phase 10               |
| 後続Phase  | -                      |
| ステータス | 未実施                 |
| 作成日     | 2026-01-04             |
| 機能名     | チャット履歴永続化機能 |

---

## 目的

全ての変更をコミットし、Pull Requestを作成してCI確認を行う。マージ準備を完了させる。

## 背景

全ての開発作業が完了した段階で、変更をmainブランチにマージするためのPRを作成する。CIが成功することを確認し、レビュー可能な状態にする。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: ci-cd-pipelines

**パス**: `.claude/skills/ci-cd-pipelines/SKILL.md`

**Trigger条件**:
CI/CDパイプラインの確認が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. CIパイプラインの動作を確認
3. 失敗した場合は修正

**期待される成果物**:

- CI成功確認

---

## 参照資料

| 参照資料      | パス                                                  | 内容     |
| ------------- | ----------------------------------------------------- | -------- |
| 全Phase成果物 | `docs/30-workflows/chat-history-persistence/outputs/` | 全成果物 |

---

## 成果物

| 成果物       | パス    | 内容         |
| ------------ | ------- | ------------ |
| Gitコミット  | Git履歴 | 変更コミット |
| Pull Request | GitHub  | PR           |

---

## 完了条件

- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが成功している
- [ ] PRの説明が適切に記載されている
- [ ] レビュー依頼が送信されている

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: なし（タスク完了）

---

## 実行手順

### 1. 変更の確認

```bash
# 変更ファイル一覧
git status

# 差分確認
git diff
```

### 2. コミット

```bash
# 変更をステージング
git add .

# コミット（Conventional Commits形式）
git commit -m "feat(chat): チャット履歴永続化機能を実装

- 履歴の自動保存機能
- 履歴一覧・検索機能
- Markdown/JSONエクスポート機能
- お気に入り/ピン留め機能

Closes: TASK-CHAT-HISTORY-001"
```

### 3. プッシュ

```bash
git push -u origin feat/chat-history-persistence
```

### 4. PR作成

```bash
gh pr create --title "feat(chat): チャット履歴永続化機能" --body "## Summary
- チャット履歴の自動保存機能を実装
- 履歴一覧・検索機能を追加
- Markdown/JSONエクスポート機能を追加
- お気に入り/ピン留め機能を追加

## Test plan
- [ ] 履歴が自動保存されることを確認
- [ ] 検索機能が動作することを確認
- [ ] エクスポート機能が動作することを確認
- [ ] 全自動テストが成功することを確認

Closes: TASK-CHAT-HISTORY-001

🤖 Generated with Claude Code"
```

### 5. CI確認

```bash
# CI状態確認
gh pr checks
```

---

## PR説明テンプレート

```markdown
## Summary

チャット履歴永続化機能を実装しました。

### 主な変更点

- **保存機能**: チャットセッションの自動保存
- **履歴管理**: 履歴一覧表示、検索、削除、お気に入り
- **エクスポート**: Markdown/JSON形式でのエクスポート

### 技術的な変更

- 新規テーブル: `chat_sessions`, `messages`, `attachments`
- 新規Service: `ChatHistoryService`, `ExportService`
- 新規UI: `ChatHistoryList`, `ChatHistorySearch`

## Test plan

- [ ] ユニットテストが成功する
- [ ] 統合テストが成功する
- [ ] E2Eテストが成功する
- [ ] 手動テストシナリオが成功する

## Screenshots

（必要に応じてスクリーンショットを追加）

## Related issues

- Closes: TASK-CHAT-HISTORY-001

🤖 Generated with Claude Code
```

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 使用スキル

- ci-cd-pipelines: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### タスク全体の振り返り

-
```

---

## タスク完了

PRがマージされたら、このタスクは完了です。

1. Worktreeのクリーンアップ
2. ブランチの削除
3. タスク状態の更新

```bash
# Worktreeに戻る
cd /path/to/main/repo

# Worktreeの削除
git worktree remove .worktrees/task-chat-history-001

# ブランチの削除（マージ後）
git branch -d feat/chat-history-persistence
```
