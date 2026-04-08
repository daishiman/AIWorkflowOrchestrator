# Phase 11: 手動テストチェックリスト

## 対象

- `phase-11-manual-test.md` で定義した NON_VISUAL 手動確認

## チェック項目

- [ ] `inferSmartDefaults` が `Slack` / `GitHub` / `Notion` から tool を推論する
- [ ] `inferSmartDefaults` が定期実行キーワードから `scheduled` を返す
- [ ] `inferSmartDefaults` がリアルタイムキーワードから `realtime` を返す
- [ ] `category = code-support` で `format = code` になる
- [ ] 推論不能時に `null` と空の `inferenceLog` を返す
- [ ] `purpose` が空白のみでも空文字として扱われ、category 推論は独立継続する
- [ ] W2-seq-03a が存在する場合のみ統合 UI 動作を確認する

## 証跡メモ

- REPL / CLI の出力をそのまま記録する
- スクリーンショットは不要
