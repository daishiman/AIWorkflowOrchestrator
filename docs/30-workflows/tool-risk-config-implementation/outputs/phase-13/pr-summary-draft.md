## Summary

- `packages/shared/src/constants/security.ts` に `RiskLevel` 型・`ToolRiskConfigEntry` interface・`TOOL_RISK_CONFIG` 定数を追加し、`high` リスクの恒久/時間許可禁止を不変条件として固定した。
- `packages/shared/src/constants/index.ts` から上記3シンボルを re-export し、`packages/shared/src/constants/security.test.ts` で不変条件と型契約を検証するテストを追加した。
- `docs/30-workflows/tool-risk-config-implementation/` 一式と `.claude/skills/aiworkflow-requirements/*` を更新し、仕様同期・教訓・バックログ反映を完了した。

## Background

GitHub Issue #1251 のクローズ要件として、後続タスク（UT-06-004 など）が参照できるリスクレベル設定を `@repo/shared` 側で先に確定する必要があった。あわせて正本仕様スキル群（`aiworkflow-requirements`、`task-specification-creator`）への同期を完了し、仕様ドリフトを防止する。

## Changes

- `packages/shared/src/constants/security.ts`
  - `RiskLevel` / `ToolRiskConfigEntry` / `TOOL_RISK_CONFIG` を追加
  - `high` リスクで `allowPermanent` / `allowTime24h` / `allowTime7d` を `false` 固定
  - `Object.freeze` で設定オブジェクトを不変化
- `packages/shared/src/constants/index.ts`
  - `TOOL_RISK_CONFIG`、`RiskLevel`、`ToolRiskConfigEntry` の export を追加
- `packages/shared/src/constants/security.test.ts`
  - リスクキー網羅、dialog幅、CSSトークン、不変条件、freeze、順序性、型アクセスの検証テストを追加
- `docs/30-workflows/tool-risk-config-implementation/`
  - Phase 1〜13 の成果物・指示書を新規追加
- `.claude/skills/aiworkflow-requirements/*` / `.claude/skills/task-specification-creator/*`
  - resource-map / topic-map / keywords / references / LOGS / SKILL を更新
- `docs/30-workflows/unassigned-task/task-ut-06-001-css-risk-variables-definition.md`
  - CSSリスク変数定義の未割当タスクを追記

## Test Plan

- ユーザー実行済み:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm --filter @repo/shared build`
  - `pnpm --filter @repo/desktop build`
  - `pnpm test --testTimeout=900000`
- 追加ユニットテスト対象:
  - `packages/shared/src/constants/security.test.ts`

## Spec Sync

- `.claude/skills/aiworkflow-requirements/references/security-implementation.md` に `TOOL_RISK_CONFIG` 実装状況を反映済み
- `.claude/skills/aiworkflow-requirements/LOGS.md` および `.claude/skills/task-specification-creator/LOGS.md` に完了記録を追記済み
- Phase 12 成果物を `docs/30-workflows/tool-risk-config-implementation/outputs/phase-12/` に保存済み

## Branch / Commit 状態

- 現在ブランチ: `feature/task-ut-06-001-tool-risk-config-spec`
- ブランチ命名規則: `feature/` プレフィックスを満たす
- 変更ファイル: `git status --short` の差分全件（tracked + untracked）をPR対象に含める
- コミットメッセージ案:
  - `feat(shared): TOOL_RISK_CONFIG 定数を追加し仕様同期を反映 (Issue #1251)`
