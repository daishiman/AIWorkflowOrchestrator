# Phase 11: 手動テストチェックリスト

## テストケース実施状況

| TC-ID    | シナリオ                      | 実施 | PASS/FAIL | 証跡                     |
| -------- | ----------------------------- | ---- | --------- | ------------------------ |
| TC-11-01 | 有効な API key でバナー非表示 | ✅   | ✅ PASS   | screenshots/TC-11-01.png |
| TC-11-02 | API key 未設定でバナー表示    | ✅   | ✅ PASS   | screenshots/TC-11-02.png |
| TC-11-03 | 汎用 failureReason 文言       | ✅   | ✅ PASS   | screenshots/TC-11-03.png |
| TC-11-04 | 任意ボタン導線（設定を開く）  | ✅   | ✅ PASS   | screenshots/TC-11-04.png |
| TC-11-05 | light theme の視認性          | ✅   | ✅ PASS   | screenshots/TC-11-05.png |
| TC-11-06 | dark theme の視認性           | ✅   | ✅ PASS   | screenshots/TC-11-06.png |

## 完了確認

- [x] 全 TC 実施済み（6/6）
- [x] スクリーンショット証跡あり（6/6）
- [x] Blocker なし
- [x] `validate-phase11-screenshot-coverage.js` PASS
