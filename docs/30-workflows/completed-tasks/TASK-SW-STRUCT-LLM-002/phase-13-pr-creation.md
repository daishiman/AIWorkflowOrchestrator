# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | Phase 12                              |
| 後続Phase  | -                                     |
| 作成日     | 2026-04-18                            |
| ステータス | blocked                               |

## 目的

commit / push / PR 作成はユーザー承認後のみ実施する。
本 Phase では blocked 状態のまま、
PR 作成に必要なメタ情報と補助成果物を整理する。

## 実行タスク

- 変更サマリーを整理する
- blocked 理由を明文化する
- PR 作成情報（ブランチ名・タイトル・本文テンプレート）を記録する
- ローカル確認結果を「未実行 / blocked」の事実として記録する
- commit / push / PR は実行しない

## PR 作成情報（ユーザー承認後に使用）

### ブランチ名

```text
feat/task-sw-struct-llm-002-features-auto-gen
```

### PR タイトル

```text
feat(skill-creator): TASK-SW-STRUCT-LLM-002 LLM による features フィールド自動生成
```

### PR 本文テンプレート

```markdown
## Summary

- TASK-SW-STRUCT-LLM-002: LLM による features フィールド自動生成の実装
- `runCreateWorkflow()` 内の `features: []` を LLM 自動生成に切り替え
- `generateSkillMd()` 経由で SKILL.md の features セクションに反映
- エラー時は `features: []` でフォールバック

## Test plan

- [ ] `pnpm --filter @repo/desktop test -- SkillCreatorService.features`
- [ ] `pnpm --filter @repo/desktop typecheck`
- [ ] `pnpm --filter @repo/desktop lint`
- [ ] スキル作成フローで SKILL.md の features が自動生成されることを確認

## Related

- Closes #2242
- Depends on: TASK-SW-LLM-PURPOSE-AUTO-EXTRACT (#2226)
```

## 実行手順

### 1. blocked 状態の記録

- `outputs/phase-13/pr-info.md` に PR 作成情報を記録する
- `outputs/phase-13/local-check-result.md` に「未実行 / blocked」の事実を記録する
- `outputs/phase-13/change-summary.md` に本 workflow の要約を記録する

### 2. ユーザー承認後のみ実施するコマンド

```bash
git checkout -b feat/task-sw-struct-llm-002-features-auto-gen
git add apps/desktop/src/main/services/skill/SkillCreatorService.ts
git add docs/30-workflows/TASK-SW-STRUCT-LLM-002/
git commit -m "feat(skill-creator): TASK-SW-STRUCT-LLM-002 LLM による features フィールド自動生成"
git push -u origin feat/task-sw-struct-llm-002-features-auto-gen
gh pr create \
  --title "feat(skill-creator): TASK-SW-STRUCT-LLM-002 LLM による features フィールド自動生成" \
  --body "$(cat <<'EOF'
## Summary
- TASK-SW-STRUCT-LLM-002: LLM による features フィールド自動生成の実装
- `runCreateWorkflow()` 内の `features: []` を LLM 自動生成に切り替え
- `generateSkillMd()` 経由で SKILL.md の features セクションに反映
- エラー時は `features: []` でフォールバック

## Test plan
- [ ] `pnpm --filter @repo/desktop test -- SkillCreatorService.features`
- [ ] `pnpm --filter @repo/desktop typecheck`
- [ ] `pnpm --filter @repo/desktop lint`
- [ ] スキル作成フローで SKILL.md の features が自動生成されることを確認

## Related
- Closes #2242
- Depends on: TASK-SW-LLM-PURPOSE-AUTO-EXTRACT (#2226)
EOF
)"
```

## 禁止事項

- commit（ユーザー承認なしに実行禁止）
- push（ユーザー承認なしに実行禁止）
- PR 作成（ユーザー承認なしに実行禁止）

## 参照資料

| 資料名                | パス                                          | 説明               |
| --------------------- | --------------------------------------------- | ------------------ |
| Phase 2 設計          | `outputs/phase-2/requirements-analysis.md`    | 設計根拠           |
| Phase 5 実装          | `outputs/phase-5/implementation-summary.md`   | current facts      |
| Phase 9 品質保証      | `outputs/phase-9/quality-report.md`           | close-out 品質判定 |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`     | ゲート判定         |
| Phase 11 手動テスト   | `outputs/phase-11/manual-test-result.md`      | NON_VISUAL 証跡    |
| ドキュメント変更履歴  | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物    |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物    |
| change summary        | `outputs/phase-13/change-summary.md`          | blocked 要約       |
| local check result    | `outputs/phase-13/local-check-result.md`      | blocked 記録       |
| PR情報                | `outputs/phase-13/pr-info.md`                 | PR メタ情報        |

## 成果物

| 成果物           | パス                                     | 説明         |
| ---------------- | ---------------------------------------- | ------------ |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR メタ情報  |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | blocked 記録 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更要約     |

## 完了条件

- [ ] 変更サマリーを記録した
- [ ] PR タイトル・ブランチ名・本文テンプレートを記録した
- [ ] blocked 状態を記録した
- [ ] commit / push / PR を実行していない
- [ ] 本 Phase 内の全タスクを100%実行完了（blocked gate）

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
