# Phase 11: 手動テストチェックリスト

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## VISUAL 検証項目

### TC-01: Step 0 にラジオボタンが表示されない

- [x] Step 0 に「テンプレートから作成」「LLMで生成」が表示されない
- [x] `generation-mode-selector` が DOM に存在しない
- [x] スクリーンショット: `outputs/phase-11/screenshots/step-0-no-radio.png`

### TC-02: Step 0 の「次へ」で Step 1 へ遷移する

- [x] 「次へ」クリック後に Step 1 が表示される
- [x] Step 2 が直接表示されない
- [x] スクリーンショット: `outputs/phase-11/screenshots/step-1-conversation.png`

### TC-03: Step 1 の Q1〜Q6 が表示される

- [x] Step 1 で Q1〜Q6 のインタビューが表示される
- [x] スキップできない
- [x] スクリーンショット: `outputs/phase-11/screenshots/step-1-questions.png`

### TC-04: Step 2 生成中が表示される

- [x] Step 1 完了後に Step 2 が表示される
- [x] 生成中 UI が表示される
- [x] スクリーンショット: `outputs/phase-11/screenshots/step-2-generating.png`

### TC-05: Step 3 完了が表示される

- [x] Step 3 の完了 UI が表示される
- [x] スクリーンショット: `outputs/phase-11/screenshots/step-3-complete.png`

### TC-06: 旧フラグ残骸ゼロ

- [x] `generationMode` / `hasActivatedLlmMode` の実装コード参照がない
- [x] `GenerationMode` が barrel export されていない
- [x] 静的解析とユニットテストで確認済み

## 注記

- 本フェーズは UI/UX 視覚検証。Electron アプリの起動が必要。
- スクリーンショットは `outputs/phase-11/screenshots/` に保存済み。
