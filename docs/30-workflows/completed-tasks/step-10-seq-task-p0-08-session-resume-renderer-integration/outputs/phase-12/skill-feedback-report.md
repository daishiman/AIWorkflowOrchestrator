# TASK-P0-08 スキルフィードバックレポート

## 改善点

### 1. Engine 側の in-memory session helper 整理

- 現状: `SkillCreatorWorkflowEngine` 自体にも `checkpoints` Map ベースの helper が残っている
- 影響: 実運用は facade + repository に寄った一方、テスト理解コストがまだ高い
- next action: engine の helper を repository adapter 化するか、責務を facade / repository に完全集約する

### 2. Phase 11 screenshot capture の自動化

- 現状: UI task なのに実画像証跡が欠けると close-out の信頼性が下がる
- next action: Electron 起動と capture script 実行を CI か手順書で標準化する

## 改善不要

- public IPC namespace を `skill-creator:*` へ分離した方針
- repository の revision / lease / TTL ガード
