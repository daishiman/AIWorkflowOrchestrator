---
name: refactoring-patterns
description: |
  Design patterns applied in refactoring context to improve code structure systematically.
  Focuses on pattern recognition and application for legacy code modernization.

  Anchors:
  • Design Patterns (Gang of Four) / 適用: リファクタリング時のパターン適用 / 目的: 構造的な改善
  • Refactoring to Patterns (Joshua Kerievsky) / 適用: パターン指向リファクタリング / 目的: 段階的なパターン導入
  • Working Effectively with Legacy Code (Michael Feathers) / 適用: レガシーコード改善 / 目的: 安全なパターン適用

  Trigger:
  Use when applying design patterns during refactoring, modernizing legacy code, or introducing patterns incrementally.
  design pattern, refactoring, legacy code, pattern application, strategy pattern, template method, factory, adapter
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Task
---

# refactoring-patterns

## 概要

Design patterns applied in refactoring context to improve code structure systematically.
リファクタリング時にデザインパターンを段階的に適用し、レガシーコードを近代化するスキル。

このスキルは以下の場面で活用されます:

- 複雑な条件分岐をStrategyパターンに置き換え
- 重複コードをTemplate Methodパターンで統一
- 密結合をAdapterパターンで分離
- 複雑な生成ロジックをFactoryパターンに置き換え
- レガシーコードに段階的にパターンを導入

詳細な手順や背景については、レベル別ガイド（references/Level1_basics.md～Level4_expert.md）を参照してください。

---

## ワークフロー

### Phase 1: パターン識別

**目的**: コードスメルからパターン適用機会を特定

**アクション**:

1. 対象コードの問題点を特定（複雑な条件分岐、重複コード、密結合など）
2. `references/Level1_basics.md` でパターン適用の基本を確認
3. `references/pattern-opportunities.md` で適用可能なパターンを判断
4. 必要なリソース、スクリプト、テンプレートを特定

**確認項目**:

- 既存テストが通っているか確認
- パターン適用の範囲を明確化
- 影響を受けるコンポーネントを把握

**Task**: `agents/identify-pattern.md` を参照

### Phase 2: パターン適用

**目的**: 段階的にパターンを適用してコード構造を改善

**アクション**:

1. `references/Level2_intermediate.md` でパターン適用手順を確認
2. 対応するパターンリソース（strategy-pattern.md、template-method-pattern.md など）を参照
3. `assets/pattern-application-checklist.md` を使用しながら段階的に実施
4. 各段階でテストを実行して動作確認

**実施戦略**:

- 小さな変更の積み重ねで実施（一度に完全なパターンを導入しない）
- テストが常に通っている状態を維持
- パターンの過剰適用を避ける（YAGNI原則）

**Task**: `agents/apply-pattern.md` を参照

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. 全テストが成功することを確認
2. パターン適用による改善効果を測定
3. `scripts/validate-pattern-application.mjs` でパターン適用を検証
4. 成果物が目的に合致するか確認
5. `scripts/log_usage.mjs` を実行して記録を残す

**確認事項**:

- パターンが正しく適用されているか
- 過剰設計になっていないか
- ドキュメント更新が必要か確認

**Task**: `agents/validate-pattern.md` を参照

---

## Task仕様ナビ

| Task                  | 説明                                          | 前提条件                 | 参照リソース                            |
| --------------------- | --------------------------------------------- | ------------------------ | --------------------------------------- |
| パターン識別          | コードスメルからパターン適用機会を特定        | ソースコードへのアクセス | references/pattern-opportunities.md     |
| Strategy パターン適用 | 条件分岐をStrategy パターンに置き換え         | 複雑な条件分岐がある     | references/strategy-pattern.md          |
| Template Method 適用  | 重複コードを Template Method で統一           | 類似した処理の重複       | references/template-method-pattern.md   |
| Factory パターン適用  | 複雑な生成ロジックを Factory に置き換え       | 複雑なオブジェクト生成   | references/factory-pattern.md           |
| Adapter パターン適用  | 密結合を Adapter で分離                       | レガシーAPI への依存     | references/adapter-pattern.md           |
| State パターン適用    | 状態依存の振る舞いを State パターンに置き換え | 状態による条件分岐が複雑 | references/state-pattern.md             |
| パターン適用検証      | パターンが正しく適用されているか確認          | パターン適用完了         | assets/pattern-application-checklist.md |

---

## ベストプラクティス

### すべきこと

- **段階的に導入する**: パターンを一度にすべて適用せず、段階的に導入する
- **テスト駆動で実施**: パターン適用は常にテストの保護下で行う
- **YAGNI を意識**: 将来の拡張性より現在の必要性を優先する
- **シンプルさを保つ**: パターンで複雑さが増す場合は適用を見送る
- **既存コードを尊重**: 既存の設計意図を理解してからパターンを適用
- **チーム合意を得る**: パターン導入前にチームでレビュー
- **ドキュメント更新**: パターン適用後、設計ドキュメントを更新

### 避けるべきこと

- **パターン過剰適用**: すべての問題をパターンで解決しようとしない
- **一度に完全実装**: 段階的な導入を無視して完全なパターンを一度に実装しない
- **テストなしで実施**: パターン適用は常にテストの保護下で行うこと
- **抽象化の過度な導入**: 必要以上の抽象化レイヤーを作らない
- **既存設計の無視**: 既存の設計意図を理解せずにパターンを押し付けない
- **パフォーマンス未検証**: パターン適用後のパフォーマンスを検証せず進めない

---

## リソース参照

### レベル別ガイド

| リソース                          | 説明                                         | 対象レベル |
| --------------------------------- | -------------------------------------------- | ---------- |
| references/Level1_basics.md       | パターン適用の基本概念と判断基準             | 初級       |
| references/Level2_intermediate.md | 実践的なパターン適用手法と段階的導入         | 中級       |
| references/Level3_advanced.md     | 複雑なパターン組み合わせとレガシーコード対応 | 上級       |
| references/Level4_expert.md       | パターン適用のアンチパターンと高度な設計判断 | 専門家向け |

### パターン別リソース

| パターン         | ファイル                              | 説明                                      |
| ---------------- | ------------------------------------- | ----------------------------------------- |
| パターン機会検出 | references/pattern-opportunities.md   | パターン適用機会の識別方法                |
| Strategy         | references/strategy-pattern.md        | 条件分岐をStrategy パターンに置き換え     |
| Template Method  | references/template-method-pattern.md | 重複コードを Template Method で統一       |
| Factory          | references/factory-pattern.md         | 複雑な生成ロジックを Factory に置き換え   |
| Adapter          | references/adapter-pattern.md         | レガシーAPI を Adapter で分離             |
| State            | references/state-pattern.md           | 状態依存の振る舞いを State パターンに置換 |
| Observer         | references/observer-pattern.md        | イベント通知を Observer パターンで実装    |
| Decorator        | references/decorator-pattern.md       | 機能追加を Decorator パターンで実現       |

### スクリプトと自動化

| スクリプト                               | 説明                       | 使用時期           |
| ---------------------------------------- | -------------------------- | ------------------ |
| scripts/detect-pattern-opportunities.mjs | パターン適用機会を自動検出 | Phase 1実行時      |
| scripts/validate-pattern-application.mjs | パターン適用を検証         | Phase 3実行時      |
| scripts/log_usage.mjs                    | 使用記録と自動評価を実施   | パターン適用完了後 |

### テンプレート

| テンプレート                            | 説明                                 | 活用場面         |
| --------------------------------------- | ------------------------------------ | ---------------- |
| assets/pattern-application-checklist.md | パターン適用時のチェックリスト       | 各フェーズで参照 |
| assets/strategy-pattern-template.md     | Strategy パターンテンプレート        | Strategy 適用時  |
| assets/template-method-template.md      | Template Method パターンテンプレート | Template 適用時  |
| assets/factory-pattern-template.md      | Factory パターンテンプレート         | Factory 適用時   |

### 参考文献

- **Design Patterns** (Gang of Four): デザインパターンの標準文献
- **Refactoring to Patterns** (Joshua Kerievsky): パターン指向リファクタリング
- **Working Effectively with Legacy Code** (Michael Feathers): レガシーコード改善の実践
- **Head First Design Patterns**: パターンの理解を深める入門書

---

## コマンドリファレンス

### リソース読み取り

```bash
# レベル別ガイドの読み取り
cat .claude/skills/refactoring-patterns/references/Level1_basics.md
cat .claude/skills/refactoring-patterns/references/Level2_intermediate.md
cat .claude/skills/refactoring-patterns/references/Level3_advanced.md
cat .claude/skills/refactoring-patterns/references/Level4_expert.md

# パターン別リソースの読み取り
cat .claude/skills/refactoring-patterns/references/pattern-opportunities.md
cat .claude/skills/refactoring-patterns/references/strategy-pattern.md
cat .claude/skills/refactoring-patterns/references/template-method-pattern.md
cat .claude/skills/refactoring-patterns/references/factory-pattern.md
```

### スクリプト実行

```bash
# パターン適用機会検出
node .claude/skills/refactoring-patterns/scripts/detect-pattern-opportunities.mjs --help

# パターン適用検証
node .claude/skills/refactoring-patterns/scripts/validate-pattern-application.mjs --help

# 使用記録と評価
node .claude/skills/refactoring-patterns/scripts/log_usage.mjs --help
```

### テンプレート参照

```bash
# パターン適用チェックリスト
cat .claude/skills/refactoring-patterns/assets/pattern-application-checklist.md

# Strategy パターンテンプレート
cat .claude/skills/refactoring-patterns/assets/strategy-pattern-template.md
```

---

## 変更履歴

| Version | Date       | Changes                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に基づいて新規作成。Anchors、Trigger、allowed-toolsを追加。Task仕様ナビ追加。agents/実装。 |
