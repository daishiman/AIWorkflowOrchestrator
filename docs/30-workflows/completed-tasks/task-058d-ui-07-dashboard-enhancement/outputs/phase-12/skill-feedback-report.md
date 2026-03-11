# Phase 12 成果物: スキルフィードバック

## 良かった点

- Phase 1〜3 の仕様が component 分割とテスト項目まで落ちており、実装へ直結した。
- `aiworkflow-requirements` の UI/UX 参照が、shared 化しない判断に効いた。

## 改善点

- task spec 内の参照パスが `.claude/...` と `.agents/...` で揺れていたため、今回 `.claude` を正本、`.agents` を mirror として扱うルールを追加した。
- Phase 11 screenshot command は workflow 作成時点で package script まで登録されていると再利用しやすい。
- worktree 環境では `esbuild` のアーキテクチャ差分が検証阻害要因になりやすく、診断手順のテンプレート化余地がある。

## 対応状況

- `task-specification-creator`: `phase12-checklist-definition.md` / `phase-11-12-guide.md` に「ユーザー指定rootを正本にする」「完了前に mirror root へ同期する」ガードを追加した。
- `skill-creator`: `references/patterns.md` に dual skill-root repository の canonical root + mirror sync パターンを追加した。
- `task-specification-creator`: `SKILL.md` と `LOGS.md` に今回の Phase 12 再監査知見を記録した。
- `aiworkflow-requirements`: warning 137 件は既存未タスク `UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` のスコープで継続管理する。
