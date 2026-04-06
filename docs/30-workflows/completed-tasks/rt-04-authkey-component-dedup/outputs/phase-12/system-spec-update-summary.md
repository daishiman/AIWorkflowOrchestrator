# Phase 12: 仕様更新サマリー — TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001

## Step 1-A: タスク完了記録

- `.claude/skills/aiworkflow-requirements/LOGS.md` に完了ログを追加
- `.claude/skills/task-specification-creator/LOGS.md` に完了ログを追加
- `.claude/skills/aiworkflow-requirements/SKILL.md` / `.claude/skills/task-specification-creator/SKILL.md` の変更履歴に追記
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` に `ApiKeyStatus` / `useAuthKeyManagement` を追記
- `topic-map.md` / `keywords.json` を再生成

## Step 1-B: 実装状況テーブル更新

- `task-workflow-completed.md` に `TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001` の完了記録を追加
- `task-workflow-backlog.md` に TECH-M-01 を `TASK-RT-04-APIKEYPANEL-REMOVAL-001` として追加

## Step 1-C: 関連タスクテーブル更新

- Issue #1903 を完了記録に紐付け
- TECH-M-01 未タスクを backlog へ反映

## Step 1-D: topic-map.md 再生成

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、indexes を更新

## Step 2: 新規インターフェース追加

- `interfaces-agent-sdk-skill-reference.md` に `ApiKeyStatus` の `check-failed` と `useAuthKeyManagement` を追記
- `ui-ux-settings-core.md` は `not-set`/`not_set` の表記ゆれと UI 状態契約を current facts に同期（`check-failed` 時の `apiError` 表示、delete 失敗時 `status="error"` を明文化）
- `api-ipc-system-core.md` は IPC 仕様変更なし（`auth-key:*` 既存契約のまま）→ no-op
