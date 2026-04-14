# Phase 11: スクリーンショットカバレッジ

## カバレッジマトリクス

| AC                         | スクリーンショット                                           | ユニットテスト                |
| -------------------------- | ------------------------------------------------------------ | ----------------------------- |
| AC-1（先頭にバッジ）       | `q5-multi-select-badge.png` ✅                               | TC-1 ✅                       |
| AC-2（1件はバッジなし）    | `q5-single-select.png` ✅                                    | TC-3 ✅                       |
| AC-3（aria-label）         | DOM確認 ✅                                                   | TC-4 ✅                       |
| AC-4（他設問に副作用なし） | `q3-no-badge.png` / `q4-no-badge.png` / `q6-no-badge.png` ✅ | TC-5, RG-MSO-Q4, RG-MSO-Q6 ✅ |
| AC-5（3件選択で先頭のみ）  | `q5-multi-select-badge.png` ✅                               | TC-6 ✅                       |
| AC-6（0件はバッジなし）    | 初期状態確認 ✅                                              | FP-MSO-02 ✅                  |

## 補足

全ACはユニットテストとスクリーンショットで確認済み。
証跡は `docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001/outputs/phase-11/screenshots/` に保存済み。
