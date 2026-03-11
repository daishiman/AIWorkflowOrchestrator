# Phase 2 aiworkflow-requirements 抽出

## 参照した正本

| 正本                       | 今回採用した契約                         |
| -------------------------- | ---------------------------------------- |
| `ui-ux-navigation.md`      | Bell 導線、`aria-label`、header 右端配置 |
| `ui-ux-components.md`      | 単一大コンポーネントの責務分割           |
| `ui-ux-portal-patterns.md` | Portal、stacking context、focus return   |
| `arch-state-management.md` | 個別 selector、100件保持、dedupe         |
| `api-ipc-system.md`        | invoke / on 契約、request/response 形    |
| `security-electron-ipc.md` | allowlist、sender 検証、cleanup          |
| `testing-accessibility.md` | Escape、dialog、live region、focus trap  |
| `quality-requirements.md`  | TDD、coverage gate、apps/desktop 起点    |

## 設計への反映

- Bell は `aria-haspopup="dialog"` と `aria-expanded` を持つ
- popover は `createPortal(document.body)` で描画する
- notification state は store を正本、gesture/focus は local state に留める
- delete channel は preload allowlist と main sender 検証を必須にする
- a11y test では Escape、Tab wrap、focus return、live region を必須化する
