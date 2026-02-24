# UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001                                    |
| タスク名     | Vitest alias と tsconfig paths の同期自動化                            |
| Issue        | [#875](https://github.com/daishiman/AIWorkflowOrchestrator/issues/875) |
| 分類         | 改善                                                                   |
| 対象機能     | `@repo/shared` モジュール解決運用                                      |
| 優先度       | 中                                                                     |
| 見積もり規模 | 小規模                                                                 |
| ステータス   | **完了**                                                               |
| 完了日       | 2026-02-24                                                             |
| 発見元       | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 3（MINOR）              |
| 発見日       | 2026-02-21                                                             |
| 仕様書作成日 | 2026-02-24                                                             |

## 背景

`@repo/shared` サブパス追加時に、`exports` / `typesVersions` / `paths` / `vitest alias` の4箇所同期が必要で、手動運用では更新漏れが発生しやすい。

本タスクで `vite-tsconfig-paths` プラグイン導入と `check-shared-module-sync.ts` 拡張（6チェック）を完了し、vitest alias 手動定義を撤廃した。

## 目的

`vite-tsconfig-paths` プラグイン導入により `tsconfig.paths` から `vitest alias` を自動解決し、4設定の同期漏れを機械検証で防止する。運用手順・CI・ローカルコマンドを統一する。

## スコープ

### 含むもの

- `apps/desktop/vitest.config.ts` の alias 自動化（プラグイン導入 or スクリプト拡張）
- `apps/desktop/tsconfig.json` と `vitest alias` の整合性自動検証
- vitest alias 余剰エントリ（`types/auth`, `types/api-keys`）の解消
- `pnpm check:module-sync` スクリプトの追加
- サブパス追加時の運用手順ドキュメント化

### 含まないもの

- `@repo/shared` の公開API設計変更
- `exports` / `typesVersions` の構造変更
- 他パッケージ（`@repo/web` 等）への展開

## Phase構成

| Phase | 名称               | 仕様書                       | 主要成果物                                  |
| ----- | ------------------ | ---------------------------- | ------------------------------------------- |
| 1     | 要件定義           | phase-1-requirements.md      | outputs/phase-1/requirements.md             |
| 2     | 設計               | phase-2-design.md            | outputs/phase-2/design-document.md          |
| 3     | 設計レビューゲート | phase-3-design-review.md     | outputs/phase-3/design-review-result.md     |
| 4     | テスト作成         | phase-4-test-creation.md     | outputs/phase-4/test-creation-report.md     |
| 5     | 実装               | phase-5-implementation.md    | outputs/phase-5/implementation-summary.md   |
| 6     | テスト拡充         | phase-6-test-expansion.md    | outputs/phase-6/test-enhancement-report.md  |
| 7     | カバレッジ確認     | phase-7-coverage-check.md    | outputs/phase-7/coverage-report.md          |
| 8     | リファクタリング   | phase-8-refactoring.md       | outputs/phase-8/refactoring-report.md       |
| 9     | 品質保証           | phase-9-quality-assurance.md | outputs/phase-9/quality-report.md           |
| 10    | 最終レビュー       | phase-10-final-review.md     | outputs/phase-10/final-review-report.md     |
| 11    | 手動テスト         | phase-11-manual-test.md      | outputs/phase-11/manual-test-report.md      |
| 12    | ドキュメント更新   | phase-12-documentation.md    | outputs/phase-12/implementation-guide.md 他 |
| 13    | 完了               | phase-13-pr-creation.md      | outputs/phase-13/completion-checklist.md    |

## 関連ファイル

| ファイル                                             | 役割                                              |
| ---------------------------------------------------- | ------------------------------------------------- |
| `packages/shared/package.json`                       | exports / typesVersions（層1: npm公開境界層）     |
| `apps/desktop/tsconfig.json`                         | compilerOptions.paths（層2: TypeScript解決層）    |
| `apps/desktop/vitest.config.ts`                      | resolve.alias（層3: テスト解決層）                |
| `scripts/check-shared-module-sync.ts`                | 既存の三層整合チェックスクリプト（5チェック関数） |
| `scripts/__tests__/check-shared-module-sync.test.ts` | 既存テスト（43件）                                |
| `.github/workflows/ci.yml`                           | CI設定（check-module-sync ジョブ）                |

## 関連仕様書

| 仕様書                     | パス                                                                              | 関連セクション                    |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| アーキテクチャ（モノレポ） | `architecture-monorepo.md`                                                        | 三層モジュール解決アーキテクチャ  |
| 品質要件                   | `quality-requirements.md`                                                         | @repo/shared alias 管理ルール     |
| DevOps                     | `technology-devops.md`                                                            | CIジョブ構成（check-module-sync） |
| タスク指示書               | `docs/30-workflows/completed-tasks/task-vitest-tsconfig-paths-sync-automation.md` | 元タスク指示書                    |

## 完了条件

- [x] `vite-tsconfig-paths` プラグイン導入により alias 手動同期が不要
- [x] vitest alias の余剰エントリが解消済み
- [x] `pnpm check:module-sync` スクリプトが動作する
- [x] 関連テスト60件が全PASS（`check-shared-module-sync` 系）
- [x] サブパス追加時の運用手順を仕様書へ反映済み
- [x] CI の `check-module-sync` ジョブが正常動作する
