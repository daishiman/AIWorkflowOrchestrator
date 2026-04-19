# Phase 13: PR 作成

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 13                                          |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 12                                          |
| 次Phase | なし（最終フェーズ）                        |
| 作成日  | 2026-04-19                                  |

## 目的

- Phase 1〜12 の成果物を git commit し、Pull Request を作成してレビュープロセスへ移行する
- **ユーザーの明示的な承認を得た後にのみ実施する**

## 重要: 実施前の必須確認

> **このフェーズは、ユーザーが明示的に「PR を作成してください」と承認した場合にのみ実行する。**
> ユーザーの承認なしに以下の操作を自動で実施してはならない。
>
> - `git commit`
> - `git push`
> - `gh pr create`

## 実行タスク

### T-13-1: ユーザー承認の確認

- commit / push / PR 作成についてユーザーの明示承認があることを確認する
- 承認がない場合は Phase 13 を `pending` のまま据え置き、操作しない

### T-13-2: 変更範囲と成果物の最終確認

- `git status` と `git diff --stat` で変更範囲を確認する
- Phase 1〜12 の成果物が揃っていることを確認する

### T-13-3: commit / push / PR 作成

- 承認後のみ commit、push、PR 作成を実施する
- PR 本文には update / improve-prompt モードの修正点と検証結果を記載する

### T-13-4: CI 状況確認

- typecheck / lint / test の結果を確認する
- 失敗時は Phase 9 以降へ差し戻す

### 1. 変更ファイルの確認

```bash
git status
git diff --stat
```

### 2. コミット作成

```bash
git add <変更ファイルのパスを個別に指定>
git commit -m "$(cat <<'EOF'
fix(skill-creator): UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE update/improve-prompt モード実装

- SkillCreatorService の update ケースに runUpdateWorkflow を実装
- SkillCreatorService の improve-prompt ケースに runImprovePromptWorkflow を実装
- 各モードで init_skill.js が誤って呼ばれないよう修正

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### 3. リモートへ push

```bash
git push -u origin HEAD
```

### 4. PR 作成

- **PR タイトル**: `fix(skill-creator): UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE update/improve-prompt モード実装`

```bash
gh pr create \
  --title "fix(skill-creator): UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE update/improve-prompt モード実装" \
  --body "$(cat <<'EOF'
## Summary

- `SkillCreatorService.ts` の `update` ケースに `runUpdateWorkflow` を実装し、`init_skill.js` が誤って呼ばれる問題を修正
- `SkillCreatorService.ts` の `improve-prompt` ケースに `runImprovePromptWorkflow` を実装し、同様の誤呼び出しを修正
- 各モード（update / improve-prompt / create）の動作をユニットテストで検証済み

## Test plan

- [ ] `update` モードで `runUpdateWorkflow` が呼ばれることを確認（vitest）
- [ ] `improve-prompt` モードで `runImprovePromptWorkflow` が呼ばれることを確認（vitest）
- [ ] `create` モードの既存動作が変わらないことを確認（回帰テスト）
- [ ] 各モードで `init_skill.js` が呼ばれないことを確認（vitest）
- [ ] TypeScript 型チェック PASS
- [ ] Lint エラー 0 件

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## CI 確認項目

PR 作成後、以下の CI チェックが全件グリーンであることを確認する。

| CI チェック | 確認コマンド                            | 期待結果     |
| ----------- | --------------------------------------- | ------------ |
| typecheck   | `pnpm --filter @repo/desktop typecheck` | エラー 0 件  |
| lint        | `pnpm --filter @repo/desktop lint`      | エラー 0 件  |
| test        | `pnpm --filter @repo/desktop test`      | 全件グリーン |

CI 確認コマンド例：

```bash
gh run list --limit 5
gh run view <run-id>
```

## 参照資料

| 資料名                    | パス                                                                                      | 用途                         |
| ------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------- |
| workflow root artifacts   | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/artifacts.json`            | Phase 1〜12 成果物の最終確認 |
| workflow output artifacts | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/outputs/artifacts.json`    | parity 確認                  |
| Phase 12 仕様書           | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-12-documentation.md` | close-out 完了条件確認       |

## 成果物

| 成果物      | パス                                   | 内容                               |
| ----------- | -------------------------------------- | ---------------------------------- |
| PR 情報     | `outputs/phase-13/pr-summary.md`       | PR URL、要約、レビュアー情報       |
| CI 確認メモ | `outputs/phase-13/ci-check-results.md` | typecheck / lint / test の最終結果 |

## 完了条件

- [ ] ユーザーから PR 作成の明示的な承認を得た
- [ ] `git commit` が成功している（pre-commit フックを含む）
- [ ] `git push` が成功している
- [ ] `gh pr create` が成功し、PR URL が確認できた
- [ ] CI の typecheck / lint / test が全件グリーンである
- [ ] PR のレビュアーが設定されている（必要な場合）
