# Phase 11: スクリーンショット撮影計画

## メタ情報

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001                                          |
| Phase      | 11                                                                             |
| 作成日     | 2026-03-18                                                                     |
| 撮影方法   | Playwright + Vite dev server                                                   |
| スクリプト | `apps/desktop/scripts/capture-task-skill-lifecycle-routing-step02-phase11.mjs` |

## 撮影対象と優先度

| TC       | 優先度 | 対象                              | セレクター                                | ファイル名                                      |
| -------- | ------ | --------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| TC-11-01 | 必須   | SkillCenterView ヘッダー CTA 表示 | `[data-testid="header-create-cta"]`       | `TC-11-01-skillcenter-header-cta.png`           |
| TC-11-02 | 必須   | JourneyPanel 3ジョブ CTA 表示     | `[data-testid="skill-lifecycle-journey"]` | `TC-11-02-skillcenter-journey-panel-cta.png`    |
| TC-11-03 | 補助   | CTA クリック後の遷移先            | -                                         | unit test（TC-CTA-03, TC-CTA-12〜14）で代替検証 |

## 撮影環境

| 項目           | 設定値                                   |
| -------------- | ---------------------------------------- |
| ビューポート   | 1440 × 960                               |
| カラースキーム | dark（Playwright `colorScheme: "dark"`） |
| サーバー       | Vite dev server (port: 5195)             |
| ブラウザ       | Chromium headless                        |
| 設定ファイル   | `apps/desktop/vite.e2e.config.ts`        |

## TC-11-03 代替検証の根拠

CLI 環境（P53）および Vite dev server の mock 環境では state 管理制約により、CTA クリック後のルート遷移を実際に追うことができない。
Step01（viewtype-renderView-foundation）と同じパターンを採用:

- 画面到達・UI 表示 = スクリーンショット
- ナビゲーション分岐の保証 = unit test（TC-CTA-03, TC-CTA-12〜14 全 PASS）

## 撮影実行コマンド

```bash
cd /path/to/repo && node apps/desktop/scripts/capture-task-skill-lifecycle-routing-step02-phase11.mjs
```

環境変数でポートを変更する場合:

```bash
SLR_STEP02_SCREENSHOT_PORT=5196 node apps/desktop/scripts/capture-task-skill-lifecycle-routing-step02-phase11.mjs
```
