# Changelog

All notable changes to the infrastructure-as-code skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-31

### Added

- 18-skills.md仕様準拠への完全移行
- `agents/` ディレクトリにTask仕様書を追加：
  - `environment-design.md`: 環境変数設計タスク
  - `secret-manager.md`: Secret管理タスク
  - `railway-configurator.md`: Railway構成タスク
  - `railway-validator.md`: 検証と確認タスク
- `EVALS.json`: メトリクス追跡とレベル評価基準
- `LOGS.md`: 使用履歴記録
- `CHANGELOG.md`: 変更履歴管理

### Changed

- SKILL.mdを18-skills.md仕様に準拠するよう更新
- frontmatterを新仕様に準拠（description、dependencies、tagsの追加）
- ワークフローを4つのTaskフェーズに分割
- Progressive Disclosure原則の適用（SKILL.md 122行 < 500行制限）

### Improved

- Task間のインターフェース定義を明確化
- 各Taskの入出力契約を文書化
- 検証プロセスの自動化と手動チェックリストの統合
- フィードバックループの標準化

## [0.9.0] - 2025-12-24

### Added

- 初期バージョン
- 基本的なワークフロー（Phase 1-3）
- references/ ディレクトリの基礎リソース
- scripts/ の検証スクリプト
- assets/ のテンプレート

### Notes

- このバージョンはagents/を使用していない旧仕様
