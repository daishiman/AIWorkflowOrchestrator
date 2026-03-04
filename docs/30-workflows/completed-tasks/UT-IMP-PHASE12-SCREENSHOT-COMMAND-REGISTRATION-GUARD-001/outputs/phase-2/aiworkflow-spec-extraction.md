# Phase 2 aiworkflow 必要仕様抽出

## 抽出元

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `task-workflow.md`
- `lessons-learned.md`
- `architecture-implementation-patterns.md`
- `quality-requirements.md`
- `ui-ux-feature-components.md`

## 採用仕様

| 仕様                                      | 採用理由                        | 適用Phase   |
| ----------------------------------------- | ------------------------------- | ----------- |
| `task-workflow.md`                        | 完了記録と検証証跡の同期先      | 1, 2, 12    |
| `lessons-learned.md`                      | 再発防止ルールの同期先          | 1, 9, 12    |
| `architecture-implementation-patterns.md` | verify/validate/audit順序の標準 | 2, 5, 12    |
| `quality-requirements.md`                 | PASS判定の品質基準              | 4, 7, 9, 10 |
| `ui-ux-feature-components.md`             | Phase 11 screenshot運用規約     | 5, 11, 12   |

## 不採用仕様

| 仕様                   | 理由           |
| ---------------------- | -------------- |
| `database-*`           | DB変更なし     |
| `api-*`                | API追加なし    |
| `technology-devops.md` | CI構成変更なし |

## 抽出妥当性

- scripts登録・Phase 11/12文書同期・検証ログ運用を上記仕様で網羅できることを確認。
