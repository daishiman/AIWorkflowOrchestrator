---
name: .claude/skills/knowledge-management/SKILL.md
description: |
  SECIモデル（野中郁次郎）に基づく組織知識の形式知化と共有を専門とするスキル。
  暗黙知を形式知に変換し、体系化することで再利用可能な知識として組織全体で活用可能にします。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/knowledge-management/resources/curation-framework.md`: 知識の収集・評価・統合・更新プロセスと情報源の信頼性評価基準
  - `.claude/skills/knowledge-management/resources/freshness-strategy.md`: 陳腐化検出メカニズム、更新優先順位、定期レビュースケジュール、自動監視
  - `.claude/skills/knowledge-management/resources/quality-assurance.md`: 完全性・明確性・再現性の3軸評価、品質スコア算出、検証プロセス
  - `.claude/skills/knowledge-management/resources/seci-combination.md`: 形式知の統合・体系化プロセス、知識の階層構造設計、参照関係の整理
  - `.claude/skills/knowledge-management/resources/seci-externalization.md`: 暗黙知の言語化・概念化手法、パターン抽象化、検証可能性の確保
  - `.claude/skills/knowledge-management/resources/seci-model-details.md`: SECIサイクルの理論的背景、4フェーズの詳細手順、適用事例とパターン
  - `.claude/skills/knowledge-management/resources/seci-socialization.md`: 暗黙知の源泉特定、情報収集手法、一次情報源の評価基準
  - `.claude/skills/knowledge-management/scripts/validate-knowledge.mjs`: ドキュメント品質の自動検証（必須セクション、ファイルサイズ、陳腐化チェック）
  - `.claude/skills/knowledge-management/scripts/validate-knowledge.sh`: 知識ドキュメントの品質検証シェルスクリプト
  - `.claude/skills/knowledge-management/templates/knowledge-document-template.md`: 標準的な知識文書化テンプレート（SECIモデル準拠）

  専門分野:
  - SECI Model適用: 暗黙知→形式知の変換プロセス設計
  - 知識キュレーション: 収集、評価、統合、更新のフレームワーク
  - 陳腐化防止: 知識の鮮度維持と継続的更新戦略
  - 形式知化基準: 検証可能で再現可能な知識の定義

  使用タイミング:
  - ベストプラクティスやノウハウを文書化する時
  - コードレビューコメントや議論を形式知化する時
  - 経験や勘に基づく暗黙知を明示的な知識に変換する時
  - 知識ベースの品質評価や陳腐化チェックを行う時

  Use proactively when users need to document tacit knowledge, formalize best practices,
version: 1.0.0
---

# Knowledge Management

## 概要

このスキルは、野中郁次郎が提唱したSECIモデル（Socialization-Externalization-Combination-Internalization）に基づき、
組織内の暗黙知を形式知に変換し、体系化して共有可能な知識として組織全体で活用する方法論を提供します。

Claude Codeエコシステムにおいては、エージェント、スキル、コマンドの設計・実装・改善に関する知識を
効率的に蓄積・共有・活用するための基盤となります。

**主要な価値**:

- 個人の経験や勘（暗黙知）を誰でも再現可能な知識（形式知）に変換
- 知識の陳腐化を防ぎ、常に最新の状態を維持
- 知識の再利用性を高め、重複を排除（DRY原則の知識への適用）

**対象ユーザー**:

- スキルやドキュメントを作成するエージェント
- ベストプラクティスを体系化したい開発者
- 知識ベースの品質を維持したいチーム

## リソース構造

```
knowledge-management/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── seci-model-details.md                  # SECIモデルの理論的詳細
│   ├── seci-socialization.md                  # Socialization詳細ガイド
│   ├── seci-externalization.md                # Externalization詳細ガイド
│   ├── seci-combination.md                    # Combination詳細ガイド
│   ├── curation-framework.md                  # 知識キュレーションの詳細プロセス
│   ├── freshness-strategy.md                  # 陳腐化防止の詳細戦略
│   └── quality-assurance.md                   # 品質保証の詳細手法
├── scripts/
│   └── validate-knowledge.sh                  # 知識ドキュメント検証スクリプト
└── templates/
    └── knowledge-document-template.md         # 知識文書化テンプレート
```

### リソース種別

- **SECIモデル関連** (`resources/seci-*.md`): SECIモデルの各フェーズの詳細ガイド
- **キュレーション** (`resources/curation-framework.md`): 知識の収集・評価・統合・更新プロセス
- **品質管理** (`resources/quality-assurance.md`, `freshness-strategy.md`): 品質保証と陳腐化防止
- **検証スクリプト** (`scripts/validate-knowledge.mjs`): ドキュメント品質の自動検証（TypeScript）
- **テンプレート** (`templates/knowledge-document-template.md`): 知識文書化の標準テンプレート

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# SECIモデル詳細を読み取る
cat .claude/skills/knowledge-management/resources/seci-model-details.md

# Socialization（共同化）詳細
cat .claude/skills/knowledge-management/resources/seci-socialization.md

# Externalization（表出化）詳細
cat .claude/skills/knowledge-management/resources/seci-externalization.md

# Combination（連結化）詳細
cat .claude/skills/knowledge-management/resources/seci-combination.md

# キュレーションフレームワーク
cat .claude/skills/knowledge-management/resources/curation-framework.md

# 陳腐化防止戦略
cat .claude/skills/knowledge-management/resources/freshness-strategy.md

# 品質保証ガイド
cat .claude/skills/knowledge-management/resources/quality-assurance.md
```

### スクリプト実行

```bash
# 知識ドキュメントの品質検証（TypeScript）
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs <file.md>

# 複数ファイルの一括検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/knowledge-management/resources/*.md

# 例: SECIモデルドキュメントを検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/knowledge-management/resources/seci-model-details.md
```

### テンプレート参照

```bash
# 知識文書化テンプレートを読み取る
cat .claude/skills/knowledge-management/templates/knowledge-document-template.md

# テンプレートを新しいファイルにコピー
cp .claude/skills/knowledge-management/templates/knowledge-document-template.md ./new-knowledge-doc.md
```

## いつ使うか

### シナリオ1: 暗黙知の形式知化

**状況**: コードレビューで頻繁に指摘される内容があるが、文書化されていない

**適用条件**:

- [ ] 同じ指摘が3回以上繰り返されている
- [ ] 指摘内容が経験や勘に基づいている
- [ ] 明確なルールとして言語化されていない

**期待される成果**: 再現可能なチェックリストやガイドラインとして文書化

### シナリオ2: ベストプラクティスの体系化

**状況**: 散在する情報を体系的に整理したい

**適用条件**:

- [ ] 複数の情報源（書籍、ドキュメント、経験）が存在
- [ ] 情報間の関連性が不明確
- [ ] 一貫性のある知識体系が必要

**期待される成果**: 統合された知識ベースとして整理

### シナリオ3: 知識の陳腐化防止

**状況**: 既存ドキュメントが古くなり、信頼性が低下している

**適用条件**:

- [ ] 最終更新から6ヶ月以上経過
- [ ] 参照する技術のバージョンが古い
- [ ] 非推奨のAPIやパターンを含む

**期待される成果**: 更新プロセスとバージョニング戦略の確立

## 前提条件

### 必要な知識

- [ ] SECIモデルの基本概念理解（暗黙知・形式知・知識変換）
- [ ] ドキュメンテーションの基本スキル（Markdown、構造化ライティング）

### 必要なツール

- Read: 既存情報源の読み込み
- Write: SKILL.mdやドキュメントの作成
- Grep: パターン抽出、重複チェック

### 環境要件

- `.claude/skills/`ディレクトリが存在する
- 参照する情報源（ドキュメント、コード）が利用可能

## ワークフロー

### Phase 1: 暗黙知の特定と収集 (Socialization)

**目的**: 形式知化すべき暗黙知を特定し、収集する

**ステップ**:

1. **暗黙知の源泉特定**:
   - コードレビューコメント履歴
   - チーム内議論・会話
   - 専門家の実践経験
   - 頻出する問題とその解決パターン

2. **情報収集**:
   - 関連ドキュメントの読み込み
   - コードパターンの抽出
   - ベストプラクティス事例の収集

**判断基準**:

- [ ] 一次情報源が特定されているか？
- [ ] 情報の信頼性が評価されているか？
- [ ] 十分な情報量が収集されているか？

**リソース**: `resources/seci-socialization.md`

### Phase 2: 暗黙知の言語化と概念化 (Externalization)

**目的**: 暗黙知を明示的な言語で表現し、概念として整理する

**ステップ**:

1. **言語化**:
   - 経験や勘を言葉で表現
   - パターンを抽象化
   - 原則を抽出

2. **概念化**:
   - カテゴリ分類
   - 体系的整理
   - チェックリスト化

3. **検証可能性の確保**:
   - 判断基準の明確化
   - 測定可能な指標の定義
   - 再現性の確認

**判断基準**:

- [ ] 暗黙知が明示的な言語で表現されているか？
- [ ] 他者が再現可能な形式になっているか？
- [ ] 抽象的すぎず、具体的すぎない適切な粒度か？
- [ ] 検証可能な基準が含まれているか？

**リソース**: `resources/seci-externalization.md`

### Phase 3: 形式知の統合と体系化 (Combination)

**目的**: 複数の形式知を組み合わせて新しい知識体系を構築する

**ステップ**:

1. **知識の統合**:
   - 複数情報源の組み合わせ
   - 矛盾の解消
   - 関連性の明確化

2. **体系化**:
   - 階層構造の設計
   - トピック別分類
   - 参照関係の整理

3. **ドキュメント化**:
   - SKILL.mdまたはドキュメントの作成
   - リソースファイルの分割（必要に応じて）
   - メタデータの定義

**判断基準**:

- [ ] 知識が体系的に整理されているか？
- [ ] 重複が排除されているか？
- [ ] 参照関係が明確か？

**リソース**: `resources/seci-combination.md`

### Phase 4: 知識の品質保証と継続的改善 (Internalization)

**目的**: 形式知化された知識を実践で活用し、フィードバックループを確立する

**ステップ**:

1. **品質評価**:
   - 完全性の確認
   - 明確性の評価
   - 実用性の検証

2. **陳腐化検出**:
   - 最終更新日の確認
   - 技術バージョンの確認
   - 参照頻度の分析

3. **更新プロセス**:
   - バージョニング戦略
   - 変更履歴の記録
   - 定期レビューサイクル

**判断基準**:

- [ ] 品質基準を満たしているか？
- [ ] 陳腐化検出メカニズムが存在するか？
- [ ] 更新プロセスが定義されているか？

**リソース**: `resources/quality-assurance.md`

## リソースへの参照

詳細な知識は以下のリソースファイルを参照してください:

- **SECIモデル詳細**: `resources/seci-model-details.md`
  - SECIサイクルの理論的背景
  - 各フェーズの詳細手順
  - 適用事例とパターン

- **知識キュレーションフレームワーク**: `resources/curation-framework.md`
  - 収集・評価・統合・更新の詳細プロセス
  - 情報源の信頼性評価基準
  - 品質スコアリングシステム

- **陳腐化防止戦略**: `resources/freshness-strategy.md`
  - 陳腐化検出の具体的基準
  - 更新トリガーとサイクル
  - バージョニング戦略

## ベストプラクティス

### すべきこと

1. **一次情報源を優先**:
   - 公式ドキュメントや書籍を優先的に参照
   - 二次情報は信頼性を評価してから使用

2. **再現可能性を確保**:
   - 手順を段階的に記述
   - 判断基準を明確化
   - チェックリスト形式で提供

3. **定期的な更新**:
   - 6ヶ月ごとのレビューサイクル
   - バージョニングによる変更追跡
   - 陳腐化検出の自動化

### 避けるべきこと

1. **過度に具体的な記述**:
   - ❌ 特定のコード実装に固執
   - ✅ 原則と判断基準を提供し、AIに技術選択を委ねる

2. **暗黙的な前提**:
   - ❌ 「常識的に考えれば分かる」という表現
   - ✅ すべての前提を明示的に記述

3. **静的な知識**:
   - ❌ 作成して放置
   - ✅ 継続的な更新とフィードバックループ

## トラブルシューティング

### 問題1: 暗黙知の言語化が困難

**症状**: 経験や勘を言葉で表現できない

**原因**: 思考プロセスが無意識化している

**解決策**:

1. 具体的な事例から始める
2. 「なぜそう判断したか」を繰り返し自問
3. パターンを抽出して抽象化

**予防策**: 日常的に判断プロセスを言語化する習慣

### 問題2: 形式知化した知識が使われない

**症状**: ドキュメントを作成したが参照されない

**原因**:

- 発見可能性が低い
- 内容が実用的でない
- 抽象度が適切でない

**解決策**:

1. descriptionにトリガーキーワードを含める
2. 具体的な使用シナリオを明示
3. 判断基準とチェックリストを提供

**予防策**: Progressive Disclosureスキルと併用

### 問題3: 知識の陳腐化

**症状**: 古い情報が含まれ、信頼性が低下

**原因**: 更新プロセスが未定義

**解決策**:

1. 陳腐化検出基準を定義
2. 定期レビューサイクルを設定
3. バージョニングで変更を追跡

**予防策**: Internalizationフェーズの実践

## 関連スキル

- **.claude/skills/progressive-disclosure/SKILL.md** (`.claude/skills/progressive-disclosure/SKILL.md`): 知識の段階的提供による効率化
- **.claude/skills/documentation-architecture/SKILL.md** (`.claude/skills/documentation-architecture/SKILL.md`): ドキュメント構造設計
- **.claude/skills/best-practices-curation/SKILL.md** (`.claude/skills/best-practices-curation/SKILL.md`): ベストプラクティスの収集と管理
- **.claude/skills/context-optimization/SKILL.md** (`.claude/skills/context-optimization/SKILL.md`): トークン効率化

## メトリクス

### 知識品質スコア

**評価基準**:

- 完全性: 必要な情報がすべて含まれているか (0-10点)
- 明確性: 理解しやすいか (0-10点)
- 再現性: 他者が再現可能か (0-10点)
- 鮮度: 情報が最新か (0-10点)

**目標**: 平均8点以上

### 陳腐化率

**測定方法**: (陳腐化した知識数 / 総知識数) × 100

**目標**: <10%

### 再利用率

**測定方法**: (参照された知識数 / 総知識数) × 100

**目標**: >70%

## 変更履歴

| バージョン | 日付       | 変更内容                                            |
| ---------- | ---------- | --------------------------------------------------- |
| 1.0.0      | 2025-11-23 | 初版作成 - SECIモデルに基づく知識管理フレームワーク |

## 使用上の注意

### このスキルが得意なこと

- 暗黙知の形式知化（経験やノウハウの文書化）
- 知識の体系化と統合
- 陳腐化防止と品質維持

### このスキルが行わないこと

- 具体的なコード実装
- プロジェクト固有のビジネスロジック
- 実際のスキルファイルの作成（それは.claude/agents/skill-librarian.mdエージェントの役割）

### 推奨される使用フロー

1. 暗黙知の特定（Socialization）
2. 言語化と概念化（Externalization）
3. 統合と体系化（Combination）
4. 品質保証と継続的改善（Internalization）

### 参考文献

- **『知識創造企業』** 野中郁次郎・竹内弘高著
  - 第3章: 知識創造の理論（SECIモデル）
  - 第5章: 知識創造を促進する組織

- **『Building a Second Brain』** Tiago Forte著
  - Part 1: Capture, Organize, Distill, Express
