---
name: dependency-analysis
description: |
    ソフトウェアの依存関係分析と循環参照検出を専門とするスキル。
    依存関係グラフの構築、循環依存の検出、安定度メトリクスの算出により、
    アーキテクチャの健全性を評価します。
    専門分野:
    - 依存関係グラフ構築: インポート文解析、モジュール間依存の可視化
    - 循環依存検出: 閉路検出アルゴリズム、解消方針の提案
    - 安定度メトリクス: 求心性（Ca）、遠心性（Ce）、不安定度（I）
    - パッケージ設計原則: 安定依存の原則（SDP）、安定抽象の原則（SAP）
    使用タイミング:
    - モジュール間の依存関係を可視化する時
    - 循環参照を検出・解消する時
    - アーキテクチャの安定性を評価する時
    - リファクタリングの影響範囲を分析する時
    Use proactively when analyzing dependencies, detecting circular references,
    or evaluating architecture stability metrics.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/dependency-analysis/resources/circular-dependency.md`: 循環依存の検出アルゴリズムと解消方針パターン
  - `.claude/skills/dependency-analysis/resources/dependency-graph.md`: 依存関係グラフの構築手法とトポロジカルソート
  - `.claude/skills/dependency-analysis/resources/stability-metrics.md`: 求心性、遠心性、不安定度、メインシーケンスの詳細解説
  - `.claude/skills/dependency-analysis/templates/dependency-report.md`: 依存関係分析レポート作成テンプレート
  - `.claude/skills/dependency-analysis/scripts/analyze-dependencies.mjs`: モジュール依存関係分析と循環検出スクリプト

version: 1.0.0
---


# Dependency Analysis

## 概要

このスキルは、ソフトウェアの依存関係を体系的に分析し、
アーキテクチャの健全性を評価するための知識を提供します。

**核心概念**:
依存関係の管理は、ソフトウェアの保守性と拡張性の基盤である。
循環依存は技術的負債の主要な原因であり、早期検出と解消が重要。

**主要な価値**:
- 依存関係の可視化による全体像の把握
- 循環依存の検出と解消による保守性向上
- 安定度メトリクスによる定量的評価
- リファクタリング影響範囲の予測

**対象ユーザー**:
- アーキテクチャレビューを行う@arch-police
- リファクタリングを計画する開発者
- 技術的負債を管理するチーム

## リソース構造

```
dependency-analysis/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── graph-construction.md                   # 依存関係グラフ構築手法
│   ├── cycle-detection.md                      # 循環依存検出アルゴリズム
│   ├── stability-metrics.md                    # 安定度メトリクスの詳細
│   └── package-principles.md                   # パッケージ設計原則
├── scripts/
│   └── analyze-dependencies.mjs                # 依存関係分析スクリプト
└── templates/
    └── dependency-report.md                    # 分析レポートテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 依存関係グラフ構築手法
cat .claude/skills/dependency-analysis/resources/graph-construction.md

# 循環依存検出アルゴリズム
cat .claude/skills/dependency-analysis/resources/cycle-detection.md

# 安定度メトリクスの詳細
cat .claude/skills/dependency-analysis/resources/stability-metrics.md

# パッケージ設計原則
cat .claude/skills/dependency-analysis/resources/package-principles.md
```

### スクリプト実行

```bash
# 依存関係分析スクリプト
node .claude/skills/dependency-analysis/scripts/analyze-dependencies.mjs src/

# 循環依存のみ検出
node .claude/skills/dependency-analysis/scripts/analyze-dependencies.mjs src/ --cycles-only

# 特定モジュールの依存分析
node .claude/skills/dependency-analysis/scripts/analyze-dependencies.mjs src/features/
```

## 依存関係グラフ

### グラフ構築手法

**ノード**: ファイル、モジュール、パッケージ
**エッジ**: インポート文による依存関係

**データ収集**:
```bash
# TypeScript/JavaScriptのインポート文抽出
grep -rh "^import\|^export.*from" src/ | sort | uniq

# 依存先の抽出
grep -oh "from '[^']*'\|from \"[^\"]*\"" src/**/*.ts
```

### グラフの表現

**隣接リスト形式**:
```
moduleA → [moduleB, moduleC]
moduleB → [moduleD]
moduleC → [moduleD]
moduleD → []
```

**マトリクス形式**:
```
        A  B  C  D
    A   0  1  1  0
    B   0  0  0  1
    C   0  0  0  1
    D   0  0  0  0
```

## 循環依存の検出

### 定義

**循環依存**: A → B → C → A のような閉路を形成する依存関係

### 検出アルゴリズム

**深さ優先探索（DFS）によるサイクル検出**:
1. 各ノードを未訪問、訪問中、訪問済みの状態で管理
2. DFSで探索中に「訪問中」のノードに再訪すればサイクル
3. すべての開始点からDFSを実行

**Tarjanの強連結成分分解**:
- 2つ以上のノードを含む強連結成分がサイクル

### 循環依存の種類

**1. 直接循環（A ⇄ B）**:
- 2つのモジュールが相互依存
- 最も検出しやすい

**2. 間接循環（A → B → C → A）**:
- 3つ以上のモジュールが循環
- 発見が困難

**3. パッケージレベル循環**:
- パッケージ間の循環
- 影響が広範囲

### 解消方針

**方針1: 共通部分の抽出**
```
Before: A ⇄ B
After:  A → Common ← B
```
共通の依存部分を新モジュールに抽出

**方針2: 依存の一方向化**
```
Before: A → B → A
After:  A → B, A → C ← B
```
インターフェースを導入して依存を逆転

**方針3: イベント駆動**
```
Before: A → B → A
After:  A → Event ← B
```
イベントバスで間接的に通信

**方針4: マージ**
```
Before: A ⇄ B
After:  AB (merged module)
```
本質的に1つの責務なら統合

## 安定度メトリクス

### 基本メトリクス

**求心性（Ca: Afferent Coupling）**:
- このコンポーネントに依存するコンポーネント数
- 高いほど「責任が重い」

**遠心性（Ce: Efferent Coupling）**:
- このコンポーネントが依存するコンポーネント数
- 高いほど「依存が多い」

### 派生メトリクス

**不安定度（I: Instability）**:
```
I = Ce / (Ca + Ce)
```
- I = 0: 完全に安定（依存されるのみ）
- I = 1: 完全に不安定（依存するのみ）

**抽象度（A: Abstractness）**:
```
A = (抽象クラス・インターフェース数) / (総クラス数)
```
- A = 0: 完全に具象
- A = 1: 完全に抽象

### メインシーケンス

**理想的な関係**: A + I = 1

```
     A
     1 ┌────────────────────────┐
       │ Zone of Uselessness   │
       │                       │
   0.5 │         ★ Ideal      │
       │                       │
       │ Zone of Pain         │
     0 └────────────────────────┘
       0        0.5           1  I
```

**Zone of Pain（苦痛領域）**: 低抽象度 + 高安定度
- 変更困難だが具象的
- 変更が必要な時に痛みが大きい

**Zone of Uselessness（無用領域）**: 高抽象度 + 低安定度
- 抽象的だが使われない
- 過度な設計の兆候

### メインシーケンスからの距離

```
D = |A + I - 1|
```
- D = 0: 理想的
- D > 0.5: 設計の見直しが必要

## パッケージ設計原則

### 安定依存の原則（SDP）

**定義**: 安定度が高い方向にのみ依存すべき

**解釈**:
- 不安定なコンポーネントが安定したコンポーネントに依存: ✅
- 安定したコンポーネントが不安定なコンポーネントに依存: ❌

**検証方法**:
1. 各コンポーネントの不安定度(I)を算出
2. 依存先のIが自身のI以下かを確認

### 安定抽象の原則（SAP）

**定義**: 安定度に比例して抽象度を高くすべき

**解釈**:
- 安定したコンポーネントは抽象的であるべき
- 不安定なコンポーネントは具象的でよい

**検証方法**:
1. 各コンポーネントのI, Aを算出
2. メインシーケンスからの距離Dを計算

## ワークフロー

### Phase 1: 依存関係の収集

**目的**: プロジェクトの依存関係を網羅的に収集

**ステップ**:
1. ソースコードのスキャン
2. インポート文の抽出
3. 依存関係のマッピング

**検出パターン**:
```bash
# TypeScript/JavaScript
grep -rh "^import\|^export.*from" src/

# Python
grep -rh "^import\|^from.*import" src/
```

**判断基準**:
- [ ] すべてのソースファイルがスキャンされたか？
- [ ] 動的インポートも考慮されたか？
- [ ] 外部依存と内部依存が区別されたか？

### Phase 2: グラフ構築と分析

**目的**: 依存関係グラフを構築し、構造を分析

**ステップ**:
1. ノードとエッジの定義
2. グラフデータ構造の構築
3. トポロジカルソート（可能なら）
4. 強連結成分の検出

**判断基準**:
- [ ] グラフが正しく構築されたか？
- [ ] 孤立ノードは存在しないか？
- [ ] レイヤー構造と整合しているか？

### Phase 3: 循環依存の検出

**目的**: 循環依存を特定し、影響を評価

**ステップ**:
1. サイクル検出アルゴリズムの実行
2. サイクルに含まれるノードの特定
3. 影響範囲の評価
4. 優先順位付け

**判断基準**:
- [ ] すべてのサイクルが検出されたか？
- [ ] サイクルの長さと影響が評価されたか？
- [ ] 解消優先順位が決定されたか？

### Phase 4: メトリクス算出

**目的**: 安定度メトリクスを算出し、健全性を評価

**ステップ**:
1. 各コンポーネントのCa, Ceを算出
2. 不安定度(I)、抽象度(A)を計算
3. メインシーケンスからの距離(D)を算出
4. 異常値の特定

**判断基準**:
- [ ] メトリクスが正しく算出されたか？
- [ ] 異常値（D > 0.5）が特定されたか？
- [ ] SDPとSAPが守られているか？

### Phase 5: レポート生成

**目的**: 分析結果を構造化してレポート

**ステップ**:
1. エグゼクティブサマリー
2. 循環依存のリスト
3. メトリクス一覧
4. 是正提案

## ベストプラクティス

### すべきこと

1. **定期的な分析**:
   - CIで依存関係チェックを自動化
   - 新しい循環依存を検出したら即座に対処

2. **視覚化の活用**:
   - 依存関係図を定期的に更新
   - チームで共有

3. **段階的な改善**:
   - 最も影響の大きい循環から解消
   - 小さな改善を継続

### 避けるべきこと

1. **循環依存の放置**:
   - ❌ 「動いているから問題ない」
   - ✅ 早期に検出し、計画的に解消

2. **過度な依存**:
   - ❌ すべてのモジュールが相互に依存
   - ✅ 明確なレイヤー構造と依存方向

## トラブルシューティング

### 問題1: 大量の循環依存

**症状**: 多数のサイクルが検出される

**原因**: アーキテクチャの腐敗、設計の不在

**解決策**:
1. 最も影響の大きいサイクルから対処
2. レイヤー構造の再設計を検討
3. 段階的にリファクタリング

### 問題2: 不安定なコアモジュール

**症状**: コアモジュールのI値が高い

**原因**: コアが外部に過度に依存

**解決策**:
1. 依存の方向を逆転（DIP適用）
2. インターフェースの導入
3. 外部依存をアダプターに隔離

### 問題3: 苦痛領域のモジュール

**症状**: 低A、低IでDが大きい

**原因**: 具象的だが多くから依存される

**解決策**:
1. 抽象化の導入（インターフェース）
2. 責務の分割
3. 安定部分の抽出

## 関連スキル

- **clean-architecture-principles** (`.claude/skills/clean-architecture-principles/SKILL.md`): 依存関係ルール
- **solid-principles** (`.claude/skills/solid-principles/SKILL.md`): DIPの詳細
- **code-smell-detection** (`.claude/skills/code-smell-detection/SKILL.md`): 構造的問題の検出

## メトリクス

### 依存関係健全性スコア

**評価基準**:
- 循環依存数: 0が理想
- 平均不安定度偏差: 0.2以下が理想
- メインシーケンス距離: 0.5以下が理想

### 改善進捗

**測定方法**: (解消されたサイクル数 / 初期サイクル数) × 100

**目標**: 毎月10%以上改善

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - 依存関係分析の体系化 |

## 参考文献

- **『Clean Architecture』** Robert C. Martin著
  - Chapter 14: Component Coupling
  - Chapter 20: Business Rules
- **『アジャイルソフトウェア開発の奥義』** Robert C. Martin著
  - Chapter 20: The Package Design Principles
