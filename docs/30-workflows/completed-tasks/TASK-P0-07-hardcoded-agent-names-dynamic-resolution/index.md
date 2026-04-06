# TASK-P0-07: ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | TASK-P0-07                                                               |
| 機能名     | hardcoded-agent-names-dynamic-resolution                                 |
| カテゴリ   | リファクタリング（Feature Gap系）                                        |
| 優先度     | 中                                                                       |
| 規模       | 中規模                                                                   |
| ステータス | 仕様書作成済（spec_created）                                             |
| 作成日     | 2026-04-06                                                               |
| 総Phase数  | 13                                                                       |
| Issue      | [#1892](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1892) |

## 概要

`RuntimeSkillCreatorFacade` の `plan()` / `improve()` メソッドにおいて、エージェントリソースの解決を `workflow-manifest.json` から動的に行う仕組みへリファクタリングする。manifest を主正本とし、manifest 不在時は既存の静的定数（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする二重構造を実現する。

## Phase 一覧

| Phase | 名称             | 仕様書                                                       | ステータス |
| ----- | ---------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)                   | pending    |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト       | [phase-11-manual-testing.md](phase-11-manual-testing.md)     | pending    |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

## 実行フロー

```
Phase 1: 要件定義
    ↓
Phase 2: 設計
    ↓
Phase 3: 設計レビュー ──── Design Gate ────┐
    ↓ PASS                                │ MAJOR → Phase 2 へ戻り
Phase 4: テスト作成（TDD: Red）           │ CRITICAL → Phase 1 へ戻り
    ↓                                     │
Phase 5: 実装（TDD: Green）               │
    ↓                                     │
Phase 6: テスト拡充                       │
    ↓                                     │
Phase 7: カバレッジ確認                   │
    ↓                                     │
Phase 8: リファクタリング（TDD: Refactor）│
    ↓                                     │
Phase 9: 品質保証                         │
    ↓                                     │
Phase 10: 最終レビュー ── Final Gate ─────┘
    ↓ PASS/MINOR
Phase 11: 手動テスト（NON_VISUAL）
    ↓
Phase 12: ドキュメント更新
    ↓
Phase 13: PR作成（ユーザー承認後）
```

## 受け入れ基準（AC）

| AC ID | 基準                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| AC-1  | `plan()` の動的パスで manifest の `plan` フェーズ `resourceIds` からエージェントリストが組み立てられる                               |
| AC-2  | `improve()` の動的パスで manifest の `improve` フェーズ `resourceIds` からエージェントリストが組み立てられる                         |
| AC-3  | manifest にフェーズが存在しない場合、対応する静的定数（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする  |
| AC-4  | manifest の `resourceIds` が空の場合、対応する静的定数（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする |
| AC-5  | フォールバック発動時にログ出力がある                                                                                                 |
| AC-6  | `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は削除されず保持されている                                                    |
| AC-7  | 既存テスト `T-P7-04` が PASS する                                                                                                    |
| AC-8  | typecheck / lint がエラーなし                                                                                                        |

## 変更対象ファイル

### 新規作成

| ファイル                                                                            | 目的                                                      |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                | `buildPhaseResourceRequestsFromManifest()` ユーティリティ |
| `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts` | ユーティリティのユニットテスト                            |

### 修正

| ファイル                                                              | 変更内容                                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan()/improve() の動的パスで `resolveOperationResources()` 経由の manifest 由来解決を使用 |

### 変更なし

| ファイル                                                           | 理由                                  |
| ------------------------------------------------------------------ | ------------------------------------- |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`    | 静的フォールバックとして保持（FR-05） |
| `apps/desktop/src/main/services/runtime/improvePromptConstants.ts` | 静的フォールバックとして保持（FR-05） |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`         | TASK-P0-04 の責務（スコープ外）       |
| `.claude/skills/skill-creator/workflow-manifest.json`              | TASK-P0-03 の責務（スコープ外）       |

## Phase 完了時の必須アクション

1. **タスク完全実行**: Phase 内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json 更新**: Phase 完了ステータスを更新

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-P0-07-hardcoded-agent-names-dynamic-resolution --phase N
```

## 主要成果物一覧

| Phase | 成果物                                           |
| ----- | ------------------------------------------------ |
| 1     | `outputs/phase-1/requirements.md`                |
| 1     | `outputs/phase-1/investigation-report.md`        |
| 2     | `outputs/phase-2/design.md`                      |
| 3     | `outputs/phase-3/design-review-result.md`        |
| 4     | `outputs/phase-4/test-plan.md`                   |
| 5     | `outputs/phase-5/implementation-evidence.md`     |
| 6     | `outputs/phase-6/test-expansion-report.md`       |
| 7     | `outputs/phase-7/coverage-report.md`             |
| 8     | `outputs/phase-8/refactoring-report.md`          |
| 9     | `outputs/phase-9/quality-report.md`              |
| 10    | `outputs/phase-10/final-review-result.md`        |
| 11    | `outputs/phase-11/manual-test-result.md`         |
| 11    | `outputs/phase-11/discovered-issues.md`          |
| 12    | `outputs/phase-12/implementation-guide.md`       |
| 12    | `outputs/phase-12/documentation-changelog.md`    |
| 12    | `outputs/phase-12/system-spec-update-summary.md` |
| 12    | `outputs/phase-12/unassigned-task-detection.md`  |
| 12    | `outputs/phase-12/skill-feedback-report.md`      |
| 13    | `outputs/phase-13/pr-info.md`                    |

## 関連タスク

| タスク     | 関係                                      | ステータス |
| ---------- | ----------------------------------------- | ---------- |
| TASK-P0-03 | 前提: workflow-manifest.json 本番配置     | 完了       |
| TASK-P0-04 | 前提: ManifestLoader デフォルト有効化     | 完了       |
| TASK-P0-01 | 並行: SkillCreatorVerificationEngine 実装 | 完了       |
