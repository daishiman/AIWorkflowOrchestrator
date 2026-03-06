# Phase 11: screenshot plan

## 対象

- 画面: `SettingsView`
- 取得方法: `apps/desktop/scripts/capture-auth-mode-contract-alignment-phase11.mjs`
- 保存先: `outputs/phase-11/screenshots/`

## 撮影対象一覧

| テストケース | 状態                    | 証跡名                              | 優先度 | 期待表示                                                           |
| ------------ | ----------------------- | ----------------------------------- | ------ | ------------------------------------------------------------------ |
| TC-11-01     | 初期表示                | `TC-11-01-settings-initial.png`     | A      | `subscription` と success message                                  |
| TC-11-02     | API key 不在            | `TC-11-02-api-key-missing.png`      | A      | `api-key` と `errorCode=auth-mode/no-api-key` 相当                 |
| TC-11-03     | subscription token 不在 | `TC-11-03-subscription-missing.png` | A      | `subscription` と `errorCode=auth-mode/no-subscription-token` 相当 |
| TC-11-04     | 切替直後の表示更新      | `TC-11-04-mode-changed.png`         | A      | 再読込なしで `changed` event が反映された success state            |
| TC-11-05     | restore 後表示          | `TC-11-05-restored-mode.png`        | A      | reload 後も `api-key` valid が維持                                 |

## 実施順

1. 初期 `subscription valid`
2. `api-key` へ切替して missing state
3. `subscription` へ戻して missing state
4. credential 状態変更後に `api-key valid` へ切替
5. reload 後に restore state を再撮影

## 画面品質観点

- mode 選択状態が色と位置で識別できること
- status message が selector 直下で追えること
- error state では code / guidance が追記表示されること
- restore state では再読込後も selected button が変わらないこと
