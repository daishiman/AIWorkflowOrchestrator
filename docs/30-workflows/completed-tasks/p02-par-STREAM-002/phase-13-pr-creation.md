# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 12                               |
| 後続Phase  | -（本タスクでは実行しない）            |
| 作成日     | 2026-04-15                             |
| ステータス | blocked                                |

## 目的

commit / push / PR 作成はユーザー承認後のみ実施する。
本Phase では PR 作成に必要な情報を整理し、ユーザーの判断を待つ。

## 実行タスク

- ローカル確認結果を要約する
- 変更サマリーを整理する
- PR 作成情報（ブランチ名・タイトル・本文テンプレート）を記録する
- commit / push / PR は実行しない

## PR 作成情報（ユーザー承認後に使用）

### ブランチ名

```
fix/TASK-SW-STREAM-002-handlers-progress-wiring
```

### PR タイトル

```
fix(skill-creator): SKILL_CREATOR_CREATE ハンドラーに onProgress コールバックを接続 [TASK-SW-STREAM-002]
```

### PR 本文テンプレート

```markdown
## Summary

- `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` に `onProgress` コールバックを接続
- コールバック内で `sendSkillCreatorProgress(mainWindow, progress)` を呼び出し IPC 経由で進捗を送信
- `SkillCreateWizard.tsx` で `useStreamingProgress()` 戻り値が `GenerateStep` に正しく渡されることを確認（必要に応じて修正）
- スキル生成中に `GenerateStep.tsx` のプログレスバーが実際に更新される状態を実現
- TASK-SW-STREAM-001（前提）の成果物（onProgress? コールバック引数）を活用した配線実装

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` が PASS すること（TC-01〜TC-12）
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/` が PASS すること（回帰なし）
- [ ] `pnpm --filter @repo/desktop lint` が 0 error
- [ ] `pnpm --filter @repo/desktop build` が PASS すること
- [ ] 手動テスト: スキル生成中にプログレスバーが 5 段階で更新されることを目視確認済み

## Related

Depends on: TASK-SW-STREAM-001
Blocks: なし（TASK-SW-CANCEL-001〜004 とは独立）
```

## 実行手順

### 1. ローカル確認結果の記録

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# 新規テスト
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts

# 既存テスト回帰確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/

# lint
pnpm --filter @repo/desktop lint

# ビルド
pnpm --filter @repo/desktop build
```

### 2. 変更内容の要約

`outputs/phase-13/pr-info.md` に以下を記録する:

- 変更ファイル一覧（`git diff --stat`）
- 型チェック・ビルド・テストの実行結果
- PR タイトル・ブランチ名・PR 本文テンプレート
- blocked 状態の記録

### 3. PR 作成コマンド（ユーザー承認後のみ実行）

```bash
# ブランチ作成
git checkout -b fix/TASK-SW-STREAM-002-handlers-progress-wiring

# コミット（pre-commit フックを通す）
git add apps/desktop/src/main/ipc/skillCreatorHandlers.ts
git add apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts
# SkillCreateWizard.tsx を変更した場合は追加
# git add apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
git commit -m "fix(skill-creator): SKILL_CREATOR_CREATE ハンドラーに onProgress コールバックを接続

- skillCreatorHandlers.ts で createSkill() 第2引数に onProgress コールバックを接続
- sendSkillCreatorProgress(mainWindow, progress) との配線を実装
- スキル生成中のプログレスバー更新が機能するようになった

Task: TASK-SW-STREAM-002
Depends-on: TASK-SW-STREAM-001"

# プッシュ
git push -u origin fix/TASK-SW-STREAM-002-handlers-progress-wiring

# PR 作成
gh pr create \
  --title "fix(skill-creator): SKILL_CREATOR_CREATE ハンドラーに onProgress コールバックを接続 [TASK-SW-STREAM-002]" \
  --body "$(cat <<'EOF'
## Summary

- `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` に `onProgress` コールバックを接続
- コールバック内で `sendSkillCreatorProgress(mainWindow, progress)` を呼び出し IPC 経由で進捗を送信
- スキル生成中に `GenerateStep.tsx` のプログレスバーが実際に更新される状態を実現

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` が PASS すること
- [ ] 既存テスト回帰なし
- [ ] `pnpm --filter @repo/desktop build` が PASS すること

## Related

Depends on: TASK-SW-STREAM-001
EOF
)"
```

## 禁止事項

- commit（ユーザー承認なしに実行禁止）
- push（ユーザー承認なしに実行禁止）
- PR 作成（ユーザー承認なしに実行禁止）

## 参照資料

| 資料名               | パス                                          | 説明            |
| -------------------- | --------------------------------------------- | --------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物 |
| 手動テスト           | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物 |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物 |

## 成果物

| 成果物 | パス                          | 説明                           |
| ------ | ----------------------------- | ------------------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | 条件: ユーザー承認後のみ作成可 |

## 完了条件

- [ ] ローカル確認結果（typecheck / build / test）を記録した
- [ ] 変更サマリーを記録した
- [ ] PR タイトル・ブランチ名・PR 本文テンプレートが `pr-info.md` に記録されている
- [ ] commit / push / PR を実行していない
- [ ] blocked 状態を記録した
- [ ] 本Phase内の全タスクを100%実行完了（blocked gate）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
