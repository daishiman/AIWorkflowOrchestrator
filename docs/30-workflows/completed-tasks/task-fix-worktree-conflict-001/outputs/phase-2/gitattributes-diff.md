# .gitattributes 変更差分 - TASK-FIX-WORKTREE-CONFLICT-001

## FIX-001-A: EVALS.json merge 戦略変更

```diff
- .claude/skills/*/EVALS.json       merge=union
- .agents/skills/*/EVALS.json       merge=union
+ .claude/skills/*/EVALS.json       merge=ours
+ .agents/skills/*/EVALS.json       merge=ours
```

## FIX-001-D: SKILL-changelog.md merge=union 追加

```diff
+ .claude/skills/*/SKILL-changelog.md  merge=union
+ .agents/skills/*/SKILL-changelog.md  merge=union
```

## 変更後の全体マージ戦略設定

| パターン               | 戦略          | 理由                                      |
| ---------------------- | ------------- | ----------------------------------------- |
| `*/LOGS.md`            | `merge=union` | 追記型ログ（前タスクで設定済み）          |
| `*/references/*.md`    | `merge=union` | 追記型参照（前タスクで設定済み）          |
| `*/indexes/*.json`     | `merge=ours`  | 自動生成（前タスクで設定済み）            |
| `*/indexes/*.md`       | `merge=union` | インデックス参照 MD（前タスクで設定済み） |
| `*/EVALS.json`         | `merge=ours`  | JSON 状態値（**今回変更**）               |
| `*/SKILL-changelog.md` | `merge=union` | 変更履歴（**今回追加**）                  |
