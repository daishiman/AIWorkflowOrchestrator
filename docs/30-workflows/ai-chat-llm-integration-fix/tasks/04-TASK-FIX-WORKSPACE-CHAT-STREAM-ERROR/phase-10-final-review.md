# Phase 10: 最終レビュー

## メタ情報

| 項目          | 値                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 10                                                                                                                         |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                                                                   |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                                                       |
| 作成日        | 2026-03-20                                                                                                                 |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-9-quality-assurance.md` |

## 目的

多角的な視点から実装の品質・整合性・安全性を最終確認する。Phase 1の受入基準AC-1〜AC-6に対して実装が完全に対応していることを検証し、Phase 11手動テストへの進行可否を判定する。

## 実行タスク

### Task 1: 受入基準のコードレベル確認

Phase 1で定義した受入基準が実装で満たされているかをコードを読んで確認する。

| 受入基準 | 確認内容                                          | 実装箇所                                                            | 判定   |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------- | ------ |
| AC-1     | API_KEY_MISSING時にSettings誘導ボタンが表示される | `mapLLMErrorToStreamingError` → action="SETTINGS"                   | 未確認 |
| AC-2     | NETWORK_ERROR時にリトライボタンが表示され動作する | `mapLLMErrorToStreamingError` → action="RETRY" + `retryLastMessage` | 未確認 |
| AC-3     | RATE_LIMIT時にヒント + リトライボタンが表示される | `hint` フィールド + action="RETRY"                                  | 未確認 |
| AC-4     | VALIDATION_ERROR時にメッセージのみ表示される      | action=null の分岐                                                  | 未確認 |
| AC-5     | エラー後にchat状態がリセットされる                | `onStreamError` 内の状態リセット                                    | 未確認 |
| AC-6     | エラーdismiss時にstreamingErrorがクリアされる     | `dismissStreamingError`                                             | 未確認 |

### Task 2: アーキテクチャ最終確認

| 確認項目         | 確認内容                                                                | 判定                     |
| ---------------- | ----------------------------------------------------------------------- | ------------------------ | ------ |
| レイヤー依存方向 | Renderer内完結。IPC層に変更なし                                         | 未確認                   |
| 後方互換性       | `errorMessage: string                                                   | null` が維持されているか | 未確認 |
| 型安全           | `any` 型・non-null assertion（`!`）が使用されていないか                 | 未確認                   |
| P31対策          | `useCallback` 依存配列に合成Hook参照なし                                | 未確認                   |
| P5対策           | リスナー二重登録がないか（既存パターン維持）                            | 未確認                   |
| DIP準拠          | `WorkspaceChatPanel` が具象実装ではなくインターフェースに依存しているか | 未確認                   |

### Task 3: Apple HIG最終確認

| 確認項目                | 設計値                                   | 実装値 | 判定   |
| ----------------------- | ---------------------------------------- | ------ | ------ |
| エラー色（ライト）      | `#FF3B30` (systemRed)                    | 未確認 | 未確認 |
| エラー色（ダーク）      | `#FF453A` (systemRed dark)               | 未確認 | 未確認 |
| アクション色（ライト）  | `#007AFF` (systemBlue)                   | 未確認 | 未確認 |
| アクション色（ダーク）  | `#0A84FF` (systemBlue dark)              | 未確認 | 未確認 |
| 角丸                    | `8px`                                    | 未確認 | 未確認 |
| `role="alert"` 付与     | `role="alert"` + `aria-live="assertive"` | 未確認 | 未確認 |
| Dismissボタンaria-label | `aria-label="エラーを閉じる"` 等         | 未確認 | 未確認 |

### Task 4: エッジケース確認

| エッジケース                               | 期待動作                               | 判定   |
| ------------------------------------------ | -------------------------------------- | ------ |
| ストリーム中にエラーが連続発火             | 二重設定されずに最新エラーが表示される | 未確認 |
| リトライ中に別エラーが発生                 | 新しいエラーに上書きされる             | 未確認 |
| エラーdismiss直後に別メッセージ送信        | 正常に送信できる                       | 未確認 |
| `lastUserMessageRef` が null の状態でretry | 何もせず安全に終了する                 | 未確認 |

### Task 5: MINOR指摘事項の管理

Phase 10でMINOR指摘が発生した場合は、全て未タスク化してから Phase 11 へ進む（省略不可）。

| 指摘内容                 | 重大度 | 対応方針 |
| ------------------------ | ------ | -------- |
| （Phase 10実行時に記録） | -      | -        |

### Task 6: レビュー判定

| 判定     | 条件                               | 対応                              |
| -------- | ---------------------------------- | --------------------------------- |
| PASS     | 全チェック項目が OK                | Phase 11 へ進む                   |
| MINOR    | 機能影響なしの軽微な問題           | 未タスク化後 Phase 11 へ進む      |
| MAJOR    | 設計・実装の修正が必要             | 影響範囲に応じて Phase 1-5 へ戻る |
| CRITICAL | セキュリティ問題・要件根本的不整合 | Phase 1 へ戻り要件再確認          |

**判定結果**: （Phase 10実行時に記録）

## 参照資料

| ドキュメント         | パス                                                                                                                       | 参照目的                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 受入基準     | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md`      | AC-1〜AC-6の確認        |
| Phase 2 設計書       | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-2-design.md`            | 設計との整合確認        |
| Phase 9 品質検証     | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-9-quality-assurance.md` | 品質検証結果確認        |
| タスク実行ルール     | `.claude/rules/05-task-execution.md`                                                                                       | MINOR指摘の未タスク化   |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                                                         | Apple HIG・レイヤー確認 |

## 実行手順

1. **Task 1**: 受入基準（AC-1〜AC-6）のコードレベル確認を実施し、テーブルを更新する
2. **Task 2**: アーキテクチャ最終確認を実施し、テーブルを更新する
3. **Task 3**: Apple HIG準拠を確認し、テーブルを更新する
4. **Task 4**: エッジケース確認を実施する
5. **Task 5**: MINOR指摘があれば未タスク化する（省略不可）
6. **Task 6**: 判定結果を記録する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                                     | パス                                                                                                                   | 形式       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| 最終レビュー結果（テーブル更新・判定記録） | 本ファイル Task 1-6 セクション                                                                                         | インライン |
| MINOR指摘の未タスク仕様書（発生した場合）  | `docs/30-workflows/unassigned-task/`                                                                                   | Markdown   |
| Phase 10 仕様書（本ファイル）              | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-10-final-review.md` | Markdown   |

## 完了条件

- [ ] Task 1: AC-1〜AC-6 全ての確認が完了し「OK」が記録済み
- [ ] Task 2: アーキテクチャ確認全項目が「OK」記録済み
- [ ] Task 3: Apple HIG確認全項目が「OK」記録済み
- [ ] Task 4: エッジケース確認全項目が「OK」記録済み
- [ ] Task 5: MINOR指摘が0件または全て未タスク化済み（省略不可）
- [ ] Task 6: 判定結果（PASS/MINOR/MAJOR/CRITICAL）を記録済み
- [ ] PASS または MINOR（未タスク化後）の場合のみ Phase 11 へ進む

## 次Phase

判定結果に応じて:

| 判定     | 次のアクション                |
| -------- | ----------------------------- |
| PASS     | Phase 11: 手動テスト          |
| MINOR    | 未タスク化後 Phase 11 へ      |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ |
| CRITICAL | Phase 1 へ戻る                |
