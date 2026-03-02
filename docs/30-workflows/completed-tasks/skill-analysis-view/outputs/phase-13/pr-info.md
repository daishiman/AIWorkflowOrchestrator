# Phase 13: PR 情報

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-10A-B                            |
| 機能名   | SkillAnalysisView（スキル分析ビュー） |
| 作成日   | （実施時に記入）                      |

## ブランチ情報

| 項目           | 値                                       |
| -------------- | ---------------------------------------- |
| ブランチ名     | `feature/task-10a-b-skill-analysis-view` |
| ベースブランチ | `main`                                   |
| PR URL         | （作成後に記入）                         |
| PR番号         | （作成後に記入）                         |

## PR タイトル

```
feat(skill): TASK-10A-B SkillAnalysisView実装
```

## PR 本文

```markdown
## Summary

- スキル分析結果表示UIの実装（SkillAnalysisView）
- 分析スコア表示、改善提案リスト、リスクパネルのコンポーネント
- 選択改善適用と全自動改善機能

## Test Plan

- [ ] ユニットテスト全PASS
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] ESLint/Prettier/TypeCheck通過
- [ ] 手動テスト全シナリオ確認（TC-01〜TC-08）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## CI 結果

| ジョブ    | 結果                |
| --------- | ------------------- |
| Lint      | [ ] PASS / [ ] FAIL |
| TypeCheck | [ ] PASS / [ ] FAIL |
| Test      | [ ] PASS / [ ] FAIL |
| Build     | [ ] PASS / [ ] FAIL |

## コミット一覧

（PR作成後にコミットログを記入）

## 完了後の移管

- [ ] `task-workflow.md` ステータスを `pr_created` に更新
- [ ] PR URL を本ファイルに記録
- [ ] マージ後にワークフローディレクトリを `completed-tasks/` に移動
