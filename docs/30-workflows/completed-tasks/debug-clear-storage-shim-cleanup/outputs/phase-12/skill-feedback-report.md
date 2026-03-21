# Phase 12: スキルフィードバックレポート

## テンプレート改善

- Phase 12 の出力名は `report` と `detection` を混在させやすい。正式名称をテンプレート側で固定し、alias の残し方も明示した方がよい。
- Phase 11 の補助成果物は `manual-test-checklist.md` / `manual-test-result.md` を前提にしないと、report だけ残って準拠チェックが分かりにくい。

## ワークフロー改善

- `outputs/artifacts.json` の mirror を workflow 内で同時生成する手順をテンプレート化すると、root / outputs の state drift を減らせる。
- Phase 12 の Task 6 に相当する準拠チェックを最初から必須化すると、`completed` に見えて未完了のまま残るケースを防ぎやすい。

## ドキュメント改善

- `workflow-local sync summary` と `canonical spec sync` を分けて記録するテンプレートがあると、worktree でも drift の追跡がしやすい。
- debug コード棚卸しでは、`manual-test-result` と `phase12-task-spec-compliance-check` を早めに作ると事後記録の抜けが減る。
