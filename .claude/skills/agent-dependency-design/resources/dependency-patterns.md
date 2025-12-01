# Dependency Patterns

## 概要

エージェント間の依存関係パターンとその設計方針をまとめたリファレンス。

## 依存関係の種類

### 1. スキル依存（Skill Dependency）

**定義**: エージェントが専門知識を得るためにスキルを参照する関係

**パターン**:
```yaml
---
name: my-agent
description: |
  エージェント説明。

  🔴 このエージェント起動時の必須アクション:
  以下のスキルを必ず有効化してください:
  Skill(.claude/skills/skill-name/SKILL.md)

tools:
  - Read
  - Write
model: sonnet
version: 1.0.0
---
```

**ベストプラクティス**:
- ✅ 相対パスを使用（`.claude/skills/[name]/SKILL.md`）
- ✅ 🔴マークで必須スキルを強調
- ✅ Bashコマンドで明示的に読み込み
- ❌ 絶対パスは使用しない
- ❌ スキル内容をエージェントに複製しない

### 2. エージェント依存（Agent Dependency）

**定義**: エージェントが他のエージェントにタスクを委譲する関係

**パターン**:
```markdown
## 依存エージェント

### 前提エージェント
このエージェントの前に実行すべきエージェント:
- **requirements-analyst**: 要件分析
- **architecture-designer**: アーキテクチャ設計

### 後続エージェント
このエージェントの後に実行されるエージェント:
- **code-implementer**: コード実装
- **test-writer**: テスト作成
```

**ベストプラクティス**:
- ✅ 前提・後続・並行・サブの4種類を明確に区別
- ✅ 依存理由を記述
- ✅ 循環依存を避ける
- ❌ 依存関係を暗黙的にしない

### 3. コマンド依存（Command Dependency）

**定義**: エージェントがスラッシュコマンドを使用する関係

**パターン**:
```markdown
## コマンド統合

このエージェントは以下のコマンドと統合されています:
- `/design`: アーキテクチャ設計を開始
- `/implement`: 実装フェーズに移行
- `/review`: レビューを実行
```

**ベストプラクティス**:
- ✅ コマンドの目的を明確に記述
- ✅ コマンドファイルへのパスを記載
- ❌ コマンド実装をエージェントに含めない

### 4. ツール依存（Tool Dependency）

**定義**: エージェントが特定のツールに依存する関係

**パターン**:
```yaml
tools:
  - Read
  - Write
  - Edit
  - Grep
  - Bash
```

**ベストプラクティス**:
- ✅ 必要最小限のツールのみ選択
- ✅ 役割に応じたツール選択
- ❌ 不要なツールを含めない

## 依存関係マトリックス

| エージェントタイプ | スキル依存 | エージェント依存 | コマンド依存 | ツール依存 |
|------------------|-----------|----------------|-------------|-----------|
| **Analyzer** | 高 | 低 | 中 | [Read, Grep, Glob] |
| **Implementer** | 中 | 中 | 中 | [Read, Write, Edit] |
| **Orchestrator** | 低 | 高 | 高 | [Task, Read] |
| **Deployer** | 中 | 低 | 高 | [Bash, Read, Write] |

## 依存関係図の記法

### シンプルな依存

```
Agent A → Agent B
```

Agent AがAgent Bに依存

### 複数依存

```
Agent A → Agent B
       → Agent C
       → Agent D
```

Agent AがB、C、Dに依存

### 連鎖依存

```
Agent A → Agent B → Agent C
```

A→B→Cの順で実行

### 並行依存

```
Agent A ┐
Agent B ├→ Aggregator
Agent C ┘
```

A、B、Cを並行実行し、Aggregatorが統合

### 循環依存（避けるべき）

```
Agent A ⇄ Agent B  ❌
```

循環依存は避ける

## ハンドオフプロトコル

### 標準フォーマット

```json
{
  "from_agent": "requirements-analyst",
  "to_agent": "architecture-designer",
  "status": "completed",
  "summary": "要件分析完了。機能要件5件、非機能要件3件を特定",
  "artifacts": [
    ".claude/docs/requirements.md",
    ".claude/docs/user-stories.md"
  ],
  "context": {
    "key_decisions": [
      "マイクロサービスアーキテクチャを採用",
      "PostgreSQL使用"
    ],
    "unresolved_issues": [
      "認証方式の最終決定"
    ],
    "next_steps": [
      "アーキテクチャ図の作成",
      "技術スタック選定"
    ]
  },
  "metadata": {
    "duration": "15m30s",
    "model_used": "sonnet",
    "token_count": 25480
  }
}
```

### フィールド説明

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `from_agent` | ✓ | 送信元エージェント名 |
| `to_agent` | ✓ | 送信先エージェント名 |
| `status` | ✓ | `completed`, `partial`, `failed` |
| `summary` | ✓ | 実施内容のサマリー（1-2文） |
| `artifacts` | ✓ | 生成された成果物のパスリスト |
| `context` | ✓ | コンテキスト情報 |
| `context.key_decisions` |  | 主要な決定事項 |
| `context.unresolved_issues` |  | 未解決の課題 |
| `context.next_steps` |  | 次のステップ |
| `metadata` |  | メタデータ |
| `metadata.duration` |  | 実行時間 |
| `metadata.model_used` |  | 使用モデル |
| `metadata.token_count` |  | トークン数 |

## 循環依存の検出

### 検出方法

1. **直接循環**: A → B → A
2. **間接循環**: A → B → C → A
3. **自己参照**: A → A

### 検出スクリプト

```bash
# check-circular-deps.sh を使用
./scripts/check-circular-deps.sh agent-name.md
```

### 解決策

- **依存の削減**: 不要な依存を削除
- **依存の反転**: 依存方向を逆転
- **中間層の導入**: 仲介エージェントを追加

## ベストプラクティス

### ✅ すべきこと

1. **明示的な依存宣言**: すべての依存を明示
2. **相対パス使用**: `.claude/`から始まる相対パス
3. **依存理由の記述**: なぜその依存が必要かを説明
4. **バージョン管理**: 依存先のバージョンを記録
5. **ハンドオフプロトコル使用**: 標準フォーマットに従う

### ❌ 避けるべきこと

1. **循環依存**: エージェント間の循環参照
2. **暗黙的依存**: 文書化されていない依存
3. **過度な依存**: 不要な依存の追加
4. **絶対パス**: プロジェクト固有の絶対パス
5. **独自フォーマット**: ハンドオフに独自形式を使用
