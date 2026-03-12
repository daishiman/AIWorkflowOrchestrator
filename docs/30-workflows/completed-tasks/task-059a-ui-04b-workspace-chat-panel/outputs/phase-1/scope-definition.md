# Phase 1 スコープ定義

## 含む

- `apps/desktop/src/renderer/views/WorkspaceView/` 配下の chat panel 実装
- mention / stream / conversation 連携
- WorkspaceView 統合テスト補強
- Phase 11 screenshot script と証跡
- aiworkflow-requirements 正本仕様の同期

## 含まない

- 新規 LLM provider 実装
- Main IPC プロトコルの追加（既存 `llm:*`, `conversation:*`, `file:*` の再利用のみ）
- 04C（preview強化）の機能追加
- コミット / PR 作成

## 並列実行方針

- A: UI component 実装
- B: hook / stream / state 境界
- C: test 拡充
- D: 仕様同期・成果物整備
