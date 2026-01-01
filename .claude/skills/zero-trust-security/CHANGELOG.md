# Changelog

All notable changes to the zero-trust-security skill will be documented in this file.

## [2.0.0] - 2026-01-01

### Added

- 4エージェント体制を導入
  - `identity-verifier`: ID検証・認証強化
  - `access-controller`: アクセス制御・RBAC/ABAC
  - `policy-enforcer`: ポリシー適用・マイクロセグメンテーション
  - `trust-evaluator`: 信頼性評価・継続的検証
- `EVALS.json`: 評価基準定義
- `LOGS.md`: 使用記録

### Changed

- SKILL.mdを18-skills.md仕様に完全準拠
- ワークフローを3フェーズ構成に再設計
- 知識アンカーを拡張（Zero Trust Networks、NIST）

### Removed

- 旧Level1-4構造のreferencesファイル

## [1.1.0] - 2025-12-31

### Changed

- 18-skills.md仕様に準拠するよう更新
- YAML frontmatterの改善
- Task仕様ナビテーブルの追加
- 日本語記述統一

## [1.0.0] - 2025-12-24

### Added

- 初版リリース
- 基本的なゼロトラストセキュリティガイド
