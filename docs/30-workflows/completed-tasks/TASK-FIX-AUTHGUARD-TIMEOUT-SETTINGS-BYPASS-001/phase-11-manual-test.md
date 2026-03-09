# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 11                                             |
| Phase名    | 手動テスト                                     |
| カテゴリ   | fix                                            |
| ステータス | completed                                      |
| 前提Phase  | Phase 10                                       |
| 後続Phase  | Phase 12                                       |

## 目的

AuthGuard タイムアウトフォールバックと Settings 公開シェルが、実画面証跡と補助テストの両方で仕様どおりに動作することを確認する。

## 実行タスク

- タスク1: タイムアウト発動後の `AuthTimeoutFallback` UI をライト/ダークで検証する
- タスク2: フォールバックから Settings へ到達できることを検証する
- タスク3: 未認証でも Settings 公開シェルが維持されることを検証する
- タスク4: `shouldResetUnauthenticatedView` により保護ビューのみ reset されることを検証する
- タスク5: アクセシビリティ属性とキーボード操作を補助テストで検証する

## スクリーンショット取得ハーネス

| 項目                 | 内容                                                              |
| -------------------- | ----------------------------------------------------------------- |
| route                | `/phase11-authguard-timeout.html`                                 |
| entry                | `apps/desktop/src/renderer/phase11-authguard-timeout.tsx`         |
| HTML                 | `apps/desktop/src/renderer/phase11-authguard-timeout.html`        |
| capture script       | `apps/desktop/scripts/capture-task-authguard-timeout-phase11.mjs` |
| viewport             | 1440 x 1600                                                       |
| 再利用コンポーネント | `AuthGuard`, `AuthTimeoutFallback`, `SettingsView`                |
| モック境界           | `window.electronAPI`, store 初期 state, theme state               |

## テストケース

| テストケース | 対応タスク | 種別       | 主な確認点                                                         |
| ------------ | ---------- | ---------- | ------------------------------------------------------------------ |
| TC-11-01     | タスク1    | SCREENSHOT | ライトテーマで 10 秒経過後に `AuthTimeoutFallback` が表示される    |
| TC-11-02     | タスク1    | SCREENSHOT | ダークテーマで `AuthTimeoutFallback` の文言と 2 ボタンが視認できる |
| TC-11-03     | タスク2    | SCREENSHOT | フォールバックから Settings 公開シェルへ遷移できる                 |
| TC-11-04     | タスク3-4  | SCREENSHOT | 未認証状態でも Settings 公開シェルが reset されず維持される        |

## 画面カバレッジマトリクス

| 画面/状態                      | テストケース | 証跡                                                                       | 備考                         |
| ------------------------------ | ------------ | -------------------------------------------------------------------------- | ---------------------------- |
| AuthTimeoutFallback (light)    | TC-11-01     | `outputs/phase-11/screenshots/TC-11-01-timeout-fallback-light.png`         | ライトテーマ                 |
| AuthTimeoutFallback (dark)     | TC-11-02     | `outputs/phase-11/screenshots/TC-11-02-timeout-fallback-dark.png`          | ダークテーマ                 |
| timeout -> Settings            | TC-11-03     | `outputs/phase-11/screenshots/TC-11-03-timeout-to-settings.png`            | timeout から公開シェルへ遷移 |
| unauthenticated Settings shell | TC-11-04     | `outputs/phase-11/screenshots/TC-11-04-settings-shell-unauthenticated.png` | reset 除外確認               |

## 実施結果の要約

| 項目             | 結果                                                         |
| ---------------- | ------------------------------------------------------------ |
| SCREENSHOT 証跡  | 4件取得完了                                                  |
| capture metadata | `outputs/phase-11/screenshots/phase11-capture-metadata.json` |
| screenshot plan  | `outputs/phase-11/screenshot-plan.json`                      |
| 補助テスト       | 6 files / 110 tests PASS                                     |
| 判定             | PASS                                                         |

## 補助検証

- `AuthTimeoutFallback.test.tsx` で `role="alert"`、ARIA ラベル、ボタン操作を確認
- `AccountSection.test.tsx` で未認証時ログイン CTA を確認

## 統合テスト連携

- Phase 11 で確認した `settings` reset 除外は `shouldResetUnauthenticatedView.test.ts` に固定
- 未認証 Settings 公開シェルの成立条件は `AccountSection.test.tsx` と `AuthGuard.test.tsx` に反映
- 追加の画面回帰が必要になった場合は `capture-task-authguard-timeout-phase11.mjs` を再実行する

## 参照資料

| 参照資料                 | パス                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md`                      |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-5-implementation.md`              |
| Phase 6 テスト拡充       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-6-test-expansion.md`              |
| Phase 7 カバレッジ確認   | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-7-coverage-check.md`              |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-8-refactoring.md`                 |
| Phase 9 品質検証         | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-9-quality-assurance.md`           |
| Phase 10 最終レビュー    | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-10-final-review.md`               |
| Phase 11 結果            | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/outputs/phase-11/manual-test-result.md` |
| screenshot 手順          | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`                               |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                              | 内容                                            |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| 認証セキュリティ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | timed-out / Settings bypass / reset 除外契約    |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | `shouldResetUnauthenticatedView` 相当の状態契約 |
| ナビゲーション UI仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | `settings` 導線と公開シェル到達性               |
| UI 機能仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | `AuthTimeoutFallback` UI 収録対象               |

## 成果物

| 成果物             | パス                                     |
| ------------------ | ---------------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` |
| スクリーンショット | `outputs/phase-11/screenshots/`          |
| screenshot plan    | `outputs/phase-11/screenshot-plan.json`  |

## 完了条件

- [x] `AuthTimeoutFallback` のライト/ダーク証跡が取得されていること
- [x] timeout から Settings 公開シェルへの遷移証跡があること
- [x] 未認証 Settings 公開シェル維持の証跡があること
- [x] `shouldResetUnauthenticatedView` の補助テストが PASS していること
- [x] `AccountSection` 未認証表示を含む補助テストが PASS していること
- [x] `outputs/phase-11/manual-test-result.md` が実績ベースへ更新されていること

## 次Phase

Phase 12: ドキュメントへ進み、system spec と workflow 成果物を実績ベースへ同期する。
