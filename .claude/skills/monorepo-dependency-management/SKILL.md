---
name: monorepo-dependency-management
description: |
  モノレポ環境での依存関係管理、ワークスペース間の整合性維持を専門とするスキル。
  pnpm workspaces、変更影響分析、パッケージ間バージョン同期、循環依存検出の方法論を提供します。

  Anchors:
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: 実践的改善と品質維持 / 目的: モノレポの段階的構築と保守性向上
  • pnpm-workspace.yaml / 適用: workspace:*プロトコルと内部依存定義 / 目的: ワークスペース構造の標準化
  • 依存グラフ解析 / 適用: 循環依存検出と影響範囲特定 / 目的: 変更時のリスク最小化
  • shamefully-hoist設定 / 適用: ホイスティング制御とpublic-hoist-pattern / 目的: 依存解決の最適化

  Trigger:
  Use when managing monorepo dependencies, analyzing workspace relationships, synchronizing package versions, detecting circular dependencies, or configuring pnpm workspaces.
  Keywords: monorepo, pnpm workspace, dependency graph, version sync, circular dependency, hoisting, workspace protocol
allowed-tools:
  - read
  - glob
  - grep
  - bash
  - edit
version: 1.0.1
level: 1
last_updated: 2025-12-31
---

# モノレポ依存関係管理

## 概要

モノレポ環境での依存関係管理、ワークスペース間の整合性維持を専門とするスキル。
pnpm workspaces、変更影響分析、パッケージ間バージョン同期の方法論を提供します。

このスキルは以下のタスクに対応しています：

- pnpmワークスペースの初期セットアップと構造設計
- ワークスペース間の依存関係の一括管理
- パッケージ間のバージョン整合性維持
- 循環依存検出と影響範囲分析
- ホイスティング設定の最適化

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. モノレポの現在の構造と問題点を把握
2. 必要な対応レベル（基礎/実務/応用/専門）を判定
3. 関連する resources（Level1-4） と templates を特定

### Phase 2: スキル適用と実装

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. `analyze-workspace-deps.mjs` で循環依存や影響範囲を分析
3. pnpm-workspace.yaml やパッケージ定義を適切に調整
4. 重要な判断点をメモとして記録

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか検証
3. `log_usage.mjs` を実行して実行記録を残す

## Task仕様ナビ

| タスク                             | 推奨レベル | 主要リソース                | 実装スクリプト             |
| ---------------------------------- | ---------- | --------------------------- | -------------------------- |
| pnpm workspacesの初期セットアップ  | Level 1    | pnpm-workspace-setup.md     | analyze-workspace-deps.mjs |
| ワークスペース依存関係の分析       | Level 2    | change-impact-analysis.md   | analyze-workspace-deps.mjs |
| パッケージ間バージョンの同期       | Level 2    | version-synchronization.md  | -                          |
| 循環依存の検出と解決               | Level 2    | change-impact-analysis.md   | analyze-workspace-deps.mjs |
| ホイスティングの最適化             | Level 2    | dependency-hoisting.md      | -                          |
| モノレポ運用チェックリスト         | Level 1    | monorepo-setup-checklist.md | -                          |
| 高度な依存グラフ解析               | Level 3    | change-impact-analysis.md   | analyze-workspace-deps.mjs |
| バージョン管理のベストプラクティス | Level 3    | version-synchronization.md  | -                          |
| 専門的なワークスペース設計         | Level 4    | Level4_expert.md            | -                          |

## ベストプラクティス

### すべきこと

- **段階的なアプローチ**: Level1（基礎） → Level2（実務） → Level3（応用） → Level4（専門） の順で学習
- **循環依存チェック**: 新しいパッケージを追加する際は必ず `analyze-workspace-deps.mjs` で検査
- **バージョン同期の自動化**: カタログ機能やツールで統一バージョンを管理
- **テンプレート活用**: `monorepo-setup-checklist.md` で初期セットアップを体系的に実施
- **定期的な依存グラフ分析**: 定期的に依存関係を見直し最適化
- **ドキュメント保守**: 変更内容を references/requirements-index.md に記録

### 避けるべきこと

- **循環依存の放置**: 検出したら即座に解決する
- **バージョンの不整合**: 共有パッケージのバージョンをバラバラにしない
- **過度なホイスティング**: すべてをホイストするのではなく、必要に応じて制御
- **アンチパターンの採用**: resources に記載されたアンチパターンを避ける
- **レベルをスキップ**: 基本を飛ばして高度な設定をしない
- **ドキュメント無視**: Level2_intermediate.md などの実務的な警告事項を軽視しない

## リソース参照

### 学習リソース（レベル別）

- `references/Level1_basics.md` - pnpm workspaceの基礎と初期設定
- `references/Level2_intermediate.md` - ワークスペース管理と実務的な問題解決
- `references/Level3_advanced.md` - 複雑な依存グラフと最適化戦略
- `references/Level4_expert.md` - エンタープライズスケールのモノレポ管理

### 専門的なガイド

- `references/pnpm-workspace-setup.md` - pnpm-workspace.yaml設定、workspace:\*プロトコル、内部依存定義
- `references/change-impact-analysis.md` - 依存グラフ解析、影響範囲特定、テスト範囲決定
- `references/version-synchronization.md` - バージョン整合性維持、カタログ機能活用
- `references/dependency-hoisting.md` - shamefully-hoist設定、public-hoist-pattern、最適化
- `references/requirements-index.md` - 要求仕様の索引（docs/00-requirements と同期）
- `references/legacy-skill.md` - 旧SKILL.mdの全文と履歴

### 実装スクリプト

- `scripts/analyze-workspace-deps.mjs` - ワークスペース依存関係分析、循環依存検出、グラフ可視化
- `scripts/validate-skill.mjs` - スキル構造検証と構成チェック
- `scripts/log_usage.mjs` - 使用記録と自動評価

### テンプレートとチェックリスト

- `assets/monorepo-setup-checklist.md` - 初期セットアップから運用までの完全チェックリスト

## 変更履歴

| Version | Date       | Changes                                                                         |
| ------- | ---------- | ------------------------------------------------------------------------------- |
| 1.0.1   | 2025-12-31 | 18-skills.md仕様に対応：Task仕様ナビ追加、リソース参照整理、Trigger/Anchors記載 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                     |
