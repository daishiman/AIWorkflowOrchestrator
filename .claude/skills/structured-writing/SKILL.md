---
name: structured-writing
description: |
  DITA、トピックベースライティング、モジュール構造設計に基づく構造化ライティングの専門スキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/structured-writing/resources/content-reuse.md`: Content Reuseリソース
  - `.claude/skills/structured-writing/resources/dita-principles.md`: Dita Principlesリソース
  - `.claude/skills/structured-writing/resources/information-architecture.md`: Information Architectureリソース
  - `.claude/skills/structured-writing/resources/modular-design.md`: Modular Designリソース
  - `.claude/skills/structured-writing/resources/topic-types.md`: Topic Typesリソース

  - `.claude/skills/structured-writing/templates/concept-topic.md`: Concept Topicテンプレート
  - `.claude/skills/structured-writing/templates/reference-topic.md`: Reference Topicテンプレート
  - `.claude/skills/structured-writing/templates/task-topic.md`: Task Topicテンプレート

  - `.claude/skills/structured-writing/scripts/analyze-structure.mjs`: Analyze Structureスクリプト

version: 1.0.0
---

# Structured Writing

## 概要

このスキルは、大規模で一貫性のある技術文書を効率的に作成するための構造化ライティング手法を提供します。

DITA（Darwin Information Typing Architecture）の原則に基づき、トピックベースのモジュール構造でコンテンツを設計します。これにより再利用性、保守性、一貫性が向上します。

**主要な価値**:

- コンテンツ再利用による効率向上
- 構造化による一貫性確保
- 対象者別カスタマイズの容易化
- メンテナンスコストの削減

**対象ユーザー**:

- 仕様書を作成するエージェント（@spec-writer）
- ドキュメントアーキテクト
- テクニカルライター

## リソース構造

```
structured-writing/
├── SKILL.md                                    # 本ファイル（概要と原則）
├── resources/
│   ├── dita-principles.md                     # DITA原則と適用
│   ├── topic-types.md                         # トピックタイプ（タスク/コンセプト/リファレンス）
│   ├── modular-design.md                      # モジュール設計パターン
│   ├── content-reuse.md                       # コンテンツ再利用戦略
│   └── information-architecture.md            # 情報アーキテクチャ設計
├── scripts/
│   └── analyze-structure.mjs                  # 文書構造分析スクリプト
└── templates/
    ├── task-topic.md                          # タスクトピックテンプレート
    ├── concept-topic.md                       # コンセプトトピックテンプレート
    └── reference-topic.md                     # リファレンストピックテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# DITA原則と適用
cat .claude/skills/structured-writing/resources/dita-principles.md

# トピックタイプ
cat .claude/skills/structured-writing/resources/topic-types.md

# モジュール設計パターン
cat .claude/skills/structured-writing/resources/modular-design.md

# コンテンツ再利用戦略
cat .claude/skills/structured-writing/resources/content-reuse.md

# 情報アーキテクチャ設計
cat .claude/skills/structured-writing/resources/information-architecture.md
```

### スクリプト実行

```bash
# 文書構造分析（TypeScript）
node .claude/skills/structured-writing/scripts/analyze-structure.mjs <directory>
```

### テンプレート参照

```bash
# タスクトピックテンプレート
cat .claude/skills/structured-writing/templates/task-topic.md

# コンセプトトピックテンプレート
cat .claude/skills/structured-writing/templates/concept-topic.md

# リファレンストピックテンプレート
cat .claude/skills/structured-writing/templates/reference-topic.md
```

## いつ使うか

### シナリオ 1: 大規模ドキュメントセットの設計

**状況**: 複数のドキュメントから成るドキュメンテーションを新規作成する

**適用条件**:

- [ ] 10 以上のドキュメントを作成する予定
- [ ] 複数の対象者（開発者、管理者、ユーザー）がいる
- [ ] 長期的なメンテナンスが必要

**推奨アプローチ**: トピックベース設計、コンテンツモデリング

### シナリオ 2: コンテンツ再利用の最大化

**状況**: 同じ情報を複数のコンテキストで提供したい

**適用条件**:

- [ ] 共通のコンセプトや手順が複数箇所で必要
- [ ] 製品バリエーションごとにドキュメントが必要
- [ ] 翻訳コストを削減したい

**推奨アプローチ**: モジュール分割、条件付きテキスト

### シナリオ 3: ドキュメントの一貫性確保

**状況**: 複数人で作成するドキュメントの品質を統一したい

**適用条件**:

- [ ] 複数の執筆者が関わる
- [ ] スタイルや構造の統一が必要
- [ ] レビュープロセスを効率化したい

**推奨アプローチ**: トピックタイプの標準化、テンプレート活用

## 前提条件

### 必要な知識

- [ ] 基本的な技術文書作成スキル
- [ ] 対象読者の理解
- [ ] 文書の目的と範囲の明確化

### 必要なツール

- Write: ドキュメントの作成
- Read: 既存ドキュメントの参照
- Glob: ドキュメント構造の把握

### 環境要件

- 階層的なファイル構造をサポートする環境
- Markdown レンダリング環境

## ワークフロー

### Phase 1: 情報設計

**目的**: ドキュメントの対象者、目的、構造を明確化する

**ステップ**:

1. **対象者分析**:

   - 誰がドキュメントを読むか
   - 読者の技術レベル
   - 読者が達成したい目標

2. **コンテンツモデリング**:

   - 必要な情報の洗い出し
   - 情報間の関係性の整理
   - 再利用可能な要素の特定

3. **ナビゲーション設計**:
   - 情報へのアクセス経路
   - 階層構造の設計
   - 相互参照の計画

**判断基準**:

- [ ] 対象者が明確か？
- [ ] 必要な情報が特定されているか？
- [ ] ナビゲーション構造が設計されているか？

**リソース**: `resources/information-architecture.md`

### Phase 2: トピック構造の決定

**目的**: 各コンテンツを適切なトピックタイプに分類する

**ステップ**:

1. **トピックタイプの選択**:

   - タスク: 手順、操作方法
   - コンセプト: 概念、背景知識
   - リファレンス: 仕様、パラメータ一覧
   - トラブルシューティング: 問題解決

2. **トピック粒度の決定**:

   - 1 トピック = 1 つの目的
   - 再利用を考慮したサイズ
   - 独立性の確保

3. **トピック間関係の設計**:
   - 前提関係
   - 参照関係
   - 代替関係

**判断基準**:

- [ ] 各トピックのタイプが決定されているか？
- [ ] トピックサイズが適切か？
- [ ] 関係性が明確か？

**リソース**: `resources/topic-types.md`

### Phase 3: モジュール設計

**目的**: 再利用可能で独立したコンテンツモジュールを設計する

**ステップ**:

1. **共通要素の抽出**:

   - 繰り返し使用される説明
   - 共通の注意事項
   - 標準的な手順

2. **モジュール境界の決定**:

   - 独立して意味を成す単位
   - 再利用の容易さ
   - 更新の影響範囲

3. **組み合わせルールの設計**:
   - モジュール間の依存関係
   - 組み合わせの制約
   - バリエーション管理

**判断基準**:

- [ ] 共通要素が抽出されているか？
- [ ] モジュール境界が明確か？
- [ ] 組み合わせルールが定義されているか？

**リソース**: `resources/modular-design.md`, `resources/content-reuse.md`

### Phase 4: 実装と検証

**目的**: 設計に基づいてドキュメントを作成し、検証する

**ステップ**:

1. **テンプレート適用**:

   - トピックタイプに応じたテンプレート使用
   - 必須要素の確認
   - スタイルの統一

2. **構造検証**:

   - トピック独立性の確認
   - 再利用性のテスト
   - ナビゲーションの検証

3. **一貫性チェック**:
   - 用語の統一
   - スタイルの統一
   - 相互参照の確認

**判断基準**:

- [ ] テンプレートが適用されているか？
- [ ] 構造が設計通りか？
- [ ] 一貫性が保たれているか？

**リソース**: `resources/dita-principles.md`

## ベストプラクティス

### すべきこと

1. **1 トピック = 1 目的**:

   - 各トピックは単一の目的を持つ
   - 複数の目的がある場合は分割
   - タイトルと内容が一致

2. **再利用を前提に設計**:

   - コンテキスト依存を最小化
   - 自己完結型のモジュール
   - 明確な参照ポイント

3. **読者中心の構造**:
   - タスク中心のアプローチ
   - 段階的な情報開示
   - 明確なナビゲーション

### 避けるべきこと

1. **巨大な単一トピック**:

   - 10 ページを超えるトピック
   - 複数の目的の混在
   - 再利用困難な構造

2. **暗黙のコンテキスト依存**:

   - 前のページを読んでいないと分からない
   - 暗黙の前提知識
   - 不明確な参照

3. **過度な細分化**:
   - 意味を成さない小さなモジュール
   - 参照だらけで読みにくい
   - 全体像が把握できない

## トラブルシューティング

### 問題 1: トピックが長くなりすぎる

**症状**: 1 つのトピックが 10 ページを超える

**原因**:

- 複数の目的が混在
- 分割ポイントが見つからない

**解決策**:

1. 目的ごとに分割
2. サブタスクに分解
3. 参照をリファレンスに移動

### 問題 2: 再利用がうまくいかない

**症状**: モジュールがコンテキスト依存で再利用できない

**原因**:

- 暗黙の前提がある
- 特定のコンテキストを想定

**解決策**:

1. コンテキスト依存部分を分離
2. パラメータ化
3. 条件付きテキストの活用

### 問題 3: 構造が一貫しない

**症状**: 同じタイプのトピックで構造が異なる

**原因**:

- テンプレートが使用されていない
- ガイドラインが不明確

**解決策**:

1. テンプレートの徹底
2. レビュー基準の明確化
3. 自動検証の導入

## 関連スキル

- **technical-documentation-standards** (`.claude/skills/technical-documentation-standards/SKILL.md`): 技術文書化標準
- **markdown-advanced-syntax** (`.claude/skills/markdown-advanced-syntax/SKILL.md`): Markdown 高度構文
- **documentation-architecture** (`.claude/skills/documentation-architecture/SKILL.md`): ドキュメント構造設計

## メトリクス

### トピック独立性

**測定方法**: 他のトピックへの前方参照数 / トピック数
**目標**: <2（トピックあたり平均 2 未満の前方参照）

### 再利用率

**測定方法**: 再利用されたモジュール数 / 総モジュール数
**目標**: >30%

### 構造一貫性

**測定方法**: テンプレート準拠トピック数 / 総トピック数
**目標**: 100%

## 変更履歴

| バージョン | 日付       | 変更内容                                             |
| ---------- | ---------- | ---------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - DITA 原則、トピックタイプ、モジュール設計 |

## 使用上の注意

### このスキルが得意なこと

- ドキュメント構造の設計
- コンテンツ再利用戦略
- トピックベースライティング
- 情報アーキテクチャ設計

### このスキルが行わないこと

- 文書の具体的なコンテンツ作成
- プロジェクト固有のビジネスロジック
- 実際のコード実装

### 参考文献

- **『Every Page is Page One』** Mark Baker 著
  - トピックベースライティングの原則
- **DITA Best Practices**: https://www.oasis-open.org/committees/dita/
- **『Developing Quality Technical Information』** IBM 著
