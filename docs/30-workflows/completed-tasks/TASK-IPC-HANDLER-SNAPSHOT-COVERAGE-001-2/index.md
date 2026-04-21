---
task_id: TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
task_name: IPC handler registration snapshot coverage 拡張
category: 改善
target_feature: desktop main IPC handler registration
priority: 中
scale: 大規模
status: pending
issue_number: 2269
created_date: 2026-04-19
dependencies:
  - UT-IPC-HANDLER-CI-001
---

# TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001: IPC handler registration snapshot coverage 拡張

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001          |
| タスク名     | IPC handler registration snapshot coverage 拡張 |
| 分類         | 改善                                            |
| 対象機能     | desktop main IPC handler registration           |
| 優先度       | 中                                              |
| 見積もり規模 | 大規模                                          |
| ステータス   | pending                                         |
| GitHub Issue | #2269（CLOSED）                                 |
| 依存タスク   | UT-IPC-HANDLER-CI-001                           |
| タスク種別   | NON_VISUAL（UI変更なし）                        |
| 作成日       | 2026-04-19                                      |

## 背景・課題

`UT-IPC-HANDLER-CI-001` では `registerRuntimeSkillCreatorHandlers()` だけに登録スナップショットテストを導入した。しかし `apps/desktop/src/main/ipc/index.ts` が呼び出す他の `register*Handlers()` 群には同種のguardが未導入のままである。

ハンドラ登録漏れや重複登録は対象関数ごとに再発する可能性があり、main IPC全体としてfail-fastにならない状態が続いている。個々の `register*Handlers()` が何チャンネルを登録するかを CI で自動検証するスナップショットテストが存在しない関数は、変更時に回帰を検出できない。

## 目的・ゴール

`apps/desktop/src/main/ipc/` 配下の全 `register*Handlers()` 関数に対して、`creatorHandlers.registrationSnapshot.test.ts` と同等のスナップショットテストを段階的に追加する。これにより main IPC 全体でハンドラ登録の完全性・重複排除・チャンネル数の自動検証が CI で機能するようにする。

## スコープ

### 対象

- `apps/desktop/src/main/ipc/index.ts` に列挙された全 `register*Handlers()` 関数
- 各関数に対応するスナップショットテストファイル（`__tests__/` 配下への追加）
- wave分割による段階的カバレッジ拡大（Wave 1 → Wave 2 → Wave 3）

### 対象外

- 既存ハンドラの実装コード変更
- IPC チャンネル名・シグネチャの変更
- UI コンポーネントの変更（NON_VISUAL タスク）

## 対象母集団の定義

本タスクの検証対象は、`apps/desktop/src/main/ipc/index.ts` の
`registerAllIpcHandlers()` から直接呼ばれる registration unit を正本とする。
固定表の手更新でドリフトしやすいため、全件一覧と wave 割当の正本は
Phase 1 の `outputs/phase-1/handler-inventory.md` と
Phase 2 の `outputs/phase-2/wave-plan.md` に置く。

以下の表は Wave 1 の初期優先候補であり、全件一覧ではない。
Phase 1 の棚卸しで追加判明した registration unit
（例: `registerChatEditHandlers`, `registerConversationHandlers`,
`registerAuthKeyHandlers`, `registerAuthModeHandlers`,
`registerSlideIpcHandlers`, `registerChatExportHandlers` など）は
除外せず `handler-inventory.md` に必ず記録し、Phase 2 で wave を確定する。

## Wave 1 初期優先候補

以下は `apps/desktop/src/main/ipc/index.ts` から確認した優先候補である。

| 関数名                          | 想定wave | 優先度理由                     |
| ------------------------------- | -------- | ------------------------------ |
| registerSkillHandlers           | Wave 1   | スキル中核、変更頻度高         |
| registerLLMHandlers             | Wave 1   | AI機能中核、変更頻度高         |
| registerSkillCreatorHandlers    | Wave 1   | 既存パターンとの整合性確認     |
| registerSkillFileHandlers       | Wave 1   | ファイル操作、セキュリティ重要 |
| registerSafetyGateHandlers      | Wave 1   | セキュリティ中核               |
| registerApprovalHandlers        | Wave 1   | 承認フロー中核                 |
| registerAgentExecutionHandlers  | Wave 1   | エージェント実行中核           |
| registerFileHandlers            | Wave 2   | 基本ファイル操作               |
| registerFsHandlers              | Wave 2   | ファイルシステム               |
| registerStoreHandlers           | Wave 2   | ストア管理                     |
| registerUserSettingsHandlers    | Wave 2   | ユーザー設定                   |
| registerAIHandlers              | Wave 2   | AI汎用                         |
| registerDashboardHandlers       | Wave 2   | ダッシュボード                 |
| registerGraphHandlers           | Wave 2   | グラフ表示                     |
| registerAuthHandlers            | Wave 2   | 認証                           |
| registerApiKeyHandlers          | Wave 2   | APIキー管理                    |
| registerHistoryHandlers         | Wave 2   | 履歴管理                       |
| registerHistorySearchHandlers   | Wave 2   | 履歴検索                       |
| registerNotificationHandlers    | Wave 2   | 通知                           |
| registerAgentSkillHandlers      | Wave 2   | エージェントスキル             |
| registerCommunityHandlers       | Wave 2   | コミュニティ                   |
| registerSkillScheduleHandlers   | Wave 2   | スキルスケジュール             |
| registerSkillAnalyticsHandlers  | Wave 2   | スキル分析                     |
| registerWindowHandlers          | Wave 3   | ウィンドウ管理                 |
| registerThemeHandlers           | Wave 3   | テーマ                         |
| registerProfileHandlers         | Wave 3   | プロフィール                   |
| registerAvatarHandlers          | Wave 3   | アバター                       |
| registerDialogHandlers          | Wave 3   | ダイアログ                     |
| registerTerminalHandlers        | Wave 3   | ターミナル                     |
| registerWorkspaceHandlers       | Wave 3   | ワークスペース                 |
| registerSearchHandlers          | Wave 3   | 検索                           |
| registerFileSelectionHandlers   | Wave 3   | ファイル選択                   |
| registerSkillDocsHandlers       | Wave 3   | スキルドキュメント             |
| registerSkillChainHandlers      | Wave 3   | スキルチェーン                 |
| registerSkillShareHandlers      | Wave 3   | スキル共有                     |
| registerSkillDebugHandlers      | Wave 3   | スキルデバッグ                 |
| registerClaudeCliHandlers       | Wave 3   | Claude CLI                     |
| registerDisclosureHandlers      | Wave 3   | ディスクロージャー             |
| registerAdvancedConsoleHandlers | Wave 3   | 高度コンソール                 |
| registerAnalyticsHandlers       | Wave 3   | 分析                           |
| registerPermissionStoreHandlers | Wave 3   | パーミッションストア           |

## 受入基準

| ID     | 基準                                                                                  |
| ------ | ------------------------------------------------------------------------------------- |
| AC-001 | `handler-inventory.md` に列挙された全 registration unit に REG-SNAP テストが存在する  |
| AC-002 | `handler-inventory.md` に列挙された全 registration unit に REG-DEDUP テストが存在する |
| AC-003 | `handler-inventory.md` に列挙された全 registration unit に REG-COUNT テストが存在する |
| AC-004 | Wave 1 の全テストが CI で PASS する                                                   |
| AC-005 | Wave 2 の全テストが CI で PASS する                                                   |
| AC-006 | Wave 3 の全テストが CI で PASS する                                                   |
| AC-007 | 既存テスト（`creatorHandlers.registrationSnapshot.test.ts`）が引き続き PASS する      |
| AC-008 | 新規テストファイルの命名規則が `*Handlers.registrationSnapshot.test.ts` に準拠する    |

## 実装対象ファイル

- `apps/desktop/src/main/ipc/__tests__/` 配下への新規テストファイル追加（実装コード変更なし）
- 参照パターン: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`

## Phase一覧

| Phase    | 名称                     | 仕様書                                                 | ステータス |
| -------- | ------------------------ | ------------------------------------------------------ | ---------- |
| Phase 1  | 要件定義                 | [phase-1-requirements.md](phase-1-requirements.md)     | 未実施     |
| Phase 2  | 設計                     | [phase-2-design.md](phase-2-design.md)                 | 未実施     |
| Phase 3  | 設計レビュー             | [phase-3-design-review.md](phase-3-design-review.md)   | 未実施     |
| Phase 4  | テスト作成（Wave 1 Red） | [phase-4-test-creation.md](phase-4-test-creation.md)   | 未実施     |
| Phase 5  | 実装（Wave 1 Green）     | [phase-5-implementation.md](phase-5-implementation.md) | 未実施     |
| Phase 6  | テスト拡充               | [phase-6-test-expansion.md](phase-6-test-expansion.md) | 未実施     |
| Phase 7  | カバレッジ確認           | [phase-7-coverage.md](phase-7-coverage.md)             | 未実施     |
| Phase 8  | リファクタリング         | [phase-8-refactoring.md](phase-8-refactoring.md)       | 未実施     |
| Phase 9  | 品質保証                 | [phase-9-quality.md](phase-9-quality.md)               | 未実施     |
| Phase 10 | 最終レビュー             | [phase-10-final-review.md](phase-10-final-review.md)   | 未実施     |
| Phase 11 | 手動テスト               | [phase-11-manual-test.md](phase-11-manual-test.md)     | 未実施     |
| Phase 12 | ドキュメント更新         | [phase-12-documentation.md](phase-12-documentation.md) | 未実施     |
| Phase 13 | PR作成                   | [phase-13-pr.md](phase-13-pr.md)                       | 未実施     |
