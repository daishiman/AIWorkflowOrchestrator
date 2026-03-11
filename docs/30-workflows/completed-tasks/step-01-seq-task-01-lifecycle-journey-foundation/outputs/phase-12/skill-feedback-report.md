# スキル改善レポート

## task-specification-creator への改善

- `references/phase-11-12-guide.md` に、representative surface は shell 全景よりも selector-based element capture を優先するルールを追加した。
- 既存の Phase 11 ガイドにある `--selector` 運用と、今回の `TC-11-05-surface-ownership.png` の実装を結び付け、責務証跡の撮り方を明文化した。
- Phase 12 validator は構造を通しても、実コードとズレた型定義例までは検出しないことが分かったため、実装ガイドの TypeScript 断片を現行 export に寄せて補正した。

## skill-creator への改善

- `references/patterns.md` に「`current=0` でも legacy backlog 参照を省略しない」パターンを追加し、未タスク 0 件報告と baseline 継続監視を別々に書くようにした。
- `assets/phase12-task-spec-recheck-template.md` に `phase12-task-spec-compliance-check.md` を root evidence として固定し、`baselineViolations>0` 時は既存 remediation task 参照を `unassigned-task-detection.md` へ残す完了条件を追加した。
- これにより、Phase 12 の再監査で「今回差分は合格だが、ディレクトリ全体の負債は別途残る」という報告を再利用しやすくした。

## aiworkflow-requirements への改善

- `.claude` だけでなく `.agents` mirror でも `skillLifecycleJourney.ts` を実装アンカーに含めるべきだった。今回の初期状態では `.agents` 側 `search-spec.js "skillLifecycleJourney"` が 0 件だった。
- `SkillCenterView` の surface ownership board と TC-11-05 element capture を `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` に同期し、責務証跡の根拠を system spec から辿れるようにした。
- `.claude` / `.agents` の mirror sync 後に `generate-index.js` と `search-spec` を再実行し、抽出可能性を実地確認する運用を継続する。

## 今回の改善

- `.agents` mirror の `SKILL.md` / `resource-map.md` / `quick-reference.md` / lifecycle 関連 reference を `.claude` と同期し、search index を再生成した。
- `implementation-guide.md` Part 2 の型定義と API シグネチャを現行コードへ一致させ、SkillCenterView の責務ボード説明も追記した。
- `SkillCenterView` に surface ownership board を追加し、Phase 11 の representative screenshot を shell 全景から責務要素の直接証跡へ改善した。
- foundation task は UI 大改修よりも 正本契約 + 最小の入口/責務可視化 の組み合わせが効率的だった。
- 未タスク 0 件報告では `currentViolations=0` と `baselineViolations=133` を同時に残し、既存 backlog 是正タスクへの参照も report と system spec へ同期する運用へ補強した。
