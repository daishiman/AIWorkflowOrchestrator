# 未タスク仕様書一覧レポート

## 📊 概要統計

- **合計タスク数**: 398
- **GitHub Issue紐付け**: 398/398 (100%)
- **レポート生成日**: 2026-03-15
- **調査範囲**: `docs/30-workflows/unassigned-task/` 配下全ファイル

## 📈 ステータス分布

| ステータス        | 件数 | 割合  |
| ----------------- | ---- | ----- |
| 未着手 / 指定なし | 391  | 98.2% |
| 未実施            | 4    | 1.0%  |
| その他            | 3    | 0.8%  |

## 🎯 優先度分布

| 優先度   | 件数 | 割合  |
| -------- | ---- | ----- |
| 指定なし | 394  | 99.0% |
| 中       | 3    | 0.8%  |
| 低       | 1    | 0.3%  |

## 📋 タスク一覧サンプル（最初の50件）

| #   | Task ID                                   | ファイル                                                 | タイトル                                            |
| --- | ----------------------------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| 1   | `**-ARCHITECTURE-OVERVIEW-RAG-PIPELINE`   | task-\*\*-architecture-overview-rag-pipeline.md          | HybridRAG パイプライン アーキテクチャ概要           |
| 2   | `00-MASTER-LIST`                          | task-00-master-task-list.md                              | HybridRAG パイプライン - マスタータスクリスト       |
| 3   | `05-HISTORY-LOG-MANAGEMENT`               | task-05-history-log-management.md                        | 履歴/ログ管理 - タスク指示書                        |
| 4   | `07-HYBRID-SEARCH-ENGINE`                 | task-07-hybrid-search-engine.md                          | HybridRAG 検索エンジン - タスク指示書               |
| 5   | `08-KNOWLEDGE-GRAPH-CONSTRUCTION`         | task-08-knowledge-graph-construction.md                  | Knowledge Graph構築 - タスク指示書                  |
| 6   | `10A-B-ANALYSIS-VIEW-MOLECULE-SEPARATION` | task-10a-b-analysis-view-molecule-separation.md          | UT-TASK-10A-B-005 SkillAnalysisView 分割設計追補    |
| 7   | `10A-B-COMPLETED-UT-PLACEMENT-POLICY`     | task-10a-b-completed-ut-placement-policy-guard.md        | UT-TASK-10A-B-009 完了済みUT配置ポリシー統一ガード  |
| 8   | `10A-B-IMPROVEMENT-RESULT-TIMESTAMP`      | task-10a-b-improvement-result-timestamp-readability.md   | UT-TASK-10A-B-009 改善結果実行日時の視認性改善      |
| 9   | `10A-B-IMPROVEMENT-TOAST-NOTIFICATION`    | task-10a-b-improvement-toast-notification.md             | UT-TASK-10A-B-002 改善結果トースト通知実装          |
| 10  | `10A-B-PHASE11-REQUIRED-SECTIONS-VAL`     | task-10a-b-phase11-required-sections-validation-guard.md | UT-TASK-10A-B-006 Phase 11 必須セクション検証ガード |

...（他 388 タスク）

## 📁 ファイル統計

- **総ファイル数**: 398
- **ファイル形式**: すべて Markdown (.md)
- **推定総サイズ**: 約 10-15 MB

## 🔍 主要タスク分類

### HybridRAG パイプライン関連

- task-\*\*-architecture-overview-rag-pipeline.md
- task-00-master-task-list.md
- task-05-history-log-management.md
- task-07-hybrid-search-engine.md
- task-08-knowledge-graph-construction.md

### UT (Unit Test) 関連

- task-10a-b-analysis-view-molecule-separation.md
- task-10a-b-completed-ut-placement-policy-guard.md
- task-10a-b-improvement-result-timestamp-readability.md
- task-10a-b-improvement-toast-notification.md
- task-10a-b-phase11-required-sections-validation-guard.md
- task-10a-b-phase11-screenshot-freshness-guard.md
- task-10a-b-props-contract-alignment.md
- ... (他多数)

### UI/UX 改善関連

- task-10a-ui-skill-improve.md
- task-10b-improve-history.md
- task-10c-ab-test.md

### IPC/セキュリティ関連

- task-3-1-B-skillexecutor-ipc-integration.md
- task-8c-permission-resolver-e2e-integration.md

### エディター/コード機能関連

- task-9a-c-code-editor-migration.md
- task-9a-c-syntax-highlighting.md
- task-9b-h-api-dual-publishing-unification.md
- ... (他多数)

## 📂 出力ファイル

1. **unassigned_tasks_summary.csv** - 全398タスクの CSV 形式一覧
2. **UNASSIGNED_TASKS_REPORT.md** - このレポート

## ✅ 調査完了

すべてのタスク仕様書が正常に読み込まれ、情報が抽出されました。

---

生成者: spec-reader agent
生成日時: 2026-03-15
