# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 11                              |
| Phase名    | 手動テスト                      |
| カテゴリ   | fix                             |
| ステータス | completed                       |
| 前提Phase  | Phase 10                        |
| 後続Phase  | Phase 12                        |

## 目的

`safeInvoke` タイムアウト追加が、認証ハング時の実UI面で正しく復旧導線を提供し、Settings 公開シェルまで到達できることを current workflow 配下の実スクリーンショットで確認する。

## 実行タスク

- タスク1: safeInvoke timeout の影響面として `AuthTimeoutFallback` をライト/ダークで検証する
- タスク2: timeout fallback から Settings 公開シェルへ遷移できることを検証する
- タスク3: 未認証 Settings 公開シェルが reset されず維持されることを検証する
- タスク4: 補助テストと screenshot validator を併用して証跡整合を固定する

## スクリーンショット取得ハーネス

| 項目                 | 内容                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| route                | `/phase11-authguard-timeout.html`                                                                                      |
| entry                | `apps/desktop/src/renderer/phase11-authguard-timeout.tsx`                                                              |
| HTML                 | `apps/desktop/src/renderer/phase11-authguard-timeout.html`                                                             |
| capture script       | `apps/desktop/scripts/capture-task-fix-safeinvoke-timeout-phase11.mjs`                                                 |
| viewport             | 1440 x 1600                                                                                                            |
| 再利用コンポーネント | `AuthGuard`, `AuthTimeoutFallback`, `SettingsView`                                                                     |
| モック境界           | `window.electronAPI`, auth/profile store 初期 state, theme state                                                       |
| 採用理由             | 本タスクは Preload 改修で UI コンポーネント自体は増やしていないため、影響面の代表UIを dedicated harness で安定撮影する |

## テストケース

| テストケース | 対応タスク | 種別       | 主な確認点                                                          |
| ------------ | ---------- | ---------- | ------------------------------------------------------------------- |
| TC-11-01     | タスク1    | SCREENSHOT | ライトテーマで timeout fallback の見出し・説明・2ボタンが表示される |
| TC-11-02     | タスク1    | SCREENSHOT | ダークテーマでも timeout fallback のコントラストと文言が崩れない    |
| TC-11-03     | タスク2    | SCREENSHOT | `設定画面へ` 導線で Settings 公開シェルへ到達できる                 |
| TC-11-04     | タスク3    | SCREENSHOT | 未認証でも Settings 公開シェルが reset されず維持される             |

## 画面カバレッジマトリクス

| 画面/状態                          | テストケース | 証跡                                                                                  | 備考             |
| ---------------------------------- | ------------ | ------------------------------------------------------------------------------------- | ---------------- |
| safeInvoke timeout fallback light  | TC-11-01     | `outputs/phase-11/screenshots/TC-11-01-safeinvoke-timeout-fallback-light.png`         | ライトテーマ     |
| safeInvoke timeout fallback dark   | TC-11-02     | `outputs/phase-11/screenshots/TC-11-02-safeinvoke-timeout-fallback-dark.png`          | ダークテーマ     |
| timeout fallback -> Settings shell | TC-11-03     | `outputs/phase-11/screenshots/TC-11-03-safeinvoke-timeout-to-settings.png`            | timeout 復旧導線 |
| unauthenticated Settings shell     | TC-11-04     | `outputs/phase-11/screenshots/TC-11-04-safeinvoke-settings-shell-unauthenticated.png` | reset 除外確認   |

## 実施結果の要約

| 項目             | 結果                                                         |
| ---------------- | ------------------------------------------------------------ |
| SCREENSHOT 証跡  | 4件取得完了                                                  |
| capture metadata | `outputs/phase-11/screenshots/phase11-capture-metadata.json` |
| screenshot plan  | `outputs/phase-11/screenshot-plan.json`                      |
| 補助テスト       | preload 1 file / 15 tests PASS、screenshot coverage PASS     |
| 判定             | PASS                                                         |

## 補助検証

- `src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts` で timeout・reject・timer cleanup を確認
- `validate-phase11-screenshot-coverage.js` で `TC ↔ png` 紐付けを機械検証
- `view_image` による目視で timeout fallback / Settings shell の内容一致を確認

## 統合テスト連携

- 本タスクの UI 影響面は `AuthTimeoutFallback` / Settings 公開シェルで代表確認する
- Preload 実装差分自体の回帰は Phase 9/11 の Vitest で担保し、UI は representative screenshot で補完する
- 追加の UI 影響面が発見された場合は current workflow 配下へ証跡を追加取得する

## 参照資料

| 参照資料                 | パス                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md`                      |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-5-implementation.md`              |
| Phase 6 テスト拡充       | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-6-test-expansion.md`              |
| Phase 7 カバレッジ確認   | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-7-coverage-check.md`              |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-8-refactoring.md`                 |
| Phase 9 品質検証         | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-9-quality-assurance.md`           |
| Phase 10 最終レビュー    | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-10-final-review.md`               |
| Phase 11 結果            | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/outputs/phase-11/manual-test-result.md` |
| screenshot 手順          | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`                |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                              | 内容                                 |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| 認証セキュリティ設計      | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | timeout fallback の UI 影響面        |
| 状態管理アーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | `isLoading` 終了条件と公開シェル維持 |
| ナビゲーション UI仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | timeout から Settings への導線       |
| Electron IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | safeInvoke timeout と cleanup 契約   |

## 成果物

| 成果物             | パス                                     |
| ------------------ | ---------------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` |
| スクリーンショット | `outputs/phase-11/screenshots/`          |
| screenshot plan    | `outputs/phase-11/screenshot-plan.json`  |

## 完了条件

- [x] timeout fallback のライト/ダーク証跡が取得されていること
- [x] timeout から Settings 公開シェルへの遷移証跡があること
- [x] 未認証 Settings 公開シェル維持の証跡があること
- [x] preload timeout テストが PASS していること
- [x] `validate-phase11-screenshot-coverage` が PASS していること
- [x] `outputs/phase-11/manual-test-result.md` が実績ベースへ更新されていること

## 次Phase

Phase 12: ドキュメントへ進み、system spec と workflow 成果物を実績ベースへ同期する。
