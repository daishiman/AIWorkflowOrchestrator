# Phase 13: PR 情報

## タスクID: TASK-SW-CANCEL-001

## 状態

blocked

## ブランチ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| ブランチ名 | `HEAD (no branch)` |
| PR URL     | なし               |

## PR タイトル案

```text
fix(ipc): add SKILL_CREATOR_CANCEL channel constant
```

## PR 本文テンプレート

```markdown
## 概要

`packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_CANCEL` を追加し、`IPC_CHANNELS.SKILL_CREATOR_CANCEL` を型安全に参照できるようにした。

## 変更内容

- `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を追加
- `channels-cancel.test.ts` で存在・値・参照・重複なしを確認

## 検証

- `pnpm --filter @repo/shared typecheck` ✅
- `pnpm --filter @repo/shared exec vitest run src/ipc/__tests__/channels-cancel.test.ts` ✅
- `pnpm --filter @repo/shared exec prettier --check src/ipc/channels.ts src/ipc/__tests__/channels-cancel.test.ts` ✅

## ブロック理由

- コミット / PR 作成は実施しない方針のため
```

## ローカル確認結果

| 項目      | 結果                      |
| --------- | ------------------------- |
| typecheck | PASS                      |
| vitest    | PASS (4/4)                |
| prettier  | PASS                      |
| coverage  | PASS（対象ファイル 100%） |
