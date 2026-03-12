# Phase 6 アクセシビリティケース

| 観点               | 実装 / 検証                                                | 結果 |
| ------------------ | ---------------------------------------------------------- | ---- |
| dialog role        | `QuickFileSearch` に `role="dialog"` / `aria-modal="true"` | PASS |
| live region        | result count を sr-only + `aria-live="polite"` で通知      | PASS |
| keyboard-only      | Arrow / Enter / Escape / Tab trap を実装                   | PASS |
| alert surface      | Preview error / ErrorBoundary に `role="alert"`            | PASS |
| status live region | `WorkspaceStatusBar` が `role="status"`                    | PASS |

## 手動確認

- `TC-11-04`, `TC-11-06`, `TC-11-08` で keyboard / overlay 品質を確認済み
