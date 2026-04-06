# タスク 2: システム仕様更新の実施記録

## 実施日

2026-04-06

## Step 1-A: `docs/00-requirements/18-skills.md`

**更新内容**: `3.2.2.1 自動生成時の正規化` セクションに以下を追記確認。

追記済み内容:

- 小文字化（`toLowerCase()`）
- 非許容文字のハイフン置換（`/[^a-z0-9-]/g`）
- 連続ハイフンの圧縮（`/-+/g`）
- 先頭・末尾ハイフンの除去（`/^-+|-+$/g`）
- 空文字時の `new-skill` フォールバック
- `-2` 以降による一意化（`resolveUniqueSkillName`）

**ステータス**: git diff で確認済み（+13 行追記）✓

## Step 1-B: `docs/00-requirements/08-api-design.md`

**更新内容**: IPC 設計原則に「ハンドラ一意性」を追記確認。

追記内容:

- `ipcMain.handle()` は同一チャンネルに対して 1 回のみ登録すること
- 重複登録は 2 回目で例外が発生し、後続ハンドラが全て未登録になる

**ステータス**: git diff で確認済み（+3 行追記）✓

## Step 1-C: aiworkflow-requirements への同期

以下の要件側更新と workflow 同期が完了:

- `18-skills.md` の正規化規則
- `08-api-design.md` の運用注意
- task-workflow の current facts（`index.md` / `artifacts.json` 同期済み）

## Step 2: N/A

新規 interface / type / API の追加はないため、Step 2 は N/A。

## 変更確認

```text
updated:
  docs/00-requirements/08-api-design.md
  docs/00-requirements/18-skills.md
  docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/index.md
  docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/artifacts.json
```
