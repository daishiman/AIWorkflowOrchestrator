# Phase 11: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容           |
| ---------- | -------------- |
| Phase      | 11             |
| Phase名    | PR作成         |
| 前提Phase  | Phase 10       |
| 後続Phase  | -              |
| ステータス | 未実施         |
| 作成日     | 2026-01-04     |
| 機能名     | 検索・置換機能 |

---

## 目的

コードの変更をコミットし、Pull Requestを作成してCIを確認する。

## 背景

全てのPhaseが完了し、品質が確認された変更をmainブランチにマージするためのPull Requestを作成する。

---

## 使用スキル

> PRは手動で作成するか、GitHubツールを使用してください。

### スキル: なし（標準のGit/GitHub操作）

---

## 参照資料

| 参照資料       | パス                             | 内容               |
| -------------- | -------------------------------- | ------------------ |
| 全Phase成果物  | `outputs/`                       | 全成果物           |
| コミットルール | `.kamui/prompt/merge-prompt.txt` | Git/PRワークフロー |

---

## 成果物

| 成果物     | パス           | 内容         |
| ---------- | -------------- | ------------ |
| GitHub PR  | GitHub UI      | Pull Request |
| CIパス結果 | GitHub Actions | CI実行結果   |

---

## PR作成手順

### 1. 変更のコミット

```bash
# 変更確認
git status

# 変更をステージング
git add .

# コミット
git commit -m "feat(search): implement search and replace functionality

- Add file search with Ctrl+F shortcut
- Add workspace search with Ctrl+Shift+F shortcut
- Add find and replace functionality
- Add regex and case-sensitive options
- Add exclude patterns for workspace search

Closes #XXX"
```

### 2. リモートにプッシュ

```bash
git push origin feature/search-replace
```

### 3. Pull Request作成

```bash
gh pr create \
  --title "feat(search): 検索・置換機能の実装" \
  --body "$(cat <<'EOF'
## 概要

ファイル内およびワークスペース全体での検索・置換機能を実装しました。

## 変更内容

### 新機能
- ファイル内検索（Ctrl+F）
- ファイル内置換（Ctrl+H）
- ワークスペース検索（Ctrl+Shift+F）
- ワークスペース置換

### 検索オプション
- 大文字/小文字区別
- 単語単位検索
- 正規表現検索

### その他
- キーボードナビゲーション対応
- アクセシビリティ対応

## テスト

- [ ] ユニットテスト: PASS
- [ ] E2Eテスト: PASS
- [ ] 手動テスト: PASS
- [ ] テストカバレッジ: 80%以上

## 関連Issue

Closes #XXX

## スクリーンショット

（該当する場合）

---

🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"
```

### 4. CI確認

- [ ] Lint/Format チェック
- [ ] TypeScript 型チェック
- [ ] ユニットテスト
- [ ] E2Eテスト
- [ ] ビルド

---

## PRチェックリスト

### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] 全テストPASS
- [ ] テストカバレッジ80%以上
- [ ] コードレビュー準備完了

### ドキュメント

- [ ] ユーザーガイド更新済み
- [ ] 開発者ドキュメント更新済み
- [ ] API仕様更新済み
- [ ] キーボードショートカット更新済み

### CI/CD

- [ ] GitHub Actions PASS
- [ ] ビルド成功
- [ ] デプロイ準備完了（該当する場合）

---

## 完了条件

- [ ] 変更がコミットされている
- [ ] リモートにプッシュされている
- [ ] Pull Requestが作成されている
- [ ] 全てのCIチェックがPASSしている
- [ ] レビュアーがアサインされている

---

## 依存関係

- **前提**: Phase 10（ドキュメント更新）が完了していること
- **後続**: マージ後、タスク完了

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### PR結果

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}
- レビュー状態: {{PENDING/APPROVED}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### タスク完了メモ

-
```

---

## マージ後のアクション

1. Worktreeの削除（必要に応じて）

```bash
git worktree remove .worktrees/task-XXXXXX
```

2. ブランチの削除（マージ後）

```bash
git branch -d feature/search-replace
git push origin --delete feature/search-replace
```

3. タスク指示書のステータス更新

- `docs/30-workflows/unassigned-task/task-search-replace-functionality.md` のステータスを「完了」に更新
- または `docs/30-workflows/completed-tasks/` に移動
