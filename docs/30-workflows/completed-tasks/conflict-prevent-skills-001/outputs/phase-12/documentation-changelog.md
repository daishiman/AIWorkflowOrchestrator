# Phase 12 Output: ドキュメント変更履歴

## 変更ファイル一覧

| ファイル                                                           | 変更内容                                  |
| ------------------------------------------------------------------ | ----------------------------------------- |
| `.gitattributes`                                                   | `indexes/*.md merge=union` → `merge=ours` |
| `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` | 日付ヘッダー除去                          |
| `.agents/skills/aiworkflow-requirements/scripts/generate-index.js` | canonical から sync                       |
| `.claude/hooks/session-init.sh`                                    | `merge.ours.driver` 未設定 warn 追加      |
| `.claude/scripts/setup-merge-drivers.sh`                           | 新規作成（bootstrap）                     |
| `.claude/hooks/post-merge-index-regenerate.sh`                     | `indexes/*.md / *.json` 再生成説明へ更新  |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`      | 日付ヘッダーなしで regenerate             |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了記録を追加                |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                   | Phase 12 same-wave sync 記録を追加        |
| `.claude/skills/task-specification-creator/LOGS.md`                | 使用記録を追加                            |
| `outputs/phase-11/manual-test-result.md`                           | NON_VISUAL 正本テンプレートへ是正         |
| `outputs/phase-12/implementation-guide.md`                         | Part 2 技術詳細を補完                     |
| `outputs/phase-12/system-spec-update-summary.md`                   | canonical 基準 + same-wave sync へ是正    |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`           | Task/Step 単位の充足確認を追加            |

## validator 実測

```
Phase数: 13/13  エラー: 0  警告: 33  結果: PASS
```

## 新規作成ドキュメント

`docs/30-workflows/conflict-prevent-skills-001/outputs/phase-1/` 〜 `phase-12/` 配下の全成果物（37ファイル）
