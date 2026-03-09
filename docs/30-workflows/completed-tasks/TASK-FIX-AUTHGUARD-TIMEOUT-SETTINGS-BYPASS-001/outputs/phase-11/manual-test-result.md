# Phase 11: 手動テスト結果

## タスク情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| タスクID | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase    | 11                                             |
| 実施日   | 2026-03-10                                     |
| 実施者   | Codex                                          |
| 判定     | PASS                                           |

## 検証方式

| 項目             | 内容                                                              |
| ---------------- | ----------------------------------------------------------------- |
| 実画面検証       | Playwright で 4 スクリーンショット取得                            |
| ハーネス route   | `/phase11-authguard-timeout.html`                                 |
| capture script   | `apps/desktop/scripts/capture-task-authguard-timeout-phase11.mjs` |
| capture metadata | `outputs/phase-11/screenshots/phase11-capture-metadata.json`      |
| 補助テスト       | 6 files / 110 tests PASS                                          |

## 補助テスト実行結果

```text
Test Files  6 passed (6)
     Tests  110 passed (110)
```

| テストファイル                           | テスト数 | 主な確認点                                           |
| ---------------------------------------- | -------- | ---------------------------------------------------- |
| `AccountSection.test.tsx`                | 55       | 未認証時ログイン CTA、認証済み表示、連携プロバイダー |
| `AuthGuard.test.tsx`                     | 14       | timed-out / retry / settings 遷移 / 通常認証         |
| `useAuthState.test.ts`                   | 10       | 10秒 timeout / retry 後の再 timeout                  |
| `getAuthState.test.ts`                   | 16       | `"timed-out"` 判定                                   |
| `AuthTimeoutFallback.test.tsx`           | 11       | `role="alert"` / 2 ボタン / ARIA                     |
| `shouldResetUnauthenticatedView.test.ts` | 4        | `settings` 除外、保護ビュー reset                    |

## スクリーンショット証跡

| TC       | 取得時刻 (UTC)           | 証跡                                                      | 確認結果                                                                                                    |
| -------- | ------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| TC-11-01 | 2026-03-09T15:36:18.351Z | `screenshots/TC-11-01-timeout-fallback-light.png`         | ライトテーマで警告アイコン、見出し、説明文、`リトライ`、`設定画面へ` を確認                                 |
| TC-11-02 | 2026-03-09T15:36:28.979Z | `screenshots/TC-11-02-timeout-fallback-dark.png`          | ダークテーマで同一 UI が崩れず表示されることを確認                                                          |
| TC-11-03 | 2026-03-09T15:36:39.943Z | `screenshots/TC-11-03-timeout-to-settings.png`            | timeout fallback から Settings 公開シェルへ到達することを確認                                               |
| TC-11-04 | 2026-03-09T15:36:40.494Z | `screenshots/TC-11-04-settings-shell-unauthenticated.png` | 未認証状態でも Settings 公開シェルが維持され、アカウント/認証方式/APIキー/テーマ/RAG が表示されることを確認 |

## テストケース別判定

| TC       | 確認点                                          | 判定 | 根拠                                                                                 |
| -------- | ----------------------------------------------- | ---- | ------------------------------------------------------------------------------------ |
| TC-11-01 | 10秒経過後に `AuthTimeoutFallback` が表示される | PASS | ライトテーマ screenshot + `useAuthState` / `AuthGuard` テスト                        |
| TC-11-02 | ダークテーマでもフォールバック UI が視認できる  | PASS | ダークテーマ screenshot                                                              |
| TC-11-03 | フォールバックから Settings へ遷移できる        | PASS | screenshot + `setCurrentView("settings")` テスト                                     |
| TC-11-04 | 未認証でも Settings 公開シェルが reset されない | PASS | screenshot + `shouldResetUnauthenticatedView` テスト + `AccountSection` 未認証テスト |

## 実装との整合確認

| 観点                  | 確認内容                                                                | 結果 |
| --------------------- | ----------------------------------------------------------------------- | ---- |
| timeout 表示          | `AuthGuard` が `timed-out` で `AuthTimeoutFallback` を返す              | PASS |
| Settings bypass       | `currentView === "settings"` は AuthGuard 外レンダリング                | PASS |
| reset 除外            | `shouldResetUnauthenticatedView()` が `settings` を公開ビューとして除外 | PASS |
| 未認証 AccountSection | Settings 内 `AccountSection` がログイン導線表示へ degrade する          | PASS |

## 目視確認メモ

- `TC-11-01` と `TC-11-02` で、フォールバック UI のレイアウト崩れは確認されなかった。
- `TC-11-03` と `TC-11-04` で、公開シェルとしての Settings 到達性は維持されていた。
- live VoiceOver 実機確認は CLI 環境では未実施。代わりに `role="alert"`、ARIA ラベル、ボタン順序を対象テストで確認した。

## 補助検証

| 観点               | 根拠                           |
| ------------------ | ------------------------------ |
| ARIA / alert       | `AuthTimeoutFallback.test.tsx` |
| キーボード操作     | `AuthTimeoutFallback.test.tsx` |
| 未認証ログイン導線 | `AccountSection.test.tsx`      |

## 総合判定

AuthGuard タイムアウトフォールバック、Settings bypass、未認証 reset 除外は、実画面 4 件と対象テスト 110 件の両方で整合した。Phase 11 の判定は PASS。
