# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 11                                                 |
| Phase 名   | 手動テスト                                         |
| タスクID   | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| 前提 Phase | Phase 10                                           |
| 後続 Phase | Phase 12（ドキュメント）                           |
| ステータス | completed                                          |
| 作成日     | 2026-03-19                                         |
| 機能名     | chat-workspace-guidance-action-wiring              |

## 目的

ChatView / WorkspaceView の blocked guidance 実配線を dedicated capture script で walkthrough し、settings 遷移・ready 復帰・surface 間一貫性を screenshot evidence として固定する。

## テストケース

| テストケース | 画面 / 観点                    | 前提                                          | 期待結果                                                               |
| ------------ | ------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------- |
| TC-11-01     | ChatView blocked banner        | provider 未選択、model 未選択                 | banner が表示され、message と primary CTA が `設定を見る` で一致する   |
| TC-11-02     | ChatView -> Settings 遷移      | TC-11-01 の banner 表示状態                   | CTA クリック 1回で SettingsView へ遷移する                             |
| TC-11-03     | ChatView ready 復帰            | provider / model を事前注入済み               | blocked banner が非表示で、送信 UI が ready 状態になる                 |
| TC-11-04     | WorkspaceView blocked guidance | workspace 表示、provider 未選択、model 未選択 | GuidanceBlock が表示され、primary CTA が settings 遷移に配線されている |

## 画面カバレッジマトリクス

| テストケース | 画面状態           | 証跡                                                                          |
| ------------ | ------------------ | ----------------------------------------------------------------------------- |
| TC-11-01     | chat blocked       | `outputs/phase-11/screenshots/TC-11-01-chat-blocked-light.png`                |
| TC-11-02     | settings after CTA | `outputs/phase-11/screenshots/TC-11-02-settings-after-guidance-cta-light.png` |
| TC-11-03     | chat ready         | `outputs/phase-11/screenshots/TC-11-03-chat-ready-light.png`                  |
| TC-11-04     | workspace blocked  | `outputs/phase-11/screenshots/TC-11-04-workspace-blocked-light.png`           |

## 実行タスク

### capture 実行

- `pnpm --filter @repo/desktop build`
- `node apps/desktop/scripts/capture-task-chat-workspace-guidance-action-wiring-phase11.mjs`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json` の records と PNG 実体を照合

### 視覚検証

- ChatView blocked banner の文言が shared guidance mapping と一致していること
- primary CTA クリックで `settings` へ到達すること
- ready 状態では banner が消え、送信 UI が復帰していること
- Workspace GuidanceBlock が同一文言 / 同一 CTA ラベルを使うこと

### 残課題整理

- secondary CTA (`openTerminal`) は dispatcher 未接続のため DOM へ出していない
- `retryConnection` は IPC 契約未定義のため walkthrough 対象外
- 上記は Phase 12 で未タスク化し、same-wave sync に流す

## 参照資料

| 参照資料         | パス                                                                                 | 用途                        |
| ---------------- | ------------------------------------------------------------------------------------ | --------------------------- |
| Task index       | docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/index.md | Phase 状態と AC 確認        |
| Phase 10 gate    | outputs/phase-10/final-gate-decision.md                                              | manual walkthrough 開始条件 |
| capture script   | apps/desktop/scripts/capture-task-chat-workspace-guidance-action-wiring-phase11.mjs  | screenshot 取得方法         |
| capture metadata | outputs/phase-11/screenshots/phase11-capture-metadata.json                           | screenshot 実績確認         |

## 成果物

| 成果物                 | パス                                    | 内容                                   |
| ---------------------- | --------------------------------------- | -------------------------------------- |
| 手動テスト計画         | outputs/phase-11/manual-test-plan.md    | capture 条件、手順、fallback 判断      |
| 手動テスト結果         | outputs/phase-11/manual-test-result.md  | TC-11-01〜TC-11-04 の PASS 結果と証跡  |
| スクリーンショット計画 | outputs/phase-11/screenshot-plan.json   | TC-ID × capture 対象 × expected checks |
| 画面カバレッジ         | outputs/phase-11/screenshot-coverage.md | TC と screenshot evidence の対応表     |
| 発見事項               | outputs/phase-11/discovered-issues.md   | visual diff と residual follow-up      |

## 完了条件

- [x] manual-test-plan.md に capture 条件と手順が記録されている
- [x] manual-test-result.md に TC-11-01〜TC-11-04 の結果が記録されている
- [x] screenshot-plan.json に capture 実績が残っている
- [x] screenshot-coverage.md に 4 / 4 coverage が記録されている
- [x] discovered-issues.md に residual follow-up が整理されている
- [x] dedicated capture script により fallback 不要で証跡取得が完了している
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-11/` と一致している
- [x] Phase 10 final-gate-decision が PASS であることを確認済み
- [x] TC-11-01〜TC-11-04 の全実行結果が PASS / FAIL / BLOCKED のいずれかで記録されている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md)
