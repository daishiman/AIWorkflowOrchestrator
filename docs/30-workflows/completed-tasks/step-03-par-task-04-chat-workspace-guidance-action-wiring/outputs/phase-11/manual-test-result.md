# Phase 11: 手動テスト結果

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 11                                                 |
| 実行日   | 2026-03-22                                         |
| 実行方式 | current-renderer-entry + Playwright screenshot     |

## テスト結果

| テストケース | 観点                                           | 結果 | 証跡                                                                          | 備考                             |
| ------------ | ---------------------------------------------- | ---- | ----------------------------------------------------------------------------- | -------------------------------- |
| TC-11-01     | Chat blocked banner / message / primary CTA    | PASS | `outputs/phase-11/screenshots/TC-11-01-chat-blocked-light.png`                | capture: 2026-03-22 09:09:33 JST |
| TC-11-02     | primary CTA -> Settings 1クリック遷移          | PASS | `outputs/phase-11/screenshots/TC-11-02-settings-after-guidance-cta-light.png` | capture: 2026-03-22 09:09:34 JST |
| TC-11-03     | provider / model 選択済みで banner 非表示      | PASS | `outputs/phase-11/screenshots/TC-11-03-chat-ready-light.png`                  | capture: 2026-03-22 09:09:35 JST |
| TC-11-04     | Workspace GuidanceBlock / message / CTA 一貫性 | PASS | `outputs/phase-11/screenshots/TC-11-04-workspace-blocked-light.png`           | capture: 2026-03-22 09:09:36 JST |

## 仕様照合サマリー

| 確認項目                                    | 結果 |
| ------------------------------------------- | ---- |
| Chat / Workspace の guidance message 一貫性 | PASS |
| primary CTA の settings wiring              | PASS |
| ready 状態での banner 非表示                | PASS |
| screenshot metadata と PNG 実体の一致       | PASS |

## 視覚検証メモ

- ChatView blocked banner はオレンジ系 warning style で、文言と CTA が 1行内に収まっている
- Settings 遷移後は `設定` 見出しが表示され、アカウント card が描画されている
- ready 状態では banner が消え、送信 UI が active のまま残る
- Workspace GuidanceBlock は中央寄せ card として描画され、Chat 側と同じ解決導線を持つ

## 補足

- screenshot は `phase11-capture-metadata.json` の records と 1:1 で対応している
- secondary CTA (`openTerminal`) と `retryConnection` は current implementation に handler がないため manual scope から除外し、Phase 12 で未タスク化した
