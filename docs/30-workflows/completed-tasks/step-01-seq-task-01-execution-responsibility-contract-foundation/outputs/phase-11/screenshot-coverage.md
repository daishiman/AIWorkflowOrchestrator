# Phase 11: スクリーンショットカバレッジ

## カバレッジ一覧

| TC-ID | 証跡                                                                 | 画面状態                                       | 判定 |
| ----- | -------------------------------------------------------------------- | ---------------------------------------------- | ---- |
| TC-01 | `outputs/phase-11/screenshots/TC-01-integrated-runtime-ready.png`    | integratedRuntime ready / settings + main chat | PASS |
| TC-02 | `outputs/phase-11/screenshots/TC-02-terminal-surface-ready.png`      | terminalSurface ready / settings + main chat   | PASS |
| TC-03 | `outputs/phase-11/screenshots/TC-03-both-ready.png`                  | both ready / settings + main chat              | PASS |
| TC-04 | `outputs/phase-11/screenshots/TC-04-none-unavailable.png`            | none unavailable / primary hidden              | PASS |
| TC-05 | `outputs/phase-11/screenshots/TC-05-blocked-to-ready-transition.png` | transition board / before + after              | PASS |
| TC-06 | `outputs/phase-11/screenshots/TC-06-silent-fallback-guard.png`       | guard board / silent fallback + no-primary     | PASS |

## 集計

| 指標     | 値   |
| -------- | ---- |
| expected | 6    |
| covered  | 6    |
| coverage | 100% |

## 検証メモ

- すべての TC-ID が `phase-11-manual-test.md` の `画面カバレッジマトリクス` と一致している
- すべての screenshot は `manual-test-result.md` に証跡として紐付いている
