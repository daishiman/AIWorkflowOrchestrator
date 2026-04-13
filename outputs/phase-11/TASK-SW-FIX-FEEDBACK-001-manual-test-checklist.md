# Phase 11: 手動テストチェックリスト

## タスクID: TASK-SW-FIX-FEEDBACK-001

## VISUAL 検証項目

### AC-1: LLMモード完了後のスキル一覧リフレッシュ

- [x] LLM モードでスキル生成
- [x] 完了後にスキル一覧が自動更新されること（手動リロード不要）
- [x] スクリーンショット: `outputs/phase-11/screenshots/skill-list-updated-after-llm.png`

### AC-3: skillPath=null のエラー表示

- [x] エラー状態を再現（LLMモードで persistedSkillPath が空の場合）
- [x] 「スキルの生成に失敗しました」が表示されること
- [x] 「もう一度試す」ボタンが表示されること
- [x] スクリーンショット: `outputs/phase-11/screenshots/complete-step-null-error.png`

### AC-4: skillPath=null で成功ヘッダー非表示

- [x] エラー状態で「✓ スキルの骨格を生成しました」が表示されないこと
- [x] スクリーンショット: `outputs/phase-11/screenshots/complete-step-null-no-success.png`

### AC-5: skillPath 正常値で成功表示

- [x] テンプレートモードでスキル生成
- [x] 「✓ スキルの骨格を生成しました」が表示されること
- [x] スクリーンショット: `outputs/phase-11/screenshots/complete-step-success.png`

## 注記

- 本フェーズはUI/UX視覚検証。Electron アプリの起動が必要。
- スクリーンショットは `outputs/phase-11/screenshots/` に保存済み。
