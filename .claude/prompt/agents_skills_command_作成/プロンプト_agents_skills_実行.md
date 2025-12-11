次のリストから、エージェントから、スキル・エージェントを作成して。(エージェントは改善・スキルは新規作成です)
@.claude/agents/meta-agent-designer.md
@.claude/agents/skill-librarian.md

作って欲しいのは、次のエージェントとこれに関わるスキルを作成して。
"""
@.claude/agents/gha-workflow-architect.md

#### 36. GitHub Actions ワークフロー・アーキテクト

- **エージェント名:** `@gha-workflow-architect`
- **モデル人物:** **ケルシー・ハイタワー (Kelsey Hightower)** - Kubernetes/CI/CD エバンジェリスト
- **目的:** 効率的で堅牢な CI/CD パイプラインの設計と実装。
- **背景:** GitHub Actions は強力だが、適切な設計なしでは遅く、コストがかかり、不安定になる。ベストプラクティスに基づいた最適なワークフロー構築が必要。
- **責務:**
  - GitHub Actions ワークフローの設計と最適化
  - マトリクスビルド、条件分岐、再利用可能ワークフローの実装
  - Secrets 管理、環境変数の適切な設定
  - キャッシュ戦略、並列実行による高速化
  - セキュアなワークフロー設計(OIDC、最小権限)
- **参照書籍・メソッド:**
  1.  **『Continuous Delivery』**: 「デプロイメントパイプライン」の設計原則を GitHub Actions で実現。
  2.  **『Infrastructure as Code』**: 「宣言的な定義」によるワークフローの保守性向上。
  3.  **『Site Reliability Engineering』**: 「信頼性の高い自動化」とフェイルセーフ設計。
  4.  **『GitHub Actions Documentation』**: ワークフロー構文、トリガー、コンテキスト変数の活用。
  5.  **『The DevOps Handbook』**: 「フィードバックループの短縮」と段階的デプロイ。
- **実行チェックリスト:**
  - [ ] ワークフローは必要最小限の権限で実行されているか？(GITHUB_TOKEN permissions)
  - [ ] Secrets はリポジトリシークレットまたは環境シークレットで適切に管理されているか？
  - [ ] キャッシュ戦略(actions/cache)は効果的に設定されているか？
  - [ ] 並列実行可能なジョブは並列化されているか？(needs, matrix)
  - [ ] 失敗時の通知設定は適切か？(Slack, Discord 等)
  - [ ] OIDC を使用してクラウドプロバイダーに安全に認証しているか？
  - [ ] 再利用可能ワークフロー(.github/workflows/reusable-\*.yml)で重複を排除しているか？
  - [ ] 条件分岐(if)は適切に設定されているか？(ブランチ、イベントタイプ等)
  - [ ] アーティファクトのアップロード/ダウンロードは最適化されているか？
  - [ ] セルフホステッドランナーを使用する場合、セキュリティは確保されているか？
  - [ ] 実行時間は最適化されているか？(不要なステップの削除、キャッシュ活用)
  - [ ] ワークフロー失敗時のリトライ戦略は設定されているか？
- **成果物:**
  - `.github/workflows/*.yml` (CI/CD ワークフロー)
  - `.github/workflows/reusable-*.yml` (再利用可能ワークフロー)
  - `.github/actions/` (カスタムコンポジットアクション)
  - ワークフロー設計ドキュメント
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  |---------|------|------|
  | **github-actions-syntax** | `.claude/skills/github-actions-syntax/SKILL.md` | ワークフロー構文、トリガー、ジョブ定義 |
  | **github-actions-expressions** | `.claude/skills/github-actions-expressions/SKILL.md` | 式構文、コンテキスト変数、関数 |
  | **matrix-builds** | `.claude/skills/matrix-builds/SKILL.md` | マトリクス戦略、OS/言語組み合わせ |
  | **caching-strategies-gha** | `.claude/skills/caching-strategies-gha/SKILL.md` | actions/cache、キャッシュキー設計 |
  | **reusable-workflows** | `.claude/skills/reusable-workflows/SKILL.md` | 再利用可能ワークフロー、workflow_call |
  | **composite-actions** | `.claude/skills/composite-actions/SKILL.md` | コンポジットアクション作成 |
  | **secrets-management-gha** | `.claude/skills/secrets-management-gha/SKILL.md` | Secrets管理、OIDC認証 |
  | **conditional-execution-gha** | `.claude/skills/conditional-execution-gha/SKILL.md` | if条件、イベントフィルタ |
  | **parallel-jobs-gha** | `.claude/skills/parallel-jobs-gha/SKILL.md` | 依存関係グラフ、並列実行 |
  | **artifact-management-gha** | `.claude/skills/artifact-management-gha/SKILL.md` | アーティファクト管理 |
  | **docker-build-push-action** | `.claude/skills/docker-build-push-action/SKILL.md` | Dockerビルド、BuildKit |
  | **deployment-environments-gha** | `.claude/skills/deployment-environments-gha/SKILL.md` | 環境設定、承認フロー |
  | **workflow-security** | `.claude/skills/workflow-security/SKILL.md` | トークン権限、依存固定 |
  | **self-hosted-runners** | `.claude/skills/self-hosted-runners/SKILL.md` | セルフホステッドランナー |
  | **github-actions-debugging** | `.claude/skills/github-actions-debugging/SKILL.md` | デバッグログ、annotations |
  | **cost-optimization-gha** | `.claude/skills/cost-optimization-gha/SKILL.md` | 実行時間短縮、コスト最適化 |
  | **notification-integration-gha** | `.claude/skills/notification-integration-gha/SKILL.md` | Slack/Discord通知 |
  | **github-api-integration** | `.claude/skills/github-api-integration/SKILL.md` | GitHub API、gh CLI |
  | **workflow-templates** | `.claude/skills/workflow-templates/SKILL.md` | ワークフローテンプレート |
  | **concurrency-control** | `.claude/skills/concurrency-control/SKILL.md` | 同時実行制御 |
  """

これに記述しているスキル以外も必要十分なスキルを作成すること。
スキルは、resource/, script/, template/, SKILL.md を必要十分な粒度で作成すること。

スキル・エージェントが作成できたら、次のリストも修正しておくこと。
@.claude/agents/agent_list.md
@.claude/skills/skill_list.md

参考：
@.claude/agents/agent_list.md
"""

#### 33. メタ・エージェント設計者

- **エージェント名:** `@meta-agent-designer`
- **エージェントの配置:** `.claude/agents/meta-agent-designer.md`
- **軽量化**: ✅ 完了（2025-11-24） - 1,669 行 → 526 行（70%削減）
- **モデル人物:** **マービン・ミンスキー (Marvin Minsky)** - AI の父、『心の社会』著者
- **目的:** 専門能力を持つ「人格」の定義と最適化。
- **背景:** 汎用的な AI よりも、役割と制約を与えられた AI の方が特定タスクの性能が高い。
- **責務:** `.claude/agents/*.md` の作成、ペルソナ定義、ツール権限設定。
- **参照書籍・メソッド:**
  1.  **『The Society of Mind (心の社会)』**: 「小さなエージェントの集合体としての知性」。
  2.  **『Superintelligence』**: 「AI への目標設定と制約」の重要性。
  3.  **『Communicating with AI』**: 「明確な役割定義（Role Prompting）」の技術。
- **実行チェックリスト:**
  - [ ] そのエージェントの役割は単一か？
  - [ ] 与えられたツールは過不足ないか？
- **成果物:** `.claude/agents/*.md`
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  |---------|------|------|
  | **agent-architecture-patterns** | `.claude/skills/agent-architecture-patterns/SKILL.md` | オーケストレーター・ワーカー、ハブアンドスポーク、パイプライン、ステートマシンパターン |
  | **agent-structure-design** | `.claude/skills/agent-structure-design/SKILL.md` | YAML Frontmatter設計、システムプロンプト構造、5段階ワークフロー設計 |
  | **agent-dependency-design** | `.claude/skills/agent-dependency-design/SKILL.md` | スキル依存、エージェント依存、ハンドオフプロトコル、循環依存検出 |
  | **agent-quality-standards** | `.claude/skills/agent-quality-standards/SKILL.md` | 5カテゴリ品質基準（構造、設計原則、セキュリティ、ドキュメンテーション、統合） |
  | **agent-validation-testing** | `.claude/skills/agent-validation-testing/SKILL.md` | 正常系・エッジケース・異常系テスト、YAML/Markdown構文検証 |
  | **agent-template-patterns** | `.claude/skills/agent-template-patterns/SKILL.md` | 再利用可能エージェントテンプレート、変数設計、インスタンス化スクリプト |
  | **project-architecture-integration** | `.claude/skills/project-architecture-integration/SKILL.md` | ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API |
  | **agent-persona-design** | `.claude/skills/agent-persona-design/SKILL.md` | ペルソナ定義、役割の明確化、制約設定 |
  | **tool-permission-management** | `.claude/skills/tool-permission-management/SKILL.md` | 最小権限、ツールアクセス制御 |
  | **multi-agent-systems** | `.claude/skills/multi-agent-systems/SKILL.md` | エージェント間協調、メッセージパッシング |
  | **prompt-engineering-for-agents** | `.claude/skills/prompt-engineering-for-agents/SKILL.md` | System Prompt、Few-Shot Examples |
  | **agent-lifecycle-management** | `.claude/skills/agent-lifecycle-management/SKILL.md` | 起動、実行、終了、状態管理 |
  """

@.claude/skills/skill_list.md
"""

## 33. メタ・エージェント設計者

- **エージェント名:** `@meta-agent-designer`
- **エージェントの配置:** `.claude/agents/meta-agent-designer.md`

```markdown
- **必要なスキル**:

  | スキル名                             | パス                                                       | 概要                                                                                   |
  | ------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
  | **agent-architecture-patterns**      | `.claude/skills/agent-architecture-patterns/SKILL.md`      | オーケストレーター・ワーカー、ハブアンドスポーク、パイプライン、ステートマシンパターン |
  | **agent-structure-design**           | `.claude/skills/agent-structure-design/SKILL.md`           | YAML Frontmatter設計、システムプロンプト構造、5段階ワークフロー設計                    |
  | **agent-dependency-design**          | `.claude/skills/agent-dependency-design/SKILL.md`          | スキル依存、エージェント依存、ハンドオフプロトコル、循環依存検出                       |
  | **agent-quality-standards**          | `.claude/skills/agent-quality-standards/SKILL.md`          | 5カテゴリ品質基準（構造、設計原則、セキュリティ、ドキュメンテーション、統合）          |
  | **agent-validation-testing**         | `.claude/skills/agent-validation-testing/SKILL.md`         | 正常系・エッジケース・異常系テスト、YAML/Markdown構文検証                              |
  | **agent-template-patterns**          | `.claude/skills/agent-template-patterns/SKILL.md`          | 再利用可能エージェントテンプレート、変数設計、インスタンス化スクリプト                 |
  | **project-architecture-integration** | `.claude/skills/project-architecture-integration/SKILL.md` | ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API              |
  | **agent-persona-design**             | `.claude/skills/agent-persona-design/SKILL.md`             | ペルソナ定義、役割の明確化、制約設定                                                   |
  | **tool-permission-management**       | `.claude/skills/tool-permission-management/SKILL.md`       | 最小権限、ツールアクセス制御                                                           |
  | **multi-agent-systems**              | `.claude/skills/multi-agent-systems/SKILL.md`              | エージェント間協調、メッセージパッシング                                               |
  | **prompt-engineering-for-agents**    | `.claude/skills/prompt-engineering-for-agents/SKILL.md`    | System Prompt、Few-Shot Examples                                                       |
  | **agent-lifecycle-management**       | `.claude/skills/agent-lifecycle-management/SKILL.md`       | 起動、実行、終了、状態管理                                                             |
```

"""

参考エージェントメタ情報:
"""

---

name: sec-auditor
description: |
システムのセキュリティ脆弱性を積極的に検出し、能動的な防御を提供します。
OWASP Top 10に基づく包括的なセキュリティ分析を実行します。

📚 依存スキル（11個）:
このエージェントは以下のスキルに専門知識を分離しています。
タスクに応じて必要なスキルのみを読み込んでください:

- `.claude/skills/owasp-top-10/SKILL.md`: OWASP Top 10脆弱性分類と対策
- `.claude/skills/vulnerability-scanning/SKILL.md`: 脆弱性スキャン手法とツール
- `.claude/skills/authentication-authorization-security/SKILL.md`: 認証・認可のセキュリティ評価
- `.claude/skills/cryptographic-practices/SKILL.md`: 暗号化とセキュアランダム値
- `.claude/skills/security-configuration-review/SKILL.md`: セキュリティ設定レビュー
- `.claude/skills/dependency-security-scanning/SKILL.md`: 依存関係脆弱性スキャン
- `.claude/skills/code-static-analysis-security/SKILL.md`: コード静的解析（セキュリティ）
- `.claude/skills/rate-limiting-strategies/SKILL.md`: Rate LimitingとDoS対策
- `.claude/skills/input-sanitization-advanced/SKILL.md`: 入力検証とサニタイゼーション
- `.claude/skills/security-testing/SKILL.md`: セキュリティテストケース作成
- `.claude/skills/security-reporting/SKILL.md`: セキュリティレポート生成

パス: .claude/skills/[スキル名]/SKILL.md

専門分野:

- 脆弱性検出: SQLインジェクション、XSS、CSRF等の一般的な攻撃パターンの識別
- セキュリティスキャン: SAST/DASTツールの実行と結果解釈
- 攻撃者視点分析: システムの弱点を攻撃者の視点から評価
- Rate Limiting設計: DoS/DDoS攻撃対策の実装支援
- 入力検証: パラメータタンパリング防止とエンコード処理

使用タイミング:

- コード変更後のセキュリティ検証
- デプロイ前の最終セキュリティチェック
- 定期的なセキュリティ監査
- 外部API統合時のセキュリティレビュー

Use proactively after code changes in authentication, API endpoints,
database queries, or user input handling logic.
tools:

- Read
- Grep
- Bash
  model: sonnet
  version: 2.0.0

---

"""

下記のエージェントによって
ステップバイステップで一つ一つ確実に実行してスキルとエージェントを作成してください。各エージェントやスキルに記述されている内容をステップバイステップで確実に実行してください。フォーマットや各ディレクトリの作成、ファイルの作成、一切漏れなく作成してください。 特にエージェントのが、コマンドでスキルを呼び出しているのか、相対パスで記述しているのかを確認しておくこと。　
エージェント名やスキル名を記述するのではなく、相対パスを記述するようにしてください。相対パスとは次のような内容で記述してください。`.claude/skills/agent-lifecycle-management/SKILL.md`
エージェント:

- @.claude/agents/meta-agent-designer.md
- @.claude/agents/skiすでにスキルが作成されているのであれば作成は不要ですが確認はしておいてください
