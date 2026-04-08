# Phase 11: スクリーンショットカバレッジ

## タスクID

UT-SKILL-WIZARD-W1-par-02d

## 判定

- TC-11-01: PASS
- TC-11-02: PASS
- TC-11-03: PASS
- TC-11-04: PASS
- TC-11-05: PASS
- TC-11-06: PASS

## 証跡対応

| TC-ID    | 証跡                                                                        | 状態      | 備考                               |
| -------- | --------------------------------------------------------------------------- | --------- | ---------------------------------- |
| TC-11-01 | outputs/phase-11/screenshots/TC-11-01-skill-lifecycle-hidden-controls.png   | completed | 旧入力・旧ボタンの非表示確認       |
| TC-11-02 | outputs/phase-11/screenshots/TC-11-02-skill-lifecycle-open-wizard.png       | completed | 新セクションと導線ボタンの表示確認 |
| TC-11-03 | outputs/phase-11/screenshots/TC-11-03-skill-lifecycle-open-wizard-click.png | completed | クリック後の overlay 表示確認      |
| TC-11-04 | outputs/phase-11/screenshots/TC-11-04-skill-lifecycle-legacy-preserved.png  | completed | 既存セクションへの影響なし         |
| TC-11-05 | outputs/phase-11/screenshots/TC-11-05-skill-lifecycle-visual-review.png     | completed | dark / hover の視覚確認            |
| TC-11-06 | outputs/phase-11/phase11-capture-metadata.json                              | completed | checklist / plan / coverage の同期 |

## 補足

- 実画面は phase11-task-rt-04-skill-authkey.html ハーネスで取得した。
- クリック後の証跡は phase11-settings-overlay の表示で操作導線を確認した。
- fullPage と viewport capture を使い分けて、同一画面でも観点差分を残した。
