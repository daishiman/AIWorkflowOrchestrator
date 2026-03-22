# Task 02: ChatView への InlineModelSelector 統合

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | `TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION` |
| 作成日   | 2026-03-21                                    |
| 更新日   | 2026-03-22                                    |
| 依存     | Task 01                                       |
| 現在状態 | `spec_created` / 未実装                       |

## 目的

Task 01 で作成した `InlineModelSelector` を ChatView header に配置し、`LLMGuidanceBanner` と競合しない形でモデル切り替え導線を提供する。

## 予定変更箇所

| 種別           | パス                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主実装         | `apps/desktop/src/renderer/views/ChatView/index.tsx`                                                                                                |
| 関連 UI        | `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`                                                                                    |
| 共通 component | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                                                  |
| spec sync 候補 | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md` / `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` |

## Phase 一覧

| Phase | ファイル                                                 |
| ----- | -------------------------------------------------------- |
| 1     | [phase-1-requirements.md](./phase-1-requirements.md)     |
| 2     | [phase-2-design.md](./phase-2-design.md)                 |
| 3     | [phase-3-design-review.md](./phase-3-design-review.md)   |
| 4     | [phase-4-test.md](./phase-4-test.md)                     |
| 5     | [phase-5-implementation.md](./phase-5-implementation.md) |
| 6     | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| 7     | [phase-7-coverage.md](./phase-7-coverage.md)             |
| 8     | [phase-8-refactoring.md](./phase-8-refactoring.md)       |
| 9     | [phase-9-quality.md](./phase-9-quality.md)               |
| 10    | [phase-10-final-review.md](./phase-10-final-review.md)   |
| 11    | [phase-11-manual-test.md](./phase-11-manual-test.md)     |
| 12    | [phase-12-documentation.md](./phase-12-documentation.md) |
| 13    | [phase-13-pr-creation.md](./phase-13-pr-creation.md)     |
