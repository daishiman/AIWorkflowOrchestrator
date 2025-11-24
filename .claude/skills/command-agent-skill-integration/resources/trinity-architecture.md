# 三位一体アーキテクチャ（Trinity Architecture）

## 概要

三位一体アーキテクチャは、Claude Codeの3つの主要コンポーネント（Command・Agent・Skill）を統合し、最大の柔軟性と効率性を実現する設計思想です。

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│           三位一体アーキテクチャ（Trinity）                    │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐          ┌──▼───┐          ┌───▼────┐
    │COMMAND │          │AGENT │          │ SKILL  │
    │コマンド │          │エージェント│          │スキル │
    └────────┘          └──────┘          └────────┘
        │                   │                   │
   ワークフロー           タスク実行           知識提供
   自動化                判断と協調            段階的開示
   ユーザー起動          専門性                自動起動
```

## 三位一体の3つの役割

### DO（コマンド）: ワークフロー定義

**役割**:
- タスクの自動化と繰り返し可能なワークフロー定義
- ユーザーインターフェースとしての機能
- タスクの構造化と手順の明確化

**起動方法**:
- ユーザーによる明示的起動: `/command-name`
- SlashCommand Toolによるプログラマティック起動

**強み**:
- **繰り返し可能性**: 同じタスクを一貫して実行
- **決定論的**: 予測可能な動作パターン
- **パラメータ化**: `$ARGUMENTS`による柔軟な入力
- **自動化**: 複数ステップを1コマンドで実行

**制約**:
- 静的な指示のみを提供可能
- 動的な判断や複雑なロジックは含められない
- コンテキストに応じた適応は不可

**典型的なユースケース**:
```markdown
---
description: Run comprehensive code review workflow
---

1. Gather changed files
2. Invoke @code-reviewer agent
3. Process results
4. Generate summary
```

### WHO（エージェント）: タスク実行と判断

**役割**:
- 専門知識を活用した複雑なタスク実行
- コンテキストに応じた動的判断
- ツールの協調的使用

**起動方法**:
- 明示的メンション: `@agent-name`
- CLAUDE.mdのルールベース自動起動
- コマンドからの呼び出し

**強み**:
- **専門知識**: 特定ドメインの深い理解
- **複雑な判断**: 状況に応じた意思決定
- **ツール協調**: 複数ツールの効率的使用
- **適応性**: コンテキストに基づく柔軟な対応

**制約**:
- コンテキストの独立性（セッション間の状態保持なし）
- 並列実行は不可（1エージェント/1タスク）
- 明示的起動が必要

**典型的なユースケース**:
```markdown
# code-reviewer Agent

## 専門領域
- コード品質分析
- セキュリティ脆弱性検出
- パフォーマンス最適化提案

## タスク実行フロー
1. コードベース分析
2. 問題点の特定
3. 優先度付け
4. 改善提案の生成
```

### KNOW（スキル）: 手続き的知識提供

**役割**:
- ドメイン知識の構造化された提供
- ベストプラクティスのガイダンス
- 段階的な情報開示（Progressive Disclosure）

**起動方法**:
- モデルによる自動判断
- エージェント/コマンドからの明示的参照

**強み**:
- **大量の参照情報**: トークン効率的な知識提供
- **Progressive Disclosure**: 必要な情報を段階的に開示
- **再利用性**: 複数のコンテキストで活用可能
- **保守性**: 知識の集中管理と更新

**制約**:
- 実行機能なし（知識提供のみ）
- ツールの使用不可
- 動的な判断は不可

**典型的なユースケース**:
```markdown
# react-patterns Skill

## 提供知識
- コンポーネント設計パターン
- Hooksの使用ガイドライン
- 状態管理のベストプラクティス
- パフォーマンス最適化手法

## リソース構造
resources/
├── component-patterns.md
├── hooks-guidelines.md
├── state-management.md
└── performance-optimization.md
```

## 統合の価値

### 単独使用の限界

**Commandのみ**:
- ✓ シンプルなワークフローには十分
- ✗ 複雑な判断が必要な場合は不十分
- ✗ ドメイン知識が不足

**Agentのみ**:
- ✓ 複雑なタスクには有効
- ✗ 繰り返し実行が面倒
- ✗ ワークフロー定義が暗黙的

**Skillのみ**:
- ✓ 知識は提供できる
- ✗ 実行は行えない
- ✗ 自動化されていない

### 統合使用の威力

**Command + Agent**:
```
ワークフロー自動化 + 専門的判断
→ 繰り返し可能な高度タスク実行
```

**Command + Skill**:
```
ワークフロー自動化 + ドメイン知識
→ ベストプラクティスに従った一貫性のある実行
```

**Agent + Skill**:
```
専門的判断 + ドメイン知識
→ 知識に基づいた高品質な意思決定
```

**Command + Agent + Skill（最強の組み合わせ）**:
```
ワークフロー自動化 + 専門的判断 + ドメイン知識
→ 完全な自動化と最高品質の実現
```

## 設計原則

### 1. 明確な責任分離（Separation of Concerns）

**原則**:
各コンポーネントは明確に定義された単一の責任を持つ

**実践**:
```
✓ 良い設計:
  Command: ワークフロー定義（"何を、どの順で"）
  Agent: 複雑な判断と実行（"どのように判断し、実行するか"）
  Skill: ドメイン知識提供（"何が正しいか"）

✗ 悪い設計:
  Command: 全てを実行しようとする
  Agent: ワークフロー管理も行う
  Skill: 実行ロジックを含む
```

### 2. 適切な統合レベル（Appropriate Integration Level）

**原則**:
依存関係は一方向で、適切な抽象レベルを維持

**実践**:
```
✓ 良い設計:
  Command → Agent（起動）
  Command → Skill（参照）
  Agent → Skill（参照、自動）

✗ 悪い設計:
  Skill → Agent（逆転）
  Command → Skill内部実装（過度な依存）
```

### 3. 疎結合の維持（Loose Coupling）

**原則**:
各コンポーネントは独立して変更・更新可能

**実践**:
```
✓ 良い設計:
  - Commandは Agentの内部実装を知らない
  - Agentは Skillの存在を前提としない（自動起動）
  - Skillは独立して更新可能

✗ 悪い設計:
  - CommandがAgentの内部実装に依存
  - AgentがSkillの存在を前提とする
```

## 実装パターン

### パターン1: Command → Agent

```markdown
---
description: Automated code review workflow
---

## Step 1: Prepare Context
Gather changed files and commit messages

## Step 2: Invoke Expert Agent
Call `@code-reviewer` with context

## Step 3: Process Results
Generate action items from review feedback
```

**特徴**:
- ワークフロー自動化 + 専門的判断
- 繰り返し可能な高度タスク

### パターン2: Command → Skill

```markdown
---
description: Create React component with best practices
---

## Step 1: Load Best Practices
Reference: @.claude/skills/react-patterns/SKILL.md

## Step 2: Generate Component
Apply patterns from skill guidance

## Step 3: Verify
Check against skill criteria
```

**特徴**:
- ワークフロー自動化 + ドメイン知識
- 一貫性のあるベストプラクティス適用

### パターン3: Agent + Skill

```markdown
# code-reviewer Agent

## 専門知識の基盤

参照スキル:
- .claude/skills/code-quality-patterns/SKILL.md
- .claude/skills/security-patterns/SKILL.md

## レビュープロセス
1. コード分析（専門的判断）
2. パターン照合（スキル参照）
3. 問題特定と優先度付け
4. 改善提案生成
```

**特徴**:
- 専門的判断 + ドメイン知識
- 高品質な意思決定

### パターン4: Command + Agent + Skill（完全統合）

```markdown
---
description: Complete feature development workflow
---

## Phase 1: Planning (Command + Skill)
Reference: @.claude/skills/feature-planning/SKILL.md
- Define requirements
- Create task breakdown

## Phase 2: Design (Agent + Skill)
Invoke `@architect` to create design
Agent references design-patterns skill

## Phase 3: Implementation (Command + Agent + Skill)
Invoke `@developer` with:
- Planning results
- Design specification
- Implementation patterns skill reference

## Phase 4: Review (Command + Agent + Skill)
Invoke `@code-reviewer` to review
Reference: @.claude/skills/code-review-checklist/SKILL.md

## Summary
Complete workflow summary with all decisions and outcomes
```

**特徴**:
- 完全な自動化 + 専門的判断 + ドメイン知識
- 最高品質の実現

## コミュニケーションフロー

### フロー図

```
User
  │
  ├─> /command ──────────────────┐
  │                              │
  ├─> @agent ───────────────────┐│
  │                             ││
  └─> [Auto] ───────────────────┘││
                                 ││
                    ┌────────────▼▼──────────┐
                    │      Claude Model       │
                    └─┬────────────┬─────────┘
                      │            │
                ┌─────▼──┐    ┌───▼────┐
                │ Agent  │    │ Skill  │
                │Execute │    │Provide │
                └────────┘    └────────┘
```

### 起動メカニズム

| コンポーネント | 起動方法 | トリガー |
|--------------|---------|---------|
| Command | 明示的 | `/command` or SlashCommand Tool |
| Agent | 明示的/ルール | `@agent` or CLAUDE.md rules |
| Skill | 自動 | Model判断 or 明示参照 |

## ベストプラクティス

### 1. 適切なコンポーネント選択

**質問フローチャート**:
```
繰り返し実行が必要？
├─ Yes → Command
│   └─ 複雑な判断が必要？
│       ├─ Yes → Command + Agent
│       └─ No → Command のみ
│
└─ No → 専門的判断が必要？
    ├─ Yes → Agent
    │   └─ ドメイン知識が必要？
    │       ├─ Yes → Agent + Skill
    │       └─ No → Agent のみ
    │
    └─ No → 知識提供のみ？
        └─ Yes → Skill のみ
```

### 2. 段階的な統合

**推奨アプローチ**:
1. 単一コンポーネントから開始
2. 必要に応じて統合を追加
3. 複雑性を段階的に増加

```
Phase 1: Command のみ
  → 動作確認

Phase 2: Command + Agent
  → 専門性追加

Phase 3: Command + Agent + Skill
  → 知識基盤追加
```

### 3. ドキュメンテーション

各コンポーネントで明確に記述:
- **Command**: どのワークフローを自動化するか
- **Agent**: どの専門領域をカバーするか
- **Skill**: どの知識を提供するか

## トラブルシューティング

### 問題: コマンドが複雑すぎる

**症状**: コマンドに複雑なロジックや判断が含まれている

**解決策**: エージェントに判断ロジックを移動
```markdown
# Before
---
description: Complex command with logic
---
If condition A, do X
If condition B, do Y
...

# After
---
description: Simple command
---
Invoke `@decision-maker` to determine action
Execute recommended action
```

### 問題: エージェントが知識を持ちすぎる

**症状**: エージェント定義が非常に長い（>1000行）

**解決策**: スキルに知識を抽出
```markdown
# Before
# long-agent.md (1500 lines)
[大量のドメイン知識]

# After
# agent.md (500 lines)
参照スキル: .claude/skills/domain-knowledge/SKILL.md

# domain-knowledge/SKILL.md
[構造化されたドメイン知識]
```

### 問題: 同じ知識が複数箇所に散在

**症状**: 複数のエージェント/コマンドで重複した知識

**解決策**: 共通スキルを作成
```markdown
# Before
command-a.md: [Auth patterns]
command-b.md: [Auth patterns]
agent-x.md: [Auth patterns]

# After
auth-patterns/SKILL.md: [Auth patterns]
command-a.md: @.claude/skills/auth-patterns/SKILL.md
command-b.md: @.claude/skills/auth-patterns/SKILL.md
agent-x.md: 参照スキル: auth-patterns
```

## まとめ

三位一体アーキテクチャは、Claude Codeの3つの主要コンポーネントを統合し、最大の柔軟性・効率性・品質を実現します。

**キーポイント**:
1. **明確な責任分離**: DO（Command）・WHO（Agent）・KNOW（Skill）
2. **柔軟な統合**: 必要に応じて組み合わせ可能
3. **段階的適用**: シンプルから複雑へ
4. **保守性**: 各コンポーネントは独立して更新可能

**次のステップ**:
- `command-to-agent-patterns.md`: コマンド→エージェント統合の詳細
- `command-to-skill-patterns.md`: コマンド→スキル統合の詳細
- `composite-workflows.md`: 複合ワークフローの設計パターン
