# Changelog - parallel-jobs-gha

すべての重要な変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [1.1.0] - 2026-01-02

### Added

- CHANGELOG.mdを独立ファイルとして作成（LOGS.mdから分離）
- トラブルシューティングセクションをSKILL.mdに追加
- Level3/Level4の実践例を拡充

### Fixed

- validate-skill.mjsの改行文字エスケープエラーを修正（33行目）
- ディレクトリパスをresources→referencesに修正

### Changed

- 18-skills.md仕様への完全準拠
- frontmatterにallowed-toolsを追加
- AnchorsにContinuous Deliveryの参照を追加

## [1.0.0] - 2025-12-28

### Added

- 初期リリース
- Phase-basedワークフロー（分析、実装、検証）
- 3つのAgent（analysis, implementation, validation）
- 6つのリファレンス（Level1-4 + data-passing + job-dependencies）
- parallel-workflow.yamlテンプレート（5つの実装例）
- 依存関係可視化スクリプト（visualize-deps.mjs）
- 使用記録スクリプト（log_usage.mjs）
- スキル構造検証スクリプト（validate-skill.mjs）
- EVALS.json（評価メトリクス）
- LOGS.md（使用履歴）

### Changed

- GitHub Actionsの並列ジョブ実行とジョブ依存関係管理に特化

## [0.1.0] - 2025-12-01

### Added

- プロトタイプバージョン
- 基本的なneeds構文ガイド
- outputs/artifacts/cacheの基礎説明
