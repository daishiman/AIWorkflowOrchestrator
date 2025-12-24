---
name: .claude/skills/plugin-architecture/SKILL.md
description: |
  動的な機能拡張を可能にするプラグインアーキテクチャの設計を専門とするスキル。
  レジストリパターン、動的ロード、依存性注入を活用し、
  機能追加時の既存コード修正を不要にする拡張性の高いシステム設計を提供します。
  
  📖 参照書籍:
  - 『Clean Architecture』（Robert C. Martin）: 依存関係ルール
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/dependency-injection.md`: Constructor Injection、DI Container設計によるプラグイン間疎結合化
  - `resources/dynamic-loading.md`: Eager/Lazy/On-Demand Loading、自動登録・手動登録パターン
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/plugin-lifecycle.md`: プラグインのロード、初期化、有効化、無効化、アンロードフック管理
  - `resources/registry-pattern.md`: 型安全なプラグインRegistry、登録・取得・検索パターン
  - `resources/service-locator.md`: Service Locatorパターンの設計と適切な使用場面
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-plugin-structure.mjs`: プラグインディレクトリ構造とインターフェース実装を検証
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/plugin-implementation.md`: IPlugin実装、ライフサイクルフック、依存性注入を含むプラグインテンプレート
  - `templates/registry-implementation.md`: 型安全なRegistry実装テンプレート（Map-based、CRUD操作含む）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling plugin architecture tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Clean Architecture"
    author: "Robert C. Martin"
    concepts:
      - "依存関係ルール"
      - "境界の設計"
---

# Plugin Architecture

## 概要

動的な機能拡張を可能にするプラグインアーキテクチャの設計を専門とするスキル。
レジストリパターン、動的ロード、依存性注入を活用し、
機能追加時の既存コード修正を不要にする拡張性の高いシステム設計を提供します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- ワークフローエンジンのプラグインシステムを構築する時
- 機能の動的追加・削除が必要な時
- 疎結合なモジュール設計が必要な時
- 拡張ポイントを提供するフレームワークを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/plugin-architecture/resources/Level1_basics.md
cat .claude/skills/plugin-architecture/resources/Level2_intermediate.md
cat .claude/skills/plugin-architecture/resources/Level3_advanced.md
cat .claude/skills/plugin-architecture/resources/Level4_expert.md
cat .claude/skills/plugin-architecture/resources/dependency-injection.md
cat .claude/skills/plugin-architecture/resources/dynamic-loading.md
cat .claude/skills/plugin-architecture/resources/legacy-skill.md
cat .claude/skills/plugin-architecture/resources/plugin-lifecycle.md
cat .claude/skills/plugin-architecture/resources/registry-pattern.md
cat .claude/skills/plugin-architecture/resources/service-locator.md
```

### スクリプト実行
```bash
node .claude/skills/plugin-architecture/scripts/log_usage.mjs --help
node .claude/skills/plugin-architecture/scripts/validate-plugin-structure.mjs --help
node .claude/skills/plugin-architecture/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/plugin-architecture/templates/plugin-implementation.md
cat .claude/skills/plugin-architecture/templates/registry-implementation.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
