# Phase 1 Output: Requirements Definition

## 1. 目的

`TASK-UI-04C-WORKSPACE-PREVIEW` で一度解決した 3 つの難所を、次の preview/search UI でも再利用できる guard として formalize する。

## 2. 要件サマリ

| ID    | 種別   | 内容                                                                                      | 根拠                                                          |
| ----- | ------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| FR-1  | 機能   | QuickFileSearch の no-match を空配列へ戻し、stable sort と top 10 制御を再利用可能にする  | `ui-ux-search-panel.md`, `ui-ux-feature-components.md`        |
| FR-2  | 機能   | preview 読み込みの timeout / retry / loading release を renderer local で標準化する       | `api-ipc-system.md`, `security-electron-ipc.md`               |
| FR-3  | 機能   | parse / transport / crash / no-match の taxonomy を分離し、UI 応答を固定する              | `error-handling.md`, `ui-ux-feature-components.md`            |
| FR-4  | 機能   | Phase 12 exact count / ID / path sync を workflow / outputs / system spec で一致させる    | `task-workflow.md`, `lessons-learned.md`                      |
| NFR-1 | 非機能 | 新規 IPC を追加しない                                                                     | `api-ipc-system.md`                                           |
| NFR-2 | 非機能 | state ownership は 04C の local state 境界を崩さない                                      | `arch-state-management.md`                                    |
| NFR-3 | 非機能 | Phase 1-3 の設計を先に完了し、その後にテスト・実装・doc sync へ進む                       | user policy                                                   |
| NFR-4 | 非機能 | commit、PR は行わない                                                                     | user policy                                                   |
| NFR-5 | 非機能 | `.claude` 正本仕様を各 phase に明示する                                                   | user policy / skill policy                                    |
| NFR-6 | 非機能 | preview resilience の共通ガードは既存 sanitize / dangerous URL / CSP 契約を崩さない       | `security-input-validation.md`, `ui-ux-feature-components.md` |
| NFR-7 | 非機能 | UI語彙、QuickFileSearch dialog の視覚方向性、Apple review 観点を 04C catalog と整合させる | `ui-ux-components.md`, `ui-ux-design-system.md`               |

## 3. concern inventory

| concern            | 現状の問題                                                     | future target                     |
| ------------------ | -------------------------------------------------------------- | --------------------------------- |
| search resilience  | `score=0` 候補が混入しやすい                                   | pure utility / hook rule          |
| preview resilience | `file:read` hang で loading 固着の再発余地がある               | renderer helper / hook contract   |
| error taxonomy     | transport / parse / crash / no-match が feature 局所知識のまま | common taxonomy + UI rule         |
| docs sync          | Phase 12 exact count が task ごとに再発見される                | workflow checklist + script guard |

## 4. 対象ファイルアンカー

| 区分                  | 対象                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| implementation anchor | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useQuickFileSearch.ts`                          |
| implementation anchor | `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel.tsx`                          |
| test anchor           | `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts`           |
| test anchor           | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx`                      |
| test anchor           | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx`              |
| docs anchor           | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/outputs/phase-12/` |

## 5. 除外範囲

- 04C 自体の UI リデザイン
- `file:read` / `file:changed` の新規 channel 追加
- Workspace Chat 本体の機能追加
- 追加 preview engine 導入
