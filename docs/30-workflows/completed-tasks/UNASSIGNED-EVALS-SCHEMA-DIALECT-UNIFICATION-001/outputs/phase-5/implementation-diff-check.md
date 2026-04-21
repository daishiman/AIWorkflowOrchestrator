# Phase 5: 実装差分チェック

## 実装順序

1. `.claude/skills` の writer / initializer / fixture を更新する
2. `.claude/skills` の reader / schema を更新する
3. `apps/desktop` fixture / test の前提を確認する
4. `.agents/skills` に mirror 同期する
5. 対象ペア限定 diff で parity を確認する

## Before / After / 理由

| 対象                          | Before                            | After                              | 理由                                |
| ----------------------------- | --------------------------------- | ---------------------------------- | ----------------------------------- |
| skill-creator template / init | camelCase 初期化                  | snake_case 初期化                  | `log_usage.js` と方言を一致させる   |
| collect_feedback.js           | `existingEvals.currentLevel` 参照 | `existingEvals.current_level` 参照 | 読み側 silent break を防ぐ          |
| task-specification-creator    | camelCase fixture / log-usage     | snake_case fixture / log-usage     | consumer matrix の見落としを解消    |
| desktop fixture test          | `skill_name` 前提                 | `skill_name` 前提維持              | snake_case fixture 契約の回帰 guard |

## parity ルール

- `diff -q` は変更対象ファイルに限定する
- repo 全体 `diff -qr .claude/skills .agents/skills` は本タスクの完了条件に使わない
- 対象外スキルの drift は未タスクや別タスクで扱う
