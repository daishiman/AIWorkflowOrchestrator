# Design Review Gate — TASK-P0-06

## 4 条件評価

| 条件   | 判定 | 根拠                                                                       |
| ------ | ---- | -------------------------------------------------------------------------- |
| 価値性 | PASS | UX 直結。フォーム → チャット刷新でユーザー体験が大幅向上                   |
| 実現性 | PASS | Renderer 集中の変更。既存 IPC 連携・型定義を活用し追加の Main 変更は最小限 |
| 整合性 | PASS | state owner / IPC boundary / preload exposure が contract で分離済み       |
| 運用性 | PASS | Phase 11 evidence + Phase 12 close-out で運用可能性を担保                  |

## ゲート判定: PASS

条件付き事項:

- `multi_select` 型が TASK-RT-05 から未供給のため、本タスクで前提型を追加する（最小限）
- undo は Renderer ローカル操作に限定（Main 側 WorkflowEngine の状態巻き戻しは対象外）

## リスク

| リスク                      | 影響 | 緩和策                                      |
| --------------------------- | ---- | ------------------------------------------- |
| multi_select 型の後方互換   | 中   | TASK-RT-05 完了時に型を統合。union 型で追加 |
| SkillLifecyclePanel 肥大化  | 中   | 会話 UI を独立コンポーネントとして切り出し  |
| undo 時の Main 側状態不整合 | 低   | Renderer ローカルのみの操作に限定           |
