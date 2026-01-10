# Level 2: Intermediate

## 概要

動的な機能拡張を可能にするプラグインアーキテクチャの設計を専門とするスキル。 レジストリパターン、動的ロード、依存性注入を活用し、 機能追加時の既存コード修正を不要にする拡張性の高いシステム設計を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Dependency Injection（依存性注入） / 注入パターン / 1. Constructor Injection（コンストラクタ注入） / Dynamic Loading（動的ロード） / ロード方式 / 1. Eager Loading（即時ロード）
- 実務指針: ワークフローエンジンのプラグインシステムを構築する時 / 機能の動的追加・削除が必要な時 / 疎結合なモジュール設計が必要な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/dependency-injection.md`: Constructor Injection、DI Container設計によるプラグイン間疎結合化（把握する知識: Dependency Injection（依存性注入） / 注入パターン / 1. Constructor Injection（コンストラクタ注入））
- `resources/dynamic-loading.md`: Eager/Lazy/On-Demand Loading、自動登録・手動登録パターン（把握する知識: Dynamic Loading（動的ロード） / ロード方式 / 1. Eager Loading（即時ロード））
- `resources/plugin-lifecycle.md`: プラグインのロード、初期化、有効化、無効化、アンロードフック管理（把握する知識: Plugin Lifecycle（プラグインライフサイクル） / ライフサイクルフェーズ / ライフサイクルインターフェース）
- `resources/registry-pattern.md`: 型安全なプラグインRegistry、登録・取得・検索パターン（把握する知識: Registry Pattern（レジストリパターン） / パターン構造 / 基本実装）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: アーキテクチャ設計 / 機能プラグイン追加手順）
- `resources/service-locator.md`: Service Locatorパターンの設計と適切な使用場面（把握する知識: Service Locator（サービスロケーター） / パターン構造 / 基本実装）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Plugin Architecture / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-plugin-structure.mjs`: プラグインディレクトリ構造とインターフェース実装を検証
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/plugin-implementation.md`: IPlugin実装、ライフサイクルフック、依存性注入を含むプラグインテンプレート
- `templates/registry-implementation.md`: 型安全なRegistry実装テンプレート（Map-based、CRUD操作含む）

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
