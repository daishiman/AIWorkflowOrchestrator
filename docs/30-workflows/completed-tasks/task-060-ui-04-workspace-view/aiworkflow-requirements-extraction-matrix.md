# aiworkflow-requirements 抽出マトリクス

## 目的

`aiworkflow-requirements` スキルに従って、今回の親参照仕様 workflow で何をどこから抽出したかを固定し、entrypoint だけでなく必要な quality / UX / error taxonomy まで拾えているかを監査可能にする。

## 抽出マトリクス

| 抽出テーマ             | 正本仕様                                                                          | 抽出した内容                                                        | 反映先                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 入口                   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | UI / state / IPC / testing を読む順番                               | `index.md`, `phase-1-requirements.md`, `phase-9-quality-assurance.md`                                                       |
| 検索再現性             | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | Workspace 系検索語と再入場順序                                      | `index.md`, `phase-1-requirements.md`, `phase-7-coverage-check.md`, `phase-9-quality-assurance.md`                          |
| view 位置付け          | `.claude/skills/aiworkflow-requirements/references/master-design.md`              | `WorkspaceView` は「作業スペース」の parent view である             | `index.md`, `phase-1-requirements.md`                                                                                       |
| 全体アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | Layered Architecture、Renderer / Main / Preload の責務分離          | `index.md`, `phase-1-requirements.md`, `phase-2-design.md`                                                                  |
| UI inventory           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | Workspace 系 completed record と共通 component inventory            | `index.md`, `phase-2-design.md`, `phase-12-documentation.md`                                                                |
| 機能別 UI              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 04A / 04B / 04C の責務、完了記録、関連未タスク                      | `index.md`, `phase-1-requirements.md`, `phase-2-design.md`, `phase-11-manual-test.md`, `phase-12-documentation.md`          |
| ナビ導線               | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | `workspace` ViewType、layout 契約、QuickFileSearch 契約             | `index.md`, `phase-2-design.md`, `phase-12-documentation.md`                                                                |
| 用語 / UX ライティング | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | `workspace` → `作業スペース` などの user-facing vocabulary          | `index.md`, `phase-8-refactoring.md`, `phase-12-documentation.md`                                                           |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | 04A / 04B / 04C の ownership、新規 slice 追加なし                   | `index.md`, `phase-2-design.md`, `phase-9-quality-assurance.md`                                                             |
| IPC 境界               | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | 04A watch、04C preview read reuse、QuickSearch Renderer-only search | `index.md`, `phase-2-design.md`, `phase-5-implementation.md`                                                                |
| セキュリティ境界       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | watch cleanup、preview security、chat stream cleanup                | `index.md`, `phase-2-design.md`, `phase-9-quality-assurance.md`                                                             |
| 品質ゲート             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 非機能要件、テスト戦略、品質ゲート、WCAG 2.1 AA                     | `index.md`, `phase-7-coverage-check.md`, `phase-9-quality-assurance.md`, `phase-10-final-review.md`                         |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | component / integration test の標準パターン                         | `phase-4-test-creation.md`, `phase-6-test-expansion.md`                                                                     |
| a11y テスト            | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | ARIA、keyboard、dialog の検証観点                                   | `phase-7-coverage-check.md`, `phase-11-manual-test.md`                                                                      |
| error taxonomy         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | preview/search の transport / parse / crash / no-match 分離         | `phase-9-quality-assurance.md`, `phase-12-documentation.md`                                                                 |
| 完了台帳               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | child workflow の完了状態、Phase 11 / 12 記録                       | `index.md`, `phase-3-design-review.md`, `phase-11-manual-test.md`, `phase-12-documentation.md`                              |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | current build capture、path drift、防止策                           | `index.md`, `phase-3-design-review.md`, `phase-6-test-expansion.md`, `phase-11-manual-test.md`, `phase-12-documentation.md` |

## 抽出漏れ監査結果

| 判定         | 内容                                                                                                                                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追加反映済み | `master-design.md`, `architecture-overview.md`, `ui-ux-components.md`, `ui-ux-design-principles.md`, `quality-requirements.md`, `testing-component-patterns.md`, `testing-accessibility.md`, `error-handling.md` まで抽出対象を拡張した |
| 更新不要     | `directory-structure.md`, `database-*.md`, `rag-desktop-state.md` は今回が docs-only parent spec であり、配置変更・永続化変更・RAG state 追加が無いため対象外とした                                                                     |
