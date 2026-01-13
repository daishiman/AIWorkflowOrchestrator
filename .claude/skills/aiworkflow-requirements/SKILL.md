---
name: aiworkflow-requirements
description: |
  AIWorkflowOrchestratorプロジェクトの仕様管理スキル。
  仕様書を検索・参照するためのインターフェース。
  references/配下に全仕様を格納し、キーワード検索で必要な情報に素早くアクセス。

  Anchors:
  • Specification-Driven Development / 適用: 仕様書正本 / 目的: 実装との一貫性
  • Progressive Disclosure / 適用: 検索→詳細参照 / 目的: コンテキスト効率化
  • MECE原則 / 適用: トピック分類 / 目的: 漏れなく重複なく

  Trigger:
  プロジェクト仕様の検索、アーキテクチャ確認、API設計参照、セキュリティ要件確認、テスト戦略参照を行う場合に使用。
  仕様, 要件, アーキテクチャ, API, データベース, セキュリティ, UI/UX, デプロイ, Claude Code, テスト, MSW, カバレッジ
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# AIWorkflow Requirements Manager

## 概要

AIWorkflowOrchestratorプロジェクトの全仕様（70ファイル・約17,000行）を管理するスキル。
**このスキルが仕様の正本**であり、references/配下のドキュメントを直接編集・参照する。

## ワークフロー

```
                    ┌→ search-spec ────┐
user-request → ┼                       ┼→ read-reference → apply-to-task
                    └→ browse-index ───┘
                              ↓
                    (仕様変更が必要な場合)
                              ↓
              ┌→ create-spec ──────────┐
              ┼                         ┼→ update-index → validate-structure
              └→ update-spec ──────────┘
```

## Task仕様ナビ

| Task               | 責務           | 起動タイミング                       | 入力         | 出力             |
| ------------------ | -------------- | ------------------------------------ | ------------ | ---------------- |
| search-spec        | 仕様検索       | 仕様確認が必要な時                   | キーワード   | ファイルパス一覧 |
| browse-index       | 全体像把握     | 構造理解が必要な時                   | なし         | トピック構造     |
| read-reference     | 仕様参照       | 詳細確認が必要な時                   | ファイルパス | 仕様内容         |
| create-spec        | 新規作成       | 新機能追加時                         | 要件         | 新規仕様ファイル |
| update-spec        | 既存更新       | 仕様変更時                           | 変更内容     | 更新済みファイル |
| update-index       | インデックス化 | 見出し変更後                         | references/  | indexes/         |
| validate-structure | 構造検証       | 週次/リリース前                      | 全体         | 検証レポート     |

## リソース参照

### 仕様ファイル一覧

**49ファイル・10トピック**: See [indexes/topic-map.md](indexes/topic-map.md)

| トピック         | ファイル数 |
| ---------------- | ---------- |
| 概要・品質       | 4          |
| アーキテクチャ   | 6          |
| インターフェース | 7          |
| API設計          | 3          |
| データベース     | 3          |
| UI/UX            | 6          |
| セキュリティ     | 3          |
| 技術スタック     | 3          |
| Claude Code      | 6          |
| その他           | 9          |

**注記**: 18-skills.md（Skill層仕様書）は `skill-creator` スキルで管理。

### scripts/

| スクリプト               | 用途               | 使用例                                       |
| ------------------------ | ------------------ | -------------------------------------------- |
| `search-spec.mjs`        | キーワード検索     | `node scripts/search-spec.mjs "認証" -C 5`   |
| `list-specs.mjs`         | ファイル一覧       | `node scripts/list-specs.mjs --topics`       |
| `generate-index.mjs`     | インデックス再生成 | `node scripts/generate-index.mjs`            |
| `validate-structure.mjs` | 構造検証           | `node scripts/validate-structure.mjs`        |
| `log_usage.mjs`          | 使用状況記録       | `node scripts/log_usage.mjs --result success`|

### agents/

| エージェント       | 用途         | 対応Task           |
| ------------------ | ------------ | ------------------ |
| `create-spec.md`   | 新規仕様作成 | create-spec        |
| `update-spec.md`   | 既存仕様更新 | update-spec        |
| `validate-spec.md` | 仕様検証     | validate-structure |

### indexes/

| ファイル        | 内容                       |
| --------------- | -------------------------- |
| `topic-map.md`  | トピック別マップ（詳細）   |
| `keywords.json` | キーワード索引（自動生成） |

### assets/

| ファイル           | 用途                   |
| ------------------ | ---------------------- |
| `spec-template.md` | 新規仕様のテンプレート |

### references/（ガイドライン）

| ファイル             | 内容                       |
| -------------------- | -------------------------- |
| `spec-guidelines.md` | 命名規則・記述ガイドライン |

### 運用ファイル

| ファイル      | 用途                                   |
| ------------- | -------------------------------------- |
| `EVALS.json`  | スキルレベル・メトリクス管理           |
| `LOGS.md`     | 使用履歴・フィードバック記録           |

## ベストプラクティス

### すべきこと

- キーワード検索で情報を素早く特定
- 編集後は `node scripts/generate-index.mjs` を実行
- 500行超過時はインデックス+サブファイル形式に手動分割

### 避けるべきこと

- references/以外に仕様情報を分散
- インデックス更新を忘れる
- 詳細ルールをSKILL.mdに追加（→ spec-guidelines.md へ）

**詳細ルール**: See [references/spec-guidelines.md](references/spec-guidelines.md)

## 変更履歴

| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 6.10.0  | 2026-01-14 | ui-ux-settings.md新規追加: スライド出力ディレクトリ設定機能のUI/UX仕様・IPC API仕様・セキュリティ要件（slideSettingsAPI） |
| 6.9.0   | 2026-01-13 | Knowledge Graph Store実装完了: interfaces-rag-knowledge-graph-store.md v1.0.1更新、実装詳細追加（Entity/Relation CRUD、グラフ探索、バッチ操作）、カバレッジ86.98%達成 |
| 6.8.0   | 2026-01-13 | AgentSDKPage Postrelease Testing仕様追加: interfaces-agent-sdk.mdに約150行追加（AGENT-005-POST） |
| 6.7.0   | 2026-01-12 | 未タスク指示書3件作成（renderer-build-fix、history-gui-manual-test、error-i18n-support）、ui-ux-history-panel.md v1.6.0更新 |
| 6.6.1   | 2026-01-12 | history-service-db-integration実装内容追加: architecture-file-conversion.md、api-internal-conversion.mdにElectron統合セクション追加 |
| 6.6.0   | 2026-01-12 | VectorSearchStrategy仕様追加: interfaces-rag-search.mdにISearchStrategy実装一覧/Result型/フィルタ対応表/CachedVectorSearchStrategy追加、architecture-rag.mdにVectorSearchStrategyセクション追加 |
| 6.5.0   | 2026-01-12 | Agent Execution UI仕様追加（AGENT-004）: interfaces-agent-sdk.md/ui-ux-components.mdに約550行追加、topic-map.md更新 |
| 6.4.0   | 2026-01-12 | GraphRAGクエリサービス仕様追加: interfaces-rag-graphraph-query.md新規、architecture-rag.md更新、topic-map.md更新 |
| 6.3.0   | 2026-01-11 | コミュニティ要約仕様追加: interfaces-rag-community-summarization.md新規、interfaces-rag-community-detection.md更新（v1.1.0）、topic-map.md更新 |
| 6.2.0   | 2026-01-10 | コミュニティ検出（Leiden）仕様追加: interfaces-rag-community-detection.md新規、interfaces-rag.md/architecture-rag.md/topic-map.md更新 |
| 6.1.0   | 2026-01-06 | 500行超過ファイル分割（9ファイル→インデックス化）、70ファイル構成に拡張 |
| 6.0.0   | 2026-01-06 | skill-creator準拠: agents/をTask仕様書テンプレート化、EVALS.json/LOGS.md/log_usage.mjs追加 |
| 5.0.0   | 2026-01-04 | SKILL.md軽量化、詳細をindexes/references/へ分離      |
| 4.0.0   | 2026-01-03 | kebab-case化、大ファイル分割、47ファイル構成         |
| 3.0.0   | 2026-01-03 | 仕様正本化、検索中心に再設計                         |
