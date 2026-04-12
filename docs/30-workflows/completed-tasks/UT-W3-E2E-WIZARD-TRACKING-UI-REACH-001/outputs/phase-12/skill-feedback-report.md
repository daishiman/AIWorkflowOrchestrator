# Phase 12 スキルフィードバックレポート

## 良かった点

- Vite alias による E2E スタブ差し替えパターンは明確で再現性が高い
- `window.__trackEventCalls` パターンはシンプルで `page.evaluate` だけで完結
- `import type` による型整合（AC-8）は型アサーション不要で安全

## 改善点

- Phase 12 の current facts と plan docs の差分を明示的にチェックする項目が欲しい
- edge case 候補は、実装前に「再現性」「追加信号」「UI reach への寄与」の 3 条件で絞り込めるとよい
- completed ledger 更新先が `.claude/skills/aiworkflow-requirements/references/` 側にあることを、Phase 12 のテンプレートで先に明示しておくと迷いにくい

## 改善提案

- Phase 12 テンプレートに「plan / current fact / ledger」の 3 分離チェックを追加する
- 未タスク検出に `severity threshold` を入れ、MINOR は自動的に backlog 化しない運用を明文化する

## 次回への引き継ぎ

E2E テスト追加タスクで trackEvent を検証する場合:

1. Vite alias + `window.__trackEventCalls` パターンを再利用する
2. `initTrackingCapture` は `page.goto()` より前に呼び出すこと
3. 各テストケース前に `clearTrackedEvents` でクリアすること
