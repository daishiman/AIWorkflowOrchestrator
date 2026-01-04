# Changelog - performance-optimization-react

すべての重要な変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [2.0.0] - 2026-01-02

### Added

- EVALS.jsonを作成（評価基準と品質指標）
- LOGS.mdを作成（使用履歴とフィードバック記録）
- CHANGELOG.mdを作成（変更履歴の追跡）
- 新形式のagent定義（analyze-performance, optimize-rendering, validate-improvements）
- optimization-checklist.mdテンプレート

### Changed

- 18-skills.md仕様への完全準拠
- frontmatterからversion、level、last_updatedを削除（仕様外の要素）
- Task仕様を新形式に移行（agents/ディレクトリ）
- ワークフローを3 Phaseに明確化（測定・最適化・検証）

### Improved

- Anchorsセクションに具体的な適用方法と目的を追加
- Triggerセクションにキーワードを追加
- Task仕様ナビを追加（起動タイミング、入力、出力）

## [1.0.0] - 2025-12-24

### Added

- 初期リリース
- Phase-basedワークフロー（分析、最適化、検証）
- React DevTools Profiler測定ガイド
- React.memo、useCallback、useMemoの実装パターン
- Context分割戦略
- 再レンダリング4つの原因の解説
- references/ディレクトリ（Level1-4 + 特化リファレンス5つ）

### Changed

- Reactアプリケーションのパフォーマンス最適化に特化

## [0.1.0] - 2025-11-15

### Added

- プロトタイプバージョン
- 基本的なReact.memo使用例
- useCallbackとuseMemoの違い解説
