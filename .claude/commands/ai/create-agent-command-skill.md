---
description: |
  エージェント、コマンド、スキルを統合的に作成する高度なメタコマンド。
  プロジェクト全体の一貫性を保ちながら、相互に連携する3つのコンポーネントを
  同時に設計・生成します。

  このコマンドは、新しい機能領域や専門分野をプロジェクトに追加する際に、
  必要なすべてのコンポーネントを一度に作成し、適切な依存関係とハンドオフを
  確立します。

  🤖 起動エージェント（Phase別）:
  - Phase 1: `.claude/agents/skill-librarian.md` - スキル作成（知識基盤の構築）
  - Phase 2: `.claude/agents/meta-agent-designer.md` - エージェント作成（実行エンジン構築）
  - Phase 3: `.claude/agents/command-arch.md` - コマンド作成（UIインターフェース構築）

  📚 利用可能スキル（各エージェントが参照）:
  **skill-librarian用:**
  - `.claude/skills/knowledge-management/SKILL.md` - SECIモデル知識変換
  - `.claude/skills/progressive-disclosure/SKILL.md` - 3層開示モデル
  - `.claude/skills/documentation-architecture/SKILL.md` - ドキュメント構造設計

  **meta-agent-designer用:**
  - `.claude/skills/agent-architecture-patterns/SKILL.md` - アーキテクチャパターン選択
  - `.claude/skills/agent-structure-design/SKILL.md` - YAML Frontmatter設計
  - `.claude/skills/agent-persona-design/SKILL.md` - ペルソナ・役割定義
  - `.claude/skills/multi-agent-systems/SKILL.md` - マルチエージェント協調

  **command-arch用:**
  - `.claude/skills/command-structure-fundamentals/SKILL.md` - コマンド基本構造
  - `.claude/skills/command-agent-skill-integration/SKILL.md` - エージェント・スキル統合
  - `.claude/skills/command-best-practices/SKILL.md` - コマンドベストプラクティス

  ⚙️ このコマンドの設定:
  - argument-hint: "[domain-name]"（ドメイン名: 例 performance-optimization）
  - allowed-tools: 3エージェント起動と全コンポーネント生成用
    • Task: 3エージェント起動用
    • Read: 既存コンポーネント参照用
    • Write(.claude/**): エージェント・コマンド・スキル生成用
    • Grep: パターン検索用
    • Bash: 検証スクリプト実行用
  - model: opus（複雑な3コンポーネント統合設計が必要）

  📋 成果物:
  - `.claude/skills/[domain-name]/SKILL.md`（知識基盤）
  - `.claude/agents/[domain-name].md`（実行エンジン）
  - `.claude/commands/ai/[domain-name].md`（UIインターフェース）
  - 統合検証レポート

  🎯 使用シナリオ:
  - 新しい専門分野の完全な統合（例: パフォーマンス最適化、セキュリティ監査）
  - 複雑なワークフローの自動化システム構築
  - マルチエージェント協調システムの新規構築
  - プロジェクト固有のベストプラクティス体系化

  トリガーキーワード: agent-command-skill, エージェント・コマンド・スキル作成, 統合作成, システム構築, 専門分野追加
argument-hint: "[domain-name]"
allowed-tools:
   - Task
   - Read
   - Write(.claude/**)
   - Grep
   - Bash
model: opus
---

# エージェント・コマンド・スキル統合作成コマンド

## 目的

エージェント、コマンド、スキルの3つのコンポーネントを統合的に作成します。
プロジェクト全体の一貫性を保ちながら、相互に連携する完全なシステムを構築します。

## コマンド実行フロー

### 全体像

```
Phase 0: 統合設計（全体アーキテクチャ決定）
  ↓
Phase 1: スキル作成（知識基盤の構築）
  `.claude/agents/skill-librarian.md` による暗黙知の形式知化
  ↓
Phase 2: エージェント作成（実行エンジンの構築）
  `.claude/agents/meta-agent-designer.md` によるペルソナ設計とワークフロー定義
  ↓
Phase 3: コマンド作成（ユーザーインターフェースの構築）
  `.claude/agents/command-arch.md` による統合インターフェース設計
  ↓
Phase 4: 統合検証（依存関係とハンドオフの確認）
  ↓
Phase 5: ドキュメント生成（使用ガイドとテストケース作成）
```

### Phase 0: 統合設計（15-20分）

#### 目的
全体アーキテクチャを決定し、3つのコンポーネント間の依存関係とハンドオフを設計します。

#### アクション

1. **ドメイン分析**
   - ユーザーから以下の情報を収集:
     * ドメイン名（例: performance-optimization, security-audit）
     * 専門分野の詳細（何を自動化・体系化したいか）
     * 対象ユーザー（開発者、運用チーム、セキュリティエンジニア等）
     * 既存システムとの統合要件

2. **アーキテクチャパターン選択**
   - オーケストレーター・ワーカー型
   - ハブアンドスポーク型
   - パイプライン型
   - ステートマシン型
   - いずれかを選択し、理由を明確化

3. **コンポーネント責任分担の決定**
   - **スキル**: どのような知識を体系化するか
   - **エージェント**: どのようなワークフローを実行するか
   - **コマンド**: どのようなユーザーインターフェースを提供するか

4. **依存関係マッピング**
   ```
   コマンド → エージェント → スキル
   ↓           ↓              ↓
   UI層       実行層         知識層
   ```

#### 成果物
- ドメイン設計書（統合アーキテクチャ図）
- 3つのコンポーネントの責任範囲定義
- 依存関係とハンドオフプロトコル

### Phase 1: スキル作成（20-30分）

#### 目的
知識基盤を構築します。エージェントが参照する形式知を体系化します。

#### 使用エージェント
`.claude/agents/skill-librarian.md` - SECIモデルによる暗黙知→形式知変換

#### アクション

1. **暗黙知の収集（Socialization）**
   - ユーザーから暗黙知を収集:
     * どのような経験・ノウハウを形式知化するか
     * 現在の課題や繰り返し発生する問題
     * 対象読者とその専門性レベル

2. **形式知化（Externalization）**
   - SKILL.md本文（500行以内）の設計
   - リソースファイルの分割方針
   - メタデータ（name, description, version）の設計
   - 発動条件とトリガーキーワードの定義

3. **既存知識との統合（Combination）**
   - 関連する既存スキルとの関係性を明確化
   - 重複する知識の統合または参照
   - Progressive Disclosure設計（段階的情報開示）

4. **品質検証（Internalization）**
   - 「いつ使うか」セクションの具体化
   - ワークフローの明確化
   - ベストプラクティスの整理

#### 成果物
```
.claude/skills/[domain-name]/
├── SKILL.md                    # メインファイル（500行以内）
├── resources/                  # 詳細リソース
│   ├── [topic-1].md
│   ├── [topic-2].md
│   └── [topic-3].md
├── scripts/                    # 自動化スクリプト
│   └── [automation].sh
└── templates/                  # テンプレート
    └── [template].md
```

### Phase 2: エージェント作成（30-40分）

#### 目的
実行エンジンを構築します。Phase 1で作成したスキルを参照するエージェントを作成します。

#### 使用エージェント
`.claude/agents/meta-agent-designer.md` - マービン・ミンスキーの『心の社会』に基づく設計

#### アクション

1. **要件分析とアーキテクチャ選択**
   - 専門分野の明確化
   - アーキテクチャパターンの選択
   - 単一責任原則の確認

2. **ペルソナとワークフロー設計**
   - 実在する専門家のペルソナモデリング
   - YAML Frontmatter 設計
   - 5段階ワークフロー設計
   - ツール権限とセキュリティ設定

3. **依存関係と統合設計**
   - スキル依存関係の設計（Phase 1で作成したスキルを参照）
   - エージェント間協調パターンの定義
   - プロジェクト固有要件の統合

4. **品質基準と検証**
   - 完了条件の定義
   - 品質メトリクスの設定
   - テストケースの作成

5. **最適化と完成**
   - System Prompt最適化
   - 450-550行範囲内への調整
   - 最終検証とファイル生成

#### スキル参照設計
```markdown
## スキル管理

このエージェントは以下のスキルを活用します:

### 必須スキル（Mandatory）
- `.claude/skills/[domain-name]/SKILL.md`
  - [使用目的]
  - [Phase 1-5での使用タイミング]
```

#### 成果物
```
.claude/agents/[domain-name].md
- 450-550行範囲内
- 単一責任を持つ特化型エージェント
- Phase 1で作成したスキルへの相対パス参照
- 実在する専門家ベースのペルソナ
- 適切なツール権限設定
```

### Phase 3: コマンド作成（15-20分）

#### 目的
ユーザーインターフェースを構築します。Phase 2で作成したエージェントを起動するコマンドを作成します。

#### 使用エージェント
`.claude/agents/command-arch.md` - コマンド構造とセキュリティ設計

#### アクション

1. **要件収集と初期分析**
   - コマンドの目的と要件をユーザーから収集
   - 適切な命名と配置を決定

2. **コマンド設計**
   - YAML Frontmatter を設計（description、argument-hint、allowed-tools、model）
   - 実装パターンを選択
   - 引数システムを設計

3. **エージェント統合**
   - Phase 2で作成したエージェントの起動ロジック設計
   - Task ツールによるエージェント起動プロトコル
   - エージェントへの適切なコンテキスト伝達

4. **エラーハンドリングとセキュリティ**
   - エラーハンドリング戦略の設計
   - セキュリティレビュー
   - allowed-tools の最小権限設定

5. **ドキュメンテーション**
   - 充実したドキュメンテーションを作成
   - 使用例とトラブルシューティングガイド
   - ベストプラクティスを確認

#### エージェント起動設計
```markdown
## エージェント起動

このコマンドは @[domain-name] エージェントを起動します。

Task ツールで @[domain-name] エージェントを起動し、以下を依頼:

コンテキスト:
- [必要なコンテキスト情報]

@[domain-name] エージェントに以下を依頼:
- Phase 1: [...]
- Phase 2: [...]
- Phase 3: [...]
- Phase 4: [...]
- Phase 5: [...]

期待される成果物:
- [...]

品質基準:
- [...]
```

#### 成果物
```
.claude/commands/ai/[domain-name].md
- YAML Frontmatter の正確な構成
- Phase 2で作成したエージェントへの起動ロジック
- 充実したドキュメンテーション
- 使用例とトラブルシューティングガイド
```

### Phase 4: 統合検証（10-15分）

#### 目的
3つのコンポーネント間の依存関係とハンドオフが正しく機能することを検証します。

#### アクション

1. **依存関係の検証**
   ```bash
   # コマンド → エージェント参照の検証
   grep "@${domain-name}" .claude/commands/ai/${domain-name}.md

   # エージェント → スキル参照の検証
   grep ".claude/skills/${domain-name}" .claude/agents/${domain-name}.md
   ```

2. **YAML構文の検証**
   - 各ファイルのYAML Frontmatterを検証
   - description、name、versionフィールドの一貫性確認

3. **行数制約の検証**
   ```bash
   # スキル: 500行以内
   wc -l .claude/skills/${domain-name}/SKILL.md

   # エージェント: 450-550行範囲内
   wc -l .claude/agents/${domain-name}.md
   ```

4. **相対パス参照の検証**
   - すべてのスキル参照が相対パスを使用しているか確認
   - 絶対パスや名前のみの参照がないか確認

5. **ツール権限の検証**
   - エージェントとコマンドのallowed-toolsが一致しているか確認
   - 最小権限の原則が守られているか確認

#### 成果物
- 統合検証レポート（すべてのチェック項目の合否）
- 問題点のリストと修正提案

### Phase 5: ドキュメント生成（10-15分）

#### 目的
統合されたシステムの使用ガイドとテストケースを生成します。

#### アクション

1. **使用ガイドの生成**
   ```markdown
   # [Domain Name] 使用ガイド

   ## 概要
   [システム全体の概要]

   ## コンポーネント構成
   - スキル: .claude/skills/[domain-name]/SKILL.md
   - エージェント: .claude/agents/[domain-name].md
   - コマンド: .claude/commands/ai/[domain-name].md

   ## 使用方法
   [基本的な使用例]

   ## トラブルシューティング
   [よくある問題と解決策]
   ```

2. **テストケースの生成**
   - 正常系シナリオ（Happy Path）
   - 異常系シナリオ（Error Cases）
   - エッジケース（境界値、極端な入力）

3. **更新手順書の生成**
   - 各コンポーネントの更新手順
   - バージョン管理方針
   - 陳腐化チェックリスト

#### 成果物
```
.claude/docs/[domain-name]/
├── usage-guide.md              # 使用ガイド
├── test-cases.md               # テストケース
└── maintenance.md              # 保守手順書
```

## 使用例

### 基本的な使用

```bash
/ai:create-agent-command-skill performance-optimization
```

対話的に以下の情報を収集:
- ドメイン名: `performance-optimization`
- 専門分野の詳細: システムパフォーマンスの測定、分析、最適化
- 対象ユーザー: バックエンド開発者、SREエンジニア
- 既存システムとの統合要件: プロジェクトのモニタリングシステムと連携

### 引数なしで起動（インタラクティブモード）

```bash
/ai:create-agent-command-skill
```

ドメイン名を含めてすべての情報をインタラクティブに収集します。

### 作成されるコンポーネント例

#### 1. スキル: `.claude/skills/performance-optimization/SKILL.md`
- パフォーマンス測定手法
- ボトルネック分析パターン
- 最適化ベストプラクティス
- 関連リソースとスクリプト

#### 2. エージェント: `.claude/agents/performance-optimization.md`
- ペルソナ: Google SREチームのメソッドに基づく
- ワークフロー: 測定 → 分析 → 最適化 → 検証 → 報告
- スキル参照: performance-optimization/SKILL.md

#### 3. コマンド: `.claude/commands/ai/performance-optimization.md`
- 引数: `[target-component]` - 対象コンポーネント（frontend/backend/database）
- エージェント起動: `.claude/agents/performance-optimization.md`
- セキュリティ: Read、Bash（プロファイラー実行）権限

## 実行プロトコル

### 1. 初期化

```
ドメイン名を確認:
- 引数が指定されている場合: "$ARGUMENTS"
- 引数が未指定の場合: ユーザーに質問
```

### 2. Phase 0: 統合設計

```
ユーザーから以下を収集:
- ドメインの詳細
- 専門分野の範囲
- 対象ユーザー
- 統合要件

アーキテクチャパターンを決定:
- オーケストレーター・ワーカー型
- ハブアンドスポーク型
- パイプライン型
- ステートマシン型

コンポーネント責任分担を設計:
- スキル: [知識の体系化]
- エージェント: [ワークフローの実行]
- コマンド: [UIの提供]
```

### 3. Phase 1-3: コンポーネント作成

```
Task ツールで `.claude/agents/skill-librarian.md` を起動
  ↓
スキル作成完了
  ↓
Task ツールで `.claude/agents/meta-agent-designer.md` を起動
  ↓
エージェント作成完了（スキル参照を含む）
  ↓
Task ツールで `.claude/agents/command-arch.md` を起動
  ↓
コマンド作成完了（エージェント起動ロジックを含む）
```

### 4. Phase 4: 統合検証

```
依存関係チェック:
- コマンド → エージェント参照
- エージェント → スキル参照

YAML構文チェック:
- すべてのコンポーネントのFrontmatter検証

行数制約チェック:
- スキル: 500行以内
- エージェント: 450-550行範囲内

相対パス検証:
- 絶対パスや名前のみの参照がないか確認

ツール権限検証:
- 最小権限の原則が守られているか確認
```

### 5. Phase 5: ドキュメント生成

```
使用ガイド生成:
- 概要、コンポーネント構成、使用方法、トラブルシューティング

テストケース生成:
- 正常系、異常系、エッジケース

保守手順書生成:
- 更新手順、バージョン管理、陳腐化チェック
```

### 6. 完了報告

```
作成されたコンポーネント:
- スキル: .claude/skills/[domain-name]/SKILL.md
- エージェント: .claude/agents/[domain-name].md
- コマンド: .claude/commands/ai/[domain-name].md
- ドキュメント: .claude/docs/[domain-name]/

統合検証結果:
- [すべてのチェック項目の合否]

使用方法:
- /ai:[domain-name] [arguments]
```

## 設計原則

### 1. 関心の分離（Separation of Concerns）

- **スキル**: 知識層（What、How、Why）
- **エージェント**: 実行層（Workflow、Logic、Decision）
- **コマンド**: インターフェース層（UI、Trigger、Arguments）

### 2. 依存性の方向

```
コマンド → エージェント → スキル
(UI層)    (実行層)      (知識層)

依存の方向は一方向のみ。
逆方向の依存（循環依存）は禁止。
```

### 3. Progressive Disclosure

```
Level 1: コマンド（最小限の情報、ユーザー向け）
  ↓
Level 2: エージェント（ワークフロー、AI向け）
  ↓
Level 3: スキル（詳細知識、参照用）
  ↓
Level 4: リソース（高度なトピック、オンデマンド）
```

### 4. 単一責任原則

各コンポーネントは1つの明確な責任を持つ:
- **1スキル = 1トピック** （例: パフォーマンス測定）
- **1エージェント = 1専門分野** （例: パフォーマンス最適化）
- **1コマンド = 1ユーザーアクション** （例: パフォーマンス分析実行）

### 5. 最小権限の原則

- コマンド: ユーザーが意図した操作のみ許可
- エージェント: タスクに必要なツールのみ許可
- スキル: 読み取り専用（ツール権限なし）

### 6. テスト可能性

各コンポーネントは独立してテスト可能:
- スキル: 知識の正確性と完全性を検証
- エージェント: ワークフローの実行可能性を検証
- コマンド: 引数処理とエラーハンドリングを検証

## トラブルシューティング

### コンポーネント間の循環依存

**症状**: エージェントAがエージェントBを参照し、エージェントBがエージェントAを参照している

**原因**: 依存関係の設計ミス

**解決策**:
1. 依存の方向を一方向に統一
2. 共通機能は独立したスキルに抽出
3. アーキテクチャパターンを見直し（オーケストレーター・ワーカー型への変更等）

### スキル参照が解決できない

**症状**: エージェントからスキルを参照しようとするとエラー

**原因**: 絶対パスまたはスキル名のみで参照している

**解決策**:
- ✅ 正しい: `.claude/skills/[domain-name]/SKILL.md`
- ❌ 間違い: `[domain-name]`
- ❌ 間違い: `/Users/.../[domain-name]/SKILL.md`

### コマンドが見つからない

**症状**: 作成したコマンドが `/` で補完されない

**原因**: ファイル配置またはYAML構文エラー

**解決策**:
1. ファイルが `.claude/commands/` ディレクトリにあるか確認
2. YAML Frontmatter の構文をチェック
3. description フィールドが存在するか確認

### エージェントが起動しない

**症状**: コマンド実行時にエージェントが見つからない

**原因**: コマンド内のエージェント参照ミス

**解決策**:
```bash
# コマンドファイル内でエージェント名を確認
grep "@${domain-name}" .claude/commands/ai/${domain-name}.md

# エージェントファイルが存在するか確認
ls .claude/agents/${domain-name}.md
```

### 行数制約違反

**症状**: スキルまたはエージェントが制約を超えている

**原因**: 詳細情報を本文に詰め込みすぎ

**解決策**:
- **スキル（500行超）**: 詳細トピックを `resources/` ディレクトリに分離
- **エージェント（550行超）**: 詳細知識を外部スキルに分離

### ツール権限エラー

**症状**: ツール使用時にパーミッションエラー

**原因**: allowed-tools の設定が不適切

**解決策**:
- 必要なツールが allowed-tools に含まれているか確認
- コマンドとエージェントのallowed-toolsが一致しているか確認
- パスパターン（例: `Write(.claude/**)`）が正しいか確認

## ベストプラクティス

### 1. 段階的構築

複雑なシステムは一度に作らず、段階的に構築:
1. 最小限のスキル（コア知識のみ）
2. シンプルなエージェント（基本ワークフローのみ）
3. 基本的なコマンド（必須引数のみ）
4. フィードバックに基づいて拡張

### 2. 既存コンポーネントの再利用

新しいコンポーネントを作る前に既存を確認:
```bash
# 類似スキルの検索
grep -r "keyword" .claude/skills/*/SKILL.md

# 類似エージェントの検索
grep -r "専門分野" .claude/agents/*.md

# 類似コマンドの検索
grep -r "description" .claude/commands/ai/*.md
```

### 3. ドメインの明確化

ドメイン名は具体的で明確に:
- ✅ 良い例: `api-performance-optimization`
- ❌ 悪い例: `optimization`

### 4. 統合テスト

作成後は必ず統合テストを実行:
```bash
# コマンド実行テスト
/ai:[domain-name] [test-arguments]

# 期待される動作:
# 1. エージェントが正常に起動
# 2. スキルが正しく参照される
# 3. 期待される成果物が生成される
```

### 5. ドキュメントの保守

作成後も定期的に更新:
- 3ヶ月ごとの陳腐化チェック
- 使用例の追加（実際の使用ケースから）
- トラブルシューティングの拡充（よくある問題から）

## 参照

### エージェント
- `.claude/agents/skill-librarian.md` - 知識体系化・スキル作成専門
- `.claude/agents/meta-agent-designer.md` - エージェント設計・ペルソナ定義専門
- `.claude/agents/command-arch.md` - コマンド構造とセキュリティ設計専門

### スキル
- `.claude/skills/knowledge-management/SKILL.md` - SECIモデル知識変換
- `.claude/skills/progressive-disclosure/SKILL.md` - 3層開示モデル
- `.claude/skills/agent-architecture-patterns/SKILL.md` - アーキテクチャパターン選択
- `.claude/skills/command-structure-fundamentals/SKILL.md` - コマンド基本構造

### コマンド
- /ai:create-agent: `.claude/commands/ai/create-agent.md`
- /ai:create-skill: `.claude/commands/ai/create-skill.md`
- /ai:create-command: `.claude/commands/ai/create-command.md`

## 注意事項

- このコマンドは3つのエージェント（`.claude/agents/skill-librarian.md`、`.claude/agents/meta-agent-designer.md`、`.claude/agents/command-arch.md`）を順番に起動します
- 各Phaseは前のPhaseに依存するため、順序を守ることが重要です
- 対話的に要件を収集するため、完了まで60-90分程度かかる場合があります
- model: opus を使用（複雑な統合設計が必要）
- すべてのコンポーネントは相互に一貫性を保つよう設計されます
- 作成後は必ず統合検証を実行してください

## 完成イメージ

```
.claude/
├── skills/
│   └── [domain-name]/
│       ├── SKILL.md (500行以内)
│       ├── resources/
│       ├── scripts/
│       └── templates/
├── agents/
│   └── [domain-name].md (450-550行)
├── commands/
│   └── ai/
│       └── [domain-name].md
└── docs/
    └── [domain-name]/
        ├── usage-guide.md
        ├── test-cases.md
        └── maintenance.md
```

統合されたシステムは、ユーザーが `/ai:[domain-name]` を実行するだけで、
適切なエージェントが起動し、必要なスキルを参照しながら、
期待される成果物を生成します。
