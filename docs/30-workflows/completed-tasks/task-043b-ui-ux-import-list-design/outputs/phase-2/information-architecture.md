# Phase 2 情報設計

## 画面構造

1. ヘッダー
   - 画面名 `スキル管理`
   - 総件数
   - `新規作成`
2. 検索入力
   - 1入力で imported / available を同時絞り込み
3. status region
   - success / error / delete error
4. imported section
   - 見出し
   - 件数
   - card list または inline empty
5. available section
   - 見出し
   - 件数
   - row list または inline empty
6. dialog
   - skill metadata
   - cancel / confirm

## レイアウト原則

- imported を上段に置き、所有済み資産を先に確認させる
- available は追加導線として下段へ分離し、行 CTA を右端へ固定する
- success / error は検索入力の直下へ出し、状態変化の発生場所を近づける
- mobile では row を縦積みにして CTA を 44px 以上で維持する
