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
### `/ai:gather-requirements`
- **目的**: ステークホルダーへのヒアリングと要件整理
- **引数**: `[stakeholder-name]` - ステークホルダー名(オプション)
- **使用エージェント**: @req-analyst
- **スキル活用**: requirements-engineering, interview-techniques
- **成果物**: docs/00-requirements/requirements.md
- **設定**:
  - `model: opus` (複雑なヒアリング分析)
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
allowed-tools: [Task, Read, Write(.claude/commands/**), Grep, Glob]
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
