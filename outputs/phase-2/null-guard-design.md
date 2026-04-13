# Phase 2: nullガード設計書

## タスクID: TASK-SW-FIX-FEEDBACK-001

## skillPath の型・値パターン

| 値            | 意味                     | 表示                   |
| ------------- | ------------------------ | ---------------------- |
| `undefined`   | prop未指定（デフォルト） | 成功UI（パス表示なし） |
| `null`        | 生成失敗（明示的失敗）   | エラーUI               |
| `""`          | 空文字（通常到達しない） | 成功UI（パス表示なし） |
| `"/path/..."` | 正常パス                 | 成功UI（パス表示あり） |

## ガード実装位置

React rules of hooks 準拠のため、全 useState/useCallback/useRef 呼び出し後、
`const nextActions = [...]` の直後に配置。

## エラーUI 要素

| 要素           | testid                       | role    | 内容                       |
| -------------- | ---------------------------- | ------- | -------------------------- |
| ルートコンテナ | `complete-step`              | -       | flex flex-col              |
| エラーヘッダー | `complete-step-error-header` | `alert` | スキルの生成に失敗しました |
| リトライボタン | `complete-step-retry-button` | button  | もう一度試す               |
