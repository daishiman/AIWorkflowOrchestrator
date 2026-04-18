# Phase 5 Output: 変更ファイル要約

| ファイル                                                           | 変更種別               | 内容                                       |
| ------------------------------------------------------------------ | ---------------------- | ------------------------------------------ |
| `.gitattributes`                                                   | 修正                   | `indexes/*.md merge=union` → `merge=ours`  |
| `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` | 修正                   | 日付ヘッダー（`自動生成: YYYY-MM-DD`）除去 |
| `.agents/skills/aiworkflow-requirements/scripts/generate-index.js` | 修正（canonical sync） | 同上                                       |
| `.claude/hooks/session-init.sh`                                    | 修正                   | `merge.ours.driver` 未設定 warn 追加       |
| `.claude/scripts/setup-merge-drivers.sh`                           | 新規作成               | custom driver bootstrap スクリプト         |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`      | 再生成                 | 日付ヘッダーなしで再生成済み               |

## 影響範囲

- `.gitattributes` 変更は全 worktree に適用される（repo 共有ファイル）
- `generate-index.js` 変更により、以降の regenerate で日付 diff が発生しなくなる
- `session-init.sh` 変更は各開発者のセッション開始時に警告を出すだけで動作は変えない
- `setup-merge-drivers.sh` は repo に commit されるが、`git config` の登録は各開発者が手動実行する必要がある（local config のため）
