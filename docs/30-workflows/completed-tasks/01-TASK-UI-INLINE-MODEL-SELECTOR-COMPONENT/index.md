# Task 01: InlineModelSelector 共通コンポーネント

## メタ情報

| 項目     | 値                                                                    |
| -------- | --------------------------------------------------------------------- |
| タスクID | `TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT`                             |
| 作成日   | 2026-03-21                                                            |
| 更新日   | 2026-03-22                                                            |
| 依存     | なし                                                                  |
| 現在状態 | 実装済み / ChatView・Workspace への mount は Task 02 / Task 03 で扱う |

## 目的

Chat surface で共通利用できる compact な provider / model selector を提供する。Task 01 の責務は shared component の作成と contract 固定であり、live 画面への配置は後続タスクに委譲する。

## 成果

- `InlineModelSelector.tsx` を追加
- `index.ts` から export
- provider 取得、health 更新、default model 選択の store 連携を確定
- unit test を追加
- Phase 12 の implementation guide / spec sync / feedback / compliance を更新

## 主要ファイル

| 種別        | パス                                                                              |
| ----------- | --------------------------------------------------------------------------------- |
| 実装        | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                |
| test        | `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx` |
| export      | `apps/desktop/src/renderer/components/llm/index.ts`                               |
| system spec | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`         |

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

## 後続タスク

- [Task 02](../02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/index.md): ChatView header へ配置
- [Task 03](../03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/index.md): WorkspaceChatPanel へ配置
