# Phase 6 回帰マトリクス

## Phase 5 時点のマトリクス

| 差分                  | 失敗すると起きる事象                         | 自動テスト                  | 手動テスト   |
| --------------------- | -------------------------------------------- | --------------------------- | ------------ |
| 初回表示条件          | 完了済みユーザーに wizard が再表示される     | `App.onboarding.test.tsx`   | N/A          |
| 名前 fallback         | greeting が `User` のまま残る                | `DashboardView.test.tsx`    | TC-11-01     |
| step 遷移             | bubble / theme 選択後の完了 payload が壊れる | `OnboardingWizard.test.tsx` | TC-11-02〜06 |
| rerun action          | Settings から wizard を開けない              | `SettingsView.test.tsx`     | N/A          |
| mobile step indicator | step indicator が主コンテンツを隠す          | N/A                         | TC-11-05     |

## Phase 6 境界ケース追加分

| 差分                               | 失敗すると起きる事象                          | 自動テスト                  | 備考                            |
| ---------------------------------- | --------------------------------------------- | --------------------------- | ------------------------------- |
| `allowDismiss=false` ガード        | ESC や閉じるボタンで wizard が閉じてしまう    | `OnboardingWizard.test.tsx` | 必須完了フロー保護              |
| 完了ステップでの ESC ガード        | 完了画面で ESC が発火し onClose を呼ぶ        | `OnboardingWizard.test.tsx` | step index 4 判定               |
| `isCompleting` ESC ガード          | 保存中に ESC でモーダルが閉じる               | `OnboardingWizard.test.tsx` | 保存中のデータ整合性保護        |
| 空文字名前の payload               | `userName` が trim されず空文字でない値が入る | `OnboardingWizard.test.tsx` | `draftName.trim()` の動作確認   |
| デフォルトテーマ確認               | 初期テーマが期待外の値になる                  | `OnboardingWizard.test.tsx` | `kanagawa-dragon` デフォルト    |
| Error 以外の reject フォールバック | エラーメッセージが表示されず UI がハングする  | `OnboardingWizard.test.tsx` | `instanceof Error` の else 分岐 |
| Step 3 未選択 disabled             | starter tool 未選択のまま次へ進める           | `OnboardingWizard.test.tsx` | `canGoNext` Step 3 分岐         |
| 完了後ナビゲーション               | 「ホームへ進む」が onClose を呼ばない         | `OnboardingWizard.test.tsx` | 完了ステップのボタン動作        |
