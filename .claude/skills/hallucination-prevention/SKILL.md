---
name: hallucination-prevention
description: |
    AIのハルシネーション（幻覚・誤情報生成）を防止するスキル。
    プロンプトレベル、パラメータレベル、検証レベルの3層防御により、
    信頼性の高いAI出力を実現します。
    専門分野:
    - プロンプト対策: 事実確認要求、引用義務、不確実性表現
    - パラメータ調整: Temperature、Top-p、Frequency Penalty
    - 検証メカニズム: 出力検証、信頼度チェック、クロスバリデーション
    - グラウンディング: RAG統合、知識ベース参照
    使用タイミング:
    - 事実に基づく出力が必要な時
    - AIの誤情報を防ぎたい時
    - 信頼性の高い出力が求められる時
    - 出力に根拠を持たせたい時
    Use proactively when preventing AI hallucination,
    requiring factual accuracy, or implementing verification.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/hallucination-prevention/resources/parameter-tuning.md`: Temperature、Top-p、Frequency Penaltyのタスク別推奨設定
  - `.claude/skills/hallucination-prevention/resources/prompt-level-defense.md`: 事実確認要求、引用義務、不確実性表現のプロンプトパターン
  - `.claude/skills/hallucination-prevention/resources/verification-mechanisms.md`: 出力検証、信頼度チェック、クロスバリデーション手法
  - `.claude/skills/hallucination-prevention/templates/verification-checklist.md`: ハルシネーション防止検証チェックリスト

version: 1.0.0
---

# Hallucination Prevention

## 概要

ハルシネーション防止は、AI が事実に基づかない情報を生成することを
防ぐための多層防御アプローチです。

**主要な価値**:

- 誤情報の防止
- 出力の信頼性向上
- 検証可能な根拠の提供
- ユーザー信頼の確保

## リソース構造

```
hallucination-prevention/
├── SKILL.md
├── resources/
│   ├── prompt-level-defense.md       # プロンプトレベル対策
│   ├── parameter-tuning.md           # パラメータ調整ガイド
│   └── verification-mechanisms.md    # 検証メカニズム
└── templates/
    └── verification-checklist.md     # 検証チェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# プロンプトレベル対策
cat .claude/skills/hallucination-prevention/resources/prompt-level-defense.md

# パラメータ調整ガイド
cat .claude/skills/hallucination-prevention/resources/parameter-tuning.md

# 検証メカニズム
cat .claude/skills/hallucination-prevention/resources/verification-mechanisms.md
```

### テンプレート参照

```bash
# 検証チェックリスト
cat .claude/skills/hallucination-prevention/templates/verification-checklist.md
```

## 3 層防御モデル

### Layer 1: プロンプトレベル

**目的**: AI に事実確認と引用を義務付ける

**主要技術**:

- 不確実性の明示要求
- 情報源の引用義務
- 推測の禁止
- 検証ステップの組み込み

**プロンプト例**:

```
以下の規則に従ってください：
1. 入力データに含まれない情報は生成しない
2. 推測する場合は「推測:」と明示する
3. 各主張に対して情報源を示す
4. 確信度が低い場合は「不確実:」と明示する
```

### Layer 2: パラメータレベル

**目的**: モデルの出力傾向を制御

**主要パラメータ**:

| パラメータ        | 決定論的 | バランス | 創造的  |
| ----------------- | -------- | -------- | ------- |
| Temperature       | 0.0-0.3  | 0.3-0.7  | 0.7-1.0 |
| Top-p             | 0.1-0.5  | 0.5-0.9  | 0.9-1.0 |
| Frequency Penalty | 0.0-0.3  | 0.3-0.7  | 0.7-2.0 |

**タスク別推奨設定**:

- 事実抽出: Temperature=0.0, Top-p=0.1
- データ変換: Temperature=0.1, Top-p=0.3
- 要約: Temperature=0.3, Top-p=0.5
- 創作: Temperature=0.7, Top-p=0.9

### Layer 3: 検証レベル

**目的**: 出力後の品質保証

**検証タイプ**:

1. **構造検証**: スキーマ準拠、型整合性
2. **内容検証**: 入力との整合性、論理的一貫性
3. **信頼度検証**: 確信度閾値、品質スコア
4. **クロス検証**: 複数モデル比較、人間レビュー

## ワークフロー

### Phase 1: リスク評価

**目的**: タスクのハルシネーションリスクを評価

**リスク要因**:

- 事実に基づく出力が必要か？
- 出力の影響範囲は？
- 検証手段はあるか？

**リスクレベル判定**:

```
高リスク: 法的・医療・金融情報 → 3層すべて適用
中リスク: 技術情報・分析 → Layer 1 + 2 適用
低リスク: 創作・アイデア出し → Layer 1 のみ
```

### Phase 2: プロンプト設計

**目的**: ハルシネーション防止プロンプトを設計

**必須要素**:

1. 事実確認の義務付け
2. 情報源の明示要求
3. 不確実性の表現義務
4. 推測の禁止または明示

**判断基準**:

- [ ] 入力範囲外の生成を禁止しているか？
- [ ] 引用形式が定義されているか？
- [ ] 不確実性の表現方法が明確か？

### Phase 3: パラメータ設定

**目的**: 適切なモデルパラメータを選択

**設定フロー**:

```
タスクの性質は？
├─ 事実抽出 → Temperature=0.0
├─ 分析・要約 → Temperature=0.3
├─ 創作・アイデア → Temperature=0.7
└─ 自由生成 → Temperature=1.0
```

### Phase 4: 検証実装

**目的**: 出力検証メカニズムを実装

**検証ステップ**:

1. スキーマ検証（構造的正確性）
2. 信頼度チェック（閾値確認）
3. 入力整合性（情報源トレーサビリティ）
4. フォールバック（検証失敗時の処理）

## ベストプラクティス

### すべきこと

1. **多層防御の実装**:
   - 1 層だけに頼らない
   - リスクに応じた層の選択

2. **検証可能な出力設計**:
   - 信頼度フィールドの追加
   - 情報源フィールドの追加

3. **フォールバック戦略**:
   - 検証失敗時の再試行
   - 人間レビューへのエスカレーション

### 避けるべきこと

1. **過度な信頼**:
   - ❌ AI の出力を無条件に信用
   - ✅ 常に検証プロセスを通す

2. **不適切なパラメータ**:
   - ❌ 事実抽出に Temperature=1.0
   - ✅ タスクに応じた適切な設定

3. **検証の省略**:
   - ❌ 高リスクタスクで検証なし
   - ✅ リスクに応じた検証レベル

## トラブルシューティング

### 問題 1: 事実と異なる出力

**症状**: AI が入力にない情報を生成

**対策**:

1. Temperature を下げる（0.0-0.1）
2. プロンプトで明示的に禁止
3. 入力データへの参照を義務付け

### 問題 2: 低い信頼度

**症状**: AI の出力に確信が持てない

**対策**:

1. 信頼度フィールドを追加
2. 閾値以下は再試行
3. 複数回生成して比較

### 問題 3: 検証の失敗

**症状**: 出力が検証を通過しない

**対策**:

1. エラー内容をフィードバック
2. 制約を緩和して再試行
3. 人間レビューにエスカレーション

## 関連スキル

- **prompt-engineering-for-agents** (`.claude/skills/prompt-engineering-for-agents/SKILL.md`)
- **structured-output-design** (`.claude/skills/structured-output-design/SKILL.md`)
- **best-practices-curation** (`.claude/skills/best-practices-curation/SKILL.md`)

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-25 | 初版作成 |
