# Phase 13 PR本文草案

## 概要

TASK-UI-01-E の統合レビューゲート正本化、Phase 12 仕様同期、completed-tasks 移管、Phase 13 PR 導線整備をまとめて反映する。

## 変更内容

- `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/` を正本として、Phase 1〜12 成果物、Phase 11 branch-level visual recheck、Phase 12 仕様同期証跡を完成形へ整理した。
- `.claude/skills/aiworkflow-requirements/`, `.claude/skills/task-specification-creator/`, `.claude/skills/skill-creator/` に task-056e 由来の運用ルール、教訓、テンプレート改善、completed-tasks 移管ルールを同期した。
- `UT-IMP-PHASE12-TASK-SPEC-RECHECK-ADOPTION-001` を completed-tasks 配下で追跡し、Phase 12 task spec 再確認の残差を backlog 化した。
- Phase 13 として PR 本文草案、レビュー依頼、handoff、検証サマリーを workflow 配下へ追加した。

## 変更タイプ

- [ ] 🐛 バグ修正 (bug fix)
- [ ] ✨ 新機能 (new feature)
- [ ] 🔨 リファクタリング (refactoring)
- [x] 📝 ドキュメント (documentation)
- [x] 🧪 テスト (test)
- [ ] 🔧 設定変更 (configuration)
- [ ] 🚀 CI/CD (continuous integration)

## テスト

- [x] ユニットテスト実行 (`pnpm test`)
- [x] 型チェック実行 (`pnpm typecheck`)
- [x] ESLint チェック実行 (`pnpm lint`)
- [x] ビルド確認 (`pnpm build`)
- [x] 手動テスト実施

補足:

- 以下はユーザーが本ブランチ terminal で直前実行済みとして扱う。
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm --filter @repo/shared build`
  - `pnpm --filter @repo/desktop build`
  - `pnpm test --testTimeout=900000`
- 本ターンでは docs / workflow / PR 導線整備が中心のため full suite 再実行は省略し、workflow 整合検証を追加実行する。

## 関連 Issue

なし（`sync_new_issues.js --dry-run` で未同期タスク仕様書 0 件を確認）

## 破壊的変更

- [ ] この PR には破壊的変更が含まれます

## チェックリスト

- [x] コードが既存のスタイルに従っている
- [x] 必要に応じてドキュメントを更新した
- [x] 新規・変更機能にテストを追加した
- [x] すべてのテストがローカルで成功する
- [x] Pre-commit hooks が成功する

## その他

- Phase 12 実装ガイド反映元: `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-12/implementation-guide.md`
- Part 1 要点: 統合レビューゲートを「改札」に例え、`state / ipc / security / navigation / documentation` の5軸を1つの通過判定へまとめた。
- Part 2 要点: `GateAxis` / `GateDecision` / `SpecSyncTarget` / `DownstreamHandoff` の論理契約で、統合ゲート判定・仕様同期区分・下流解放条件を型として固定した。
- Part 2 要点: canonical path 正規化、`artifacts.json` と phase 本文の同期、completed/current path 混在や docs-heavy task の representative screenshot 再確認をエッジケースとして明文化した。

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
