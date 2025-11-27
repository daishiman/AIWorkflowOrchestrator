---
name: chain-of-thought-reasoning
description: |
  Chain-of-Thought（思考の連鎖）推論パターンを提供するスキル。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/chain-of-thought-reasoning/resources/cot-fundamentals.md`: Chain-of-Thought 基礎理論
  - `.claude/skills/chain-of-thought-reasoning/resources/prompting-techniques.md`: CoTプロンプティング技法
  - `.claude/skills/chain-of-thought-reasoning/resources/reasoning-patterns.md`: 演繹・帰納・類推・仮説検証・分割統治・逆問題・比較分析の7つの推論パターンと適用場面
  - `.claude/skills/chain-of-thought-reasoning/templates/cot-prompt-templates.md`: CoTプロンプトテンプレート
  - `.claude/skills/chain-of-thought-reasoning/templates/self-consistency-template.md`: Self-Consistencyテンプレート

  専門分野:
  - CoTプロンプティング: 段階的思考の誘導手法
  - 推論パターン: 演繹、帰納、類推の活用
  - 自己一貫性: 複数推論パスの統合
  - 思考の構造化: 問題分解と段階的解決

  使用タイミング:
  - 複雑な推論が必要な時
  - 回答の根拠を明示したい時
  - 多段階の論理的思考が必要な時
  - AIの思考プロセスを検証したい時

  Use proactively when designing prompts requiring
  step-by-step reasoning, complex problem solving,
  or transparent thought processes.
version: 1.0.0
---

# Chain-of-Thought Reasoning

## 概要

Chain-of-Thought（CoT）は、AIに中間的な推論ステップを
明示的に生成させることで、複雑な問題解決の精度を向上させる手法です。

**主要な価値**:
- 推論精度の向上（特に数学・論理問題）
- 思考プロセスの透明化
- エラーの特定と修正が容易
- 説明可能性の向上

## リソース構造

```
chain-of-thought-reasoning/
├── SKILL.md
├── resources/
│   ├── cot-fundamentals.md             # CoT基礎理論
│   ├── prompting-techniques.md         # プロンプティング技法
│   └── reasoning-patterns.md           # 推論パターン集
└── templates/
    ├── cot-prompt-templates.md         # CoTテンプレート
    └── self-consistency-template.md    # 自己一貫性テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# CoT基礎理論
cat .claude/skills/chain-of-thought-reasoning/resources/cot-fundamentals.md

# プロンプティング技法
cat .claude/skills/chain-of-thought-reasoning/resources/prompting-techniques.md

# 推論パターン
cat .claude/skills/chain-of-thought-reasoning/resources/reasoning-patterns.md
```

### テンプレート参照

```bash
# CoTテンプレート
cat .claude/skills/chain-of-thought-reasoning/templates/cot-prompt-templates.md

# 自己一貫性テンプレート
cat .claude/skills/chain-of-thought-reasoning/templates/self-consistency-template.md
```

## CoT基礎

### なぜCoTが効果的か

```
通常のプロンプティング:
問題 → 回答（直接）

Chain-of-Thought:
問題 → 思考1 → 思考2 → ... → 回答（段階的）
```

**効果のメカニズム**:
1. 問題の分解を促進
2. 中間計算の検証が可能
3. 文脈の維持を強化
4. 論理的一貫性を向上

### CoTの種類

| 種類 | 説明 | 用途 |
|------|------|------|
| Zero-Shot CoT | "Let's think step by step" | 汎用的な推論 |
| Few-Shot CoT | 例示付きの段階的推論 | 特定形式の推論 |
| Self-Consistency | 複数パスの多数決 | 高精度要求 |
| Tree of Thoughts | 分岐探索 | 複雑な問題探索 |

## Zero-Shot CoT

### 基本パターン

```markdown
[問題文]

Let's think step by step.
```

または

```markdown
[問題文]

段階的に考えてみましょう。
まず、...
```

### トリガーフレーズ

| フレーズ | 効果 |
|---------|------|
| "Let's think step by step" | 標準的な段階的思考 |
| "Let's work this out" | 計算・分析向け |
| "First, let's understand..." | 理解重視 |
| "段階的に考えてみましょう" | 日本語版 |
| "まず〜を確認し、次に〜" | 構造化された日本語版 |

### 使用例

```markdown
問題: 太郎は1000円持っています。200円のりんごを3個と、
150円のみかんを2個買いました。おつりはいくらですか？

段階的に考えてみましょう。

1. りんごの合計金額を計算します
   200円 × 3個 = 600円

2. みかんの合計金額を計算します
   150円 × 2個 = 300円

3. 買い物の合計金額を計算します
   600円 + 300円 = 900円

4. おつりを計算します
   1000円 - 900円 = 100円

答え: おつりは100円です。
```

## Few-Shot CoT

### 基本構造

```markdown
[タスク説明]

例1:
問題: [問題1]
思考:
1. [ステップ1]
2. [ステップ2]
3. [ステップ3]
答え: [回答1]

例2:
問題: [問題2]
思考:
1. [ステップ1]
2. [ステップ2]
答え: [回答2]

実際の問題:
問題: [実際の問題]
思考:
```

### 効果的な例示の設計

**良い例示**:
- 段階が明確に分離
- 各ステップに論理的な説明
- 最終回答が明確

**悪い例示**:
- ステップが曖昧
- 飛躍のある推論
- 結論が不明確

## Self-Consistency

### 概念

```
         ┌─ 推論パス1 → 回答A
         │
問題 ────┼─ 推論パス2 → 回答B  → 多数決 → 最終回答
         │
         └─ 推論パス3 → 回答A
```

### 実装手順

1. 同じ問題に対して複数回（3-5回）推論
2. 各推論の回答を収集
3. 最も頻出する回答を採用

### 使用場面

- 高い精度が求められる場合
- 推論に不確実性がある場合
- 重要な意思決定支援

## ワークフロー

### Phase 1: 問題分析

**目的**: CoTが適切かを判断

**判断基準**:
```
CoTが効果的なタスク:
├─ 数学的計算
├─ 論理的推論
├─ 多段階の問題解決
├─ 原因分析
└─ 意思決定プロセス

CoTが不要なタスク:
├─ 単純な事実の回答
├─ 直接的な変換
├─ 分類タスク（単純）
└─ 創作・生成
```

### Phase 2: 手法選択

**目的**: 適切なCoT手法を選択

**選択ガイド**:
| 状況 | 推奨手法 |
|------|---------|
| 汎用的な推論 | Zero-Shot CoT |
| 特定形式の推論 | Few-Shot CoT |
| 高精度要求 | Self-Consistency |
| 複雑な探索 | Tree of Thoughts |

### Phase 3: プロンプト設計

**目的**: 効果的なCoTプロンプトを作成

**設計要素**:
1. 明確なタスク説明
2. 思考を促すトリガー
3. 出力形式の指定
4. （Few-Shotの場合）質の高い例示

### Phase 4: 出力検証

**目的**: 推論の妥当性を確認

**検証ポイント**:
- [ ] 各ステップの論理的整合性
- [ ] 計算の正確性
- [ ] 結論と推論の一貫性
- [ ] 飛躍や省略がないか

## タスク別適用

### 数学問題

```markdown
問題: [数学問題]

段階的に解いていきましょう。

ステップ1: 与えられた情報の整理
- ...

ステップ2: 解法の選択
- ...

ステップ3: 計算の実行
- ...

ステップ4: 検算
- ...

答え: [回答]
```

### 論理推論

```markdown
問題: [論理パズル]

論理的に分析しましょう。

前提の整理:
1. ...
2. ...

推論過程:
- 前提1と2から、[X]が導かれる
- [X]と前提3から、[Y]が導かれる
- したがって、...

結論: [回答]
```

### 原因分析

```markdown
問題: [問題状況の説明]

根本原因を分析しましょう。

症状の確認:
- ...

可能性のある原因:
1. [原因候補1]
2. [原因候補2]
3. [原因候補3]

各原因の検証:
- 原因候補1: [検証結果]
- 原因候補2: [検証結果]
- 原因候補3: [検証結果]

結論: [最も可能性の高い原因]
理由: [根拠]
```

## ベストプラクティス

### すべきこと

1. **明確なステップ分離**:
   - 各思考ステップを番号付け
   - 1ステップ1論理操作

2. **中間結果の明示**:
   - 計算結果を逐次記載
   - 推論の根拠を示す

3. **検証ステップの追加**:
   - 計算の検算
   - 論理の整合性確認

4. **適切な粒度の維持**:
   - 細かすぎず、粗すぎず
   - タスクに応じた調整

### 避けるべきこと

1. **ステップの飛躍**:
   - ❌ 「明らかに〜」
   - ✅ 具体的な根拠を示す

2. **過度な簡略化**:
   - ❌ 重要なステップを省略
   - ✅ 必要なステップをすべて含める

3. **結論先行**:
   - ❌ 先に結論、後から理由
   - ✅ 推論を経て結論に到達

## トラブルシューティング

### 問題1: 推論が長すぎる

**症状**: CoTが冗長で効率が悪い

**対策**:
1. ステップの粒度を調整
2. 必要なステップのみに絞る
3. 簡潔な表現を使用

### 問題2: 推論が間違う

**症状**: 途中のステップでエラー

**対策**:
1. 検証ステップを追加
2. Self-Consistencyを適用
3. より詳細なステップ分解

### 問題3: CoTが機能しない

**症状**: 段階的思考が出力されない

**対策**:
1. トリガーフレーズを変更
2. Few-Shot例示を追加
3. 出力形式を明示的に指定

## 関連スキル

- **few-shot-learning-patterns** (`.claude/skills/few-shot-learning-patterns/SKILL.md`)
- **prompt-engineering-for-agents** (`.claude/skills/prompt-engineering-for-agents/SKILL.md`)
- **hallucination-prevention** (`.claude/skills/hallucination-prevention/SKILL.md`)

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 |
