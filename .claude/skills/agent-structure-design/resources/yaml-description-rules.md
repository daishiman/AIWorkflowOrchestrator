# YAML Frontmatter Description規則 (v2.1.0統一フォーマット)

エージェント作成時のYAML Frontmatterの`description`部分に記載すべき必須要素。

## 必須要素

### 1. エージェントの基本説明（1-2行）

エージェントの目的と役割を簡潔に記述。

```yaml
description: |
  このエージェントは[目的]を担当し、[役割]を実行します。
```

### 2. 依存スキルの明示的記述

エージェントが参照するスキルを以下の形式で記載:

```yaml
description: |
  [エージェントの説明...]

  📚 依存スキル:
  このエージェントは以下のスキルに専門知識を分離しています:
  - [skill-name-1]: [簡潔な説明]
  - [skill-name-2]: [簡潔な説明]

  パス: .claude/skills/[スキル名]/SKILL.md
```

**記述原則**:
- スキル名は`kebab-case`形式
- 説明は10-15文字以内
- パスは相対パス形式（`.claude/skills/...`）

### 3. スキル活用方針の記述

スキルの読み込みタイミングと方針を明示:

```yaml
description: |
  📚 スキル活用方針:

  このエージェントは[数]個のスキルに詳細な専門知識を分離しています。
  **起動時に全スキルを読み込むのではなく、タスクに応じて必要なスキルのみを参照してください。**

  **スキル読み込み例**:
  ```bash
  # [状況]が必要な場合のみ
  cat .claude/skills/[skill-name]/SKILL.md
  ```

  **読み込みタイミング**: 各Phaseの「必要なスキル」セクションを参照し、該当するスキルのみを読み込んでください。
```

### 4. コマンドリファレンスセクションの追加

エージェント本文に「## コマンドリファレンス」セクションを追加し、以下を含める:

```markdown
## コマンドリファレンス

### スキル読み込み（タスクに応じて必要なもののみ）

```bash
# [スキル名]
cat .claude/skills/[skill-name]/SKILL.md
```

### TypeScriptスクリプト実行

```bash
# [機能名]
node .claude/skills/[skill-name]/scripts/[script].mjs <args>
```

### テンプレート参照

```bash
# [テンプレート名]
cat .claude/skills/[skill-name]/templates/[template]
```

### リソース参照

```bash
# [リソース名]
cat .claude/skills/[skill-name]/resources/[resource].md
```
```

### 5. 明示的なスキル起動プロトコル

エージェント本文の冒頭に、以下の形式でスキル読み込み指示を記載:

```markdown
**🔴 MANDATORY - 起動時に必ず実行**:
このエージェントが起動されたら、**タスク実行前に以下のスキルを有効化してください**:

```bash
cat .claude/skills/[skill-name]/SKILL.md
```
```

**条件付きMANDATORY（タスク別）**:
タスクに応じて必要なスキルのみを読み込むエージェントの場合:

```markdown
**🔴 CONDITIONAL MANDATORY - タスク別スキル読み込み**:
このエージェントは12個のスキルに専門知識を分離しています。
**タスクに応じて必要なスキルのみを参照してください。**

**Phase別スキルマッピング**:
- Phase 1（要件理解）: agent-persona-design
- Phase 2（構造設計）: agent-structure-design, tool-permission-management
- Phase 3（依存関係）: agent-dependency-design, multi-agent-systems
- Phase 4（品質基準）: agent-quality-standards, agent-lifecycle-management
- Phase 5（検証）: agent-validation-testing, agent-template-patterns

**共通参照**:
- アーキテクチャ設計時: agent-architecture-patterns
- プロジェクト統合時: project-architecture-integration
- プロンプト設計時: prompt-engineering-for-agents
```

## 記述チェックリスト

エージェント作成時に以下を確認:

- [ ] 基本説明（1-2行）が記載されている
- [ ] 依存スキルが列挙されている（スキル名と簡潔な説明）
- [ ] スキル参照パスが相対パスで記載されている
- [ ] スキル活用方針が明示されている
- [ ] コマンドリファレンスセクションが含まれている
- [ ] スキル起動プロトコル（MANDATORY or CONDITIONAL MANDATORY）が記載されている
- [ ] スクリプト実行コマンドが記載されている（該当する場合）
- [ ] テンプレート参照コマンドが記載されている（該当する場合）
- [ ] リソース参照コマンドが記載されている（該当する場合）

## アンチパターン

以下は避けるべき記述:

❌ **スキル名のみの記述**（パスなし）:
```yaml
依存スキル: agent-structure-design
```

❌ **絶対パスの使用**:
```yaml
パス: /Users/dm/.claude/skills/agent-structure-design/SKILL.md
```

❌ **スキル読み込みタイミングの記載なし**:
```yaml
依存スキル:
- agent-structure-design: 構造設計
```

❌ **コマンドリファレンスセクションの欠如**:
（エージェント本文にスキル参照方法が記載されていない）

✅ **正しい記述**:
```yaml
description: |
  このエージェントはXXXを担当します。

  📚 依存スキル:
  - agent-structure-design: YAML構造とワークフロー設計
  - agent-persona-design: ペルソナと役割定義

  パス: .claude/skills/[スキル名]/SKILL.md

  **スキル活用方針**:
  タスクに応じて必要なスキルのみを参照してください。
```

## バージョン履歴

- **v2.1.0** (2025-11-27): 統一フォーマット策定
  - CONDITIONAL MANDATORY形式の追加
  - Phase別スキルマッピングの導入
  - コマンドリファレンスセクションの必須化
