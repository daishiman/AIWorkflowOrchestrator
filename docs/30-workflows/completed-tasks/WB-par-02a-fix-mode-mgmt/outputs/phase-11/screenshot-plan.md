# Phase 11 成果物: スクリーンショット計画

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## スクリーンショット計画

| 画面                             | キャプチャタイミング           | ファイル名                  | 代替確認          |
| -------------------------------- | ------------------------------ | --------------------------- | ----------------- |
| Step 0（ラジオボタンなし）       | 初期表示時                     | `step0-no-radio-button.png` | TC-01/TC-02       |
| Step 0（入力後）                 | スキル名・目的・カテゴリ入力後 | `step0-filled.png`          | TC-03             |
| Step 1（Q1〜Q6インタビュー）     | Step 0→Step 1遷移直後          | `step1-conversation.png`    | TC-03/TC-05       |
| Step 2（LLM生成中）              | isGenerating=true の状態       | `step2-generating.png`      | 既存テスト        |
| Step 3（完了画面）               | 生成完了後                     | `step3-complete.png`        | 既存テスト        |
| ステップインジケーター（各Step） | 各ステップ遷移時               | `step-indicator-stepN.png`  | TC-03/TC-04/TC-05 |

## 実施状況

Playwright current-build capture により、計画した全スクリーンショットを `docs/30-workflows/WB-par-02a-fix-mode-mgmt/outputs/phase-11/screenshots/` に保存済み。
`screenshot-plan.json` / `phase11-capture-metadata.json` も同ディレクトリに保存済み。

## 今後の対応

必要に応じて CI でも同じ capture スクリプトを再実行し、画像鮮度を維持する。
