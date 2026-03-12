# Phase 11 手動テスト計画

## 実施日時

- build: `2026-03-11T15:57Z` 付近
- local review basis: `2026-03-12 JST`

## preflight

1. `pnpm --filter @repo/desktop build`
2. `python3 -m http.server 4173 --bind 127.0.0.1 --directory apps/desktop/out/renderer`
3. `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard`

## current build source pinning

| 項目        | 値                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| baseUrl     | `http://127.0.0.1:4173`                                                                                              |
| build asset | `globals-DHvT_oEb.css`, `globals-FyoUcilx.js`, `index-D3KPKqJb.js`, `phase11-light-theme-contrast-guard-DMr9deGI.js` |
| metadata    | `outputs/phase-11/screenshots/phase11-capture-metadata.json`                                                         |

## TC 計画

| TC-ID    | route                                                                           | selector                                 | focus                                          |
| -------- | ------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| TC-11-01 | `/phase11-light-theme-contrast-guard.html?surface=settings&theme=light`         | `[data-testid="settings-view"]`          | settings shell, theme selector, secondary text |
| TC-11-02 | `/phase11-light-theme-contrast-guard.html?surface=dashboard&theme=light`        | `[data-testid="dashboard-view"]`         | surface hierarchy, card border, readability    |
| TC-11-03 | `/phase11-light-theme-contrast-guard.html?surface=auth&theme=light`             | `[data-testid="auth-view-panel"]`        | glass panel, CTA, helper text                  |
| TC-11-04 | `/phase11-light-theme-contrast-guard.html?surface=workspace-search&theme=light` | `[data-testid="workspace-search-panel"]` | panel contrast, input, result row              |
| TC-11-05 | `/phase11-light-theme-contrast-guard.html?surface=dashboard&theme=dark`         | `[data-testid="dashboard-view"]`         | dark baseline                                  |

## Apple UI/UX review lens

| 観点        | 確認内容                                                     |
| ----------- | ------------------------------------------------------------ |
| Hierarchy   | 主要見出し、補助情報、アクションの視線誘導が分離されているか |
| Contrast    | light background 上で helper text や metadata が沈まないか   |
| Spacing     | card / panel / row の余白が情報密度に対して適切か            |
| Materiality | panel border と tint が light / dark で役割を持っているか    |

## 判定ルール

- 今回差分の合否は `current` を基準にする。
- light remediation 未実施の所見は `baseline backlog` として `discovered-issues.md` に残す。
- route 全景でなく selector capture を正本とする。
