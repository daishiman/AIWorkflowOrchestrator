# Phase 11: manual test result

## 実施概要

- 実施日: 2026-03-06
- 再実施日時: 2026-03-06 14:36:41 JST
- 実施方法: Playwright で `SettingsView` 専用 harness を起動し、Phase 11 の 5 TC を順に再現
- 実施コマンド:

```bash
AUTH_MODE_PHASE11_PORT=5183 node apps/desktop/scripts/capture-auth-mode-contract-alignment-phase11.mjs
```

- 対象画面: `SettingsView`（`/phase11-auth-mode.html`。`/settings` 相当の Renderer 実装を単体固定）
- metadata: `screenshots/phase11-capture-metadata.json`

## 結果

| テストケース | 結果 | 証跡                                            | 補足                                                               |
| ------------ | ---- | ----------------------------------------------- | ------------------------------------------------------------------ |
| TC-11-01     | PASS | `screenshots/TC-11-01-settings-initial.png`     | `subscription` 初期表示、success message 表示                      |
| TC-11-02     | PASS | `screenshots/TC-11-02-api-key-missing.png`      | `api-key` 切替後に `auth-mode/no-api-key` 相当表示                 |
| TC-11-03     | PASS | `screenshots/TC-11-03-subscription-missing.png` | `subscription` 切替後に `auth-mode/no-subscription-token` 相当表示 |
| TC-11-04     | PASS | `screenshots/TC-11-04-mode-changed.png`         | 再読込なしで `changed` event により success state へ更新           |
| TC-11-05     | PASS | `screenshots/TC-11-05-restored-mode.png`        | 再読込後に `api-key` valid state が復元                            |

## 視覚検証

### Apple UI/UX engineer 観点

1. segmented control の選択状態は Apple accent blue に近い `rgb(0, 122, 255)` で、選択 affordance が明確。
2. selector と status card の横幅がともに `1342px` で揃っており、情報ブロックとしての整列感が高い。
3. status card は selector 直下に配置され、mode 切替とフィードバックの視線移動が短い。
4. success state は green surface、error state は amber surface で、状態意味が瞬時に判読できる。

### 視覚判定

- 総合判定: PASS
- blocker: 0 件
- 再撮影確認: 2026-03-06 14:36 JST の 5 枚で selector/status card の整列と state color の一貫性を再確認
- minor polish 候補:
  - 設定画面全体の縦長度は高く、auth-mode card はページ中腹に埋もれやすい
  - ただし本タスクの契約整合を阻害する視覚問題は確認しなかった

## 実行メモ

- App shell 経由の capture は dev/E2E 用 auth 初期化ノイズが大きかったため、同一 `SettingsView` を単体 harness で固定した
- 手動検証対象そのものは `SettingsView` と auth-mode UI であり、対象コンポーネントは本番実装と同一
