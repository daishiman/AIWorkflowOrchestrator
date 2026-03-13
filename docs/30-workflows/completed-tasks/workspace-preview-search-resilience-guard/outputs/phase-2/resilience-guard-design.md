# Phase 2 Output: Resilience Guard Design

## 1. ガード層設計

| concern            | 形                            | 配置候補                                  | 成功条件                                                  |
| ------------------ | ----------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| search resilience  | pure utility + hook rule      | `WorkspaceView/hooks` 配下                | no-match は `[]`、same score は stable、top 10 を超えない |
| preview resilience | helper または hook contract   | `WorkspaceView/components` / `hooks` 配下 | timeout / success / fatal のどれでも loading が閉じる     |
| error taxonomy     | common table + UI rule        | docs / renderer UI                        | parse と transport を同じ fatal surface に載せない        |
| docs sync          | checklist + script validation | workflow / Phase 12                       | exact count / task ID / path が一致する                   |

## 2. 設計原則

- search guard は「一致判定」と「順位補正」を分離する。
- preview guard は renderer local の制御に閉じ、Main / Preload の許可境界を広げない。
- error taxonomy は recoverable と fatal を混ぜない。
- docs sync guard は workflow / outputs / system spec を同一ターンで更新する。

## 3. future implementation anchor

| concern            | 実装候補                                                                              | 補足                                      |
| ------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| search resilience  | `useQuickFileSearch.ts` / `useQuickFileSearch.test.ts`                                | pure function 抽出を優先                  |
| preview resilience | `PreviewPanel.tsx` / `PreviewPanel.test.tsx`                                          | helper と UI state を分離                 |
| crash / fallback   | `PreviewErrorBoundary.test.tsx`                                                       | parse failure と crash reset の区別を維持 |
| docs sync          | Phase 12 outputs / `task-workflow.md` / `ui-ux-search-panel.md` / `error-handling.md` | exact count を合わせる                    |

## 4. リスクと対策

| リスク                                                      | 対策                                          |
| ----------------------------------------------------------- | --------------------------------------------- |
| search helper が 04C 専用の文脈に依存して再利用しにくい     | pure input / output の utility へ寄せる       |
| preview helper が retry を parse failure にも適用してしまう | transport 系だけ retryable と明記する         |
| docs sync が workflow だけ更新して system spec が追随しない | Phase 12 checklist に related spec を固定する |
