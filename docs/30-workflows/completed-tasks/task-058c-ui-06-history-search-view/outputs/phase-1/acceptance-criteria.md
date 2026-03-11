# Phase 1 受入基準

| AC    | 内容                                                                                                                             | 検証方法                             | 主担当     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------- |
| AC-01 | HistorySearchView が統計カード主導の検索画面からタイムライン主導の画面へ再設計される                                             | UI test / screenshot / visual review | SubAgent-B |
| AC-02 | 検索 UI は上部の控えめな検索バーへ集約され、Filter UI と明示検索ボタンが除去される                                               | UI test / manual test                | SubAgent-B |
| AC-03 | チャット、ファイル、スキルの全履歴カードが日付グループ付きタイムラインとアコーディオン詳細表示を提供する                         | UI test / hook test / manual test    | SubAgent-B |
| AC-04 | `historySearchSlice`、IPC、shared types がタイムライン要件と整合し、filter 継承とページング契約が維持される                      | slice test / IPC test / typecheck    | SubAgent-C |
| AC-05 | `IntersectionObserver` による自動追補、ゼロステート、エラー状態、WCAG 2.1 AA 操作が検証可能な形で成立する                        | hook test / a11y test / manual test  | SubAgent-D |
| AC-06 | Phase 12 で `ui-ux-feature-components`、`arch-state-management`、`task-workflow`、`lessons-learned` への同期判断が成果物化される | doc review / validator               | SubAgent-A |

## 判定メモ

- AC-04 は `preload/types.ts` の旧 HistorySearch 契約ドリフト是正も含めて判定する
- AC-05 は screenshot だけでなく keyboard 操作記録も必須とする
