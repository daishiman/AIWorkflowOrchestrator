# Changelog - performance-testing

すべての重要な変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [2.0.0] - 2026-01-02

### Added

- EVALS.jsonを作成（評価基準と品質指標）
- LOGS.mdを作成（使用履歴とフィードバック記録）
- CHANGELOG.mdを作成（変更履歴の追跡）
- agents/execute-tests.md（テスト実行・モニタリング）
- agents/analyze-bottlenecks.md（USE/REDメソッド適用）
- agents/propose-optimizations.md（改善策立案）
- assets/slo-template.md（SLO定義テンプレート）
- assets/k6-template.js（k6負荷テストテンプレート）
- assets/jmeter-template.jmx（JMeterテストテンプレート）
- references/Level4_expert.md（大規模・分散テスト）
- references/test-scenarios.md（テストシナリオ設計）
- references/load-testing.md（負荷テスト実践）
- scripts/log_usage.mjs（使用記録・自動評価）
- scripts/validate-skill.mjs（スキル構造検証）

### Changed

- 18-skills.md仕様への完全準拠
- ワークフローを5 Phaseに拡張（要件定義 → テスト設計 → 実行 → 分析 → 最適化）
- Task仕様を新形式に統一

### Improved

- Anchorsセクションに具体的な適用方法と目的を追加
- Triggerセクションにキーワードを追加
- USE/REDメソッドの詳細解説

## [1.0.0] - 2025-12-15

### Added

- 初期リリース
- agents/define-requirements.md（SLO定義・ベースライン測定）
- agents/design-tests.md（テストシナリオ設計）
- references/Level1_basics.md（基本知識）
- references/Level2_intermediate.md（中級テクニック）
- references/Level3_advanced.md（高度な分析）

### Changed

- パフォーマンステストの体系的なアプローチを確立

## [0.1.0] - 2025-11-01

### Added

- プロトタイプバージョン
- 基本的な負荷テストガイド
- k6とJMeterの比較
