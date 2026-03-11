# Phase 2 Preview セキュリティ設計

## HTML / Markdown 防御

| 項目           | 設計                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| sanitize       | `sanitize.ts` の DOMPurify 設定で `script`, `iframe`, `object`, `on*` 属性、危険 URL を除去                                                  |
| iframe sandbox | `allow-same-origin` のみ許可                                                                                                                 |
| CSP            | `default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; script-src 'none'; object-src 'none'; frame-src 'none'` |
| referrer       | `no-referrer`                                                                                                                                |

## `file:read` 防御

| 項目        | 設計                                             |
| ----------- | ------------------------------------------------ |
| invoke path | 既存 `window.electronAPI.file.read()` のみを使用 |
| timeout     | 5 秒で reject                                    |
| retry       | 1 秒間隔で最大 3 回                              |
| surfacing   | status bar / preview alert に error を表示       |

## watch 防御

- `useFileWatcher` は同一 path の二重登録を guard する
- cleanup 時に `watchStop()` を呼び、`debounceTimer` を clear する

## 失敗時 UX

- read failure: `role="alert"` + `再読み込み` ボタン
- structured parse failure: alert banner を出しつつ SourceView へ fallback
- render crash: `PreviewErrorBoundary` が reset 導線を出す
