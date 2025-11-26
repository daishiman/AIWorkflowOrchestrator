---
name: refactoring-techniques
description: |
  マーティン・ファウラーの『リファクタリング』に基づくコード改善技術を専門とするスキル。
  外部から見た振る舞いを変えずに、内部構造を改善する体系的手法を提供します。

  専門分野:
  - Extract Method: 長大なメソッドから意味のある部分を抽出
  - Replace Temp with Query: 一時変数をメソッド呼び出しに置換
  - Introduce Parameter Object: 複数パラメータのオブジェクト化
  - Decompose Conditional: 複雑な条件式の分解
  - コードスメル検出: リファクタリングが必要な箇所の特定

  使用タイミング:
  - メソッドが30行を超える場合
  - 同じロジックが複数箇所に重複している場合
  - 複雑な条件式（ネスト3段階以上）がある場合
  - コードレビューで可読性の問題を指摘された場合
  - テストが通っている状態でコード品質を改善したい場合

  Use proactively when refactoring code, improving readability, or detecting code smells.
version: 1.0.0
---

# Refactoring Techniques

## 概要

このスキルは、マーティン・ファウラーが『リファクタリング（第2版）』で体系化した
コード改善技術を提供します。リファクタリングとは「外部から見た振る舞いを変えずに、
内部構造を改善すること」であり、コードの可読性・保守性を高める基盤技術です。

**核心原則**:
- コードは書かれるより読まれる回数が多い → 可読性への投資は高リターン
- 小さなステップで進める → 一度に一つの改善、各ステップでテスト実行
- テストが安全網 → リファクタリング前に包括的テストを確保

**対象ユーザー**:
- ビジネスロジック実装エージェント（@logic-dev）
- コードレビュー担当者
- 技術的負債を削減したい開発者

## リソース構造

```
refactoring-techniques/
├── SKILL.md                              # 本ファイル
├── resources/
│   ├── extract-method.md                 # Extract Method詳細ガイド
│   ├── decompose-conditional.md          # Decompose Conditional詳細ガイド
│   ├── introduce-parameter-object.md     # Introduce Parameter Object詳細ガイド
│   ├── replace-temp-with-query.md        # Replace Temp with Query詳細ガイド
│   └── code-smells-catalog.md            # コードスメルカタログ
├── scripts/
│   └── detect-code-smells.mjs            # コードスメル検出スクリプト
└── templates/
    └── refactoring-checklist.md          # リファクタリングチェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# Extract Method詳細
cat .claude/skills/refactoring-techniques/resources/extract-method.md

# Decompose Conditional詳細
cat .claude/skills/refactoring-techniques/resources/decompose-conditional.md

# Introduce Parameter Object詳細
cat .claude/skills/refactoring-techniques/resources/introduce-parameter-object.md

# Replace Temp with Query詳細
cat .claude/skills/refactoring-techniques/resources/replace-temp-with-query.md

# コードスメルカタログ
cat .claude/skills/refactoring-techniques/resources/code-smells-catalog.md
```

### スクリプト実行

```bash
# コードスメル検出
node .claude/skills/refactoring-techniques/scripts/detect-code-smells.mjs <directory>

# 例: src/features/配下を検査
node .claude/skills/refactoring-techniques/scripts/detect-code-smells.mjs src/features/
```

### テンプレート参照

```bash
# リファクタリングチェックリスト
cat .claude/skills/refactoring-techniques/templates/refactoring-checklist.md
```

## 主要リファクタリングカタログ（概要）

### 1. Extract Method

**適用条件**:
- メソッドが30行を超える
- コードブロックにコメントで説明が必要
- 同じコードが複数箇所に存在

**判断プロセス**:
1. このコードブロックは独立した意味を持つか？
2. 適切な名前を付けられるか？
3. 抽出後、元のメソッドは理解しやすくなるか？

**詳細**: `resources/extract-method.md`

### 2. Decompose Conditional

**適用条件**:
- 条件式が複雑（&&/||が3つ以上）
- ネストが3段階以上
- 条件の意図が読み取りにくい

**手順**:
1. 条件部分を意味のあるメソッドに抽出
2. then節とelse節をそれぞれメソッドに抽出
3. 各メソッドに意図を表す名前を付ける

**詳細**: `resources/decompose-conditional.md`

### 3. Introduce Parameter Object

**適用条件**:
- メソッドのパラメータが4つ以上
- 複数のメソッドで同じパラメータ群を使用
- パラメータ間に論理的関連がある

**手順**:
1. パラメータをグループ化したクラス/型を作成
2. メソッドシグネチャを変更
3. 呼び出し元を更新

**詳細**: `resources/introduce-parameter-object.md`

### 4. Replace Temp with Query

**適用条件**:
- 一時変数が一度だけ代入される
- 計算ロジックが再利用可能
- 変数名で意図を伝えている

**手順**:
1. 計算ロジックをメソッドに抽出
2. 一時変数の参照をメソッド呼び出しに置換
3. 一時変数を削除

**詳細**: `resources/replace-temp-with-query.md`

## コードスメル検出基準

### 長大なメソッド（Long Method）
- **基準**: 30行超
- **対処**: Extract Method

### 重複コード（Duplicated Code）
- **基準**: 3行以上の同一/類似コードが2箇所以上
- **対処**: Extract Function/Method

### マジックナンバー（Magic Number）
- **基準**: 意味不明な数値リテラル
- **対処**: Introduce Named Constant

### 複雑な条件式（Complex Conditional）
- **基準**: ネスト3段階以上、または条件3つ以上の組み合わせ
- **対処**: Decompose Conditional

### パラメータ過多（Long Parameter List）
- **基準**: パラメータ4つ以上
- **対処**: Introduce Parameter Object

**詳細**: `resources/code-smells-catalog.md`

## ワークフロー

### Phase 1: コードスメル検出

**目的**: リファクタリングが必要な箇所を特定

**手順**:
1. 対象コードを読み込み
2. コードスメル検出基準に照らして評価
3. 優先順位付け（影響度 × 修正難易度）

**判断基準**:
- [ ] 長大なメソッド（30行超）は存在しないか？
- [ ] 重複コードは存在しないか？
- [ ] マジックナンバーは存在しないか？
- [ ] 複雑な条件式は存在しないか？

### Phase 2: リファクタリング計画

**目的**: 安全なリファクタリング順序を決定

**手順**:
1. テストの存在確認（なければ先にテストを書く）
2. リファクタリング手法の選択
3. 依存関係の分析
4. 実行順序の決定

**判断基準**:
- [ ] 包括的なテストが存在するか？
- [ ] 適切なリファクタリング手法が選択されているか？
- [ ] 依存関係を考慮した順序か？

### Phase 3: リファクタリング実行

**目的**: 一つずつ改善を適用

**手順**:
1. 一つのリファクタリングを適用
2. テストを実行
3. 成功を確認してから次へ
4. 失敗した場合は即座にロールバック

**判断基準**:
- [ ] 各リファクタリング後にテストが通るか？
- [ ] 可読性が向上したか？
- [ ] 振る舞いが変わっていないか？

### Phase 4: 検証

**目的**: 品質改善を確認

**手順**:
1. コードスメル検出を再実行
2. メトリクス比較（複雑度、行数など）
3. コードレビュー

**判断基準**:
- [ ] 検出されたコードスメルが解消されたか？
- [ ] 循環的複雑度が改善されたか？
- [ ] コードの意図が明確になったか？

## ベストプラクティス

### すべきこと

1. **テストを先に確保**:
   - リファクタリング前に包括的テストを確認
   - テストがなければ先にテストを書く

2. **小さなステップで進める**:
   - 一度に一つの改善
   - 各ステップ後にテストを実行

3. **名前で意図を表現**:
   - 抽出したメソッドに意味のある名前を付ける
   - 名前だけで何をするか分かるようにする

### 避けるべきこと

1. **複数の変更を同時に行う**:
   - ❌ Extract MethodとRename Variableを同時実行
   - ✅ 一つずつ実行して各ステップでテスト

2. **テストなしでのリファクタリング**:
   - ❌ 「簡単だから大丈夫」という判断
   - ✅ 常にテストで振る舞いを保証

3. **過度な抽象化**:
   - ❌ 3行のコードのために新しいクラスを作成
   - ✅ 適切な粒度で抽象化

## 関連スキル

- **tdd-red-green-refactor** (`.claude/skills/tdd-red-green-refactor/SKILL.md`): リファクタリングの安全網となるテスト
- **clean-code-practices** (`.claude/skills/clean-code-practices/SKILL.md`): 命名規則、小さな関数の原則
- **code-smell-detection** (`.claude/skills/code-smell-detection/SKILL.md`): アーキテクチャレベルのスメル検出

## メトリクス

### 循環的複雑度

**目標**: 関数あたり10以下

**測定**: 分岐数（if/else/switch/for/while）+ 1

### 関数行数

**目標**: 30行以下

### コード重複率

**目標**: 3%以下

## 参考文献

- **『リファクタリング（第2版）』** マーティン・ファウラー著
  - 第2章: リファクタリングの原則
  - 第3章: コードの臭い
  - 第6章〜第12章: リファクタリングカタログ

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - マーティン・ファウラーのリファクタリング技法 |
