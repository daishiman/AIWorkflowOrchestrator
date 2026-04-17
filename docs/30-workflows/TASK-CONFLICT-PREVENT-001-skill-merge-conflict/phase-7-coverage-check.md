# Phase 7: カバレッジ確認 - TASK-CONFLICT-PREVENT-001

## ステータス: pending

## カバレッジ対象（コンフリクト源）

| コンフリクト源                | 対策                            | カバー状態   |
| ----------------------------- | ------------------------------- | ------------ |
| `SKILL.md` バージョンテーブル | `merge=union`                   | ✅           |
| `LOGS.md` 追記ログ            | `merge=union`（既存）           | ✅           |
| `references/*.md`             | `merge=union`（既存）           | ✅           |
| `SKILL-changelog.md`          | `merge=union`（既存）           | ✅           |
| `indexes/*.json`              | `merge=ours` + post-merge再生成 | ✅           |
| `indexes/*.md`                | `merge=union`（既存）           | ✅           |
| `settings.local.json`         | `merge=ours`                    | ⬜（残作業） |
| `.backups/`                   | `.gitignore`追加                | ✅           |
| `.agents/`ミラー同期          | post-mergeフック                | ✅           |

**カバー率**: 8/9 = 89%（`settings.local.json`が残作業）

## 未カバー（中長期）

| コンフリクト源         | 理由              | 将来対策                 |
| ---------------------- | ----------------- | ------------------------ |
| `keywords.json`の増大  | 今回スコープ外    | `.gitignore`移行         |
| `LOGS.md`の肥大化      | 今回スコープ外    | 月別アーカイブ化         |
| 大規模構造変更SKILL.md | union重複行リスク | カスタムマージドライバー |
