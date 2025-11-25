---
name: requirements-engineering
description: |
  カール・ウィーガーズの要求工学理論に基づく体系的な要件定義スキル。
  曖昧な要望を検証可能な要件に変換し、プロジェクト成功の基盤を構築します。

  専門分野:
  - 要求トリアージ: 優先順位付け、スコープ確定、実現可能性評価
  - 曖昧性除去: 定量化、明確化、具体化による検証可能な要件への変換
  - 完全性確保: 正常系、異常系、境界値の網羅的カバレッジ
  - 追跡可能性: 要件→設計→実装→テストの一貫したトレーサビリティ

  使用タイミング:
  - 新機能の要件を定義する時
  - 曖昧な要望を構造化する時
  - 要件の優先順位を決定する時
  - 要件の品質を検証する時

  Use proactively when users need to define requirements, clarify ambiguous requests,
  prioritize features, or ensure requirements quality.
version: 1.0.0
---

# Requirements Engineering

## 概要

このスキルは、カール・ウィーガーズが提唱した要求工学の体系的手法に基づき、
曖昧な要望を検証可能な要件に変換するための方法論を提供します。

**核心概念**:
- **曖昧性の排除**: 「〜など」「適切に」「良い感じに」などの定性的表現を定量化
- **検証可能性**: すべての要件はテスト可能な受け入れ基準を持つべき
- **完全性**: 正常系、異常系、境界値すべてをカバー
- **追跡可能性**: 要件→設計→実装→テストの一貫したトレーサビリティ

**主要な価値**:
- 手戻りの大幅削減（要件定義フェーズでの曖昧性排除）
- ステークホルダー間の認識齟齬防止
- テスト可能な要件による品質保証

## リソース構造

```
requirements-engineering/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── triage-framework.md                     # 要求トリアージの詳細手法
│   ├── ambiguity-detection.md                  # 曖昧性検出パターンと除去技法
│   ├── completeness-checklist.md               # 完全性確認チェックリスト
│   └── quality-criteria.md                     # 要件品質基準
├── scripts/
│   └── validate-requirements.mjs               # 要件ドキュメント検証スクリプト
└── templates/
    └── requirements-document-template.md       # 要件定義書テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 要求トリアージフレームワーク
cat .claude/skills/requirements-engineering/resources/triage-framework.md

# 曖昧性検出パターン
cat .claude/skills/requirements-engineering/resources/ambiguity-detection.md

# 完全性チェックリスト
cat .claude/skills/requirements-engineering/resources/completeness-checklist.md

# 品質基準
cat .claude/skills/requirements-engineering/resources/quality-criteria.md
```

### スクリプト実行

```bash
# 要件ドキュメントの品質検証
node .claude/skills/requirements-engineering/scripts/validate-requirements.mjs <file.md>
```

### テンプレート参照

```bash
# 要件定義書テンプレート
cat .claude/skills/requirements-engineering/templates/requirements-document-template.md
```

## いつ使うか

### シナリオ1: 新機能の要件定義
**状況**: 新しい機能の開発が必要だが、要件が曖昧

**適用条件**:
- [ ] ユーザーの要望が「〜したい」程度の曖昧さ
- [ ] 具体的な完了条件が未定義
- [ ] ステークホルダー間で認識が統一されていない

**期待される成果**: FR-XXX形式の検証可能な要件定義書

### シナリオ2: 要件の優先順位付け
**状況**: 複数の要件があり、実装順序を決定する必要がある

**適用条件**:
- [ ] 要件数が5件以上
- [ ] リソースや時間に制約がある
- [ ] ステークホルダーの優先度が異なる

**期待される成果**: MoSCoW分類による優先順位付き要件リスト

### シナリオ3: 要件の品質検証
**状況**: 既存の要件定義書の品質を評価したい

**適用条件**:
- [ ] 既存の要件ドキュメントが存在
- [ ] 実装前の品質確認が必要
- [ ] レビュー基準が明確でない

**期待される成果**: 品質評価レポートと改善提案

## ワークフロー

### Phase 1: 要求の収集とトリアージ

**目的**: 要望を収集し、優先順位を付ける

**ステップ**:
1. ステークホルダーからの要望収集
2. 要求の初期分類（機能/非機能）
3. MoSCoW法による優先順位付け
4. リスクと依存関係の評価

**判断基準**:
- [ ] すべての要求が収集されたか？
- [ ] 優先順位が明確か？
- [ ] 依存関係が特定されているか？

**リソース**: `resources/triage-framework.md`

### Phase 2: 曖昧性の検出と除去

**目的**: 曖昧な表現を検出し、具体化する

**ステップ**:
1. 曖昧性パターンの検出
   - 量的曖昧性: 「多い」「速い」「大きい」
   - 質的曖昧性: 「使いやすい」「適切に」
   - 範囲の曖昧性: 「など」「等」
   - 条件の曖昧性: 「場合によって」
2. 明確化の質問設計
3. 定量化・具体化

**判断基準**:
- [ ] 曖昧な表現がすべて検出されているか？
- [ ] 各表現が具体的な基準に変換されているか？
- [ ] 測定方法が明示されているか？

**リソース**: `resources/ambiguity-detection.md`

### Phase 3: 要件の構造化と文書化

**目的**: 要件を標準形式で文書化する

**ステップ**:
1. 機能要件の記述（FR-XXX形式）
2. 非機能要件の記述（NFR-XXX形式）
3. 受け入れ基準の定義
4. トレーサビリティマトリクスの作成

**判断基準**:
- [ ] すべての要件にIDが付与されているか？
- [ ] 受け入れ基準がテスト可能か？
- [ ] 追跡可能性が確保されているか？

**リソース**: `templates/requirements-document-template.md`

### Phase 4: 品質検証

**目的**: 要件の品質を検証する

**ステップ**:
1. 明確性の検証（一意に解釈可能か）
2. 完全性の検証（正常系・異常系・境界値）
3. 一貫性の検証（矛盾がないか）
4. 検証可能性の確認

**判断基準**:
- [ ] すべての品質基準を満たしているか？
- [ ] レビュー指摘が解消されているか？

**リソース**: `resources/quality-criteria.md`

## ベストプラクティス

### すべきこと

1. **5W1Hで確認**:
   - Why: なぜこの機能が必要か
   - Who: 誰が使うか
   - What: 何を実現したいか
   - When: いつ使うか
   - Where: どこで使うか
   - How: どのように使うか

2. **検証可能な基準を定義**:
   - 「速い」→「200ms以内」
   - 「使いやすい」→「3クリック以内で完了」
   - 「多くの」→「1000件以上」

3. **境界値を明確化**:
   - 最小値、最大値、空、NULL
   - 正常系だけでなく異常系も

### 避けるべきこと

1. **曖昧な表現**:
   - ❌ 「高速に」「適切に」「など」
   - ✅ 具体的な数値と単位

2. **推測や仮定**:
   - ❌ 「おそらく〜だろう」
   - ✅ 確認して明示

3. **スコープクリープ**:
   - ❌ 要件定義中に範囲を拡大
   - ✅ スコープを固定してから詳細化

## 関連スキル

- **use-case-modeling** (`.claude/skills/use-case-modeling/SKILL.md`): ユースケース記述
- **acceptance-criteria-writing** (`.claude/skills/acceptance-criteria-writing/SKILL.md`): 受け入れ基準
- **interview-techniques** (`.claude/skills/interview-techniques/SKILL.md`): ヒアリング技法
- **functional-non-functional-requirements** (`.claude/skills/functional-non-functional-requirements/SKILL.md`): 要件分類

## メトリクス

### 曖昧性スコア
**測定方法**: 曖昧な表現の数
**目標**: 0（曖昧な表現がない状態）

### 完全性スコア
**測定方法**: カバーされたシナリオ数 / 必要なシナリオ数
**目標**: >95%

### 検証可能性スコア
**測定方法**: テスト可能な要件数 / 総要件数
**目標**: 100%

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - カール・ウィーガーズの要求工学理論に基づく |

## 参考文献

- **『Software Requirements』** Karl Wiegers, Joy Beatty著
  - Part II: Requirements Development
  - Chapter 8: Understanding User Requirements
  - Chapter 10: Documenting the Requirements
