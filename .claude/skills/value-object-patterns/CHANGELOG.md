# Changelog

All notable changes to the value-object-patterns skill will be documented in this file.

## [2.0.0] - 2026-01-01

### Added

- 4エージェント体制を導入
  - `value-designer`: 値オブジェクト識別・設計
  - `implementation-builder`: 実装構築（不変性・等価性）
  - `primitive-detector`: プリミティブ執着検出
  - `domain-integrator`: ドメインモデル統合
- `EVALS.json`: 評価基準定義
- `LOGS.md`: 使用記録

### Changed

- SKILL.mdを18-skills.md仕様に完全準拠
- ワークフローを3フェーズ構成に再設計
- 知識アンカーを拡張（DDD、Refactoring）

### Removed

- 旧Level1-4構造のreferencesファイル

## [1.0.0] - 2025-12-31

### Added

- 初版リリース
- 基本的な値オブジェクトパターンガイド
- 検出スクリプト（detect-primitive-obsession.mjs）
