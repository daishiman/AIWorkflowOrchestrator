# Phase 13: PR作成

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 13                                      |
| 機能名 | TASK-CI-FIX-001-fix-backend-lint-next16 |
| 作成日 | 2026-01-29                              |

## 目的

実装内容を PR として提出し、CI の全ジョブが成功することを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: GitHub Actions の全ジョブが成功することを確認
- タスク完了処理: タスクディレクトリを completed-tasks に移動

## 参照資料

| 資料名               | パス                                         | 説明           |
| -------------------- | -------------------------------------------- | -------------- |
| 最終レビューレポート | `outputs/phase-10/final-review-report.md`    | Phase 10成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`   | Phase 12成果物 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1成果物  |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                | 内容             |
| ------------- | ------------------------------------------------------------------- | ---------------- |
| CI/CDインフラ | `.claude/skills/aiworkflow-requirements/references/devops-ci-cd.md` | CI品質ゲート定義 |

## 実行手順

### ステップ1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する:

```bash
# ユーザーに以下のコマンドの実行を依頼
pnpm --filter @repo/backend lint
pnpm lint
pnpm typecheck
pnpm --filter @repo/backend test:run
pnpm --filter @repo/backend build
```

### ステップ2: 変更サマリーの提示と許可確認【必須】

PR に含まれる変更ファイルを確認し、サマリーをユーザーに提示する:

| ファイル                         | 変更種別 | 変更内容            |
| -------------------------------- | -------- | ------------------- |
| `apps/backend/package.json`      | 修正     | lint スクリプト変更 |
| `apps/backend/eslint.config.mjs` | 修正     | ESLint 設定更新     |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### ステップ3: PR 作成（`/ai:diff-to-pr` を実行）

**PR テンプレート**:

```markdown
## Summary

- Backend の lint スクリプトを `next lint` から `eslint .` に変更（Next.js 16 対応）
- `eslint.config.mjs` に `eslint-config-next` のルールを FlatCompat 経由で統合
- CI の lint ジョブ復旧

## Background

PR #562（dependabot）が Next.js を 15.5.9 → 16.1.5 にバージョンアップ。
Next.js 16 で `next lint` コマンドが完全に削除されたため、CI の lint ジョブが失敗。

## Changes

1. `apps/backend/package.json`: `"lint": "next lint"` → `"lint": "eslint . --cache --cache-location .next/cache/eslint/"`
2. `apps/backend/eslint.config.mjs`: ignores のみ → eslint-config-next ルール統合

## Test plan

- [ ] `pnpm --filter @repo/backend lint` が正常終了する
- [ ] `pnpm lint`（ルート）が正常終了する
- [ ] `pnpm typecheck` が正常終了する
- [ ] `pnpm --filter @repo/backend test:run` が全テスト PASS
- [ ] `pnpm --filter @repo/backend build` がビルド成功
- [ ] CI の全ジョブが成功する
```

**注意**: PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。

**PR作成方法**:

ユーザーの許可を得た後、`/ai:diff-to-pr` を実行する。
`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

### ステップ4: CI 確認

PR 作成後、以下の CI ジョブが全て成功することを確認する:

| CI ジョブ    | 確認内容                      |
| ------------ | ----------------------------- |
| lint         | `pnpm lint` が正常終了        |
| typecheck    | `pnpm typecheck` が正常終了   |
| test-shared  | shared パッケージテスト PASS  |
| test-desktop | desktop パッケージテスト PASS |
| security     | セキュリティ監査 PASS         |
| build        | ビルド成功                    |

### ステップ5: マージ準備

CI 全ジョブ成功後、以下をユーザーに報告する:

- PR URL
- CI 全ジョブの成功状態
- マージ可能であること

**注意**: マージはユーザーが GitHub UI で手動実行する。

### ステップ6: タスク完了処理【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-CI-FIX-001-fix-backend-lint-next16/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-CI-FIX-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-CI-FIX-001-fix-backend-lint-next16をcompleted-tasksに移動"
git push
```

## 統合テスト連携【必須】

| 検証項目    | 内容                                |
| ----------- | ----------------------------------- |
| CI 全ジョブ | GitHub Actions の全ジョブが成功する |
| PR 整合性   | PR の変更内容が設計通りである       |

## 成果物

| 成果物   | パス                                 | 説明     |
| -------- | ------------------------------------ | -------- |
| PR説明文 | `outputs/phase-13/pr-description.md` | PR本文   |
| PR情報   | `outputs/phase-13/pr-info.md`        | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] PR が作成されている（ユーザー許可後）
- [ ] CI の全ジョブが成功している
- [ ] PR説明文に変更内容・背景・テストプランが含まれている
- [ ] マージ可能状態がユーザーに報告されている
- [ ] タスクディレクトリが `completed-tasks` に移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. ユーザーにローカル動作確認を依頼
3. 変更サマリーの提示と許可確認
4. PR 作成（`/ai:diff-to-pr` 実行）
5. CI 確認
6. マージ準備・報告
7. タスク完了処理（completed-tasks 移動）
8. 成果物の作成・配置
9. 完了条件の検証
