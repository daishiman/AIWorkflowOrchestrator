# workspace-preview-search-resilience-guard - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001                                          |
| 機能名     | workspace-preview-search-resilience-guard                                                     |
| 元タスク   | `docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` |
| 関連Issue  | `docs/30-workflows/issues/issue-1161.md` / GitHub Issue #1161                                 |
| 作成日     | 2026-03-13                                                                                    |
| ステータス | completed（Phase 1-12 completed / Phase 13 blocked）                                          |
| 依存タスク | TASK-UI-04C-WORKSPACE-PREVIEW                                                                 |

## 概要

`TASK-UI-04C-WORKSPACE-PREVIEW` で露出した 3 つの難所、すなわち fuzzy no-match、renderer timeout + retry、parse/transport/crash/no-match の error taxonomy を WorkspaceView 内で再利用可能なガードへ昇格した。Phase 1-3 で要件と設計を確定し、その後にテスト、実装、画面検証、system spec 同期まで Phase 12 で閉じた。

## Atent Team / SubAgent 分担

| SubAgent   | 担当関心ごと                           | 主担当Phase      |
| ---------- | -------------------------------------- | ---------------- |
| SubAgent-A | fuzzy ranking / search utility         | 1, 2, 4, 5, 6, 8 |
| SubAgent-B | preview read resilience                | 1, 2, 4, 5, 6, 7 |
| SubAgent-C | error taxonomy / fallback UI           | 1, 2, 5, 9, 11   |
| SubAgent-D | workflow / system spec / Phase 12 sync | 1, 3, 10, 12     |

## ユーザー指定ポリシー反映

- 要件定義と設計を先に完了してからテストと実装へ進む順序を維持した
- 各 phase で `outputs/` 配下へ成果物を出力した
- UI/UX 実装を含むため、Phase 11 でスクリーンショットを取得し Apple UI/UX 観点のレビューを実施した
- commit / PR は未実施のまま維持した
- `.claude/skills/...` を canonical root、`.agents/...` を mirror として扱った

## Phase 一覧

| Phase | 名称                 | ファイル                                                       | ステータス |
| ----- | -------------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 主要成果物

| 区分             | パス                                           | 用途                               |
| ---------------- | ---------------------------------------------- | ---------------------------------- |
| 要件定義         | `outputs/phase-1/requirements-definition.md`   | FR/NFR と concern inventory        |
| 設計             | `outputs/phase-2/resilience-guard-design.md`   | search / preview / taxonomy 設計   |
| テスト仕様       | `outputs/phase-4/test-specification.md`        | red/green 対応表                   |
| 実装結果         | `outputs/phase-5/implementation-plan.md`       | 変更ファイルと lane 実績           |
| カバレッジ       | `outputs/phase-7/coverage-report.md`           | targeted coverage 実測値           |
| QA               | `outputs/phase-9/quality-report.md`            | typecheck / eslint / vitest / risk |
| 手動検証         | `outputs/phase-11/manual-test-result.md`       | TC と `.png` 証跡                  |
| Apple review     | `outputs/phase-11/apple-uiux-visual-review.md` | 視覚品質レビュー                   |
| ドキュメント同期 | `outputs/phase-12/spec-update-summary.md`      | exact count / path / status 同期   |
| 検証レポート     | `outputs/verification-report.md`               | validator と verification 実行結果 |

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard --json

node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard
```

## 完了条件

- Phase 1-12 の本文、`artifacts.json`、`outputs/artifacts.json`、`outputs/phase-*` が completed で一致している
- Quick Search / PreviewPanel / error taxonomy / docs sync の 4 concern がテストと手動検証まで閉じている
- Phase 11 の TC と `.png` 証跡が 1:1 でひも付いている
- Phase 12 で workflow、completed task spec、system spec、LOGS、SKILL、topic-map、mirror sync を同一ターンで更新している
- commit / PR は実施していない
