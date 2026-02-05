# Phase 13: PR作成

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 13                                       |
| 機能名 | ENV-INFRA-001-better-sqlite3-version-fix |
| 作成日 | 2026-02-04                               |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

---

## 実行タスク

### Task 1: ローカル動作確認依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼項目**:

| 項目                 | 確認方法                                                            |
| -------------------- | ------------------------------------------------------------------- |
| better-sqlite3テスト | `pnpm --filter @repo/shared test workflow-repository.test.ts --run` |
| Pre-pushフック       | `git push`（テストブランチで確認）                                  |
| nvm自動切替          | `nvm use`実行                                                       |

### Task 2: 変更サマリー提示と許可確認【必須】

**変更内容サマリー**:

| カテゴリ     | 変更内容                      |
| ------------ | ----------------------------- |
| 新規ファイル | .nvmrc, check-node-version.sh |
| 更新ファイル | package.json (engines追加)    |
| ドキュメント | CONTRIBUTING.md更新           |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Task 3: PR作成

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### Task 4: CI確認

| 確認項目   | 期待結果   |
| ---------- | ---------- |
| テスト     | 全て成功   |
| Lint       | エラーなし |
| 型チェック | エラーなし |

---

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

---

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認）**

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/ENV-INFRA-001-better-sqlite3-version-fix/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep ENV-INFRA-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): ENV-INFRA-001をcompleted-tasksに移動"
git push
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ENV-INFRA-001-better-sqlite3-version-fix --phase 13
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

| タスク                             | 結果            | 備考     |
| ---------------------------------- | --------------- | -------- |
| Task 1: ローカル動作確認依頼       | {{完了/未完了}} | {{備考}} |
| Task 2: 変更サマリー提示と許可確認 | {{完了/未完了}} | {{備考}} |
| Task 3: PR作成                     | {{完了/未完了}} | {{備考}} |
| Task 4: CI確認                     | {{完了/未完了}} | {{備考}} |

### 発見事項

- 良かった点: {{GOOD_POINTS}}
- 問題点: {{ISSUES}}
- 改善提案: {{IMPROVEMENTS}}

### タスク完了処理

- [ ] タスクディレクトリをcompleted-tasksに移動済み
```

---

## 次のPhase

なし（ワークフロー完了）
