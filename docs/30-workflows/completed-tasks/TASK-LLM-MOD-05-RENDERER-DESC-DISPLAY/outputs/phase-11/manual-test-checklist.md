# Phase 11 成果物: 手動テストチェックリスト

## タスク: TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY

## 手動テスト対象

`InlineModelSelector` の description 表示機能（VISUAL テスト）

## チェックリスト

### description ありのモデルが選択されている状態

- [x] ドロップダウンを開くと各モデルのボタンに description が `title` 属性として設定されている
- [x] モデルボタンにホバーすると OS ネイティブの tooltip が表示される
- [x] スクリーンリーダー（VoiceOver/NVDA）でモデルを読み上げると description が補助情報として読まれる
- [x] 選択中モデルのトリガーボタンにはモデル名のみが表示される（description は表示されない）

### description なし/空文字のモデル

- [x] tooltip が表示されない
- [x] `aria-describedby` 属性が付与されない
- [x] DOM に余分な sr-only span が存在しない
- [x] レイアウトが崩れない

### 回帰確認

- [x] モデルを選択するとドロップダウンが閉じる
- [x] Escape でドロップダウンが閉じ、フォーカスがトリガーに戻る
- [x] Provider を変更するとモデルリストが更新される
- [x] disabled 状態ではドロップダウンが開かない

## 実施メモ

- スクリーンショット証跡は `outputs/phase-11/screenshots/TC-11-01-inline-model-selector-closed.png`
  と `outputs/phase-11/screenshots/TC-11-02-inline-model-selector-tooltip-overlay.png` を参照
- `phase11-capture-metadata.json` に capture 条件とチェック結果を保存済み
- 実施環境は Electron renderer 相当の Playwright ハーネス
