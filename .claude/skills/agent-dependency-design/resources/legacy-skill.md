---
name: .claude/skills/agent-dependency-design/SKILL.md
description: |
  エージェント依存関係とインターフェース設計を専門とするスキル。
  スキル参照、コマンド連携、エージェント間協調のプロトコルを定義し、
  循環依存を防ぎながら効果的なマルチエージェントシステムを構築します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/agent-dependency-design/resources/dependency-patterns.md`: 4種類の依存関係（スキル・エージェント・コマンド・ツール）のパターンと標準ハンドオフプロトコル（JSON形式）、循環依存検出・解消策
  - `.claude/skills/agent-dependency-design/templates/handoff-protocol-template.json`: ハンドオフプロトコルテンプレート
  - `.claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs`: 循環依存検出スクリプト (Node.js)
  - `.claude/skills/agent-dependency-design/scripts/check-circular-deps.sh`: 循環依存検出スクリプト (Shell)

  専門分野:
  - スキル参照設計: Mandatory起動プロトコル、相対パス管理、参照タイミング
  - コマンド連携設計: 実行マトリクス、期待動作定義
  - エージェント間協調: ハンドオフプロトコル、情報受け渡し、循環依存検出
  - 依存関係最適化: 依存グラフ分析、循環解消戦略

  使用タイミング:
  - エージェントがスキルを参照する必要がある時
  - エージェント間の情報受け渡しを設計する時
  - 依存関係の循環を検出・解消する時
  - ハンドオフプロトコルを定義する時

  Use proactively when designing agent dependencies, skill references,
  or multi-agent collaboration protocols.
version: 1.0.0
---

# Agent Dependency Design

## 概要

このスキルは、エージェント依存関係とインターフェース設計の包括的なガイドラインを提供します。
スキル、コマンド、他エージェントとの依存関係を適切に設計し、
循環依存を防ぎながら効果的な協調を実現します。

**主要な価値**:

- スキル参照の標準化により、知識の再利用性が向上
- ハンドオフプロトコルにより、エージェント間の情報受け渡しが明確化
- 循環依存の検出と解消により、システムの健全性が保たれる
- 依存関係マトリクスにより、全体像が可視化される

## リソース構造

```
agent-dependency-design/
├── SKILL.md
├── resources/
│   └── dependency-patterns.md
├── scripts/
│   ├── check-circular-deps.sh
│   └── check-circular-deps.mjs
└── templates/
    └── handoff-protocol-template.json
```

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 依存関係パターン（スキル参照、循環依存解消策）
cat .claude/skills/agent-dependency-design/resources/dependency-patterns.md
```

### スクリプト実行

```bash
# 循環依存検出スクリプト（TypeScript）
node .claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs <agents-directory>

# 例: .claude/agents/内の全エージェントの循環依存をチェック
node .claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs .claude/agents

# シェルスクリプト版
bash .claude/skills/agent-dependency-design/scripts/check-circular-deps.sh <agents-directory>
```

### テンプレート参照

```bash
# ハンドオフプロトコルテンプレート（JSON形式）
cat .claude/skills/agent-dependency-design/templates/handoff-protocol-template.json

# テンプレートをコピーして新規ハンドオフ定義を作成
cp .claude/skills/agent-dependency-design/templates/handoff-protocol-template.json ./handoff-config.json
```

## いつ使うか

### シナリオ1: スキル参照設計

**状況**: エージェントが外部スキルを参照する必要がある

**適用条件**:

- [ ] 詳細な専門知識が必要
- [ ] 知識の再利用が有効
- [ ] Progressive Disclosureを適用したい

**期待される成果**: 効率的なスキル参照プロトコル

### シナリオ2: エージェント間協調

**状況**: 複数エージェントが連携してタスクを実行する

**適用条件**:

- [ ] タスクが複数エージェントに分割される
- [ ] 情報の受け渡しが必要
- [ ] 進捗管理が重要

**期待される成果**: 標準化されたハンドオフプロトコル

## ワークフロー

### Phase 1: スキル依存関係の設計

**目的**: エージェントが使用するスキルを定義

**スキル参照の3段階**:

#### ステップ1: スキル依存関係マトリクス作成

**テンプレート**:

```markdown
| スキル名 | 参照タイミング | 参照方法 | 必須/推奨 |
| -------- | -------------- | -------- | --------- |
| skill-1  | Phase X        | cat ...  | 必須      |
| skill-2  | Phase Y        | cat ...  | 推奨      |
```

**判断基準**:

- 必須: エージェントが機能するために絶対必要
- 推奨: 品質向上のために望ましい
- オプション: 特定シナリオでのみ使用

#### ステップ2: スキル参照コマンドの記述

**基本形式**:

```bash
cat .claude/skills/[skill-name]/SKILL.md
```

**相対パスの原則**:

- スキル名のみ（❌）: `.claude/skills/knowledge-management/SKILL.md`
- フルパス（✅）: `.claude/skills/knowledge-management/SKILL.md`

#### ステップ3: 参照タイミングの明確化

**指定方法**:

- どのPhase/ステップで参照するか
- なぜそのタイミングで必要か
- 取得する知識の内容

**リソース**: `resources/skill-reference-protocol.md`

### Phase 2: コマンド連携の設計

**目的**: エージェントが実行するコマンドを定義

**コマンド実行マトリクス**:

```markdown
| コマンド名 | 実行タイミング | 実行方法 | 必須/推奨 |
| ---------- | -------------- | -------- | --------- |
| /cmd-1     | Step X         | /cmd...  | 必須      |
```

**期待される動作の定義**:

- コマンドが何を実行するか
- 期待される出力
- エラー時の対応

**リソース**: `resources/command-integration-guide.md`

### Phase 3: エージェント間協調の設計

**目的**: 他エージェントとの連携を定義

**協調関係の種類**:

- **前提エージェント**: このエージェントの前に実行されるべき
- **後続エージェント**: このエージェントの後に実行されるべき
- **並行エージェント**: 並行して実行可能
- **サブエージェント**: このエージェントが委譲する対象

**ハンドオフプロトコル設計**:

```json
{
  "from_agent": "this-agent",
  "to_agent": "next-agent",
  "status": "completed|partial|failed",
  "summary": "実施内容サマリー",
  "artifacts": ["file1.md", "file2.py"],
  "context": {
    "key_decisions": [],
    "unresolved_issues": [],
    "next_steps": []
  },
  "metadata": {
    "duration": "5m30s",
    "model_used": "sonnet",
    "token_count": 15420
  }
}
```

**必須情報**:

- from_agent, to_agent: 送信元と宛先
- status: 完了状態
- summary: 実施内容の要約
- artifacts: 生成された成果物
- context: 引き継ぎコンテキスト
- metadata: メタ情報

**リソース**: `resources/handoff-protocol-design.md`

### Phase 4: 循環依存の検出と解消

**目的**: 依存関係グラフから循環を検出し、解消する

**検出方法**:

```bash
.claude/skills/agent-dependency-design/scripts/detect-circular-dependencies.sh
```

**循環パターンの例**:

```
A → B → C → A （循環！）
```

**解消策**:

1. **依存の方向性を再検討**:
   - 本当にその依存が必要か
   - 逆方向にできないか

2. **共通依存を上位に抽出**:

   ```
   A → D ← C
   ↓       ↓
   B ← ─ ─ ┘
   ```

3. **エージェントの責務を再分割**:
   - 循環の原因となる責務を分離
   - 新しいエージェントを作成

**リソース**: `resources/circular-dependency-resolution.md`

## ベストプラクティス

### すべきこと

1. **相対パスの徹底**:
   - すべてのスキル参照は相対パス
   - `.claude/skills/[skill-name]/SKILL.md`

2. **依存関係の可視化**:
   - 依存関係マトリクスを作成
   - グラフで表現

3. **ハンドオフの標準化**:
   - JSON形式で統一
   - 必須情報を明示

### 避けるべきこと

1. **循環依存の放置**:
   - ❌ A → B → A
   - ✅ 早期検出と解消

2. **曖昧な依存関係**:
   - ❌ 「関連するスキル」とだけ記載
   - ✅ 具体的なパスと参照タイミング

3. **過度な依存**:
   - ❌ 10個以上のスキルに依存
   - ✅ 必要最小限（3-5個）

## トラブルシューティング

### 問題1: スキルが見つからない

**症状**: `cat .claude/skills/xxx/SKILL.md` が失敗

**原因**: 相対パスが間違っている

**解決策**:

1. パスを確認
2. スキルが実際に存在するか確認
3. 相対パスの基準を確認

### 問題2: 循環依存が発生

**症状**: 依存関係が複雑で管理困難

**原因**: 適切な設計がされていない

**解決策**:

1. 依存関係グラフを可視化
2. 循環を特定
3. 解消策（3つ）のいずれかを適用

## 関連スキル

- **.claude/skills/multi-agent-systems/SKILL.md** (`.claude/skills/multi-agent-systems/SKILL.md`): エージェント間協調
- **.claude/skills/agent-architecture-patterns/SKILL.md** (`.claude/skills/agent-architecture-patterns/SKILL.md`): アーキテクチャパターン
- **.claude/skills/progressive-disclosure/SKILL.md** (`.claude/skills/progressive-disclosure/SKILL.md`): スキル設計
- **.claude/skills/knowledge-management/SKILL.md** (`.claude/skills/knowledge-management/SKILL.md`): 知識の体系化

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:

- 依存関係パターン (`resources/dependency-patterns.md`)
- ハンドオフプロトコルテンプレート (`templates/handoff-protocol-template.json`)
- 循環依存検出スクリプト (`scripts/check-circular-deps.sh`)

## メトリクス

### 依存関係の健全性

**評価基準**:

- 循環依存数: 0個（必須）
- 平均依存数: 3-5個
- 深さ: 最大3レベル

**目標**: 循環依存ゼロ、適度な依存数

## 使用上の注意

### このスキルが得意なこと

- スキル参照プロトコルの設計
- ハンドオフプロトコルの標準化
- 循環依存の検出と解消
- 依存関係の可視化

### このスキルが行わないこと

- エージェントの実際の実装
- 具体的なコード生成
- スキルの作成（.claude/agents/skill-librarian.mdの役割）
