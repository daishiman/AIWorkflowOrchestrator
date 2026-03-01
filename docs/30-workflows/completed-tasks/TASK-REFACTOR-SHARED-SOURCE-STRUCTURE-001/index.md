# TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001: @repo/shared ソース構造二重性の統一

## メタ情報

| 項目         | 値                                        |
| ------------ | ----------------------------------------- |
| タスク ID    | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |
| 機能名       | @repo/shared ソース構造二重性の統一       |
| 分類         | リファクタリング                          |
| 作成日       | 2026-02-28                                |
| ステータス   | 仕様書作成完了（未実施）                  |
| 総 Phase 数  | 13                                        |
| 優先度       | 中                                        |
| 見積もり規模 | 中規模（影響ファイル: 30+）               |
| 発見元       | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001  |
| GitHub Issue | #847                                      |

---

## 概要

`packages/shared` の型定義ディレクトリが `types/`（ルート直下）と `src/types/`（src 内）の2箇所に分散している構造的問題を解決する。`types/` の5ファイル（auth.ts, api-keys.ts, common.ts, file-selection.ts, workflow.ts）を `src/types/` に集約し、`package.json`/`tsup.config.ts`/`tsconfig.json`/`vitest.config.ts` のパス体系を一本化する。

---

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | 未実施     |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | 未実施     |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | 未実施     |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | 未実施     |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | 未実施     |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | 未実施     |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | 未実施     |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | 未実施     |
| 13    | PR 作成          | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | 未実施     |

---

## 実行フロー

```
Phase 1（要件定義）
  ↓
Phase 2（設計）
  ↓
Phase 3（設計レビュー）──── MAJOR → Phase 1 or 2 へ戻る
  ↓ PASS / MINOR
Phase 4（テスト作成）
  ↓
Phase 5（実装）
  ↓
Phase 6（テスト拡充）
  ↓
Phase 7（カバレッジ確認）── 未達 → Phase 6 へ戻る
  ↓ 達成
Phase 8（リファクタリング）
  ↓
Phase 9（品質検証）
  ↓
Phase 10（最終レビュー）── MAJOR/CRITICAL → Phase 1-5 へ戻る
  ↓ PASS / MINOR        └ MINOR → 未タスク仕様書に変換後 Phase 11 へ
Phase 11（手動テスト）
  ↓
Phase 12（ドキュメント）
  ↓
Phase 13（PR 作成）
```

---

## Phase 完了時の必須アクション

各 Phase 完了時に以下を実施すること:

1. **100% 実行確認**: 仕様書の全タスク・全ステップが完了していること
2. **成果物検証**: outputs/phase-N/ 配下に全成果物が作成されていること
3. **artifacts.json 更新**: 該当 Phase の status を `completed` に変更し、成果物パスを記録

---

## 成果物一覧

| Phase | 成果物                   | パス                                            |
| ----- | ------------------------ | ----------------------------------------------- |
| 1     | 要件定義書               | `outputs/phase-1/requirements-definition.md`    |
| 1     | 受入基準一覧             | `outputs/phase-1/acceptance-criteria.md`        |
| 1     | スコープ定義             | `outputs/phase-1/scope-definition.md`           |
| 2     | アーキテクチャ設計書     | `outputs/phase-2/architecture-design.md`        |
| 2     | 移行計画書               | `outputs/phase-2/migration-plan.md`             |
| 3     | 設計レビュー結果         | `outputs/phase-3/design-review-result.md`       |
| 4     | テスト仕様書             | `outputs/phase-4/test-specification.md`         |
| 5     | 実装サマリー             | `outputs/phase-5/implementation-summary.md`     |
| 6     | テスト拡充レポート       | `outputs/phase-6/test-expansion-report.md`      |
| 7     | カバレッジレポート       | `outputs/phase-7/coverage-report.md`            |
| 8     | リファクタリングレポート | `outputs/phase-8/refactoring-report.md`         |
| 9     | 品質検証結果             | `outputs/phase-9/quality-verification.md`       |
| 10    | 最終レビュー結果         | `outputs/phase-10/final-review-result.md`       |
| 11    | 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`     |
| 12    | 実装ガイド               | `outputs/phase-12/implementation-guide.md`      |
| 12    | ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`   |
| 12    | 仕様更新サマリー         | `outputs/phase-12/spec-update-summary.md`       |
| 12    | 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md` |
| 12    | スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`     |

---

## 関連タスク

| タスク ID                                  | 関連内容                                    | ステータス |
| ------------------------------------------ | ------------------------------------------- | ---------- |
| TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001   | 発見元。三層整合性の基盤修正                | 完了予定   |
| TASK-IMP-VITEST-ALIAS-SYNC-AUTOMATION-001  | CI ガードによる整合性の自動検証             | 未着手     |
| TASK-VITEST-TSCONFIG-PATHS-SYNC-AUTOMATION | tsconfig paths と vitest alias の同期自動化 | 未着手     |

---

## 関連 Pitfall

| Pitfall ID | 内容                               | 本タスクでの関連                       |
| ---------- | ---------------------------------- | -------------------------------------- |
| P8         | 幽霊依存                           | 移行後に import が解決不能になるリスク |
| P11        | PostToolUse フックによる Edit 失敗 | 大量ファイル編集時の注意               |
| P23        | API 二重定義の型管理複雑性         | exports の二重パス体系                 |
| P32        | 型定義の二箇所同時更新必須         | exports + typesVersions の同時更新     |

---

## 4 ファイル同期チェックリスト

本タスクの核心となる同期対象:

| #   | ファイル                         | 更新内容                                   |
| --- | -------------------------------- | ------------------------------------------ |
| 1   | `packages/shared/package.json`   | `exports` + `typesVersions` のサブパス定義 |
| 2   | `apps/desktop/tsconfig.json`     | `compilerOptions.paths` のエイリアス定義   |
| 3   | `apps/desktop/vitest.config.ts`  | `resolve.alias` のテスト時パス解決定義     |
| 4   | `packages/shared/tsup.config.ts` | `entry` のビルドエントリーポイント定義     |

---

<!-- auto-generated by generate-index.js -->
