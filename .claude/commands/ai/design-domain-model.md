---
description: |
  ドメイン駆動設計（DDD）に基づくドメインモデルの設計を行う専門コマンド。

  ビジネスルールをコードの中心に据え、技術的詳細から独立した堅牢なドメイン層を構築します。
  Entity、ValueObject、Aggregate、ドメインサービスを識別し、ユビキタス言語を確立します。

  🤖 起動エージェント:
  - `.claude/agents/domain-modeler.md` - ドメインモデル設計専門エージェント

  📚 利用可能スキル（domain-modelerエージェントが参照）:
  **必須スキル（Phase 1-2）:**
  - `.claude/skills/domain-driven-design/SKILL.md`: DDD原則と実践パターン
  - `.claude/skills/ubiquitous-language/SKILL.md`: ユビキタス言語確立手法
  - `.claude/skills/value-object-patterns/SKILL.md`: 値オブジェクト設計パターン

  **推奨スキル（Phase 3-4）:**
  - `.claude/skills/domain-services/SKILL.md`: ドメインサービス配置設計
  - `.claude/skills/bounded-context/SKILL.md`: 境界付けられたコンテキスト定義

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（未指定時はインタラクティブ）
  - allowed-tools: エージェント起動とドメイン層作成用
    • Task: domain-modelerエージェント起動用
    • Read: 要件・仕様書確認、既存ドメインモデル確認用
    • Write(src/shared/core/**|docs/**): ドメイン層ファイル・用語集作成用（パス制限）
    • Edit: 既存ドメインファイル修正用
    • Grep: 用語使用箇所検索、一貫性確認用
  - model: opus（複雑なドメインモデル設計とビジネスルール抽出が必要）

  📋 成果物:
  - `src/shared/core/entities/[domain-name].ts`: Entityまたは Aggregate
  - `src/shared/core/entities/[domain-name]/*.ts`: ValueObject群
  - `docs/10-architecture/domain-model.md`: ドメインモデル設計書
  - `docs/10-architecture/ubiquitous-language.md`: ドメイン用語集
  - `docs/99-adr/`: 設計判断のADR

  🎯 トリガーキーワード:
  domain, DDD, entity, value object, aggregate, ドメインモデル, エンティティ, 値オブジェクト, ユビキタス言語

argument-hint: "[domain-name]"
allowed-tools:
- Task
- Read
- Write(src/shared/core/**|docs/**)
- Edit
- Grep
model: opus
---

# ドメインモデル設計

## 実行フロー

### Phase 1: 準備と要件確認

1. **プロジェクト仕様の理解**
   - `docs/00-requirements/master_system_design.md` 第6章（コアインターフェース仕様）を参照
   - IWorkflowExecutor、IRepository、ExecutionContext の要件確認
   - 第5.2.3章（workflows テーブル）でエンティティ構造を理解
   - 第14章（用語集）で既存ドメイン用語を確認

2. **ドメイン名の確認**
   - `$ARGUMENTS` で指定されたドメイン名を取得
   - 未指定の場合はインタラクティブに確認

### Phase 2: domain-modeler エージェント起動

3. **エージェント起動と委譲**
   ```
   `.claude/agents/domain-modeler.md` を起動

   依頼内容:
   - ドメイン「$ARGUMENTS」のモデル設計
   - 要件・仕様書からビジネスルール抽出
   - Entity、ValueObject、Aggregateの識別
   - ユビキタス言語の確立とコードへの反映
   - ドメインサービスの特定（必要に応じて）
   - 境界付けられたコンテキストの定義（必要に応じて）

   参照すべき仕様:
   - docs/00-requirements/master_system_design.md
   - docs/20-specifications/features/[関連機能].md
   - docs/10-architecture/ubiquitous-language.md（既存用語集）

   成果物:
   - src/shared/core/entities/[domain-name].ts（Entity/Aggregate）
   - src/shared/core/entities/[domain-name]/*.ts（ValueObject群）
   - docs/10-architecture/domain-model.md（ドメインモデル設計書、Mermaid図含む）
   - docs/10-architecture/ubiquitous-language.md（用語集更新）
   - docs/99-adr/00X-domain-[domain-name].md（設計判断のADR）
   ```

### Phase 3: 検証と報告

4. **成果物検証**
   - `src/shared/core/` 配下のファイルが作成されているか確認
   - ドメインモデル設計書が充実しているか確認
   - ユビキタス言語が一貫して適用されているか確認

5. **ユーザーへの報告**
   - 作成されたドメインファイルの場所を通知
   - ドメインモデル設計書の概要を提示
   - 次のアクション（Repository実装、ビジネスロジック実装）を提案

## 品質基準

### 完了条件
- [ ] Entity、ValueObject、Aggregateが適切に識別されている
- [ ] ユビキタス言語がコードに反映されている
- [ ] 値オブジェクトでプリミティブ型を置換している
- [ ] 不変条件がドメイン層で保護されている
- [ ] 技術的詳細（DB、Framework）への依存がない
- [ ] ドメインモデル設計書が `docs/10-architecture/` に作成されている
- [ ] 用語集が更新されている
- [ ] ADRで設計判断が記録されている

## エラーハンドリング

- **エージェント起動失敗**: domain-modeler エージェントの存在を確認、再起動
- **スキル不足**: 必須スキル（domain-driven-design等）の存在を確認、不足時はユーザーに通知
- **ディレクトリ不存在**: `src/shared/core/entities/` ディレクトリの存在を確認、必要に応じて作成
- **用語集不在**: `docs/10-architecture/ubiquitous-language.md` の存在を確認、新規作成が必要か判断
