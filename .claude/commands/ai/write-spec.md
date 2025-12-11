---
description: |
  実装可能な詳細仕様書作成（Specification-Driven Development）

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: 詳細仕様書作成専門エージェント（Phase 2で起動）

  📚 利用可能スキル（spec-writerが必要時に参照）:
  **Phase 1（Markdown記法）:** markdown-advanced-syntax
  **Phase 2（技術文書標準）:** technical-documentation-standards
  **Phase 3（API仕様、必要時）:** api-documentation-best-practices
  **Phase 4（ユースケース、必要時）:** use-case-modeling

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（未指定時はインタラクティブ）
  - allowed-tools: エージェント起動とドキュメント作成用
    • Task: spec-writerエージェント起動用
    • Read: master_system_design.md、要件書、既存仕様参照用
    • Write(docs/**): 仕様書生成用（ドキュメントディレクトリのみ）
  - model: sonnet（標準的な仕様書作成タスク）

  📋 プロジェクト固有要件（master_system_design.md準拠）:
  - TDD準拠: テストファイルパス明記
  - Zodスキーマ: 入出力型定義必須
  - IWorkflowExecutor: 機能プラグインのインターフェース要件
  - ハイブリッド構造: shared と features の責務分離
  - プロジェクト用語: workflows, executor, registry等

  トリガーキーワード: spec, specification, 仕様書, 詳細仕様, 実装仕様, 設計書
argument-hint: "[feature-name]"
allowed-tools:
  - Task
  - Read
  - Write(docs/**)
model: sonnet
---

# Write Specification - 詳細仕様書作成

**Purpose**: 実装可能な詳細仕様書の作成（Specification-Driven Development の一環）

## 実行フロー

### Phase 1: 機能名確認

**引数チェック**:

- `$1` (feature-name) が指定されている場合: そのまま使用
- 未指定の場合: 対話的に機能名を確認

### Phase 2: 仕様書作成エージェント起動

**エージェント**: `.claude/agents/spec-writer.md`

**起動パラメータ**:

```
Feature Name: $1 (または対話で確認した機能名)
Project Context: master_system_design.md 準拠
Requirements Source: docs/10-requirements/requirements.md (存在する場合)
Output Path: docs/20-specifications/features/[feature-name].md
```

**エージェントへの依頼内容**:

1. **プロジェクト制約の理解**
   - `master_system_design.md` を参照してプロジェクト固有制約を把握
   - TDD、Clean Architecture、ハイブリッド構造の理解
   - プロジェクト用語（workflows, executor, registry 等）の確認

2. **要件情報の収集**
   - `docs/10-requirements/requirements.md` から関連要件を抽出
   - 既存の仕様書（`docs/20-specifications/features/*.md`）を参照
   - 機能の目的、背景、制約を明確化

3. **詳細仕様書の作成**

   **必須記述事項**:
   - 機能概要と背景
   - ユースケース・ユーザーストーリー
   - 入出力仕様（Zod スキーマ定義含む）
   - インターフェース要件（IWorkflowExecutor 実装等）
   - アーキテクチャ設計（shared/core, shared/infrastructure, features の責務分離）
   - TDD準拠のテストケース定義
     - テストファイルパス明記
     - 期待される振る舞い記述
   - エラーハンドリング仕様
   - パフォーマンス要件
   - セキュリティ考慮事項

   **スキル参照（必要時）**:
   - `.claude/skills/markdown-advanced-syntax/SKILL.md`: Markdown記法
   - `.claude/skills/technical-documentation-standards/SKILL.md`: 技術文書標準
   - `.claude/skills/api-documentation-best-practices/SKILL.md`: API仕様パターン
   - `.claude/skills/use-case-modeling/SKILL.md`: ユースケース記述

4. **成果物の生成**
   - `docs/20-specifications/features/[feature-name].md` に仕様書を出力
   - 実装者が迷わず実装できる詳細レベルを確保

### Phase 3: 検証と完了報告

**検証項目**:

- [ ] master_system_design.md の制約が反映されているか
- [ ] TDD準拠のテストケースが明記されているか
- [ ] 入出力スキーマ（Zod）が定義されているか
- [ ] インターフェース実装要件が明記されているか
- [ ] ハイブリッド構造の責務分離が反映されているか

**完了報告**:

- 生成された仕様書のパス
- 記述された主要セクションの概要
- 次のステップの提案（実装、レビュー等）

## 期待される成果物

**ファイルパス**: `docs/20-specifications/features/[feature-name].md`

**品質基準**:

- 実装者が仕様書のみで実装可能な詳細度
- プロジェクト固有制約の完全な反映
- TDD準拠のテストケース明記
- 技術文書標準に準拠した構造

## 注意事項

**コマンドハブ原則**:

- このコマンドは `.claude/agents/spec-writer.md` の起動ハブとして機能
- 詳細な仕様書フォーマット、記述ルールは spec-writer エージェントに委譲
- master_system_design.md 準拠の指示のみ行う

**allowed-tools 制限**:

- Task: spec-writer エージェント起動専用
- Read: master_system_design.md、要件書、既存仕様参照専用
- Write: docs/\*\* ディレクトリのみ（ソースコード変更禁止）

## 使用例

```bash
# 機能名を指定
/ai:write-spec user-authentication

# 対話的に機能名を確認
/ai:write-spec
```

## トリガーキーワード

spec, specification, 仕様書, 詳細仕様, 実装仕様, 設計書
