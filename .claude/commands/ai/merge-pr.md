---
description: |
  GitHub Pull Requestのマージを安全に実行するシンプルなコマンド。

  CI/CD合格確認、レビュー承認確認、マージ戦略選択を自動化します。
  エージェント不要のシンプルな自動化コマンドです。

  🤖 起動エージェント: なし（直接実行）

  📚 参照規約:
  - GitHub Flow: https://docs.github.com/en/get-started/quickstart/github-flow

  ⚙️ このコマンドの設定:
  - argument-hint: "[pr-number]"（必須）
  - allowed-tools: Git・GitHub操作専用
    • Bash(gh pr*|git*): GitHub CLI、Git操作専用
  - model: sonnet（シンプルなPRマージタスク）

  📋 成果物:
  - マージ済みPR
  - ローカルブランチ更新（git pull）
  - ブランチ削除（オプション）

  🎯 マージ戦略:
  - **Squash and Merge**（デフォルト）: コミット履歴を1つに統合
  - **Merge Commit**: コミット履歴を保持
  - **Rebase and Merge**: リニアな履歴を維持

  🔒 安全性チェック:
  - CI/CD合格確認
  - レビュー承認確認
  - コンフリクトなし確認
  - ベースブランチ最新化確認

  トリガーキーワード: merge pr, pull request merge, マージ, PR承認, レビュー完了
argument-hint: "[pr-number]"
allowed-tools:
   - Bash(gh pr*|git*)
model: sonnet
---

# Pull Requestマージ

このコマンドは、GitHub Pull Requestを安全にマージします。

## 📋 実行フロー

### Phase 1: PR番号の確認

**引数検証**:
```bash
# PR番号（必須）
pr_number: "$ARGUMENTS"（例: 123）

# 未指定の場合
エラー: PR番号は必須です
使用例: /ai:merge-pr 123
```

### Phase 2: PR状態確認

**GitHub CLI使用**:
```bash
# PR情報取得
gh pr view ${pr_number}

# CI/CD状態確認
gh pr checks ${pr_number}

# レビュー状態確認
gh pr reviews ${pr_number}
```

**安全性チェック**:
```
✅ CI/CD: すべて合格
✅ Reviews: 1件以上の承認
✅ Conflicts: なし
✅ Branch Protection: すべての要件満たす
```

### Phase 3: マージ戦略の選択

**対話的に選択**:
```
マージ戦略を選択してください:

1. Squash and Merge（推奨）
   - すべてのコミットを1つに統合
   - 綺麗な履歴を維持
   - 用途: 通常の機能追加・バグ修正

2. Merge Commit
   - コミット履歴を保持
   - ブランチの履歴が残る
   - 用途: 複数の論理的な変更を含む場合

3. Rebase and Merge
   - リニアな履歴を維持
   - コミット履歴を再構成
   - 用途: クリーンな履歴が重要な場合
```

### Phase 4: マージ実行

**GitHub CLI使用**:
```bash
# Squash and Merge（デフォルト）
gh pr merge ${pr_number} --squash --delete-branch

# Merge Commit
gh pr merge ${pr_number} --merge --delete-branch

# Rebase and Merge
gh pr merge ${pr_number} --rebase --delete-branch
```

### Phase 5: ローカルブランチ更新

```bash
# ベースブランチに切り替え
git checkout ${base_branch}

# 最新を取得
git pull origin ${base_branch}

# マージ済みブランチ削除（ローカル）
git branch -d ${merged_branch}
```

### Phase 6: 完了報告

```markdown
## Pull Request マージ完了

PR #${pr_number}: ${pr_title}

### マージ情報
- ベースブランチ: ${base_branch}
- マージ戦略: ${merge_strategy}
- マージコミット: ${merge_commit_sha}

### 実行済み操作
✅ PRマージ
✅ リモートブランチ削除
✅ ローカル ${base_branch} 更新
✅ ローカルマージ済みブランチ削除

### Next Steps
1. デプロイ確認（Railwayで自動デプロイ開始）
2. 本番環境での動作確認
3. 関連Issueのクローズ確認
```

## 使用例

### 基本的な使用（main へマージ）

```bash
/ai:merge-pr 123
```

自動実行:
1. PR #123の状態確認
2. CI/CD・レビュー承認確認
3. マージ戦略選択（対話的）
4. マージ実行
5. ローカルブランチ更新
6. 完了報告

### コンフリクト解決後のマージ

```bash
# コンフリクト解決
git checkout feature/auth
git pull origin main
# コンフリクト解決
git add .
git commit
git push

# マージ実行
/ai:merge-pr 123
```

## 安全性チェック詳細

### CI/CD確認

```bash
# すべてのチェックが合格必須
gh pr checks ${pr_number}

# 合格例
✓ build        build and test  (28s)
✓ typecheck    type checking   (12s)
✓ lint         ESLint check    (8s)
✓ test         unit tests      (45s)
```

### レビュー確認

```bash
# 1件以上の承認必須
gh pr reviews ${pr_number}

# 承認例
@reviewer1  APPROVED  2 hours ago
```

### コンフリクト確認

```bash
# コンフリクトがある場合はマージ不可
gh pr view ${pr_number} --json mergeable

# OK例
"mergeable": "MERGEABLE"
```

## マージ戦略の選択基準

### Squash and Merge（推奨）

**使用ケース**:
- 通常の機能追加
- バグ修正
- リファクタリング
- コミット履歴を整理したい場合

**メリット**:
- 綺麗な履歴（1 PR = 1 コミット）
- mainブランチが読みやすい
- リバート容易

### Merge Commit

**使用ケース**:
- 複数の論理的な変更を含む大きなPR
- コミット履歴を保持したい場合
- 複数人での協業ブランチ

**メリット**:
- コミット履歴を完全保持
- 詳細な変更履歴が残る

### Rebase and Merge

**使用ケース**:
- リニアな履歴が重要
- マージコミット不要
- 小さな変更

**メリット**:
- リニアな履歴
- マージコミットなし

## トラブルシューティング

### CI/CD失敗でマージ不可

**解決策**:
1. CI/CDログ確認
2. 失敗箇所を修正
3. プッシュ（CI/CD再実行）
4. 合格後にマージ

### レビュー承認不足

**解決策**:
1. レビューアにメンション
2. 変更内容を説明
3. 承認後にマージ

### コンフリクト発生

**解決策**:
```bash
# ローカルでコンフリクト解決
git checkout ${feature_branch}
git pull origin ${base_branch}
# コンフリクト解決
git add .
git commit
git push
```

### ブランチ保護ルール違反

**解決策**:
- ブランチ保護設定を確認
- 必要な承認数を満たす
- 必須チェックをすべて合格させる

## ベストプラクティス

### マージ前の最終確認

```bash
# ローカルで最終テスト
pnpm test
pnpm typecheck
pnpm lint
pnpm build

# すべて合格したらマージ
```

### ブランチ削除

```bash
# ✅ 良い: マージ後は即座に削除
gh pr merge 123 --squash --delete-branch

# ❌ 悪い: ブランチを放置
gh pr merge 123 --squash
```

## 参照

- GitHub Flow: https://docs.github.com/en/get-started/quickstart/github-flow
- GitHub CLI: https://cli.github.com/manual/gh_pr_merge
