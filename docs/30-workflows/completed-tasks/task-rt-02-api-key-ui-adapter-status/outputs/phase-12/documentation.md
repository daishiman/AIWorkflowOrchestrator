# Phase 12: Documentation

## 実装ガイド要約

- provider 一覧は `apiKey.list()` で取得する
- 登録済み provider に対してだけ `llm.checkHealth(providerId)` を走らせる
- `ApiKeysSection` の局所 state で `initializing / ready / failed` を保持する
- failed 行にだけ `RetryButton` を出し、該当 provider のみ再確認する

## current fact

- 新規 public IPC 追加: なし
- 新規 shared 型追加: なし
- global store 拡張: なし
- UI 追加: `AdapterStatusBadge`, `RetryButton`
- 主実装箇所: `ApiKeysSection`

## 残課題

- Phase 11 手動証跡が未取得
- same-wave sync は workflow outputs までで止まっており、system spec / LOGS / topic-map までは未反映
- 自動テストは `esbuild` 環境不整合で未実行
