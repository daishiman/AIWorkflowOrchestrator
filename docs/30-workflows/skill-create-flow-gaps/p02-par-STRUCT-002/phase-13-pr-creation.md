# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 13                                            |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 12                                      |
| 後続Phase  | -（本タスクでは実行しない）                   |
| 作成日     | 2026-04-15                                    |
| ステータス | blocked                                       |

## 目的

commit / push / PR 作成はユーザー承認後のみ実施する。
本Phase では PR 作成に必要な情報を整理し、ユーザーの判断を待つ。

## 実行タスク

- ローカル確認結果を要約する
- 変更サマリーを整理する
- PR 作成情報を記録する
- commit / push / PR は実行しない

## PR 作成情報（ユーザー承認後に使用）

### ブランチ名

```
fix/TASK-SW-STRUCT-002-connect-structure-plan-to-skill-md
```

### PR タイトル

```
fix(skill-creator): void structurePlan を削除し structurePlan を SKILL.md 生成に接続 [TASK-SW-STRUCT-002]
```

### PR 本文テンプレート

```markdown
## Summary

- `SkillCreatorService.ts` 行 126 の `void structurePlan` を削除
- `plan` オブジェクト生成を `structurePlan !== null` による分岐に変更
- `create` モード時: `structurePlan.skillName` / `structurePlan.purpose` / `structurePlan.description` を `plan` に反映
- `collaborative` / `orchestrate` 等: フォールバック `plan`（`options.name` / `options.description`）を継続使用
- `anchors ?? []` による null 安全な処理
- TASK-SW-STRUCT-001（前提）で修正済みの `structurePlan` を有効活用

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts` が PASS すること（TC-01〜TC-11）
- [ ] `collaborative` モードの既存テストが回帰なしで PASS すること
- [ ] `pnpm --filter @repo/desktop lint` が 0 error
- [ ] `pnpm --filter @repo/desktop build` が PASS すること
- [ ] 手動テスト: `create` モードで生成した SKILL.md に `structurePlan` の内容が反映されることを確認済み

## Related

Depends on: TASK-SW-STRUCT-001
Blocks: なし
```

## 実行手順

### 1. ローカル確認結果の記録

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop build
```

### 2. 変更内容の要約

`outputs/phase-13/change-summary.md` に以下を記録する:

- 変更ファイル一覧（`git diff --stat`）
- 型チェック・ビルド・テストの実行結果
- PR タイトル・ブランチ名・PR 本文テンプレート
- blocked 状態の記録

`outputs/phase-13/local-check-result.md` に実行結果を記録する。

### 3. PR 作成コマンド（ユーザー承認後のみ実行）

```bash
git checkout -b fix/TASK-SW-STRUCT-002-connect-structure-plan-to-skill-md

git add apps/desktop/src/main/services/skill/SkillCreatorService.ts
git add apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts
git commit -m "fix(skill-creator): void structurePlan を削除し structurePlan を SKILL.md 生成に接続

- SkillCreatorService.ts 行 126 の void structurePlan を削除
- plan オブジェクト生成を structurePlan !== null による分岐に変更
- create モード: structurePlan の内容を plan に反映
- その他のモード: options ベースのフォールバック plan を継続使用

Task: TASK-SW-STRUCT-002
Depends-on: TASK-SW-STRUCT-001"

git push -u origin fix/TASK-SW-STRUCT-002-connect-structure-plan-to-skill-md

gh pr create \
  --title "fix(skill-creator): void structurePlan を削除し structurePlan を SKILL.md 生成に接続 [TASK-SW-STRUCT-002]" \
  --body "$(cat <<'EOF'
## Summary

- `SkillCreatorService.ts` 行 126 の `void structurePlan` を削除
- `plan` オブジェクト生成を `structurePlan !== null` による分岐に変更
- `create` モード時: `structurePlan` の内容を `plan` に反映して SKILL.md 生成に使用
- その他のモード: フォールバック `plan` を継続使用

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS すること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/` が PASS すること
- [ ] `pnpm --filter @repo/desktop build` が PASS すること

## Related

Depends on: TASK-SW-STRUCT-001
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

## 成果物

| 成果物           | パス                                     | 説明                           |
| ---------------- | ---------------------------------------- | ------------------------------ |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 条件: ユーザー承認後のみ作成可 |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 条件: ユーザー承認後のみ更新可 |

## 完了条件

- [ ] ローカル確認結果（typecheck / build / test）を記録した
- [ ] 変更サマリーを記録した
- [ ] PR タイトル・ブランチ名・PR 本文テンプレートが記録されている
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
