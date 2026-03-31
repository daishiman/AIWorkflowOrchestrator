# Phase 11: 3層評価 実行前チェックリスト

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 11                                    |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |

## 概要

3層評価（Semantic / Visual / AI UX）を実行する前に確認すべき前提条件と、current facts ベースの実行コマンドを整理する。現時点の `outputs/phase-11/screenshots/` には `not_run` metadata と 1x1 placeholder PNG しかないため、完了証跡としては扱わない。

## 1. ビルド・環境確認

### 1.1 Electron アプリ

- [ ] `apps/desktop/dist/main.js` が存在する
- [ ] Electron アプリが worktree 上で起動できる

```bash
ls apps/desktop/dist/main.js
```

### 1.2 依存関係

- [ ] `@playwright/test` が利用可能
- [ ] `@anthropic-ai/sdk` が利用可能

```bash
pnpm list @playwright/test @anthropic-ai/sdk
```

### 1.3 環境変数

- [ ] `ANTHROPIC_API_KEY` が設定済み
- [ ] `NODE_ENV=test` を付与して起動できる

```bash
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:+set}"
echo "NODE_ENV: ${NODE_ENV:-unset}"
```

### 1.4 現在の証跡状態

- [ ] `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/screenshots/phase11-capture-metadata.json` が `not_run` から更新される
- [ ] representative screenshot を placeholder で置き換えない
- [ ] baseline が必要なら current workflow 配下に生成する

```bash
cat docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/screenshots/phase11-capture-metadata.json
ls docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/screenshots/
```

## 2. 実行コマンド

### 層1 + 層2

```bash
npx playwright test \
  --config .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts
```

Visual baseline 初回生成:

```bash
npx playwright test \
  --config .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts \
  --update-snapshots
```

### 層3

```bash
node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js \
  --screenshot "docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/screenshots/*.png" \
  --output docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11 \
  --task-id TASK-UIUX-FEEDBACK-001
```

## 3. 実行順序

| 順序 | 層       | 条件                                                     |
| ---- | -------- | -------------------------------------------------------- |
| 1    | Semantic | 実画面に到達できる                                       |
| 2    | Visual   | baseline / snapshot 保存先が current workflow 配下にある |
| 3    | AI UX    | 実スクリーンショットが取得済み                           |

## 4. トラブルシューティング

| 問題                 | 対処                                                      |
| -------------------- | --------------------------------------------------------- |
| Electron 起動失敗    | `apps/desktop/dist/main.js` と `NODE_ENV=test` を確認     |
| baseline 未作成      | `--update-snapshots` を使って current workflow 配下へ生成 |
| API レート制限       | 少し待って再実行。明示的 retry ラッパーは未実装           |
| placeholder しかない | Phase 11 未実行。completed 扱いにしない                   |
