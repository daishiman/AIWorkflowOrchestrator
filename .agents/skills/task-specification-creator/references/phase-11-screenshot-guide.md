# Phase 11 Screenshot Guide

## docs-only task

実施内容:

1. `SKILL.md` から current canonical file へ辿る。
2. `LOGS.md` から archive / history へ辿れることを確認する。
3. `.claude` と `.agents` の file set / mirror parity を確認する。
4. validator command を replay する。

この場合、通常は screenshot は不要。`manual-test-result.md` に walkthrough を残す。

## docs-only task + explicit visual sanity request

ユーザーが branch 全体の画面 sanity check を明示要求した場合は、docs-only task でも補助的な screenshot capture を追加してよい。

実施内容:

1. representative state を 3-5 件に絞って撮る。
2. `ui-sanity-visual-review.md` に Apple UI/UX 観点の所見を書く。
3. 画像と metadata は `screenshots-app-sanity/` などの補助 directory に保存する。
4. `manual-test-result.md` に「docs-only だが user request により visual sanity を実施した」と記録する。

この経路では `validate-phase11-screenshot-coverage.js` は必須ではない。workflow 自体が UI task のときだけ実行する。

## UI task

実施内容:

1. `screenshot-plan.json` を作る。
2. representative state を撮る。
3. source surface から destination surface へ handoff する task は main shell 上で source-to-destination capture を行う。
4. destination 単独 screenshot は supplemental sanity evidence として扱い、handoff 本証跡の代替にしない。
5. Apple UI/UX 観点で視覚レビューを書く。
6. `validate-phase11-screenshot-coverage.js` を実行する。

### selector ルール

- responsive UI で desktop / mobile の両 DOM が同時に存在する場合は、visible container を特定してから selector を使う。
- `data-testid` が page 全体で二重一致する場合は panel / sheet locator を返す helper を先に作る。
- strict mode 回避のために first-match に逃げず、「どの surface を操作したか」を証跡とコードの両方で明示する。

### 必須証跡

- `manual-test-result.md`
- `manual-test-report.md`
- `issues.md` または `discovered-issues.md`
- `ui-sanity-visual-review.md`
- `screenshot-plan.json`
- `phase11-capture-metadata.json`
- `phase-11-manual-test.md` の `テストケース` / `画面カバレッジマトリクス`
- `screenshots/*.png`

## CI ツールタスク（GitHub Actions）

スクリーンショット取得が不可能な CI ツール変更タスクの場合、以下を標準証跡形式とする。

1. **GitHub Actions 実行 URL** を `manual-test-result.md` に記録する
2. **`gh run view <run-id> --log`** の出力を証跡として添付する
3. Step Summary 内容は **`gh run view <run-id>`** のテキスト出力で代替する

### gh コマンド証跡収集手順

```bash
# 実行 ID の取得
gh run list --branch <branch-name> --limit 5

# ログ出力（証跡として manual-test-result.md に貼り付け）
gh run view <run-id> --log

# アノテーション・Summary 確認
gh run view <run-id>
```

### 必須証跡（CI ツールタスク）

- `manual-test-result.md`（実行 URL + `gh run view` 出力を含める）
- `manual-test-report.md`（テストケース別合否）
- `issues.md` または `discovered-issues.md`

この経路では `validate-phase11-screenshot-coverage.js` は不要。UI task のみ実行する。

---

## Apple UI/UX 観点

- hierarchy が明確か
- 主要アクションが一目で分かるか
- contrast が十分か
- whitespace と grouping が自然か
- error / loading / empty state が破綻していないか
- destructive action と primary action が混在していないか
- keyboard focus や dismiss 導線が視覚的に追えるか
