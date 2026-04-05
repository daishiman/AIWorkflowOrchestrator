# TASK-P0-06 Phase 12: 未タスク検出結果

## メタ情報

| 項目    | 内容                                   |
| ------- | -------------------------------------- |
| Phase   | 12                                     |
| Phase名 | ドキュメント更新                       |
| 作成日  | 2026-04-04                             |
| 機能名  | TASK-P0-06-conversational-interview-ui |
| Issue   | #1889                                  |

---

## 1. 検出された未タスク一覧

### UT-P0-06-CANONICAL-SYNC-001: aiworkflow-requirements 正本仕様との canonical 同期

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 未タスクID | UT-P0-06-CANONICAL-SYNC-001                                                                                     |
| 検出Phase  | Phase 2（設計）                                                                                                 |
| ステータス | 未着手                                                                                                          |
| 優先度     | 中（RT-05 完了後に実施）                                                                                        |
| 内容       | aiworkflow-requirements 正本仕様との canonical 同期。P0-06 で追加・変更した型定義・IPC フローの正本仕様への反映 |
| 対応方針   | RT-05（SDK Message Contract Normalization）完了後に実施。正本仕様の `SkillCreatorUserInputKind` 定義を更新する  |
| 担当候補   | RT-05 完了後の canonical 同期タスクとして別途起票                                                               |

#### 同期対象の詳細

| 同期対象           | 正本ファイル                                                                    | 同期内容                                                                                   |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Session Bridge 型  | `references/api-ipc-system-core.md`                                             | `UserInputQuestion` / `UserInputAnswer` の形状更新                                         |
| Workflow UI 型     | `references/arch-state-management-core.md`                                      | `SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `workflowSnapshot` の所有権明確化 |
| IPC チャンネル定義 | `references/api-ipc-system-core.md`, `references/security-electron-ipc-core.md` | `external-api-config-required` / `configure-api` / `api-configured` チャンネルの文書化     |
| 完了記録           | `references/task-workflow-completed.md`                                         | TASK-P0-06 完了の current facts 追加                                                       |
| 再利用ルール       | `references/lessons-learned-skill-create-multi-select-kind.md`                  | `selectedOptionIds` 暫定対応の記録追加                                                     |

---

### UT-P0-06-PHASE11-EVIDENCE-001: Phase 11 手動テストエビデンスの保管・整理

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| 未タスクID | UT-P0-06-PHASE11-EVIDENCE-001                                                                          |
| 検出Phase  | Phase 11（手動テスト）                                                                                 |
| ステータス | 計画済み（Electron 環境準備後に実施）                                                                  |
| 優先度     | 低（機能テストは自動テストでカバー済み）                                                               |
| 内容       | Phase 11 手動テストエビデンス（スクリーンショット・メタデータ）の保管・整理                            |
| 対応方針   | Electron アプリのデバッグモード起動後に、`screenshot-plan.json` に従ってスクリーンショットを取得・保管 |
| 担当候補   | P0-06 PR マージ後、またはデスクトップアプリの統合テスト実施時に対応                                    |

---

## 2. RT-04 関連の確認事項

| 項目     | 内容                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- |
| 対象     | RT-04（Anthropic API キー設定・検証 UI）                                                              |
| 関連箇所 | `SkillCreatorConversationPanel.tsx` の `handleOpenApiKeySettings` → `configureApi()` IPC 呼び出し     |
| 現状     | `configureApi` / `onApiConfigured` は session API 経由で接続済み。画面遷移や検証 UI は RT-04 側に依存 |
| 影響     | 統合環境での画面遷移・設定完了フローの動作確認が未実施                                                |
| 対応方針 | RT-04 完了後に Electron 実機で遷移・設定完了イベントの挙動を確認                                      |

---

## 3. RT-05 関連の未完了事項

| 項目          | 内容                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| 対象          | RT-05（SDK Message Contract Normalization）                                    |
| 関連箇所      | `ConversationalInterview.tsx` の `multi_select` undo 復元処理                  |
| 現状          | `selectedOptionIds ?? selectedValues` フォールバックで暫定対応中               |
| TODO コメント | `// TODO(RT-05): RT-05完了後に selectedOptionIds canonical化`                  |
| 影響          | RT-05 完了後に `selectedOptionIds` を canonical 値として使用するよう更新が必要 |
| 対応方針      | RT-05 マージ後に `ConversationalInterview.tsx` と対応テストを更新する          |

---

## 4. GitHub Issue 紐付け判断

| 未タスクID                    | Issue 紐付け | 理由                                                                         |
| ----------------------------- | ------------ | ---------------------------------------------------------------------------- |
| UT-P0-06-CANONICAL-SYNC-001   | 不要         | RT-05 完了後の canonical 同期タスクとして起票予定。現時点で単独 Issue は不要 |
| UT-P0-06-PHASE11-EVIDENCE-001 | 不要         | 自動テストで機能カバー済み。エビデンス取得は追加作業であり緊急性なし         |
| RT-04 画面遷移/検証 UI 確認   | 既存         | RT-04 の Issue (#1910) で追跡中                                              |
| RT-05 canonical 化            | 既存         | RT-05 の Issue (#1922) で追跡中                                              |
