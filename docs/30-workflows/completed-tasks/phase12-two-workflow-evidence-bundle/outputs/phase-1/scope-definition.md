# スコープ定義 — UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 |
| Phase    | 1 — 要件定義                                    |
| 作成日   | 2026-03-03                                      |

## スコープに含むもの

### 1. 2workflow同時監査向けの証跡集約テンプレート・手順定義

`spec_created` workflow と完了 workflow の監査結果を1つのフォーマットに集約するテンプレートを定義する。各 workflow に対して `verifyAllSpecsResult` と `validatePhaseResult` を記録し、横並びで比較可能にする。テンプレートのフィールド定義は FR-1 で規定した7フィールド（taskId, workflowType, workflowPath, verifyAllSpecsResult, validatePhaseResult, auditTimestamp, auditor）とする。

### 2. Task 1/3/4/5 実体確認チェック項目の固定化

Phase 12 の成果物実体確認を6項目のチェックリストとして固定化する。各チェック項目に対して確認対象ファイルのパスと検証方法を定義し、実行者間のばらつきを排除する。チェック項目は FR-2 で規定した6項目（Part 1 存在、Part 2 存在、API/IPC/Component 文書、changelog、未タスクレポート、フィードバックレポート）とする。

### 3. UIスクリーンショット存在確認の監査手順追加

UIタスクの場合にスクリーンショットの物理的存在確認と取得日検証を実施する手順を追加する。非UIタスクの場合は N/A としてスキップする分岐ルールを定義する。検証フィールドは FR-3 で規定した4フィールド（screenshotPath, captureDate, fileExists, contentMatch）とする。

### 4. task-workflow.md / lessons-learned.md への台帳同期ルール

Phase 12 完了時の台帳同期（task-workflow.md の残課題テーブル更新、lessons-learned.md への教訓追加）の手順をチェックリストに含める。P1/P25 対策として LOGS.md 2ファイル更新の手順も明記する。

## スコープに含まないもの

### 1. 既存 baseline 違反の一括解消

`baselineViolations` として記録される既存違反の修正は本タスクのスコープ外とする。baseline 違反は記録・未タスク管理の対象とするが、修正自体は別タスクで対応する。

### 2. アプリ機能実装（Renderer / Main / Preload の機能追加）

本タスクはワークフロー定義・監査手順の整備であり、Electron アプリケーションの Renderer、Main Process、Preload スクリプトに対する機能追加・変更は行わない。

### 3. Phase 1〜11 のワークフロー定義変更

Phase 12 の監査手順のみを対象とし、Phase 1〜11 の既存ワークフロー定義（要件定義、設計、テスト作成、実装、品質検証等）に対する変更は行わない。

## 依存タスク

| #   | タスクID                                     | 関係性                                                                                                      |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001       | Phase 12 証跡リンク整合性ガードの前提。証跡集約テンプレートのリンク検証ルールを本タスクで定義する           |
| 2   | UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001 | Phase 12 証跡値同期ガードの前提。current/baseline 分離判定の基準を本タスクで定義する                        |
| 3   | UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001  | Phase 12 仕様同期サブエージェントガードの前提。P43 対策の3ファイル以下/エージェント制約を本タスクで明記する |

## スコープ境界の判定基準

| 判定項目                             | スコープ内 | スコープ外 |
| ------------------------------------ | ---------- | ---------- |
| 証跡集約テンプレートの定義           | Yes        | -          |
| テンプレートの自動生成スクリプト実装 | -          | Yes        |
| チェックリスト項目の固定化           | Yes        | -          |
| チェック結果の自動判定ツール実装     | -          | Yes        |
| UIスクリーンショット検証手順の定義   | Yes        | -          |
| スクリーンショット自動撮影機能の実装 | -          | Yes        |
| current/baseline 分離基準の定義      | Yes        | -          |
| baseline 違反の修正実施              | -          | Yes        |
| 台帳同期ルールの定義                 | Yes        | -          |
| Phase 1〜11 ワークフローの変更       | -          | Yes        |
| Renderer/Main/Preload の機能追加     | -          | Yes        |
