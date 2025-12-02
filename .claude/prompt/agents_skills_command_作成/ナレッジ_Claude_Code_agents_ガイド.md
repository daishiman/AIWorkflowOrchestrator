# Claude Code エージェント・サブエージェント完全ガイド

## 目次

1. [概念の階層構造](#概念の階層構造)
2. [アーキテクチャ原理](#アーキテクチャ原理)
3. [エージェント詳細仕様](#エージェント詳細仕様)
4. [スキル・コマンドとの関係性](#スキルコマンドとの関係性)
5. [実装パターン](#実装パターン)
6. [ベストプラクティス](#ベストプラクティス)

---

## 1. 概念の階層構造

### 上位概念：マルチエージェントシステムとしての Claude Code

```
┌─────────────────────────────────────────────────────────────┐
│            Claude Code エコシステム全体像                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  メインエージェント（Orchestrator）                    │    │
│  │  - 全体的な調整役                                      │    │
│  │  - コンテキスト管理                                    │    │
│  │  - サブエージェントへの委譲判断                         │    │
│  └──────────┬──────────────────────────────────────────┘    │
│             │                                                 │
│    ┌────────┼────────┐                                       │
│    │        │        │                                       │
│  ┌─▼──┐  ┌─▼──┐  ┌─▼──┐                                    │
│  │Sub │  │Sub │  │Sub │  ← サブエージェント                 │
│  │Agt1│  │Agt2│  │Agt3│    （独立コンテキスト）             │
│  └─┬──┘  └─┬──┘  └─┬──┘                                    │
│    │        │        │                                       │
│  ┌─▼────────▼────────▼─┐                                    │
│  │  共有リソース層       │                                    │
│  │  - Skills           │                                    │
│  │  - Commands         │                                    │
│  │  - MCP Tools        │                                    │
│  │  - Hooks            │                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

#### 1.1 階層レベルの定義

**レベル 0: メタシステム（Claude Code 本体）**

- 用途: エージェント実行環境の提供
- 責務: ライフサイクル管理、ツール提供、セキュリティ

**レベル 1: オーケストレーター（メインエージェント）**

- 用途: タスク全体の調整と戦略的判断
- 責務: サブエージェント選択、コンテキスト保持、結果統合

**レベル 2: サブエージェント（専門エージェント）**

- 用途: 特定ドメインのタスク実行
- 責務: 専門的な問題解決、詳細実装、検証

**レベル 3: リソース層（スキル・コマンド・ツール）**

- 用途: 再利用可能な知識とツール
- 責務: ドメイン知識提供、自動化処理、外部統合

---

## 2. アーキテクチャ原理

### 2.1 根本設計哲学

#### オーケストレーター・ワーカーパターン

**原理:**

- メインエージェント（Opus 4）が戦略的脳として機能
- サブエージェント（Sonnet 4）が専門実行者として機能
- **パフォーマンス向上**: 単一エージェントと比較して 90.2%の性能向上（2025 年 7 月ベンチマーク）

**コンテキスト分離の利点:**

```
単一エージェント方式:
┌──────────────────────────────────────┐
│ 全てが同一コンテキストウィンドウ内:     │
│ - ユーザー指示                        │
│ - アーキテクチャ決定                   │
│ - 実装詳細                            │
│ - エラー処理                          │
│ - クロスシステム統合                   │
│                                       │
│ 問題: コンテキスト腐敗                 │
│ - 古い情報の影響力低下                 │
│ - 指示の忘却                          │
│ - 要件のドリフト                       │
└──────────────────────────────────────┘

マルチエージェント方式:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│Orchestrator │  │  Architect  │  │ Implementer │
│             │  │             │  │             │
│要件保持     │→│設計のみ保持 │→│実装のみ保持 │
│(クリーン)   │  │(クリーン)   │  │(クリーン)   │
└─────────────┘  └─────────────┘  └─────────────┘

利点:
✓ コンテキスト劣化なし
✓ 要件の完全保持
✓ 各フェーズでの明確性維持
```

### 2.2 マイクロサービス inspired アーキテクチャ

**特徴:**

- 各エージェントは独立したサービスとして動作
- 明確に定義されたインターフェース
- 責任の明確な分離

**エージェントライフサイクル:**

```
起動 → 設定 → 実行 → 結果返却 → 終了
  ↓
  ├─ モデル選択（Opus/Sonnet/Haiku）
  ├─ コンテキストウィンドウ割り当て
  ├─ Temperature設定（創造性 vs 精度）
  └─ ツールアクセス権限設定
```

### 2.3 3 層階層パターン

**戦略層（Strategic Tier）:**

- **役割**: 大局的な目的設定、リソース配分
- **例**: Orchestrator, Project Manager Agent
- **モデル**: Opus 4（高度な推論能力）

**調整層（Coordinator Tier）:**

- **役割**: 特定ドメインの管理（研究、分析、コンテンツ作成）
- **例**: Research Coordinator, Development Coordinator
- **モデル**: Opus 4 または Sonnet 4

**実行層（Worker Tier）:**

- **役割**: 具体的タスクの実装
- **例**: Code Writer, Test Generator, Security Scanner
- **モデル**: Sonnet 4 または Haiku 4

**スケーリングパターン:**

```
シンプルなクエリ: 2-3 サブエージェント
  Orchestrator → Developer → Tester

中規模プロジェクト: 5-10 サブエージェント
  Orchestrator → [PM, Architect] → [3x Developer, 2x Tester, Security]

大規模プロジェクト: 20-30 サブエージェント
  Orchestrator
    ├─ Research Coordinator → [5x Research Agents]
    ├─ Dev Coordinator → [8x Dev Agents, 4x Test Agents]
    └─ Ops Coordinator → [3x Deploy Agents, 2x Monitor Agents]
```

---

## 3. エージェント詳細仕様

### 3.1 ファイル構造と必須要素

#### 基本構造

```markdown
---
name: agent-name
description: エージェントの説明と用途
tools:
  - Bash
  - Read
  Write
model: sonnet
---

# エージェント名

## 役割定義

このエージェントの専門分野と責任範囲

## 専門知識

- 知識領域 1
- 知識領域 2

## タスク実行時の動作

1. 初期分析手順
2. 実行フェーズ
3. 検証プロセス

## ツール使用方針

各ツールの使用条件と制約

## コミュニケーションプロトコル

他のエージェントとの連携方法

## 品質基準

完了判定の基準

## エラーハンドリング

例外発生時の対応
```

### 3.2 YAML Frontmatter 詳細

#### name（必須）

```yaml
name: security-auditor
```

- **目的**: エージェントの一意識別子
- **命名規則**: kebab-case 推奨
- **長さ**: 3-50 文字
- **使用場面**:
  - メインエージェントからの明示的呼び出し
  - ログとトレーシング
  - 設定ファイル内での参照

#### description（必須・最重要）

```yaml
description: |
  セキュリティ脆弱性を検出し、SAST分析を実行します。
  コード変更後に自動的に使用され、OWASP Top 10の脆弱性をチェックします。
  SQL injection, XSS, CSRF などの一般的な脆弱性を検出します。
```

**記述のベストプラクティス:**

- **行動指向**: "Use proactively for..." "MUST BE USED when..."
- **具体的トリガー**: いつ使用されるべきか明示
- **スコープ明確化**: 何をする/しないかを明記
- **キーワード含有**: Claude が検索しやすい用語を使用

**良い例 vs 悪い例:**

```yaml
# 悪い例
description: コードレビューをします

# 良い例
description: |
  Use proactively for code quality assessments and security analysis.
  専門分野:
  - セキュリティ脆弱性検出（OWASP Top 10）
  - コード品質メトリクス分析
  - ベストプラクティス違反チェック
  トリガー: ファイル編集後、PR作成前に自動実行
```

#### tools（オプション）

```yaml
tools:
  - Bash
  - Read
  - Write
  - Search
```

- **利用可能ツール一覧**:
  - `Bash`: シェルコマンド実行
  - `Read`: ファイル読み取り
  - `Write`: ファイル書き込み
  - `Edit`: ファイル編集
  - `Search`: コードベース検索
  - `Task`: サブエージェント起動
  - MCP 提供ツール（GitHub, Slack 等）

**ツール選択戦略:**

```yaml
# セキュリティ重視のエージェント（読み取り専用）
tools:
  - Bash
  - Read
  - Search

# 実装エージェント（フル権限）
tools:
  - Bash
  - Read
  - Write
  - Edit
  - Search
  - Task

# オーケストレーター（委譲専門）
tools:
  - Task
  - Read
```

#### model（オプション）

```yaml
model: sonnet # または opus, haiku
```

**モデル選択ガイドライン:**

| タスクタイプ                 | 推奨モデル | 理由                       |
| ---------------------------- | ---------- | -------------------------- |
| 高度な計画・アーキテクチャ   | Opus 4     | 複雑な推論能力             |
| 一般的なコード実装           | Sonnet 4   | バランスの良い性能とコスト |
| シンプルな検証・フォーマット | Haiku 4    | 高速・低コスト             |
| データモデリング             | Opus 4     | 深い分析が必要             |
| テスト生成                   | Sonnet 4   | 十分な能力とコスト効率     |

### 3.3 システムプロンプト構成要素

#### 3.3.1 役割定義セクション

```markdown
## 役割定義

あなたは **[エージェント名]** です。

専門分野:

- [専門領域 1]: [詳細説明]
- [専門領域 2]: [詳細説明]

責任範囲:

- [責任 1]
- [責任 2]
- [責任 3]

制約:

- [しないこと 1]
- [しないこと 2]
```

**例: セキュリティ監査エージェント**

```markdown
## 役割定義

あなたは **Security Auditor** です。

専門分野:

- セキュリティ脆弱性検出: OWASP Top 10 の脆弱性を特定
- SAST 分析: 静的解析ツールの実行と結果解釈
- コンプライアンスチェック: セキュリティ標準への準拠確認

責任範囲:

- コード変更の自動セキュリティスキャン
- 脆弱性レポートの生成
- 修正推奨事項の提供

制約:

- コードの修正は行わない（推奨のみ）
- 本番環境へのアクセス禁止
- センシティブデータの読み取り禁止
```

#### 3.3.2 実行ワークフローセクション

```markdown
## 実行ワークフロー

### フェーズ 1: 初期分析

1. [ステップ 1 の詳細]

   - 使用ツール: [ツール名]
   - 期待結果: [結果形式]

2. [ステップ 2 の詳細]
   - 条件分岐: [判断基準]
   - 次アクション: [アクション名]

### フェーズ 2: 実行

[具体的な実行手順]

### フェーズ 3: 検証

[検証基準と完了条件]
```

**例: テスト駆動開発エージェント**

```markdown
## 実行ワークフロー

### フェーズ 1: テスト作成（RED）

1. 要件の理解
   - 使用ツール: Read
   - 対象: 仕様ファイル、既存コード
2. テストケースの設計

   - ハッピーパスのテスト
   - エッジケースの特定
   - エラーハンドリングのテスト

3. テストコードの作成
   - 使用ツール: Write
   - フレームワーク: プロジェクト標準に従う
   - 実行: `pnpm test` で失敗を確認（RED 状態）

### フェーズ 2: 実装（GREEN）

1. 最小限の実装

   - 使用ツール: Write, Edit
   - テストをパスする最小のコード

2. テスト実行
   - 使用ツール: Bash
   - 全テストがパスすることを確認（GREEN 状態）

### フェーズ 3: リファクタリング（REFACTOR）

1. コード品質改善

   - 重複の削除
   - 可読性の向上
   - パフォーマンス最適化

2. 最終検証
   - テストが引き続きパス
   - コードレビュー基準を満たす
```

#### 3.3.3 ツール使用ガイドライン

```markdown
## ツール使用ガイドライン

### Bash

- **使用条件**: [条件]
- **禁止事項**: [禁止リスト]
- **承認要求**: [要承認の操作]

### Read

- **対象ファイル**: [パターン]
- **読み取り制限**: [制約]

### Write

- **作成可能ファイル**: [パターン]
- **命名規則**: [ルール]
- **テンプレート**: [使用テンプレート]
```

#### 3.3.4 品質基準とハンドオフプロトコル

```markdown
## 品質基準

### 完了条件

- [ ] [必須条件 1]
- [ ] [必須条件 2]
- [ ] [必須条件 3]

### 品質メトリクス

- [メトリクス名]: [目標値]
- [メトリクス名]: [目標値]

## ハンドオフプロトコル

### 次のエージェントへの引き継ぎ

作業完了時、以下の情報を提供:

1. **実施内容サマリー**: [何をしたか]
2. **成果物リスト**: [作成・変更したファイル]
3. **未解決事項**: [残課題]
4. **推奨次ステップ**: [次に何をすべきか]
5. **コンテキスト情報**: [引き継ぎ必要情報]
```

### 3.4 配置場所と優先順位

#### 配置オプション

**1. プロジェクトエージェント（最高優先度）**

```bash
.claude/agents/
├── feature-specific-agent.md
├── team-process-agent.md
└── project-architect.md
```

- **用途**: プロジェクト固有のエージェント
- **共有**: Git でバージョン管理
- **スコープ**: プロジェクトメンバー全員
- **オーバーライド**: ユーザーエージェントより優先

**2. ユーザーエージェント（中優先度）**

```bash
~/.claude/agents/
├── personal-code-reviewer.md
├── my-testing-workflow.md
└── custom-analyzer.md
```

- **用途**: 個人の作業スタイルに合わせたエージェント
- **共有**: 個人のみ
- **スコープ**: 全プロジェクト
- **オーバーライド**: プラグインエージェントより優先

**3. プラグインエージェント（低優先度）**

```bash
/plugin install python-development
→ ~/.claude/plugins/python-development/agents/
```

- **用途**: 汎用的なエージェント
- **共有**: コミュニティ
- **スコープ**: インストールしたユーザー
- **オーバーライド**: 最低優先度

#### 優先順位解決ルール

```
同名エージェントが存在する場合:

1. .claude/agents/security-auditor.md    (プロジェクト)
2. ~/.claude/agents/security-auditor.md  (ユーザー)
3. [plugin]/agents/security-auditor.md   (プラグイン)

→ 1が使用される
```

### 3.5 エージェント起動メカニズム

#### 起動方法の種類

**1. 自動起動（コンテキストマッチング）**

```
ユーザー: "このコードのセキュリティ問題をチェックして"
         ↓
Claude: description フィールドを解析
         ↓
         キーワードマッチング:
         - "セキュリティ"
         - "チェック"
         ↓
security-auditor エージェント起動
```

**動作フロー:**

```
1. ユーザープロンプト受信
2. 全エージェントのdescriptionをスキャン
3. 意味的類似度計算
4. 最適エージェント選択
5. エージェントコンテキスト初期化
6. タスク委譲
```

**2. 明示的起動**

```bash
# @記法で指定
> @security-auditor このファイルをチェック

# 自然言語での指示
> security-auditor エージェントを使って脆弱性をスキャンして
```

**3. 連鎖起動（エージェント間委譲）**

```markdown
## Orchestrator Agent の判断

タスク: 新機能の完全な実装

判断:

1. @pm-spec-agent で要件定義
   ↓ 完了
2. @architect-review-agent で設計
   ↓ 完了
3. @implementer-tester-agent で実装とテスト
   ↓ 完了
4. @code-reviewer-agent でレビュー
```

**4. フックトリガー起動**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Use @security-auditor to scan changes'"
          }
        ]
      }
    ]
  }
}
```

---

## 4. スキル・コマンドとの関係性

### 4.1 三位一体の協調モデル

```
┌─────────────────────────────────────────────────────────┐
│                   タスク実行レイヤー                      │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐      ┌────▼────┐      ┌─────▼──────┐
   │ エージェント│      │ スキル  │      │ コマンド   │
   │(Who)     │      │(Know)   │      │(Do)        │
   └──────────┘      └─────────┘      └────────────┘
        │                  │                  │
   意思決定者         知識提供者          実行者
   委譲・調整         段階的開示          即時アクション
```

### 4.2 エージェント ⇄ スキル 相互作用

#### 相互作用パターン 1: スキル参照

````markdown
# Agent: kubernetes-architect.md

---

name: kubernetes-architect
description: Kubernetes deployment expert

---

## 実行時の動作

### ステップ 1: 設定分析

Kubernetes 設定を理解するため、**k8s-best-practices** スキルを参照:

```bash
cat ~/.claude/skills/k8s-best-practices/SKILL.md
```
````

### ステップ 2: マニフェスト生成

**k8s-manifest-generation** スキルのテンプレートを使用...

```

**フロー:**
```

1. ユーザー: "本番用の K8s deployment を作成"
2. kubernetes-architect エージェント起動
3. エージェントが k8s-best-practices スキル読み込み
4. スキル内の Progressive Disclosure:
   - SKILL.md（概要）
   - /production/PRODUCTION.md（詳細）
   - /security/SECURITY.md（セキュリティ）
5. エージェントが知識を活用してマニフェスト生成

````

#### 相互作用パターン2: スキル駆動のエージェント選択
```markdown
# Skill: python-testing/SKILL.md
---
name: python-testing
description: |
  Pytestフレームワークを使用したテスト作成ガイダンス
  推奨エージェント: @test-generator-agent
---

## 使用方法
このスキルは @test-generator-agent と組み合わせて使用することで
最大の効果を発揮します...
````

### 4.3 エージェント ⇄ コマンド 相互作用

#### 相互作用パターン 1: コマンドによるエージェント起動

```markdown
# Command: /security-audit.md

---

## description: セキュリティ監査を実行

以下の手順で監査を実行します:

1. @security-auditor エージェントを起動
2. OWASP Top 10 のチェックを実行
3. 結果を Markdown レポートで出力
```

**実行フロー:**

```bash
ユーザー入力: /security-audit src/

↓

コマンド実行:
  1. security-auditor エージェント起動
  2. エージェントが src/ ディレクトリをスキャン
  3. 脆弱性検出ロジック実行
  4. レポート生成

↓

出力: security-report.md
```

#### 相互作用パターン 2: エージェント内でのコマンド使用

```markdown
# Agent: full-stack-developer.md

---

## name: full-stack-developer

## タスク実行手順

### フロントエンド開発フェーズ

1. `/scaffold-react` コマンドでプロジェクト構造を生成
2. コンポーネント実装
3. `/test-generate` コマンドでテスト作成

### バックエンド開発フェーズ

1. `/api-scaffold` コマンドで API 構造を生成
2. エンドポイント実装
3. `/test-generate` コマンドで API テスト作成
```

### 4.4 三者統合パターン

#### パターン 1: パイプラインワークフロー

```
/feature-development コマンド
    ↓
pm-spec-agent エージェント起動
    ↓ (requirements-gathering スキル使用)
    ↓
architect-review-agent エージェント起動
    ↓ (system-design スキル使用)
    ↓
implementer-agent エージェント起動
    ↓ (coding-standards スキル使用)
    ↓ (/test-generate コマンド実行)
    ↓
code-reviewer-agent エージェント起動
    ↓ (review-checklist スキル使用)
```

#### パターン 2: Hub-and-Spoke（ハブアンドスポーク）

```
           ┌──────────────┐
           │ Orchestrator │
           │   (Hub)      │
           └───────┬──────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
  ┌───▼──┐    ┌───▼──┐    ┌───▼──┐
  │Spoke1│    │Spoke2│    │Spoke3│
  │Agent │    │Agent │    │Agent │
  └───┬──┘    └───┬──┘    └───┬──┘
      │            │            │
  [Skills]    [Commands]   [Skills]
```

**実装例:**

```markdown
# Orchestrator

@task-orchestrator が中央ハブとして機能

受信タスク: "EC サイトのチェックアウト機能を実装"

判断と委譲:

1. @payment-integration-agent (Spoke)
   → payment-processing スキル使用
2. @database-architect-agent (Spoke)
   → /schema-design コマンド実行
   → database-optimization スキル参照
3. @frontend-developer-agent (Spoke)
   → /react-component コマンド実行
   → ui-patterns スキル参照

各 Spoke が独立して作業、結果を Hub に返却
Orchestrator が統合と最終検証
```

### 4.5 依存関係マトリクス

| 要素             | エージェント                | スキル                       | コマンド                   |
| ---------------- | --------------------------- | ---------------------------- | -------------------------- |
| **エージェント** | - 委譲関係<br>- 階層構造    | READ 関係<br>参照・活用      | EXECUTE 関係<br>実行・起動 |
| **スキル**       | INFORM 関係<br>知識提供     | - 参照関係<br>- モジュール化 | GUIDE 関係<br>使用推奨     |
| **コマンド**     | INVOKE 関係<br>起動トリガー | LEVERAGE 関係<br>知識利用    | - 連鎖実行<br>- 組み合わせ |

### 4.6 実践的な統合例

#### 例 1: TDD（テスト駆動開発）ワークフロー

**構成要素:**

- エージェント: `tdd-implementer-agent`
- スキル: `test-driven-development`, `pytest-patterns`
- コマンド: `/tdd-cycle`

**実行フロー:**

```
ユーザー: /tdd-cycle "ユーザー認証機能"

↓ コマンド実行

1. tdd-implementer-agent 起動

2. RED フェーズ
   - test-driven-development スキル読み込み
   - テスト作成ガイドライン取得
   - pytest-patterns スキルからテンプレート取得
   - 失敗するテストを作成

3. GREEN フェーズ
   - 最小実装でテストをパス
   - coding-standards スキル参照

4. REFACTOR フェーズ
   - /code-quality コマンド実行
   - @code-reviewer-agent に委譲
   - review-checklist スキル使用

5. 完了レポート生成
```

#### 例 2: セキュリティ強化パイプライン

**構成要素:**

- オーケストレーター: `security-orchestrator-agent`
- 実行エージェント群:
  - `static-analyzer-agent`
  - `dependency-scanner-agent`
  - `penetration-tester-agent`
- スキル:
  - `owasp-top-10`
  - `secure-coding-practices`
  - `vulnerability-assessment`
- コマンド:
  - `/security-scan`
  - `/dependency-audit`
  - `/fix-vulnerabilities`

**実行フロー:**

```
ユーザー: /security-scan

↓

security-orchestrator-agent (Hub) 起動

↓ 並列実行開始

[Branch 1]                [Branch 2]                [Branch 3]
static-analyzer-agent     dependency-scanner-agent  penetration-tester-agent
↓                         ↓                         ↓
owasp-top-10 スキル使用    /dependency-audit 実行    vulnerability-assessment
↓                         ↓                         スキル使用
SAST実行                  依存関係チェック           動的スキャン

↓ 結果統合

security-orchestrator が全結果を集約

↓ 優先順位付け

secure-coding-practices スキル参照で修正推奨生成

↓ 自動修正提案

/fix-vulnerabilities コマンド提案

↓ レポート出力

セキュリティレポート生成（critical/high/medium/low）
```

---

## 5. 実装パターン

### 5.1 基本パターン

#### パターン 1: Single Responsibility Agent

```markdown
---
name: commit-message-generator
description: Git commit message generator following Conventional Commits
tools:
  - Bash
  - Read
model: sonnet
---

# Commit Message Generator

## 役割

Conventional Commits 仕様に従ったコミットメッセージを生成

## 実行手順

1. `git diff --staged` 実行
2. 変更内容分析
3. 適切な type 決定（feat/fix/docs/style/refactor/test/chore）
4. 50 文字以内のサマリー作成
5. 必要に応じて詳細説明追加

## 制約

- Co-author 情報は追加しない
- 破壊的変更は BREAKING CHANGE: で明示
```

#### パターン 2: Coordinating Agent

```markdown
---
name: feature-orchestrator
description: Coordinates full feature development lifecycle
tools:
  - Task
  - Read
  - Write
model: opus
---

# Feature Development Orchestrator

## 役割

機能開発の全ライフサイクルを調整

## オーケストレーションフロー

### Phase 1: Planning

1. @pm-spec-agent に要件定義を委譲
2. 結果を requirements.md に保存
3. Quality Gate 1: 要件の明確性チェック（95 点以上）

### Phase 2: Architecture

1. @architect-review-agent に設計を委譲
2. 結果を architecture.md に保存
3. Quality Gate 2: 技術的実現可能性チェック（90 点以上）

### Phase 3: Implementation

1. タスクリストを task-breakdown.md に生成
2. 各タスクを @implementer-agent に委譲
3. 進捗追跡と並列実行管理

### Phase 4: Quality Assurance

1. @test-coverage-agent でテストカバレッジ確認
2. @security-auditor でセキュリティチェック
3. @code-reviewer で最終レビュー

### Phase 5: Documentation

1. @documentation-generator にドキュメント生成を委譲
2. README.md, CHANGELOG.md 更新

## 品質ゲート

各フェーズの完了基準を満たさない場合、前フェーズに戻る

## 成果物

- requirements.md
- architecture.md
- task-breakdown.md
- 実装コード（複数ファイル）
- テストスイート
- ドキュメント
- 進捗レポート
```

### 5.2 高度なパターン

#### パターン 3: State Machine Agent

```markdown
---
name: deployment-workflow-agent
description: Manages deployment workflow with state transitions
tools:
  - Bash
  - Read
  - Write
  - Task
model: sonnet
---

# Deployment Workflow Agent

## 状態遷移図
```

IDLE → PREPARING → TESTING → STAGING → VALIDATING → PRODUCTION → COMPLETE
↓ ↓ ↓ ↓ ↓ ↓
ERROR ← ERROR ← ERROR ← ERROR ← ROLLBACK ← ROLLBACK

```

## 状態定義

### IDLE
- 初期状態
- トリガー待機

### PREPARING
- ビルド実行
- アーティファクト生成
- 成功 → TESTING
- 失敗 → ERROR

### TESTING
- @test-runner-agent に委譲
- 全テストパス → STAGING
- テスト失敗 → ERROR

### STAGING
- ステージング環境へデプロイ
- smoke test実行
- 成功 → VALIDATING
- 失敗 → ROLLBACK

### VALIDATING
- @qa-automation-agent に検証依頼
- 承認 → PRODUCTION
- 却下 → ROLLBACK

### PRODUCTION
- 本番デプロイ
- ヘルスチェック
- 成功 → COMPLETE
- 失敗 → ROLLBACK

### ERROR
- エラーログ収集
- 通知送信
- 手動介入待機

### ROLLBACK
- 前バージョンへロールバック
- 影響範囲調査

### COMPLETE
- デプロイ完了レポート
- メトリクス記録
```

#### パターン 4: Learning Agent

````markdown
---
name: pattern-recognition-agent
description: Learns from past code patterns and suggests improvements
tools:
  - Read
  - Search
  - Write
model: opus
---

# Pattern Recognition Agent

## 学習メカニズム

### データ収集

1. Git 履歴から過去の変更パターンを分析
2. 頻出するリファクタリングパターンを抽出
3. エラー修正の共通パターンを学習

### パターンデータベース

場所: `.claude/patterns/learned-patterns.json`

構造:

```json
{
  "patterns": [
    {
      "id": "pattern-001",
      "type": "refactoring",
      "before": "重複コードパターン",
      "after": "DRY原則適用パターン",
      "frequency": 15,
      "success_rate": 0.93
    }
  ]
}
```
````

### 推奨アルゴリズム

1. 現在のコードから特徴抽出
2. learned-patterns.json と照合
3. 類似度計算（コサイン類似度）
4. 閾値 0.8 以上で推奨提示
5. 適用後の結果を学習データに追加

### フィードバックループ

```
コード分析 → パターン照合 → 推奨提示 → 適用
                                        ↓
学習データベース更新 ← 結果評価 ← 実行結果
```

````

### 5.3 複合パターン

#### パターン5: Pipeline Pattern
```markdown
# agents/pipeline-stages.md

## Stage 1: Analysis Agent
---
name: analysis-agent
next_stage: design-agent
---
入力を分析し、設計エージェントへ渡す

## Stage 2: Design Agent
---
name: design-agent
previous_stage: analysis-agent
next_stage: implementation-agent
---
設計を作成し、実装エージェントへ渡す

## Stage 3: Implementation Agent
---
name: implementation-agent
previous_stage: design-agent
next_stage: testing-agent
---
コードを実装し、テストエージェントへ渡す

## Stage 4: Testing Agent
---
name: testing-agent
previous_stage: implementation-agent
next_stage: deployment-agent
---
テストを実行し、デプロイエージェントへ渡す

## Stage 5: Deployment Agent
---
name: deployment-agent
previous_stage: testing-agent
---
デプロイを実行し、完了
````

**ハンドオフコントラクト:**

````markdown
## ハンドオフ形式

各ステージは以下の標準フォーマットで次のステージへ引き継ぎ:

```json
{
  "stage": "current_stage_name",
  "status": "success|failure|partial",
  "output": {
    "artifacts": ["file1.md", "file2.py"],
    "summary": "What was accomplished",
    "context": {
      "key_decisions": [],
      "unresolved_issues": [],
      "next_steps": []
    }
  },
  "metadata": {
    "duration": "5m30s",
    "model_used": "sonnet",
    "token_count": 15420
  }
}
```
````

````

---

## 6. ベストプラクティス

### 6.1 設計原則

#### 原則1: 単一責任の原則（SRP）
```markdown
✓ 良い例:
- commit-message-generator: コミットメッセージ生成のみ
- security-scanner: セキュリティスキャンのみ
- test-generator: テスト生成のみ

✗ 悪い例:
- super-agent: 設計、実装、テスト、デプロイ全てを実行
  → コンテキスト肥大化、保守困難
````

#### 原則 2: コンテキスト分離の原則

```markdown
メインエージェントの禁止事項:

- 実装コードの直接作成 ❌
- 詳細な分析作業 ❌
- テストの直接実行 ❌

メインエージェントの責務:

- タスクの分解と委譲 ✓
- 全体計画の保持 ✓
- 結果の統合 ✓

理由:
メインエージェントが実装を始めると、全体計画の品質が劣化する
（実証済みの失敗パターン）
```

#### 原則 3: Progressive Disclosure 原則

```markdown
エージェントの情報読み込み戦略:

1. 常に読み込み: description（必須）
2. 必要時に読み込み: システムプロンプト本体
3. 参照時に読み込み: スキルの詳細
4. 実行時に読み込み: 外部ドキュメント

利点:

- トークン使用量の最小化
- コンテキストウィンドウの効率的利用
- 実質無制限の知識ベース
```

### 6.2 命名規則

#### エージェント名

```markdown
形式: [domain]-[role]-agent

例:

- security-auditor-agent
- frontend-developer-agent
- database-architect-agent
- test-coverage-analyzer-agent

避けるべき:

- agent1, agent2 (意味不明)
- do-everything (責任範囲不明)
- helper (曖昧)
```

#### Description 文の構造

```markdown
テンプレート:
"""
[主要機能を 1 文で]。[対象ドメイン/技術]に特化。

専門分野:

- [専門領域 1]: [詳細]
- [専門領域 2]: [詳細]

使用タイミング:

- [トリガー条件 1]
- [トリガー条件 2]

[プロアクティブ指示（オプション）]
"""

例:
"""
セキュリティ脆弱性を検出し、OWASP Top 10 に基づく分析を実行します。
Web アプリケーション、API、データベースクエリに特化。

専門分野:

- SAST 分析: 静的コード解析による脆弱性検出
- 依存関係スキャン: ライブラリの既知脆弱性チェック
- コンプライアンス検証: セキュリティ標準への準拠確認

使用タイミング:

- コード変更後の自動スキャン
- PR 作成前のセキュリティチェック
- デプロイ前の最終検証

Use proactively after any file edit in src/ or api/ directories.
"""
```

### 6.3 ツール権限の設計

#### 最小権限の原則

```markdown
読み取り専用エージェント:
tools:
  - Read
  - Search
例:

- code-reviewer-agent
- security-auditor-agent
- metrics-analyzer-agent

読み書きエージェント（制限付き）:
tools:
  - Read
  - Write
  - Search
write_paths: ["src/**/*.test.js", "tests/**"]
例:

- test-generator-agent

フル権限エージェント:
tools:
  - Bash
  - Read
  - Write
  - Edit
  - Search
  - Task
approval_required: true
例:

- deployment-agent
- database-migration-agent

委譲専門エージェント:
tools:
  - Task
  - Read
例:

- orchestrator-agent
- pipeline-coordinator-agent
```

### 6.4 エラーハンドリング

#### パターン 1: Graceful Degradation

````markdown
## エラーハンドリング戦略

### レベル 1: リトライ

エラー発生時、3 回まで自動リトライ

- 指数バックオフ: 1s, 2s, 4s
- 各リトライで異なるアプローチを試行

### レベル 2: フォールバック

3 回失敗後、代替手段を試行:

1. 簡略化されたアプローチ
2. 別のツール使用
3. 人間への質問

### レベル 3: Explicit Handoff

代替手段も失敗した場合:

```json
{
  "status": "failed",
  "attempted_approaches": [
    "Primary approach using tool X",
    "Fallback 1: Simplified approach",
    "Fallback 2: Alternative tool Y"
  ],
  "error_details": "...",
  "human_assistance_required": true,
  "suggested_question": "次のどちらの方向で進めますか？\n1. ...\n2. ..."
}
```
````

### レベル 4: ロギング

全エラーを `.claude/logs/agent-errors.jsonl` に記録

````

### 6.5 テストとデバッグ

#### エージェントのユニットテスト
```bash
# テストコマンドの作成
.claude/commands/test-agent.md
````

````markdown
---
description: Test an agent in isolation
---

# Agent Unit Test

エージェントをテスト環境で実行:

1. テストケース作成
   ```bash
   mkdir -p .claude/tests/agents
   cat > .claude/tests/agents/test-cases.json << EOF
   [
     {
       "agent": "security-auditor-agent",
       "input": "Scan src/auth.js",
       "expected_behavior": "Detect SQL injection vulnerability",
       "timeout": 60
     }
   ]
   EOF
   ```
````

2. エージェント実行
   `@$ARGUMENTS` を指定のテストケースで実行

3. 結果検証

   - 期待された動作をしたか
   - タイムアウトしなかったか
   - エラーなく完了したか

4. レポート生成
   結果を `.claude/tests/results/` に保存

````

#### デバッグモード
```markdown
## デバッグ用エージェント

---
name: debug-wrapper-agent
description: Wraps any agent with debug logging
tools:
  - Task
  - Write
---

# Debug Wrapper

## 使用方法
`@debug-wrapper-agent @target-agent [args]`

## 動作
1. ターゲットエージェント実行前の状態を記録
2. エージェントを実行
3. 以下を記録:
   - 実行時間
   - 使用ツール
   - 中間出力
   - 最終結果
   - エラー（あれば）

## 出力
`.claude/debug/[agent-name]-[timestamp].log`
````

### 6.6 パフォーマンス最適化

#### トークン使用量の最適化

```markdown
## 戦略 1: Lazy Loading

必要になるまでスキルを読み込まない

悪い例:

1. 全スキルの SKILL.md を読み込み
2. 全スキルの詳細を読み込み
3. タスク実行

良い例:

1. タスク内容を分析
2. 関連スキルの SKILL.md のみ読み込み
3. 必要な詳細のみ段階的に読み込み
4. タスク実行

トークン削減: 約 60-80%

## 戦略 2: Context Compaction

長いセッションでの自動最適化

タイミング:

- コンテキスト使用率 > 80%
- 15 分以上の連続作業

動作:

- 完了タスクのサマリー化
- 重要情報の保持
- 詳細の削除

## 戦略 3: Model Selection

タスクに応じた適切なモデル選択

| タスク     | モデル | トークン/実行 | コスト |
| ---------- | ------ | ------------- | ------ |
| 高度な計画 | Opus   | 15K           | $$$    |
| 実装       | Sonnet | 8K            | $$     |
| 検証       | Haiku  | 3K            | $      |

適切な選択で 50-70% コスト削減
```

#### 並列実行の最適化

````markdown
## 並列実行可能な条件

- ファイルの重複なし
- 依存関係なし
- 副作用の衝突なし

## 実装例

```json
{
  "parallel_tasks": [
    {
      "agent": "frontend-developer-agent",
      "files": ["src/components/**"],
      "priority": "high"
    },
    {
      "agent": "backend-developer-agent",
      "files": ["src/api/**"],
      "priority": "high"
    },
    {
      "agent": "test-generator-agent",
      "files": ["tests/**"],
      "priority": "medium"
    }
  ]
}
```
````

## 衝突検出

Hook で監視:

```bash
# PreToolUse hook
if [ "$CLAUDE_TOOL" = "Edit" ]; then
  check_file_lock "$CLAUDE_FILE_PATH"
fi
```

## 結果

- 実行時間: 60-75% 削減
- スループット: 2-3 倍向上

````

### 6.7 セキュリティベストプラクティス

```markdown
## 原則1: Least Privilege
エージェントには必要最小限の権限のみ

## 原則2: Path Restriction
```yaml
tools:
  - Write
write_allowed_paths:
  - "src/**/*.test.js"
  - "tests/**"
  - "docs/**/*.md"
write_forbidden_paths:
  - ".env"
  - "**/*.key"
  - "package-lock.json"
  - ".git/**"
````

## 原則 3: Approval Gates

危険な操作は承認必須

```yaml
tools:
  - Bash
approval_required_for:
  - commands_matching: "rm -rf"
  - commands_matching: "sudo"
  - commands_matching: "curl.*>.*sh"
```

## 原則 4: Audit Logging

全エージェント操作を記録

```bash
# PostToolUse hook
log_agent_action() {
  echo "$(date -Iseconds)|$AGENT_NAME|$TOOL_NAME|$FILE_PATHS" \
    >> .claude/logs/audit.log
}
```

````

---

## 7. トラブルシューティング

### よくある問題と解決策

#### 問題1: エージェントが起動しない
```markdown
症状: エージェントへの言及があるが起動しない

診断:
1. description フィールドが具体的か確認
2. キーワードが適切か確認
3. 配置場所が正しいか確認

解決:
# descriptionを改善
description: |
  Use proactively for security analysis.
  専門分野: OWASP Top 10, SAST, dependency scanning
  トリガー: after file edits in src/, api/
````

#### 問題 2: コンテキスト汚染

```markdown
症状: エージェントが以前のタスクの情報を混同

原因: サブエージェントのコンテキスト分離不足

解決:

- 各エージェントに明確なスコープを定義
- メインエージェントは詳細作業をしない
- ハンドオフ時に必要情報のみ渡す
```

#### 問題 3: 無限ループ

````markdown
症状: エージェントが終了しない

原因:

- 完了条件が不明確
- エージェント間の循環参照

解決:

```yaml
max_iterations: 10
timeout: 300 # 5 minutes
exit_conditions:
  - all_tests_pass: true
  - coverage_threshold: 80
  - no_critical_issues: true
```
````

```

---

このガイドは Claude Code の公式ドキュメント、GitHub リポジトリ、コミュニティのベストプラクティスから抽出した包括的な情報を基に作成されています。
```
