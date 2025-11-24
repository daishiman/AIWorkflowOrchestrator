---
name: command-placement-priority
description: |
  コマンドの配置場所と優先順位を専門とするスキル。
  プロジェクトコマンド、ユーザーコマンド、MCPプロンプトの違い、
  優先順位解決、名前空間の活用を提供します。

  使用タイミング:
  - コマンドをどこに配置するか決定する時
  - 同名コマンドの優先順位を理解したい時
  - 名前空間を活用したい時

  Use proactively when deciding command placement, understanding priority resolution,
  or utilizing namespaces.
version: 1.0.0
---

# Command Placement & Priority

## 概要

このスキルは、Claude Codeコマンドの配置場所と優先順位を提供します。
プロジェクトコマンド、ユーザーコマンド、MCPプロンプトの違いと優先順位解決により、
効率的で柔軟なコマンド管理を実現できます。

**主要な価値**:
- 配置場所の適切な選択
- 優先順位の完全理解
- 名前空間の効果的な活用
- スコープの明確化

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- コマンド配置を決定したい開発者
- プロジェクトとユーザーコマンドを使い分けたいチーム

## リソース構造

```
command-placement-priority/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── placement-options.md                   # 配置オプション詳細
│   ├── priority-resolution.md                 # 優先順位解決ルール
│   ├── namespace-strategies.md                # 名前空間戦略
│   └── migration-guide.md                     # 配置変更ガイド
└── templates/
    ├── project-command-template.md            # プロジェクトコマンドテンプレート
    └── user-command-template.md               # ユーザーコマンドテンプレート
```

### リソース種別

- **配置詳細** (`resources/placement-options.md`): 各配置オプションの詳細
- **優先順位ルール** (`resources/priority-resolution.md`): 解決ロジック詳細
- **名前空間戦略** (`resources/namespace-strategies.md`): 活用方法
- **移行ガイド** (`resources/migration-guide.md`): 配置変更手順
- **テンプレート** (`templates/`): 配置別のテンプレート

## いつ使うか

### シナリオ1: コマンド配置の決定
**状況**: 新しいコマンドをどこに配置すべきか判断したい

**適用条件**:
- [ ] プロジェクト vs ユーザーの選択が不明
- [ ] 共有すべきか個人用か不明
- [ ] スコープが不明確

**期待される成果**: 適切な配置場所の決定

### シナリオ2: 優先順位の理解
**状況**: 同名コマンドの優先順位を理解したい

**適用条件**:
- [ ] 複数の場所に同名コマンドがある
- [ ] どれが実行されるか不明
- [ ] オーバーライドしたい

**期待される成果**: 優先順位の完全理解

### シナリオ3: 名前空間の設計
**状況**: 複数のコマンドを論理的に組織化したい

**適用条件**:
- [ ] 多数のコマンドがある
- [ ] カテゴリ別に整理したい
- [ ] 命名衝突を避けたい

**期待される成果**: 効率的な名前空間構造

## 配置オプション

### オプション1: プロジェクトコマンド

**場所**: `.claude/commands/`

```bash
.claude/commands/
├── review.md
├── test.md
└── deploy/
    ├── staging.md
    └── production.md
```

**特徴**:
- **スコープ**: プロジェクトメンバー全員
- **共有**: Gitでバージョン管理
- **識別子**: `/project:command` または `/project:namespace:command`
- **表示**: `/help` で "(project)" 表示

**用途**:
```
✓ チーム全体で使用するコマンド
✓ プロジェクト固有のワークフロー
✓ 標準化されたプロセス
✓ バージョン管理したいコマンド

例:
- /project:deploy:staging
- /project:test:e2e
- /project:db:migrate
```

**メリット**:
- チーム全体で一貫性
- Git履歴で追跡可能
- コードレビュー可能
- CI/CDで使用可能

**デメリット**:
- 個人的なカスタマイズが困難
- チームの承認が必要

### オプション2: ユーザーコマンド

**場所**: `~/.claude/commands/`

```bash
~/.claude/commands/
├── personal-review.md
├── quick-commit.md
└── utils/
    └── cleanup.md
```

**特徴**:
- **スコープ**: ユーザー個人
- **共有**: 個人のみ
- **識別子**: `/user:command` または `/user:namespace:command`
- **表示**: `/help` で "(user)" 表示

**用途**:
```
✓ 個人的なワークフロー
✓ 実験的なコマンド
✓ プロジェクト非依存のユーティリティ
✓ カスタマイズされたショートカット

例:
- /user:quick-commit
- /user:my-review-style
- /user:personal-notes
```

**メリット**:
- 個人的なカスタマイズ自由
- チームへの影響なし
- 即座に作成・変更可能
- すべてのプロジェクトで利用可能

**デメリット**:
- チーム共有不可
- バージョン管理されない（個別対応必要）
- プロジェクト固有の設定が困難

### オプション3: MCPプロンプト

**場所**: MCPサーバーが提供

```bash
# MCPサーバーから自動提供
/mcp__github__create_pr
/mcp__jira__create_issue
/mcp__slack__send_message
```

**特徴**:
- **スコープ**: MCPサーバー接続時
- **共有**: MCP経由
- **識別子**: `/mcp__servername__promptname`
- **表示**: MCPサーバー名付き

**用途**:
```
✓ 外部サービス統合
✓ 動的に提供されるコマンド
✓ プラグイン形式の機能

例:
- /mcp__github__create_pr
- /mcp__database__query
- /mcp__api__test
```

**メリット**:
- 外部サービスとの統合
- プラグイン形式で追加可能
- サービス固有の機能

**デメリット**:
- MCPサーバー依存
- カスタマイズが制限される
- 接続が必要

## 優先順位解決

### 基本ルール

```
同名コマンドが複数存在する場合:

1. .claude/commands/review.md          (プロジェクト) ← 最高優先度
2. ~/.claude/commands/review.md        (ユーザー)
3. /mcp__server__review                (MCP)            ← 最低優先度

→ 1 が実行される
```

### 詳細な優先順位

```
優先度: 高 → 低

1. プロジェクトコマンド（名前空間付き）
   /project:namespace:command
   例: /project:git:commit

2. プロジェクトコマンド（ルート）
   /project:command
   例: /project:test

3. ユーザーコマンド（名前空間付き）
   /user:namespace:command
   例: /user:utils:cleanup

4. ユーザーコマンド（ルート）
   /user:command
   例: /user:quick-commit

5. MCPプロンプト
   /mcp__server__prompt
   例: /mcp__github__create_pr
```

### オーバーライドパターン

**パターン1: プロジェクトをユーザーでオーバーライド**

プロジェクトのデフォルトコマンドを個人用にカスタマイズ:

```bash
# プロジェクトのデフォルト
.claude/commands/commit.md → /project:commit

# ユーザーのカスタマイズ
~/.claude/commands/commit.md → /user:commit

# 実行時
/commit → プロジェクト版が優先
/user:commit → ユーザー版を明示的に実行
```

**パターン2: MCPをプロジェクトでオーバーライド**

MCPのデフォルト動作をプロジェクト固有にカスタマイズ:

```bash
# MCPデフォルト
/mcp__github__create_pr

# プロジェクトのカスタマイズ
.claude/commands/github/create-pr.md → /project:github:create-pr

# 実行時
/project:github:create-pr → プロジェクト版を使用
/mcp__github__create_pr → MCP版を使用
```

## 名前空間戦略

### フラット vs 階層

**フラット構造（小規模）**:

```bash
.claude/commands/
├── commit.md       # /project:commit
├── test.md         # /project:test
├── build.md        # /project:build
└── deploy.md       # /project:deploy

利点: シンプル
欠点: スケールしない
```

**階層構造（推奨）**:

```bash
.claude/commands/
├── git/
│   ├── commit.md      # /project:git:commit
│   ├── push.md        # /project:git:push
│   └── pr.md          # /project:git:pr
├── test/
│   ├── unit.md        # /project:test:unit
│   ├── integration.md # /project:test:integration
│   └── e2e.md         # /project:test:e2e
└── deploy/
    ├── staging.md     # /project:deploy:staging
    └── production.md  # /project:deploy:production

利点: スケーラブル、組織化
欠点: 階層が増える
```

### 名前空間設計パターン

**パターン1: 機能別**

```bash
.claude/commands/
├── auth/          # 認証関連
│   ├── login.md
│   └── logout.md
├── api/           # API関連
│   ├── test.md
│   └── docs.md
└── ui/            # UI関連
    ├── component.md
    └── theme.md
```

**パターン2: ツール別**

```bash
.claude/commands/
├── git/           # Git操作
│   └── ...
├── docker/        # Docker操作
│   └── ...
└── npm/           # npm操作
    └── ...
```

**パターン3: ワークフロー別**

```bash
.claude/commands/
├── dev/           # 開発ワークフロー
│   ├── setup.md
│   └── start.md
├── test/          # テストワークフロー
│   └── ...
└── release/       # リリースワークフロー
    └── ...
```

## 選択ガイド

### プロジェクト vs ユーザー

**プロジェクトコマンドを選ぶべき時**:
- [ ] チーム全体で使用する
- [ ] プロジェクト固有のロジックを含む
- [ ] 標準化が必要
- [ ] バージョン管理したい
- [ ] CI/CDで使用する

**ユーザーコマンドを選ぶべき時**:
- [ ] 個人的なワークフロー
- [ ] 実験的な機能
- [ ] プロジェクト非依存
- [ ] 頻繁に変更する
- [ ] 他のメンバーには不要

### 判断フローチャート

```
コマンドを作成したい
│
├─ チーム全体で使うか？
│  │
│  ├─ Yes → プロジェクトコマンド
│  │        (.claude/commands/)
│  │
│  └─ No  → 個人用か？
│     │
│     ├─ Yes → ユーザーコマンド
│     │        (~/.claude/commands/)
│     │
│     └─ No  → 外部サービス統合か？
│        │
│        └─ Yes → MCPプロンプト
│                 (MCPサーバー)
```

## 移行ガイド

### ユーザー → プロジェクト

**状況**: 個人用コマンドをチーム共有したい

**手順**:

```bash
# 1. コマンドをコピー
cp ~/.claude/commands/my-command.md \
   .claude/commands/my-command.md

# 2. レビューと調整
# - プロジェクト固有のパスを確認
# - ハードコードされた個人設定を削除
# - ドキュメントを充実

# 3. Git追加
git add .claude/commands/my-command.md
git commit -m "Add my-command to project commands"

# 4. ユーザー版を削除（オプション）
rm ~/.claude/commands/my-command.md
```

### プロジェクト → ユーザー（カスタマイズ）

**状況**: プロジェクトコマンドを個人用にカスタマイズしたい

**手順**:

```bash
# 1. プロジェクトコマンドをベースにコピー
cp .claude/commands/commit.md \
   ~/.claude/commands/commit.md

# 2. カスタマイズ
# - 個人的な設定を追加
# - ショートカットを追加
# - デフォルト値を変更

# 3. 名前空間を変更（オプション）
# description に "user:" プレフィックスを追加

# 4. 使い分け
/commit          # プロジェクト版
/user:commit     # カスタマイズ版
```

## ベストプラクティス

### 1. 明確なスコープ

```
✓ 良い:
- プロジェクト: チーム標準のデプロイ
- ユーザー: 個人的なショートカット

✗ 悪い:
- プロジェクト: 個人的な設定を含む
- ユーザー: チーム全体で必要な機能
```

### 2. ドキュメンテーション

```
プロジェクトコマンド:
- 詳細なドキュメント必須
- 使用例を豊富に
- トラブルシューティング

ユーザーコマンド:
- 最小限のドキュメント
- 自分が理解できればOK
```

### 3. バージョン管理

```
プロジェクトコマンド:
- .gitignore に含めない
- コードレビュー実施
- 変更履歴を残す

ユーザーコマンド:
- 個別にバックアップ
- 必要に応じてGist等で共有
```

## 詳細リソースの参照

### 配置オプション詳細
詳細は `resources/placement-options.md` を参照

### 優先順位解決ルール
詳細は `resources/priority-resolution.md` を参照

### 名前空間戦略
詳細は `resources/namespace-strategies.md` を参照

### 移行ガイド
詳細は `resources/migration-guide.md` を参照

### テンプレート
- プロジェクトコマンド: `templates/project-command-template.md`
- ユーザーコマンド: `templates/user-command-template.md`

## 関連スキル

- `.claude/skills/command-structure-fundamentals/SKILL.md` - ファイル構造
- `.claude/skills/command-naming-conventions/SKILL.md` - 名前空間設計

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
