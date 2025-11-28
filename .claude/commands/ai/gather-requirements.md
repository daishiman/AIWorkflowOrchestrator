---
description: |
  ステークホルダーへのヒアリングを実施し、曖昧な要望を検証可能な要件に変換します。

  🤖 起動エージェント:
  - `.claude/agents/req-analyst.md`: 要件定義スペシャリスト（カール・ウィーガーズの要求工学に基づく曖昧性除去と要件構造化）

  📚 利用可能スキル（フェーズごとに必要時のみ参照）:
  **Phase 1（要望収集・初期分析）:**
  - `.claude/skills/interview-techniques/SKILL.md`: 5W1H質問法、Why分析による要求抽出
  - `.claude/skills/requirements-engineering/SKILL.md`: MoSCoW分類による優先順位付け

  **Phase 2-5（明確化・構造化・文書化・検証・レビュー）:**
  - エージェント内の8つの依存スキル（requirements-triage, ambiguity-elimination等）を自動参照

  ⚙️ このコマンドの設定:
  - argument-hint: "[stakeholder-name]（オプション: ヒアリング対象者、省略時は汎用質問セット）"
  - allowed-tools: Read(docs/**), Write(docs/00-requirements/**)
  - model: opus（複雑なヒアリング分析と曖昧性除去の判断が必要）

  トリガーキーワード: 要件定義、ヒアリング、要求分析、requirements gathering
---

# /ai:gather-requirements

## Phase 1: エージェント起動と準備

### 1.1 Requirements Analystの起動
```bash
# @req-analyst エージェントのロード
cat .claude/agents/req-analyst.md
```

**起動確認**:
- [ ] エージェントの役割定義が確認できたか
- [ ] 5つのフェーズワークフローが理解できたか
- [ ] ツール使用方針が明確か

### 1.2 プロジェクトコンテキストの把握
```bash
# システム設計仕様書の確認（必須）
cat docs/00-requirements/master_system_design.md
```

**プロジェクト固有の制約確認**:
- [ ] **Specification-Driven Development**: 仕様書を正本とし、実装はその変換結果とする原則
- [ ] **TDD必須**: すべての機能追加はテスト記述から着手（仕様書 → テスト → 実装）
- [ ] **Clean Architecture**: 依存関係は外→内（Infrastructure → Application → Domain）
- [ ] **ハイブリッド構造**: 共通インフラ（shared/）と機能プラグイン（features/）の分離
- [ ] **技術スタック**: Next.js 15.x, Railway, Neon (PostgreSQL + pgvector), Drizzle ORM
- [ ] **プロジェクト用語**: workflows (実行単位), executor (実行クラス), registry (機能レジストリ)
- [ ] **出力構造**: `docs/00-requirements/` (要件), `docs/20-specifications/features/` (詳細仕様)

---

## Phase 2: 要件収集の実行

### 2.1 ステークホルダーヒアリング
**実行**: `@req-analyst` が以下を実施
1. interview-techniquesスキルに基づくヒアリング実施
2. 5W1H質問法による網羅的要求収集
3. Why分析（5回のWhy繰り返し）による根本ニーズ発見

**引数処理**:
- 引数あり: 指定されたステークホルダー向けにカスタマイズした質問セット生成
- 引数なし: 汎用的な要件収集質問セットを使用

**成果物**: 初期要求リスト（MoSCoW分類付き）

### 2.2 要件の明確化と構造化
**実行**: `@req-analyst` が以下を実施（Phase 2-4）
1. 曖昧性検出と除去（「速い」→「応答時間<200ms」）
2. 機能要件（FR）と非機能要件（NFR）への分離
3. ユースケースと受け入れ基準の定義
4. 要件品質検証（一貫性・完全性・検証可能性）

**品質基準**:
- [ ] 曖昧性スコア: 0（曖昧な表現なし）
- [ ] 完全性スコア: >95%
- [ ] 検証可能性スコア: 100%

---

## Phase 3: 成果物生成

### 3.1 要件定義書の作成
**出力先**: `docs/00-requirements/requirements.md`

**必須セクション**:
- プロジェクト概要（目的、スコープ、ステークホルダー）
- 機能要件（FR-XXX 形式、優先順位付き）
- 非機能要件（NFR-XXX 形式、測定可能な基準）
- ユースケース（基本フロー、代替フロー、例外フロー）
- 受け入れ基準（Given-When-Then形式、**TDD対応: テスト可能であること**）
- 用語集（プロジェクト固有の用語定義: workflows, executor, registry等）
- **アーキテクチャ制約**（master_system_design.mdからの転記）:
  - Clean Architecture原則（依存方向: 外→内）
  - ハイブリッド構造（shared/ と features/ の責務分離）
  - TDD必須（仕様書 → テスト → 実装の順序）

**品質検証**: requirements-verificationスキルによる自動検証

**次フェーズ連携**:
- **詳細仕様**: `docs/20-specifications/features/[機能名].md` への詳細化を想定
- **TDDフロー**: テストファイル作成（`features/[機能名]/__tests__/`）への引き継ぎ準備
- **実装ガイド**: Executor実装時の制約を明記（共通インフラはshared/から、機能間依存禁止）

---

## 完了確認

### 最終チェックリスト
- [ ] すべての要望がMoSCoW分類されている
- [ ] 曖昧な表現が90%以上除去されている（「速い」→「応答時間<200ms」等）
- [ ] すべての要件に受け入れ基準がある（Given-When-Then形式、テスト可能）
- [ ] 要件間の矛盾がない
- [ ] 要件定義書が `docs/00-requirements/requirements.md` に生成されている
- [ ] 品質スコアが基準値（明確性90%、完全性85%、一貫性100%）を満たしている
- [ ] **プロジェクト固有制約**が明記されている:
  - [ ] TDD必須（仕様 → テスト → 実装）の順序が説明されているか
  - [ ] ハイブリッド構造（shared/ と features/）の責務が説明されているか
  - [ ] 用語集にworkflows, executor, registryが定義されているか
  - [ ] 技術スタック制約（Railway, Neon, Drizzle ORM）が記載されているか

### ハンドオフ準備
次フェーズへの引き継ぎ:
- **設計フェーズ**: `/ai:design-system` または `@spec-writer` へハンドオフ
- **ドメインモデリング**: `@domain-modeler` との並行作業検討
- **テスト戦略**: `@test-strategist` へ要件の引き継ぎ

---

## 使用例

### 例1: 新規プロジェクトの要件定義
```bash
/ai:gather-requirements "Product Owner"
```
**結果**: Product Owner向けにカスタマイズされた質問セットでヒアリング、要件定義書を生成

### 例2: 機能追加の要件定義
```bash
/ai:gather-requirements
```
**結果**: 汎用質問セットで要望を収集、既存要件との整合性を確認しながら要件を追加

### 例3: 要件見直し
既存の `docs/00-requirements/requirements.md` を読み込み、品質評価と改善提案を実施

---

## トラブルシューティング

### 曖昧な回答が多い場合
→ interview-techniquesスキルの「明確化質問パターン」を活用

### 優先順位が決められない場合
→ requirements-engineeringスキルの「トリアージフレームワーク」でリスク評価

### 要件間の矛盾を発見した場合
→ requirements-verificationスキルの検証チェックリストで体系的に解消
