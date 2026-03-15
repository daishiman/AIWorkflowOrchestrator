# Phase 11 成果物: スクリーンショット計画

## 目的

Runtime routing 統合（Skill / Agent / Handoff UI）の手動テスト証跡を TC-ID 単位で保存する。

## 実行コマンド

```bash
node apps/desktop/scripts/capture-runtime-routing-integration-closure-phase11.mjs
```

## capture モード

1. 第一候補: Vite dev + harness（`/phase11-runtime-routing-integration-closure.html`）
2. フォールバック: review-board static capture（`esbuild` 不整合時）

## 撮影対象

| TC-ID | route / variant                                 | 出力ファイル                                        |
| ----- | ----------------------------------------------- | --------------------------------------------------- |
| TC-01 | `variant=tc01-skill-handoff&theme=light`        | `screenshots/TC-01-skill-handoff-light.png`         |
| TC-02 | `variant=tc02-skill-integrated&theme=light`     | `screenshots/TC-02-skill-integrated-light.png`      |
| TC-03 | `variant=tc03-agent-handoff&theme=light`        | `screenshots/TC-03-agent-handoff-light.png`         |
| TC-04 | `variant=tc04-layout&theme=light`               | `screenshots/TC-04-handoff-layout-long-command.png` |
| TC-05 | `variant=tc05-copy-feedback&theme=light`        | `screenshots/TC-05-copy-feedback.png`               |
| TC-06 | `variant=tc06-dismiss&theme=light`              | `screenshots/TC-06-dismiss-handoff.png`             |
| TC-07 | `variant=tc07-dark-mode&theme=dark`             | `screenshots/TC-07-skill-handoff-dark.png`          |
| TC-08 | `variant=tc08-chat-edit-regression&theme=light` | `screenshots/TC-08-chat-edit-regression.png`        |
| TC-09 | `variant=tc09-skill-regression&theme=light`     | `screenshots/TC-09-skill-regression-apikey.png`     |

## 付帯成果物

- `screenshot-plan.json`
- `screenshots/phase11-capture-metadata.json`
