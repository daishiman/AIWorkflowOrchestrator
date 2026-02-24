# UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化

## メタ情報

```yaml
issue_number: 875
```

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001                                    |
| タスク名     | Vitest alias と tsconfig paths の同期自動化                            |
| 分類         | 改善                                                                   |
| 対象機能     | `@repo/shared` モジュール解決運用                                      |
| 優先度       | 中                                                                     |
| 見積もり規模 | 小規模                                                                 |
| ステータス   | **完了**                                                               |
| 完了日       | 2026-02-24                                                             |
| 発見元       | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 3（MINOR）              |
| 発見日       | 2026-02-21                                                             |
| 関連Issue    | [#875](https://github.com/daishiman/AIWorkflowOrchestrator/issues/875) |

## 実装結果サマリー

- `apps/desktop/vitest.config.ts` に `vite-tsconfig-paths` を導入し、`@repo/shared` 手動 alias を撤廃
- `scripts/check-shared-module-sync.ts` を6チェック構成へ拡張（`typesVersions -> exports` を追加）
- `checkMapContainment` を導入し、重複ロジックを共通化
- ルートに `check:module-sync` スクリプトを追加し、CI から同一コマンド実行に統一
- 仕様書・タスク運用ドキュメントを完了状態へ更新

## 成果物

| Phase | 成果物                 | パス                                         |
| ----- | ---------------------- | -------------------------------------------- |
| 1     | 要件定義書             | `outputs/phase-1/requirements.md`            |
| 2     | 設計書                 | `outputs/phase-2/design-document.md`         |
| 3     | 設計レビュー報告書     | `outputs/phase-3/design-review-result.md`    |
| 4     | テスト作成報告書       | `outputs/phase-4/test-creation-report.md`    |
| 5     | 実装サマリー           | `outputs/phase-5/implementation-summary.md`  |
| 6     | テスト拡充報告書       | `outputs/phase-6/test-enhancement-report.md` |
| 7     | カバレッジ報告書       | `outputs/phase-7/coverage-report.md`         |
| 8     | リファクタリング報告書 | `outputs/phase-8/refactoring-report.md`      |
| 9     | 品質報告書             | `outputs/phase-9/quality-report.md`          |
| 10    | 最終レビュー報告書     | `outputs/phase-10/final-review-report.md`    |
| 11    | 手動テスト報告書       | `outputs/phase-11/manual-test-report.md`     |
| 12    | ドキュメント更新成果物 | `outputs/phase-12/*`                         |
| 13    | 完了チェックリスト     | `outputs/phase-13/completion-checklist.md`   |

## 検証結果

- `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts scripts/__tests__/check-shared-module-sync-extended.test.ts scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts` PASS（60 tests）
- `pnpm -r --parallel typecheck` PASS
- `pnpm eslint --no-ignore --no-warn-ignored ...` PASS（対象ファイル）
- `pnpm check:module-sync` PASS
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/vitest-tsconfig-paths-sync --strict` PASS
- `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js` PASS

## 完了条件

- [x] alias 手動同期が不要になっている
- [x] vitest alias の余剰エントリが解消されている
- [x] `pnpm check:module-sync` が実行可能
- [x] 関連テスト・型チェック・Lint が通過
- [x] システム仕様書とスキル仕様書に完了記録を反映
- [x] 元未タスク指示書を completed-tasks に移管済み

## 参照

- ワークフロー本体: `docs/30-workflows/vitest-tsconfig-paths-sync/`
- システム仕様: `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`
- タスク運用仕様: `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
