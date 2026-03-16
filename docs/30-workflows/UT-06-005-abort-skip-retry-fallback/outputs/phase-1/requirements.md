# Phase 1 成果物: 要件定義書

## メタ情報

| 項目    | 値                                  |
| ------- | ----------------------------------- |
| Phase   | 1                                   |
| 機能名  | UT-06-005-abort-skip-retry-fallback |
| 作成日  | 2026-03-16                          |
| P50判定 | 部分実装 → Phase 4-5 新規実装モード |

## 機能要件 (FR)

### FR-1: abort フロー（Permission 拒否 → 安全停止）

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| トリガー     | Permission リクエストが明示的に拒否された場合（`approved: false`, `skip` なし） |
| 4ステップ    | 1. `cancelAll()` - 全pending permissionリクエストをキャンセル                   |
|              | 2. `revokeSessionEntries(sessionId)` - セッション内一時許可を取消               |
|              | 3. `log` - abort イベントをログに記録（warn レベル）                            |
|              | 4. `IPC` - Renderer に abort 通知を送信（SKILL_ABORT チャンネル）               |
| 後続処理     | スキル実行完全停止。ExecutionState → `aborted`                                  |
| 冪等性       | 二重 abort でエラー非発生                                                       |
| エラーコード | ERR_2002 PERMISSION_DENIED (Business Error 2000-2999)                           |

### FR-2: skip フロー（Permission 拒否 → 後続継続）

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| トリガー | Permission レスポンスが `{ approved: false, skip: true }`          |
| 動作     | 現在のツール実行をスキップし、次のツール実行に進む                 |
| 後続処理 | スキル実行継続。ExecutionState は `running` のまま                 |
| ログ     | skip イベントを info レベルで記録                                  |
| 型変更   | `SkillPermissionResponse` に `skip?: boolean` フィールド追加が必要 |

### FR-3: retry フロー（Permission 拒否 → リトライ → abort）

| 項目      | 内容                                                       |
| --------- | ---------------------------------------------------------- |
| トリガー  | Permission 拒否（`approved: false`, `skip: false/未定義`） |
| 最大回数  | 3回（requestId ごとに管理）                                |
| 動作      | 同一 Permission リクエストを再送信                         |
| 3回目失敗 | abort フロー（FR-1）に遷移                                 |
| カウンタ  | `retryCounters: Map<string, number>` で管理                |

### FR-4: timeout → abort 遷移

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| トリガー     | PermissionResolver の timeout（300000ms = 5分）発火           |
| 動作         | retry を経由せず直接 abort フロー（FR-1）に遷移               |
| 理由         | タイムアウトは回復不能とみなし即座に安全停止                  |
| 接続         | PermissionResolver.waitForResponse() の timeout reject を捕捉 |
| エラーコード | TIMEOUT (External Service Error 3000-3999 相当)               |

## 非機能要件 (NFR)

| ID    | カテゴリ       | 要件                                                     | 優先度 |
| ----- | -------------- | -------------------------------------------------------- | ------ |
| NFR-1 | セキュリティ   | fail-closed: 不明なエラー時は abort に遷移               | 高     |
| NFR-2 | パフォーマンス | abort 4ステップは 100ms 以内に完了                       | 中     |
| NFR-3 | 信頼性         | 冪等性: 同一リクエストへの二重 abort/skip でエラー非発生 | 高     |
| NFR-4 | 可観測性       | 全フロー遷移をログに記録（electron-log 使用）            | 中     |
| NFR-5 | テスト容易性   | DI パターンで全依存をモック可能に設計                    | 高     |

## 受け入れ基準 (AC)

| AC-ID | 対象フロー | 受け入れ基準                                                                           |
| ----- | ---------- | -------------------------------------------------------------------------------------- |
| AC-01 | abort      | Permission 拒否時に cancelAll → revokeSessionEntries → log → IPC の順で実行される      |
| AC-02 | abort      | abort 後の ExecutionState が `aborted` である                                          |
| AC-03 | abort      | 二重 abort でエラーが発生しない（冪等性）                                              |
| AC-04 | skip       | `{ approved: false, skip: true }` で後続処理が継続する                                 |
| AC-05 | skip       | skip 後の ExecutionState が `running` のまま維持される                                 |
| AC-06 | retry      | Permission 拒否（skip でない）時にリトライが発生する                                   |
| AC-07 | retry      | リトライは最大3回で打ち切られる                                                        |
| AC-08 | retry      | 3回目の失敗で abort フローに遷移する                                                   |
| AC-09 | timeout    | 300000ms 経過後に retry を経由せず abort に遷移する                                    |
| AC-10 | timeout    | timeout abort 後の ExecutionState が `aborted` である                                  |
| AC-11 | 共通       | 全フロー遷移がログに記録されている                                                     |
| AC-12 | 共通       | 既存テスト（SkillExecutor.permission.test.ts, SkillExecutor.retry.test.ts）が全て PASS |

## 統合テスト連携ポイント

| 統合ポイント                       | 確認内容                                    | 関連コンポーネント     |
| ---------------------------------- | ------------------------------------------- | ---------------------- |
| SkillExecutor → PermissionResolver | waitForResponse の abort/timeout 処理       | cancelAll(), timeout   |
| SkillExecutor → PermissionStore    | revokeSessionEntries の呼び出し契約         | revokeSessionEntries() |
| SkillExecutor → IPC                | abort/skip 通知の Renderer への配信         | SKILL_ABORT チャンネル |
| PermissionResolver → timeout       | 300000ms タイムアウト後の Promise rejection | DEFAULT_TIMEOUT_MS     |

## P50チェック結論

詳細は `outputs/phase-1/p50-check-result.md` を参照。

- **判定**: 部分実装
- **基盤**: PermissionResolver (timeout/cancelAll)、SkillExecutor (基本abort)、IPC チャンネル定義済み
- **未実装**: 4ステップ abort フロー、skip フロー、Permission retry、timeout→abort 遷移、retryCounters、revokeSessionEntries()
- **型変更必要**: SkillPermissionResponse に `skip?: boolean` 追加
