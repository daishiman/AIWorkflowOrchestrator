# Phase 11 Output: Manual Test Plan

| テストケース | 観点                                       | 操作                                      | 証跡                                                   |
| ------------ | ------------------------------------------ | ----------------------------------------- | ------------------------------------------------------ |
| TC-11-01     | Quick Search result hierarchy              | `Cmd/Ctrl+P` → `config` 入力              | `screenshots/TC-11-01-quick-search-results.png`        |
| TC-11-02     | no-match empty state / dark theme contrast | `Cmd/Ctrl+P` → `zzz-no-hit` 入力          | `screenshots/TC-11-02-quick-search-no-match-dark.png`  |
| TC-11-03     | keyboard select → preview auto-open        | `Cmd/Ctrl+P` → `app` → `Enter`            | `screenshots/TC-11-03-quick-search-select-preview.png` |
| TC-11-04     | structured preview parse fallback          | `invalid.json` を開き `プレビュー` を選択 | `screenshots/TC-11-04-structured-preview-fallback.png` |
| TC-11-05     | timeout 3回 retry 後の transport alert     | `hanging.md` を開いて timeout 待機        | `screenshots/TC-11-05-preview-timeout-alert.png`       |

## 補足

- current source の renderer dev server を使用し、Electron API は Phase 11 harness mock で差し替えた
- mobile は今回の変更 concern から外れるため N/A、dark theme は no-match state のみ撮影した
