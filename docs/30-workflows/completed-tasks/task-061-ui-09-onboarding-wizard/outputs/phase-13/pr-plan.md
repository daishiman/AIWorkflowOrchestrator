# Phase 13: PR 実行計画 / 実績

## 実行サマリ

- base branch: `main`
- head branch: `feat/task-061-ui-09-onboarding-wizard-phase13-pr`
- 対象 workflow: `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/`
- 同期方針: `origin/main` と local `main` は `0 0` を確認し、task-061 関連差分のみを新ブランチへ集約する

## PR に含める内容

- Onboarding Wizard 本体、Dashboard overlay、Settings rerun 導線、関連テスト
- Phase 11 screenshot harness と representative screenshot 5 件
- Phase 12 の system spec 更新、skill 改善、未タスク仕様書 2 件
- task-061 workflow の Phase 13 完了反映と stale path 修正

## テスト方針

- ユーザーが直前に `pnpm typecheck`、`pnpm lint`、`pnpm --filter @repo/shared build`、`pnpm --filter @repo/desktop build`、`pnpm test --testTimeout=900000` を実行済みとして扱う
- 本 Phase 13 では再実行せず、既存の検証結果と Phase 11 / 12 artifacts を PR に集約する

## PR 本文反映ルール

- `## スクリーンショット` を残し、`TC-11-01` 〜 `TC-11-05` を列挙する
- `## その他` に `outputs/phase-12/implementation-guide.md` の要点と参照パスを明記する
- 関連 Issue として `#1190`、`#1191` を記載する

## 実施ステップ

1. `origin/main` と local `main` の同期状態を確認する
2. PR 専用 branch / worktree を作成する
3. task-061 関連差分だけを集約し、Phase 13 と stale path を更新する
4. commit / push / PR を作成する
5. `implementation-guide.md` 全文を PR comment として投稿し、投稿済みであることを確認する
