# Phase 11: PR作成 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 10（ドキュメント更新） |
| 後続Phase  | なし（ワークフロー完了）     |
| ステータス | 未実施                       |
| 作成日     | 2026-01-05                   |
| 機能名     | cicd-coverage-integration    |

---

## 目的

変更をコミットし、Pull Requestを作成してCIを確認する。

## 背景

全フェーズが完了し、実装をmainブランチにマージするためのPRを作成する。

---

## 使用スキル

- なし（git/gh CLIで直接実行）

---

## 参照資料

| 参照資料             | パス                                           | 内容           |
| -------------------- | ---------------------------------------------- | -------------- |
| 最終レビュー結果     | `outputs/phase-8/final-review-result.md`       | Phase 8成果物  |
| 手動テスト結果       | `outputs/phase-9/manual-test-result.md`        | Phase 9成果物  |
| ドキュメント更新履歴 | `outputs/phase-10/documentation-update-log.md` | Phase 10成果物 |

---

## 実行手順

### ステップ1: 変更の確認

```bash
# 変更ファイル一覧
git status

# 差分確認
git diff
git diff --cached
```

### ステップ2: コミット

```bash
# ステージング
git add .github/workflows/ci.yml
git add codecov.yml
git add docs/30-workflows/cicd-coverage-integration/

# コミット
git commit -m "feat(ci): add coverage threshold check with Codecov integration

- Add coverage job to CI workflow
- Add codecov.yml configuration
- Set 80% threshold for project and patch coverage
- Enable PR comments for coverage diff

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### ステップ3: プッシュとPR作成

```bash
# プッシュ
git push -u origin feature/cicd-coverage-integration

# PR作成
gh pr create \
  --title "feat(ci): add coverage threshold check with Codecov integration" \
  --body "## Summary

- CI/CDパイプラインにカバレッジ閾値チェックを統合
- Codecovによるカバレッジ可視化を追加
- PRにカバレッジ差分のコメントを自動追加

## Changes

- \`.github/workflows/ci.yml\`: coverageジョブを追加
- \`codecov.yml\`: Codecov設定ファイルを追加

## Test plan

- [ ] coverageジョブが正常に実行される
- [ ] Codecovダッシュボードにカバレッジが表示される
- [ ] PRにCodecovコメントが表示される
- [ ] 既存のCIジョブに影響がない

## Screenshots

（Phase 9のスクリーンショットを添付）

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

### ステップ4: CI確認

```bash
# PRのチェック状況確認
gh pr checks

# PRのステータス確認
gh pr status
```

### ステップ5: レビュー対応（必要に応じて）

```bash
# レビューコメント確認
gh pr view --comments

# 追加コミット（必要な場合）
git add .
git commit -m "fix: address review comments"
git push
```

---

## 成果物

| 成果物 | パス                          | 内容     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-11/pr-info.md` | PR URL等 |

### pr-info.md テンプレート

```markdown
# PR情報

## 基本情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| PR番号   | #{{PR_NUMBER}}                    |
| PR URL   | {{PR_URL}}                        |
| ブランチ | feature/cicd-coverage-integration |
| ベース   | main                              |
| 作成日時 | {{CREATED_AT}}                    |

## CIステータス

| ジョブ    | ステータス | 備考 |
| --------- | ---------- | ---- |
| lint      |            |      |
| typecheck |            |      |
| test      |            |      |
| coverage  |            |      |
| build     |            |      |

## マージ条件

- [ ] 全CIジョブがパス
- [ ] レビュー承認（必要な場合）
- [ ] コンフリクトなし
```

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/cicd-coverage-integration/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep cicd-coverage-integration

# 元の未タスク指示書を削除
rm docs/30-workflows/unassigned-task/task-cicd-coverage-integration.md

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): cicd-coverage-integrationを完了、未タスク指示書を削除"
git push
```

### 移動対象

| 対象                                           | 移動先                                                         | 備考         |
| ---------------------------------------------- | -------------------------------------------------------------- | ------------ |
| `docs/30-workflows/cicd-coverage-integration/` | `docs/30-workflows/completed-tasks/cicd-coverage-integration/` | 全成果物含む |

---

## 完了条件

- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] Codecovコメントが表示されている
- [ ] PR情報がドキュメント化されている
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] 元の未タスク指示書が削除されている
- [ ] artifacts.jsonのstatusがcompletedに更新されている

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### PR情報

- PR番号: #{{PR_NUMBER}}
- PR URL: {{PR_URL}}
- マージ日時: {{MERGED_AT}}

### CI結果

- 全ジョブパス: {{YES/NO}}
- 所要時間: {{DURATION}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### ワークフロー完了確認

- タスクディレクトリ移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}
```

---

## 次のPhase

なし（ワークフロー完了）

---

## ワークフロー完了後

1. PRがマージされたら、completed-tasks移動を確認
2. Codecovダッシュボードでカバレッジ推移を継続監視
3. 検出された未タスクがあれば、次のイテレーションで対応
