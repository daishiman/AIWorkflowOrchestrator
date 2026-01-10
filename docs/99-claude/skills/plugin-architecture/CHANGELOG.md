# Changelog - plugin-architecture

すべての重要な変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [2.0.0] - 2026-01-02

### Added

- EVALS.jsonを作成（評価基準と品質指標）
- LOGS.mdを作成（使用履歴とフィードバック記録）
- CHANGELOG.mdを作成（変更履歴の追跡）

### Changed

- 18-skills.md仕様への完全準拠
- ワークフローを4 Phaseに明確化（インターフェース定義 → レジストリ実装 → 動的ロード → 検証）
- Task仕様を新形式に統一

### Improved

- Anchorsセクションに具体的な適用方法と目的を追加
- Triggerセクションにキーワードを追加
- TypeScript型安全なレジストリパターンの詳細解説

## [1.0.0] - 2025-12-10

### Added

- 初期リリース
- agents/ディレクトリ（インターフェース定義・レジストリ実装・動的ロード・検証）
- references/ディレクトリ（Level1-4 + 特化リファレンス7つ）
- assets/ディレクトリ（プラグインテンプレート、レジストリ実装例）
- scripts/ディレクトリ（検証・使用記録スクリプト）

### Changed

- プラグインアーキテクチャ設計に特化
- レジストリパターン、動的ロード、依存性注入の統合アプローチ

## [0.1.0] - 2025-10-20

### Added

- プロトタイプバージョン
- 基本的なプラグインパターン
- レジストリパターンの基礎
