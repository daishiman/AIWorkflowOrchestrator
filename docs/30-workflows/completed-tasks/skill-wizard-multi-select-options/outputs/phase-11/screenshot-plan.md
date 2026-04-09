# Phase 11 成果物: スクリーンショット計画

## 確認日: 2026-04-09

## 実施状況

Playwright ブラウザで以下のスクリーンショットを取得済み。
`outputs/phase-11/screenshots/` に保存し、`screenshot-manifest.json` で一覧化した。

## 取得計画

| ファイル名                        | 画面・状態                                        | 取得タイミング                      |
| --------------------------------- | ------------------------------------------------- | ----------------------------------- |
| `q1-single-select.png`            | Q1 で 1 つだけ選択した状態                        | 「自分のみ」クリック直後            |
| `q1-multi-select.png`             | Q1 で 2 つ以上選択した状態                        | 「チームメンバー」追加クリック後    |
| `q1-all-deselected.png`           | Q1 で全選択を解除した状態                         | 最後の選択ボタンを解除後            |
| `q3-schedule-expanded.png`        | Q3「定期実行」選択・ScheduleConfigInput 展開      | 「定期実行」クリック後              |
| `q3-schedule-plus-manual.png`     | Q3「定期実行」+「手動実行」同時選択               | 「手動実行」追加クリック後          |
| `q3-schedule-collapsed.png`       | Q3「定期実行」解除後の収納                        | 「定期実行」再クリック後            |
| `apply-summary-card-defaults.png` | ApplySummaryCard 表示状態（未回答あり）           | ウィザード進行・SmartDefault 表示時 |
| `smart-defaults-applied.png`      | SmartDefault 初期反映済みの ConversationRoundStep | Step 1 初期表示                     |
| `keyboard-focus-button.png`       | キーボードフォーカス時のボタン表示                | Tab キーでフォーカスを当てた状態    |
| `devtools-audit.md`               | DevTools コンソール（エラーなし確認）             | シナリオ完了後                      |

## 保存先

`docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-11/screenshots/`
