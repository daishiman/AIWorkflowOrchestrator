# スキルフィードバックレポート

## task-specification-creator への改善点

- Phase 11 の screenshot 参照名を Phase 11 仕様書内で明示するテンプレートがあると、`manual-test-result.md` / `screenshot-coverage.md` への転記漏れを防ぎやすい。
- Phase 12 の成果物テンプレートに「workflow-local / canonical / mirror のどこまで同波更新するか」を明示する欄があると、運用の取り違えが減る。
- `phase12-task-spec-compliance-check.md` の雛形に「未解決事項」欄を標準装備すると、画像待ちや canonical sync 待ちを隠さず残せる。

## aiworkflow-requirements への改善点

- ChatView silent failure のような局所的な修正でも、`error-handling` / `llm-ipc-types` / `arch-state-management` のどこへ書くかを 1 枚の案内表で引けると抽出効率が上がる。
- canonical と worktree-local と mirror の役割分担を明文化した節があると、今回のような multi-layer sync でも誤記しにくい。
- `task-workflow` / `lessons-learned` / `unassigned-task` の関係を、formalize 先ファイル名まで含めて案内できると、未タスクの漏れが減る。

## 今回の運用で有効だった点

- phase11 / phase12 の証跡ファイル名を先に固定したことで、後続の文書更新を並列に進めやすかった。
- 未タスク 2 件を formalize したことで、Phase 12 の「検出したが未整理」の状態が残らなかった。
