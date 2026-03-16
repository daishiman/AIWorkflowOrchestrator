# Phase 12 Task 12-4: 未タスク検出レポート

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-005  |
| Phase    | 12         |
| 作成日   | 2026-03-16 |
| 検出件数 | 3件        |

## Phase 10 MINOR 指摘の追跡

Phase 10 最終レビューで MINOR 指摘は **0件** であった。未タスク化対象なし。

## SF-03 設計タスク特有パターンチェック

| パターン                | チェック結果 | 候補 |
| ----------------------- | ------------ | ---- |
| 型定義 → 実装           | 該当なし     | -    |
| 契約 → テスト           | 該当なし     | -    |
| UI仕様 → コンポーネント | 該当なし     | -    |
| 仕様書間差異 → 設計決定 | 該当なし     | -    |

SF-03 パターン確認済み、0件。

## 実装過程の未解決課題

本タスクのスコープ外として識別した GAP が 3件あり、後続タスクとして管理する。

### 確認事項

1. **abort 4ステップフロー**: 全ステップ実装済み、23テストで検証済み
2. **skip フロー**: SkillPermissionResponse に `skip?: boolean` 追加済み
3. **retry フロー**: PERMISSION_MAX_RETRIES=3、retryCounters Map で管理済み
4. **timeout フロー**: PermissionResolver の DEFAULT_TIMEOUT_MS=300000 を使用
5. **冪等性**: abortedExecutions Set で二重 abort 防止済み
6. **fail-closed**: 各 abort ステップを個別 try-catch で保護済み

## スコープ外 GAP の未タスク化（3件）

| GAP       | 内容                                                                                               | タスクID    | 優先度 | 指示書パス                                                                        |
| --------- | -------------------------------------------------------------------------------------------------- | ----------- | ------ | --------------------------------------------------------------------------------- |
| GAP-02/03 | PreToolUse Hook への processPermissionFallback 統合 / sendPermissionRequest timeout→abort 遷移実装 | UT-06-005-A | 高     | `docs/30-workflows/unassigned-task/task-ut-06-005-a-hook-fallback-integration.md` |
| GAP-04    | revokeSessionEntries のセッション別本格実装（AllowedToolEntry に sessionId 追加）                  | UT-06-005-B | 中     | `docs/30-workflows/unassigned-task/task-ut-06-005-b-session-revoke-impl.md`       |
| GAP-06    | SkillStreamMessageType に abort/skip type 追加（GAP-01 shared 型不整合も同時解消）                 | UT-06-005-C | 中     | `docs/30-workflows/unassigned-task/task-ut-06-005-c-stream-type-abort-skip.md`    |

### GAP の詳細説明

**GAP-02: PreToolUse Hook への processPermissionFallback 統合**
実装した `processPermissionFallback`/`executeAbortFlow`/`executeSkipFlow` はテストからのみ呼ばれており、実際の PreToolUse Hook（L1126-1184）との接続が未完了。実行時フローへの統合は UT-06-005-A として管理する。

**GAP-03: sendPermissionRequest の timeout→abort 遷移実装**
`sendPermissionRequest`（L1480-1516）が timeout した際に `executeAbortFlow("timeout")` を自動呼び出しする仕組みが未実装。UT-06-005-A と同一タスクで対応する。

**GAP-04: revokeSessionEntries のセッション別本格実装**
現在の `revokeSessionEntries` は全エントリクリアのスタブ実装。`AllowedToolEntry` に `sessionId` フィールドを追加してセッション別フィルタリングを実装する必要がある。UT-06-005-B として管理する。

**GAP-06: SkillStreamMessageType に abort/skip type 追加**
abort は `type:"error"`、skip は `type:"tool_use"` で送信されており Renderer 側で区別不能。`SkillStreamMessageType` に `"abort"` | `"skip"` を追加する必要がある。また GAP-01（shared 型と SkillExecutor ローカル型の `sendStream` 型不整合）も同時解消する。UT-06-005-C として管理する。

## 既存未タスクのステータス更新

| タスクID  | 内容                           | 現ステータス | 更新後ステータス     |
| --------- | ------------------------------ | ------------ | -------------------- |
| UT-06-005 | abort/skip/retry fallback 実装 | unassigned   | 実装完了（本タスク） |

## 結論

検出された未タスク: **3件**（UT-06-005-A, UT-06-005-B, UT-06-005-C）
Phase 10 MINOR 未タスク化: **0件**
SF-03 パターン検出: **0件**

P3/P38/P58 対策: 3ステップ全完了

1. 指示書作成: `docs/30-workflows/unassigned-task/task-ut-06-005-a/b/c-*.md` 作成済み
2. task-workflow-backlog.md 残課題テーブルへの登録: 完了
3. 関連仕様書リンク追加: 本レポートに GAP 詳細と指示書パスを記録
