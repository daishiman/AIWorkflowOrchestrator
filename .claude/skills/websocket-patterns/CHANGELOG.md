# Changelog

All notable changes to the websocket-patterns skill will be documented in this file.

## [2.0.0] - 2026-01-01

### Added

- 4エージェント体制を導入
  - `connection-manager`: 接続ライフサイクル管理
  - `message-handler`: メッセージキューイング
  - `health-monitor`: ハートビート・接続監視
  - `error-recoverer`: エラーリカバリー
- `EVALS.json`: 評価基準定義
- `LOGS.md`: 使用記録

### Changed

- SKILL.mdを18-skills.md仕様に完全準拠
- ワークフローを3フェーズ構成に再設計
- 知識アンカーを3つに拡張（RFC 6455、Kleppmann本、Circuit Breaker）

### Removed

- 旧Level1-4構造のreferencesファイル

## [1.1.0] - 2025-12-31

### Changed

- 18-skills.md仕様に準拠するよう更新
- Task仕様ナビ追加
- ワークフローの詳細化

## [1.0.0] - 2025-12-24

### Added

- 初版作成
- 基本的なWebSocket通信パターンガイド
