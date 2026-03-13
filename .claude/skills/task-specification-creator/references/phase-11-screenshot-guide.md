# Phase 11 Screenshot Guide

## docs-only task

実施内容:

1. `SKILL.md` から新しい family file へ辿る。
2. `LOGS.md` から archive へ辿る。
3. `.claude` と `.agents` の file set を比較する。
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

1. screenshot plan を作る。
2. representative state を撮る。
3. Apple UI/UX 観点で視覚レビューを書く。
4. `validate-phase11-screenshot-coverage.js` を実行する。

## Apple UI/UX 観点

- hierarchy が明確か
- 主要アクションが一目で分かるか
- contrast が十分か
- whitespace と grouping が自然か
- error / loading / empty state が破綻していないか

## 必須成果物

- `manual-test-result.md`
- `discovered-issues.md`
- `ui-sanity-visual-review.md`（UI task または明示 screenshot request がある場合）

UI task または明示 screenshot request がある場合に screenshot path を追加する。
