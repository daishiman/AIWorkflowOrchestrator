---
name: functional-non-functional-requirements
description: |
  機能要件と非機能要件の分類と定義スキル。要件を適切なカテゴリに分類し、
  漏れなく体系的に管理するための方法論を提供します。

  専門分野:
  - 機能要件定義: システムが「何をするか」の明確化
  - 非機能要件定義: システムが「どのように動作するか」の明確化
  - 品質特性: FURPS+やISO 25010に基づく品質モデル
  - 測定可能性: 非機能要件の定量化

  使用タイミング:
  - 要件を機能/非機能に分類する時
  - 非機能要件を定義する時
  - 品質特性を網羅的に確認する時
  - 見落としがちな要件を発見する時

  Use proactively when users need to classify requirements, define non-functional requirements,
  or ensure comprehensive coverage of quality attributes.
version: 1.0.0
---

# Functional and Non-Functional Requirements

## 概要

このスキルは、機能要件と非機能要件を適切に分類し、
網羅的に定義するための方法論を提供します。
特に見落としがちな非機能要件の発見と定量化に焦点を当てます。

**核心概念**:
- **機能要件**: システムが「何をするか」
- **非機能要件**: システムが「どのように動作するか」
- **品質特性**: パフォーマンス、セキュリティ、可用性など
- **測定可能性**: すべての非機能要件は測定可能であるべき

**主要な価値**:
- 要件の見落とし防止
- 品質特性の網羅的なカバレッジ
- 非機能要件の明確な定義

## リソース構造

```
functional-non-functional-requirements/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── classification-guide.md                 # 分類判断ガイド
│   ├── quality-attributes.md                   # 品質特性カタログ
│   ├── nfr-templates.md                        # 非機能要件テンプレート集
│   └── measurement-guide.md                    # 測定方法ガイド
├── scripts/
│   └── check-nfr-coverage.mjs                  # 非機能要件カバレッジチェック
└── templates/
    └── nfr-definition-template.md              # 非機能要件定義テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 分類判断ガイド
cat .claude/skills/functional-non-functional-requirements/resources/classification-guide.md

# 品質特性カタログ
cat .claude/skills/functional-non-functional-requirements/resources/quality-attributes.md

# 非機能要件テンプレート
cat .claude/skills/functional-non-functional-requirements/resources/nfr-templates.md

# 測定方法ガイド
cat .claude/skills/functional-non-functional-requirements/resources/measurement-guide.md
```

### テンプレート参照

```bash
# 非機能要件定義テンプレート
cat .claude/skills/functional-non-functional-requirements/templates/nfr-definition-template.md
```

## いつ使うか

### シナリオ1: 要件の分類
**状況**: 収集した要件を機能/非機能に分類する

**適用条件**:
- [ ] 要件リストが存在
- [ ] 分類基準が不明確
- [ ] 体系的な整理が必要

**期待される成果**: 分類された要件リスト（FR/NFR）

### シナリオ2: 非機能要件の洗い出し
**状況**: 見落としがちな非機能要件を発見する

**適用条件**:
- [ ] 機能要件は定義済み
- [ ] 非機能要件が不十分
- [ ] 品質特性の網羅性を確認したい

**期待される成果**: NFR-XXX形式の非機能要件リスト

### シナリオ3: 非機能要件の定量化
**状況**: 曖昧な非機能要件を測定可能な形に変換

**適用条件**:
- [ ] 「高速」「安全」などの曖昧な表現
- [ ] 測定方法が未定義
- [ ] 検証可能な基準が必要

**期待される成果**: 測定可能な非機能要件定義

## ワークフロー

### Phase 1: 要件の分類

**目的**: 要件を機能/非機能に分類する

**分類判断フロー**:
```
この要件は？
├─ ユーザーの操作に対する応答 → 機能要件
├─ データの入出力・変換 → 機能要件
├─ ビジネスルール・計算 → 機能要件
├─ システムの品質特性 → 非機能要件
├─ セキュリティ・認証 → 非機能要件
└─ 保守性・拡張性 → 非機能要件
```

**判断基準**:
- [ ] すべての要件が分類されているか？
- [ ] 分類の根拠が明確か？

**リソース**: `resources/classification-guide.md`

### Phase 2: 非機能要件カテゴリの確認

**目的**: 必要な非機能要件カテゴリを網羅的に確認

**品質特性カタログ（FURPS+ベース）**:

1. **パフォーマンス（Performance）**:
   - 応答時間
   - スループット
   - リソース使用率

2. **スケーラビリティ（Scalability）**:
   - 同時ユーザー数
   - データ量
   - トランザクション量

3. **セキュリティ（Security）**:
   - 認証・認可
   - データ暗号化
   - 監査ログ

4. **可用性（Availability）**:
   - 稼働率（SLA）
   - MTBF / MTTR
   - 障害復旧

5. **保守性（Maintainability）**:
   - コードの可読性
   - テストカバレッジ
   - ドキュメント

6. **ユーザビリティ（Usability）**:
   - 学習容易性
   - エラー回復
   - アクセシビリティ

7. **互換性（Compatibility）**:
   - ブラウザ対応
   - OS対応
   - API互換性

**判断基準**:
- [ ] すべてのカテゴリが検討されたか？
- [ ] 必要なカテゴリが特定されたか？

**リソース**: `resources/quality-attributes.md`

### Phase 3: 非機能要件の定義

**目的**: 各非機能要件を測定可能な形で定義

**定義フォーマット**:
```markdown
## 非機能要件: [NFR-XXX] [カテゴリ: 性能]

**指標**: [測定可能な指標]
**目標値**: [具体的な数値]
**測定方法**: [どうやって測るか]
**重要度**: [Critical/High/Medium/Low]
**理由**: [なぜこの目標値か]
```

**例**:
```markdown
## 非機能要件: NFR-001 [パフォーマンス]

**指標**: API応答時間
**目標値**: 200ms以内（95パーセンタイル）
**測定方法**: APMツールによる計測
**重要度**: High
**理由**: ユーザー体験に直接影響するため
```

**判断基準**:
- [ ] すべての非機能要件が定量化されているか？
- [ ] 測定方法が明確か？
- [ ] 重要度が設定されているか？

**リソース**: `resources/nfr-templates.md`

### Phase 4: 検証可能性の確認

**目的**: 非機能要件がテスト可能であることを確認

**確認事項**:
1. **測定可能性**: 具体的な数値目標がある
2. **観測可能性**: 結果を観測できる
3. **再現可能性**: 同じ条件で再現できる
4. **判定可能性**: 合格/不合格が明確

**判断基準**:
- [ ] すべての非機能要件がテスト可能か？
- [ ] 測定ツール・方法が特定されているか？

**リソース**: `resources/measurement-guide.md`

## 機能要件 vs 非機能要件

### 機能要件（Functional Requirements）
- システムが「何をするか」
- ユーザーの操作に対する応答
- ビジネスルールと計算ロジック
- データの入出力

**記述形式**:
```markdown
## 機能要件: [FR-XXX] [機能名]

**概要**: [1文での説明]
**詳細**:
- システムは[条件]の時、[動作]する
- 入力: [入力データ]
- 処理: [処理内容]
- 出力: [出力データ]
**ビジネスルール**: [ルール]
```

### 非機能要件（Non-Functional Requirements）
- システムが「どのように動作するか」
- 品質特性（性能、セキュリティ等）
- 制約条件

**記述形式**:
```markdown
## 非機能要件: [NFR-XXX] [カテゴリ]

**指標**: [測定対象]
**目標値**: [数値]
**測定方法**: [方法]
**重要度**: [レベル]
```

## 品質特性チェックリスト

### パフォーマンス
- [ ] 応答時間の目標は定義されているか？
- [ ] スループットの目標は定義されているか？
- [ ] リソース使用率の上限は定義されているか？

### セキュリティ
- [ ] 認証方式は定義されているか？
- [ ] 認可ルールは定義されているか？
- [ ] データ暗号化の要件は定義されているか？

### 可用性
- [ ] SLAは定義されているか？
- [ ] 障害復旧の目標は定義されているか？
- [ ] バックアップ要件は定義されているか？

### 保守性
- [ ] テストカバレッジ目標は定義されているか？
- [ ] ドキュメント要件は定義されているか？

### ユーザビリティ
- [ ] アクセシビリティ要件は定義されているか？
- [ ] 対応言語は定義されているか？

### 互換性
- [ ] 対応ブラウザは定義されているか？
- [ ] 対応デバイスは定義されているか？

## ベストプラクティス

### すべきこと

1. **すべて定量化**:
   - ✅ 「応答時間200ms以内」
   - ❌ 「高速に動作する」

2. **測定方法を明記**:
   - ✅ 「APMツールで95パーセンタイルを計測」
   - ❌ 「適切に測定する」

3. **理由を記録**:
   - なぜその目標値なのか
   - ビジネス上の根拠

### 避けるべきこと

1. **曖昧な表現**:
   - ❌ 「十分な」「適切な」「高い」

2. **測定不能な要件**:
   - ❌ 「ユーザーフレンドリー」
   - ✅ 「3クリック以内で目的の操作が完了」

3. **非機能要件の見落とし**:
   - セキュリティ、可用性は特に見落としやすい

## 関連スキル

- **requirements-engineering** (`.claude/skills/requirements-engineering/SKILL.md`): 要件工学
- **acceptance-criteria-writing** (`.claude/skills/acceptance-criteria-writing/SKILL.md`): 受け入れ基準
- **use-case-modeling** (`.claude/skills/use-case-modeling/SKILL.md`): ユースケース

## メトリクス

### 分類完了率
**測定方法**: (分類済み要件数 / 総要件数) × 100
**目標**: 100%

### 非機能要件カバレッジ
**測定方法**: (定義されたカテゴリ数 / 必要なカテゴリ数) × 100
**目標**: >80%

### 定量化率
**測定方法**: (測定可能な非機能要件数 / 総非機能要件数) × 100
**目標**: 100%

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 |

## 参考文献

- **『Software Requirements』** Karl Wiegers著 - Chapter 12: Documenting the Requirements
- **ISO/IEC 25010:2011** - Systems and software Quality Requirements and Evaluation (SQuaRE)
- **FURPS+** - Grady & Caswell, HP Software Quality Model
