.claude/commands/ai/create-command.md

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

### `.claude/commands/ai/commit.md`

- **目的**: Conventional Commitsに従ったコミット作成
- **引数**: `[commit-message]` - コミットメッセージ(オプション、未指定時は自動生成)
- **使用エージェント**: なし(シンプルな自動化)
- **成果物**: Gitコミット
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*)`

### `.claude/commands/ai/create-pr.md`

- **目的**: Pull Request作成
- **引数**: `[base-branch]` - ベースブランチ(デフォルト: main)
- **使用エージェント**: .claude/agents/spec-writer.md
- **成果物**: GitHub Pull Request
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*|gh*), Read`

### `.claude/commands/ai/merge-pr.md`

- **目的**: Pull Requestのマージ
- **引数**: `[pr-number]` - PR番号
- **使用エージェント**: なし
- **成果物**: マージ済みブランチ
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(gh pr*|git*)`

### `.claude/commands/ai/tag-release.md`

- **目的**: リリースタグの作成
- **引数**: `[version]` - バージョン番号(v1.0.0形式)
- **使用エージェント**: .claude/agents/spec-writer.md
- **成果物**: Gitタグ、リリースノート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git tag*|gh release*), Read, Write`

---

## 16. パッケージ・依存関係

### `.claude/commands/ai/add-dependency.md`

- **目的**: 新しい依存パッケージの追加
- **引数**: `[package-name] [--dev]` - パッケージ名、devDependencyフラグ
- **使用エージェント**: .claude/agents/dep-mgr.md
- **スキル活用**: .claude/skills/dependency-auditing/SKILL.md
- **成果物**: 更新されたpackage.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm install*|pnpm add*), Read, Edit`

### `.claude/commands/ai/update-dependencies.md`

- **目的**: 依存パッケージの一括更新
- **引数**: `[strategy]` - 更新戦略(patch/minor/major/latest)
- **使用エージェント**: .claude/agents/dep-mgr.md
- **スキル活用**: .claude/skills/upgrade-strategies/SKILL.md, .claude/skills/semantic-versioning/SKILL.md
- **成果物**: 更新されたpackage.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm*|pnpm*), Read, Edit`

### `.claude/commands/ai/audit-dependencies.md`

- **目的**: 依存関係の脆弱性監査
- **引数**: なし
- **使用エージェント**: .claude/agents/dep-mgr.md, .claude/agents/sec-auditor.md
- **スキル活用**: .claude/skills/dependency-auditing/SKILL.md, vulnerability-scanning
- **成果物**: 監査レポート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm audit*|pnpm audit*), Write(docs/**)`

---

## 17. 環境設定・設定ファイル

### `.claude/commands/ai/create-env-file.md`

- **目的**: .env.exampleの作成・更新
- **引数**: なし
- **使用エージェント**: .claude/agents/secret-mgr.md
- **スキル活用**: .claude/skills/agent-architecture-patterns/SKILL.md, .claude/skills/best-practices-curation/SKILL.md
- **成果物**: .env.example
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.env.example)|Edit`

### `.claude/commands/ai/setup-eslint.md`

- **目的**: ESLint設定の最適化
- **引数**: `[style-guide]` - スタイルガイド(airbnb/google/standard)
- **使用エージェント**: .claude/agents/code-quality.md
- **スキル活用**: .claude/skills/eslint-configuration/SKILL.md, .claude/skills/code-style-guides/SKILL.md
- **成果物**: .eslintrc.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm*), Read, Write, Edit`

### `.claude/commands/ai/setup-prettier.md`

- **目的**: Prettier設定
- **引数**: なし
- **使用エージェント**: .claude/agents/code-quality.md
- **スキル活用**: .claude/skills/prettier-integration/SKILL.md
- **成果物**: .prettierrc
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(.prettierrc*)`

### `.claude/commands/ai/setup-typescript.md`

- **目的**: TypeScript設定の最適化
- **引数**: `[strictness]` - 厳格度(strict/moderate/loose)
- **使用エージェント**: .claude/agents/schema-def.md
- **スキル活用**: .claude/skills/type-safety-patterns/SKILL.md
- **成果物**: tsconfig.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

---

## 18. メンテナンス・最適化

### `.claude/commands/ai/clean-codebase.md`

- **目的**: 未使用コード・ファイルの削除
- **引数**: `[--dry-run]` - ドライランフラグ
- **使用エージェント**: .claude/agents/code-quality.md, .claude/agents/arch-police.md
- **スキル活用**: .claude/skills/code-smell-detection/SKILL.md
- **成果物**: クリーンなコードベース
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Grep, Glob, Edit, Bash(rm*)`

### `.claude/commands/ai/update-all-docs.md`

- **目的**: 全ドキュメントの一括更新
- **引数**: なし
- **使用エージェント**: .claude/agents/spec-writer.md, .claude/agents/api-doc-writer.md, .claude/agents/manual-writer.md
- **成果物**: 更新されたドキュメント
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Write(docs/**)`

### `.claude/commands/ai/analyze-performance.md`

- **目的**: パフォーマンス分析とボトルネック特定
- **引数**: `[target]` - 分析対象(frontend/backend/database)
- **使用エージェント**: .claude/agents/router-dev.md, .claude/agents/repo-dev.md, .claude/agents/dba-mgr.md
- **スキル活用**: .claude/skills/web-performance/SKILL.md, .claude/skills/query-performance-tuning/SKILL.md
- **成果物**: パフォーマンスレポート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Bash, Write(docs/**)`

### `.claude/commands/ai/migrate-to-latest.md`

- **目的**: フレームワーク・ライブラリの最新版移行
- **引数**: `[library-name]` - ライブラリ名
- **使用エージェント**: .claude/agents/dep-mgr.md, .claude/agents/logic-dev.md
- **スキル活用**: .claude/skills/upgrade-strategies/SKILL.md
- **成果物**: 移行済みコード
- **設定**:
  - `model: opus`
  - `allowed-tools: Bash(pnpm*|pnpm*), Read, Edit, Task`

---

## 19. トラブルシューティング・デバッグ

### `.claude/commands/ai/debug-error.md`

- **目的**: エラーのデバッグと原因特定
- **引数**: `[error-message]` - エラーメッセージ
- **使用エージェント**: .claude/agents/logic-dev.md, .claude/agents/sec-auditor.md
- **成果物**: 原因分析とfix提案
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Grep, Bash`

### `.claude/commands/ai/fix-build-error.md`

- **目的**: ビルドエラーの修正
- **引数**: なし
- **使用エージェント**: .claude/agents/devops-eng.md, .claude/agents/code-quality.md
- **成果物**: 修正されたコード
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm run build*), Read, Edit`

### `.claude/commands/ai/fix-type-errors.md`

- **目的**: TypeScriptエラーの修正
- **引数**: `[file-path]` - 対象ファイル(オプション)
- **使用エージェント**: .claude/agents/schema-def.md
- **スキル活用**: .claude/skills/type-safety-patterns/SKILL.md
- **成果物**: 型エラー修正
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(tsc*), Read, Edit`

### `.claude/commands/ai/diagnose-performance-issue.md`

- **目的**: パフォーマンス問題の診断
- **引数**: `[symptom]` - 症状(slow-render/slow-query/memory-leak)
- **使用エージェント**: .claude/agents/router-dev.md, .claude/agents/repo-dev.md, .claude/agents/sre-observer.md
- **成果物**: 診断レポート、修正提案
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Bash, Write(docs/**)`

---

## 20. チーム・コラボレーション

### `.claude/commands/ai/sync-team-standards.md`

- **目的**: チームコーディング規約の同期
- **引数**: なし
- **使用エージェント**: .claude/agents/code-quality.md, .claude/agents/skill-librarian.md
- **成果物**: 更新された.claude/CLAUDE.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

### `.claude/commands/ai/create-workflow-template.md`

- **目的**: チーム用ワークフローテンプレート作成
- **引数**: `[workflow-name]` - ワークフロー名
- **使用エージェント**: .claude/agents/gha-workflow-architect.md
- **スキル活用**: .claude/skills/workflow-templates/SKILL.md
- **成果物**: Organization workflow template
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(.github/workflow-templates/**)`

### `.claude/commands/ai/onboard-developer.md`

- **目的**: 新規開発者のオンボーディング
- **引数**: `[developer-role]` - 役割(frontend/backend/fullstack)
- **使用エージェント**: .claude/agents/manual-writer.md, .claude/agents/meta-agent-designer.md
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
新しいスラッシュコマンド（.claude/commands/\*.md）を作成する専門コマンド。

YAML Frontmatter + Markdown 本文の構造を持つハブ特化型コマンドファイルを生成します。

🤖 起動エージェント:

- `.claude/agents/command-arch.md`: スラッシュコマンド作成専門エージェント（Phase 2で起動）

📚 利用可能スキル（タスクに応じてcommand-archエージェントが必要時に参照）:
**Phase 1（要件収集時）:** .claude/skills/command-naming-conventions/SKILL.md, .claude/skills/command-placement-priority/SKILL.md
**Phase 2（設計時）:** .claude/skills/command-structure-fundamentals/SKILL.md, .claude/skills/command-arguments-system/SKILL.md, .claude/skills/command-basic-patterns/SKILL.md
**Phase 3（セキュリティ時）:** .claude/skills/command-security-design/SKILL.md, .claude/skills/command-error-handling/SKILL.md（必要時）
**Phase 4（品質時）:** .claude/skills/command-best-practices/SKILL.md, .claude/skills/command-documentation-patterns/SKILL.md（必要時）
**Phase 5（最適化時）:** .claude/skills/command-performance-optimization/SKILL.md（必要時）, .claude/skills/command-agent-skill-integration/SKILL.md（必要時）

⚙️ このコマンドの設定:

- argument-hint: オプション引数1つ（未指定時はインタラクティブ）
- allowed-tools: エージェント起動と最小限の確認用
  • Task: command-archエージェント起動用
  • Read: 既存コマンド・スキル参照確認用
  • Write(.claude/commands/\*\*): コマンドファイル生成用（パス制限）
  • Grep, Glob: 既存パターン検索・重複チェック用
- model: sonnet（標準的なコマンド作成タスク）

トリガーキーワード: command, slash-command, コマンド作成, workflow, 自動化
argument-hint: "[command-name]"
allowed-tools:

- Task
- Read
- Write(.claude/commands/\*\*)
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
