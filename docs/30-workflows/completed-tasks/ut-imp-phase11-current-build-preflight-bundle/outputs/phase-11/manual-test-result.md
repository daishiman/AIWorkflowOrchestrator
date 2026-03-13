# Phase 11 手動テスト結果

## サマリー

- 判定: `PASS with baseline notes`
- 実施日: 2026-03-13 JST
- 備考: 本 workflow 自体は preflight bundle 実装であり UI 差分はないため、same-day upstream evidence を current workflow 配下へ集約して review した。初回再撮影では Playwright browser cache 欠落により `browserType.launch: Executable doesn't exist` が発生し、`pnpm --filter @repo/desktop exec playwright install chromium` 実行後に current workflow 配下へ evidence を再同期した。

## 機能テスト（正常系）

| テストケース | 内容                             | 結果 | 備考                                                        |
| ------------ | -------------------------------- | ---- | ----------------------------------------------------------- |
| TC-MAN-11-01 | build -> preflight -> screenshot | PASS | `preflight-report.json` は 4 bucket pass、`autoServed=true` |

## エラーハンドリングテスト（異常系）

| テストケース | 内容                                    | 結果 | 備考                                             |
| ------------ | --------------------------------------- | ---- | ------------------------------------------------ |
| TC-MAN-11-02 | baseUrl unreachable (`--no-auto-serve`) | PASS | exit 40、retry guidance 表示                     |
| TC-MAN-11-03 | harness missing                         | PASS | exit 30、`electron.vite.config.ts` guidance 表示 |
| TC-MAN-11-04 | build missing                           | PASS | exit 20、build command guidance 表示             |

## screenshot / metadata

| 証跡                                   | 取得時刻                 | 内容                    |
| -------------------------------------- | ------------------------ | ----------------------- |
| `TC-11-01-settings-light.png`          | 2026-03-13T02:21:41.432Z | Settings light          |
| `TC-11-02-dashboard-light.png`         | 2026-03-13T02:21:42.868Z | Dashboard light         |
| `TC-11-03-auth-light.png`              | 2026-03-13T02:21:44.071Z | Auth light              |
| `TC-11-04-workspace-search-light.png`  | 2026-03-13T02:21:45.332Z | WorkspaceSearch light   |
| `TC-11-05-dashboard-dark-baseline.png` | 2026-03-13T02:21:46.684Z | Dashboard dark baseline |

## スクリーンショットエビデンス

| テストケース | 証跡                                               | 内容                    |
| ------------ | -------------------------------------------------- | ----------------------- |
| TC-11-01     | `screenshots/TC-11-01-settings-light.png`          | Settings light          |
| TC-11-02     | `screenshots/TC-11-02-dashboard-light.png`         | Dashboard light         |
| TC-11-03     | `screenshots/TC-11-03-auth-light.png`              | Auth light              |
| TC-11-04     | `screenshots/TC-11-04-workspace-search-light.png`  | WorkspaceSearch light   |
| TC-11-05     | `screenshots/TC-11-05-dashboard-dark-baseline.png` | Dashboard dark baseline |

## Apple UI/UX 視覚レビュー

| 画面                  | 判定                    | hierarchy                        | contrast                                 | spacing / materiality             | 所見                                    |
| --------------------- | ----------------------- | -------------------------------- | ---------------------------------------- | --------------------------------- | --------------------------------------- |
| Settings light        | PASS with baseline note | セクション分割は追える           | 補助文がやや弱い                         | 余白とカード境界は安定            | preflight 変更による新規 regress はなし |
| Dashboard light       | PASS                    | hero と cards の序列が明確       | 本文可読性は十分                         | glass panel と card radius が一貫 | light/dark 比較でも構成崩れなし         |
| Auth light            | PASS with baseline note | CTA とタイトルの主従は明確       | helper text がやや沈む                   | panel 中央配置は安定              | baseline remediation 既知課題の範囲     |
| WorkspaceSearch light | PASS with baseline note | 検索バーと結果列の情報構造は明確 | light 指定でも dark slate surface が残る | リスト密度は許容                  | baseline remediation 既知課題の範囲     |

## 結論

- preflight bundle による UI regress は確認されなかった。
- baseline note は既存 remediation task の範囲であり、current task 起因の新規 issue は 0 件。
