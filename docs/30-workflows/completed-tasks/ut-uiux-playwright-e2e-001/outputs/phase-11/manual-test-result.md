# Phase 11: 手動テスト結果（3層評価）

## テスト結果サマリー

| テストケース | レイヤー | 結果                                 | 証跡                               |
| ------------ | -------- | ------------------------------------ | ---------------------------------- |
| NV-11-01     | Semantic | ⚠️ 23 passed / 10 skipped / 2 failed | `manual-test-report.md`            |
| TC-11-01〜04 | Visual   | ✅ 4 pass                            | `screenshots/TC-11-01-*.png`       |
| TC-11-05〜07 | Visual   | ⚠️ 3 fail                            | `screenshots/TC-11-05/06/07-*.png` |
| NV-11-02     | AI UX    | ✅ PASS                              | `ui-sanity-visual-review.md`       |

## Layer 1 — Semantic 評価

```text
実行コマンド: pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer1
結果: 23 passed, 10 skipped, 2 failed
```

| 評価軸                            | 結果          | 備考                                                        |
| --------------------------------- | ------------- | ----------------------------------------------------------- |
| SEM-001 role / implicit role      | ✅ PASS       | native button / textbox の false positive を解消            |
| SEM-002 aria-label / 可視テキスト | ✅ PASS       | current facts で通過                                        |
| SEM-003 フォーム label 関連付け   | ✅ SKIP/PASS  | フォームなし画面は skip                                     |
| SEM-004 Tab キーフォーカス        | ✅ PASS       | current facts で通過                                        |
| SEM-005 positive tabindex 重複    | ✅ SKIP/PASS  | roving tabindex を許容する判定へ補正                        |
| SEM-006 フォーカストラップ        | ⚠️ FAIL (2件) | chat-main / sidebar-navigation で背景フォーカス leak が残る |
| SEM-007 aria-live / role=alert    | ✅ SKIP/PASS  | エラー非表示画面は skip                                     |

## Layer 2 — Visual 評価

```text
実行コマンド: pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
結果: 7 passed, 3 failed
```

| テストケース                | 結果    | 備考          |
| --------------------------- | ------- | ------------- |
| TC-11-01 chat-main          | ✅ PASS | baseline 一致 |
| TC-11-02 skill-list         | ✅ PASS | baseline 一致 |
| TC-11-03 settings-general   | ✅ PASS | baseline 一致 |
| TC-11-04 sidebar-navigation | ✅ PASS | baseline 一致 |
| TC-11-05 error-display      | ⚠️ FAIL | 113px diff    |
| TC-11-06 loading-state      | ⚠️ FAIL | 113px diff    |
| TC-11-07 dark-mode          | ⚠️ FAIL | 113px diff    |

## Layer 3 — AI UX 目視評価

| 評価軸           | 結果    | 備考                              |
| ---------------- | ------- | --------------------------------- |
| 直感性           | ✅ PASS | レポートと fail path が追いやすい |
| エラー可読性     | ✅ PASS | selector / snapshot 名が出る      |
| 設定追加の容易さ | ✅ PASS | `TEST_TARGETS` 1箇所更新で済む    |

## 総合判定

- HIGH: 1件（`TASK-A11Y-FOCUS-TRAP-001`）
- MEDIUM: 1件（Layer 2 baseline drift）
- LOW: 0件

Phase 11 証跡は current workflow 配下に揃えた。HIGH 問題は `docs/30-workflows/unassigned-task/TASK-A11Y-FOCUS-TRAP-001.md` として formalize する。
