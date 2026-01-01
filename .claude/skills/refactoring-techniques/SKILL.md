---
name: refactoring-techniques
description: |
  マーティン・ファウラーの『リファクタリング』に基づくコード改善技術を専門とするスキル。
  外部から見た振る舞いを変えずに、内部構造を改善する体系的手法を提供します。

  Anchors:
  • 『Refactoring』（Martin Fowler） / 適用: コード改善 / 目的: 保守性向上

  Trigger:
  リファクタリング実施時、コード品質改善、技術的負債解消時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# リファクタリング技法

## 概要

マーティン・ファウラーの『リファクタリング』に基づくコード改善技術を専門とするスキル。外部から見た振る舞いを変えずに、内部構造を改善する体系的手法を提供します。

このスキルは以下の場面で活用されます：

- 複雑なメソッドの分解
- コードスメルの検出と修正
- テストの保護下でのコード品質改善
- 技術的負債の段階的解消

詳細な手順や背景については、レベル別ガイド（references/Level1_basics.md～Level4_expert.md）を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. コードスメルまたは改善の必要性を特定する
2. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
3. 適用するリファクタリング手法を決定
4. 必要なリソース、スクリプト、テンプレートを特定

**確認項目**:

- 既存テストが通っているか確認
- リファクタリングの範囲を明確化
- 影響を受けるコンポーネントを把握

### Phase 2: リファクタリング実施

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. `references/code-smells-catalog.md` でコードスメルを確認
2. 対応する手法リソース（extract-method.md、decompose-conditional.md など）を参照
3. `assets/refactoring-checklist.md` を使用しながら段階的に実施
4. 各段階でテストを実行して動作確認

**実施戦略**:

- 小さな変更の積み重ねで実施
- テストが常に通っている状態を維持
- 重要な判断点をメモとして記録

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. 全テストが成功することを確認
2. コードレビュー基準に適合することを検証
3. `scripts/validate-skill.mjs` でスキル構造を確認
4. 成果物が目的に合致するか確認
5. `scripts/log_usage.mjs` を実行して記録を残す

**確認事項**:

- 外部動作が変わっていないことを確認
- パフォーマンス低下がないことを確認
- ドキュメント更新が必要か確認

## Task仕様ナビ

| Task                       | 説明                                       | 前提条件                 | 参照リソース                            |
| -------------------------- | ------------------------------------------ | ------------------------ | --------------------------------------- |
| コードスメル検出           | 改善が必要なコード箇所を特定する           | ソースコードへのアクセス | references/code-smells-catalog.md        |
| メソッド抽出               | 複雑または重複するロジックをメソッドに抽出 | 30行以上のメソッド       | references/extract-method.md             |
| 条件式の分解               | ネストされた条件式を読みやすく分解         | 複雑な条件式がある       | references/decompose-conditional.md      |
| パラメータオブジェクト導入 | 複数のパラメータをオブジェクトに統合       | 4個以上のパラメータ      | references/introduce-parameter-object.md |
| 一時変数をクエリに置換     | 計算結果をメソッドで取得するよう変更       | 繰り返し使用される計算式 | references/replace-temp-with-query.md    |
| リファクタリング検証       | 変更内容が仕様を満たしているか確認         | 実装完了                 | assets/refactoring-checklist.md      |

## ベストプラクティス

### すべきこと

- **メソッド長を管理する**: メソッドが30行を超える場合はメソッド抽出を検討する
- **重複コードの排除**: 同じロジックが複数箇所に存在する場合は即座に修正する
- **条件式の簡潔化**: ネスト3段階以上の条件式は分解を検討する
- **テスト駆動で実施**: リファクタリングは常にテストが通った状態で行う
- **段階的に進める**: 一度に複数のリファクタリングを組み合わせない
- **命名の明確化**: メソッドや変数の名前で意図が伝わるようにする
- **小さなコミットで記録**: リファクタリングの各段階をコミットで記録する

### 避けるべきこと

- **テストなしで実施**: リファクタリングは常にテストの保護下で行うこと
- **複数のリファクタリングを同時実施**: 1つの技法に集中して実施する
- **外部動作の変更**: リファクタリングで外部インターフェースを変更しない
- **アンチパターン未確認**: references/Level3_advanced.md の注意点を確認してから実施する
- **パフォーマンス低下**: リファクタリング後のパフォーマンスを検証せず進めない
- **ドキュメント放置**: リファクタリング後、必要なドキュメントを更新する

## リソース参照

### レベル別ガイド

| リソース                         | 説明                                     | 対象レベル |
| -------------------------------- | ---------------------------------------- | ---------- |
| references/Level1_basics.md       | リファクタリングの基本概念と基本技法     | 初級       |
| references/Level2_intermediate.md | 実践的なリファクタリング手法と判断基準   | 中級       |
| references/Level3_advanced.md     | 複雑なリファクタリングと注意点           | 上級       |
| references/Level4_expert.md       | パフォーマンスと設計を考慮した高度な手法 | 専門家向け |

### テクニック別リソース

| テクニック       | ファイル                                | 説明                                     |
| ---------------- | --------------------------------------- | ---------------------------------------- |
| コードスメル検出 | references/code-smells-catalog.md        | 改善が必要なコードパターンの完全カタログ |
| メソッド抽出     | references/extract-method.md             | 複雑なロジックをメソッドに分割する手法   |
| 条件式分解       | references/decompose-conditional.md      | 複雑な条件式を読みやすくする手法         |
| パラメータ統合   | references/introduce-parameter-object.md | 複数パラメータをオブジェクトに統合       |
| 一時変数置換     | references/replace-temp-with-query.md    | 計算結果をメソッドで取得する手法         |

### スクリプトと自動化

| スクリプト                     | 説明                       | 使用時期               |
| ------------------------------ | -------------------------- | ---------------------- |
| scripts/detect-code-smells.mjs | コードスメルを自動検出する | リファクタリング開始前 |
| scripts/log_usage.mjs          | 使用記録と自動評価を実施   | リファクタリング完了後 |
| scripts/validate-skill.mjs     | スキル構造を検証する       | 品質保証時             |

### テンプレート

| テンプレート                       | 説明                                   | 活用場面         |
| ---------------------------------- | -------------------------------------- | ---------------- |
| assets/refactoring-checklist.md | リファクタリング実施時のチェックリスト | 各フェーズで参照 |

### 参考文献

- 『Refactoring』（Martin Fowler）: リファクタリングの標準文献
- 『Clean Code』（Robert C. Martin）: 命名と意図の明確化
- 『Refactoring: Improving the Design of Existing Code』: 2版での最新手法

## コマンドリファレンス

### リソース読み取り

```bash
# レベル別ガイドの読み取り
cat .claude/skills/refactoring-techniques/references/Level1_basics.md
cat .claude/skills/refactoring-techniques/references/Level2_intermediate.md
cat .claude/skills/refactoring-techniques/references/Level3_advanced.md
cat .claude/skills/refactoring-techniques/references/Level4_expert.md

# テクニック別リソースの読み取り
cat .claude/skills/refactoring-techniques/references/code-smells-catalog.md
cat .claude/skills/refactoring-techniques/references/decompose-conditional.md
cat .claude/skills/refactoring-techniques/references/extract-method.md
cat .claude/skills/refactoring-techniques/references/introduce-parameter-object.md
cat .claude/skills/refactoring-techniques/references/replace-temp-with-query.md
```

### スクリプト実行

```bash
# コードスメル検出
node .claude/skills/refactoring-techniques/scripts/detect-code-smells.mjs --help

# 使用記録と評価
node .claude/skills/refactoring-techniques/scripts/log_usage.mjs --help

# スキル構造検証
node .claude/skills/refactoring-techniques/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
# リファクタリングチェックリスト
cat .claude/skills/refactoring-techniques/assets/refactoring-checklist.md
```

## 変更履歴

| Version | Date       | Changes                                                                                                                                     |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に基づいて完全更新。Anchors、Trigger、allowed-toolsを追加。Task仕様ナビテーブルを追加。ワークフロー詳細化。日本語完全対応。 |
