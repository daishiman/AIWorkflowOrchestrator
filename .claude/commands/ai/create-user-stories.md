---
description: |
  ユーザーストーリーとアクセプタンスクライテリアを作成する専門コマンド。

  機能要件をユーザー視点のストーリーに変換し、テスト可能な受け入れ基準を定義します。
  INVEST原則に基づき、価値提供の流れを可視化し、MVPスコープを特定します。

  🤖 起動エージェント:
  - `.claude/agents/product-manager.md`: プロダクト価値とストーリーマッピング（Phase 1で起動）
  - `.claude/agents/req-analyst.md`: 受け入れ基準定義と要件検証（Phase 2で起動）

  📚 利用可能スキル（エージェントが必要時に参照）:
  **product-manager使用スキル:**
  - `.claude/skills/user-story-mapping/SKILL.md`: ユーザージャーニー可視化、INVEST原則、エピック分割
  - `.claude/skills/backlog-management/SKILL.md`: バックログ構造化、優先順位付け
  - `.claude/skills/prioritization-frameworks/SKILL.md`: MoSCoW法、価値評価
  - `.claude/skills/estimation-techniques/SKILL.md`: ストーリーポイント見積もり

  **req-analyst使用スキル:**
  - `.claude/skills/acceptance-criteria-writing/SKILL.md`: Given-When-Then形式、シナリオ設計
  - `.claude/skills/functional-non-functional-requirements/SKILL.md`: 要件分類
  - `.claude/skills/requirements-verification/SKILL.md`: 一貫性・完全性検証
  - `.claude/skills/use-case-modeling/SKILL.md`: ユースケース構造化

  ⚙️ このコマンドの設定:
  - argument-hint: 機能名を指定（オプション、未指定時はインタラクティブ）
  - allowed-tools: エージェント起動と要件ドキュメント作成用
    • Task: 2つのエージェント起動用（product-manager → req-analyst）
    • Read: master_system_design.md、既存要件確認用
    • Write(docs/00-requirements/**): ユーザーストーリー・受け入れ基準作成用（パス制限）
    • Grep: 既存ストーリー検索・重複チェック用
  - model: opus（2エージェント調整、価値評価、受け入れ基準定義の複雑な判断が必要）

  トリガーキーワード: user stories, acceptance criteria, ユーザーストーリー, 受け入れ基準, backlog, バックログ, MVP
argument-hint: "[feature-name]"
allowed-tools:
   - Task
   - Read
   - Write(docs/00-requirements/**)
   - Grep
model: opus
---

# ユーザーストーリーとアクセプタンスクライテリア作成

## Phase 1: プロダクト価値とストーリーマッピング

**`.claude/agents/product-manager.md` を起動し、以下を実行:**

1. **プロジェクト設計書の参照**:
   - `docs/00-requirements/master_system_design.md` を読み込み
   - ハイブリッドアーキテクチャ（shared/features）の理解
   - プロジェクト制約（TDD、Clean Architecture）の確認

2. **機能要件の収集**:
   - $ARGUMENTS（機能名）が指定されている場合、その機能を対象
   - 未指定の場合、インタラクティブに機能要件をヒアリング
   - 既存の要件ドキュメントがあれば参照

3. **ユーザーストーリーマッピングの実施**:
   - ペルソナとユーザージャーニーの定義
   - アクティビティとタスクの階層化
   - エピックの特定と垂直スライスへの分割
   - INVEST原則（独立性・交渉可能性・価値・見積可能性・小ささ・テスト可能性）の適用

4. **優先順位付けと見積もり**:
   - MoSCoW分類（Must/Should/Could/Won't have）
   - 価値 vs 工数マトリクスによる評価
   - ストーリーポイントの初期見積もり

5. **MVPスコープの特定**:
   - 最小限の価値提供セットの定義
   - リリース計画の策定

**成果物**:
- ユーザーストーリーマップ（アクティビティ→ストーリー階層）
- 優先順位付けされたバックログ
- MVPスコープ定義

---

## Phase 2: 受け入れ基準定義と検証

**`.claude/agents/req-analyst.md` を起動し、以下を実行:**

1. **Phase 1成果物の引き継ぎ**:
   - product-managerが作成したユーザーストーリーを確認
   - プロジェクト制約とアーキテクチャ原則の再確認

2. **受け入れ基準の作成**:
   - 各ユーザーストーリーにGiven-When-Then形式で基準を定義
   - 正常系・異常系・境界値シナリオの網羅
   - テスト可能で測定可能な条件の記述

3. **シナリオの詳細化**:
   - ユースケースフローの構造化（基本フロー、代替フロー、例外フロー）
   - エッジケースとエラーハンドリングの明確化
   - 境界値分析による網羅性確保

4. **要件の品質検証**:
   - 一貫性チェック（ストーリー間の矛盾検出）
   - 完全性チェック（CRUD操作、非機能要件の漏れ確認）
   - 検証可能性チェック（自動テストへの変換可能性）
   - 品質スコアの計算（目標: 曖昧性0%、完全性>95%）

5. **プロジェクト固有制約の反映**:
   - TDD準拠（テスト → 実装の順序を明記）
   - ハイブリッド構造（shared/ vs features/の責務分離）
   - 技術スタック制約（Next.js 15, TypeScript strict, Drizzle ORM）

**成果物**:
- Given-When-Then形式の受け入れ基準
- テストケース設計の基盤
- 要件品質検証レポート

---

## Phase 3: ドキュメント統合と完了報告

**両エージェントの成果物を統合:**

1. **最終ドキュメント生成**:
   - `docs/00-requirements/user-stories.md` を作成
   - ユーザーストーリーマップ + 受け入れ基準を統合
   - 優先順位、見積もり、依存関係を含める

2. **プロジェクト用語集の更新**:
   - 新しいドメイン用語を `docs/00-requirements/master_system_design.md` 第14章（用語集）に追加
   - ユビキタス言語の統一

3. **次フェーズへの引き継ぎ**:
   - テスト作成への連携情報（テストファイルパス、カバレッジ目標）
   - 詳細仕様書作成への連携情報（`.claude/agents/spec-writer.md` への引き継ぎ事項）
   - 実装フェーズへの連携情報（Executor実装、Registry登録）

**完了条件チェックリスト**:
- [ ] すべてのユーザーストーリーがINVEST原則を満たしているか？
- [ ] すべてのストーリーに受け入れ基準があるか？
- [ ] 正常系・異常系・境界値がカバーされているか？
- [ ] MVPスコープが明確に定義されているか？
- [ ] 要件品質スコアが80%以上か？
- [ ] プロジェクト固有制約（TDD、ハイブリッド構造）が反映されているか？

**最終成果物**:
- `docs/00-requirements/user-stories.md`（ユーザーストーリー + 受け入れ基準）
- 優先順位付けされたバックログ
- MVP定義とリリース計画
- 次フェーズへの引き継ぎ情報
