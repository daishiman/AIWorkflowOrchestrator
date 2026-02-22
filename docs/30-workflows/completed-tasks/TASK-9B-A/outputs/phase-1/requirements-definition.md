# TASK-9B-A 要件定義書

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-A                   |
| Phase    | 1                           |
| 作成日   | 2026-02-03                  |
| タイトル | skill-creator SKILL.md 作成 |

## 機能要件（FR）

| FR-ID  | 要件                                           | 優先度   | 検証方法                |
| ------ | ---------------------------------------------- | -------- | ----------------------- |
| FR-001 | SKILL.md がスキル構造仕様に準拠すること        | Critical | フォーマット検証        |
| FR-002 | allowed-tools に必要な9ツールが定義されること  | Critical | `grep -c`               |
| FR-003 | 12の機能（コマンド）が記述されること           | Critical | セクション検証          |
| FR-004 | サブエージェントへのパスが正しく設定されること | High     | `grep -c "agents/"`     |
| FR-005 | 参照資料へのパスが正しく設定されること         | High     | `grep -c "references/"` |
| FR-006 | YAML Frontmatterが仕様準拠であること           | Critical | YAML検証                |
| FR-007 | description にAnchors/Triggerが含まれること    | High     | セクション検証          |

## 非機能要件（NFR）

| NFR-ID  | 要件                           | 優先度 | 検証方法       |
| ------- | ------------------------------ | ------ | -------------- |
| NFR-001 | SKILL.md は500行以内であること | Medium | `wc -l`        |
| NFR-002 | 可読性が高いこと               | Medium | コードレビュー |
| NFR-003 | 既存パターンとの一貫性         | High   | パターン照合   |

## allowed-tools 一覧（9ツール）

| ツール          | 用途                     | 必須理由                    |
| --------------- | ------------------------ | --------------------------- |
| Read            | ファイル読み込み         | スキル分析・既存参照        |
| Write           | ファイル書き込み         | スキル生成                  |
| Edit            | ファイル編集             | スキル更新                  |
| Glob            | パターンマッチ検索       | ファイル探索                |
| Grep            | 内容検索                 | コード分析                  |
| Bash            | コマンド実行             | スクリプト実行              |
| Task            | サブエージェント呼び出し | エージェント委譲            |
| WebFetch        | 外部API連携              | API連携スキル（`/api`機能） |
| AskUserQuestion | ユーザー対話             | collaborative モード        |

> **Note**: WebFetchは既存実装（8ツール）に追加。`/skill-creator api` 機能で外部API呼び出しが必要なため。

## 12機能（コマンド）一覧

| No  | コマンド                  | 機能名           | 概要                            |
| --- | ------------------------- | ---------------- | ------------------------------- |
| 1   | `/skill-creator` (chat)   | 対話的スキル作成 | 会話形式でスキルを作成          |
| 2   | `/skill-creator api`      | API連携スキル    | REST API/Webhook連携スキル生成  |
| 3   | `/skill-creator improve`  | 既存スキル改善   | 既存スキルの分析・改善提案      |
| 4   | `/skill-creator execute`  | タスク実行       | タスク仕様書に従って自動実行    |
| 5   | `/skill-creator use`      | 即時使用         | セッション内で即座に使用        |
| 6   | `/skill-creator chain`    | スキルチェーン   | 複数スキルをパイプライン連携    |
| 7   | `/skill-creator fork`     | スキルフォーク   | 既存スキルベースで新規作成      |
| 8   | `/skill-creator share`    | スキル共有       | Gist/GitHubでの共有・インポート |
| 9   | `/skill-creator schedule` | スケジュール     | 定期実行スケジュール設定        |
| 10  | `/skill-creator debug`    | デバッグ実行     | デバッグモードでスキル実行      |
| 11  | `/skill-creator docs`     | ドキュメント生成 | スキルドキュメント自動生成      |
| 12  | `/skill-creator stats`    | 使用統計         | スキル使用状況と分析            |

## サブエージェント参照（5つ以上）

| エージェント                    | 役割              |
| ------------------------------- | ----------------- |
| `agents/hearing-facilitator.md` | 対話的ヒアリング  |
| `agents/task-generator.md`      | タスク仕様書生成  |
| `agents/code-generator.md`      | コード生成        |
| `agents/api-integrator.md`      | API連携コード生成 |
| `agents/validator.md`           | 検証・テスト      |

## 参照資料参照（4つ以上）

| 参照資料                        | 内容                     |
| ------------------------------- | ------------------------ |
| `references/task-template.md`   | タスク仕様書テンプレート |
| `references/skill-structure.md` | スキル構造ガイド         |
| `references/api-patterns.md`    | API連携パターン集        |
| `references/security-guide.md`  | 認証・機密情報管理       |

## 参照資料

| 資料名            | パス                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 元タスク仕様      | `docs/30-workflows/skill-import-agent-system/tasks/task-9b-a-skill-md.md`                                                     |
| 親タスク仕様      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020-task-9b-skill-creator.md` |
| 既存skill-creator | `~/.claude/skills/skill-creator/SKILL.md`                                                                                     |

## 作成日時

2026-02-03
