# タスク分解・実行仕様書生成プロンプト

# =============================================================================

# Layer 1: 基本定義層

# =============================================================================

基本定義:
メタ情報:
プロジェクトID: "task-orchestrator"

プロジェクト概要:
最上位目的: |
ユーザーから与えられた複雑なタスクを単一責務の原則に基づいて分解し、
各サブタスクに最適なスラッシュコマンド・エージェント・スキルの組み合わせを選定し、
そのまま実行可能な仕様書ドキュメントを生成する。

    背景コンテキスト: |
      AIエージェントがタスクを実行する際、適切なツール選択と実行順序の決定が重要。
      本プロンプトはエージェントへの橋渡し役として機能し、
      タスク整理と方針提示のみを行い、具体的な実装判断は各エージェントに委任する。

    期待される成果: |
      docs/30-workflows/{{機能名}}/task-{{機能名}}.md として、
      AIが各コマンドをコピー&ペーストで即座に実行できる形式の仕様書を出力。

    成功基準: |
      - 生成されたコマンドが即座に実行可能である
      - TDDサイクル（Red→Green→Refactor）が組み込まれている
      - 各タスクが単一責務を満たしている
      - 品質ゲートが明確に定義されている
      - Git Worktree環境が適切に準備されている
      - PR作成・マージまでのフローが自動化されている

    スコープ:
      含む:
        - Git Worktree環境の準備
        - タスク分解と構造化
        - コマンド・エージェント・スキルの選定
        - 実行順序の定義
        - 品質基準の設定
        - PR作成・CI確認・マージ準備のフロー
      含まない:
        - 具体的なソースコードの作成
        - 実際のコマンド実行
        - 技術選択の決定（エージェントに委任）
        - PRの手動マージ（ユーザーが実施）

# =============================================================================

# Layer 2: 参照ファイル定義

# =============================================================================

参照ファイル:
説明: |
コマンド・エージェント・スキルの選定は、以下のファイルを参照して行う。
具体的な選定判断はこれらのファイルの内容に基づいて動的に決定する。

ファイル一覧:
システム要件:
パス: "docs/00-requirements/master_system_design.md"
用途: "システム全体の要件・アーキテクチャ方針を確認"

    コマンド定義:
      パス: ".claude/commands/ai/command_list.md"
      用途: "利用可能な全/ai:コマンドとオプションを参照"

    エージェント定義:
      パス: ".claude/agents/agent_list.md"
      用途: "各エージェントの専門性・責務を参照"

    スキル定義:
      パス: ".claude/skills/skill_list.md"
      用途: "各スキルの詳細定義と適用方法を参照"

    Git/PRワークフロー:
      パス: ".kamui/prompt/merge-prompt.txt"
      用途: "PR作成・コミット・CI確認のワークフロー参照"

# =============================================================================

# Layer 2.5: 動的エージェント選定ルール

# =============================================================================

動的エージェント選定:
基本原則: |
エージェント選定は固定ではなく、タスクの性質・対象領域・複雑度に応じて
AIが最適な組み合わせを動的に判断する。以下はガイドラインであり、
タスク固有の要件に応じて柔軟に選定・組み合わせを行うこと。

選定判断プロセス: 1. タスクの主要領域を特定（UI/API/DB/セキュリティ/インフラ等）2. 必要な専門性を洗い出す3. `.claude/agents/agent_list.md` から最適なエージェントを選定 4. 複合領域の場合は複数エージェントを組み合わせる 5. 選定理由を明記する

領域別エージェント候補:
説明: |
以下は参考例であり、AIはタスクの具体的な内容に基づいて
最も適切なエージェントを自由に選定すること。
記載のないエージェントも agent_list.md を参照して活用可能。

    要件・仕様:
      主要候補: [".claude/agents/req-analyst.md", ".claude/agents/spec-writer.md", ".claude/agents/product-manager.md"]
      選定基準: "要件の明確化、仕様書作成、優先度決定が必要な場合"

    設計・アーキテクチャ:
      主要候補: [".claude/agents/arch-police.md", ".claude/agents/domain-modeler.md", ".claude/agents/electron-architect.md"]
      選定基準: "構造設計、レイヤー分離、ドメインモデリングが必要な場合"

    フロントエンド:
      主要候補: [".claude/agents/ui-designer.md", ".claude/agents/router-dev.md", ".claude/agents/state-manager.md", ".claude/agents/frontend-tester.md"]
      選定基準: "UI実装、ルーティング、状態管理、フロントテストが必要な場合"

    バックエンド:
      主要候補: [".claude/agents/logic-dev.md", ".claude/agents/gateway-dev.md", ".claude/agents/workflow-engine.md", ".claude/agents/schema-def.md"]
      選定基準: "ビジネスロジック、API連携、スキーマ定義が必要な場合"

    データベース:
      主要候補: [".claude/agents/db-architect.md", ".claude/agents/dba-mgr.md", ".claude/agents/repo-dev.md"]
      選定基準: "スキーマ設計、クエリ最適化、マイグレーションが必要な場合"

    テスト:
      主要候補: [".claude/agents/unit-tester.md", ".claude/agents/e2e-tester.md", ".claude/agents/frontend-tester.md"]
      選定基準: "テスト種別（ユニット/E2E/コンポーネント）に応じて選定"

    品質・レビュー:
      主要候補: [".claude/agents/code-quality.md", ".claude/agents/arch-police.md", ".claude/agents/sec-auditor.md"]
      選定基準: "コード品質、アーキテクチャ整合性、セキュリティ検証に応じて選定"

    セキュリティ:
      主要候補: [".claude/agents/sec-auditor.md", ".claude/agents/auth-specialist.md", ".claude/agents/secret-mgr.md", ".claude/agents/electron-security.md"]
      選定基準: "対象領域（認証/監査/機密情報/Electron）に応じて選定"

    インフラ・運用:
      主要候補: [".claude/agents/devops-eng.md", ".claude/agents/sre-observer.md", ".claude/agents/process-mgr.md"]
      選定基準: "CI/CD、監視、プロセス管理が必要な場合"

    ドキュメント:
      主要候補: [".claude/agents/spec-writer.md", ".claude/agents/api-doc-writer.md", ".claude/agents/manual-writer.md"]
      選定基準: "ドキュメント種別（仕様書/API/マニュアル）に応じて選定"

    Electron:
      主要候補: [".claude/agents/electron-architect.md", ".claude/agents/electron-ui-dev.md", ".claude/agents/electron-security.md", ".claude/agents/electron-devops.md"]
      選定基準: "Electron固有の設計、UI、セキュリティ、ビルドに応じて選定"

    Git・PR作成:
      主要候補: [".claude/agents/devops-eng.md", ".claude/agents/command-arch.md", ".claude/agents/prompt-eng.md"]
      選定基準: "Git操作、PR作成、コミットメッセージ生成が必要な場合"

複合タスクの選定例:
説明: |
複数領域にまたがるタスクでは、主担当と補助エージェントを組み合わせる。
以下は例示であり、AIは実際のタスク内容に基づいて最適な組み合わせを判断する。

    例1_認証機能実装:
      領域: "セキュリティ + フロントエンド + バックエンド"
      候補組み合わせ: ".claude/agents/auth-specialist.md（主）, .claude/agents/ui-designer.md, .claude/agents/logic-dev.md"

    例2_パフォーマンス改善:
      領域: "データベース + バックエンド + 監視"
      候補組み合わせ: ".claude/agents/dba-mgr.md（主）, .claude/agents/repo-dev.md, .claude/agents/sre-observer.md"

    例3_新規画面追加:
      領域: "フロントエンド + テスト"
      候補組み合わせ: ".claude/agents/ui-designer.md（主）, .claude/agents/router-dev.md, .claude/agents/frontend-tester.md"

選定時の注意: - "agent_list.md に記載の全エージェントが選定対象"

- "固定的な選定を避け、タスクの具体的な要件に基づいて判断"
- "選定理由を必ず記載し、なぜそのエージェントが最適かを説明"
- "必要に応じて複数エージェントの協調を設計"
- "記載例にないエージェントの組み合わせも積極的に検討"

# =============================================================================

# Layer 3: ドメイン定義層

# =============================================================================

ドメイン定義:

用語集:
"Git Worktree":
定義: |
単一のGitリポジトリから複数の作業ディレクトリを作成する機能。
各Worktreeは独立したブランチを持ち、本体ブランチに影響を与えずに開発できる。
タスクごとに独立した環境を作成し、並行開発や実験的変更を安全に実施するために使用する。
命名規則: ".worktrees/task-{timestamp}-{hash}"
用途: "タスクごとの独立した開発環境の提供"

    "タスク分解":
      定義: |
        複雑なタスクを単一責務の原則に基づいて、
        独立して実行可能な複数のサブタスクに分割すること。
        各フェーズ内でも、責務が複数ある場合は必ず分割する。

    "単一責務の原則":
      定義: |
        1つのサブタスクは1つの明確な責務のみを持つ。
        「要件定義」フェーズでも複数の要件領域がある場合は、
        それぞれを独立したサブタスクとして分割する。

    "TDDサイクル":
      定義: |
        Red（テスト失敗確認）→ Green（テスト成功確認）→ Refactor（品質改善）の
        テスト駆動開発サイクル。各実装単位ごとに適用する。

    "品質ゲート":
      定義: |
        次フェーズに進む前に満たすべき品質基準。
        すべての基準をクリアしなければ次へ進めない。

    "スラッシュコマンド":
      定義: |
        Claude Codeで実行するカスタムコマンド。
        `/ai:xxx` 形式で記述される（例: .claude/commands/ai/setup-auth.md, .claude/commands/ai/generate-unit-tests.md）。
        ターミナルのシェルコマンドではなく、Claude Code内で実行される。
        利用可能なコマンドは `.claude/commands/ai/command_list.md` を参照。

ビジネスルール:
単一責務分解ルール: - ID: "SRP_PHASE"
内容: |
各フェーズ内でも、責務が複数ある場合は必ず複数のサブタスクに分割する。
例: 要件定義フェーズで「認証要件」と「API要件」がある場合、
T-00-1: 認証要件定義、T-00-2: API要件定義 のように分割する。
優先度: "必須"

      - ID: "SRP_IMPLEMENTATION"
        内容: |
          実装フェーズでも、異なる機能・レイヤーは別サブタスクとする。
          例: フロントエンド実装とバックエンド実装は別サブタスク。
        優先度: "必須"

    プロセス制約:
      - ID: "CONST_WORKTREE_FIRST"
        内容: "タスク開始時に必ずGit Worktree環境を準備すること（Phase -1）"
        優先度: "必須"

      - ID: "CONST_WORKTREE_NAMING"
        内容: "Worktree名は `.worktrees/task-{timestamp}-{hash}` 形式とすること"
        優先度: "必須"

      - ID: "CONST_WORKTREE_MIGRATION"
        内容: "Worktree作成後、そのディレクトリに移動して作業すること"
        優先度: "必須"

      - ID: "CONST_PHASE_ORDER"
        内容: "Phase -1→0→1→2(設計レビュー)→3→4→5→6→7(最終レビュー)→8(手動テスト)→9(ドキュメント更新)→10(PR作成)の順序を厳守すること"
        優先度: "必須"

      - ID: "CONST_REVIEW_GATE"
        内容: "レビューゲート(Phase 2, 7)未通過で次フェーズに進んではならない"
        優先度: "必須"

      - ID: "CONST_REVIEW_FEEDBACK"
        内容: "レビューで問題発見時は影響範囲に応じた適切なフェーズへ戻ること"
        優先度: "必須"

      - ID: "CONST_TDD_FIRST"
        内容: "実装前に必ずテストを作成すること（Phase 3 → Phase 4）"
        優先度: "必須"

      - ID: "CONST_QUALITY_GATE"
        内容: "品質ゲート未通過でPhase 9に進んではならない"
        優先度: "必須"

      - ID: "CONST_MANUAL_TEST"
        内容: "Phase 8の手動テスト完了後にPhase 9に進むこと"
        優先度: "必須"

      - ID: "CONST_DOC_UPDATE"
        内容: "Phase 9でdocs/00-requirements/配下のドキュメントを更新すること"
        優先度: "必須"

      - ID: "CONST_PR_CREATION"
        内容: "Phase 10でPR作成・CI確認を実施し、ユーザーにマージ可能を通知すること"
        優先度: "必須"

      - ID: "CONST_SINGLE_COMMAND"
        内容: "1サブタスク = 1コマンドの対応を原則とする"
        優先度: "推奨"

# =============================================================================

# Layer 4: 共通ポリシー層

# =============================================================================

共通ポリシー:

セキュリティ:
禁止アクション: - "本番環境への直接デプロイ"

- "認証情報のハードコーディング"
- "セキュリティチェックのスキップ"
- "CI未完了でのマージ"

品質基準:
事実確認ルール: |
推測と事実を明確に区別し、不確実な情報には
限定詞（「可能性がある」「推測される」等）を付与する。

エスカレーション:
条件: - "品質ゲートの基準を満たせない場合"

- "セキュリティ上の懸念が発見された場合"
- "想定外のエラーが連続した場合"
- "Git Worktree環境の準備に失敗した場合"
- "CIが繰り返し失敗する場合"

手順: | 1. 問題の具体的な内容を報告2. 試行した対策を説明3. 推奨される次のアクションを提案4. ユーザーの判断を仰ぐ

# =============================================================================

# Layer 5: フェーズ構造定義

# =============================================================================

フェーズ構造:

説明: |
すべてのタスクは以下のフェーズ構造に従う。
各フェーズ内で責務が複数ある場合は、サブタスク番号を分岐させる。
（例: T-00-1, T-00-2, T-00-3 のように）

フェーズ一覧:

    Phase_-1:
      名称: "環境準備（Git Worktree作成）"
      ID接頭辞: "T--1"
      目的: |
        タスク実装用の独立したGit Worktree環境を作成し、
        本体ブランチに影響を与えずに開発を進められる環境を準備する。
      背景: |
        複数タスクの並行開発や実験的な変更のため、
        各タスクごとに独立したWorktreeで作業を行う必要がある。
        これにより、本体ブランチを保護し、タスク間の干渉を防ぐ。
      実行内容:
        - タスク識別子の生成（タイムスタンプ + ランダムハッシュ）
        - Git Worktreeの作成（`.worktrees/task-{timestamp}-{hash}`）
        - 新規ブランチの作成（Worktreeと同名）
        - 作業ディレクトリの移動
        - 環境の初期化確認（依存関係インストール、ビルド確認等）
      スラッシュコマンド:
        - "/ai:create-worktree" (存在する場合)
        - または直接Bashコマンドで実行
      成果物: "独立したGit Worktree環境"
      完了条件:
        - "Git Worktreeが正常に作成されている"
        - "新規ブランチが作成されている"
        - "Worktreeディレクトリへ移動済み"
        - "依存関係がインストールされている（必要に応じて）"
        - "ビルドが成功する"
      参照: "Git Worktreeコマンド、pnpmコマンド"

    Phase_0:
      名称: "要件定義"
      ID接頭辞: "T-00"
      目的: |
        タスクの目的、スコープ、受け入れ基準を明文化する。
        複数の要件領域がある場合は、それぞれ独立したサブタスクとして定義する。
      分割基準: |
        - 機能領域ごと（認証、API、UI等）
        - ステークホルダーごと（ユーザー向け、管理者向け等）
        - 非機能要件ごと（パフォーマンス、セキュリティ等）
      スラッシュコマンド候補:
        - "/ai:define-requirements"
        - "/ai:analyze-requirements"
        - "/ai:write-specification"
      成果物: "docs/30-workflows/{{機能名}}/task-step{{N}}-{{要件定義名}}.md 配下の要件ドキュメント"
      参照: ".claude/agents/agent_list.md から要件分析系エージェントを選定"

    Phase_1:
      名称: "設計"
      ID接頭辞: "T-01"
      目的: |
        要件を実現可能な構造に落とし込む。
        設計対象ごとに独立したサブタスクとして定義する。
      分割基準: |
        - 設計領域ごと（アーキテクチャ、API、DB、UI等）
        - コンポーネントごと
        - レイヤーごと（ドメイン、アプリケーション、インフラ等）
      スラッシュコマンド候補:
        - ".claude/commands/ai/design-architecture.md"
        - ".claude/commands/ai/design-api.md"
        - ".claude/commands/ai/design-database.md"
        - "/ai:design-ui"
      成果物: "docs/30-workflows/{{機能名}}/task-step{{N+1}}-{{設計名}}.md"
      参照: ".claude/agents/agent_list.md から設計系エージェントを選定"

    Phase_2:
      名称: "設計レビューゲート"
      ID接頭辞: "T-02"
      目的: |
        実装開始前に要件・設計の妥当性を複数エージェントで検証する。
        問題を早期発見し、実装フェーズでの手戻りを最小化する。
      背景: |
        設計ミスが実装後に発見されると修正コストが大幅に増加する。
        「Shift Left」原則に基づき、問題を可能な限り早期に検出する。

      エージェント選定方針: |
        レビュー参加エージェントはタスクの対象領域に応じて動的に選定する。
        以下は代表的なレビュー観点と候補エージェントの例であり、
        AIはタスク固有の要件に基づいて最適な組み合わせを判断すること。

      スラッシュコマンド候補:
        - "/ai:review-design"
        - "/ai:validate-architecture"
        - "/ai:review-security"

      レビュー観点（動的選定）:
        説明: |
          タスクの性質に応じて必要なレビュー観点を選択し、
          各観点に最適なエージェントを選定する。
          全ての観点が必須ではなく、タスクに関連する観点のみ実施する。

        要件充足性:
          候補エージェント: [".claude/agents/req-analyst.md", ".claude/agents/product-manager.md", ".claude/agents/spec-writer.md"]
          チェック項目:
            - "要件が明確かつ検証可能か"
            - "スコープが適切に定義されているか"
            - "受け入れ基準が具体的か"

        アーキテクチャ整合性:
          候補エージェント: [".claude/agents/arch-police.md", ".claude/agents/domain-modeler.md"]
          チェック項目:
            - "クリーンアーキテクチャのレイヤー違反がないか"
            - "依存関係逆転の原則(DIP)が守られているか"
            - "既存設計との整合性があるか"

        ドメインモデル妥当性:
          候補エージェント: [".claude/agents/domain-modeler.md", ".claude/agents/logic-dev.md"]
          チェック項目:
            - "ユビキタス言語が適切に使用されているか"
            - "エンティティ・値オブジェクトの境界が適切か"
            - "ドメインルールが正しく表現されているか"

        セキュリティ設計:
          候補エージェント: [".claude/agents/sec-auditor.md", ".claude/agents/auth-specialist.md", ".claude/agents/electron-security.md"]
          チェック項目:
            - "セキュリティ上の考慮漏れがないか"
            - "認証・認可の設計が適切か"
            - "データ保護の方針が明確か"

        UI/UX設計:
          候補エージェント: [".claude/agents/ui-designer.md", ".claude/agents/frontend-tester.md"]
          チェック項目:
            - "アクセシビリティが考慮されているか"
            - "ユーザビリティが確保されているか"
            - "デザインシステムとの整合性があるか"

        データベース設計:
          候補エージェント: [".claude/agents/db-architect.md", ".claude/agents/dba-mgr.md"]
          チェック項目:
            - "正規化が適切か"
            - "インデックス設計が考慮されているか"
            - "パフォーマンス影響が検討されているか"

        API設計:
          候補エージェント: [".claude/agents/api-doc-writer.md", ".claude/agents/gateway-dev.md"]
          チェック項目:
            - "REST原則に従っているか"
            - "エラーハンドリングが適切か"
            - "バージョニング戦略が明確か"

      レビュー結果判定:
        PASS: "全レビュー観点で問題なし → Phase 3へ進行"
        MINOR: "軽微な指摘あり → 指摘対応後Phase 3へ進行"
        MAJOR: "重大な問題あり → 影響範囲に応じて戻り先を決定"

      戻り先決定基準:
        要件の問題: "Phase 0（要件定義）へ戻る"
        設計の問題: "Phase 1（設計）へ戻る"
        両方の問題: "Phase 0（要件定義）へ戻る"

      成果物: "docs/30-workflows/{{機能名}}/task-step{{N+2}}-design-review.md"
      参照: ".claude/agents/agent_list.md から要件・設計・セキュリティ系エージェントを選定"

    Phase_3:
      名称: "テスト作成 (TDD: Red)"
      ID接頭辞: "T-03"
      目的: |
        期待される動作を検証するテストを実装より先に作成する。
        テスト対象の機能・レイヤーごとにサブタスクを分割する。
      分割基準: |
        - テスト種別ごと（ユニット、統合、E2E等）
        - 機能ごと
        - レイヤーごと（フロントエンド、バックエンド等）
      スラッシュコマンド候補:
        - ".claude/commands/ai/generate-unit-tests.md"
        - "/ai:generate-integration-tests"
        - ".claude/commands/ai/generate-e2e-tests.md"
        - "/ai:write-test-cases"
      検証: "テストを実行してRed（失敗）を確認"
      成果物: "docs/30-workflows/{{機能名}}/task-step{{N+3}}-{{テスト設計名}}.md"
      参照: ".claude/agents/agent_list.md からテスト系エージェントを選定"

    Phase_4:
      名称: "実装 (TDD: Green)"
      ID接頭辞: "T-04"
      目的: |
        テストを通すための最小限の実装を行う。
        実装対象の機能・レイヤーごとにサブタスクを分割する。
      分割基準: |
        - 機能ごと
        - レイヤーごと（フロントエンド、バックエンド、インフラ等）
        - コンポーネントごと
      スラッシュコマンド候補:
        - "/ai:implement-feature"
        - "/ai:implement-api"
        - "/ai:implement-ui"
        - "/ai:implement-logic"
      検証: "テストを実行してGreen（成功）を確認"
      成果物: "docs/30-workflows/{{機能名}}/task-step{{N+4}}-{{実装名}}.md"
      参照: ".claude/agents/agent_list.md から実装系エージェントを選定"

    Phase_5:
      名称: "リファクタリング (TDD: Refactor)"
      ID接頭辞: "T-05"
      目的: |
        動作を変えずにコード品質を改善する。
        改善対象の領域ごとにサブタスクを分割する。
      分割基準: |
        - 改善領域ごと（命名、構造、重複排除等）
        - レイヤーごと
        - コンポーネントごと
      スラッシュコマンド候補:
        - "/ai:refactor-code"
        - "/ai:improve-code-quality"
        - "/ai:optimize-performance"
      検証: "テストを再実行して継続成功を確認"
      成果物: "docs/30-workflows/{{機能名}}/task-step{{N+5}}-{{リファクタリング名}}.md"
      参照: ".claude/agents/agent_list.md から品質系エージェントを選定"

    Phase_6:
      名称: "品質保証"
      ID接頭辞: "T-06"
      目的: |
        定義された品質基準をすべて満たすことを検証する。
        検証領域ごとにサブタスクを分割する。
      分割基準: |
        - 検証種別ごと（テスト実行、Lint、型チェック、セキュリティ等）
      スラッシュコマンド候補:
        - "/ai:run-quality-checks"
        - "/ai:run-security-audit"
        - "/ai:check-test-coverage"
      品質ゲート:
        - "機能検証: 自動テストの完全成功"
        - "コード品質: Lint/型チェッククリア"
        - "テスト網羅性: カバレッジ基準達成"
        - "セキュリティ: 重大な脆弱性の不在"
      成果物: "docs/30-workflows/{{機能名}}/task-step{{N+6}}-{{レポート名}}.md"
      参照: ".claude/agents/agent_list.md からQA/セキュリティ系エージェントを選定"

    Phase_7:
      名称: "最終レビューゲート"
      ID接頭辞: "T-07"
      目的: |
        実装完了後、ドキュメント更新前に全体的な品質・整合性を検証する。
        複数の専門エージェントによる多角的レビューで見落としを防ぐ。
      背景: |
        Phase 6の自動検証だけでは検出できない設計判断や
        ベストプラクティス違反を人間的視点で確認する。

      エージェント選定方針: |
        最終レビューはタスクの実装内容に応じて必要な観点・エージェントを動的に選定する。
        AIはタスク固有の要件と実装領域に基づいて最適な組み合わせを判断すること。
        以下は参考例であり、全ての観点を網羅する必要はない。

      スラッシュコマンド候補:
        - "/ai:final-review"
        - "/ai:review-implementation"
        - "/ai:validate-quality"

      レビュー観点（動的選定）:
        説明: |
          実装した内容の領域に応じて必要なレビュー観点を選択し、
          各観点に最適なエージェントを動的に選定する。

        コード品質:
          候補エージェント: [".claude/agents/code-quality.md", ".claude/agents/arch-police.md"]
          チェック項目:
            - "コーディング規約への準拠"
            - "可読性・保守性の確保"
            - "適切なエラーハンドリング"
            - "過度な複雑性の有無"

        アーキテクチャ遵守:
          候補エージェント: [".claude/agents/arch-police.md", ".claude/agents/domain-modeler.md"]
          チェック項目:
            - "実装がアーキテクチャ設計に従っているか"
            - "レイヤー間の依存関係が適切か"
            - "SOLID原則への準拠"

        テスト品質:
          候補エージェント: [".claude/agents/unit-tester.md", ".claude/agents/e2e-tester.md", ".claude/agents/frontend-tester.md"]
          チェック項目:
            - "テストカバレッジが十分か"
            - "テストケースが適切に設計されているか"
            - "境界値・異常系のテストがあるか"
            - "テストの可読性・保守性"

        セキュリティ:
          候補エージェント: [".claude/agents/sec-auditor.md", ".claude/agents/auth-specialist.md", ".claude/agents/electron-security.md", ".claude/agents/secret-mgr.md"]
          チェック項目:
            - "OWASP Top 10への対応"
            - "入力検証・サニタイズの実装"
            - "認証・認可の適切な実装"
            - "機密情報の適切な取り扱い"

        パフォーマンス:
          候補エージェント: [".claude/agents/sre-observer.md", ".claude/agents/dba-mgr.md", ".claude/agents/repo-dev.md"]
          チェック項目:
            - "N+1問題等のパフォーマンス問題の有無"
            - "適切なログ出力の実装"
            - "監視・メトリクス収集の準備"

        フロントエンド（該当する場合）:
          候補エージェント: [".claude/agents/ui-designer.md", ".claude/agents/frontend-tester.md", ".claude/agents/state-manager.md"]
          チェック項目:
            - "アクセシビリティ(WCAG)への準拠"
            - "レスポンシブデザインの実装"
            - "ユーザビリティの確保"

        バックエンドAPI（該当する場合）:
          候補エージェント: [".claude/agents/api-doc-writer.md", ".claude/agents/gateway-dev.md", ".claude/agents/schema-def.md"]
          チェック項目:
            - "API設計の一貫性"
            - "エラーレスポンスの適切性"
            - "バージョニング戦略"

        データベース（該当する場合）:
          候補エージェント: [".claude/agents/db-architect.md", ".claude/agents/dba-mgr.md", ".claude/agents/repo-dev.md"]
          チェック項目:
            - "スキーマ設計の妥当性"
            - "インデックス設計の適切性"
            - "マイグレーションの安全性"

        Electron（該当する場合）:
          候補エージェント: [".claude/agents/electron-security.md", ".claude/agents/electron-architect.md", ".claude/agents/electron-ui-dev.md"]
          チェック項目:
            - "IPC通信のセキュリティ"
            - "CSP設定の適切性"
            - "自動更新機能の安全性"

      未完了タスク指示書作成:
        方針: |
          レビューで発見された課題の性質に応じて、最適なエージェントを動的に選定する。
          以下は参考例であり、AIは課題の具体的な内容に基づいて判断すること。

        エージェント選定の考え方:
          - "課題の主要領域を特定（セキュリティ/品質/テスト/UI等）"
          - "その領域に最も精通したエージェントを選定"
          - "複合的な課題の場合は複数エージェントを組み合わせ"
          - "選定理由を明記"

        領域別候補エージェント:
          セキュリティ課題: [".claude/agents/sec-auditor.md", ".claude/agents/electron-security.md", ".claude/agents/auth-specialist.md"]
          アーキテクチャ課題: [".claude/agents/arch-police.md", ".claude/agents/domain-modeler.md"]
          コード品質課題: [".claude/agents/code-quality.md", ".claude/agents/logic-dev.md"]
          テスト課題: [".claude/agents/unit-tester.md", ".claude/agents/e2e-tester.md", ".claude/agents/frontend-tester.md"]
          パフォーマンス課題: [".claude/agents/sre-observer.md", ".claude/agents/dba-mgr.md"]
          UI/UX課題: [".claude/agents/ui-designer.md", ".claude/agents/frontend-tester.md"]
          API課題: [".claude/agents/api-doc-writer.md", ".claude/agents/gateway-dev.md"]
          データベース課題: [".claude/agents/db-architect.md", ".claude/agents/dba-mgr.md"]
          要件課題: [".claude/agents/req-analyst.md", ".claude/agents/product-manager.md"]
          仕様書作成: [".claude/agents/spec-writer.md", ".claude/agents/manual-writer.md"]

        作成フロー:
          1. "レビューで課題を発見"
          2. "課題の性質・領域を分析"
          3. "最適なエージェントを動的に選定（選定理由を明記）"
          4. "選定されたエージェントが指示書を作成"
          5. "指示書の品質を検証"

        指示書品質チェック項目:
          - "Why（なぜ必要か）が明確に記述されているか"
          - "What（何を達成するか）が具体的に定義されているか"
          - "How（どのように実行するか）が詳細に説明されているか"
          - "Claude Codeスラッシュコマンド（/ai:xxx形式）・エージェント・スキルが選定されているか"
          - "完了条件が検証可能な形で定義されているか"
          - "前提条件・依存関係が明記されているか"
          - "テストケース/検証方法が記載されているか"
          - "リスクと対策が検討されているか"

        出力規則:
          出力先: "docs/30-workflows/unassigned-task/"
          命名規則:
            要件系: "requirements-{{機能領域}}.md"
            改善系: "task-{{改善領域}}-improvements.md"

      レビュー結果判定:
        PASS: "全レビュー観点で問題なし → Phase 8へ進行"
        MINOR: "軽微な指摘あり → 指摘対応後Phase 8へ進行（Phase 5内で修正可能）"
        MAJOR: "重大な問題あり → 影響範囲に応じて戻り先を決定"
        CRITICAL: "致命的な問題あり → Phase 0へ戻りユーザーと要件を再確認"

      戻り先決定基準:
        要件の問題: "Phase 0（要件定義）へ戻る"
        設計の問題: "Phase 1（設計）へ戻る"
        テスト設計の問題: "Phase 3（テスト作成）へ戻る"
        実装の問題: "Phase 4（実装）へ戻る"
        コード品質の問題: "Phase 5（リファクタリング）へ戻る"

      エスカレーション条件:
        - "戻り先の判断が困難な場合"
        - "複数フェーズにまたがる問題の場合"
        - "要件自体の見直しが必要な場合"
        手順: "ユーザーに問題を報告し、戻り先と対応方針を協議する"

      成果物: "docs/30-workflows/{{機能名}}/task-step{{N+7}}-final-review.md"
      参照: ".claude/agents/agent_list.md からQA/セキュリティ/対象領域別エージェントを選定"

    Phase_8:
      名称: "手動テスト検証"
      ID接頭辞: "T-08"
      目的: |
        自動テストでは検証できないユーザー体験・UI/UX・実環境動作を
        手動で確認し、実際のユーザー視点での品質を担保する。
      背景: |
        自動テストはロジックの正しさを検証するが、以下は手動確認が必要：
        - 実際のユーザー操作フロー
        - 視覚的なUI/UXの確認
        - 外部サービスとの実際の連携
        - エッジケースやコーナーケース
        - パフォーマンスの体感確認

      スラッシュコマンド候補:
        - "/ai:generate-test-plan"
        - "/ai:create-test-cases"

      手動テスト分類:
        機能テスト:
          説明: "実装した機能が要件通りに動作するか確認"
          観点:
            - "正常系: 期待通りの入力で期待通りの結果が得られるか"
            - "異常系: 不正な入力や操作に対して適切にエラー処理されるか"
            - "境界値: 上限/下限値での動作は正常か"
            - "状態遷移: 各状態間の遷移は正しく行われるか"

        UI/UXテスト:
          説明: "ユーザーインターフェースの使いやすさ・視覚的正しさを確認"
          観点:
            - "レイアウト: 要素の配置は適切か、崩れはないか"
            - "レスポンシブ: 各画面サイズで正しく表示されるか"
            - "フィードバック: 操作結果がユーザーに適切に伝わるか"
            - "エラー表示: エラーメッセージは分かりやすいか"
            - "ローディング: 処理中の表示は適切か"

        統合テスト:
          説明: "外部サービス・他コンポーネントとの連携を確認"
          観点:
            - "API連携: 外部APIとの通信は正常か"
            - "認証連携: OAuth等の認証フローは正常か"
            - "データ永続化: DBへの保存・読み込みは正常か"
            - "ファイル操作: アップロード・ダウンロードは正常か"

        リグレッションテスト:
          説明: "既存機能への影響がないことを確認"
          観点:
            - "既存機能: 変更前と同様に動作するか"
            - "関連機能: 関連する機能に影響はないか"

      テストケーステンプレート:
        説明: |
          各テストケースは以下の形式で記述する。
          テスト実行者が迷わず実行できる粒度で記述すること。

        形式: |
          | No | カテゴリ | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 実行結果 | 備考 |
          |----|----------|-----------|----------|----------|----------|----------|------|

      成果物: "docs/30-workflows/{{機能名}}/task-step{{N+8}}-manual-test.md"
      参照: ".claude/agents/agent_list.md からQA系エージェントを選定"

      完了条件:
        - "すべての手動テストケースが実行済み"
        - "すべてのテストケースがPASS（または既知の問題として記録）"
        - "発見された不具合が修正済みまたは未完了タスクとして記録済み"

    Phase_9:
      名称: "ドキュメント更新・未完了タスク記録"
      ID接頭辞: "T-09"
      目的: |
        1. タスク完了後、実装した内容をシステム要件ドキュメントに反映する
        2. レビューで発見された未完了タスク・追加タスクを記録する
      前提条件: |
        - Phase 6の品質ゲートをすべて通過していること
        - Phase 7の最終レビューゲートを通過していること
        - Phase 8の手動テストが完了していること
        - すべてのテストが成功していること

      サブフェーズ:
        Phase_9_1:
          名称: "システムドキュメント更新"
          更新対象: "docs/00-requirements/ 配下の関連ドキュメント"
          スラッシュコマンド: ".claude/commands/ai/update-all-docs.md"
          更新原則:
            - "概要のみ記載（詳細な実装説明は不要）"
            - "システム構築に必要十分な情報のみ追記"
            - "既存ドキュメントの構造・フォーマットを維持"
            - "Single Source of Truth原則を遵守（重複記載禁止）"
          スキル同期:
            目的: "要求仕様の更新をスキルへ反映する"
            実行コマンド:
              - "python3 scripts/sync_requirements_to_skills.py"
              - "python3 scripts/update_skill_levels.py"
            自動化:
              - ".claude/settings.local.json の Stop フックに requirements-sync.sh を設定する"
            補足:
              - "SKILL.md は requirements-index の参照が不足している場合のみ更新"
              - "要求仕様の詳細は SKILL.md に再記述せず、docs/00-requirements を参照する"
          更新判断基準: |
            以下の場合にドキュメント更新が必要：

            【概要・目的の変更】
            - プロジェクト概要・ビジョンの変更 → 01-overview.md
            - システム全体設計の変更 → master_system_design.md

            【非機能要件の変更】
            - パフォーマンス要件の変更 → 02-non-functional-requirements.md
            - セキュリティ要件の変更 → 02-non-functional-requirements.md
            - 可用性・信頼性要件の変更 → 02-non-functional-requirements.md
            - スケーラビリティ要件の変更 → 02-non-functional-requirements.md

            【技術スタックの変更】
            - 新しいライブラリ/フレームワークの追加 → 03-technology-stack.md
            - 依存関係の変更 → 03-technology-stack.md
            - ビルドツール/開発ツールの変更 → 03-technology-stack.md

            【構造・アーキテクチャの変更】
            - ディレクトリ構造の変更 → 04-directory-structure.md
            - 新しいエンティティ/テーブルの追加 → 05-architecture.md
            - レイヤー構造の変更 → 05-architecture.md
            - コンポーネント間依存関係の変更 → 05-architecture.md

            【インターフェースの変更】
            - コアインターフェースの追加/変更 → 06-core-interfaces.md
            - 型定義の追加/変更 → 06-core-interfaces.md

            【エラーハンドリングの変更】
            - エラーコードの追加 → 07-error-handling.md
            - エラーハンドリング戦略の変更 → 07-error-handling.md

            【APIの変更】
            - 新しいAPIエンドポイントの追加 → 08-api-design.md
            - APIレスポンス形式の変更 → 08-api-design.md
            - 認証/認可フローの変更 → 08-api-design.md

            【エージェント機能の変更】
            - ローカルエージェント機能の追加/変更 → 09-local-agent.md
            - エージェント間通信の変更 → 09-local-agent.md

            【Discord Bot機能の変更】
            - Botコマンドの追加/変更 → 10-discord-bot.md
            - Bot連携機能の変更 → 10-discord-bot.md

            【プラグインの変更】
            - 新しい機能プラグインの追加 → 11-plugin-development.md
            - プラグインAPIの変更 → 11-plugin-development.md

            【デプロイメントの変更】
            - デプロイ手順の変更 → 12-deployment.md
            - インフラ構成の変更 → 12-deployment.md
            - CI/CDパイプラインの変更 → 12-deployment.md

            【環境変数の変更】
            - 新しい環境変数の追加 → 13-environment-variables.md
            - 環境変数の削除/変更 → 13-environment-variables.md

            【ワークフローの変更】
            - タスクワークフローの変更 → 14-task-workflow-specification.md
            - 状態遷移の変更 → 14-task-workflow-specification.md

            【データベースの変更】
            - テーブル/スキーマの追加/変更 → 15-database-design.md
            - インデックス設計の変更 → 15-database-design.md
            - マイグレーション戦略の変更 → 15-database-design.md

            【UI/UXの変更】
            - UIコンポーネントの追加 → 16-ui-ux-guidelines.md
            - デザインシステムの変更 → 16-ui-ux-guidelines.md
            - アクセシビリティ対応の変更 → 16-ui-ux-guidelines.md

            【セキュリティの変更】
            - セキュリティポリシーの変更 → 17-security-guidelines.md
            - 認証/認可実装の変更 → 17-security-guidelines.md
            - 脆弱性対策の追加 → 17-security-guidelines.md

            【用語の変更】
            - 新しい用語の追加 → 99-glossary.md
            - ユビキタス言語の変更 → 99-glossary.md

        Phase_9_2:
          名称: "未完了タスク・追加タスク記録"
          出力先: "docs/30-workflows/unassigned-task/"
          スラッシュコマンド候補:
            - "/ai:create-task-doc"
            - "/ai:document-unfinished-tasks"
          目的: |
            レビューで発見された未対応の課題や、スコープ外だが将来対応が必要な
            タスクを、誰でも実行可能な粒度でドキュメント化する。
          ファイル命名規則:
            要件系: "requirements-{{機能領域}}.md"
            改善系: "task-{{改善領域}}-improvements.md"
          記録基準: |
            以下のいずれかに該当する場合に記録する：
            - Phase 7レビューでMINOR判定された未対応項目
            - Phase 8手動テストで発見されたが今回スコープ外の改善点
            - 将来的に必要となる拡張機能
            - 技術的負債として認識された項目
          品質基準: |
            100人中100人が同じ理解でタスクを実行できる粒度で記述する。
            AIがタスクの性質に応じて最適な情報を動的に生成する。

      成果物:
        - "docs/00-requirements/ 配下の更新されたドキュメント"
        - ".claude/skills/**/resources/requirements-index.md の更新"
        - "docs/30-workflows/unassigned-task/ 配下の未完了タスクドキュメント"
      参照: ".claude/agents/agent_list.md からtechnical-writer, spec-writerエージェントを選定"

    Phase_10:
      名称: "PR作成・CI確認・マージ準備"
      ID接頭辞: "T-10"
      目的: |
        実装完了後、Git Worktreeの変更をコミット→PR作成→CI確認を行い、
        ユーザーがマージ可能な状態にする。
      背景: |
        .kamui/prompt/merge-prompt.txt に基づき、
        差分からPR作成・CI確認までの一連のフローを自動化する。
        PRマージは必ずユーザーがGitHub UIで手動実行する。

      推奨エージェント:
        - ".claude/agents/devops-eng.md: Git/CI/CD、GitHub Actions、デプロイフロー"
        - ".claude/agents/command-arch.md: ワークフロー定型化、コマンドオーケストレーション"
        - ".claude/agents/prompt-eng.md: コミットメッセージ・PR本文の自動生成"

      実行内容:
        1. "差分確認（git status, git diff）"
        2. "コミット作成（Conventional Commits形式）"
        3. "ブランチプッシュ"
        4. "PR作成（gh pr create）"
        5. "PR補足コメント追加（gh pr comment）"
        6. "CI/CD完了確認（gh pr checks）"
        7. "ユーザーにマージ可能を通知"

      スラッシュコマンド候補:
        - ".claude/commands/ai/create-pr.md"
        - "/ai:commit-and-pr"
        - "/ai:prepare-merge"

      サブタスク:
        T-10-1:
          名称: "差分確認・コミット作成"
          実行手順: |
            1. Worktreeディレクトリ内で差分確認
               ```bash
               git status
               git diff
               ```

            2. 変更内容を分析し、適切なコミットメッセージを生成
               - タイプ: feat/fix/refactor/docs/test/chore/ci
               - スコープ: features/shared/api/db/docs/infra/config
               - subject: 50文字以内、現在形・命令形

            3. コミット実行
               ```bash
               git add .
               git commit -m "$(cat <<'EOF'
               <type>(<scope>): <subject>

               <body>

               🤖 Generated with [Claude Code](https://claude.com/claude-code)

               Co-Authored-By: Claude <noreply@anthropic.com>
               EOF
               )"
               ```

        T-10-2:
          名称: "PR作成"
          実行手順: |
            1. ブランチプッシュ
               ```bash
               git push -u origin <branch-name>
               ```

            2. PR作成（テンプレート使用）
               ```bash
               gh pr create --title "<type>(<scope>): <subject>" --body "$(cat <<'EOF'
               ## 概要

               <!-- この PR の目的と背景を記述 -->

               ## 変更内容

               <!-- 主な変更点をリストアップ -->
               -
               -
               -

               ## 変更タイプ

               <!-- 該当するものにチェック -->
               - [ ] 🐛 バグ修正 (bug fix)
               - [ ] ✨ 新機能 (new feature)
               - [ ] 🔨 リファクタリング (refactoring)
               - [ ] 📝 ドキュメント (documentation)
               - [ ] 🧪 テスト (test)
               - [ ] 🔧 設定変更 (configuration)
               - [ ] 🚀 CI/CD (continuous integration)

               ## テスト

               <!-- 実施したテストにチェック -->
               - [ ] ユニットテスト実行 (`pnpm test`)
               - [ ] 型チェック実行 (`pnpm typecheck`)
               - [ ] ESLint チェック実行 (`pnpm lint`)
               - [ ] ビルド確認 (`pnpm build`)
               - [ ] 手動テスト実施

               ## 関連 Issue

               <!-- 関連するIssue番号 -->
               Closes #

               ## 破壊的変更

               <!-- 破壊的変更がある場合は詳細を記述 -->
               - [ ] この PR には破壊的変更が含まれます

               ## チェックリスト

               - [ ] コードが既存のスタイルに従っている
               - [ ] 必要に応じてドキュメントを更新した
               - [ ] 新規・変更機能にテストを追加した
               - [ ] すべてのテストがローカルで成功する
               - [ ] Pre-commit hooks が成功する

               ---

               🤖 Generated with [Claude Code](https://claude.com/claude-code)
               EOF
               )" --base main
               ```

        T-10-3:
          名称: "PR補足コメント追加"
          実行手順: |
            1. PR番号取得
               ```bash
               PR_NUMBER=$(gh pr view --json number -q .number)
               ```

            2. 補足コメント投稿
               ```bash
               gh pr comment "${PR_NUMBER}" --body "$(cat <<'EOF'
               ## 📝 実装の詳細

               <!-- 変更の技術的詳細や設計判断の理由 -->

               ## ⚠️ レビュー時の注意点

               <!-- レビュアーが確認すべき重要なポイント -->

               ## 🔍 テスト方法

               <!-- 動作確認の手順や再現方法 -->

               ## 📚 参考資料

               <!-- 関連ドキュメントやIssue、外部リンク等 -->

               ---

               🤖 Generated with [Claude Code](https://claude.com/claude-code)
               EOF
               )"
               ```

        T-10-4:
          名称: "CI/CD完了確認"
          実行手順: |
            1. CIステータス確認（待機ループ）
               ```bash
               for i in {1..10}; do
                 gh pr checks ${PR_NUMBER}
                 if gh pr checks ${PR_NUMBER} 2>&1 | grep -qE "(pending|in_progress)"; then
                   echo "CI実行中... 30秒後に再確認"
                   sleep 30
                 else
                   echo "CI完了"
                   break
                 fi
               done
               ```

            2. CI結果の最終確認
               ```bash
               gh pr checks ${PR_NUMBER}
               ```

            3. 全チェックがpassであることを確認

        T-10-5:
          名称: "ユーザーへマージ可能通知"
          実行手順: |
            AIはユーザーに以下を報告する：

            1. PR作成完了の通知
               - PR URL
               - PR番号

            2. CI/CD完了の報告
               - 全チェック pass ✅

            3. マージ手順の案内
               - GitHub Web UIでPRを開く
               - CI結果を最終確認
               - 「Squash and merge」をクリック
               - 「Delete branch」にチェック

            4. マージ後の同期手順（オプション）
               ```bash
               cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
               git checkout main
               git pull origin main
               git worktree remove .worktrees/<worktree-name>
               git fetch --prune
               ```

      完了条件:
        - "コミットが作成されている"
        - "PRが作成されている"
        - "PR補足コメントが投稿されている"
        - "CI/CDが全て pass している"
        - "ユーザーにマージ可能が通知されている"

      成果物:
        - "GitHubにコミット・PR作成完了"
        - "CI/CD完了確認"
        - "ユーザーへのマージ準備完了通知"

      参照:
        - ".kamui/prompt/merge-prompt.txt"
        - ".claude/agents/agent_list.md から.claude/agents/devops-eng.md, .claude/agents/command-arch.md, .claude/agents/prompt-eng.mdを選定"

      重要事項:
        - "PRマージは必ずユーザーがGitHub UIで手動実行する"
        - "AIはCI完了確認までを担当し、マージ準備完了をユーザーに通知する"
        - "CI未完了またはfail状態ではマージ通知を行わない"

# =============================================================================

# Layer 6: 出力テンプレート

# =============================================================================

出力テンプレート:

ファイル配置: "docs/30-workflows/{{機能名}}/task-{{機能名}}.md"

未完了タスクテンプレート:
ファイル配置: "docs/30-workflows/unassigned-task/{{ファイル名}}.md"
説明: |
このテンプレートは「指示書」として機能する。
受け手（人間またはAI）がこのドキュメントを読むだけで、
タスクの全体像を理解し、具体的なアクションを実行できる粒度で記述する。
100人中100人が同じ理解でタスクを実行できることを目標とする。

      具体的な内容はAIがタスクの性質に応じて変数に代入する。

    テンプレート: |
      # {{タスク名}} - タスク指示書

      ## メタ情報

      | 項目 | 内容 |
      |------|------|
      | タスクID | {{タスクID}} |
      | タスク名 | {{タスク名}} |
      | 分類 | {{要件/改善/バグ修正/リファクタリング/セキュリティ/パフォーマンス}} |
      | 対象機能 | {{対象機能}} |
      | 優先度 | {{高/中/低}} |
      | 見積もり規模 | {{大規模/中規模/小規模}} |
      | ステータス | 未実施 |
      | 発見元 | {{発見元フェーズ}} |
      | 発見日 | {{YYYY-MM-DD}} |
      | 発見エージェント | {{エージェント名}} |

      ---

      ## 1. なぜこのタスクが必要か（Why）

      ### 1.1 背景
      {{このタスクが必要になった背景・コンテキスト}}

      ### 1.2 問題点・課題
      {{現状の問題点や解決すべき課題}}

      ### 1.3 放置した場合の影響
      {{このタスクを実施しない場合に起こりうる問題}}

      ---

      ## 2. 何を達成するか（What）

      ### 2.1 目的
      {{このタスクで達成すべき具体的な目的}}

      ### 2.2 最終ゴール
      {{達成すべき具体的な最終状態}}

      ### 2.3 スコープ
      #### 含むもの
      {{スコープ内の項目}}

      #### 含まないもの
      {{スコープ外の項目}}

      ### 2.4 成果物
      {{このタスク完了時に生成される成果物一覧}}

      ---

      ## 3. どのように実行するか（How）

      ### 3.1 前提条件
      {{このタスクを開始する前に満たすべき条件}}

      ### 3.2 依存タスク
      {{先に完了している必要があるタスク}}

      ### 3.3 必要な知識・スキル
      {{このタスクを実行するために必要な技術的知識}}

      ### 3.4 推奨アプローチ
      {{推奨される実装アプローチの概要}}

      ---

      ## 4. 実行手順

      ### Phase構成
      ```
      {{フェーズ構成の概要}}
      ```

      {{#each フェーズ}}
      ### Phase {{番号}}: {{フェーズ名}}

      #### 目的
      {{このフェーズの目的}}

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェントリスト（動的選定）
      - **エージェント**: {{タスク内容に基づいて最適なエージェントを選定}}
      - **選定理由**: {{なぜこのエージェントが最適かを具体的に説明}}
      - **代替候補**: {{他に検討したエージェントがあれば記載}}
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキルリスト（動的選定）
      | スキル名 | 活用方法 | 選定理由 |
      |----------|----------|----------|
      {{タスク内容に基づいて最適なスキルを選定}}
      - **参照**: `.claude/skills/skill_list.md`

      #### 成果物
      {{このフェーズの成果物}}

      #### 完了条件
      {{このフェーズの完了条件}}

      ---
      {{/each}}

      ## 5. 完了条件チェックリスト

      ### 機能要件
      {{機能要件の完了条件チェックリスト}}

      ### 品質要件
      {{品質要件の完了条件チェックリスト}}

      ### ドキュメント要件
      {{ドキュメント要件の完了条件チェックリスト}}

      ---

      ## 6. 検証方法

      ### テストケース
      {{実施すべきテストケース}}

      ### 検証手順
      {{完了を確認するための検証手順}}

      ---

      ## 7. リスクと対策

      | リスク | 影響度 | 発生確率 | 対策 |
      |--------|--------|----------|------|
      {{リスク一覧}}

      ---

      ## 8. 参照情報

      ### 関連ドキュメント
      {{関連するドキュメントへのリンク}}

      ### 参考資料
      {{参考となる外部資料やリンク}}

      ---

      ## 9. 備考

      ### レビュー指摘の原文（該当する場合）
      ```
      {{レビュー指摘の原文}}
      ```

      ### 補足事項
      {{その他の補足情報}}

メインテンプレート:
説明: |
実際のタスク実行仕様書のテンプレート。
Phase -1からPhase 10までの全フェーズを含む。

    テンプレート: |
      # {{機能名}} - タスク実行仕様書

      ## ユーザーからの元の指示
      ```
      {{ユーザーの元の指示文をそのまま記載}}
      ```

      ## メタ情報

      | 項目 | 内容 |
      |------|------|
      | タスクID | {{タスクID}} |
      | Worktreeパス | `.worktrees/task-{{timestamp}}-{{hash}}` |
      | ブランチ名 | `task-{{timestamp}}-{{hash}}` |
      | タスク名 | {{タスク名}} |
      | 分類 | {{要件/改善/バグ修正/リファクタリング/セキュリティ/パフォーマンス}} |
      | 対象機能 | {{対象機能}} |
      | 優先度 | {{高/中/低}} |
      | 見積もり規模 | {{大規模/中規模/小規模}} |
      | ステータス | 未実施 |
      | 作成日 | {{YYYY-MM-DD}} |

      ---

      ## タスク概要

      ### 目的
      {{このタスクで達成すべき目的を詳細に記述}}

      ### 背景
      {{このタスクが必要になった背景・コンテキストを詳細に記述}}

      ### 最終ゴール
      {{達成すべき具体的な最終状態}}

      ### 成果物一覧
      | 種別 | 成果物 | 配置先 |
      |------|--------|--------|
      | 環境 | Git Worktree環境 | `.worktrees/task-{{timestamp}}-{{hash}}` |
      | 機能 | {{機能成果物}} | {{パス}} |
      | ドキュメント | {{ドキュメント成果物}} | {{パス}} |
      | 品質 | {{テスト・品質レポート}} | {{パス}} |
      | PR | GitHub Pull Request | GitHub UI |

      ---

      ## 参照ファイル

      本仕様書のコマンド・エージェント・スキル選定は以下を参照：
      - `docs/00-requirements/master_system_design.md` - システム要件
      - `.claude/commands/ai/command_list.md` - /ai:コマンド定義
      - `.claude/agents/agent_list.md` - エージェント定義
      - `.claude/skills/skill_list.md` - スキル定義
      - `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー

      ---

      ## タスク分解サマリー

      | ID | フェーズ | サブタスク名 | 責務 | 依存 |
      |----|----------|--------------|------|------|
      {{#each サブタスク}}
      | {{ID}} | {{フェーズ}} | {{名称}} | {{責務}} | {{依存}} |
      {{/each}}

      **総サブタスク数**: {{サブタスク数}}個

      ---

      ## 実行フロー図

      ```mermaid
      graph TD
          START[タスク開始] --> T--1[Phase -1: 環境準備]
          T--1 --> T-00[Phase 0: 要件定義]
          T-00 --> T-01[Phase 1: 設計]
          T-01 --> T-02[Phase 2: 設計レビューゲート]
          T-02 --> T-03[Phase 3: テスト作成]
          T-03 --> T-04[Phase 4: 実装]
          T-04 --> T-05[Phase 5: リファクタリング]
          T-05 --> T-06[Phase 6: 品質保証]
          T-06 --> T-07[Phase 7: 最終レビューゲート]
          T-07 --> T-08[Phase 8: 手動テスト]
          T-08 --> T-09[Phase 9: ドキュメント更新]
          T-09 --> T-10[Phase 10: PR作成・CI確認]
          T-10 --> END[マージ準備完了]

          T-02 -->|MAJOR| T-01
          T-02 -->|MAJOR: 要件| T-00
          T-07 -->|MAJOR| T-05
          T-07 -->|MAJOR: 実装| T-04
          T-07 -->|MAJOR: テスト| T-03
          T-07 -->|MAJOR: 設計| T-01
          T-07 -->|CRITICAL| T-00
      ```

      ---

      ## Phase -1: 環境準備（Git Worktree作成）

      ### T--1-1: Git Worktree環境作成・初期化

      #### 目的
      タスク実装用の独立したGit Worktree環境を作成し、本体ブランチに影響を与えずに開発を進める。

      #### 背景
      複数タスクの並行開発や実験的な変更のため、各タスクごとに独立したWorktreeで作業を行う必要がある。
      これにより、本体ブランチを保護し、タスク間の干渉を防ぐ。

      #### 責務（単一責務）
      Git Worktree環境の作成と初期化のみを担当する。

      #### Claude Code スラッシュコマンド（該当する場合）
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

      ```
      /ai:create-worktree
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 実行手順（スラッシュコマンドがない場合）

      **1. タスク識別子の生成**
      ```bash
      TASK_ID="task-$(date +%s)-$(openssl rand -hex 4)"
      echo "Generated Task ID: $TASK_ID"
      ```

      **2. Git Worktreeの作成**
      ```bash
      WORKTREE_PATH=".worktrees/$TASK_ID"
      git worktree add "$WORKTREE_PATH" -b "$TASK_ID"
      ```

      **3. Worktreeディレクトリへ移動**
      ```bash
      cd "$WORKTREE_PATH"
      pwd  # 現在のディレクトリを確認
      ```

      **4. 環境確認**
      ```bash
      # ブランチ確認
      git branch --show-current

      # Git状態確認
      git status

      # 依存関係インストール（必要に応じて）
      pnpm install

      # ビルド確認
      pnpm build
      ```

      #### 使用エージェント
      - **エージェント**: なし（Bashコマンド直接実行）
      - **選定理由**: 定型的なGit操作のためエージェント不要

      #### 成果物
      | 成果物 | パス | 内容 |
      |--------|------|------|
      | Git Worktree環境 | `.worktrees/task-{{timestamp}}-{{hash}}` | 独立した作業ディレクトリ |
      | 新規ブランチ | `task-{{timestamp}}-{{hash}}` | タスク専用ブランチ |
      | 初期化済み環境 | - | 依存関係インストール・ビルド完了 |

      #### 完了条件
      - [ ] Git Worktreeが正常に作成されている
      - [ ] 新規ブランチが作成されている（`git branch --show-current`で確認）
      - [ ] Worktreeディレクトリへ移動済み
      - [ ] 依存関係がインストールされている（`node_modules/`が存在）
      - [ ] ビルドが成功する（`pnpm build`が成功）
      - [ ] Git状態がクリーンである（`git status`で未コミット変更なし）

      #### 依存関係
      - **前提**: なし（最初のフェーズ）
      - **後続**: Phase 0（要件定義）

      #### トラブルシューティング

      **問題: Worktree作成失敗**
      ```bash
      # 原因確認
      git worktree list  # 既存Worktree確認

      # 対策: 既存のWorktreeを削除
      git worktree remove <worktree-path>
      ```

      **問題: ビルド失敗**
      ```bash
      # 原因確認
      pnpm why <package-name>  # 依存関係確認

      # 対策: 依存関係再インストール
      rm -rf node_modules pnpm-lock.yaml
      pnpm install
      ```

      **問題: 本体ディレクトリに戻りたい**
      ```bash
      # 本体ディレクトリのパスを確認
      git worktree list

      # 本体ディレクトリに移動
      cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
      ```

      ---

      ## Phase 0: 要件定義

      {{#each Phase0サブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### 責務（単一責務）
      {{このサブタスクが担う唯一の責務}}

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: {{エージェント名}}
      - **選定理由**: {{選定理由}}
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      {{#each スキル}}
      | {{スキル名}} | {{活用方法}} |
      {{/each}}
      - **参照**: `.claude/skills/skill_list.md`

      #### 成果物
      | 成果物 | パス | 内容 |
      |--------|------|------|
      {{#each 成果物}}
      | {{名称}} | {{パス}} | {{内容}} |
      {{/each}}

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## Phase 1: 設計

      {{#each Phase1サブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### 責務（単一責務）
      {{このサブタスクが担う唯一の責務}}

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: {{エージェント名}}
      - **選定理由**: {{選定理由}}
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      {{#each スキル}}
      | {{スキル名}} | {{活用方法}} |
      {{/each}}
      - **参照**: `.claude/skills/skill_list.md`

      #### 成果物
      | 成果物 | パス | 内容 |
      |--------|------|------|
      {{#each 成果物}}
      | {{名称}} | {{パス}} | {{内容}} |
      {{/each}}

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## Phase 2: 設計レビューゲート

      {{#each 設計レビューサブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### レビュー参加エージェント
      | エージェント | レビュー観点 | 選定理由 |
      |-------------|-------------|----------|
      {{#each 参加エージェント}}
      | {{エージェント名}} | {{レビュー観点}} | {{選定理由}} |
      {{/each}}
      - **参照**: `.claude/agents/agent_list.md`

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### レビューチェックリスト
      {{#each レビュー観点}}
      **{{観点名}}** ({{担当エージェント}})
      {{#each チェック項目}}
      - [ ] {{項目}}
      {{/each}}
      {{/each}}

      #### レビュー結果
      - **判定**: {{判定結果}}
      - **指摘事項**: {{指摘内容}}
      - **対応方針**: {{対応内容}}

      #### 戻り先決定（MAJORの場合）
      | 問題の種類 | 戻り先 |
      |-----------|--------|
      {{#each 戻り先基準}}
      | {{問題種類}} | {{戻り先フェーズ}} |
      {{/each}}

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## Phase 3: テスト作成 (TDD: Red)

      {{#each Phase3サブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### 責務（単一責務）
      {{このサブタスクが担う唯一の責務}}

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: {{エージェント名}}
      - **選定理由**: {{選定理由}}
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      {{#each スキル}}
      | {{スキル名}} | {{活用方法}} |
      {{/each}}
      - **参照**: `.claude/skills/skill_list.md`

      #### 成果物
      | 成果物 | パス | 内容 |
      |--------|------|------|
      {{#each 成果物}}
      | {{名称}} | {{パス}} | {{内容}} |
      {{/each}}

      #### TDD検証: Red状態確認
      ```bash
      {{テスト実行コマンド}}
      ```
      - [ ] テストが失敗することを確認（Red状態）

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## Phase 4: 実装 (TDD: Green)

      {{#each Phase4サブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### 責務（単一責務）
      {{このサブタスクが担う唯一の責務}}

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: {{エージェント名}}
      - **選定理由**: {{選定理由}}
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      {{#each スキル}}
      | {{スキル名}} | {{活用方法}} |
      {{/each}}
      - **参照**: `.claude/skills/skill_list.md`

      #### 成果物
      | 成果物 | パス | 内容 |
      |--------|------|------|
      {{#each 成果物}}
      | {{名称}} | {{パス}} | {{内容}} |
      {{/each}}

      #### TDD検証: Green状態確認
      ```bash
      {{テスト実行コマンド}}
      ```
      - [ ] テストが成功することを確認（Green状態）

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## Phase 5: リファクタリング (TDD: Refactor)

      {{#each Phase5サブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### 責務（単一責務）
      {{このサブタスクが担う唯一の責務}}

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: {{エージェント名}}
      - **選定理由**: {{選定理由}}
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      {{#each スキル}}
      | {{スキル名}} | {{活用方法}} |
      {{/each}}
      - **参照**: `.claude/skills/skill_list.md`

      #### 成果物
      | 成果物 | パス | 内容 |
      |--------|------|------|
      {{#each 成果物}}
      | {{名称}} | {{パス}} | {{内容}} |
      {{/each}}

      #### TDD検証: 継続Green確認
      ```bash
      {{テスト実行コマンド}}
      ```
      - [ ] リファクタリング後もテストが成功することを確認

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## Phase 6: 品質保証

      {{#each Phase6サブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### 責務（単一責務）
      {{このサブタスクが担う唯一の責務}}

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: {{エージェント名}}
      - **選定理由**: {{選定理由}}
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      {{#each スキル}}
      | {{スキル名}} | {{活用方法}} |
      {{/each}}
      - **参照**: `.claude/skills/skill_list.md`

      #### 成果物
      | 成果物 | パス | 内容 |
      |--------|------|------|
      {{#each 成果物}}
      | {{名称}} | {{パス}} | {{内容}} |
      {{/each}}

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## 品質ゲートチェックリスト

      ### 機能検証
      - [ ] 全ユニットテスト成功
      - [ ] 全統合テスト成功
      - [ ] 全E2Eテスト成功

      ### コード品質
      - [ ] Lintエラーなし
      - [ ] 型エラーなし
      - [ ] コードフォーマット適用済み

      ### テスト網羅性
      - [ ] カバレッジ基準達成

      ### セキュリティ
      - [ ] 脆弱性スキャン完了
      - [ ] 重大な脆弱性なし

      ---

      ## Phase 7: 最終レビューゲート

      {{#each 最終レビューサブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### レビュー参加エージェント
      | エージェント | レビュー観点 | 選定理由 |
      |-------------|-------------|----------|
      {{#each 参加エージェント}}
      | {{エージェント名}} | {{レビュー観点}} | {{選定理由}} |
      {{/each}}
      - **参照**: `.claude/agents/agent_list.md`

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 対象領域別追加レビュー（該当する場合のみ）
      {{#if 追加レビュー}}
      | 対象領域 | エージェント | レビュー観点 |
      |---------|-------------|-------------|
      {{#each 追加レビュー}}
      | {{対象領域}} | {{エージェント名}} | {{レビュー観点}} |
      {{/each}}
      {{/if}}

      #### レビューチェックリスト
      {{#each レビュー観点}}
      **{{観点名}}** ({{担当エージェント}})
      {{#each チェック項目}}
      - [ ] {{項目}}
      {{/each}}
      {{/each}}

      #### 未完了タスク指示書作成（該当する場合）

      {{#if 未完了タスク}}
      ##### 発見された課題と担当エージェント
      | 課題ID | 課題名 | 分類 | 担当エージェント | 選定理由 |
      |--------|--------|------|------------------|----------|
      {{#each 未完了タスク}}
      | {{課題ID}} | {{課題名}} | {{分類}} | {{担当エージェント}} | {{選定理由}} |
      {{/each}}

      ##### 指示書作成フロー
      1. 各担当エージェントが課題に対する指示書を作成
      2. .claude/agents/spec-writer.mdが指示書の品質を検証
      3. 品質基準を満たさない場合は担当エージェントが修正

      ##### 指示書出力先
      `docs/30-workflows/unassigned-task/`

      ##### 各課題の指示書概要
      {{#each 未完了タスク指示書}}
      ###### {{課題ID}}: {{課題名}}
      - **担当エージェント**: {{担当エージェント}}
      - **出力ファイル**: {{出力ファイルパス}}
      - **Why（なぜ必要か）**: {{背景概要}}
      - **What（何を達成するか）**: {{目的概要}}
      - **How（どのように実行するか）**: {{実行方針概要}}
      {{/each}}

      ##### 指示書品質検証結果
      | 課題ID | Why | What | How | スラッシュコマンド | 完了条件 | 検証方法 | 判定 |
      |--------|-----|------|-----|-------------------|----------|----------|------|
      {{#each 指示書品質検証}}
      | {{課題ID}} | {{Why}} | {{What}} | {{How}} | {{スラッシュコマンド}} | {{完了条件}} | {{検証方法}} | {{判定}} |
      {{/each}}
      {{/if}}

      #### レビュー結果
      - **判定**: {{判定結果}}
      - **指摘事項**: {{指摘内容}}
      - **対応方針**: {{対応内容}}
      - **未完了タスク数**: {{未完了タスク数}}件

      #### 戻り先決定（MAJOR/CRITICALの場合）
      | 問題の種類 | 戻り先 |
      |-----------|--------|
      {{#each 戻り先基準}}
      | {{問題種類}} | {{戻り先フェーズ}} |
      {{/each}}

      #### エスカレーション条件
      {{#each エスカレーション条件}}
      - {{条件}}
      {{/each}}

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## Phase 8: 手動テスト検証

      {{#each 手動テストサブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的の詳細説明}}

      #### 背景
      {{このサブタスクが必要な背景}}

      #### テスト分類
      {{テスト分類: 機能テスト/UI・UXテスト/統合テスト/リグレッションテスト}}

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: {{エージェント名}}
      - **選定理由**: {{選定理由}}
      - **参照**: `.claude/agents/agent_list.md`

      #### 手動テストケース

      | No | カテゴリ | テスト項目 | 前提条件 | 操作手順 | 期待結果 | 実行結果 | 備考 |
      |----|----------|-----------|----------|----------|----------|----------|------|
      {{#each テストケース}}
      | {{No}} | {{カテゴリ}} | {{テスト項目}} | {{前提条件}} | {{操作手順}} | {{期待結果}} | {{実行結果}} | {{備考}} |
      {{/each}}

      #### テスト実行手順
      {{#each テスト実行手順}}
      {{番号}}. {{手順}}
      {{/each}}

      #### 成果物
      | 成果物 | パス | 内容 |
      |--------|------|------|
      {{#each 成果物}}
      | {{名称}} | {{パス}} | {{内容}} |
      {{/each}}

      #### 完了条件
      {{#each 完了条件}}
      - [ ] {{条件}}
      {{/each}}

      #### 依存関係
      - **前提**: {{前提サブタスク}}
      - **後続**: {{後続サブタスク}}

      ---
      {{/each}}

      ## Phase 9: ドキュメント更新・未完了タスク記録

      {{#each Phase9サブタスク}}
      ### {{ID}}: {{名称}}

      #### 目的
      {{目的}}

      #### 前提条件
      - [ ] Phase 6の品質ゲートをすべて通過
      - [ ] Phase 7の最終レビューゲートを通過
      - [ ] Phase 8の手動テストが完了
      - [ ] すべてのテストが成功

      ---

      #### サブタスク 9.1: システムドキュメント更新

      ##### 更新対象ドキュメント
      {{更新対象ドキュメント}}

      ##### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      /ai:update-all-docs
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      ##### 使用エージェント
      {{エージェント情報}}

      ##### 更新原則
      - 概要のみ記載（詳細な実装説明は不要）
      - システム構築に必要十分な情報のみ追記
      - 既存ドキュメントの構造・フォーマットを維持
      - Single Source of Truth原則を遵守

      ##### スキル同期（必要時）
      docs/00-requirements を更新した場合はスキル索引を同期する。
      SKILL.md は requirements-index の参照が不足している場合のみ更新する。

      **ターミナル実行コマンド**
      ```bash
      python3 scripts/sync_requirements_to_skills.py
      python3 scripts/update_skill_levels.py
      ```

      ---

      #### サブタスク 9.2: 未完了タスク・追加タスク記録

      ##### 出力先
      `docs/30-workflows/unassigned-task/`

      ##### 記録対象タスク一覧
      {{記録対象タスク一覧}}

      ##### ファイル命名規則
      - 要件系: `requirements-{{機能領域}}.md`
      - 改善系: `task-{{改善領域}}-improvements.md`

      ##### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
      > ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

      ```
      {{スラッシュコマンド}}
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      ##### 使用エージェント
      {{エージェント情報}}

      ##### 活用スキル
      {{スキル情報}}

      ##### 指示書としての品質基準
      生成されるタスク指示書は以下を満たすこと：

      **Why（なぜ必要か）**
      - [ ] 背景が明確に記述されている
      - [ ] 問題点・課題が具体的に説明されている
      - [ ] 放置した場合の影響が記載されている

      **What（何を達成するか）**
      - [ ] 目的が明確に定義されている
      - [ ] 最終ゴールが具体的に記述されている
      - [ ] スコープ（含む/含まない）が明記されている
      - [ ] 成果物が一覧化されている

      **How（どのように実行するか）**
      - [ ] 前提条件が明記されている
      - [ ] 依存タスクが特定されている
      - [ ] 必要な知識・スキルが記載されている
      - [ ] 推奨アプローチが説明されている

      **実行手順**
      - [ ] フェーズ構成が明確である
      - [ ] 各フェーズにClaude Codeスラッシュコマンド（/ai:xxx形式）が記載されている
      - [ ] 使用エージェント・スキルが選定されている
      - [ ] 各フェーズの成果物・完了条件が定義されている

      **検証・完了**
      - [ ] 完了条件チェックリストがある
      - [ ] テストケース/検証方法が記載されている
      - [ ] リスクと対策が検討されている

      ##### 各タスクの詳細
      {{各タスク詳細}}

      ---

      #### 完了条件
      {{完了条件}}

      ---
      {{/each}}

      ---

      ## Phase 10: PR作成・CI確認・マージ準備

      ### T-10-1: 差分確認・コミット作成

      #### 目的
      Git Worktree内の変更をConventional Commits形式でコミットする。

      #### 背景
      実装完了後、変更内容を適切なコミットメッセージで記録する必要がある。

      #### 責務（単一責務）
      差分確認とコミット作成のみを担当する。

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

      ```
      /ai:commit-and-pr
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: .claude/agents/prompt-eng.md
      - **選定理由**: コミットメッセージの自動生成が得意
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      | .claude/skills/semantic-versioning/SKILL.md | Conventional Commits形式のコミットメッセージ生成 |
      | .claude/skills/git-hooks-concepts/SKILL.md | Pre-commit hooks理解とコミット前検証 |
      - **参照**: `.claude/skills/skill_list.md`

      #### 実行手順

      **1. Worktreeディレクトリ内で差分確認**
      ```bash
      # 現在のディレクトリ確認
      pwd  # .worktrees/task-XXX であることを確認

      # 変更ファイル確認
      git status

      # 詳細な差分確認
      git diff
      ```

      **2. 変更内容を分析し、適切なコミットメッセージを生成**

      Conventional Commitsタイプ:
      - `feat`: 新機能
      - `fix`: バグ修正
      - `refactor`: リファクタリング
      - `docs`: ドキュメント
      - `test`: テスト
      - `chore`: その他（依存関係更新等）
      - `ci`: CI/CD

      スコープ例: `features`, `shared`, `api`, `db`, `docs`, `infra`, `config`

      subject: 50文字以内、現在形・命令形

      **3. コミット前チェック（Pre-commit hookが自動実行）**
      ```bash
      # 手動で確認する場合
      pnpm typecheck  # 型チェック
      pnpm lint       # ESLint
      pnpm test       # テスト実行
      ```

      **4. コミット実行**
      ```bash
      git add .
      git commit -m "$(cat <<'EOF'
      <type>(<scope>): <subject>

      <body>

      🤖 Generated with [Claude Code](https://claude.com/claude-code)

      Co-Authored-By: Claude <noreply@anthropic.com>
      EOF
      )"
      ```

      コミットメッセージ例:
      ```
      feat(features): 会議文字起こしワークフローを追加

      - 音声文字起こしのためのWhisper API統合
      - タイムスタンプ付き議事録の生成機能
      - Discord通知のサポート

      Closes #42

      🤖 Generated with [Claude Code](https://claude.com/claude-code)

      Co-Authored-By: Claude <noreply@anthropic.com>
      ```

      #### 成果物
      | 成果物 | 内容 |
      |--------|------|
      | Gitコミット | Conventional Commits形式のコミット |

      #### 完了条件
      - [ ] git statusで変更内容を確認済み
      - [ ] Conventional Commits形式でコミット作成済み
      - [ ] Claude Code署名が含まれている

      #### 依存関係
      - **前提**: Phase 9（ドキュメント更新）
      - **後続**: T-10-2（PR作成）

      ---

      ### T-10-2: PR作成

      #### 目的
      実装完了した変更をGitHubにPull Requestとして作成し、レビュー可能な状態にする。

      #### 背景
      コミット後、変更を本体ブランチにマージするためにPRを作成する必要がある。

      #### 責務（単一責務）
      PRの作成のみを担当する。

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

      ```
      /ai:create-pr
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: .claude/agents/devops-eng.md
      - **選定理由**: GitHub操作・PR作成の専門家
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      | .claude/skills/semantic-versioning/SKILL.md | PRタイトル生成（Conventional Commits準拠） |
      | .claude/skills/markdown-advanced-syntax/SKILL.md | PR本文のマークダウンフォーマット |
      - **参照**: `.claude/skills/skill_list.md`

      #### 実行手順

      **1. ブランチプッシュ**
      ```bash
      git push -u origin <branch-name>
      ```

      **2. PR作成（テンプレート使用）**
      ```bash
      gh pr create --title "<type>(<scope>): <subject>" --body "$(cat <<'EOF'
      ## 概要

      <!-- この PR の目的と背景を記述 -->

      ## 変更内容

      <!-- 主な変更点をリストアップ -->
      -
      -
      -

      ## 変更タイプ

      <!-- 該当するものにチェック -->
      - [ ] 🐛 バグ修正 (bug fix)
      - [ ] ✨ 新機能 (new feature)
      - [ ] 🔨 リファクタリング (refactoring)
      - [ ] 📝 ドキュメント (documentation)
      - [ ] 🧪 テスト (test)
      - [ ] 🔧 設定変更 (configuration)
      - [ ] 🚀 CI/CD (continuous integration)

      ## テスト

      <!-- 実施したテストにチェック -->
      - [ ] ユニットテスト実行 (`pnpm test`)
      - [ ] 型チェック実行 (`pnpm typecheck`)
      - [ ] ESLint チェック実行 (`pnpm lint`)
      - [ ] ビルド確認 (`pnpm build`)
      - [ ] 手動テスト実施

      ## 関連 Issue

      <!-- 関連するIssue番号 -->
      Closes #

      ## 破壊的変更

      <!-- 破壊的変更がある場合は詳細を記述 -->
      - [ ] この PR には破壊的変更が含まれます

      ## チェックリスト

      - [ ] コードが既存のスタイルに従っている
      - [ ] 必要に応じてドキュメントを更新した
      - [ ] 新規・変更機能にテストを追加した
      - [ ] すべてのテストがローカルで成功する
      - [ ] Pre-commit hooks が成功する

      ---

      🤖 Generated with [Claude Code](https://claude.com/claude-code)
      EOF
      )" --base main
      ```

      #### 成果物
      | 成果物 | 内容 |
      |--------|------|
      | GitHub Pull Request | PRが作成され、レビュー可能な状態 |

      #### 完了条件
      - [ ] ブランチがリモートにプッシュされている
      - [ ] PRが正常に作成されている
      - [ ] PR本文が適切に記載されている
      - [ ] PR番号が取得できている

      #### 依存関係
      - **前提**: T-10-1（差分確認・コミット作成）
      - **後続**: T-10-3（PR補足コメント追加）

      ---

      ### T-10-3: PR補足コメント追加

      #### 目的
      PR作成後、実装の詳細やレビュー観点を補足コメントとして追加する。

      #### 背景
      PR本文だけでは伝えきれない技術的詳細や注意点を、追加コメントで補足する必要がある。

      #### 責務（単一責務）
      PR補足コメントの投稿のみを担当する。

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

      ```
      /ai:add-pr-comment
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: .claude/agents/prompt-eng.md
      - **選定理由**: 技術的な補足説明の生成が得意
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      | .claude/skills/markdown-advanced-syntax/SKILL.md | コメントのマークダウンフォーマット |
      | .claude/skills/api-documentation-best-practices/SKILL.md | 技術的詳細の構造化された説明 |
      - **参照**: `.claude/skills/skill_list.md`

      #### 実行手順

      **1. PR番号取得**
      ```bash
      PR_NUMBER=$(gh pr view --json number -q .number)
      ```

      **2. 補足コメント投稿**
      ```bash
      gh pr comment "${PR_NUMBER}" --body "$(cat <<'EOF'
      ## 📝 実装の詳細

      <!-- 変更の技術的詳細や設計判断の理由 -->

      ## ⚠️ レビュー時の注意点

      <!-- レビュアーが確認すべき重要なポイント -->

      ## 🔍 テスト方法

      <!-- 動作確認の手順や再現方法 -->

      ## 📚 参考資料

      <!-- 関連ドキュメントやIssue、外部リンク等 -->

      ---

      🤖 Generated with [Claude Code](https://claude.com/claude-code)
      EOF
      )"
      ```

      #### コメント生成ガイドライン
      - **実装の詳細**: アーキテクチャ変更、技術選定の理由、トレードオフ等
      - **注意点**: 破壊的変更、パフォーマンス影響、セキュリティ考慮事項等
      - **テスト方法**: 手動テストの手順、エッジケースの確認方法
      - **参考資料**: 関連Issue、設計ドキュメント、外部記事等

      #### 成果物
      | 成果物 | 内容 |
      |--------|------|
      | PR補足コメント | 技術的詳細・レビュー観点の追加情報 |

      #### 完了条件
      - [ ] PR番号が正常に取得できている
      - [ ] 補足コメントが投稿されている
      - [ ] コメント内容が適切である（実装詳細/注意点/テスト方法/参考資料）

      #### 依存関係
      - **前提**: T-10-2（PR作成）
      - **後続**: T-10-4（CI/CD完了確認）

      ---

      ### T-10-4: CI/CD完了確認

      #### 目的
      GitHub ActionsのCI/CDが全て完了し、全チェックがpassであることを確認する。

      #### 背景
      CI未完了またはfail状態でマージすると、品質問題が本体ブランチに混入する恐れがある。

      #### 責務（単一責務）
      CI/CDステータスの確認と完了待機のみを担当する。

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

      ```
      /ai:check-ci-status
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: .claude/agents/devops-eng.md
      - **選定理由**: CI/CD監視の専門家
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      | .claude/skills/github-actions-debugging/SKILL.md | CI/CD失敗時のデバッグ・原因特定 |
      | .claude/skills/metrics-tracking/SKILL.md | CI実行時間・ステータスの監視 |
      - **参照**: `.claude/skills/skill_list.md`

      #### 実行手順

      **1. CIステータス確認（待機ループ）**
      ```bash
      for i in {1..10}; do
        gh pr checks ${PR_NUMBER}
        if gh pr checks ${PR_NUMBER} 2>&1 | grep -qE "(pending|in_progress)"; then
          echo "CI実行中... 30秒後に再確認"
          sleep 30
        else
          echo "CI完了"
          break
        fi
      done
      ```

      **2. CI結果の最終確認**
      ```bash
      gh pr checks ${PR_NUMBER}
      ```

      **3. 全チェックがpassであることを確認**
      - Lint チェック: ✅ pass
      - Type チェック: ✅ pass
      - Test 実行: ✅ pass
      - Build チェック: ✅ pass
      - Security スキャン: ✅ pass

      #### CI失敗時の対応

      **問題: CIが失敗した場合**
      ```bash
      # ローカルで再現
      pnpm typecheck  # 型エラー
      pnpm lint       # Lint
      pnpm test       # テスト
      pnpm build      # ビルド

      # 修正後
      git add .
      git commit -m "fix: resolve CI errors"
      git push
      ```

      #### 成果物
      | 成果物 | 内容 |
      |--------|------|
      | CI/CD完了確認 | 全チェックpass確認済み |

      #### 完了条件
      - [ ] CI/CDが全て完了している（pending/in_progressなし）
      - [ ] 全チェックがpassである
      - [ ] fail状態のチェックがない

      #### 依存関係
      - **前提**: T-10-3（PR補足コメント追加）
      - **後続**: T-10-5（ユーザーへマージ可能通知）

      ---

      ### T-10-5: ユーザーへマージ可能通知

      #### 目的
      CI完了後、ユーザーにマージ準備が整ったことを通知する。

      #### 背景
      全てのCI/CDが完了し、品質が保証されたことを確認した上で、ユーザーに最終マージ実施を依頼する必要がある。

      #### 責務（単一責務）
      マージ準備完了の通知のみを担当する。

      #### Claude Code スラッシュコマンド
      > ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

      ```
      /ai:notify-merge-ready
      ```
      - **参照**: `.claude/commands/ai/command_list.md`

      #### 使用エージェント
      - **エージェント**: .claude/agents/devops-eng.md
      - **選定理由**: Git/GitHub操作・マージフローの専門家
      - **参照**: `.claude/agents/agent_list.md`

      #### 活用スキル
      | スキル名 | 活用方法 |
      |----------|----------|
      | .claude/skills/stakeholder-communication/SKILL.md | ユーザーへの明確な通知メッセージ生成 |
      | .claude/skills/markdown-advanced-syntax/SKILL.md | 通知内容のフォーマット |
      - **参照**: `.claude/skills/skill_list.md`

      #### 通知内容
      ```
      ✅ PR作成完了・CI確認完了

      📝 PR情報:
      - PR番号: #XXX
      - PR URL: https://github.com/.../pull/XXX

      ✅ CI/CD ステータス: 全てPASS

      🎯 次のステップ（ユーザー実施）:
      1. GitHub Web UIでPRを開く
      2. 変更内容を最終確認
      3. 「Squash and merge」をクリック
      4. 「Delete branch」にチェック

      📌 マージ後の同期（オプション）:
      ```bash
      cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
      git checkout main
      git pull origin main
      git worktree remove .worktrees/task-XXX
      git fetch --prune
      ```
      ```

      #### 成果物
      | 成果物 | 内容 |
      |--------|------|
      | マージ準備完了通知 | ユーザーへの通知完了 |

      #### 完了条件
      - [ ] ユーザーにマージ準備完了を通知済み
      - [ ] PRのURL・番号を提示済み
      - [ ] マージ手順を説明済み
      - [ ] マージ後の同期手順を提示済み

      #### 依存関係
      - **前提**: T-10-4（CI/CD完了確認）
      - **後続**: なし（最終サブタスク - ユーザーが手動マージ）

      ---

      ## 品質ゲートチェックリスト

      ### 機能検証
      - [ ] 全ユニットテスト成功
      - [ ] 全統合テスト成功
      - [ ] 全E2Eテスト成功

      ### コード品質
      - [ ] Lintエラーなし
      - [ ] 型エラーなし
      - [ ] コードフォーマット適用済み

      ### テスト網羅性
      - [ ] カバレッジ基準達成

      ### セキュリティ
      - [ ] 脆弱性スキャン完了
      - [ ] 重大な脆弱性なし

      ### CI/CD
      - [ ] GitHub Actions 全てPASS
      - [ ] Pre-commit hooks 成功

      ---

      ## リスクと対策

      | リスク | 影響度 | 発生確率 | 対策 | 対応サブタスク |
      |--------|--------|----------|------|----------------|
      {{#each リスク}}
      | {{リスク内容}} | {{影響度}} | {{確率}} | {{対策}} | {{対応ID}} |
      {{/each}}

      ---

      ## 前提条件

      {{#each 前提条件}}
      - {{条件}}
      {{/each}}

      ---

      ## 備考

      ### 技術的制約
      {{#each 技術的制約}}
      - {{制約}}
      {{/each}}

      ### 参考資料
      {{#each 参考資料}}
      - {{資料}}
      {{/each}}

# =============================================================================

# Layer 7: 実行ルール

# =============================================================================

実行ルール:

必須事項:

- "タスク開始時に必ずGit Worktreeを作成する（Phase -1）"
- "Git Worktree名は`.worktrees/task-{timestamp}-{hash}`形式とする"
- "Git Worktree作成後、そのディレクトリに移動して作業する"
- "全ての実装作業をWorktreeディレクトリ内で実施する"
- "ユーザーからの元の指示文を必ず冒頭に記載する"
- "各サブタスクの目的・背景を詳細に記述する"
- "Phase -1（環境準備）は必ず含める"
- "Phase 0（要件定義）は必ず含める"
- "Phase 1（設計）は必ず含める"
- "Phase 2（設計レビューゲート）は必ず含める"
- "TDDサイクル（Phase 3→4→5）は必ず含める"
- "品質ゲート（Phase 6）は必ず含める"
- "Phase 7（最終レビューゲート）は必ず含める"
- "Phase 8（手動テスト検証）は必ず含める"
- "ドキュメント更新・未完了タスク記録（Phase 9）は必ず含める"
- "Phase 10（PR作成・CI確認・マージ準備）は必ず含める"
- "各フェーズ内でも単一責務で複数サブタスクに分割する"
- "各サブタスクにスラッシュコマンド候補を記載する"
- "スラッシュコマンド・エージェント・スキルは参照ファイルから選定する"
- "各スラッシュコマンドは/ai:プレフィックス付きのClaude Code形式で記述する（ターミナルコマンドではない）"
- "docs/00-requirements/master_system_design.md の「ディレクトリ構造」を遵守する"
- "レビューで問題発見時は影響範囲に応じた適切なフェーズへ戻る"
- "未完了タスクはdocs/30-workflows/unassigned-task/に記録する"
- "未完了タスクは100人中100人が実行可能な粒度で記述する"
- "PRマージはユーザーがGitHub UIで手動実行する"
- "CI未完了またはfail状態ではマージ通知を行わない"

禁止事項:

- "Git Worktree作成（Phase -1）をスキップする"
- "本体ブランチで直接開発する"
- "Worktree外で実装作業を行う"
- "具体的なソースコードの作成（仕様書では記述しない）"
- "Phase 0をスキップする"
- "Phase 1をスキップする"
- "レビューゲート（Phase 2, 7）をスキップする"
- "手動テスト（Phase 8）をスキップする"
- "Phase 10（PR作成）をスキップする"
- "テストより先に実装する"
- "品質ゲート未通過でPhase 9に進む"
- "レビューゲート未通過で次フェーズに進む"
- "Phase 9をスキップする"
- "TDDサイクルを逆転させる"
- "複数の責務を1つのサブタスクに混在させる"
- "ドキュメントに詳細な実装説明を記載する（概要のみ）"
- "レビュー指摘を無視して進行する"
- "CI未完了でマージ通知を行う"
- "AIがPRをマージする"

AIへの委任事項: - "具体的な技術選択"

- "実装の詳細設計"
- "テストケースの具体的な記述"
- "コード品質メトリクスの具体的な目標値"
- "タスク内容に基づく最適なエージェント・スキルの選定"
- "複合領域タスクでのエージェント組み合わせの判断"
- "レビュー観点の取捨選択（タスクに関連する観点のみ選択）"
- "Git Worktree識別子の生成（タイムスタンプ + ランダムハッシュ）"
- "コミットメッセージの生成"
- "PR本文・コメントの生成"

エージェント選定の原則: - "固定的な選定を避け、タスクの具体的な要件に基づいて動的に判断"

- "選定理由を必ず明記（なぜそのエージェントが最適かを説明）"
- "agent_list.md に記載の全エージェントが選定対象"
- "記載例にないエージェントの組み合わせも積極的に検討"
- "複合領域の場合は主担当と補助エージェントを組み合わせる"

# =============================================================================

# 開始トリガー

# =============================================================================

開始トリガー: |
ユーザーが具体的なタスク内容を提供した時点で、以下のフローで仕様書を生成する：

-1. Git Worktree環境準備（Phase -1）【最優先】- タスク識別子生成（`task-$(date +%s)-$(openssl rand -hex 4)`）- `.worktrees/task-{timestamp}-{hash}` 形式でWorktree作成 - 新規ブランチ作成（Worktreeと同名）- 作成したWorktreeディレクトリへ移動 - 環境初期化確認（依存関係インストール、ビルド確認）

0. ユーザーの元の指示を保存（最優先）

1. 参照ファイルを読み込み、利用可能なコマンド・エージェント・スキルを把握

2. タスクタイプを特定（新規機能/バグ修正/リファクタリング等）

3. 各フェーズ内で単一責務に基づいてサブタスクを分解

4. 各サブタスクに最適なコマンド・エージェント・スキルを選定

5. 各サブタスクの目的・背景を詳細に記述

6. 依存関係を整理

7. テンプレートに従って仕様書を作成（Phase -1からPhase 10まで全て含める）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
参照ファイル:

- docs/00-requirements/master_system_design.md
- .claude/commands/ai/command_list.md
- .claude/agents/agent_list.md
- .claude/skills/skill_list.md
- .kamui/prompt/merge-prompt.txt
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ユーザーからのタスクを待機中...
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
