# Phase 1 要件定義書

## 要件サマリー

`HistorySearchView` を「履歴検索」ではなく「あなたの記録」として再定義し、検索主導 UI からタイムライン主導 UI へ変更する。検索は補助操作へ下げ、チャット・ファイル・スキルの履歴を日付グループで振り返れることを主目的とする。

## 機能要件

| ID    | 種別       | 要件                                                                                      | 根拠                                   |
| ----- | ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| FR-01 | UI         | 画面タイトルを `あなたの記録` に変更する                                                  | 正本タスク / `master-design.md`        |
| FR-02 | UI         | 検索バーを上部に控えめ配置し、300ms デバウンスで自動検索する                              | 正本タスク 6.2 / 6.7                   |
| FR-03 | UI         | 種別 filter UI と明示的な検索ボタンを廃止する                                             | 正本タスク 6.2                         |
| FR-04 | UI         | 結果一覧を日付グループ付きタイムラインで表示する                                          | 正本タスク 6.3                         |
| FR-05 | UI         | 各カードをアコーディオン展開できるようにする                                              | 正本タスク 6.5                         |
| FR-06 | UI         | `chat` / `file` / `skill` ごとに概要と展開内容を切り分ける                                | 正本タスク 6.5                         |
| FR-07 | UI         | `IntersectionObserver` による自動追補を実装し、`さらに読み込む` ボタンを廃止する          | 正本タスク 6.6                         |
| FR-08 | UI         | 初期ゼロ件、検索結果ゼロ件、エラー状態を個別に表現する                                    | 正本タスク 9                           |
| FR-09 | Navigation | chat 詳細リンクから `/chat/history/:sessionId` に遷移できること                           | 正本タスク 11                          |
| FR-10 | Navigation | file 詳細リンクから editor 相当導線に遷移できること                                       | 正本タスク 11                          |
| FR-11 | State      | `historySearchSlice` は query、結果、ページング、展開状態、エラー、初回取得状態を管理する | Phase 2 設計入力                       |
| FR-12 | State      | 追加読込時に query/filter 契約を維持しつつ重複 append を防ぐ                              | 056c の教訓 / P31系再発防止            |
| FR-13 | Contract   | `history:search` / `history:get-stats` の invoke envelope を維持する                      | `api-ipc-system.md`                    |
| FR-14 | Contract   | shared `HistoryItem` 型は timeline 表示と詳細表示に耐えること                             | `packages/shared/src/types/history.ts` |

## 非機能要件

| ID     | 種別        | 要件                                                                                               |
| ------ | ----------- | -------------------------------------------------------------------------------------------------- |
| NFR-01 | A11y        | 検索 input は accessible name を持ち、アコーディオンは `aria-expanded` と関連領域を持つ            |
| NFR-02 | A11y        | Tab / Enter / Space でカード展開と補助操作が行える                                                 |
| NFR-03 | UX          | desktop/mobile ともに timeline が主役であること。mobile では検索バーと日付ヘッダーが sticky になる |
| NFR-04 | Performance | デバウンス 300ms、observer `threshold: 0.1`、`rootMargin: 0px 0px 200px 0px` を採用する            |
| NFR-05 | Robustness  | invalid timestamp があっても落ちず、`日付不明` グループへ退避できる                                |
| NFR-06 | Testing     | renderer / slice / IPC / hook の各層で自動テストを持つ                                             |

## 現行実装との差分要約

| 項目         | 現行                 | 目標                           |
| ------------ | -------------------- | ------------------------------ |
| タイトル     | `履歴検索`           | `あなたの記録`                 |
| 主役         | 検索フォーム + stats | タイムライン                   |
| 検索開始     | Enter / ボタン       | デバウンス自動検索             |
| フィルタ     | select あり          | 廃止                           |
| 詳細表示     | なし                 | アコーディオン                 |
| 追補         | ボタン               | observer                       |
| ゼロステート | 単一メッセージ       | 初期空 / 検索空 / エラーの分離 |

## 入力成果物

- 現行 UI: `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`
- 現行 slice: `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`
- 現行 handler: `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- 正本タスク実体: `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058c-ui-06-history-search-view.md`

## 次Phaseへの引き継ぎ

- Phase 2 では `preload/types.ts` の旧 `HistorySearch` 契約記述ドリフトも整理対象に含める
- file 導線は editor deep-open まで成立させる実装方針を設計で固定する
