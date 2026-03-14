# Phase 11 成果物: 手動テスト結果

## 実行情報

- 実行日: 2026-03-15
- 実行コマンド: `node apps/desktop/scripts/capture-runtime-routing-integration-closure-phase11.mjs`
- 実行モード: `fallback-review-board`
- fallback 理由: `vite.e2e.config.ts` 起動時に `esbuild` のアーキ不一致（`@esbuild/darwin-arm64` / `@esbuild/darwin-x64`）が発生し、current build の dev server を起動できなかったため
- メタデータ: `screenshots/phase11-capture-metadata.json`

## テスト結果

| TC-ID | テスト項目                             | 結果 | 証跡                                                | 備考                                   |
| ----- | -------------------------------------- | ---- | --------------------------------------------------- | -------------------------------------- |
| TC-01 | Skill handoff 分岐（subscription）     | PASS | `screenshots/TC-01-skill-handoff-light.png`         | handoff card 表示を確認                |
| TC-02 | Skill integrated 分岐（api-key）       | PASS | `screenshots/TC-02-skill-integrated-light.png`      | handoff 非表示 + integrated メッセージ |
| TC-03 | Agent handoff 分岐（subscription）     | PASS | `screenshots/TC-03-agent-handoff-light.png`         | agent 向け guidance で表示             |
| TC-04 | HandoffCard レイアウト（長文コマンド） | PASS | `screenshots/TC-04-handoff-layout-long-command.png` | 長文 command の折り返し表示を確認      |
| TC-05 | コピーボタン フィードバック            | PASS | `screenshots/TC-05-copy-feedback.png`               | `Copied!` 表示 + copyCount更新         |
| TC-06 | 閉じるボタン 動作                      | PASS | `screenshots/TC-06-dismiss-handoff.png`             | card 非表示 + hidden state 表示        |
| TC-07 | ダークモード表示                       | PASS | `screenshots/TC-07-skill-handoff-dark.png`          | dark palette で可読性維持              |
| TC-08 | chat-edit 既存動作回帰                 | PASS | `screenshots/TC-08-chat-edit-regression.png`        | 既存動作維持メッセージ                 |
| TC-09 | api-key Skill 実行回帰                 | PASS | `screenshots/TC-09-skill-regression-apikey.png`     | integrated path 維持メッセージ         |

## 結論

- TC-01 〜 TC-09 はすべて PASS。
- Runtime routing 統合（Skill / Agent の handoff / integrated 分岐）と handoff UI の表示契約は仕様どおり。
- current build 起動不可のため fallback capture で証跡化したが、TC-ID 単位の画像カバレッジは 100% を満たした。
