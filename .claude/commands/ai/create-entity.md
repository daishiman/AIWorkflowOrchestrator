---
description: |
  新しいドメインエンティティを作成する専門コマンド。

  src/shared/core/entities/ 配下にエンティティファイルを生成します。

  🤖 起動エージェント:
  - `.claude/agents/domain-modeler.md`: ドメインモデル設計専門エージェント

  📚 利用可能スキル（domain-modelerエージェントが必要時に参照）:
  **Phase 1（ドメイン理解時）:** domain-driven-design, ubiquitous-language, bounded-context
  **Phase 2（モデル設計時）:** domain-driven-design, value-object-patterns
  **Phase 3（実装時）:** domain-services（必要時）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（エンティティ名、未指定時はインタラクティブ）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: domain-modelerエージェント起動用
    • Read: 既存エンティティ・スキル参照確認用
    • Write(src/shared/core/**): エンティティファイル生成用（パス制限）
    • Edit: 既存エンティティ修正用
    • Grep: 既存パターン検索・用語一貫性チェック用
  - model: sonnet（標準的なドメインモデル設計タスク）

  トリガーキーワード: entity, domain, ドメインエンティティ, DDD

argument-hint: "[entity-name] (optional) - エンティティ名（例: User, Task）"
allowed-tools:
  - Task
  - Read
  - Write(src/shared/core/**)
  - Edit
  - Grep
model: sonnet
---

# Domain Entity Creation Command

このコマンドは **domain-modeler エージェント** を起動し、ドメインエンティティの作成プロセスを委譲します。

## Phase 1: エージェント起動と要件収集

**1.1 domain-modeler エージェント起動**

```
@.claude/agents/domain-modeler.md を起動してください。

以下のパラメータで依頼:
- エンティティ名: $1（引数が指定されている場合）
- 配置先: src/shared/core/entities/
- プロジェクト仕様: master_system_design.md 準拠
- Clean Architecture制約: 外部依存ゼロ
```

**1.2 引数がない場合の対話的収集**

引数 `$1` が空の場合、domain-modeler が以下を対話的に収集:
- エンティティ名
- ドメイン責務
- ユビキタス言語との整合性確認

## Phase 2: スキル参照とモデル設計

domain-modeler エージェントが以下のスキルを参照しながら設計:

**必須スキル（Phase 1-2）:**
- `.claude/skills/domain-driven-design/SKILL.md`: DDD基礎と設計原則
- `.claude/skills/ubiquitous-language/SKILL.md`: 用語一貫性チェック
- `.claude/skills/value-object-patterns/SKILL.md`: 値オブジェクト設計

**推奨スキル（Phase 3）:**
- `.claude/skills/domain-services/SKILL.md`: ドメインサービス分離パターン（必要時）
- `.claude/skills/bounded-context/SKILL.md`: 境界づけられたコンテキスト検証

## Phase 3: 成果物生成と検証

**期待成果物:**
- `src/shared/core/entities/[EntityName].ts`: エンティティ実装
- TypeScript型定義、バリデーションロジック、ドメインルール
- ユニットテストテンプレート（推奨）

**検証項目（domain-modelerが実施）:**
- Clean Architecture準拠（外部依存なし）
- ユビキタス言語との一貫性
- 既存エンティティとの命名・構造整合性
- master_system_design.md のディレクトリ構造遵守

---

**注記:**
- このコマンドは **ハブ専用** です。詳細な設計・実装は domain-modeler エージェントに完全委譲されます。
- すべてのドメインロジック、実装パターン、品質保証は参照スキルに定義されています。
