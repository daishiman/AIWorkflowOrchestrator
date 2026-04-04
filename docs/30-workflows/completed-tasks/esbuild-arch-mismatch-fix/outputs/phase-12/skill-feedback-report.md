# Phase 12: スキルフィードバックレポート

## テンプレート改善

- Phase 仕様書テンプレートの「受け入れ基準」の期待結果に「環境依存で変わりうる値」の扱い方針を追加すると良い。例: `process.arch` の期待値が arm64 固定ではなく「一貫性」を求める場合のパターン
- NON_VISUAL タスクの Phase 11 テンプレートでは、「端末証跡記録」のフォーマットを統一するとよい

## ワークフロー改善

- 環境修正タスクでは Phase 4（テスト作成）と Phase 5（実装）の境界が曖昧になりやすい。`pnpm install` が「実装」に該当するため、テスト定義 → install → 検証 の流れを環境修正専用テンプレートとして用意すると効率的
- Phase 3/10 のゲート系 Phase は、判定基準と実行タスクを明確に分離すると可読性が向上する
- worktree 作成直後に `node -e "console.log(process.arch)"` と `file $(which node)` を記録する preflight を標準化すると、Rosetta 混入を早期に検出できる
- CI では `process.arch` と `uname -m` を出力する軽量ステップをオプションで追加すると、ローカルと CI のアーキ差分を追跡しやすい

## ドキュメント改善

- `artifacts.json` と `outputs/artifacts.json` の同期ルールは、初期作成時に自動生成ツールで同期すると parity ずれを防げる
- 予防手順書（prevention-procedure.md）のような「正本」ドキュメントの指定ルールをワークフロー全体で標準化するとよい
- `manual-test-checklist.md` と `manual-test-result.md` は `TC-ID` 付きの表に統一すると、NON_VISUAL タスクでも screenshot coverage validator を機械的に通しやすい
- 端末証跡が 1x1 の placeholder PNG であっても、`NON_VISUAL` 方針と併記して「何を証跡として残したか」を明示すると誤解を避けやすい
