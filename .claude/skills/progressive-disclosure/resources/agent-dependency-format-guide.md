# エージェント作成時の📚依存スキル形式ガイド

## 概要

このガイドは、エージェントを作成・修正する際のYAML Frontmatterにおける
「📚 依存スキル」セクションの標準フォーマットを定義します。

**バージョン**: v2.1.0（2025-01-27統一）
**対象**: @meta-agent-designer、@skill-librarian、エージェント開発者

---

## 📚 依存スキル形式（v2.1.0統一）

### 基本構造

エージェントを作成/修正する際、YAML Frontmatterの`description`フィールドに以下の形式で記載:

```yaml
description: |
  [エージェントの簡潔な説明 - 1-2行]

  📚 依存スキル（X個）:
  このエージェントは以下のスキルに専門知識を分離しています。
  タスクに応じて必要なスキルのみを読み込んでください:

  - `.claude/skills/[skill-name-1]/SKILL.md`: [20-40文字の簡潔な説明]
  - `.claude/skills/[skill-name-2]/SKILL.md`: [20-40文字の簡潔な説明]
  - `.claude/skills/[skill-name-3]/SKILL.md`: [20-40文字の簡潔な説明]

  専門分野:
  - [領域1]: [技術/手法]
  - [領域2]: [技術/手法]
  - [領域3]: [技術/手法]

  使用タイミング:
  - [シチュエーション1 - 具体的な発動条件]
  - [シチュエーション2 - 具体的な発動条件]
  - [シチュエーション3 - 具体的な発動条件]
  - [シチュエーション4 - 具体的な発動条件]
  - [シチュエーション5 - 具体的な発動条件]
```

---

## 必須ルール

### 1. スキル数のカウント

**ルール**: 「📚 依存スキル（X個）」のXは正確にカウントすること

**例**:
```yaml
# 正しい
📚 依存スキル（5個）:
- スキル1
- スキル2
- スキル3
- スキル4
- スキル5

# 間違い
📚 依存スキル:  # 数が明記されていない
```

---

### 2. フルパス形式

**ルール**: 全スキルは必ずフルパス形式（`.claude/skills/[name]/SKILL.md`）で記載

**例**:
```yaml
# 正しい
- `.claude/skills/knowledge-management/SKILL.md`: SECIモデル適用

# 間違い
- knowledge-management: SECIモデル適用  # フルパスがない
- `knowledge-management/SKILL.md`: SECIモデル適用  # .claude/skillsが省略されている
```

---

### 3. 簡潔な説明（20-40文字）

**ルール**: 各スキルの説明は20-40文字の範囲で簡潔に

**例**:
```yaml
# 正しい（27文字）
- `.claude/skills/progressive-disclosure/SKILL.md`: 3層開示設計、トークン効率化

# 正しい（38文字）
- `.claude/skills/documentation-architecture/SKILL.md`: ファイル分割パターン、階層設計、リソース最適化

# 間違い（8文字 - 短すぎる）
- `.claude/skills/context-optimization/SKILL.md`: 最適化

# 間違い（85文字 - 長すぎる）
- `.claude/skills/best-practices-curation/SKILL.md`: ベストプラクティスの収集・評価・統合・更新プロセス、情報源の信頼性評価、品質スコアリング、陳腐化防止戦略
```

---

### 4. 「パス: .claude/skills/...」行は不要

**ルール**: 旧形式の「パス: ...」という行は削除すること

**例**:
```yaml
# 正しい（v2.1.0形式）
- `.claude/skills/knowledge-management/SKILL.md`: SECIモデル適用

# 間違い（旧形式）
- `.claude/skills/knowledge-management/SKILL.md`: SECIモデル適用
パス: `.claude/skills/knowledge-management/SKILL.md`  # この行は不要
```

---

## 完全な例

### 5個のスキルを持つエージェント

```yaml
---
name: skill-librarian
description: |
  Claude Codeスキルの設計と最適化を専門とするナレッジエンジニアエージェント。
  野中郁次郎のSECIモデルに基づき、組織知識を体系化し、
  Progressive Disclosure方式で再利用可能なスキルとして形式知化します。

  📚 依存スキル（5個）:
  このエージェントは以下のスキルに専門知識を分離しています。
  タスクに応じて必要なスキルのみを読み込んでください:

  - `.claude/skills/knowledge-management/SKILL.md`: SECIモデル適用、暗黙知→形式知変換
  - `.claude/skills/progressive-disclosure/SKILL.md`: 3層開示設計、発動率向上
  - `.claude/skills/documentation-architecture/SKILL.md`: ファイル分割、階層設計
  - `.claude/skills/context-optimization/SKILL.md`: トークン60-80%削減、遅延読み込み
  - `.claude/skills/best-practices-curation/SKILL.md`: 情報源評価、品質スコアリング

  専門分野:
  - 知識形式知化: SECIモデルによる暗黙知→形式知変換
  - Progressive Disclosure設計: 3層開示モデル（メタデータ→本文→リソース）
  - ドキュメントアーキテクチャ: トピック分割、階層設計、リソース最適化
  - トークン効率化: コンテキスト使用量最小化、段階的ロード設計
  - ベストプラクティス収集: 知識の収集、更新、陳腐化防止

  使用タイミング:
  - 新しいClaude Codeスキルを作成する時
  - 既存エージェントを軽量化する時（1000行超→450-550行）
  - 既存スキルのリファクタリングや最適化時（発動率向上、トークン削減）
  - ベストプラクティスの体系化が必要な時
  - エージェントが参照する知識ベースの構築時

  Use proactively when user mentions creating skills, refactoring agents,
  optimizing existing skills, documenting best practices, or organizing knowledge
  for Claude Code agents.
tools:
  - Read
  - Write
  - Grep
  - Bash
model: sonnet
version: 2.1.0
---
```

---

### 11個のスキルを持つエージェント（@gha-workflow-architect）

```yaml
---
name: gha-workflow-architect
description: |
  GitHub Actions ワークフロー設計の専門家エージェント。
  CI/CD パイプライン構築、セキュリティ強化、コスト最適化を実現します。

  📚 依存スキル（11個）:
  このエージェントは以下のスキルに専門知識を分離しています。
  タスクに応じて必要なスキルのみを読み込んでください:

  - `.claude/skills/github-actions-syntax/SKILL.md`: ワークフロー構文、イベントトリガー
  - `.claude/skills/workflow-templates/SKILL.md`: CI/CD/Docker テンプレート
  - `.claude/skills/matrix-builds/SKILL.md`: マトリックスビルド戦略
  - `.claude/skills/caching-strategies-gha/SKILL.md`: キャッシュパターン、依存関係管理
  - `.claude/skills/artifact-management-gha/SKILL.md`: 成果物管理、保持期間最適化
  - `.claude/skills/secrets-management-gha/SKILL.md`: シークレット管理、OIDC 認証
  - `.claude/skills/github-actions-security/SKILL.md`: セキュリティハードニング
  - `.claude/skills/cost-optimization-gha/SKILL.md`: 実行コスト削減戦略
  - `.claude/skills/reusable-workflows/SKILL.md`: 再利用可能ワークフロー設計
  - `.claude/skills/composite-actions/SKILL.md`: カスタムアクション作成
  - `.claude/skills/github-actions-debugging/SKILL.md`: ワークフローデバッグ手法

  専門分野:
  - CI/CD 設計: テスト自動化、ビルドパイプライン、デプロイ戦略
  - セキュリティ: OIDC、シークレット管理、権限ハードニング
  - パフォーマンス: キャッシュ、並列実行、コスト最適化
  - 保守性: 再利用可能ワークフロー、コンポジットアクション

  使用タイミング:
  - GitHub Actions ワークフローを新規作成する時
  - 既存ワークフローをリファクタリングする時
  - CI/CD パイプラインを最適化する時
  - セキュリティ強化が必要な時
  - コスト削減が求められる時

  Use proactively when creating or optimizing GitHub Actions workflows,
  implementing CI/CD pipelines, improving security, or reducing execution costs.
tools:
  - Read
  - Write
  - Grep
  - Bash
model: sonnet
version: 2.0.0
---
```

---

## スキル作成時の関連スキル形式

**注意**: これはエージェントではなく、スキル作成時の形式です。

### スキル内の「関連スキル」セクション

スキルを作成する際、SKILL.md本文の「関連スキル」セクションでフルパスを使用:

```markdown
## 関連スキル

- **knowledge-management** (`.claude/skills/knowledge-management/SKILL.md`): SECIモデル適用、知識キュレーション
- **progressive-disclosure** (`.claude/skills/progressive-disclosure/SKILL.md`): 3層開示設計、メタデータ最適化
- **documentation-architecture** (`.claude/skills/documentation-architecture/SKILL.md`): ファイル分割、構造設計
```

---

## agent_list.md登録形式

`.claude/agents/agent_list.md`の「参照スキル」も必ずフルパス:

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **knowledge-management** | `.claude/skills/knowledge-management/SKILL.md` | SECIモデル適用 |
| **progressive-disclosure** | `.claude/skills/progressive-disclosure/SKILL.md` | 3層開示設計 |
| **documentation-architecture** | `.claude/skills/documentation-architecture/SKILL.md` | ファイル分割 |
```

---

## チェックリスト

エージェント作成・修正時に確認:

- [ ] 「📚 依存スキル（X個）」のXは正確か？
- [ ] 全スキルがフルパス形式（`.claude/skills/[name]/SKILL.md`）か？
- [ ] 各スキル説明は20-40文字か？
- [ ] 「パス: .claude/skills/...」という行は削除したか？
- [ ] 「専門分野」セクションが3-5個あるか？
- [ ] 「使用タイミング」セクションが5個あるか？
- [ ] 「Use proactively when」が記載されているか？

---

## バージョン履歴

### v2.1.0 (2025-01-27)
- 📚 依存スキル形式を統一
- スキル数カウント必須化
- フルパス形式強制
- 20-40文字制約追加
- 「パス: ...」行削除

### v2.0.0 (2025-01-20)
- agent_list.md形式を3列テーブルに統一
- skill_list.md形式をシンプルテーブルに統一

### v1.0.0 (2025-01-15)
- 初版フォーマット定義
