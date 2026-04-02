# Phase 11: 手動テストチェックリスト

作成日: 2026-04-02

## スクリーンショット方針

GovernanceSummaryPanel は Electron デスクトップアプリの renderer 上のコンポーネントです。
本タスクの Phase 11 実施時点では、アプリをローカルで起動してスクリーンショットを撮影する環境がない（CI 実行コンテキスト）ため、スクリーンショットは N/A として記録します。

**N/A 根拠**: アプリが Electron バイナリのビルドを要求し、現在のコンテキストではビルド・起動が不可。Unit test レベルでの visual 検証（data-testid を通じた DOM 検証）で代替。

## テストケース実施状況

| TC       | 状態 | テーマ             | 実施方法                   | 結果 |
| -------- | ---- | ------------------ | -------------------------- | ---- |
| TC-11-01 | N/A  | default-light      | スクリーンショット撮影不可 | N/A  |
| TC-11-02 | N/A  | default-dark       | スクリーンショット撮影不可 | N/A  |
| TC-11-03 | N/A  | with-denials-light | スクリーンショット撮影不可 | N/A  |
| TC-11-04 | N/A  | with-denials-dark  | スクリーンショット撮影不可 | N/A  |
| TC-11-05 | N/A  | session-summary    | スクリーンショット撮影不可 | N/A  |
| TC-11-06 | N/A  | error-state-light  | スクリーンショット撮影不可 | N/A  |

## 3層評価

### Semantic 評価（コードレビュー代替）

- [x] 表示データが IPC 取得値と一致している（`state.phase`, `state.activePolicy.permissionMode`, `state.recentDenials`, `state.recentAuditEvents.length` を直接表示）
- [x] denial reason が正確に表示される（`denial.reason` を表示、`denial.toolName ?? "unknown"` でフォールバック）
- [x] session summary の数値が正確（`state.recentAuditEvents.length` を表示）

### Visual 評価（設計レビュー代替）

- [x] Tailwind CSS の CSS 変数（`var(--text-primary)`, `var(--bg-tertiary)`）でテーマ対応
- [x] 拒否リストは `text-[var(--status-error)]` でエラー色を使用
- [x] overflow 対応: `font-mono` + 固定幅内表示

### AI UX 評価（コードレビュー代替）

- [x] governance 状態がユーザーに直感的に伝わるか → フェーズ・許可モード・イベント数・拒否リストの構造で明確
- [x] 拒否理由の表示がわかりやすいか → toolName + reason の組み合わせ表示

## 画面カバレッジマトリクス

| 対象               | 目標 | 実績 | 理由                               |
| ------------------ | ---- | ---- | ---------------------------------- |
| スクリーンショット | 100% | N/A  | Electron ビルド不可環境            |
| DOM テスト         | 100% | 100% | TC-R-01〜R-12 で全表示状態をカバー |
