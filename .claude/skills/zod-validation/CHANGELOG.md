# Changelog

このスキルの変更履歴を記録します。

## [4.0.0] - 2026-01-01

### Added

- `agents/form-integrator.md` - フォーム統合のTask仕様書を追加
- `agents/api-validator.md` - API検証のTask仕様書を追加
- `references/integration-patterns.md` - React Hook Form・Next.js統合パターンを追加
- `assets/form-validation-template.tsx` - フォーム統合テンプレートを追加

### Changed

- 4エージェント体制に拡張（schema-designer, validation-implementer, form-integrator, api-validator）
- SKILL.mdを4フェーズワークフローに再構成
- validate-skill.mjsを18-skills.md仕様に対応（agents/references/構造検証）
- EVALS.jsonを標準形式に更新

### Improved

- 型安全性を強化したテンプレート
- より実践的な統合パターンガイド

## [3.0.0] - 2026-01-01

### Added

- `agents/schema-designer.md` - スキーマ設計のTask仕様書を追加
- `agents/validation-implementer.md` - バリデーション実装のTask仕様書を追加
- `references/schema-patterns.md` - スキーマパターンの詳細ガイドを追加
- `references/validation-patterns.md` - バリデーションパターンの詳細ガイドを追加

### Changed

- 18-skills.md仕様に完全準拠するようSKILL.mdを刷新
- ワークフローをPhase 1-3の明確な構造に再設計
- Task仕様ナビをテーブル形式で追加
- references/を目的別に整理

### Removed

- 古いLevel1-4ベースのreferencesを削除
- 重複する知識ファイルを統合

## [2.0.0] - 2025-12-31

### Changed

- YAML frontmatter最適化
- Trigger日本語化
- Task仕様ナビ追加
- リソース参照を構造化テーブル形式に更新

## [1.0.0] - 2025-12-24

### Added

- 初版作成
- 基本的なZodスキーマ定義ガイド
- バリデーションパターン
