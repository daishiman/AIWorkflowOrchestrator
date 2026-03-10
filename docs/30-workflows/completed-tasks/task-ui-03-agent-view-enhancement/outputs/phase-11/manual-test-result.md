# Phase 11: 手動テスト結果

## メタ情報

| 項目   | 値                                                                 |
| ------ | ------------------------------------------------------------------ |
| Phase  | 11                                                                 |
| 機能名 | agent-view-enhancement                                             |
| 実施日 | 2026-03-10                                                         |
| 検証者 | Codex SubAgent チーム（UI実装 / テスト / Apple UI/UXレビュー分担） |

## 実施概要

- Phase 11 専用 harness: `apps/desktop/src/renderer/phase11-agent-view.{html,tsx}`
- 撮影コマンド: `PHASE11_CAPTURE_EXTERNAL_SERVER=1 node scripts/capture-agent-view-enhancement-phase11.mjs`
- 外部サーバ起動: `ESBUILD_BINARY_PATH=... node node_modules/vite/bin/vite.js --config vite.e2e.config.ts --port 4173 --strictPort --host 127.0.0.1`
- Apple UI/UX エンジニア観点でレイアウト密度、ヒエラルキー、コントラスト、ダークモード整合を目視確認した

## テストカテゴリ別結果

### 機能テスト

| テストケース | 機能                             | 期待結果                                                 | 結果 | 証跡                                                                                               | 備考                         |
| ------------ | -------------------------------- | -------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| TC-01        | Level 1 メイン画面表示           | 3セクション構成、`AIアシスタント`、`できること` 表示     | PASS | `screenshots/TC-01-main-view-light.png`                                                            | 単一カラム確認               |
| TC-02        | SkillChip 選択                   | 選択リングと `aria-checked=true`                         | PASS | `screenshots/TC-02-chip-selected-light.png`                                                        | 選択状態を harness で固定    |
| TC-03        | ExecuteButton 状態遷移           | 未選択 disabled / 選択後 enabled                         | PASS | `screenshots/TC-03-button-disabled-light.png`, `screenshots/TC-03-button-enabled-light.png`        | 文言切替確認                 |
| TC-04        | FloatingExecutionBar 実行中→完了 | 実行中表示、完了表示、success state                      | PASS | `screenshots/TC-04-floating-executing-light.png`, `screenshots/TC-04-floating-completed-light.png` | 2状態を別撮影                |
| TC-05        | FloatingExecutionBar エラー      | failed state の赤色表示                                  | PASS | `screenshots/TC-05-floating-error-light.png`                                                       | shake は静止画で代表状態確認 |
| TC-06        | AdvancedSettingsPanel 開閉       | パネル内容と dialog 契約が見える                         | PASS | `screenshots/TC-06-panel-open-light.png`                                                           | ESC 閉じ動作も確認           |
| TC-07        | RecentExecutionList 表示         | 最大3件、相対時間、ステータスアイコン                    | PASS | `screenshots/TC-07-recent-list-light.png`                                                          | 専用シナリオで確認           |
| TC-08        | 空状態                           | SkillCenter 導線を表示                                   | PASS | `screenshots/TC-08-empty-state-light.png`                                                          | 空 state 確認                |
| TC-09        | 検索バー境界値                   | 10件以下で非表示、11件以上で表示                         | PASS | `screenshots/TC-09-no-search-light.png`, `screenshots/TC-09-with-search-light.png`                 | 実際に一覧絞り込みも確認     |
| TC-10        | キーボード / IPC 手動確認        | Tab / Enter / Space / Escape と execute/abort 導線を確認 | PASS | NON_VISUAL                                                                                         | validator 例外対象           |
| TC-11        | ダークモード                     | ダークテーマでも視認性とレイアウト維持                   | PASS | `screenshots/TC-11-main-view-dark.png`                                                             | dark は安定                  |

## 統合テスト連携

| テスト項目                                               | 結果 | 課題有無 |
| -------------------------------------------------------- | ---- | -------- |
| IPC `skill:list` モック導線                              | PASS | なし     |
| IPC `skill:execute` モック導線                           | PASS | なし     |
| IPC `skill:abort` モック導線                             | PASS | なし     |
| `recentExecutions` / `isAdvancedSettingsOpen` の状態反映 | PASS | なし     |
| Execute → Floating bar → 完了/失敗の表示切替             | PASS | なし     |

## スクリーンショットエビデンス

| テストケース | 撮影ファイル                                                                                       | 仕様照合結果 | 備考                  |
| ------------ | -------------------------------------------------------------------------------------------------- | ------------ | --------------------- |
| TC-01        | `screenshots/TC-01-main-view-light.png`                                                            | 一致         | main light            |
| TC-02        | `screenshots/TC-02-chip-selected-light.png`                                                        | 一致         | selected              |
| TC-03        | `screenshots/TC-03-button-disabled-light.png`, `screenshots/TC-03-button-enabled-light.png`        | 一致         | disabled / enabled    |
| TC-04        | `screenshots/TC-04-floating-executing-light.png`, `screenshots/TC-04-floating-completed-light.png` | 一致         | executing / completed |
| TC-05        | `screenshots/TC-05-floating-error-light.png`                                                       | 一致         | error                 |
| TC-06        | `screenshots/TC-06-panel-open-light.png`                                                           | 一致         | panel open            |
| TC-07        | `screenshots/TC-07-recent-list-light.png`                                                          | 一致         | recent list           |
| TC-08        | `screenshots/TC-08-empty-state-light.png`                                                          | 一致         | empty state           |
| TC-09        | `screenshots/TC-09-no-search-light.png`, `screenshots/TC-09-with-search-light.png`                 | 一致         | boundary states       |
| TC-10        | NON_VISUAL                                                                                         | 一致         | キーボード / IPC 確認 |
| TC-11        | `screenshots/TC-11-main-view-dark.png`                                                             | 一致         | dark mode             |

## 仕様照合結果サマリー

| 確認項目                | 結果     |
| ----------------------- | -------- |
| レイアウト一致          | PASS     |
| カラーパレット準拠      | PASS     |
| 8pxグリッド準拠         | PASS     |
| ダークモード確認        | PASS     |
| エラー状態UI            | PASS     |
| Apple HIG観点の情報階層 | PASS     |
| WCAG AA観点の重大違反   | FAILなし |

## Apple UI/UXレビュー所見

- light theme の副次テキストはやや薄く見える箇所があり、トークン側の改善余地を `UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001` として切り出した
- ただし AgentView 固有のレイアウト、主要CTA、状態フィードバック、ダークモード整合には重大な問題なし
- 発見事項は `discovered-issues.md` に整理した
