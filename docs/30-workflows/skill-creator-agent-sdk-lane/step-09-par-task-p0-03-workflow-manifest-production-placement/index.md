# TASK-P0-03: workflow-manifest.json 本番配置 - タスク実行仕様書

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| 作成日     | 2026-03-29                             |
| 依存タスク | なし                                   |
| 後続タスク | TASK-P0-04                             |
| パターン   | par                                    |

## 概要

workflow-manifest.json が本番パスに存在しない問題を解決する。ManifestLoader は実装済み（441行）だが、読み込む対象ファイルがない。テストフィクスチャ（56行）のみが存在する状態であり、skill-creator の既存ディレクトリ構造（agents/, references/, schemas/, scripts/, assets/）を manifest resource descriptor へ正しくマッピングした本番 manifest を作成・配置する。

## 問題の背景

- ManifestLoader は `schemaVersion`（1 固定）、`workflowId`、`phases[]`、`resources[]`、entry/exit hooks を検証する
- テストフィクスチャは `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` に存在する（56行）
- skill-creator ディレクトリは `.agents/skills/skill-creator/` に存在し、agents/（38 files）、references/（56 files）、schemas/（40 files）、scripts/（31 files）、assets/（56 files）を含む
- ManifestLoader が期待する型: `WorkflowManifest` with `phases[]{id, title, entryHookId, exitHookId, dependsOn?, resourceIds?}`, `resources[]{id, kind, path, phaseIds?}`, entry/exit `hooks[]{id, command}`

## 設計方針

- 配置先: `.agents/skills/skill-creator/workflow-manifest.json`
- skill-creator の既存ディレクトリ構造を manifest resource descriptor へマッピング
- Phase 定義: requirements_gathering, plan, execute, verify, improve の 5 phase
- Resource kind マッピング: agents/ → "agent", references/ → "reference", schemas/ → "schema"
- Entry/exit hooks: 最小限（validation または no-op command）

## スコープ

### 対象

- workflow-manifest.json ファイルの新規作成と `.agents/skills/skill-creator/` への配置
- ManifestLoader.loadManifest() 検証を通る manifest 構造の設計
- skill-creator 既存ディレクトリの resource descriptor マッピング

### 対象外

- ManifestLoader のコード変更（TASK-P0-04 の責務）
- skill-creator ディレクトリ構造自体の変更
- runtime pipeline への manifest 組み込み

## 依存関係

| 種別       | 参照先                                         | 役割                                             |
| ---------- | ---------------------------------------------- | ------------------------------------------------ |
| upstream   | `../requirements-draft.md`                     | skill-creator 全体の要件                         |
| upstream   | `../root-workflow-pack/index.md`               | lane 共通不変条件と責務分離方針                  |
| upstream   | `../p0-verify-manifest-remediation-pack.md`    | P0 是正パックの背景と設計原則                    |
| peer       | TASK-P0-01 (verify engine layer1/2)            | 並列実行可能。manifest は verify と独立          |
| downstream | TASK-P0-04 (ManifestLoader default activation) | 本タスクで配置した manifest を loader が読み込む |

## 現行コードアンカー

| ファイル                                                                                             | 現状の役割                                                              | TASK-P0-03 での扱い                       |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | manifest 検証・読み込みロジック（441行）                                | 変更なし。検証ルールの正本として参照する  |
| `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | テストフィクスチャ（56行）                                              | manifest 構造のリファレンスとして参照する |
| `.agents/skills/skill-creator/`                                                                      | skill-creator ディレクトリ（agents/references/schemas/scripts/assets/） | resource descriptor のマッピング元        |
| `apps/desktop/src/main/services/skill/constants.ts`                                                  | パス定数の定義                                                          | manifest 配置パスの参照元                 |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | ManifestLoader が読み込む本番 manifest が存在しない問題を、skill-creator ディレクトリ構造に即した manifest 作成で閉じること             |
| 依存関係・責務境界   | 本タスクは manifest ファイル作成のみ。ManifestLoader コード変更は P0-04、verify engine は P0-01 に分離済み                              |
| 価値とコストの不均衡 | JSON ファイル1つの作成で完結。コスト最小・価値高（manifest がなければ dynamic resource pipeline が動作しない）                          |
| 改善優先順位         | 1. ManifestLoader 検証ルール読了 2. skill-creator ディレクトリ調査 3. manifest 構造設計 4. manifest 作成・配置 5. loader 検証通過確認   |
| 4条件評価            | 価値性: P0（pipeline 動作の前提）/ 実現性: 高（JSON ファイル作成）/ 整合性: ManifestLoader 型に準拠 / 運用性: loader 検証で自動確認可能 |

## 受入基準

| ID   | 基準                                                                      |
| ---- | ------------------------------------------------------------------------- |
| AC-1 | workflow-manifest.json が `.agents/skills/skill-creator/` に存在する      |
| AC-2 | `ManifestLoader.loadManifest()` の検証をエラーなしで通過する              |
| AC-3 | resource descriptor が skill-creator ディレクトリの実在ファイルを参照する |
| AC-4 | phase 定義が skill creation workflow lifecycle をカバーする               |
| AC-5 | schemaVersion が 1 である（`WORKFLOW_MANIFEST_SCHEMA_VERSION` と一致）    |
| AC-6 | entry/exit hooks が定義され、ManifestLoader の検証を通過する              |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | pending    |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | pending    |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | pending    |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | pending    |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | pending    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | pending    |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | pending    |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | pending    |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | pending    |

## 実行順

1. Phase 1-3 で manifest 構造と resource descriptor マッピングを固定する
2. Phase 4 で ManifestLoader.loadManifest() 統合テストを定義する
3. Phase 5 で workflow-manifest.json を作成・配置する
4. Phase 6-9 で edge case、coverage、品質を確認する
5. Phase 10-11 で最終レビューと手動確認を行う
6. Phase 12 でドキュメントを更新する
7. Phase 13 はユーザー指示があるまで blocked のまま維持する

## 完了定義

| 状態                   | 意味                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `spec_created`         | workflow と Phase 1-13 仕様書が揃い、実行順と検証方法が確定した状態 |
| `implementation_ready` | Phase 1-3 gate が閉じ、実行担当者が Phase 4 へ進める状態            |
| `completed`            | manifest が配置され、ManifestLoader 検証を通過した状態              |

## 注意事項

- 本タスクは manifest ファイルの作成と配置のみを対象とする。ManifestLoader コード変更は TASK-P0-04 の責務である
- resource descriptor の path は skill-creator ディレクトリ内の実在ファイルを指す必要がある
- schemaVersion は必ず 1 とする（WORKFLOW_MANIFEST_SCHEMA_VERSION と一致）
