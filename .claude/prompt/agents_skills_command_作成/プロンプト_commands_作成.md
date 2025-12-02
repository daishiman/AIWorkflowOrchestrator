/ai:create-command

次のリスト・エージェントから、Claude Code で使用するcommandを作成して。
commandは次の階層化に作成して。
"""
- .claude/commands/ai
"""

関係するエージェント・スキルを参照して、commandに記述して
コマンド作成エージェント: @.claude/agents/command-arch.md
コマンドリスト: @.claude/commands/ai/command_list.md
エージェントリスト(エージェントが使うスキルも記述): @.claude/agents/agent_list.md
参考情報: @docs/00-requirements/master_system_design.md

作って欲しいのは、次のcommandです。
ただし次の内容はあくまでも叩き台で作成しているものなので最適ではないです。この部分を最適化して/commandとcommand-listを改善修正作成してください。
下記のたたき台を元に作成して。
"""
## 15. Git・バージョン管理

### `/ai:commit`
- **目的**: Conventional Commitsに従ったコミット作成
- **引数**: `[commit-message]` - コミットメッセージ(オプション、未指定時は自動生成)
- **使用エージェント**: なし(シンプルな自動化)
- **成果物**: Gitコミット
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*)`

### `/ai:create-pr`
- **目的**: Pull Request作成
- **引数**: `[base-branch]` - ベースブランチ(デフォルト: main)
- **使用エージェント**: @spec-writer
- **成果物**: GitHub Pull Request
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*|gh*), Read`

### `/ai:merge-pr`
- **目的**: Pull Requestのマージ
- **引数**: `[pr-number]` - PR番号
- **使用エージェント**: なし
- **成果物**: マージ済みブランチ
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(gh pr*|git*)`

### `/ai:tag-release`
- **目的**: リリースタグの作成
- **引数**: `[version]` - バージョン番号(v1.0.0形式)
- **使用エージェント**: @spec-writer
- **成果物**: Gitタグ、リリースノート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git tag*|gh release*), Read, Write`

---

## 16. パッケージ・依存関係

### `/ai:add-dependency`
- **目的**: 新しい依存パッケージの追加
- **引数**: `[package-name] [--dev]` - パッケージ名、devDependencyフラグ
- **使用エージェント**: @dep-mgr
- **スキル活用**: dependency-auditing
- **成果物**: 更新されたpackage.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm install*|pnpm add*), Read, Edit`

### `/ai:update-dependencies`
- **目的**: 依存パッケージの一括更新
- **引数**: `[strategy]` - 更新戦略(patch/minor/major/latest)
- **使用エージェント**: @dep-mgr
- **スキル活用**: upgrade-strategies, semantic-versioning
- **成果物**: 更新されたpackage.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm*|pnpm*), Read, Edit`

### `/ai:audit-dependencies`
- **目的**: 依存関係の脆弱性監査
- **引数**: なし
- **使用エージェント**: @dep-mgr, @sec-auditor
- **スキル活用**: dependency-auditing, vulnerability-scanning
- **成果物**: 監査レポート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm audit*|pnpm audit*), Write(docs/**)`

---

## 17. 環境設定・設定ファイル

### `/ai:create-env-file`
- **目的**: .env.exampleの作成・更新
- **引数**: なし
- **使用エージェント**: @secret-mgr
- **スキル活用**: agent-architecture-patterns, best-practices-curation
- **成果物**: .env.example
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.env.example)|Edit`

### `/ai:setup-eslint`
- **目的**: ESLint設定の最適化
- **引数**: `[style-guide]` - スタイルガイド(airbnb/google/standard)
- **使用エージェント**: @code-quality
- **スキル活用**: eslint-configuration, code-style-guides
- **成果物**: .eslintrc.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm*), Read, Write, Edit`

### `/ai:setup-prettier`
- **目的**: Prettier設定
- **引数**: なし
- **使用エージェント**: @code-quality
- **スキル活用**: prettier-integration
- **成果物**: .prettierrc
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(.prettierrc*)`

### `/ai:setup-typescript`
- **目的**: TypeScript設定の最適化
- **引数**: `[strictness]` - 厳格度(strict/moderate/loose)
- **使用エージェント**: @schema-def
- **スキル活用**: type-safety-patterns
- **成果物**: tsconfig.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

---

## 18. メンテナンス・最適化

### `/ai:clean-codebase`
- **目的**: 未使用コード・ファイルの削除
- **引数**: `[--dry-run]` - ドライランフラグ
- **使用エージェント**: @code-quality, @arch-police
- **スキル活用**: code-smell-detection
- **成果物**: クリーンなコードベース
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Grep, Glob, Edit, Bash(rm*)`

### `/ai:update-all-docs`
- **目的**: 全ドキュメントの一括更新
- **引数**: なし
- **使用エージェント**: @spec-writer, @api-doc-writer, @manual-writer
- **成果物**: 更新されたドキュメント
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Write(docs/**)`

### `/ai:analyze-performance`
- **目的**: パフォーマンス分析とボトルネック特定
- **引数**: `[target]` - 分析対象(frontend/backend/database)
- **使用エージェント**: @router-dev, @repo-dev, @dba-mgr
- **スキル活用**: web-performance, query-performance-tuning
- **成果物**: パフォーマンスレポート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Bash, Write(docs/**)`

### `/ai:migrate-to-latest`
- **目的**: フレームワーク・ライブラリの最新版移行
- **引数**: `[library-name]` - ライブラリ名
- **使用エージェント**: @dep-mgr, @logic-dev
- **スキル活用**: upgrade-strategies
- **成果物**: 移行済みコード
- **設定**:
  - `model: opus`
  - `allowed-tools: Bash(pnpm*|pnpm*), Read, Edit, Task`

---

## 19. トラブルシューティング・デバッグ

### `/ai:debug-error`
- **目的**: エラーのデバッグと原因特定
- **引数**: `[error-message]` - エラーメッセージ
- **使用エージェント**: @logic-dev, @sec-auditor
- **成果物**: 原因分析とfix提案
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Grep, Bash`

### `/ai:fix-build-error`
- **目的**: ビルドエラーの修正
- **引数**: なし
- **使用エージェント**: @devops-eng, @code-quality
- **成果物**: 修正されたコード
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm run build*), Read, Edit`

### `/ai:fix-type-errors`
- **目的**: TypeScriptエラーの修正
- **引数**: `[file-path]` - 対象ファイル(オプション)
- **使用エージェント**: @schema-def
- **スキル活用**: type-safety-patterns
- **成果物**: 型エラー修正
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(tsc*), Read, Edit`

### `/ai:diagnose-performance-issue`
- **目的**: パフォーマンス問題の診断
- **引数**: `[symptom]` - 症状(slow-render/slow-query/memory-leak)
- **使用エージェント**: @router-dev, @repo-dev, @sre-observer
- **成果物**: 診断レポート、修正提案
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Bash, Write(docs/**)`

---

## 20. チーム・コラボレーション

### `/ai:sync-team-standards`
- **目的**: チームコーディング規約の同期
- **引数**: なし
- **使用エージェント**: @code-quality, @skill-librarian
- **成果物**: 更新された.claude/CLAUDE.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

### `/ai:create-workflow-template`
- **目的**: チーム用ワークフローテンプレート作成
- **引数**: `[workflow-name]` - ワークフロー名
- **使用エージェント**: @gha-workflow-architect
- **スキル活用**: workflow-templates
- **成果物**: Organization workflow template
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(.github/workflow-templates/**)`

### `/ai:onboard-developer`
- **目的**: 新規開発者のオンボーディング
- **引数**: `[developer-role]` - 役割(frontend/backend/fullstack)
- **使用エージェント**: @manual-writer, @meta-agent-designer
- **成果物**: オンボーディングガイド
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`
"""
@docs/00-requirements/master_system_design.md
この内容を反映さしてください。これらはエージェン・トスキルにも同様です。エージェント・スキルにもこれらの内容を反映されているか確認しておいてください。エージェント・スキルも改善実用であれば、改善すること

メタ情報のdescription には、参照するエージェントとスキルを記述すること
例:
"""
---
description: |
  新しいスラッシュコマンド（.claude/commands/*.md）を作成する専門コマンド。

  YAML Frontmatter + Markdown 本文の構造を持つハブ特化型コマンドファイルを生成します。

  🤖 起動エージェント:
  - `.claude/agents/command-arch.md`: スラッシュコマンド作成専門エージェント（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてcommand-archエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** command-naming-conventions, command-placement-priority
  **Phase 2（設計時）:** command-structure-fundamentals, command-arguments-system, command-basic-patterns
  **Phase 3（セキュリティ時）:** command-security-design, command-error-handling（必要時）
  **Phase 4（品質時）:** command-best-practices, command-documentation-patterns（必要時）
  **Phase 5（最適化時）:** command-performance-optimization（必要時）, command-agent-skill-integration（必要時）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（未指定時はインタラクティブ）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: command-archエージェント起動用
    • Read: 既存コマンド・スキル参照確認用
    • Write(.claude/commands/**): コマンドファイル生成用（パス制限）
    • Grep, Glob: 既存パターン検索・重複チェック用
  - model: sonnet（標準的なコマンド作成タスク）

  トリガーキーワード: command, slash-command, コマンド作成, workflow, 自動化
argument-hint: "[command-name]"
allowed-tools:
  - Task
  - Read
  - Write(.claude/commands/**)
  - Grep
  - Glob
model: sonnet
---
"""

commandが作成できたら、次のリストも修正しておくこと。
@.claude/commands/ai/command_list.md


下記のエージェントによって
ステップバイステップで一つ一つ確実に実行してスキルとエージェントを作成してください。各エージェントやスキルに記述されている内容をステップバイステップで確実に実行してください。フォーマットや各ディレクトリの作成、ファイルの作成、一切漏れなく作成してください。 特にエージェントのが、コマンドでスキルを呼び出しているのか、相対パスで記述しているのかを確認しておくこと。　
エージェント名やスキル名を記述するのではなく、相対パスを記述するようにしてください。相対パスとは次のような内容で記述してください。`.claude/skills/agent-lifecycle-management/SKILL.md`
エージェント:
@.claude/agents/command-arch.md

下記の情報通りにエージェント・スキル・コマンドが処理できているかを確認すること。
最も重要な参考情報: @docs/00-requirements/master_system_design.md

あくまでも/commandはエージェントスキルを実行する上でのコマンドにすぎないです。ロジックに関してはエージェントやスキルの方に任せるように責務を分けて作成するようにしてください。
