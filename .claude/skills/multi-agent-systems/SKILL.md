---
name: マルチエージェントシステム設計
description: |
  マルチエージェントシステム設計を専門とするスキル。複数のエージェント間の効果的な協調、ハンドオフプロトコルの設計、情報受け渡しメカニズムにより、スケーラブルで保守性の高い分散システムを構築します。

  **Anchors**:
  - エージェント間協調設計（Phase 1: 分析）
  - ハンドオフプロトコル実装（Phase 2: 設計）
  - 情報受け渡し最適化（Phase 3: 検証）

  **Trigger**: マルチエージェントシステムの設計が必要な場合、複数エージェント間の協調ロジックを定義する必要がある場合、ハンドオフプロトコルを標準化する必要がある場合、エージェント間の依存関係を整理する必要がある場合に発動します。

allowed-tools:
  - agents/requirements-analyst.md
  - agents/protocol-designer.md
  - agents/quality-validator.md
  - references/Level1_basics.md
  - references/Level2_intermediate.md
  - references/Level3_advanced.md
  - references/Level4_expert.md
  - references/collaboration-patterns.md
  - references/legacy-skill.md
  - scripts/analyze-collaboration.mjs
  - scripts/log_usage.mjs
  - scripts/validate-skill.mjs
  - assets/handoff-protocol-template.json
  - references/requirements-index.md

version: 2.0.0
level: 1
last_updated: 2025-12-31
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "手順設計"
      - "実践的改善"
---

# マルチエージェントシステム設計

## 概要

このスキルは、複数のインテリジェントエージェントが協働するシステムの設計と実装を専門とします。エージェント間の効果的なコミュニケーション、ハンドオフプロトコルの実装、情報受け渡しメカニズムの最適化を通じて、スケーラブルで信頼性の高い分散システムを構築します。

**主要な能力**：

- 複数エージェント間の協調設計パターン
- ハンドオフプロトコルの標準化と実装
- エージェント間の依存関係管理
- 情報受け渡しの最適化と検証

詳細な手順やガイダンスは、リソースレベル（Level 1-4）に応じたドキュメントを参照してください。

## ワークフロー

### Phase 1: 目的分析と要件整理

**目的**: マルチエージェントシステムの要件と制約条件を明確化する

**アクション**:

1. `references/Level1_basics.md` でマルチエージェントシステムの基本概念を確認
2. `references/collaboration-patterns.md` で利用可能な協調パターンを理解
3. システムに必要なエージェント数、役割、相互作用パターンを特定
4. `references/requirements-index.md` で要求仕様を確認

**成果物**: 要件整理ドキュメント

### Phase 2: 設計と実装

**目的**: ハンドオフプロトコルと協調メカニズムを具体的に設計実装する

**アクション**:

1. `references/Level2_intermediate.md` で実務的な実装パターンを学習
2. `assets/handoff-protocol-template.json` を参考にプロトコルを定義
3. エージェント間の依存関係グラフを作成
4. 情報受け渡しフロー（input/output）を明確化
5. エラーハンドリングと同期メカニズムを設計
6. `scripts/analyze-collaboration.mjs` で設計の妥当性を検証

**成果物**: ハンドオフプロトコル定義書、協調設計書

### Phase 3: 検証と最適化

**目的**: 成果物の品質確認と実装の最適化を行う

**アクション**:

1. `references/Level3_advanced.md` で高度な最適化手法を確認
2. `scripts/validate-skill.mjs` で設計構造の整合性を確認
3. エージェント間の通信オーバーヘッドを分析
4. スケーラビリティと信頼性を検証
5. `references/Level4_expert.md` でベストプラクティスとの照合
6. `scripts/log_usage.mjs` を実行して実装記録を保存

**成果物**: 最適化レポート、実装ガイドライン、検証結果

## Task仕様ナビ

### Phase 1: 要件分析（Task: Requirements Analyst）

**Task仕様書**: `agents/requirements-analyst.md`

| 項目       | 詳細                                                              |
| ---------- | ----------------------------------------------------------------- |
| **担当者** | Requirements Analyst（Sam Newman思考様式）                        |
| **入力**   | ビジネス要件ドキュメント、プロジェクト制約                        |
| **出力**   | 要件整理ドキュメント、パターン選定根拠レポート                    |
| **参照**   | references/Level1_basics.md、references/collaboration-patterns.md |
| **実行時** | Task起動でエージェント仕様を読み込み、要件分析を実行              |

### Phase 2: プロトコル設計（Task: Protocol Designer）

**Task仕様書**: `agents/protocol-designer.md`

| 項目       | 詳細                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| **担当者** | Protocol Designer（Martin Fowler思考様式）                               |
| **入力**   | 要件整理ドキュメント、プロジェクト制約                                   |
| **出力**   | ハンドオフプロトコル定義書、情報フロー図、協調分析レポート               |
| **参照**   | references/Level2_intermediate.md、assets/handoff-protocol-template.json |
| **検証**   | scripts/analyze-collaboration.mjs を実行して設計を検証                   |
| **実行時** | Task起動でエージェント仕様を読み込み、プロトコル設計を実行               |

### Phase 3: 品質検証（Task: Quality Validator）

**Task仕様書**: `agents/quality-validator.md`

| 項目       | 詳細                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| **担当者** | Quality Validator（Michael Feathers思考様式）                            |
| **入力**   | ハンドオフプロトコル定義書、情報フロー図、協調分析レポート               |
| **出力**   | 品質検証レポート、最適化提案レポート、実装ガイドライン、使用記録エントリ |
| **参照**   | references/Level3_advanced.md、references/Level4_expert.md               |
| **検証**   | scripts/validate-skill.mjs を実行して構造を検証                          |
| **記録**   | scripts/log_usage.mjs を実行してLOGS.mdに記録                            |
| **実行時** | Task起動でエージェント仕様を読み込み、品質検証と最適化を実行             |

## ベストプラクティス

### すべきこと

- **早期に協調パターンを定義**: Phase 1で複数の協調パターンを検討し、要件に最適なものを選定する
- **明示的なハンドオフプロトコル**: エージェント間の情報受け渡しは必ずプロトコルで明示化する
- **依存関係の可視化**: 複雑なシステムではエージェント間の依存関係グラフを作成する
- **エラーハンドリング戦略**: 分散システムの特性を考慮したエラー処理を事前設計する
- **非同期通信の活用**: スケーラビリティのため、エージェント間通信は非同期パターンを優先する
- **段階的な検証**: プロトタイプから実装への移行は段階的に行い、各フェーズで検証する
- **リソース参照の活用**: レベル別のドキュメントを段階的に参照し、知識を深める

### 避けるべきこと

- **密結合設計**: エージェント間に直接的な依存関係を作ることを避ける
- **プロトコルなしの通信**: ハンドオフプロトコルを定義せずに通信を実装しない
- **スケーラビリティ無視**: 同期的な1対1通信に頼り、スケーラビリティを損なう設計
- **エラーハンドリング忘れ**: 分散システムのエラー条件を考慮しないプロトコル設計
- **ドキュメント不足**: 複雑なハンドオフプロトコルは必ず詳細に文書化する
- **アンチパターンの無視**: 実装前に必ずレベル3/4のリソースでアンチパターンを確認する
- **検証スキップ**: 設計完了後の検証ステップをスキップしない

## リソース参照

### ドキュメント（段階的学習）

- **Level 1 基礎**: `references/Level1_basics.md` - マルチエージェントシステムの基本概念と用語
- **Level 2 実務**: `references/Level2_intermediate.md` - 実装パターンとベストプラクティス
- **Level 3 応用**: `references/Level3_advanced.md` - 高度な最適化技法とパフォーマンスチューニング
- **Level 4 専門**: `references/Level4_expert.md` - エンタープライズレベルの設計と複雑な協調パターン

### パターンとテンプレート

- **協調パターン集**: `references/collaboration-patterns.md` - 利用可能なエージェント協調パターン
- **ハンドオフプロトコル**: `assets/handoff-protocol-template.json` - プロトコル定義のJSONテンプレート
- **要求仕様索引**: `references/requirements-index.md` - プロジェクト要求との同期資料

### スクリプトツール

```bash
# 協調パターン分析
node .claude/skills/multi-agent-systems/scripts/analyze-collaboration.mjs --help

# スキル構造検証
node .claude/skills/multi-agent-systems/scripts/validate-skill.mjs --help

# 使用記録・評価
node .claude/skills/multi-agent-systems/scripts/log_usage.mjs --help
```

### 参考資料

- **レガシースキル**: `references/legacy-skill.md` - 前バージョンの全文リファレンス

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に基づいた全面刷新：YAML frontmatter拡張（Anchors, Trigger, allowed-tools追加）、ワークフロー内容強化（成果物明示）、Task仕様ナビ追加、ベストプラクティス拡充、リソース参照セクション構造化 |
| 1.0.0   | 2025-12-24 | 初版：スキル概要、基本ワークフロー、ベストプラクティス                                                                                                                                                      |
