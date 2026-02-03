# TASK-9B-A 機能詳細設計書

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-A                   |
| Phase    | 2                           |
| 作成日   | 2026-02-03                  |
| タイトル | skill-creator SKILL.md 作成 |

## 12機能詳細設計

### 1. 対話的スキル作成 (`/skill-creator` または `/skill-creator chat`)

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| コマンド     | `/skill-creator` または `/skill-creator chat` |
| 機能名       | 対話的スキル作成                              |
| 概要         | 会話形式でスキルを作成                        |
| 使用ツール   | AskUserQuestion, Write, Task                  |
| エージェント | `agents/hearing-facilitator.md`               |

### 2. 外部API連携スキル (`/skill-creator api`)

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| コマンド     | `/skill-creator api`             |
| 機能名       | 外部API連携スキル                |
| 概要         | REST API/Webhook連携スキルを生成 |
| 使用ツール   | WebFetch, Write, Task            |
| エージェント | `agents/api-integrator.md`       |
| 参照資料     | `references/api-patterns.md`     |

### 3. 既存スキル改善 (`/skill-creator improve`)

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| コマンド     | `/skill-creator improve`           |
| 機能名       | 既存スキル改善                     |
| 概要         | 既存スキルを分析し改善を提案・実行 |
| 使用ツール   | Read, Glob, Grep, Edit             |
| エージェント | `agents/validator.md`              |

### 4. タスク実行 (`/skill-creator execute`)

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| コマンド     | `/skill-creator execute`             |
| 機能名       | タスク実行                           |
| 概要         | タスク仕様書に従ってタスクを自動実行 |
| 使用ツール   | Read, Bash, Task                     |
| エージェント | `agents/task-generator.md`           |
| 参照資料     | `references/task-template.md`        |

### 5. 即時使用 (`/skill-creator use`)

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| コマンド     | `/skill-creator use`                         |
| 機能名       | 即時使用                                     |
| 概要         | 作成したスキルを即座に現在のセッションで使用 |
| 使用ツール   | Read, Task                                   |
| エージェント | -                                            |

### 6. スキルチェーン作成 (`/skill-creator chain`)

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| コマンド     | `/skill-creator chain`               |
| 機能名       | スキルチェーン作成                   |
| 概要         | 複数のスキルをパイプラインとして連携 |
| 使用ツール   | Read, Write, Task                    |
| エージェント | -                                    |

### 7. スキルフォーク (`/skill-creator fork`)

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| コマンド     | `/skill-creator fork`                  |
| 機能名       | スキルフォーク                         |
| 概要         | 既存スキルをベースに新しいスキルを作成 |
| 使用ツール   | Read, Write, Edit                      |
| エージェント | `agents/code-generator.md`             |

### 8. スキル共有 (`/skill-creator share`)

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| コマンド   | `/skill-creator share`                              |
| 機能名     | スキル共有                                          |
| 概要       | 作成したスキルをGist/GitHubで共有、またはインポート |
| 使用ツール | Bash, WebFetch                                      |
| 参照資料   | `references/security-guide.md`                      |

### 9. スケジュール設定 (`/skill-creator schedule`)

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| コマンド     | `/skill-creator schedule`          |
| 機能名       | スケジュール設定                   |
| 概要         | スキルの定期実行スケジュールを設定 |
| 使用ツール   | Write, Bash                        |
| エージェント | -                                  |

### 10. デバッグ実行 (`/skill-creator debug`)

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| コマンド     | `/skill-creator debug`       |
| 機能名       | デバッグ実行                 |
| 概要         | スキルをデバッグモードで実行 |
| 使用ツール   | Read, Task, Bash             |
| エージェント | `agents/validator.md`        |

### 11. ドキュメント生成 (`/skill-creator docs`)

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| コマンド   | `/skill-creator docs`           |
| 機能名     | ドキュメント生成                |
| 概要       | スキルのドキュメントを自動生成  |
| 使用ツール | Read, Write, Glob               |
| 参照資料   | `references/skill-structure.md` |

### 12. 使用統計 (`/skill-creator stats`)

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| コマンド     | `/skill-creator stats`       |
| 機能名       | 使用統計                     |
| 概要         | スキルの使用状況と分析を表示 |
| 使用ツール   | Read, Glob, Grep             |
| エージェント | -                            |

## サブエージェント設計

| エージェント                    | 役割              | 使用機能       |
| ------------------------------- | ----------------- | -------------- |
| `agents/hearing-facilitator.md` | 対話的ヒアリング  | chat           |
| `agents/task-generator.md`      | タスク仕様書生成  | execute        |
| `agents/code-generator.md`      | コード生成        | fork           |
| `agents/api-integrator.md`      | API連携コード生成 | api            |
| `agents/validator.md`           | 検証・テスト      | improve, debug |

## 参照資料設計

| 参照資料                        | 内容                     | 使用機能 |
| ------------------------------- | ------------------------ | -------- |
| `references/task-template.md`   | タスク仕様書テンプレート | execute  |
| `references/skill-structure.md` | スキル構造ガイド         | docs     |
| `references/api-patterns.md`    | API連携パターン集        | api      |
| `references/security-guide.md`  | 認証・機密情報管理       | share    |

## 機能×ツール マトリックス

| 機能     | Read | Write | Edit | Glob | Grep | Bash | Task | WebFetch | AskUserQuestion |
| -------- | ---- | ----- | ---- | ---- | ---- | ---- | ---- | -------- | --------------- |
| chat     |      | ✓     |      |      |      |      | ✓    |          | ✓               |
| api      |      | ✓     |      |      |      |      | ✓    | ✓        |                 |
| improve  | ✓    |       | ✓    | ✓    | ✓    |      |      |          |                 |
| execute  | ✓    |       |      |      |      | ✓    | ✓    |          |                 |
| use      | ✓    |       |      |      |      |      | ✓    |          |                 |
| chain    | ✓    | ✓     |      |      |      |      | ✓    |          |                 |
| fork     | ✓    | ✓     | ✓    |      |      |      |      |          |                 |
| share    |      |       |      |      |      | ✓    |      | ✓        |                 |
| schedule |      | ✓     |      |      |      | ✓    |      |          |                 |
| debug    | ✓    |       |      |      |      | ✓    | ✓    |          |                 |
| docs     | ✓    | ✓     |      | ✓    |      |      |      |          |                 |
| stats    | ✓    |       |      | ✓    | ✓    |      |      |          |                 |

→ **全9ツールが1つ以上の機能で使用される設計**

## 作成日時

2026-02-03
