---
name: transaction-script
description: |
  マーティン・ファウラーのPofEAAに基づくトランザクションスクリプトパターンを専門とするスキル。
  シンプルな手続き型ロジックでビジネストランザクションを実現します。

  専門分野:
  - トランザクションスクリプトパターン: 手続き型のビジネスロジック組織化
  - サービス層との連携: プレゼンテーション層との分離
  - ドメインモデルとの使い分け: 複雑さに応じたパターン選択
  - 適切な粒度: スクリプトの責任範囲

  使用タイミング:
  - シンプルなビジネスロジックを実装する時
  - CRUD操作の拡張を行う時
  - ドメインモデルが過剰と感じる場合
  - 既存システムの手続き型ロジックを整理する時

  Use proactively when implementing simple business logic or organizing procedural code.
version: 1.0.0
---

# Transaction Script

## 概要

トランザクションスクリプトは、マーティン・ファウラーが『Patterns of Enterprise Application Architecture (PofEAA)』で
解説したビジネスロジック組織化パターンです。一つのスクリプト（手続き）で一つのビジネストランザクションを実現します。

**核心原則**:
- 一つのリクエストに対して一つのスクリプト
- 手続き型のシンプルなロジック
- 理解しやすく変更しやすい

**対象ユーザー**:
- ビジネスロジック実装エージェント（@logic-dev）
- シンプルなCRUD操作を実装する開発者
- 既存の手続き型コードを整理したい開発者

## リソース構造

```
transaction-script/
├── SKILL.md                              # 本ファイル
├── resources/
│   ├── pattern-overview.md               # パターンの詳細解説
│   ├── domain-model-comparison.md        # ドメインモデルとの比較
│   └── executor-pattern.md               # Executorパターンの実装
├── scripts/
│   └── analyze-executor.mjs              # Executor分析スクリプト
└── templates/
    └── executor-template.md              # Executor実装テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# パターン詳細
cat .claude/skills/transaction-script/resources/pattern-overview.md

# ドメインモデルとの比較
cat .claude/skills/transaction-script/resources/domain-model-comparison.md

# Executorパターン
cat .claude/skills/transaction-script/resources/executor-pattern.md
```

### スクリプト実行

```bash
# Executor分析（実装の品質チェック）
node .claude/skills/transaction-script/scripts/analyze-executor.mjs src/features/
```

### テンプレート参照

```bash
# Executor実装テンプレート
cat .claude/skills/transaction-script/templates/executor-template.md
```

## パターンの特徴

### 構造

各トランザクションは独立したスクリプト（関数/メソッド）として実装されます。

**典型的な流れ**:
1. 入力の検証
2. データの取得（リポジトリ経由）
3. ビジネスロジックの実行
4. データの永続化
5. 結果の返却

### 利点

- **シンプル**: 理解しやすい手続き型
- **直接的**: リクエストと処理の1対1対応
- **変更容易**: 影響範囲が限定的
- **デバッグ容易**: 処理フローが明確

### 欠点

- **重複**: 類似ロジックが各スクリプトに重複しやすい
- **スケール困難**: ロジックが複雑になると管理が困難
- **ドメイン知識分散**: ビジネスルールが散在しやすい

## 適用条件

### トランザクションスクリプトが適切な場合

- [ ] ビジネスロジックがシンプル
- [ ] CRUD操作が中心
- [ ] ドメインモデルが不要または過剰
- [ ] チームが手続き型に慣れている
- [ ] 短期プロジェクト

### ドメインモデルを検討すべき場合

- [ ] ビジネスルールが複雑
- [ ] 同じルールが複数箇所で必要
- [ ] エンティティ間の関係が複雑
- [ ] 長期的な保守が必要

**詳細**: `resources/domain-model-comparison.md`

## Executorパターン

### 概要

プロジェクト固有のトランザクションスクリプト実装パターンです。
各機能のビジネスロジックをExecutorクラスとして実装します。

### 構造

```
features/
└── [機能名]/
    ├── schema.ts      # 入出力スキーマ（Zod）
    ├── executor.ts    # ビジネスロジック（Transaction Script）
    └── __tests__/     # テスト
```

### インターフェース

```typescript
interface IWorkflowExecutor {
  execute(input: Input): Promise<Output>;
}
```

**詳細**: `resources/executor-pattern.md`

## ワークフロー

### トランザクションスクリプト実装

```
1. 要件の理解
   ↓
2. 入出力の定義（スキーマ）
   ↓
3. テストの作成（TDD）
   ↓
4. スクリプトの実装
   - 入力検証
   - データ取得
   - ロジック実行
   - 永続化
   - 結果返却
   ↓
5. リファクタリング
   ↓
6. 検証
```

### 判断フロー

```
ビジネスロジック実装
  ↓
[質問] ロジックはシンプルか？
  ├─ Yes → Transaction Script
  └─ No  → Domain Modelを検討
  ↓
[質問] 同じルールが複数箇所で必要か？
  ├─ Yes → 共通関数に抽出、またはDomain Model
  └─ No  → Transaction Scriptを継続
```

## ベストプラクティス

### すべきこと

1. **一つのスクリプトは一つのトランザクション**:
   - 責任を明確に
   - 関数名でトランザクションを表現

2. **共通ロジックの抽出**:
   - 重複を発見したら共通関数に
   - ただし早すぎる抽象化は避ける

3. **テスト駆動**:
   - スクリプトごとにテストを作成
   - エッジケースをカバー

### 避けるべきこと

1. **巨大なスクリプト**:
   - ❌ 100行を超えるスクリプト
   - ✅ 適切に分割して呼び出し

2. **過度な抽象化**:
   - ❌ シンプルなロジックに複雑なパターンを適用
   - ✅ シンプルさを維持

3. **ビジネスルールの散在**:
   - ❌ 同じルールが複数スクリプトに重複
   - ✅ 共通関数に抽出

## 関連スキル

- **refactoring-techniques** (`.claude/skills/refactoring-techniques/SKILL.md`): コードの改善
- **tdd-red-green-refactor** (`.claude/skills/tdd-red-green-refactor/SKILL.md`): テスト駆動開発
- **domain-driven-design** (`.claude/skills/domain-driven-design/SKILL.md`): 複雑なドメインの場合

## 参考文献

- **『Patterns of Enterprise Application Architecture』** マーティン・ファウラー著
  - 第9章: Domain Logic Patterns
  - Transaction Script (110-115ページ)

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - PofEAAのトランザクションスクリプト |
