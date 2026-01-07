# Phase 11: PR作成 - Repository パターン実装

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 10（ドキュメント更新） |
| 後続Phase  | -                            |
| ステータス | 未実施                       |
| 作成日     | 2026-01-05                   |
| 機能名     | repository-pattern           |
| タスクID   | CONV-04-06                   |

---

## 目的

すべてのPhaseが完了した成果物をコミットし、
Pull Requestを作成してCI確認を行う。

## 背景

Phase 11はワークフローの最終フェーズであり、
PRの作成とCI通過確認、そしてタスク完了処理を行う。

---

## 使用スキル

> 本Phaseでは Git/GitHub CLI を使用してPR作成を行います。

---

## 参照資料

| 参照資料         | パス                                             | 内容         |
| ---------------- | ------------------------------------------------ | ------------ |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`     | PR説明文用   |
| 全Phase成果物    | `docs/30-workflows/repository-pattern/`          | 成果物一覧   |
| Repositoryコード | `packages/shared/src/db/repositories/`           | コミット対象 |
| テストコード     | `packages/shared/src/db/repositories/__tests__/` | コミット対象 |

---

## 成果物

| 成果物   | パス                          | 内容         |
| -------- | ----------------------------- | ------------ |
| PR情報   | `outputs/phase-11/pr-info.md` | PR URL・詳細 |
| コミット | Gitコミット                   | 全変更       |

---

## 完了条件

- [ ] すべての変更がコミットされている
- [ ] PRが作成されている
- [ ] CIがすべて通過している
- [ ] PR情報が記録されている
- [ ] タスクディレクトリが `completed-tasks/` に移動されている
- [ ] `artifacts.json` の `status` が `completed` に更新されている
- [ ] （該当時）未タスク指示書が削除されている

---

## 実行手順

### 1. 変更の確認

```bash
# 変更ファイルの確認
git status

# 差分の確認
git diff
```

### 2. コミット

```bash
# ステージング
git add packages/shared/src/db/repositories/
git add packages/shared/src/db/repositories/__tests__/
git add docs/30-workflows/repository-pattern/

# コミット
git commit -m "feat(shared): Repository パターン実装 (CONV-04-06)

- BaseRepository: 汎用CRUD操作
- FileRepository: ファイルメタデータ管理
- ChunkRepository: チャンク管理
- EntityRepository: エンティティ管理
- ファクトリ関数: createRepositories

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 3. プッシュ

```bash
# リモートにプッシュ
git push -u origin $(git branch --show-current)
```

### 4. PR作成

```bash
gh pr create --title "feat(shared): Repository パターン実装 (CONV-04-06)" --body "$(cat <<'EOF'
## Summary

- BaseRepository: 汎用CRUD操作の抽象クラス
- FileRepository: ファイルメタデータのRepository
- ChunkRepository: チャンクのRepository
- EntityRepository: エンティティのRepository
- ファクトリ関数: createRepositories

## Changes

- `packages/shared/src/db/repositories/base.repository.ts`
- `packages/shared/src/db/repositories/file.repository.ts`
- `packages/shared/src/db/repositories/chunk.repository.ts`
- `packages/shared/src/db/repositories/entity.repository.ts`
- `packages/shared/src/db/repositories/index.ts`
- テストコード

## Test plan

- [ ] 全ユニットテスト成功
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] カバレッジ80%以上

## Related

- タスク仕様: docs/30-workflows/repository-pattern/
- 依存タスク: CONV-04-02, CONV-04-03, CONV-04-04, CONV-04-05

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 5. CI確認

```bash
# PRステータス確認
gh pr checks
```

### 6. タスク完了処理

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/repository-pattern/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep repository-pattern

# 3. 元の未タスク指示書を削除（タスク完了のため不要）
rm docs/30-workflows/unassigned-task/task-04-06-repository-pattern.md

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): repository-patternを完了、未タスク指示書を削除"
git push
```

---

## 完了条件チェックリスト

| #   | 項目                                               | 必須 | 確認 |
| --- | -------------------------------------------------- | ---- | ---- |
| 1   | PRが作成されている                                 | ✅   | [ ]  |
| 2   | CIが全て通過している                               | ✅   | [ ]  |
| 3   | タスクディレクトリが `completed-tasks/` に移動済み | ✅   | [ ]  |
| 4   | `artifacts.json` の `status` が `completed`        | ✅   | [ ]  |
| 5   | 未タスク指示書が削除済み                           | 条件 | [ ]  |

---

## 依存関係

- **前提**: Phase 1〜10 が完了していること
- **後続**: なし（ワークフロー完了）

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### PR情報

| 項目     | 内容          |
| -------- | ------------- |
| PR URL   | {{URL}}       |
| ブランチ | {{branch}}    |
| CI結果   | {{PASS/FAIL}} |

### タスク完了処理

- [ ] タスクディレクトリ移動完了
- [ ] 未タスク指示書削除完了
- [ ] artifacts.json更新完了

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### ワークフロー全体の振り返り

-
```

---

## ワークフロー完了

すべてのPhaseが完了しました。

タスクディレクトリは `docs/30-workflows/completed-tasks/repository-pattern/` に移動されました。
