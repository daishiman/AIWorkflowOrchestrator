# Phase 1 成果物: 受け入れ基準

## 機能受け入れ基準

- [x] AC-01 `notificationSlice` が作成され、追加/既読化/削除/全削除/展開状態操作を提供する
- [x] AC-02 `historySearchSlice` が作成され、検索/ページング/リセット/展開状態操作を提供する
- [x] AC-03 2スライスが `AppStore` に統合される
- [x] AC-04 `notifications` が persist `partialize` に含まれる
- [x] AC-05 `ViewType` に `workspace`, `skillCenter`, `historySearch` が追加される
- [x] AC-06 `App.tsx` の `renderView` が拡張され、exhaustive check が存在する
- [x] AC-07 `AppDock` のViewType参照重複が解消され、新規導線が含まれる
- [x] AC-08 `IPC_CHANNELS` に通知/履歴検索チャネルが追加され、allowlistが更新される
- [x] AC-09 `notificationHandlers.ts` と `historySearchHandlers.ts` が登録される
- [x] AC-10 preload側に通知/履歴検索APIが追加される

## 品質受け入れ基準

- [x] QC-01 文字列IPC引数にP42準拠の3段バリデーションがある
- [x] QC-02 新規Storeセレクタは個別セレクタのみ（P31準拠）
- [x] QC-03 `pnpm --filter @repo/desktop exec vitest run ...`（対象6ファイル）で 49/49 PASS
- [x] QC-04 `pnpm --filter @repo/desktop typecheck` がPASS
- [x] QC-05 `pnpm --filter @repo/desktop exec eslint ...`（対象変更ファイル）でエラー0

## フェーズ進行判定

- 判定: **PASS（Phase 2へ進行可）**
- 理由: 実装・型・テスト・lintの実測結果で受け入れ基準を満たした
