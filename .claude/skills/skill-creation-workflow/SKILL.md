---
name: skill-creation-workflow
description: |
  スキル作成・改善の詳細ワークフロー（Phase 1-5）を定義。
  新規スキル作成、既存エージェント軽量化、既存スキル改善の
  3つのワークフローパターンと、各Phaseの具体的なステップ、
  判断基準、使用スキル、完了条件を提供します。

  使用タイミング:
  - 新規スキルを作成する時（ワークフローA）
  - 既存エージェントを軽量化する時（ワークフローB）
  - 既存スキルを改善する時（ワークフローC）
  - 各Phaseの詳細手順を確認したい時
  - 品質基準と成功の定義を確認したい時

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/skill-creation-workflow/resources/phase-details.md`: Phase 1-5の詳細手順、判断基準、成功条件の完全ガイド
  - `.claude/skills/skill-creation-workflow/templates/skill-template.md`: 新規スキル作成用の標準テンプレート（YAML frontmatter + 本文構造）
  - `.claude/skills/skill-creation-workflow/scripts/validate-skill.mjs`: スキルファイル品質検証ツール（必須フィールド、行数チェック）

  Use proactively when creating new skills, refactoring agents,
  improving existing skills, or checking detailed phase procedures
  and quality criteria.
tools:
  - Read
  - Write
  - Grep
  - Bash
tags: [workflow, skill-creation, agent-refactoring, quality-assurance]
version: 1.0.0
---

# Skill Creation Workflow

## 概要

このスキルは、スキル作成・改善の詳細なワークフローを定義します。

**対象**: Skill Librarianエージェント専用
**スコープ**: 新規作成、エージェント軽量化、スキル改善の3ワークフロー

---

## ワークフローA: 新規スキル作成

### Phase 1: 知識の収集と分析

**目的**: 形式知化すべき知識を特定し、収集する

**主要ステップ**:

1. **スキル作成要求の理解**
   - ユーザー要求の分析
   - スキルの目的と範囲の明確化
   - 対象ユーザーの特定（エージェント、開発者、両方）

2. **知識源の特定と収集**
   - 既存ドキュメントの収集
   - コードパターンの抽出
   - ベストプラクティスの特定
   - 専門家の知識の聞き取り
   - 公式ドキュメントの参照

3. **知識の粒度と範囲の決定**
   - 単一トピックへの絞り込み
   - スキルの境界定義
   - 既存スキルとの重複確認
   - 関連スキルとの依存関係整理

**使用スキル**:

- `.claude/skills/knowledge-management/SKILL.md`（SECIモデルのSocialization）
- `.claude/skills/best-practices-curation/SKILL.md`（情報源評価）

**使用コマンド**:

```bash
# 情報源評価ガイド
cat .claude/skills/best-practices-curation/resources/information-source-evaluation.md

# SECIモデル詳細
cat .claude/skills/knowledge-management/resources/seci-model-details.md

# 既存スキルの重複チェック
grep -r "keyword" .claude/skills/*/SKILL.md
```

**判断基準**:

- [ ] 形式知化する知識の範囲が明確か？
- [ ] 既存スキルと重複していないか？
- [ ] 単一トピックに絞られているか？
- [ ] 知識源の信頼性が確認できたか？
- [ ] 収集した知識量は適切か（500行以内に収まるか）？

**完了条件**:

- 知識範囲定義完了
- 知識源特定完了
- 重複なし確認済み
- 信頼性評価完了

**成果物**:

- 知識範囲定義書（概要）
- 知識源リスト（URL、書籍、専門家）
- 重複チェック結果

---

### Phase 2: スキル構造の設計

**目的**: YAML FrontmatterとSKILL.md本文の構造を設計する

**主要ステップ**:

1. **name、description、versionの設計**
   - **name**: kebab-case、説明的、一意性確保
   - **description**:
     - 1-2行の簡潔な説明
     - 「使用タイミング」（3-5個、具体的なシチュエーション）
     - 「Use proactively when」（英語の発動条件）
   - **version**: セマンティックバージョニング（1.0.0から開始）

2. **SKILL.md本文のセクション構成決定**
   - 必須セクション:
     - 概要
     - 主要概念
     - 実践例
     - 関連スキル
   - 推奨セクション:
     - ベストプラクティス
     - トラブルシューティング
     - バージョン履歴

3. **リソース分割の必要性判断（500行ルール）**
   - 本文が500行を超える見込み → リソース分割
   - トピック別分割（推奨）
   - レベル別分割（初級・中級・上級）
   - 機能別分割（設計・実装・検証）
   - ハイブリッド分割

**使用スキル**:

- `.claude/skills/progressive-disclosure/SKILL.md`（メタデータ設計、トリガー条件）
- `.claude/skills/documentation-architecture/SKILL.md`（構造設計、分割戦略）

**使用コマンド**:

```bash
# 3層開示モデル
cat .claude/skills/progressive-disclosure/resources/three-layer-model.md

# ファイル分割パターン
cat .claude/skills/documentation-architecture/resources/splitting-patterns.md

# メタデータテンプレート
cat .claude/skills/progressive-disclosure/templates/skill-metadata-template.yaml

# 構造分析（既存スキルを参考に）
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/knowledge-management
```

**判断基準**:

- [ ] descriptionに具体的なトリガー条件が3つ以上あるか？
- [ ] SKILL.md本文が500行以内に収まるか？
- [ ] リソース分割が適切に計画されているか？
- [ ] セクション構成が論理的か？
- [ ] メタデータが完全か（name, description, tools, tags, version）？

**完了条件**:

- YAML Frontmatter完成
- セクション構成定義完了
- リソース分割計画策定済み

**成果物**:

- YAML Frontmatter（下書き）
- セクション構成図
- リソース分割計画書

---

### Phase 3: ファイル生成と組織化

**目的**: 設計に基づいてSKILL.mdとリソースを作成する

**主要ステップ**:

1. **ディレクトリ構造の作成**

   ```
   skill-name/
   ├── SKILL.md
   ├── resources/
   │   ├── topic-1.md
   │   ├── topic-2.md
   │   └── advanced-patterns.md
   ├── scripts/
   │   └── validate-skill.mjs
   ├── templates/
   │   └── skill-template.md
   └── assets/
       └── diagram.png
   ```

2. **SKILL.mdの記述（全必須セクション）**
   - YAML Frontmatter
   - 概要（目的、対象、スコープ）
   - 主要概念（3-5個の核心概念）
   - 実践例（具体的なコード例やシナリオ）
   - 関連スキル（フルパス形式）
   - ベストプラクティス
   - トラブルシューティング
   - バージョン履歴

3. **リソースファイルの作成（各<500行）**
   - トピック別に分割
   - 各ファイルは単一責任
   - 相互参照を明記
   - 500行制約厳守

4. **スクリプト・テンプレートの作成（必須）**
   - 検証スクリプト（.mjs形式）: スキル固有の検証ロジック
   - テンプレート（.md, .yaml, .json形式）: 即使用可能な実践テンプレート
   - 実行可能権限付与: `chmod +x scripts/*.mjs`

5. **📚リソース参照セクションの追加（必須）**
   YAML Frontmatterのdescription内に以下の形式で追加:

   ```yaml
   📚 リソース参照:
   このスキルには以下のリソースが含まれています。
   必要に応じて該当するリソースを参照してください:

   - `.claude/skills/[skill-name]/resources/xxx.md`: 具体的説明（30-80文字）
   - `.claude/skills/[skill-name]/templates/xxx.md`: 具体的説明（30-80文字）
   - `.claude/skills/[skill-name]/scripts/xxx.mjs`: 具体的説明（30-80文字）
   ```

   **注意**: 説明は「〜ガイド」「〜パターン集」「スクリプト」「テンプレート」のような
   一般的な表現ではなく、内容を具体的に説明する30-80文字の説明を記載すること

**使用スキル**:

- `.claude/skills/documentation-architecture/SKILL.md`（ファイル組織化）
- `.claude/skills/context-optimization/SKILL.md`（情報の精錬）

**使用コマンド**:

```bash
# ディレクトリ作成
mkdir -p .claude/skills/skill-name/{resources,scripts,templates,assets}

# リソース構造テンプレート
cat .claude/skills/documentation-architecture/templates/resource-structure.md

# 知識文書化テンプレート
cat .claude/skills/knowledge-management/templates/knowledge-document-template.md

# トークン見積もり（各ファイル）
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/skill-name/SKILL.md
```

**判断基準**:

- [ ] すべてのファイルが500行以内か？
- [ ] リソース参照が明確か（catコマンドで読み込み可能）？
- [ ] スクリプトに実行権限があるか？
- [ ] ディレクトリ構造が標準に準拠しているか？
- [ ] 必須セクションがすべて記述されているか？
- [ ] 📚リソース参照セクションが追加されているか？
- [ ] 各リソースの説明が具体的か（30-80文字、一般的表現でない）？

**完了条件**:

- ファイル作成完了（すべて500行以内）
- リソース参照明確化
- スクリプト実行可能
- 📚リソース参照セクション追加済み

**成果物**:

- SKILL.md（完成版、📚リソース参照セクション含む）
- resources/（分割されたリソースファイル、最低1ファイル）
- scripts/（検証スクリプト、最低1ファイル）
- templates/（テンプレートファイル、最低1ファイル）

---

### Phase 4: 品質保証と最適化

**目的**: スキルの品質を検証し、発動信頼性を最適化する

**主要ステップ**:

1. **Progressive Disclosure検証（3層構造が機能するか）**
   - Layer 1: メタデータが明確で発動条件が具体的か
   - Layer 2: 本文が概要として機能するか（詳細はリソースへ）
   - Layer 3: リソースが段階的にアクセス可能か

2. **トークン使用量の見積もり（<20K推奨）**
   - SKILL.md単体: ~5,000トークン
   - resources/合計: ~10,000トークン
   - templates/合計: ~2,000トークン
   - 合計目標: <20,000トークン

3. **発動トリガーの最適化**
   - 単一責任スキル: 発動率目標90%
   - 協調スキル: 発動率目標60%
   - トリガー条件の具体化（曖昧な表現を避ける）
   - 「Use proactively when」の最適化

4. **エージェント統合テスト**
   - エージェントからのスキル参照テスト
   - リソース読み込みテスト
   - スクリプト実行テスト

**使用スキル**:

- `.claude/skills/progressive-disclosure/SKILL.md`（発動信頼性設計）
- `.claude/skills/context-optimization/SKILL.md`（トークン効率）
- `.claude/skills/best-practices-curation/SKILL.md`（品質評価）

**使用コマンド**:

```bash
# 品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/skill-name/SKILL.md

# トークン使用量計算
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs .claude/skills/skill-name

# 構造分析（改善提案）
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/skill-name

# エージェントからの参照テスト
cat .claude/skills/skill-name/SKILL.md
cat .claude/skills/skill-name/resources/topic-1.md
```

**判断基準**:

- [ ] 3層構造が適切に機能するか？
- [ ] トークン使用量が推奨範囲内か（<20,000）？
- [ ] 自動発動が適切に機能するか（発動率目標達成）？
- [ ] リソース読み込みが正常か？
- [ ] スクリプトが正常に実行できるか？

**完了条件**:

- Progressive Disclosure準拠
- トークン<20K
- 発動率目標達成
- 統合テスト成功

**成果物**:

- 品質検証レポート
- トークン使用量レポート
- 発動率測定結果
- 改善提案リスト

---

### Phase 5: 統合とメンテナンス計画

**目的**: スキルをエコシステムに統合し、継続的な品質維持を計画する

**主要ステップ**:

1. **.claude/skills/skill_list.mdへの登録（シンプルテーブル）**

   ```markdown
   | **skill-name** | `.claude/skills/skill-name/SKILL.md` | 簡潔な概要 |
   ```

2. **.claude/agents/agent_list.mdへの登録（3列テーブル）**

   ```markdown
   | スキル名       | パス                                 | 概要       |
   | -------------- | ------------------------------------ | ---------- |
   | **skill-name** | `.claude/skills/skill-name/SKILL.md` | 簡潔な概要 |
   ```

3. **SKILL.mdの「関連スキル」に相対パス記載**

   ```markdown
   ## 関連スキル

   - **knowledge-management** (`.claude/skills/knowledge-management/SKILL.md`): SECIモデル適用
   - **progressive-disclosure** (`.claude/skills/progressive-disclosure/SKILL.md`): 3層開示設計
   ```

4. **更新トリガーとレビューサイクル定義**
   - 更新トリガー:
     - 依存技術のメジャーバージョンアップ
     - ベストプラクティスの変更
     - ユーザーフィードバック
   - レビューサイクル:
     - 四半期ごとの定期レビュー
     - 重大な変更時の臨時レビュー

5. **バージョニング戦略確立**
   - セマンティックバージョニング（Major.Minor.Patch）
   - Major: 破壊的変更
   - Minor: 機能追加
   - Patch: バグ修正

**使用スキル**:

- `.claude/skills/knowledge-management/SKILL.md`（陳腐化防止、Internalization）
- `.claude/skills/best-practices-curation/SKILL.md`（継続的改善）

**使用コマンド**:

```bash
# skill_list.md更新
# 手動編集

# agent_list.md更新
# 手動編集

# バージョン履歴更新
# SKILL.md末尾に追記
```

**判断基準**:

- [ ] .claude/skills/skill_list.mdに正しく登録されているか？
- [ ] .claude/agents/agent_list.mdに正しく登録されているか（該当エージェントがある場合）？
- [ ] 関連スキルにフルパスが記載されているか？
- [ ] メンテナンス計画が定義されているか？
- [ ] バージョニング戦略が明確か？

**完了条件**:

- skill_list.md登録完了
- agent_list.md登録完了（該当エージェントがある場合）
- メンテナンス計画策定済み
- バージョニング戦略確立済み

**成果物**:

- 更新されたskill_list.md
- 更新されたagent_list.md（該当する場合）
- メンテナンス計画書
- バージョニング戦略書

---

## ワークフローB: 既存エージェント改善（軽量化）

### Phase 1-2: 分析とスキル抽出

**目的**: エージェントを分析し、スキルに分離すべき知識を特定する

**主要ステップ**:

1. **エージェント分析（行数、トピック特定）**

   ```bash
   # 行数確認
   wc -l .claude/agents/agent-name.md

   # トピック特定（主要セクション確認）
   grep "^## " .claude/agents/agent-name.md
   ```

2. **スキル分割数決定**
   - **ルール**:
     - 500-800行 → 1スキル
     - 800-1200行 → 2スキル
     - 1200行超 → 3スキル以上
     - 単一責務となるように分離
     - 必要十分なスキル個数を作成

3. **スキル設計と抽出**
   - 各トピックを独立したスキルとして設計
   - 詳細知識をスキルに移動
   - エージェント本体は概要のみ保持

**使用スキル**:

- `.claude/skills/knowledge-management/SKILL.md`（知識抽出）
- `.claude/skills/documentation-architecture/SKILL.md`（構造設計）

**判断基準**:

- [ ] エージェントの現在行数は？
- [ ] 主要トピックは何個あるか？
- [ ] 各トピックの知識量は？（行数）
- [ ] スキル分割数は適切か？

**完了条件**:

- エージェント分析完了
- トピック特定完了
- スキル分割数決定済み
- 抽出すべき知識特定済み

---

### Phase 3: スキル作成

**ワークフローAのPhase 3-5と同じ**

各抽出した知識について、ワークフローAのPhase 3-5を実行:

1. Phase 3: ファイル生成と組織化
2. Phase 4: 品質保証と最適化
3. Phase 5: 統合とメンテナンス計画

---

### Phase 4: エージェント軽量化

**目的**: エージェント本体から詳細知識を削除し、450-550行範囲に収める

**主要ステップ**:

1. **詳細知識削除（概要のみ保持）**
   - 詳細説明 → 概要（1-2段落）
   - 具体例 → スキル参照
   - ベストプラクティス → スキル参照

2. **スキル参照追加（スキル管理セクション）**

   ```markdown
   ## スキル管理

   ### Skill 1: skill-name-1

   - **パス**: `.claude/skills/skill-name-1/SKILL.md`
   - **内容**: 簡潔な説明
   - **使用タイミング**:
     - シチュエーション1
     - シチュエーション2
   ```

3. **目標: 450-550行**
   - 削減目標: 70-80%削減
   - 例: 1000行 → 450行（55%削減）

**使用スキル**:

- `.claude/skills/documentation-architecture/SKILL.md`（構造最適化）
- `.claude/skills/context-optimization/SKILL.md`（情報精錬）

**使用コマンド**:

```bash
# 行数確認
wc -l .claude/agents/agent-name.md

# 重複チェック
diff -u .claude/agents/agent-name.md .claude/skills/skill-name/SKILL.md
```

**判断基準**:

- [ ] 450-550行範囲内か？
- [ ] 詳細知識がすべてスキルに移動されたか？
- [ ] エージェント本体は概要のみか？
- [ ] スキル参照が明確か？
- [ ] 重複がないか？

**完了条件**:

- 450-550行範囲内
- 詳細知識削除完了
- スキル参照追加完了
- 重複なし確認済み

**成果物**:

- 軽量化されたエージェント（450-550行）
- スキル管理セクション（スキル参照リスト）

---

### Phase 5: 検証と統合

**目的**: 軽量化後のエージェントとスキルを検証し、システムに統合する

**主要ステップ**:

1. **重複チェック**
   - エージェントとスキル間の重複確認
   - スキル間の重複確認

2. **行数検証**
   - エージェント: 450-550行
   - スキル: 各500行以内

3. **.claude/skills/skill_list.md、.claude/agents/agent_list.md更新**
   - 新規スキルを登録
   - エージェントの「参照スキル」を更新

**使用スキル**:

- `.claude/skills/best-practices-curation/SKILL.md`（品質評価）
- `.claude/skills/knowledge-management/SKILL.md`（整合性確認）

**使用コマンド**:

```bash
# 行数検証
wc -l .claude/agents/agent-name.md
wc -l .claude/skills/*/SKILL.md

# 重複チェック（キーワード検索）
grep -r "keyword" .claude/agents/agent-name.md .claude/skills/skill-name/SKILL.md
```

**判断基準**:

- [ ] エージェントは450-550行範囲内か？
- [ ] すべてのスキルは500行以内か？
- [ ] 重複がないか？
- [ ] skill_list.md、agent_list.mdが更新されているか？

**完了条件**:

- 重複チェック完了
- 行数検証完了
- システム統合完了

**成果物**:

- 検証レポート
- 更新されたskill_list.md
- 更新されたagent_list.md

---

## ワークフローC: 既存スキル改善

### Phase 1-2: 分析と改善計画

**目的**: スキルの問題を特定し、改善パターンを決定する

**主要ステップ**:

1. **問題特定**
   - **発動率低下**: トリガー条件が曖昧
   - **トークン過多**: リソースが大きすぎる
   - **構造問題**: セクションが不明確、500行超過
   - **陳腐化**: 情報が古い、ベストプラクティスが変更

2. **改善パターン決定**
   - **発動率向上**: トリガー条件の具体化、descriptionの最適化
   - **トークン削減**: リソース分割、情報の精錬
   - **構造改善**: セクション再構成、ファイル分割
   - **内容更新**: 最新情報への更新、陳腐化した情報の削除

**使用スキル**:

- `.claude/skills/progressive-disclosure/SKILL.md`（発動率分析）
- `.claude/skills/context-optimization/SKILL.md`（トークン分析）
- `.claude/skills/knowledge-management/SKILL.md`（陳腐化分析）

**使用コマンド**:

```bash
# トークン使用量計算
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs .claude/skills/skill-name

# 構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/skill-name

# 品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/skill-name/SKILL.md
```

**判断基準**:

- [ ] 問題が明確に特定されたか？
- [ ] 改善パターンが適切か？
- [ ] 改善の優先順位が決まったか？

**完了条件**:

- 問題特定完了
- 改善パターン決定済み
- 優先順位設定済み

**成果物**:

- 問題分析レポート
- 改善計画書

---

### Phase 3-4: 実施と検証

**目的**: 改善を実施し、効果を測定する

**主要ステップ**:

1. **SKILL.md更新**
   - メタデータ最適化（description、トリガー条件）
   - セクション再構成
   - 内容更新

2. **リソース修正**
   - リソース分割（大きすぎる場合）
   - 情報精錬（冗長な場合）
   - 最新情報への更新

3. **効果測定**
   - 発動率測定（before/after）
   - トークン削減率測定
   - 品質スコア測定

**使用スキル**: すべてのスキル（問題に応じて）

**使用コマンド**:

```bash
# トークン使用量計算（改善前後）
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs .claude/skills/skill-name

# 品質検証（改善後）
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/skill-name/SKILL.md
```

**判断基準**:

- [ ] 改善が適切に実施されたか？
- [ ] 効果が測定されたか（数値で）？
- [ ] 副作用がないか（他のスキルへの影響）？

**完了条件**:

- 改善実施完了
- 効果測定完了
- バージョンアップ完了

**成果物**:

- 改善されたスキル
- 効果測定レポート
- 更新されたバージョン履歴

---

## 品質基準と成功の定義

### 完了条件（各Phase）

**Phase 1: 知識の収集と分析**

- 知識範囲定義完了
- 知識源特定完了
- 重複なし確認済み

**Phase 2: スキル構造の設計**

- YAML Frontmatter完成
- 構造定義完了
- リソース分割計画策定済み

**Phase 3: ファイル生成と組織化**

- ファイル作成完了
- 500行以内
- リソース参照明確化

**Phase 4: 品質保証と最適化**

- Progressive Disclosure準拠
- トークン<20K
- 発動率目標達成

**Phase 5: 統合とメンテナンス計画**

- skill_list.md登録完了
- メンテナンス計画策定済み

---

### 成功の定義

**新規スキル作成**:

- スキルがProgressive Disclosure方式で知識を提供
- トークン使用量が推奨範囲内（<20K）
- 発動率が目標達成（単一責任90%、協調60%）
- 効率的に参照でき、継続的に更新・維持される状態

**エージェント軽量化**:

- エージェントが450-550行範囲内
- 詳細知識がすべてスキルに分離
- 重複なし
- 機能性維持

**スキル改善**:

- 問題が解決（発動率向上、トークン削減、構造改善、内容更新）
- 効果が測定可能（数値で証明）
- 副作用なし

---

### エラーハンドリング

**自動リトライ（最大3回）**:

- スクリプト実行エラー
- ファイル読み込みエラー
- バリデーションエラー

**フォールバック（簡略化/テンプレート使用）**:

- 構造設計が複雑すぎる → テンプレート使用
- トークン計算が不正確 → 手動見積もり
- スクリプト実行失敗 → 手動検証

**エスカレーション（人間に確認）**:

- 重複の判断が困難
- 改善パターンが不明
- 品質基準に達しない

---

## 関連スキル

- **knowledge-management** (`.claude/skills/knowledge-management/SKILL.md`): SECIモデル適用、知識キュレーション
- **progressive-disclosure** (`.claude/skills/progressive-disclosure/SKILL.md`): 3層開示設計、発動率最適化
- **documentation-architecture** (`.claude/skills/documentation-architecture/SKILL.md`): ファイル分割、構造設計
- **context-optimization** (`.claude/skills/context-optimization/SKILL.md`): トークン効率化、情報精錬
- **best-practices-curation** (`.claude/skills/best-practices-curation/SKILL.md`): 品質評価、継続的改善
- **skill-librarian-commands** (`.claude/skills/skill-librarian-commands/SKILL.md`): コマンド・スクリプト参照

---

## バージョン履歴

### 1.0.0 (2025-01-27)

- 初版リリース
- ワークフローA（新規スキル作成）Phase 1-5定義
- ワークフローB（既存エージェント軽量化）Phase 1-5定義
- ワークフローC（既存スキル改善）Phase 1-4定義
- 品質基準と成功の定義確立
