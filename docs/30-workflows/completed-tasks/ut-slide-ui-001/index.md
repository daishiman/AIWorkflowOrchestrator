# UT-SLIDE-UI-001: Slide Workspace UI 4領域実装

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | UT-SLIDE-UI-001              |
| タスク名   | Slide Workspace UI 4領域実装 |
| Issue      | #1365                        |
| ブランチ   | feature/ut-slide-ui-001      |
| 対象機能   | slide-ai-runtime-alignment   |
| 優先度     | 高                           |
| 見積もり   | 中規模                       |
| 作成日     | 2026-03-21                   |
| 依存タスク | UT-SLIDE-IMPL-001            |

## 概要

SlideWorkspace に task-09 で定義した 4領域 UI（SlideSyncCard / SlideProgressRow / SlideWatchStatus / SlideGuidanceBlock）を実装し、runtime/auth-mode と degraded/handoff 導線を user-facing にする。

## Phase 構成

| Phase | 仕様書                       | 状態      |
| ----- | ---------------------------- | --------- |
| 1     | phase-1-requirements.md      | completed |
| 2     | phase-2-design.md            | completed |
| 3     | phase-3-design-review.md     | completed |
| 4     | phase-4-test-creation.md     | completed |
| 5     | phase-5-implementation.md    | completed |
| 6     | phase-6-test-expansion.md    | completed |
| 7     | phase-7-coverage-check.md    | completed |
| 8     | phase-8-refactoring.md       | completed |
| 9     | phase-9-quality-assurance.md | completed |
| 10    | phase-10-final-review.md     | completed |
| 11    | phase-11-manual-test.md      | completed |
| 12    | phase-12-documentation.md    | completed |
| 13    | phase-13-pr-creation.md      | blocked   |

## 成果物ディレクトリ

```
docs/30-workflows/ut-slide-ui-001/
  index.md
  artifacts.json
  phase-1-requirements.md ... phase-13-pr-creation.md
  outputs/
    phase-1/ ... phase-13/
```
