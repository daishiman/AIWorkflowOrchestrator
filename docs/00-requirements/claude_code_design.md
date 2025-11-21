# Claude Code 構成要素の依存関係

## 全体アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                         User (ユーザー)                          │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ├─────────────────┬─────────────────┬─────────────────┐
            │                 │                 │                 │
            ▼                 ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   プロンプト  │  │  /command   │  │  @agent     │  │ ファイル保存 │
    │   入力       │  │  実行        │  │  呼び出し    │  │ Git commit  │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                 │                 │
           │                 │                 │                 │
           ▼                 ▼                 ▼                 ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                    Claude Code Core                          │
    │                                                               │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │              Hooks (イベント監視層)                  │   │
    │  │  • UserPromptSubmit  • PreToolUse  • PostToolUse    │   │
    │  │  • Stop  • SubagentStop  • SessionStart             │   │
    │  └──────────┬──────────────────────────────────────────┘   │
    │             │ トリガー                                      │
    │             ▼                                               │
    │  ┌─────────────────────────────────────────────────────┐   │
    │  │         実行コンポーネント (並列実行可能)            │   │
    │  │                                                       │   │
    │  │  ┌──────────┐    ┌──────────┐    ┌──────────┐      │   │
    │  │  │ Skills   │◄───┤ Commands │◄───┤ Agents   │      │   │
    │  │  │(自動起動)│    │(手動起動)│    │(明示呼出)│      │   │
    │  │  └────┬─────┘    └────┬─────┘    └────┬─────┘      │   │
    │  │       │               │               │             │   │
    │  │       └───────────────┴───────────────┘             │   │
    │  │                       │                             │   │
    │  │                       ▼                             │   │
    │  │              ┌─────────────────┐                    │   │
    │  │              │  Tools (ツール)  │                    │   │
    │  │              │  • Read  • Write │                    │   │
    │  │              │  • Bash  • Grep  │                    │   │
    │  │              │  • MCP Tools     │                    │   │
    │  │              └─────────────────┘                    │   │
    │  └─────────────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────────────┘
```

## 1. Hooks（フック）の依存関係

**Hooksは最上位の監視・制御層**

```
Hooks (settings.json)
│
├─ UserPromptSubmit ──┐
│  (プロンプト送信時) │
│                    ├──► Commands を実行可能
│                    ├──► Agents を起動可能
│                    └──► Scripts を実行
│
├─ PreToolUse ────────┐
│  (ツール実行前)     │
│                    ├──► ツールパラメータを修正
│                    ├──► 実行を承認/拒否
│                    └──► セキュリティチェック実行
│
├─ PostToolUse ───────┐
│  (ツール実行後)     │
│                    ├──► フォーマッター実行
│                    ├──► テスト実行
│                    ├──► Commands をトリガー
│                    └──► ドキュメント更新
│
├─ Stop ──────────────┐
│  (応答終了時)       │
│                    ├──► Git commit実行
│                    ├──► 通知送信
│                    ├──► ログ保存
│                    └──► クリーンアップ
│
├─ SubagentStop ──────┐
│  (サブエージェント  │
│   終了時)          │
│                    ├──► 結果の集約
│                    └──► 次のAgentをトリガー
│
└─ SessionStart ──────┐
   (セッション開始時) │
                     ├──► 環境セットアップ
                     ├──► コンテキスト読み込み
                     └──► 初期化スクリプト実行
```

**具体例：**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write $CLAUDE_FILE_PATHS"
          },
          {
            "type": "command",
            "command": "~/.claude/commands/run-tests.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/agents/code-reviewer.md"
          }
        ]
      }
    ]
  }
}
```

## 2. Skills（スキル）の依存関係

**Skillsは自動起動する知識パッケージ**

```
Skill (SKILL.md)
│
├─ 自動起動トリガー
│  └─ description フィールドのキーワードマッチング
│
├─ 内部構造
│  ├─ workflows/ ──┐
│  │              ├──► Command 1 (write.md)
│  │              ├──► Command 2 (publish.md)
│  │              └──► Command 3 (review.md)
│  │
│  ├─ context/ ────┐
│  │              ├──► formatting.md (フォーマット規則)
│  │              ├──► examples.md (サンプルコード)
│  │              └──► guidelines.md (ガイドライン)
│  │
│  ├─ scripts/ ────┐
│  │              ├──► process.py
│  │              ├──► validate.sh
│  │              └──► transform.js
│  │
│  └─ resources/ ──┐
│                 ├──► templates/
│                 └──► data/
│
└─ 使用するツール
   ├──► Read (ファイル読み込み)
   ├──► Write (ファイル書き込み)
   ├──► Bash (スクリプト実行)
   └──► MCP Tools (外部統合)
```

**Skillsからの依存呼び出し例：**

```
blogging Skill
├─ SKILL.md (メインコントローラー)
│  └─ ルーティングロジック
│     ├─ "write post" を検出
│     │  └──► workflows/write.md Command を実行
│     │
│     ├─ "publish" を検出
│     │  └──► workflows/publish.md Command を実行
│     │     └──► scripts/deploy.sh を実行
│     │        └──► @seo-optimizer Agent を呼び出し
│     │
│     └─ "review" を検出
│        └──► workflows/review.md Command を実行
│           └──► @content-reviewer Agent を呼び出し
│
├─ workflows/
│  ├─ write.md ──────► context/formatting.md を参照
│  │                 └──► context/examples.md を参照
│  │
│  ├─ publish.md ────► scripts/deploy.sh を実行
│  │                 └──► git-commit Skill を起動
│  │
│  └─ review.md ─────► @content-reviewer Agent を呼び出し
│
└─ context/
   ├─ formatting.md (共有される知識)
   └─ examples.md (共有される知識)
```

## 3. Commands（コマンド）の依存関係

**Commandsは手動起動のワークフローオーケストレーター**

```
Command (command-name.md)
│
├─ 手動起動
│  └─ ユーザーが /command-name と入力
│
├─ 依存する他のコンポーネント
│  │
│  ├─ 複数のAgentsを順次実行 ──┐
│  │                          │
│  │  ┌────────────────────────┘
│  │  │
│  │  ├──► @backend-architect (バックエンド設計)
│  │  │    └─ 完了後、結果を次へ渡す
│  │  │
│  │  ├──► @database-architect (DB設計)
│  │  │    └─ バックエンドの設計を考慮
│  │  │
│  │  ├──► @frontend-developer (フロントエンド実装)
│  │  │    └─ APIスペックを受け取る
│  │  │
│  │  ├──► @test-engineer (テスト作成)
│  │  │    └─ 全体の実装を検証
│  │  │
│  │  └──► @security-auditor (セキュリティ監査)
│  │       └─ 最終チェック
│  │
│  ├─ Skillsを活用 ────────────┐
│  │                          │
│  │  └─ kubernetes-deployment Skill
│  │     └─ 自動的に関連知識を提供
│  │
│  └─ ツールを直接使用 ────────┐
│     │                       │
│     ├──► Read (設定ファイル読み込み)
│     ├──► Write (コード生成)
│     ├──► Bash (ビルド・デプロイ)
│     └──► MCP Tools (外部API呼び出し)
│
└─ 実行結果
   └─ Hooks によって PostToolUse がトリガー
      └─ さらなる自動化が実行される
```

**具体的なCommand例：**

```markdown
<!-- /full-stack-app コマンド -->

---
name: full-stack-app
description: フルスタックアプリケーションを作成
---

# フルスタックアプリケーション作成

## Step 1: バックエンド設計
@backend-architect を使用して API 設計を行う
- RESTful API エンドポイント定義
- データモデル設計
→ 結果を変数 $BACKEND_SPEC に保存

## Step 2: データベース設計
@database-architect に $BACKEND_SPEC を渡す
- テーブル設計
- マイグレーションスクリプト作成
→ 結果を $DB_SCHEMA に保存

## Step 3: フロントエンド実装
@frontend-developer に $BACKEND_SPEC を渡す
- React コンポーネント作成
- API 統合
→ react-best-practices Skill が自動起動

## Step 4: テスト作成
@test-engineer を呼び出し
- ユニットテスト
- 統合テスト
- E2Eテスト
→ test-automation Skill が自動起動

## Step 5: セキュリティチェック
@security-auditor で最終監査
- 脆弱性スキャン
- ベストプラクティス確認
→ security-checklist Skill が自動起動

## Step 6: デプロイ準備
kubernetes-deployment Skill を活用
- Dockerfile 作成
- k8s マニフェスト生成
- CI/CD パイプライン設定
```

## 4. Agents（エージェント）の依存関係

**Agentsは並行実行可能な専門家**

```
Agent (agent-name.md)
│
├─ 明示的な呼び出し
│  ├─ @agent-name による直接呼び出し
│  ├─ Command からの呼び出し
│  └─ 他の Agent からの呼び出し
│
├─ 実行時の依存関係
│  │
│  ├─ 複数のSkillsを活用 ────┐
│  │                        │
│  │  ┌─────────────────────┘
│  │  │
│  │  ├──► Skill A (自動起動)
│  │  │    └─ description マッチで起動
│  │  │
│  │  ├──► Skill B (自動起動)
│  │  │    └─ コンテキストに応じて起動
│  │  │
│  │  └──► Skill C (自動起動)
│  │       └─ ファイルタイプに応じて起動
│  │
│  ├─ Commandsを実行 ─────────┐
│  │                        │
│  │  └─ Agent内から /command を呼び出し
│  │     └─ より複雑なワークフローを実行
│  │
│  ├─ 他のAgentsを呼び出し ──┐
│  │                        │
│  │  ├──► @specialized-agent-1
│  │  │    └─ 特定の専門タスク
│  │  │
│  │  └──► @specialized-agent-2
│  │       └─ 別の専門タスク
│  │
│  └─ ツールへの直接アクセス
│     ├──► Read
│     ├──► Write
│     ├──► Bash
│     ├──► Grep
│     └──► MCP Tools
│
└─ 実行コンテキスト
   └─ メインClaudeとは独立したコンテキスト
      └─ 並行実行が可能
```

**具体的なAgent例：**

```markdown
<!-- backend-architect.md -->

---
name: backend-architect
description: バックエンドアーキテクチャの設計専門家
tools: Read, Write, Bash, Grep, Glob
model: claude-sonnet-4
---

# Backend Architect Agent

あなたはバックエンドアーキテクチャの専門家です。

## 実行フロー

### 1. 要件分析
- プロジェクト要件を Read ツールで読み込み
- api-design Skill が自動起動（API設計のベストプラクティス）
- database-patterns Skill が自動起動（DB設計パターン）

### 2. アーキテクチャ設計
- マイクロサービス vs モノリス判断
- architecture-patterns Skill を活用
- 必要に応じて @database-architect を呼び出し
  └─ データベース設計の詳細を委譲

### 3. API設計
- RESTful API エンドポイント定義
- openapi-spec Skill が自動起動
- /generate-api-docs コマンドを実行
  └─ OpenAPI仕様書を自動生成

### 4. セキュリティ考慮
- @security-consultant を呼び出し
  └─ セキュリティレビューを依頼
- security-best-practices Skill が自動起動

### 5. ドキュメント作成
- アーキテクチャ図を作成
- technical-documentation Skill を活用
- /create-diagram コマンドを実行
```

## 5. 複雑な依存関係の実例

### 実例 1: Webアプリケーション開発フロー

```
User: "/create-webapp e-commerce"
  │
  ▼
┌─────────────────────────────────────────┐
│ Command: /create-webapp                 │
└────┬────────────────────────────────────┘
     │
     ├──► Hook: UserPromptSubmit
     │    └─ プロジェクト構造を初期化
     │
     ├──► @project-architect Agent
     │    ├─ project-setup Skill (自動起動)
     │    ├─ /init-git Command 実行
     │    └─ 基本構造を作成
     │
     ├──► @backend-architect Agent
     │    ├─ api-design Skill (自動起動)
     │    ├─ database-patterns Skill (自動起動)
     │    ├─ @database-architect を呼び出し
     │    │   ├─ sql-optimization Skill (自動起動)
     │    │   └─ DBスキーマ生成
     │    └─ API実装
     │
     ├──► Hook: PostToolUse (Write)
     │    ├─ コードフォーマット実行
     │    └─ Lint チェック実行
     │
     ├──► @frontend-developer Agent
     │    ├─ react-best-practices Skill (自動起動)
     │    ├─ typescript-patterns Skill (自動起動)
     │    ├─ @ui-designer を呼び出し
     │    │   ├─ design-system Skill (自動起動)
     │    │   └─ コンポーネント設計
     │    └─ フロントエンド実装
     │
     ├──► Hook: PostToolUse (Write)
     │    ├─ ESLint 実行
     │    └─ Prettier 実行
     │
     ├──► @test-engineer Agent
     │    ├─ testing-strategies Skill (自動起動)
     │    ├─ /generate-tests Command 実行
     │    ├─ ユニットテスト作成
     │    └─ 統合テスト作成
     │
     ├──► Hook: PostToolUse (Bash)
     │    └─ テスト自動実行
     │
     ├──► @devops-engineer Agent
     │    ├─ docker-patterns Skill (自動起動)
     │    ├─ kubernetes-deployment Skill (自動起動)
     │    ├─ /setup-ci-cd Command 実行
     │    └─ デプロイ設定
     │
     └──► Hook: Stop
          ├─ Git commit 実行
          ├─ ドキュメント生成
          └─ 完了通知送信
```

### 実例 2: コードレビューとリファクタリング

```
User: "このコードをレビューしてリファクタリングして"
  │
  ▼
┌─────────────────────────────────────────┐
│ Main Claude がリクエストを解析         │
└────┬────────────────────────────────────┘
     │
     ├──► code-review Skill (自動起動)
     │    └─ レビューチェックリスト提供
     │
     ├──► @code-reviewer Agent
     │    ├─ code-quality Skill (自動起動)
     │    ├─ design-patterns Skill (自動起動)
     │    ├─ security-patterns Skill (自動起動)
     │    │
     │    ├─ 問題点の特定
     │    │   ├─ 複雑度分析
     │    │   ├─ セキュリティ問題検出
     │    │   └─ パフォーマンス問題検出
     │    │
     │    └─ 改善提案を生成
     │
     ├──► Hook: PostToolUse (Read)
     │    └─ 静的解析ツール実行
     │
     ├──► @refactoring-specialist Agent
     │    ├─ refactoring-patterns Skill (自動起動)
     │    ├─ @code-reviewer の結果を受け取る
     │    │
     │    ├─ リファクタリング実施
     │    │   ├─ 関数分割
     │    │   ├─ 重複コード削除
     │    │   └─ デザインパターン適用
     │    │
     │    └─ /run-tests Command 実行
     │
     ├──► Hook: PostToolUse (Write)
     │    ├─ フォーマッター実行
     │    └─ Linter 実行
     │
     ├──► @test-engineer Agent
     │    ├─ リファクタリング後のテスト
     │    └─ カバレッジ確認
     │
     ├──► Hook: PostToolUse (Bash)
     │    └─ テストスイート自動実行
     │
     └──► Hook: Stop
          ├─ @documentation-writer を呼び出し
          │   └─ 変更内容をドキュメント化
          │
          ├─ Git commit (詳細なメッセージ)
          └─ レビュー完了通知
```

## 6. 依存関係マトリックス

| コンポーネント | Skills | Commands | Agents | Hooks | Tools | MCP |
|---------------|--------|----------|--------|-------|-------|-----|
| **Hooks** | ✓呼出可 | ✓呼出可 | ✓呼出可 | - | ✓直接 | ✓可能 |
| **Skills** | ✓参照可 | ✓含む | ✗不可 | - | ✓直接 | ✓可能 |
| **Commands** | ✓活用 | ✓呼出可 | ✓呼出可 | - | ✓直接 | ✓可能 |
| **Agents** | ✓活用 | ✓実行可 | ✓呼出可 | - | ✓直接 | ✓可能 |

**凡例:**
- ✓呼出可: 明示的に呼び出せる
- ✓活用: 自動的に利用される
- ✓含む: 内部に含められる
- ✓参照可: 他のSkillを参照できる
- ✓実行可: 実行を指示できる
- ✓直接: 直接アクセス可能
- ✗不可: 呼び出し不可

## 7. ベストプラクティス

### レイヤー分離の原則

```
┌────────────────────────────────────────┐
│ Hooks（制御層）                         │
│ - 確定的な動作保証                      │
│ - イベント監視と制御                    │
└────────┬───────────────────────────────┘
         │ トリガー
┌────────▼───────────────────────────────┐
│ Commands（オーケストレーション層）      │
│ - 複数のAgentsを調整                   │
│ - ワークフロー定義                      │
└────────┬───────────────────────────────┘
         │ 呼び出し
┌────────▼───────────────────────────────┐
│ Agents（実行層）                       │
│ - 専門的な作業実行                      │
│ - 並行処理                             │
└────────┬───────────────────────────────┘
         │ 活用
┌────────▼───────────────────────────────┐
│ Skills（知識層）                       │
│ - ドメイン知識提供                      │
│ - 自動起動                             │
└────────────────────────────────────────┘
```

### 推奨される依存方向

1. **Hooks → すべて**: Hooksはすべてを制御可能
2. **Commands → Agents, Skills**: Commandsは実行を調整
3. **Agents → Skills, Commands, 他のAgents**: Agentsは必要なものを活用
4. **Skills → 内部のCommands**: Skillsは内部構造のみ

### 避けるべき循環依存

```
❌ 避けるべき:
Skill A → Command B → Agent C → Skill A (循環)

✅ 推奨:
Skill A → Command B → Agent C → Skill D (一方向)
```

## 基本的な判断基準

### Commands を使うべき場合

Commandsはユーザーが開始するショートカットで、/commandと入力してトリガーします。

**推奨シーン：**

1. **複数のAgentsを組み合わせたワークフロー**
   - 例：`/create-webapp` → バックエンド、フロントエンド、テスト、デプロイの各Agentを順次実行
   - Commandがオーケストレーターとして全体を制御

2. **定型的なタスクの繰り返し実行**
   - 例：`/scaffold-api`、`/setup-project`、`/deploy-production`
   - 同じ手順を何度も実行する場合

3. **プロジェクト固有のワークフロー**
   - チーム内で標準化された作業手順
   - プロジェクトの`.claude/commands/`に配置して共有

**メリット：**
- 全体の流れを一つのファイルで管理できる
- 手順が明確で再現性が高い
- チームメンバーと共有しやすい
- 途中経過をメインのClaudeコンテキストで確認できる

**デメリット：**
- メインのコンテキストを消費する
- 長時間のタスクだとコンテキストが肥大化

---

### Agents を使うべき場合

Agentsは並行して作業を実行するスタンドアロンのMarkdownファイルです。

**推奨シーン：**

1. **重い処理や詳細な分析**
   - 例：`@code-reviewer`、`@security-auditor`
   - メインコンテキストを汚さずに深い分析

2. **並行処理が必要な場合**
   - 複数のAgentを同時実行
   - 各Agentが独立したコンテキストで作業

3. **専門的な深い知識が必要**
   - データベース設計、アーキテクチャレビュー
   - その分野の専門家として機能

**メリット：**
- Agentsはスキルとそのコマンドを実行できます
- 独立したコンテキストで動作するため、メインを圧迫しない
- 専門性の高いタスクに集中できる
- 並行実行が可能

**デメリット：**
- メインのClaudeから直接結果を見にくい
- 複数のAgentsの調整が必要な場合は管理が複雑

---

## 実践的な使い分けマトリックス

```
タスクの特性              推奨        理由
─────────────────────────────────────────────────
定型的な手順             Command    再現性と共有性
複数ステップの連携       Command    オーケストレーション
軽量な処理               Command    コンテキスト効率

重い分析                 Agent      コンテキスト分離
専門的な深い作業         Agent      専門性
並行処理が必要           Agent      独立実行
メインを汚したくない     Agent      分離実行

対話的な作業             どちらも×   直接指示
単発のシンプルな質問     どちらも×   直接指示
```

## 具体例での比較

### ケース1: Webアプリケーション作成

**❌ 悪い例（すべてAgent）：**
```
@webapp-creator を呼び出す
→ 全処理が一つのAgentに集中
→ オーケストレーションが困難
→ 途中経過が見えにくい
```

**✅ 良い例（Command + Agents）：**
```
/create-webapp を実行
├─ @backend-architect（重い設計作業）
├─ @frontend-developer（UI実装）
├─ @test-engineer（テスト作成）
└─ @devops-engineer（デプロイ設定）

→ Commandが全体を調整
→ 各専門家Agentが並行作業
→ 進捗が明確
```

### ケース2: コードレビュー

**✅ 推奨（Agent単体）：**
```
@code-reviewer を呼び出す
→ 詳細な分析をメインと分離
→ 長い分析レポートを生成
→ メインのコンテキストを汚さない
```

**△ 代替案（Command）：**
```
/review-code を実行
→ 軽量なレビューなら問題なし
→ ただし詳細分析ならAgentが適切
```

### ケース3: プロジェクトセットアップ

**✅ 推奨（Command）：**
```
/init-project を実行
├─ ディレクトリ構造作成
├─ 設定ファイル生成
├─ Git初期化
└─ 依存関係インストール

→ 定型的な手順
→ 何度も繰り返す
→ Commandが最適
```

## MDさんのプロンプトコンサルティング業務での推奨

あなたの場合、以下のような使い分けがおすすめです：

### Commands向き

1. **クライアントワーク用テンプレート**
   ```
   /create-prompt-template
   /analyze-client-needs
   /generate-consultation-report
   ```
   → 繰り返し行う定型業務

2. **コンテンツ作成ワークフロー**
   ```
   /create-course-material
   /generate-lead-magnet
   /write-blog-post
   ```
   → 複数ステップの連携作業

### Agents向き

1. **専門的な分析**
   ```
   @prompt-analyzer（プロンプト詳細分析）
   @meta-prompt-specialist（メタプロンプト設計）
   @prompt-optimizer（最適化提案）
   ```
   → 深い専門知識が必要

2. **重い処理**
   ```
   @course-content-generator（大量のコンテンツ生成）
   @case-study-analyzer（事例研究）
   ```
   → メインコンテキストを保護

## 最終的な推奨アプローチ

**ハイブリッドアプローチ（最も効果的）：**

```
Command（オーケストレーション）
  ├─ 軽量なステップはCommand内で直接実行
  └─ 重いステップはAgentに委譲

例：/full-consultation
├─ ヒアリング内容の整理（Command内）
├─ @needs-analyzer（重い分析）
├─ プロンプト案の生成（Command内）
├─ @prompt-optimizer（最適化）
└─ レポート作成（Command内）
```

CommandsはAgentsを調整し、Agentsは専門的な作業を実行し、Skillsは自動起動して知識を提供します。

この組み合わせにより、**効率性と保守性の両方**を実現できます！

## まとめ

各コンポーネントは明確な役割と依存関係を持ち、階層的に構成されています：

1. **Hooks**: 最上位の制御層、すべてを監視・制御
2. **Commands**: オーケストレーション層、ワークフロー定義
3. **Agents**: 実行層、専門的な作業を並行実行
4. **Skills**: 知識層、自動起動してコンテキストを提供

この構造により、保守性が高く、拡張可能なClaude Code環境を構築できます。

