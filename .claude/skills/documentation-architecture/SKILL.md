---
name: documentation-architecture
description: |
  ドキュメント構造設計、リソース分割、階層設計を専門とするスキル。
  500行制約に基づく適切なファイル分割とトピックベース組織化により、
  保守性と発見可能性の高いドキュメントアーキテクチャを実現します。

  専門分野:
  - ファイル分割: トピック別、レベル別、機能別、ハイブリッド分割
  - リソース組織化: ディレクトリ構造、命名規則、参照設計
  - 階層設計: 概要から詳細への段階的深化
  - メタデータ最適化: 発見可能性、検索性の向上

  使用タイミング:
  - SKILL.mdが500行を超える可能性がある時
  - リソースファイルの分割戦略を決定する時
  - ドキュメントの階層構造を設計する時
  - 情報の発見可能性を向上させる時

  Use proactively when designing document structure, splitting large files,
  or organizing knowledge resources.
version: 1.0.0
---

# Documentation Architecture

## 概要

ドキュメントアーキテクチャは、知識を効率的に組織化し、保守性と発見可能性を最大化する設計原則です。

Claude Codeスキルシステムにおいては、500行制約に基づく適切なファイル分割と、
トピックベースの組織化により、スケーラブルで保守しやすい知識ベースを構築します。

**主要な価値**:
- 500行制約の遵守による可読性維持
- 適切な分割による保守性向上
- 論理的な階層構造による発見可能性向上
- トピックベース組織化による再利用性向上

**対象ユーザー**:
- スキルを設計するエージェント（@skill-librarian）
- 大規模なドキュメントを管理する開発者
- 知識ベースの構造を最適化したいチーム

## リソース構造

```
documentation-architecture/
├── SKILL.md                          # 本ファイル（設計原則）
├── resources/
│   ├── splitting-patterns.md        # ファイル分割の4パターン
│   ├── directory-organization.md    # ディレクトリ構造設計
│   ├── naming-conventions.md        # 命名規則とパターン
│   └── hierarchy-design.md          # 階層設計の原則
├── scripts/
│   └── analyze-structure.sh         # ドキュメント構造分析
└── templates/
    └── resource-structure.md        # リソース構造テンプレート
```

### リソース種別

- **分割パターン** (`resources/splitting-patterns.md`): トピック別、レベル別、機能別、ハイブリッド
- **ディレクトリ組織化** (`resources/directory-organization.md`): フォルダ構造、配置基準
- **命名規則** (`resources/naming-conventions.md`): ファイル・ディレクトリの命名パターン
- **階層設計** (`resources/hierarchy-design.md`): 概要から詳細への段階的設計
- **分析スクリプト** (`scripts/analyze-structure.sh`): 構造の妥当性を自動分析
- **テンプレート** (`templates/resource-structure.md`): 標準的なリソース構造

## いつ使うか

### シナリオ1: 500行超過への対応
**状況**: SKILL.mdまたはリソースが500行を超えそう

**適用条件**:
- [ ] 現在の行数が400行を超えている
- [ ] 追加したい内容が100行以上ある
- [ ] 分割可能なトピックが存在する

**期待される成果**: 適切な分割戦略の決定と実施

### シナリオ2: ドキュメント構造の設計
**状況**: 新しいスキルやドキュメントの構造を設計する

**適用条件**:
- [ ] 複数のトピックを扱う
- [ ] ユーザーレベルが混在（初心者～上級者）
- [ ] 段階的な学習パスが必要

**期待される成果**: 論理的で発見可能性の高い構造

### シナリオ3: 既存ドキュメントのリファクタリング
**状況**: 既存のドキュメントが肥大化し、保守が困難

**適用条件**:
- [ ] ドキュメントが1000行を超えている
- [ ] 情報の発見が困難
- [ ] 更新時に影響範囲が不明確

**期待される成果**: リファクタリング計画と実施

## 前提条件

### 必要な知識
- [ ] Markdown基本文法
- [ ] ファイルシステムの基本概念
- [ ] 情報アーキテクチャの基礎

### 必要なツール
- Read: 既存構造の分析
- Write: ファイルの作成
- Bash: ディレクトリ操作

### 環境要件
- `.claude/skills/`ディレクトリが存在する

## ワークフロー

### Phase 1: 分割必要性の判断

**目的**: ファイル分割が必要かどうかを判断する

**判断フロー**:
```
現在の行数は？
├─ <300行 → 分割不要（単一ファイルで継続）
├─ 300-500行 → 判断2へ
│   └─ 将来の拡張予定は？
│       ├─ あり → 分割推奨
│       └─ なし → 単一ファイルでOK
└─ >500行 → 分割必須
```

**判断基準**:
- [ ] 現在の行数は？
- [ ] 将来的な追加予定は？
- [ ] 独立したトピックが存在するか？

**リソース**: `resources/splitting-patterns.md`

### Phase 2: 分割パターンの選択

**目的**: 最適な分割パターンを選択する

**4つのパターン**:

1. **トピック別分割**:
   - 適用: 独立したテーマごと
   - 命名: `[topic]-[subtopic].md`

2. **レベル別分割**:
   - 適用: 学習段階がある
   - 命名: `01-basics.md`, `02-intermediate.md`, `03-advanced.md`

3. **機能別分割**:
   - 適用: CRUD等の操作ごと
   - 命名: `create.md`, `read.md`, `update.md`, `delete.md`

4. **ハイブリッド分割**:
   - 適用: 複数基準の組み合わせ
   - 構造: カテゴリ/レベル/機能の階層

**選択基準**:
- [ ] どのパターンが対象知識に最適か？
- [ ] ユーザーの学習パスが明確か？
- [ ] 各ファイルが独立して理解可能か？

**リソース**: `resources/splitting-patterns.md`

### Phase 3: ディレクトリ構造の設計

**目的**: ファイルを適切なディレクトリに配置する

**標準構造**:
```
skill-name/
├── SKILL.md
├── resources/
│   ├── [topic]-[aspect].md
│   └── [category]/
│       ├── [subtopic].md
│       └── [subtopic].md
├── scripts/
│   └── [purpose].sh
├── templates/
│   └── [template-name].[ext]
└── assets/
    └── [schema|sample].[ext]
```

**配置基準**:
- resources/: ドキュメント（.md）
- scripts/: 実行可能スクリプト
- templates/: 再利用可能フォーマット
- assets/: スキーマ、サンプルデータ

**リソース**: `resources/directory-organization.md`

### Phase 4: 命名規則の適用

**目的**: 一貫性のある命名により発見可能性を向上

**命名パターン**:
- トピック別: `[domain]-[topic].md`
- Phase別: `[framework]-[phase].md`
- レベル別: `[number]-[level]-[topic].md`

**判断基準**:
- [ ] 命名から内容が推測できるか？
- [ ] アルファベット順で論理的な並びか？
- [ ] 他のファイルと区別できるか？

**リソース**: `resources/naming-conventions.md`

## リソースへの参照

- **ファイル分割パターン**: `resources/splitting-patterns.md`
  - 4つの分割パターンの詳細
  - 適用条件と判断基準
  - 具体的な実装例

- **ディレクトリ組織化**: `resources/directory-organization.md`
  - 標準ディレクトリ構造
  - 配置基準とベストプラクティス

- **命名規則**: `resources/naming-conventions.md`
  - ファイル・ディレクトリの命名パターン
  - 一貫性の確保

- **階層設計**: `resources/hierarchy-design.md`
  - 概要から詳細への段階的設計
  - トレーサビリティの確保

## ベストプラクティス

### すべきこと

1. **早期分割の検討**:
   - 300行を超えたら分割を検討
   - 500行は絶対に超えない

2. **論理的な構造**:
   - トピックごとに明確に分離
   - 階層が深すぎない（3階層まで）

3. **明確な参照**:
   - SKILL.mdから各リソースへの参照を明示
   - 参照タイミングのガイダンス

### 避けるべきこと

1. **過度な分割**:
   - ❌ 10行のファイルを大量に作成
   - ✅ 各ファイル300-450行の適切なサイズ

2. **曖昧な命名**:
   - ❌ `misc.md`, `other.md`, `utils.md`
   - ✅ `error-handling-strategies.md`

3. **深すぎる階層**:
   - ❌ `resources/api/rest/v2/endpoints/users/get-user-by-id.md`
   - ✅ `resources/api-endpoints.md`

## トラブルシューティング

### 問題1: 分割後に情報が見つからない

**症状**: 必要な情報がどのファイルにあるか分からない

**原因**: SKILL.mdからの参照が不明確

**解決策**:
1. 「リソース構造」セクションをSKILL.mdに追加
2. 各Phaseで対応するリソースを明示
3. リソース選択ガイドを提供

### 問題2: ファイルが多すぎて管理困難

**症状**: 10個以上のリソースファイルがあり、把握できない

**原因**: 過度な分割

**解決策**:
1. 関連するトピックを統合
2. サブディレクトリでカテゴリ化
3. 各リソースを300-450行に保つ

### 問題3: 階層が深すぎる

**症状**: `resources/category/subcategory/topic/detail.md`

**原因**: 過度な階層化

**解決策**:
1. 階層を2-3レベルに制限
2. フラットな構造を優先
3. 命名で階層を表現（`category-subcategory-topic.md`）

## 関連スキル

- **progressive-disclosure** (`.claude/skills/progressive-disclosure/SKILL.md`): 3層開示モデル、トークン効率
- **knowledge-management** (`.claude/skills/knowledge-management/SKILL.md`): SECI Model、知識の体系化
- **context-optimization** (`.claude/skills/context-optimization/SKILL.md`): トークン最適化
- **best-practices-curation** (`.claude/skills/best-practices-curation/SKILL.md`): ドキュメント品質評価

## メトリクス

### ファイルサイズ分布

**測定**: 各ファイルの行数分布

**目標**:
- SKILL.md: 350-450行
- リソース: 各300-450行
- 500行超過: 0ファイル

### 発見時間

**測定**: ユーザーが必要な情報を見つけるまでの時間

**目標**: <2分

### 保守性スコア

**評価基準**:
- ファイル分割の適切性: 0-10点
- 命名の一貫性: 0-10点
- 階層の論理性: 0-10点

**目標**: 平均8点以上

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-23 | 初版作成 - ドキュメント構造設計フレームワーク |

## 使用上の注意

### このスキルが得意なこと
- ファイル分割戦略の決定
- ディレクトリ構造の設計
- 命名規則の定義
- 階層設計の最適化

### このスキルが行わないこと
- ドキュメントの内容作成（構造設計のみ）
- 実際のファイル分割作業（設計を提供）
- コードの実装

### 推奨される使用フロー
1. 分割必要性の判断（Phase 1）
2. 分割パターンの選択（Phase 2）
3. ディレクトリ構造の設計（Phase 3）
4. 命名規則の適用（Phase 4）

### 参考文献
- **『Information Architecture for the Web and Beyond』** Louis Rosenfeld他著
  - 情報組織化の原則

- **『Documenting Software Architectures』** Paul Clements他著
  - ドキュメント構造の設計
