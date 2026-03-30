# TASK-P0-03: workflow-manifest.json canonical 配置と mirror 同期 - タスク実行仕様書

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

workflow-manifest.json が canonical / mirror の両 root に存在しない問題を解決する。ManifestLoader は実装済み（441行）だが、読み込む対象ファイルがない。テストフィクスチャ（56行）のみが存在する状態であり、skill-creator の既存ディレクトリ構造（agents/, references/, schemas/, scripts/, assets/）を manifest resource descriptor へ正しくマッピングした manifest を `.claude` 正本として作成し、`.agents` mirror と same-wave で同期する。

## 問題の背景

- ManifestLoader は `schemaVersion`（1 固定）、`workflowId`、`phases[]`、`resources[]`、entry/exit hooks を検証する
- テストフィクスチャは `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` に存在する（56行）
- skill-creator ディレクトリは `.claude/skills/skill-creator/` を正本、`.agents/skills/skill-creator/` を mirror として保持している
- ManifestLoader が期待する型: `WorkflowManifest` with `phases[]{id, title, entryHookId, exitHookId, dependsOn?, resourceIds?}`, `resources[]{id, kind, path, phaseIds?}`, entry/exit `hooks[]{id, command}`

## 設計方針

- canonical 配置先: `.claude/skills/skill-creator/workflow-manifest.json`
- mirror 配置先: `.agents/skills/skill-creator/workflow-manifest.json`
- skill-creator の既存ディレクトリ構造を manifest resource descriptor へマッピングし、canonical root を基準に mirror parity を維持する
- Phase 定義: requirements-gathering, plan, execute, verify, improve の 5 phase
- Resource kind マッピング: agents/ → "agent", references/ → "reference", schemas/ → "schema"
- Entry/exit hooks: 最小限（validation または no-op command）

## スコープ

### 対象

- workflow-manifest.json ファイルの新規作成と `.claude/skills/skill-creator/` 正本配置
- `.agents/skills/skill-creator/` への mirror 同期と parity 検証
- ManifestLoader.loadManifest() 検証を通る manifest 構造の設計
- skill-creator 既存ディレクトリの resource descriptor マッピング

### 対象外

- ManifestLoader のコード変更（TASK-P0-04 の責務）
- skill-creator ディレクトリ構造自体の変更
- runtime pipeline への manifest 組み込み

## 依存関係

| 種別       | 参照先                                                                   | 役割                                             |
| ---------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| upstream   | `../skill-creator-agent-sdk-lane/requirements-draft.md`                  | skill-creator 全体の要件                         |
| upstream   | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`            | 旧 lane 側で維持される共通不変条件と責務分離方針 |
| upstream   | `../skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` | P0 是正パックの背景と設計原則                    |
| peer       | TASK-P0-01 (verify engine layer1/2)                                      | 並列実行可能。manifest は verify と独立          |
| downstream | TASK-P0-04 (ManifestLoader default activation)                           | 本タスクで配置した manifest を loader が読み込む |

## 現行コードアンカー

| ファイル                                                                                             | 現状の役割                               | TASK-P0-03 での扱い                   |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------- |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | manifest 検証・読み込みロジック（441行） | 変更なし。検証ルールの正本として参照  |
| `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | テストフィクスチャ（56行）               | manifest 構造のリファレンスとして参照 |
| `.claude/skills/skill-creator/`                                                                      | skill-creator canonical root             | resource descriptor の正本            |
| `.agents/skills/skill-creator/`                                                                      | skill-creator mirror root                | same-wave parity の確認先             |
| `apps/desktop/src/main/services/skill/constants.ts`                                                  | パス定数の定義                           | manifest 配置パスの参照元             |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | ManifestLoader が読み込む manifest 不在だけでなく、skill root の canonical / mirror 方針を曖昧にしたまま配置先を決めている点を同時に閉じること |
| 依存関係・責務境界   | 本タスクは manifest 作成と root parity の定義までを担当し、ManifestLoader コード変更は P0-04、verify engine は P0-01 に分離する                |
| 価値とコストの不均衡 | JSON ファイル自体は軽量だが、root 方針を誤ると Phase 12 と mirror 運用が破綻するため、初回で canonical / mirror を固定する価値が高い           |
| 改善優先順位         | 1. ManifestLoader 検証ルール読了 2. canonical / mirror root 調査 3. manifest 構造設計 4. canonical 作成 + mirror sync 5. loader 検証確認       |
| 4条件評価            | 価値性: P0 / 実現性: 高 / 整合性: `.claude` 正本方針に準拠 / 運用性: loader 検証 + parity check + Phase 12 sync で監査可能                     |

## 受入基準

| ID   | 基準                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| AC-1 | workflow-manifest.json が `.claude/skills/skill-creator/` に存在する              |
| AC-2 | `.agents/skills/skill-creator/workflow-manifest.json` が canonical と同期している |
| AC-3 | `ManifestLoader.loadManifest()` の検証をエラーなしで通過する                      |
| AC-4 | resource descriptor が canonical root の実在ファイルを参照する                    |
| AC-5 | phase 定義が skill creation workflow lifecycle をカバーする                       |
| AC-6 | schemaVersion が 1 である（`WORKFLOW_MANIFEST_SCHEMA_VERSION` と一致）            |
| AC-7 | entry/exit hooks が定義され、ManifestLoader の検証を通過する                      |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | pending    |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | pending    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | pending    |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | pending    |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | pending    |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 実行順

1. Phase 1-3 で manifest 構造と resource descriptor マッピングを固定する
2. Phase 4 で ManifestLoader.loadManifest() 統合テストを定義する
3. Phase 5 で workflow-manifest.json を `.claude` に作成し、`.agents` へ同期する
4. Phase 6-9 で edge case、coverage、品質を確認する
5. Phase 10-11 で最終レビューと手動確認を行う
6. Phase 12 でドキュメントを更新する
7. Phase 13 はユーザー指示があるまで blocked のまま維持する

## standalone 化メモ

- current canonical task directory は `docs/30-workflows/step-09-par-task-p0-03-workflow-manifest-production-placement/` とする
- 旧 lane 名 `skill-creator-agent-sdk-lane` は upstream 参照のみに残し、本 task 自身の workflow ID や成果物台帳には残さない
- Phase 12 では `artifacts.json` と `outputs/artifacts.json` の同一 wave 同期、Step 1-A〜1-C の close-out、`.claude` canonical / `.agents` mirror 判定を明記して閉じる

## 完了定義

| 状態                   | 意味                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `spec_created`         | workflow と Phase 1-13 仕様書が揃い、実行順・検証方法・台帳同期方針が確定した状態                    |
| `implementation_ready` | Phase 1-3 gate が閉じ、実行担当者が Phase 4 へ進める状態                                             |
| `completed`            | canonical + mirror 両 root に manifest が配置され、ManifestLoader 検証と parity check を通過した状態 |

## 注意事項

- 本タスクは manifest ファイルの作成、canonical / mirror 同期、close-out ルールの固定までを対象とする。ManifestLoader コード変更は TASK-P0-04 の責務である
- resource descriptor の path は `.claude/skills/skill-creator/` 正本側の実在ファイルを指す必要がある
- schemaVersion は必ず 1 とする（WORKFLOW_MANIFEST_SCHEMA_VERSION と一致）
- runtime 配置対象は `.agents/skills/skill-creator/workflow-manifest.json` だが、Phase 12 の system spec sync は `.claude/skills/...` を canonical root として判定する
