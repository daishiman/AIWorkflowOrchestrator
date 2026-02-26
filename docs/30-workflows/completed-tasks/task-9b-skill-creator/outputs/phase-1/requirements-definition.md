# Phase 1 成果物: 要件定義書

## メタ情報

| 項目         | 内容                       |
| ------------ | -------------------------- |
| タスクID     | TASK-9B                    |
| Phase        | 1                          |
| 成果物       | 要件定義書                 |
| 作成日       | 2026-02-26                 |
| ステータス   | 完了                       |
| 仕様抽出方式 | Progressive Disclosure準拠 |

## 仕様抽出結果（Task 0）

### 抽出フロー実行結果

| ステップ | 実行内容                              | 結果                                |
| -------- | ------------------------------------- | ----------------------------------- |
| 1        | `resource-map.md` でタスク種別を特定  | 新機能追加 + API設計 + セキュリティ |
| 2        | `topic-map.md` で対象セクションを特定 | 計15セクション抽出                  |
| 3        | `search-spec.js "skill-creator"` 実行 | 98件 / 16ファイルで検出             |
| 4        | `search-spec.js "api-ipc-agent"` 実行 | 23件 / 8ファイルで検出              |
| 5        | 参照資料テーブルへ反映                | 全仕様が参照資料に含まれている      |

### 2軸抽出マトリクス確認

| 関心ごと / ライフサイクル | 設計時（Phase 2-3）                                               | 実装時（Phase 4-8）                                    | 検証時（Phase 9-13）                            |
| ------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| アーキテクチャ            | architecture-overview.md, arch-electron-services.md               | architecture-implementation-patterns.md                | architecture-overview.md                        |
| API/IPC契約               | api-endpoints.md, api-ipc-agent.md, interfaces-agent-sdk-skill.md | api-ipc-agent.md, ipc-contract-checklist.md            | api-ipc-agent.md, ipc-contract-checklist.md     |
| セキュリティ              | security-principles.md, security-skill-ipc.md                     | security-skill-ipc.md, security-api-electron.md        | security-skill-ipc.md, security-electron-ipc.md |
| 品質/テスト               | quality-requirements.md                                           | testing-component-patterns.md, quality-requirements.md | quality-requirements.md                         |
| Claude Codeスキル仕様     | claude-code-skills-structure.md, claude-code-skills-process.md    | claude-code-skills-structure.md                        | claude-code-skills-overview.md                  |

---

## 機能要件（FR）

### FR-1: 対話的スキル作成（`/skill-creator chat`）

| 項目           | 内容                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| コマンド       | `/skill-creator` または `/skill-creator chat`                                  |
| 概要           | 会話形式でユーザーのニーズをヒアリングし、段階的にスキルを設計・生成           |
| ヒアリング項目 | スキル目的、外部連携要否、入出力形式、セキュリティ要件、エラーハンドリング方針 |
| 入力           | ユーザーとの対話メッセージ                                                     |
| 出力           | スキルディレクトリ一式（SKILL.md, agents/, references/）                       |
| 委譲先         | SkillCreatorService.createSkill() → HearingFacilitator                         |

### FR-2: 外部API連携スキル生成（`/skill-creator api`）

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| コマンド     | `/skill-creator api "<スキル名>"`                                     |
| 概要         | REST API / Webhook 連携スキルを生成                                   |
| 対応パターン | REST API (GET/POST/PUT/DELETE), Webhook送受信, OAuth認証, APIキー認証 |
| 入力         | スキル名、API仕様（URL、認証方式、リクエスト/レスポンス形式）         |
| 出力         | スキル本体 + APIクライアントスクリプト + 認証情報管理設定             |
| 委譲先       | SkillCreatorService.createApiSkill() → ApiIntegrator                  |

### FR-3: 既存スキル改善（`/skill-creator improve`）

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| コマンド | `/skill-creator improve "<スキル名>" [--auto]`                                 |
| 概要     | 既存スキルの問題点を分析し、改善提案を生成、--auto で自動修正実行              |
| 改善対象 | プロンプト最適化、エラーハンドリング強化、パフォーマンス改善、ドキュメント充実 |
| 入力     | スキル名、autoフラグ                                                           |
| 出力     | 改善提案リスト（autoの場合は修正済みファイル群）                               |
| 委譲先   | SkillCreatorService.improveSkill()                                             |

### FR-4: タスク実行（`/skill-creator execute`）

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| コマンド   | `/skill-creator execute <タスクディレクトリパス> [--parallel] [--dry-run]`                                |
| 概要       | タスク仕様書をスキャンし、依存関係グラフに基づいてタスクを自動実行                                        |
| 実行フロー | 仕様書スキャン → 依存グラフ構築 → 循環依存チェック → トポロジカルソート → 並列/直列実行 → 検証 → リトライ |
| 入力       | タスクディレクトリパス、並列実行フラグ、ドライランフラグ                                                  |
| 出力       | 実行レポート（成功/失敗タスク、所要時間、エラー詳細）                                                     |
| 委譲先     | SkillCreatorService.executeTasks() → TaskGenerator                                                        |

### FR-5: 即時使用（`/skill-creator use`）

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| コマンド | `/skill-creator use "<スキル名>"`                                |
| 概要     | 作成したスキルを現在のセッションにホットリロードで登録           |
| フロー   | スキルインポート → セッション登録 → テスト実行（任意）→ 使用可能 |
| 入力     | スキル名                                                         |
| 出力     | インポート結果（成功/失敗、テスト結果）                          |
| 委譲先   | SkillCreatorService.useSkill() → SkillService.importSkills()     |

### FR-6: スキルチェーン作成（`/skill-creator chain`）

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| コマンド | `/skill-creator chain "<チェーン説明>"`                                |
| 概要     | 複数スキルをパイプラインとして連携、出力を次の入力に渡す               |
| 設定項目 | チェーン目的、使用スキル順序、入出力マッピング、エラーハンドリング方式 |
| 入力     | チェーン説明（自然言語）                                               |
| 出力     | チェーン定義ファイル + 入出力マッピング設定                            |
| 委譲先   | SkillCreatorService.createChain()                                      |

### FR-7: スキルフォーク（`/skill-creator fork`）

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| コマンド   | `/skill-creator fork "<元スキル名>" --name "<新スキル名>"`                                                       |
| 概要       | 既存スキルをベースに新しいスキルを作成                                                                           |
| オプション | --copy-agents (default: true), --copy-references (default: true), --copy-scripts (default: true), --modify-tools |
| 入力       | 元スキル名、新スキル名、コピーオプション                                                                         |
| 出力       | フォーク元の構造を引き継いだ新スキル + フォーク履歴メタデータ                                                    |
| 委譲先     | SkillCreatorService.forkSkill()                                                                                  |

### FR-8: スキル共有（`/skill-creator share`）

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| コマンド   | `/skill-creator share export "<スキル名>" --to <gist\|github>` / `/skill-creator share import --from <gist\|github\|url\|local> "<ソース>"` |
| 概要       | GitHub Gist / GitHub リポジトリでスキルをエクスポート/インポート                                                                            |
| 対応ソース | GitHub リポジトリ、GitHub Gist、URL（SKILL.md直接指定）、ローカルディレクトリ                                                               |
| 入力       | スキル名またはインポート元                                                                                                                  |
| 出力       | エクスポートURL または インポート済みスキル                                                                                                 |
| 委譲先     | SkillCreatorService.shareSkill()                                                                                                            |

### FR-9: スケジュール設定（`/skill-creator schedule`）

| 項目               | 内容                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| コマンド           | `/skill-creator schedule "<スキル名>" --cron\|--interval\|--once\|--event <値>`                             |
| 概要               | スキルの定期実行スケジュールを設定                                                                          |
| スケジュールタイプ | --cron (Cron形式), --interval (例: 1h, 30m), --once (ISO日時), --event (app_start, file_change, git_commit) |
| 入力               | スキル名、スケジュール設定                                                                                  |
| 出力               | スケジュール登録結果                                                                                        |
| 委譲先             | SkillCreatorService.scheduleSkill()                                                                         |

### FR-10: デバッグ実行（`/skill-creator debug`）

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| コマンド         | `/skill-creator debug "<スキル名>" [--breakpoint <ツール名>] [--condition <式>]` |
| 概要             | スキルをデバッグモードで実行し、ステップバイステップで追跡                       |
| ブレークポイント | --breakpoint (特定ツール呼び出し時に停止), --condition (条件式がtrueの時に停止)  |
| 入力             | スキル名、ブレークポイント設定                                                   |
| 出力             | デバッグ実行結果（各ステップの入出力、変数状態）                                 |
| 委譲先           | SkillCreatorService.debugSkill()                                                 |

### FR-11: ドキュメント生成（`/skill-creator docs`）

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| コマンド   | `/skill-creator docs "<スキル名>" [--format <markdown\|html\|pdf>] [--sections <セクション一覧>]` |
| 概要       | スキルのドキュメントを自動生成                                                                    |
| セクション | overview, usage, api, examples, troubleshooting                                                   |
| 入力       | スキル名、出力形式、セクション指定                                                                |
| 出力       | 生成されたドキュメントファイル                                                                    |
| 委譲先     | SkillCreatorService.generateDocs()                                                                |

### FR-12: 使用統計（`/skill-creator stats`）

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| コマンド | `/skill-creator stats ["<スキル名>"] [--all] [--period <期間>]`                             |
| 概要     | スキルの使用状況と分析を表示                                                                |
| 表示項目 | 実行回数（成功/失敗）、平均実行時間、頻出ツール、時間帯別使用分布、エラー傾向、使用トレンド |
| 入力     | スキル名（任意）、全スキルフラグ、集計期間                                                  |
| 出力     | 統計レポート（テーブル形式 + トレンドグラフ）                                               |
| 委譲先   | SkillCreatorService.getStats()                                                              |

---

## 非機能要件（NFR）

### NFR-1: セキュリティ

| ID      | 要件                                                                                         | 根拠                    |
| ------- | -------------------------------------------------------------------------------------------- | ----------------------- |
| NFR-1-1 | 全IPCハンドラーで `validateIpcSender()` による送信元ウィンドウ検証を実施する                 | 04-electron-security.md |
| NFR-1-2 | 全文字列引数に P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用する | P42                     |
| NFR-1-3 | ファイルパス引数にパストラバーサル防止検証を実施する                                         | security-skill-ipc.md   |
| NFR-1-4 | エラーはサニタイズしてから Renderer に返す（内部パス・スタックトレース非公開）               | 04-electron-security.md |
| NFR-1-5 | チャンネル名は `IPC_CHANNELS` 定数から参照し、ハードコード文字列を使用しない                 | P27                     |
| NFR-1-6 | 認証情報（APIキー、OAuthトークン）を平文保存しない                                           | 04-electron-security.md |
| NFR-1-7 | 外部API呼び出しスキル生成時、認証情報はMain Process内に留め、Rendererに公開しない            | P44/P45 対策            |

### NFR-2: 型安全性

| ID      | 要件                                                                        |
| ------- | --------------------------------------------------------------------------- |
| NFR-2-1 | `strict: true` で厳密な型チェックを適用する                                 |
| NFR-2-2 | `any` 型を使用しない                                                        |
| NFR-2-3 | IPC引数名は実際に渡される値のセマンティクスと一致させる（P45対策）          |
| NFR-2-4 | 型定義は `packages/shared` と `preload/types.ts` の2箇所同時更新（P32対策） |

### NFR-3: テストカバレッジ

| ID      | 要件                                     |
| ------- | ---------------------------------------- |
| NFR-3-1 | Line Coverage: 80% 以上                  |
| NFR-3-2 | Branch Coverage: 60% 以上                |
| NFR-3-3 | Function Coverage: 80% 以上              |
| NFR-3-4 | 各 FR に対応するユニットテストが存在する |

### NFR-4: パフォーマンス

| ID      | 要件                                                                       |
| ------- | -------------------------------------------------------------------------- |
| NFR-4-1 | 単一スキル生成処理が60秒以内に完了する                                     |
| NFR-4-2 | ファイル I/O は `async/await` で非同期処理し Main スレッドをブロックしない |
| NFR-4-3 | タスク実行でのトポロジカルソートが O(V+E) で完了する                       |

### NFR-5: ハンドラー管理

| ID      | 要件                                                                        |
| ------- | --------------------------------------------------------------------------- |
| NFR-5-1 | `registerSkillCreatorHandlers()` 関数でハンドラーを一括登録する             |
| NFR-5-2 | `unregisterSkillCreatorHandlers()` 関数でハンドラーを一括解除する（P5対策） |
| NFR-5-3 | 二重登録防止の仕組みを設ける                                                |

---

## 既知の落とし穴チェック

| Pitfall ID | 内容                                           | 対策                                 | 確認 |
| ---------- | ---------------------------------------------- | ------------------------------------ | ---- |
| P42        | 文字列引数の `.trim()` バリデーション漏れ      | 3段バリデーション標準化              | OK   |
| P44        | IPC ハンドラ引数形式とPreload側の不整合        | ハンドラを `string` 型に統一         | OK   |
| P45        | 引数命名の契約ドリフト（skillId vs skillName） | セマンティクスに一致する命名         | OK   |
| P34        | 遅延初期化が必要な依存オブジェクトのDI         | Setter Injection パターン使用        | OK   |
| P35        | DI追加時のテストモック大規模修正               | 影響範囲事前調査                     | OK   |
| P5         | リスナー二重登録                               | unregisterAllIpcHandlers()で一括解除 | OK   |

---

## 統合テスト連携

| 接続要件カテゴリ | 記載内容                                                       |
| ---------------- | -------------------------------------------------------------- |
| API接続          | Claude Agent SDK query() API経由でスキル生成・タスク実行を委譲 |
| 認証フロー       | 外部API連携スキル生成時の認証情報管理（Main Process内で完結）  |
| データフロー     | Renderer → IPC → Main → SkillCreatorService → FileSystem       |
| 既存サービス連携 | SkillService.importSkills() / SkillExecutor との責務境界       |
| スキルスキャン   | 生成後、SkillScannerで検出・パース可能であること               |
| フィクスチャ検証 | skill-fixture-runnerで生成スキルが検証可能であること           |
