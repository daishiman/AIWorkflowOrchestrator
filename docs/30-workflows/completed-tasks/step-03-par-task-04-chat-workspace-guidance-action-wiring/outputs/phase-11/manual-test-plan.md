# Phase 11: 手動テスト計画

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 11                                                 |
| 作成日   | 2026-03-22                                         |
| 実行方式 | current-renderer-entry + Playwright screenshot     |

## 1. capture 条件

| 項目           | 値                                                                                    |
| -------------- | ------------------------------------------------------------------------------------- |
| baseUrl        | `http://127.0.0.1:4191`                                                               |
| route          | `/?skipAuth=true`                                                                     |
| theme          | `light`                                                                               |
| viewport       | `1440x960`                                                                            |
| capture script | `apps/desktop/scripts/capture-task-chat-workspace-guidance-action-wiring-phase11.mjs` |
| metadata       | `outputs/phase-11/screenshots/phase11-capture-metadata.json`                          |

## 2. walkthrough シナリオ

### TC-11-01: Chat blocked

1. persisted store に provider / model 未設定状態を注入する
2. ChatView を表示する
3. blocked banner の message と primary CTA を確認する

期待結果:

- banner が表示される
- 文言が `AIモデルが選択されていません。設定画面でモデルを選択してください。` と一致する
- CTA ラベルが `設定を見る` である

### TC-11-02: Settings after CTA

1. TC-11-01 の状態から primary CTA をクリックする
2. `settings-view` が描画されるまで待機する
3. Settings 画面の表示を screenshot 取得する

期待結果:

- 1クリックで Settings へ遷移する
- `設定` 見出しとアカウント card が表示される

### TC-11-03: Chat ready

1. persisted store に provider / model 選択済み状態を注入する
2. ChatView を表示する
3. blocked banner が DOM に存在しないことを確認する

期待結果:

- banner が非表示
- 送信 UI が ready 状態で描画される

### TC-11-04: Workspace blocked

1. currentView=`workspace`、provider / model 未設定状態を注入する
2. WorkspaceView を表示する
3. GuidanceBlock の message と primary CTA を確認する

期待結果:

- Workspace GuidanceBlock が表示される
- ChatView と同一 message / CTA ラベルである
- CTA が settings 遷移 handler に配線されている

## 3. fallback 方針

今回は dedicated capture script が成功したため fallback は未使用。

| 方法                  | 判定 |
| --------------------- | ---- |
| Playwright screenshot | 使用 |
| DevTools 手動撮影     | 不要 |
| DOM dump のみで代替   | 不要 |

## 4. 生成証跡

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/screenshot-coverage.md`
- `outputs/phase-11/screenshots/*.png`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`
