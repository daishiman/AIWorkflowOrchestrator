---
description: |
  コンテキスト使用量の最適化を行う専門コマンド。

  スキル・エージェント・プロンプトのトークン効率を改善し、コンテキストウィンドウの効率的な活用を実現します。

  🤖 起動エージェント:
  - `.claude/agents/skill-librarian.md`: スキル最適化（Progressive Disclosure、500行制約）
  - `.claude/agents/prompt-eng.md`: プロンプト最適化（簡潔性、明確性）

  📚 利用可能スキル（エージェントが参照）:
  **skill-librarianが参照**:
  - `.claude/skills/context-optimization/SKILL.md` - トークン60-80%削減、段階的ロード
  - `.claude/skills/progressive-disclosure/SKILL.md` - 3層開示モデル、発動率向上
  - `.claude/skills/documentation-architecture/SKILL.md` - ファイル分割、リソース組織化

  **prompt-engが参照**:
  - `.claude/skills/prompt-engineering-for-agents/SKILL.md` - プロンプト設計最適化
  - `.claude/skills/token-optimization/SKILL.md` - トークン効率化パターン

  ⚙️ このコマンドの設定:
  - argument-hint: なし（全スキル・エージェント・プロンプトを対象）
  - allowed-tools: 2エージェント起動と最小限の確認用
    • Task: 2エージェント起動用（skill-librarian, prompt-eng）
    • Read: 既存スキル・エージェント・プロンプト確認用
    • Edit: 最適化対象ファイル編集用
  - model: opus（高度なコンテキスト最適化と2エージェント調整が必要）

  📋 成果物:
  - 最適化されたスキル（Progressive Disclosure適用、resources/分割）
  - 最適化されたエージェント（トークン効率化、スキル参照強化）
  - 最適化されたプロンプト（簡潔性、明確性）
  - 最適化レポート（`.claude/docs/optimization-report.md`）

  🎯 最適化目標:
  - スキル: 60-80%トークン削減（Progressive Disclosure、resources/分割）
  - エージェント: 450-550行範囲遵守（スキル分離強化）
  - プロンプト: 30-50%トークン削減（簡潔性維持）
  - 全体: コンテキスト使用量75%未満維持

  トリガーキーワード: optimize, context, token, コンテキスト最適化, トークン削減, Progressive Disclosure
argument-hint: ""
allowed-tools:
   - Task
   - Read
   - Edit
model: opus
---

# Context Optimization

このコマンドは、スキル・エージェント・プロンプトのコンテキスト使用量を最適化します。

## 📋 実行フロー

### Phase 1: 現状分析

**分析対象**:
1. 全スキル（`.claude/skills/*/SKILL.md`）:
   - 行数チェック（500行超過の検出）
   - メタデータ品質（発動条件、トリガーキーワード）
   - リソース分割の機会

2. 全エージェント（`.claude/agents/*.md`）:
   - 行数チェック（450-550行範囲外の検出）
   - スキル参照方式（相対パス、動的参照）
   - 冗長部分の検出

3. 全プロンプト:
   - トークン使用量推定
   - 簡潔性分析
   - 明確性評価

**分析結果**:
- 最適化優先度リスト（トークン削減効果の高い順）
- 推定削減トークン数
- 最適化手法の提案

### Phase 2: skill-librarianエージェントを起動（スキル最適化）

**使用エージェント**: `.claude/agents/skill-librarian.md`

**エージェントへの依頼内容**:
```markdown
全スキルのコンテキスト最適化を行ってください。

**優先度リスト**: ${最適化優先度リスト}

**要件**:
1. Progressive Disclosure適用:
   - メタデータ層（name, description, 発動条件、トリガーキーワード）
   - 本文層（概要、核心概念、実装パターン）
   - リソース層（詳細トピック、resources/に分割）

2. 500行制約遵守:
   - 500行超過スキルの分割
   - resources/への詳細トピック分離
   - 本文は概要のみ、詳細はリソース参照

3. メタデータ最適化:
   - 発動条件の明確化（自動発動率向上）
   - トリガーキーワード最適化（検索性向上）
   - description簡潔化（必須情報のみ）

4. リソース組織化:
   - トピック別分割（resources/[topic].md）
   - スクリプト分離（scripts/[script].sh）
   - テンプレート分離（templates/[template].md）

**スキル参照**:
- `.claude/skills/context-optimization/SKILL.md`: トークン削減手法
- `.claude/skills/progressive-disclosure/SKILL.md`: 3層開示モデル
- `.claude/skills/documentation-architecture/SKILL.md`: ファイル分割戦略

**成果物**:
- 最適化されたスキル（Progressive Disclosure適用）
- resources/分割（必要に応じて）
- 最適化前後の行数・トークン比較

**品質基準**:
- 500行以内（厳守）
- 60-80%トークン削減
- 発動率向上（20%→84%実績）
- 情報品質維持（≥95%）
```

### Phase 3: prompt-engエージェントを起動（プロンプト最適化）

**使用エージェント**: `.claude/agents/prompt-eng.md`

**エージェントへの依頼内容**:
```markdown
全エージェント・プロンプトのコンテキスト最適化を行ってください。

**最適化対象**: ${最適化優先度リスト（エージェント・プロンプト）}

**要件**:
1. エージェント最適化:
   - 450-550行範囲遵守
   - スキル参照強化（詳細知識をスキルに委譲）
   - 冗長部分削減（重複記述、過剰説明）
   - ワークフローの簡潔化（概要のみ、詳細は各Phase）

2. プロンプト最適化:
   - 簡潔性維持（30-50%トークン削減）
   - 明確性確保（曖昧性排除）
   - 構造化（箇条書き、表、簡潔な説明）

3. トークン効率化パターン:
   - シンボル活用（→, ⇒, ←, ✅, ❌）
   - 省略語活用（cfg, impl, req, val）
   - 冗長表現削減

**スキル参照**:
- `.claude/skills/prompt-engineering-for-agents/SKILL.md`: プロンプト設計
- `.claude/skills/token-optimization/SKILL.md`: トークン効率化

**成果物**:
- 最適化されたエージェント（450-550行範囲内）
- 最適化されたプロンプト（30-50%トークン削減）
- 最適化前後のトークン比較

**品質基準**:
- エージェント: 450-550行範囲
- プロンプト: 30-50%トークン削減
- 明確性維持（情報品質≥95%）
- 実行可能性確保
```

### Phase 4: 統合検証

**検証内容**:
1. スキル検証:
   - 500行制約遵守
   - Progressive Disclosure適用確認
   - 相対パス参照の正確性

2. エージェント検証:
   - 450-550行範囲遵守
   - スキル参照の動作確認
   - ワークフロー実行可能性

3. 全体検証:
   - コンテキスト使用量測定（75%未満目標）
   - トークン削減率計算
   - 情報品質維持確認（≥95%）

### Phase 5: レポート生成

**最適化レポート**（`.claude/docs/optimization-report.md`）:
```markdown
# Context Optimization Report

## 最適化結果サマリー

| 対象 | 最適化前 | 最適化後 | 削減率 |
|------|----------|----------|--------|
| スキル | X行 / Yトークン | X'行 / Y'トークン | Z% |
| エージェント | X行 / Yトークン | X'行 / Y'トークン | Z% |
| プロンプト | Yトークン | Y'トークン | Z% |
| **全体** | **Yトークン** | **Y'トークン** | **Z%** |

## スキル最適化詳細

[スキルごとの最適化内容]

## エージェント最適化詳細

[エージェントごとの最適化内容]

## 品質指標

- 情報品質: 95%以上維持
- 発動率: 20%→84%向上
- コンテキスト使用量: 75%未満維持

## 推奨事項

[継続的最適化の推奨]
```

## 使用例

### 基本的な使用（全最適化）

```bash
/ai:optimize-context
```

対話的に以下を実行:
1. 現状分析（スキル・エージェント・プロンプトのトークン使用量）
2. 最適化優先度リスト作成
3. skill-librarian起動（スキル最適化）
4. prompt-eng起動（エージェント・プロンプト最適化）
5. 統合検証
6. レポート生成

## 最適化手法

### Progressive Disclosure（3層開示モデル）

**Level 1: メタデータ層**（必ず読み込まれる）:
- name, description
- 発動条件、トリガーキーワード
- 概要（1-2段落）

**Level 2: 本文層**（条件付き読み込み）:
- 核心概念
- 基本的な実装パターン
- アンチパターン

**Level 3: リソース層**（オンデマンド読み込み）:
- 詳細トピック（resources/[topic].md）
- スクリプト（scripts/[script].sh）
- テンプレート（templates/[template].md）

### トークン効率化パターン

**シンボル活用**:
- → 導く、暗示する
- ⇒ 変換する
- ← ロールバック
- ✅ 完了、正しい
- ❌ 失敗、間違い

**省略語活用**:
- cfg: config
- impl: implementation
- req: requirements
- val: validation
- opt: optimization

### ファイル分割戦略

**500行超過スキル**:
```
.claude/skills/[skill-name]/
├── SKILL.md（500行以内、概要のみ）
└── resources/
    ├── advanced-topics.md（詳細トピック）
    ├── implementation-guide.md（実装ガイド）
    └── best-practices.md（ベストプラクティス）
```

## トラブルシューティング

### 最適化後に発動率が低下

**原因**: メタデータ（発動条件、トリガーキーワード）が不足

**解決策**:
- 発動条件を明確化
- トリガーキーワードを追加
- description を具体化

### 情報品質が低下（<95%）

**原因**: 過度なトークン削減

**解決策**:
- 本文層の情報を復元
- リソース層への適切な参照追加
- 核心概念の明確化

### エージェントが行数超過

**原因**: スキル分離が不十分

**解決策**:
1. 詳細知識を外部スキルに分離
2. ワークフローを簡潔化（概要のみ）
3. 冗長部分を削減

## 参照

- skill-librarian エージェント: `.claude/agents/skill-librarian.md`
- prompt-eng エージェント: `.claude/agents/prompt-eng.md`
- context-optimization スキル: `.claude/skills/context-optimization/SKILL.md`
- progressive-disclosure スキル: `.claude/skills/progressive-disclosure/SKILL.md`
