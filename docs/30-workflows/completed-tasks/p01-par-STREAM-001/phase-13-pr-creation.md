# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 13                                      |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | Phase 12                                |
| 後続Phase  | -（本タスクでは実行しない）             |
| 作成日     | 2026-04-15                              |
| ステータス | blocked                                 |

## 目的

commit / push / PR 作成は本タスクのスコープ外とする。ユーザーが明示的に承認した場合のみ、別途実施する。

## 実行タスク

- ローカル確認結果を要約する
- 変更サマリーを整理する
- PR 作成ゲートのみ保持する
- commit / push / PR は実行しない

## PR 作成情報（ユーザー承認後に使用）

### ブランチ名

```
fix/TASK-SW-STREAM-001-skill-creator-progress-callback
```

### PR タイトル

```
fix(skill-creator): createSkill にオプショナル進捗コールバック引数を追加 [TASK-SW-STREAM-001]
```

### PR 本文テンプレート

```markdown
## Summary

- `SkillCreatorService.createSkill()` に `onProgress?` コールバック引数を追加
- 処理の5段階（planning/generating-skill/generating-agents/validating/done）で `onProgress?.()` を呼び出し
- コールバックはオプショナルのため既存の呼び出し元への破壊的変更なし
- `SkillCreatorProgressData` 型（phase/percentage/message）を定義
- TASK-SW-STREAM-002（skillCreatorHandlers.ts でのコールバック接続）の前提タスク

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` が PASS すること（TC-01〜TC-14）
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/` が PASS すること（回帰なし）
- [ ] `pnpm --filter @repo/desktop lint` が 0 error
- [ ] `pnpm --filter @repo/desktop build` が PASS すること

## Related

Depends on: なし
Blocks: TASK-SW-STREAM-002
```

## 実行手順

### 1. ローカル確認結果の記録

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# 新規テスト
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts

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
- PR タイトル・ブランチ名・PR 本文（上記テンプレート）
- blocked 状態の記録

### 3. PR 作成コマンド（ユーザー承認後のみ実行）

```bash
# ブランチ作成
git checkout -b fix/TASK-SW-STREAM-001-skill-creator-progress-callback

# コミット（pre-commit フックを通す）
git add apps/desktop/src/main/services/skill/SkillCreatorService.ts
git add apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts
git commit -m "fix(skill-creator): createSkill にオプショナル進捗コールバック引数を追加

- SkillCreatorService.createSkill() に onProgress? コールバック引数を追加
- 処理の5段階で onProgress?.() を呼び出す実装
- SkillCreatorProgressData 型を定義

Task: TASK-SW-STREAM-001"

# プッシュ
git push -u origin fix/TASK-SW-STREAM-001-skill-creator-progress-callback

# PR 作成
gh pr create \
  --title "fix(skill-creator): createSkill にオプショナル進捗コールバック引数を追加 [TASK-SW-STREAM-001]" \
  --body "$(cat <<'EOF'
## Summary

- `SkillCreatorService.createSkill()` に `onProgress?` コールバック引数を追加
- 処理の5段階（planning/generating-skill/generating-agents/validating/done）で `onProgress?.()` を呼び出し
- コールバックはオプショナルのため既存の呼び出し元への破壊的変更なし
- TASK-SW-STREAM-002（skillCreatorHandlers.ts でのコールバック接続）の前提タスク

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` が PASS すること
- [ ] 既存テスト回帰なし
- [ ] `pnpm --filter @repo/desktop build` が PASS すること

## Related

Blocks: TASK-SW-STREAM-002
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
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物 |

## 成果物

| 成果物 | パス                          | 説明                           |
| ------ | ----------------------------- | ------------------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | 条件: ユーザー承認後のみ作成可 |

## 完了条件

- [x] ローカル確認結果（typecheck / build / test）を記録した
- [x] 変更サマリーを記録した
- [x] PR タイトル・ブランチ名・PR 本文テンプレートが `pr-info.md` に記録されている
- [x] commit / push / PR を実行していない
- [x] blocked 状態を記録した
- [x] 本Phase内の全タスクを100%実行完了（blocked gate）

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] ユーザーの許可なしに commit / push / PR を実行していない
- [x] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
