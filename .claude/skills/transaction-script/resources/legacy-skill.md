---
name: .claude/skills/transaction-script/SKILL.md
description: |
  マーティン・ファウラーのPofEAAに基づくトランザクションスクリプトパターンを専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/transaction-script/resources/domain-model-comparison.md`: Domain Model Comparisonリソース
  - `.claude/skills/transaction-script/resources/executor-pattern.md`: Executor Patternリソース
  - `.claude/skills/transaction-script/resources/pattern-overview.md`: Pattern Overviewリソース

  - `.claude/skills/transaction-script/templates/executor-template.md`: Executorテンプレート

  - `.claude/skills/transaction-script/scripts/analyze-executor.mjs`: Analyze Executorスクリプト

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

- ビジネスロジック実装エージェント（.claude/agents/logic-dev.md）
- シンプルな CRUD 操作を実装する開発者
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
- **直接的**: リクエストと処理の 1 対 1 対応
- **変更容易**: 影響範囲が限定的
- **デバッグ容易**: 処理フローが明確

### 欠点

- **重複**: 類似ロジックが各スクリプトに重複しやすい
- **スケール困難**: ロジックが複雑になると管理が困難
- **ドメイン知識分散**: ビジネスルールが散在しやすい

## 適用条件

### トランザクションスクリプトが適切な場合

- [ ] ビジネスロジックがシンプル
- [ ] CRUD 操作が中心
- [ ] ドメインモデルが不要または過剰
- [ ] チームが手続き型に慣れている
- [ ] 短期プロジェクト

### ドメインモデルを検討すべき場合

- [ ] ビジネスルールが複雑
- [ ] 同じルールが複数箇所で必要
- [ ] エンティティ間の関係が複雑
- [ ] 長期的な保守が必要

**詳細**: `resources/domain-model-comparison.md`

## Executor パターン

### 概要

プロジェクト固有のトランザクションスクリプト実装パターンです。
各機能のビジネスロジックを Executor クラスとして実装します。

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
   - ❌ 100 行を超えるスクリプト
   - ✅ 適切に分割して呼び出し

2. **過度な抽象化**:
   - ❌ シンプルなロジックに複雑なパターンを適用
   - ✅ シンプルさを維持

3. **ビジネスルールの散在**:
   - ❌ 同じルールが複数スクリプトに重複
   - ✅ 共通関数に抽出

## 関連スキル

- **.claude/skills/refactoring-techniques/SKILL.md** (`.claude/skills/refactoring-techniques/SKILL.md`): コードの改善
- **.claude/skills/tdd-red-green-refactor/SKILL.md** (`.claude/skills/tdd-red-green-refactor/SKILL.md`): テスト駆動開発
- **.claude/skills/domain-driven-design/SKILL.md** (`.claude/skills/domain-driven-design/SKILL.md`): 複雑なドメインの場合

## 参考文献

- **『Patterns of Enterprise Application Architecture』** マーティン・ファウラー著
  - 第 9 章: Domain Logic Patterns
  - Transaction Script (110-115 ページ)

## 変更履歴

| バージョン | 日付       | 変更内容                                       |
| ---------- | ---------- | ---------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - PofEAA のトランザクションスクリプト |
