# Phase 11: スクリーンショットカバレッジ

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| Phase    | 11                                   |
| タスクID | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 実行日   | 2026-04-11                           |

---

## カバレッジ

| 指標                   | 結果  |
| ---------------------- | ----- |
| 必須スクリーンショット | 4 / 4 |
| カバレッジ率           | 100%  |

## 証跡マトリクス

| ショット ID | 画面状態                         | 対応 TC                                   | ファイル                           | 判定 |
| ----------- | -------------------------------- | ----------------------------------------- | ---------------------------------- | ---- |
| SS-01       | カテゴリ未選択（初期状態）       | TC-EC-01                                  | `screenshots/ss-01-initial.png`    | PASS |
| SS-02       | 「自動化」カテゴリ選択済み       | TC-EC-02 / TC-A1-02                       | `screenshots/ss-02-automation.png` | PASS |
| SS-03       | ホバー時ツールチップ表示         | TC-TT-01 / TC-TT-02                       | `screenshots/ss-03-tooltip.png`    | PASS |
| SS-04       | 全カテゴリボタン（アイコン確認） | TC-IC-01 / TC-IC-02 / TC-IC-03 / TC-IC-04 | `screenshots/ss-04-all-icons.png`  | PASS |

## 補足

- `SS-03` は native `title` を直接撮影できないため、capture script 内で一時 overlay を注入して保存した
- 4 枚とも current build の実 PNG として保存済み
