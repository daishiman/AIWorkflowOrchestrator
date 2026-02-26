# Phase 1: 要件定義 — skill-creator メタスキル実装

## メタ情報

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| Phase    | 1                                                   |
| タスクID | TASK-9B                                             |
| 機能名   | task-9b-skill-creator                               |
| 作成日   | 2026-02-26                                          |
| 優先度   | Critical                                            |
| 規模     | xlarge                                              |
| 依存     | TASK-7D（ChatPanel統合）, TASK-8C（統合テスト完了） |
| ブロック | TASK-10A                                            |

## 目的

他のスキルを自動生成するメタスキル「skill-creator」の目的、スコープ、受け入れ基準を明文化する。12のコマンド機能（対話的スキル作成、外部API連携、既存スキル改善、タスク実行、即時使用、チェーン作成、フォーク、共有、スケジュール、デバッグ、ドキュメント生成、統計）の機能要件・非機能要件を抽出し、テスト可能な受け入れ基準を定義する。

## 実行タスク

- Task 0: 仕様抽出基盤の確定 — `aiworkflow-requirements` から必要仕様を漏れなく抽出する
- Task 1: 要件抽出 — 12の機能コマンドについて機能要件（FR）を抽出する
- Task 2: 非機能要件定義 — セキュリティ・型安全・テストカバレッジ・パフォーマンスの NFR を定義する
- Task 3: 受け入れ基準作成 — 各 FR/NFR に対してテスト可能な受け入れ基準（AC）を定義する
- Task 4: スコープ確認 — 実施対象と非対象を明文化する

---

### Task 0: 仕様抽出基盤の確定（aiworkflow-requirements）

#### 抽出フロー（Progressive Disclosure）

1. `indexes/resource-map.md` でタスク種別（新機能追加、API設計、セキュリティ実装、テスト実装）に対応する正本仕様を特定
2. `indexes/topic-map.md` で対象セクションを特定
3. `scripts/search-spec.js` でキーワード検索し、参照漏れを検出
4. Phase 1 参照資料テーブルへ反映し、以降Phaseの参照元を固定

#### 仕様抽出コマンド

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill-creator" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "api-ipc-agent" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-skill-ipc" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "interfaces-agent-sdk-skill" -C 2
```

#### 2軸抽出マトリクス（関心ごと × ライフサイクル）

| 関心ごと/ライフサイクル | 設計時（Phase 2-3）                                               | 実装時（Phase 4-8）                                    | 検証時（Phase 9-13）                            |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| アーキテクチャ          | architecture-overview.md, arch-electron-services.md               | architecture-implementation-patterns.md                | architecture-overview.md                        |
| API/IPC契約             | api-endpoints.md, api-ipc-agent.md, interfaces-agent-sdk-skill.md | api-ipc-agent.md, ipc-contract-checklist.md            | api-ipc-agent.md, ipc-contract-checklist.md     |
| セキュリティ            | security-principles.md, security-skill-ipc.md                     | security-skill-ipc.md, security-api-electron.md        | security-skill-ipc.md, security-electron-ipc.md |
| 品質/テスト             | quality-requirements.md                                           | testing-component-patterns.md, quality-requirements.md | quality-requirements.md                         |
| Claude Codeスキル仕様   | claude-code-skills-structure.md, claude-code-skills-process.md    | claude-code-skills-structure.md                        | claude-code-skills-overview.md                  |

### Task 1: 要件抽出 — 機能要件（FR）

#### FR-1: 対話的スキル作成（`/skill-creator chat`）

| 項目           | 内容                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| コマンド       | `/skill-creator` または `/skill-creator chat`                                  |
| 概要           | 会話形式でユーザーのニーズをヒアリングし、段階的にスキルを設計・生成           |
| ヒアリング項目 | スキル目的、外部連携要否、入出力形式、セキュリティ要件、エラーハンドリング方針 |
| 入力           | ユーザーとの対話メッセージ                                                     |
| 出力           | スキルディレクトリ一式（SKILL.md, agents/, references/）                       |
| 委譲先         | SkillCreatorService.createSkill() → HearingFacilitator                         |

#### FR-2: 外部API連携スキル生成（`/skill-creator api`）

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| コマンド     | `/skill-creator api "<スキル名>"`                                     |
| 概要         | REST API / Webhook 連携スキルを生成                                   |
| 対応パターン | REST API (GET/POST/PUT/DELETE), Webhook送受信, OAuth認証, APIキー認証 |
| 入力         | スキル名、API仕様（URL、認証方式、リクエスト/レスポンス形式）         |
| 出力         | スキル本体 + APIクライアントスクリプト + 認証情報管理設定             |
| 委譲先       | SkillCreatorService.createApiSkill() → ApiIntegrator                  |

#### FR-3: 既存スキル改善（`/skill-creator improve`）

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| コマンド | `/skill-creator improve "<スキル名>" [--auto]`                                 |
| 概要     | 既存スキルの問題点を分析し、改善提案を生成、--auto で自動修正実行              |
| 改善対象 | プロンプト最適化、エラーハンドリング強化、パフォーマンス改善、ドキュメント充実 |
| 入力     | スキル名、autoフラグ                                                           |
| 出力     | 改善提案リスト（autoの場合は修正済みファイル群）                               |
| 委譲先   | SkillCreatorService.improveSkill()                                             |

#### FR-4: タスク実行（`/skill-creator execute`）

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| コマンド   | `/skill-creator execute <タスクディレクトリパス> [--parallel] [--dry-run]`                                |
| 概要       | タスク仕様書をスキャンし、依存関係グラフに基づいてタスクを自動実行                                        |
| 実行フロー | 仕様書スキャン → 依存グラフ構築 → 循環依存チェック → トポロジカルソート → 並列/直列実行 → 検証 → リトライ |
| 入力       | タスクディレクトリパス、並列実行フラグ、ドライランフラグ                                                  |
| 出力       | 実行レポート（成功/失敗タスク、所要時間、エラー詳細）                                                     |
| 委譲先     | SkillCreatorService.executeTasks() → TaskGenerator                                                        |

#### FR-5: 即時使用（`/skill-creator use`）

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| コマンド | `/skill-creator use "<スキル名>"`                                |
| 概要     | 作成したスキルを現在のセッションにホットリロードで登録           |
| フロー   | スキルインポート → セッション登録 → テスト実行（任意）→ 使用可能 |
| 入力     | スキル名                                                         |
| 出力     | インポート結果（成功/失敗、テスト結果）                          |
| 委譲先   | SkillCreatorService.useSkill() → SkillService.importSkills()     |

#### FR-6: スキルチェーン作成（`/skill-creator chain`）

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| コマンド | `/skill-creator chain "<チェーン説明>"`                                |
| 概要     | 複数スキルをパイプラインとして連携、出力を次の入力に渡す               |
| 設定項目 | チェーン目的、使用スキル順序、入出力マッピング、エラーハンドリング方式 |
| 入力     | チェーン説明（自然言語）                                               |
| 出力     | チェーン定義ファイル + 入出力マッピング設定                            |
| 委譲先   | SkillCreatorService.createChain()                                      |

#### FR-7: スキルフォーク（`/skill-creator fork`）

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| コマンド   | `/skill-creator fork "<元スキル名>" --name "<新スキル名>"`                                                       |
| 概要       | 既存スキルをベースに新しいスキルを作成                                                                           |
| オプション | --copy-agents (default: true), --copy-references (default: true), --copy-scripts (default: true), --modify-tools |
| 入力       | 元スキル名、新スキル名、コピーオプション                                                                         |
| 出力       | フォーク元の構造を引き継いだ新スキル + フォーク履歴メタデータ                                                    |
| 委譲先     | SkillCreatorService.forkSkill()                                                                                  |

#### FR-8: スキル共有（`/skill-creator share`）

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| コマンド   | `/skill-creator share export "<スキル名>" --to <gist\|github>` / `/skill-creator share import --from <gist\|github\|url\|local> "<ソース>"` |
| 概要       | GitHub Gist / GitHub リポジトリでスキルをエクスポート/インポート                                                                            |
| 対応ソース | GitHub リポジトリ、GitHub Gist、URL（SKILL.md直接指定）、ローカルディレクトリ                                                               |
| 入力       | スキル名またはインポート元                                                                                                                  |
| 出力       | エクスポートURL または インポート済みスキル                                                                                                 |
| 委譲先     | SkillCreatorService.shareSkill()                                                                                                            |

#### FR-9: スケジュール設定（`/skill-creator schedule`）

| 項目               | 内容                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| コマンド           | `/skill-creator schedule "<スキル名>" --cron\|--interval\|--once\|--event <値>`                             |
| 概要               | スキルの定期実行スケジュールを設定                                                                          |
| スケジュールタイプ | --cron (Cron形式), --interval (例: 1h, 30m), --once (ISO日時), --event (app_start, file_change, git_commit) |
| 入力               | スキル名、スケジュール設定                                                                                  |
| 出力               | スケジュール登録結果                                                                                        |
| 委譲先             | SkillCreatorService.scheduleSkill()                                                                         |

#### FR-10: デバッグ実行（`/skill-creator debug`）

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| コマンド         | `/skill-creator debug "<スキル名>" [--breakpoint <ツール名>] [--condition <式>]` |
| 概要             | スキルをデバッグモードで実行し、ステップバイステップで追跡                       |
| ブレークポイント | --breakpoint (特定ツール呼び出し時に停止), --condition (条件式がtrueの時に停止)  |
| 入力             | スキル名、ブレークポイント設定                                                   |
| 出力             | デバッグ実行結果（各ステップの入出力、変数状態）                                 |
| 委譲先           | SkillCreatorService.debugSkill()                                                 |

#### FR-11: ドキュメント生成（`/skill-creator docs`）

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| コマンド   | `/skill-creator docs "<スキル名>" [--format <markdown\|html\|pdf>] [--sections <セクション一覧>]` |
| 概要       | スキルのドキュメントを自動生成                                                                    |
| セクション | overview, usage, api, examples, troubleshooting                                                   |
| 入力       | スキル名、出力形式、セクション指定                                                                |
| 出力       | 生成されたドキュメントファイル                                                                    |
| 委譲先     | SkillCreatorService.generateDocs()                                                                |

#### FR-12: 使用統計（`/skill-creator stats`）

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| コマンド | `/skill-creator stats ["<スキル名>"] [--all] [--period <期間>]`                             |
| 概要     | スキルの使用状況と分析を表示                                                                |
| 表示項目 | 実行回数（成功/失敗）、平均実行時間、頻出ツール、時間帯別使用分布、エラー傾向、使用トレンド |
| 入力     | スキル名（任意）、全スキルフラグ、集計期間                                                  |
| 出力     | 統計レポート（テーブル形式 + トレンドグラフ）                                               |
| 委譲先   | SkillCreatorService.getStats()                                                              |

---

### Task 2: 非機能要件（NFR）

#### NFR-1: セキュリティ

| ID      | 要件                                                                                         | 根拠                    |
| ------- | -------------------------------------------------------------------------------------------- | ----------------------- |
| NFR-1-1 | 全IPCハンドラーで `validateIpcSender()` による送信元ウィンドウ検証を実施する                 | 04-electron-security.md |
| NFR-1-2 | 全文字列引数に P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用する | P42                     |
| NFR-1-3 | ファイルパス引数にパストラバーサル防止検証を実施する                                         | security-skill-ipc.md   |
| NFR-1-4 | エラーはサニタイズしてから Renderer に返す（内部パス・スタックトレース非公開）               | 04-electron-security.md |
| NFR-1-5 | チャンネル名は `IPC_CHANNELS` 定数から参照し、ハードコード文字列を使用しない                 | P27                     |
| NFR-1-6 | 認証情報（APIキー、OAuthトークン）を平文保存しない                                           | 04-electron-security.md |
| NFR-1-7 | 外部API呼び出しスキル生成時、認証情報はMain Process内に留め、Rendererに公開しない            | P44/P45 対策            |

#### NFR-2: 型安全性

| ID      | 要件                                                                        |
| ------- | --------------------------------------------------------------------------- |
| NFR-2-1 | `strict: true` で厳密な型チェックを適用する                                 |
| NFR-2-2 | `any` 型を使用しない                                                        |
| NFR-2-3 | IPC引数名は実際に渡される値のセマンティクスと一致させる（P45対策）          |
| NFR-2-4 | 型定義は `packages/shared` と `preload/types.ts` の2箇所同時更新（P32対策） |

#### NFR-3: テストカバレッジ

| ID      | 要件                                     |
| ------- | ---------------------------------------- |
| NFR-3-1 | Line Coverage: 80% 以上                  |
| NFR-3-2 | Branch Coverage: 60% 以上                |
| NFR-3-3 | Function Coverage: 80% 以上              |
| NFR-3-4 | 各 FR に対応するユニットテストが存在する |

#### NFR-4: パフォーマンス

| ID      | 要件                                                                       |
| ------- | -------------------------------------------------------------------------- |
| NFR-4-1 | 単一スキル生成処理が60秒以内に完了する                                     |
| NFR-4-2 | ファイル I/O は `async/await` で非同期処理し Main スレッドをブロックしない |
| NFR-4-3 | タスク実行でのトポロジカルソートが O(V+E) で完了する                       |

#### NFR-5: ハンドラー管理

| ID      | 要件                                                                        |
| ------- | --------------------------------------------------------------------------- |
| NFR-5-1 | `registerSkillCreatorHandlers()` 関数でハンドラーを一括登録する             |
| NFR-5-2 | `unregisterSkillCreatorHandlers()` 関数でハンドラーを一括解除する（P5対策） |
| NFR-5-3 | 二重登録防止の仕組みを設ける                                                |

---

### Task 3: 受け入れ基準（AC）

| ID    | 受け入れ基準                                                                    | 対応要件  | テスト方法         |
| ----- | ------------------------------------------------------------------------------- | --------- | ------------------ |
| AC-01 | `/skill-creator chat` で対話的ヒアリング後にスキルディレクトリが生成される      | FR-1      | 統合テスト         |
| AC-02 | `/skill-creator api` で REST API 連携スキルが生成され、認証情報管理が含まれる   | FR-2      | 統合テスト         |
| AC-03 | `/skill-creator improve` で既存スキルの改善提案が生成される                     | FR-3      | ユニットテスト     |
| AC-04 | `/skill-creator improve --auto` で改善が自動適用される                          | FR-3      | ユニットテスト     |
| AC-05 | `/skill-creator execute` でタスク仕様書が依存順序どおりに実行される             | FR-4      | 統合テスト         |
| AC-06 | `/skill-creator execute --dry-run` で実行計画のみ表示される                     | FR-4      | ユニットテスト     |
| AC-07 | `/skill-creator execute` で循環依存がある場合にエラーメッセージが表示される     | FR-4      | ユニットテスト     |
| AC-08 | `/skill-creator use` で作成済みスキルがセッションにインポートされる             | FR-5      | 統合テスト         |
| AC-09 | `/skill-creator chain` で複数スキルのパイプラインが定義ファイルとして生成される | FR-6      | ユニットテスト     |
| AC-10 | `/skill-creator fork` で元スキルの構造を引き継いだ新スキルが作成される          | FR-7      | ユニットテスト     |
| AC-11 | `/skill-creator share export` で GitHub Gist にスキルがエクスポートされる       | FR-8      | 統合テスト         |
| AC-12 | `/skill-creator share import` で外部ソースからスキルがインポートされる          | FR-8      | 統合テスト         |
| AC-13 | `/skill-creator schedule` でスケジュール設定が永続化される                      | FR-9      | ユニットテスト     |
| AC-14 | `/skill-creator debug` でブレークポイントが機能し、ステップ実行ができる         | FR-10     | 統合テスト         |
| AC-15 | `/skill-creator docs` でMarkdown形式のドキュメントが生成される                  | FR-11     | ユニットテスト     |
| AC-16 | `/skill-creator stats` で実行回数・平均実行時間が表示される                     | FR-12     | ユニットテスト     |
| AC-17 | 全IPCハンドラーで `validateIpcSender()` が呼ばれ、不正送信元が拒否される        | NFR-1-1   | セキュリティテスト |
| AC-18 | スペースのみの文字列引数（`"   "`）がバリデーションで拒否される                 | NFR-1-2   | セキュリティテスト |
| AC-19 | `../` を含むパス引数がIPCレベルで拒否される                                     | NFR-1-3   | セキュリティテスト |
| AC-20 | エラーレスポンスに内部ファイルパス・スタックトレースが含まれない                | NFR-1-4   | セキュリティテスト |
| AC-21 | `pnpm typecheck` が全パッケージで通過する                                       | NFR-2-1/2 | 型チェック         |
| AC-22 | 既存スキル関連IPCハンドラー（list, import, remove）が引き続き正常動作する       | -         | 回帰テスト         |

---

### Task 4: スコープ確認

#### 含むもの

**スキル定義ファイル（`~/.aiworkflow/skills/skill-creator/` 配下）:**

| ファイル                        | 内容                          |
| ------------------------------- | ----------------------------- |
| `SKILL.md`                      | スキル基本定義                |
| `agents/hearing-facilitator.md` | 対話的ヒアリングエージェント  |
| `agents/task-generator.md`      | タスク仕様書生成エージェント  |
| `agents/code-generator.md`      | コード生成エージェント        |
| `agents/api-integrator.md`      | API連携コード生成エージェント |
| `agents/validator.md`           | 検証エージェント              |
| `references/task-template.md`   | タスク仕様書テンプレート      |
| `references/skill-structure.md` | スキル構造ガイド              |
| `references/api-patterns.md`    | API連携パターン集             |
| `references/security-guide.md`  | 認証・機密情報管理ガイド      |

**バックエンドサービス:**

| ファイル                                                      | 内容                         |
| ------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | Facadeサービス（メイン実装） |

**IPC / Preload 修正:**

| ファイル                                            | 変更内容                       |
| --------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | skill-creator用ハンドラー追加  |
| `apps/desktop/src/preload/skill-creator-api.ts`     | skill-creator用APIメソッド追加 |
| `apps/desktop/src/preload/channels.ts`              | 新規チャンネル定数追加         |
| `packages/shared/src/types/skillCreator.ts`         | skill-creator関連型定義追加    |

#### 含まないもの

- Renderer コンポーネント（React UI）の新規画面作成（ChatPanelの既存UIを使用）
- 外部SaaS連携の実装（GitHub Gist APIのモック実装は含む、実API呼び出しは別タスク）
- スケジュール実行のデーモン/バックグラウンドプロセス実装（設定保存のみ）
- 統計データのSQLiteスキーマ作成（インメモリ/JSON形式で初期実装）
- 既存SkillService / SkillExecutor の内部ロジック変更

---

## 参照資料

| 資料名                    | パス                                                                                                  | 説明                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| 元タスク仕様書            | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-020a-task-9b-skill-creator.md` | 分割前の元仕様                 |
| Skillインターフェース     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                     | Skill型定義・IPC契約           |
| Claude Codeスキル構造     | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md`                   | SKILL.md構造・ディレクトリ構成 |
| Claude Codeスキルプロセス | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`                     | スキル作成・更新プロセス       |
| IPC セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                             | 3段バリデーション・sender検証  |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                         | P23/P32/P42/P44統合チェック    |
| Electronサービス設計      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                         | Facadeパターン・DI             |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | IPC/DI/テストパターン          |
| 教訓集                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | 過去の苦戦箇所と解決策         |
| 仕様抽出ガイド            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                      | タスク種別ごとの正本特定       |
| 仕様トピック索引          | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                         | セクション粒度の参照           |
| クイック参照              | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                   | IPC/型/パターン早見表          |
| 全体概要                  | `.claude/skills/aiworkflow-requirements/references/overview.md`                                       | プロジェクト全体原則           |
| アーキテクチャ原則        | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`                          | 機能追加パターン               |
| API一覧                   | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                                  | IPC/RESTの正本一覧             |
| Agent IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                  | skill関連IPC契約               |
| 品質基準                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                           | カバレッジ・品質基準           |
| セキュリティ原則          | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                            | セキュリティ設計原則           |

### 既知の落とし穴

| Pitfall ID | 内容                                           | 対策                                 |
| ---------- | ---------------------------------------------- | ------------------------------------ |
| P42        | 文字列引数の `.trim()` バリデーション漏れ      | 3段バリデーション標準化              |
| P44        | IPC ハンドラ引数形式とPreload側の不整合        | ハンドラを `string` 型に統一         |
| P45        | 引数命名の契約ドリフト（skillId vs skillName） | セマンティクスに一致する命名         |
| P34        | 遅延初期化が必要な依存オブジェクトのDI         | Setter Injection パターン使用        |
| P35        | DI追加時のテストモック大規模修正               | 影響範囲事前調査                     |
| P5         | リスナー二重登録                               | unregisterAllIpcHandlers()で一括解除 |

---

## アーキテクチャ層別要件

| 層                         | 確認観点                                                                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | `/skill-creator` コマンドのUI表示（ChatPanel統合）、対話的ヒアリングUI                                                                                                                  |
| バックエンド（Main）       | SkillCreatorService（Facadeパターン）、スキル生成ロジック、ファイルシステム操作                                                                                                         |
| IPC通信                    | skill:create:chat, skill:create:api, skill:improve, skill:execute, skill:use, skill:chain, skill:fork, skill:share, skill:schedule, skill:debug, skill:docs, skill:stats の12チャンネル |
| Preload                    | contextBridge経由のAPI公開、safeInvoke/safeOnパターン準拠                                                                                                                               |
| セキュリティ               | P42準拠3段バリデーション、認証情報管理、パストラバーサル防止                                                                                                                            |
| データ                     | スキルファイルシステム構造（`~/.aiworkflow/skills/`）、使用統計データ                                                                                                                   |

---

## 統合テスト連携【必須】

| 接続要件カテゴリ | 記載内容                                                       |
| ---------------- | -------------------------------------------------------------- |
| API接続          | Claude Agent SDK query() API経由でスキル生成・タスク実行を委譲 |
| 認証フロー       | 外部API連携スキル生成時の認証情報管理（Main Process内で完結）  |
| データフロー     | Renderer → IPC → Main → SkillCreatorService → FileSystem       |
| 既存サービス連携 | SkillService.importSkills() / SkillExecutor との責務境界       |
| スキルスキャン   | 生成後、SkillScannerで検出・パース可能であること               |
| フィクスチャ検証 | skill-fixture-runnerで生成スキルが検証可能であること           |

---

## 多角的チェック観点（AIが判断）

| 観点             | 確認内容                                                   |
| ---------------- | ---------------------------------------------------------- |
| 要件網羅性       | 12の全コマンドに対してFR/AC が定義されているか             |
| セキュリティ     | P42/P44/P45 対策が全IPCチャンネルに適用されているか        |
| 既存整合性       | SkillService / SkillExecutor との責務が重複していないか    |
| テスタビリティ   | 各要件に対して自動テスト可能な受け入れ基準が存在するか     |
| パフォーマンス   | スキル生成60秒以内の制約が現実的か                         |
| スケーラビリティ | 12コマンドの同時実装が段階的に実現可能な設計になっているか |

---

## 成果物

| 成果物       | パス                                         | 説明                      |
| ------------ | -------------------------------------------- | ------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR一覧                |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義                    |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲（含む/含まない） |

---

## 完了条件

- [ ] 12の機能コマンド全てに機能要件（FR）が定義されている
- [ ] セキュリティ・型安全・テスト・パフォーマンス・ハンドラー管理の NFR が定義されている
- [ ] 各FR/NFRに対するテスト可能な受け入れ基準（AC）が定義されている
- [ ] スコープ（含むもの/含まないもの）が明文化されている
- [ ] 参照資料テーブルが完備されている
- [ ] `resource-map.md` → `topic-map.md` → `search-spec.js` の順で仕様抽出を実施している
- [ ] 抽出した必須仕様（architecture/api/security/testing/interfaces/claude-code）が全て参照資料に含まれている
- [ ] 統合テスト連携の接続要件が記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 0: 仕様抽出基盤の確定（resource-map/topic-map/search-spec）
2. 参照資料の確認（元タスク仕様書、スキル構造仕様、既存skill-creator）
3. 機能要件（FR-1〜FR-12）の抽出
4. 非機能要件（NFR-1〜NFR-5）の定義
5. 受け入れ基準（AC-01〜AC-22）の作成
6. スコープ確認（含むもの/含まないもの）
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜Task 4）を100%実行完了
- [ ] 各タスクの成果物が `outputs/phase-1/` に生成されている
- [ ] artifacts.json の phase-1 ステータスが更新されている

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 1
```

---

## 次のPhase

Phase 2: 設計（`phase-2-design.md`）
