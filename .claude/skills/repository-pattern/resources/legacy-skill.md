---
name: .claude/skills/repository-pattern/SKILL.md
description: |
  Martin FowlerのPoEAAに基づくRepositoryパターン設計と実装を専門とするスキル。
  アプリケーション層とデータアクセス層を分離し、ドメインエンティティをコレクション風
  インターフェースで操作する抽象化を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/repository-pattern/resources/design-principles.md`: Repository設計原則
  - `.claude/skills/repository-pattern/resources/entity-mapping.md`: エンティティマッピングガイド
  - `.claude/skills/repository-pattern/resources/implementation-patterns.md`: Repository実装パターン
  - `.claude/skills/repository-pattern/resources/interface-patterns.md`: Repositoryインターフェース設計パターン
  - `.claude/skills/repository-pattern/scripts/validate-repository.mjs`: Repository構造検証スクリプト
  - `.claude/skills/repository-pattern/templates/repository-implementation-template.md`: Repository実装テンプレート
  - `.claude/skills/repository-pattern/templates/repository-interface-template.md`: Repositoryインターフェーステンプレート

  専門分野:
  - Repository パターン設計: コレクション風インターフェースによる抽象化
  - ドメイン型返却: DBの詳細を隠蔽し、ドメインエンティティを返却
  - インターフェース分離: 共通ドメイン層とインフラ層の適切な配置
  - クエリメソッド設計: ビジネス要件に基づいた検索メソッドの定義

  使用タイミング:
  - Repositoryインターフェースを設計する時
  - Repository実装を作成する時
  - ドメインエンティティとDB型の変換を設計する時
  - 既存のRepositoryをリファクタリングする時

  Use proactively when implementing data access layer,
  designing repository interfaces, or separating domain from infrastructure.
version: 1.0.0
---

# Repository Pattern

## 概要

このスキルは、Martin Fowler の PoEAA（Patterns of Enterprise Application Architecture）で定義された
Repository パターンの設計と実装に関する知識を提供します。

Repository パターンは、ドメイン層とデータアクセス層の間に位置し、ドメインオブジェクトの
コレクションのように振る舞うインターフェースを提供します。これにより、ビジネスロジックが
データベースの詳細から独立し、テスト容易性と保守性が向上します。

**主要な価値**:

- ドメイン層が DB の詳細（SQL、テーブル名）から完全に独立
- コレクション風の直感的な API（add, remove, findById 等）
- ドメインエンティティと DB オブジェクトの変換を一箇所に集約
- テスト時にモックやスタブで置換可能

**対象ユーザー**:

- `.claude/agents/repo-dev.md`エージェント
- データアクセス層を設計・実装する開発者
- クリーンアーキテクチャを採用するプロジェクト

## リソース構造

```
repository-pattern/
├── SKILL.md                                      # 本ファイル
├── resources/
│   ├── design-principles.md                     # Repository設計原則
│   ├── interface-patterns.md                    # インターフェース設計パターン
│   ├── implementation-patterns.md               # 実装パターン
│   └── entity-mapping.md                        # エンティティマッピング
├── scripts/
│   └── validate-repository.mjs                  # Repository構造検証
└── templates/
    ├── repository-interface-template.md         # インターフェーステンプレート
    └── repository-implementation-template.md    # 実装テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Repository設計原則
cat .claude/skills/repository-pattern/resources/design-principles.md

# インターフェース設計パターン
cat .claude/skills/repository-pattern/resources/interface-patterns.md

# 実装パターン
cat .claude/skills/repository-pattern/resources/implementation-patterns.md

# エンティティマッピング
cat .claude/skills/repository-pattern/resources/entity-mapping.md
```

### スクリプト実行

```bash
# Repository構造検証
node .claude/skills/repository-pattern/scripts/validate-repository.mjs <repository-file.ts>
```

### テンプレート参照

```bash
# インターフェーステンプレート
cat .claude/skills/repository-pattern/templates/repository-interface-template.md

# 実装テンプレート
cat .claude/skills/repository-pattern/templates/repository-implementation-template.md
```

## いつ使うか

### シナリオ 1: 新しい Repository の設計

**状況**: 新しいエンティティに対するデータアクセス層を作成する

**適用条件**:

- [ ] ドメインエンティティが定義されている
- [ ] CRUD 操作が必要
- [ ] ビジネス固有の検索条件がある

**期待される成果**: インターフェースと実装ファイルのペア

### シナリオ 2: 既存の直接 DB 操作のリファクタリング

**状況**: ドメイン層に散在する DB 操作を Repository に集約

**適用条件**:

- [ ] ドメイン層に SQL 文や ORM 呼び出しがある
- [ ] テストで DB モックが困難
- [ ] DB 変更時の影響範囲が広い

**期待される成果**: 抽象化された Repository 経由のアクセス

### シナリオ 3: 複雑なクエリのカプセル化

**状況**: ビジネスロジック内の複雑なクエリ条件を整理

**適用条件**:

- [ ] JOIN や複数条件を含むクエリがある
- [ ] 同じクエリパターンが複数箇所で使用
- [ ] クエリの意図が不明確

**期待される成果**: 意図を表すメソッド名を持つ Repository

## ワークフロー

### Phase 1: インターフェース設計

**目的**: ドメイン層で使用する Repository の契約を定義

**ステップ**:

1. **ドメインエンティティの確認**:
   - エンティティの属性と型を把握
   - 一意識別子（ID）の型を確認
   - 関連エンティティの有無を確認

2. **必要な操作の洗い出し**:
   - 基本 CRUD（Create, Read, Update, Delete）
   - ビジネス固有の検索メソッド
   - バルク操作の必要性

3. **インターフェース定義**:
   - ドメイン用語を使用したメソッド名
   - ドメインエンティティを引数・戻り値とする
   - DB の詳細を含めない

**判断基準**:

- [ ] メソッド名はドメイン用語を使用しているか？
- [ ] 引数に DB 固有の型が含まれていないか？
- [ ] 戻り値はドメインエンティティか？
- [ ] インターフェースは共通ドメイン層に配置されているか？

**リソース**: `resources/interface-patterns.md`

### Phase 2: 実装設計

**目的**: インターフェースを実装するクラスを設計

**ステップ**:

1. **データ変換の設計**:
   - DB オブジェクト → ドメインエンティティ（toEntity）
   - ドメインエンティティ → DB オブジェクト（toRecord）

2. **実装の配置決定**:
   - 共通インフラ層（src/shared/infrastructure/database/repositories/）

3. **エラーハンドリング設計**:
   - 存在しないエンティティ
   - 一意制約違反
   - DB 接続エラー

**判断基準**:

- [ ] 実装は共通インフラ層に配置されているか？
- [ ] 変換ロジックが明確か？
- [ ] エラーハンドリングが適切か？

**リソース**: `resources/implementation-patterns.md`

### Phase 3: テスト設計

**目的**: Repository の正しい動作を保証

**ステップ**:

1. **単体テストの設計**:
   - 各メソッドの正常系
   - エラーケース
   - 境界条件

2. **テストダブルの検討**:
   - インターフェースに対するモック
   - テスト用のインメモリ実装

**判断基準**:

- [ ] すべての公開メソッドがテストされているか？
- [ ] 正常系と異常系の両方がカバーされているか？

**リソース**: `resources/design-principles.md`

## 核心概念

### 1. コレクション風インターフェース

Repository は、メモリ内のコレクション（配列やセット）のように振る舞うべきです：

**推奨メソッド構造**:

- `add(entity)`: エンティティを永続化
- `remove(entity)`: エンティティを削除
- `findById(id)`: ID でエンティティを取得
- `findAll()`: 全エンティティを取得
- `findBy条件(params)`: 条件に合うエンティティを検索

### 2. ドメイン型の返却

Repository は常にドメインエンティティを返し、DB の詳細を漏らしません：

**チェックリスト**:

- [ ] 戻り値はドメインエンティティまたは Value Object
- [ ] テーブル名、カラム名が外部に漏れていない
- [ ] SQL や ORM 固有の型が外部に漏れていない

### 3. インターフェースと実装の分離

**配置ルール**:

- **インターフェース**: `src/shared/core/interfaces/IXxxRepository.ts`
- **実装**: `src/shared/infrastructure/database/repositories/XxxRepository.ts`

**依存関係の方向**:

```
app/ → features/ → shared/infrastructure/ → shared/core/
```

## ベストプラクティス

### すべきこと

1. **ドメイン用語を使用**:
   - ✅ `findPendingWorkflows()`
   - ❌ `findByStatusEquals("PENDING")`

2. **単一責任を維持**:
   - 1 つの Repository は 1 つの集約ルートに対応
   - 関連エンティティは集約ルート経由でアクセス

3. **変換ロジックを集約**:
   - toEntity/toRecord 関数を明確に定義
   - null/undefined の適切な処理

### 避けるべきこと

1. **ビジネスロジックの混入**:
   - ❌ Repository 内でドメインルールを適用
   - ✅ Repository 外のサービス層で処理

2. **トランザクション管理の漏洩**:
   - ❌ Repository がトランザクションを開始
   - ✅ 呼び出し側がトランザクションを制御

3. **過度に汎用的なメソッド**:
   - ❌ `find(query: any)`
   - ✅ 明確な意図を持つメソッド

## トラブルシューティング

### 問題 1: インターフェースが DB に依存

**症状**: インターフェースに DB 固有の型が含まれる

**解決策**:

1. 引数と戻り値をドメイン型のみに変更
2. DB 型への変換は実装内で行う

### 問題 2: 変換ロジックが散在

**症状**: 複数箇所で同じ変換処理

**解決策**:

1. toEntity/toRecord 関数を定義
2. Repository 実装内で一元化

### 問題 3: テストが困難

**症状**: Repository のモックが複雑

**解決策**:

1. インターフェースに対してモック作成
2. インメモリ実装を提供

## 関連スキル

- **.claude/skills/query-optimization/SKILL.md** (`.claude/skills/query-optimization/SKILL.md`): N+1 問題回避、JOIN 戦略
- **.claude/skills/transaction-management/SKILL.md** (`.claude/skills/transaction-management/SKILL.md`): トランザクション境界
- **.claude/skills/orm-best-practices/SKILL.md** (`.claude/skills/orm-best-practices/SKILL.md`): Drizzle ORM 活用
- **.claude/skills/clean-architecture-principles/SKILL.md** (`.claude/skills/clean-architecture-principles/SKILL.md`): 依存関係ルール

## メトリクス

### 設計品質スコア

**評価基準**:

- インターフェース分離: DB 依存がないか (0-10 点)
- ドメイン表現力: メソッド名がドメイン用語か (0-10 点)
- テスト容易性: モック可能か (0-10 点)
- 保守性: 変更容易性 (0-10 点)

**目標**: 平均 8 点以上

## 変更履歴

| バージョン | 日付       | 変更内容                                          |
| ---------- | ---------- | ------------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - PoEAA に基づく Repository パターン設計 |

## 参考文献

- **『Patterns of Enterprise Application Architecture』** Martin Fowler 著
  - Chapter 10: Repository - Repository パターンの詳細
  - Chapter 11: Unit of Work - トランザクション管理との連携
