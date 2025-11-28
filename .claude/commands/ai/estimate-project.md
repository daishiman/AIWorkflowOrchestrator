---
description: |
  プロジェクト規模の見積もりと予測可能な計画の策定。

  ストーリーポイント、ベロシティ計測、リスク評価を組み合わせ、
  データ駆動型の見積もりレポートを生成します。

  🤖 起動エージェント:
  - `.claude/agents/product-manager.md`: プロダクトマネージャーエージェント（Phase 1で起動）

  📚 利用可能スキル（product-managerエージェントが必要時に参照）:
  **Phase 1（プロジェクト分析）:** user-story-mapping, backlog-management
  **Phase 2（見積もり実行）:** estimation-techniques（必須）, metrics-tracking（必須）
  **Phase 3（リスク評価）:** risk-management, prioritization-frameworks
  **Phase 4（レポート作成）:** stakeholder-communication

  ⚙️ このコマンドの設定:
  - argument-hint: なし（プロジェクトドキュメントから自動収集）
  - allowed-tools: エージェント起動と最小限の参照用
    • Task: product-managerエージェント起動用
    • Read: プロジェクトドキュメント・要件・バックログ参照用
    • Write(docs/**): 見積もりレポート生成用（パス制限）
    • Grep: 既存バックログ・要件検索用
  - model: opus（複雑な見積もり分析と予測計算が必要）

  トリガーキーワード: estimate, estimation, 見積もり, 規模, ストーリーポイント, ベロシティ, リリース予測
allowed-tools: [Task, Read, Write(docs/**), Grep]
model: opus
---

# プロジェクト見積もり実行

## Phase 1: エージェント起動と準備

`.claude/agents/product-manager.md` エージェントを起動し、プロジェクト見積もりタスクを依頼します。

**エージェントへの依頼内容**:

```
プロジェクト全体の規模見積もりを実施してください。

【タスク】
1. プロジェクトドキュメント分析（Phase 1）
   - docs/00-requirements/ 配下の要件ドキュメントを読み込み
   - docs/20-specifications/ 配下の詳細仕様を確認
   - 既存バックログ（存在する場合）の確認

2. 見積もり実行（Phase 2）
   - `.claude/skills/estimation-techniques/SKILL.md` を参照
   - `.claude/skills/metrics-tracking/SKILL.md` を参照
   - ストーリーポイント集計
   - ベロシティ推定（過去データがあれば活用、なければ初期推定）
   - リリース予測の計算

3. リスク評価（Phase 3）
   - `.claude/skills/risk-management/SKILL.md` を参照
   - 不確実性の定量化（Cone of Uncertainty）
   - リスク調整係数の適用
   - バッファ戦略の提案

4. 見積もりレポート生成（Phase 4）
   - `.claude/skills/stakeholder-communication/SKILL.md` を参照
   - docs/30-project-management/ ディレクトリに以下を生成:
     • estimates/project-estimate-report.md（総合レポート）
     • estimates/story-points-summary.md（ストーリーポイント集計）
     • estimates/velocity-forecast.md（ベロシティ予測）
     • estimates/risk-assessment.md（リスク評価）

【期待成果物】
- 見積もりレポート（信頼区間付き）
- ストーリーポイント集計表
- リリース予測（楽観的・現実的・悲観的）
- リスク評価とバッファ戦略
- TDD 工数係数を反映した現実的な予測
```

## Phase 2: 実行

product-manager エージェントが以下のワークフローを実行:

1. **プロジェクト分析**
   - 要件ドキュメントからスコープを把握
   - バックログアイテムの特定（存在しない場合は概算）
   - 技術的複雑度の評価

2. **見積もり実行**
   - ストーリーポイント集計
   - ベロシティ推定（過去プロジェクト参照または初期推定）
   - 必要スプリント数の計算
   - リリース日予測（信頼区間付き）

3. **リスク評価**
   - 不確実性分析（プロジェクトフェーズ別精度）
   - リスク調整係数の適用
   - バッファ配置戦略

4. **レポート生成**
   - 包括的見積もりレポート作成
   - ステークホルダー向けサマリー
   - 前提条件と制約の明記

## Phase 3: 検証と完了報告

エージェントが以下を確認後、完了報告:

- [ ] 見積もりレポートが生成されているか
- [ ] ストーリーポイント集計が完了しているか
- [ ] リリース予測が信頼区間付きで提示されているか
- [ ] リスク評価が完了しているか
- [ ] 前提条件と制約が明記されているか

## 成果物の配置

```
docs/
├── 30-project-management/              # プロジェクト管理ドキュメント
│   └── estimates/                      # 見積もりレポート
│       ├── project-estimate-report.md  # 総合レポート
│       ├── story-points-summary.md     # ストーリーポイント集計
│       ├── velocity-forecast.md        # ベロシティ予測
│       └── risk-assessment.md          # リスク評価
```

**配置理由**:
- master_system_design.md のドキュメント階層に準拠
- `00-requirements/`: 要件定義、`10-architecture/`: 設計、`20-specifications/`: 詳細仕様
- `30-project-management/`: プロジェクト管理（見積もり、進捗、メトリクス）を追加
- `99-adr/`: アーキテクチャ決定記録

## 使用例

```bash
# プロジェクト見積もり実行
/ai:estimate-project

# 既存要件から自動的に見積もりを生成
# → docs/見積もりレポート/ 配下にレポートが生成される
```

## 注意事項

- 見積もりは現時点の情報に基づく予測であり、プロジェクト進行に伴い更新が必要
- 不確実性が高い場合は、幅広い信頼区間が設定される
- バッファは保守的に設定されるため、実際よりも長めの期間が提示される可能性がある
- 過去のベロシティデータがない場合は、初期推定値を使用（実績に基づき調整が必要）
