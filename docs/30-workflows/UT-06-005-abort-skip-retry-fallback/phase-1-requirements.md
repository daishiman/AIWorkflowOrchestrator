# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 1                                   |
| 機能名 | UT-06-005-abort-skip-retry-fallback |
| 作成日 | 2026-03-16                          |

## 目的

SkillExecutor の Permission 拒否時における abort/skip/retry/timeout の各フォールバックフローの要件を明文化し、検証可能な受け入れ基準を定義する。

## 実行タスク

- 要件抽出: ユーザー要求と既存実装から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各フロー（abort/skip/retry/timeout）に対する検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定
- P50チェック: 既存実装の調査を実施し、既実装部分を特定

## 参照資料

| 資料名               | パス                                                                                                                                            | 説明                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 未タスク指示書       | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/unassigned-task/task-ut-06-005-abort-skip-retry-fallback.md` | 元の未タスク指示書     |
| SkillExecutor        | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                                                                         | 対象実装ファイル       |
| PermissionResolver   | `apps/desktop/src/main/services/skill/PermissionResolver.ts`                                                                                    | 権限確認リクエスト管理 |
| PermissionStore      | `apps/desktop/src/main/services/skill/PermissionStore.ts`                                                                                       | 権限設定永続化ストア   |
| 既存permissionテスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`                                                               | 既存のpermissionテスト |
| 既存retryテスト      | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`                                                                    | 既存のretryテスト      |
| GitHub Issue         | [#1250](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1250)                                                                        | タスク起票Issue        |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                        | パス                                                                                         | 内容                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ（スキル実行）      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | スキル実行時のセキュリティ要件                                     |
| セキュリティ（スキルIPC）       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                    | スキルIPC通信セキュリティ                                          |
| Agent SDK Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`            | Agent SDK Skill関連の型定義                                        |
| エラーハンドリング              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラーカテゴリとリトライ方針                                       |
| エラーハンドリング（コア）      | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                   | エラーコード範囲（1000-5999）、ERR_2002 PERMISSION_DENIED          |
| エラーハンドリング（詳細）      | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| 実装パターン                    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | 実装パターン集                                                     |
| Agent SDK Executor（コア）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`    | ExecutionState列挙型、RetryConfig、SkillExecutionErrorCode、DI構成 |
| Agent SDK Executor（詳細）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver完全仕様、DEFAULT_TIMEOUT_MS=300000              |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# SkillExecutor の abort/skip/retry 関連コードを確認
grep -n "abort\|skip\|retry\|cancelAll\|revokeSession" apps/desktop/src/main/services/skill/SkillExecutor.ts

# PermissionResolver の cancelAll 実装を確認
grep -n "cancelAll\|abort\|cancel" apps/desktop/src/main/services/skill/PermissionResolver.ts

# PermissionStore の revoke 関連メソッドを確認
grep -n "revoke\|revokeSession\|revokeAll" apps/desktop/src/main/services/skill/PermissionStore.ts

# 既存テストの状況確認
grep -n "abort\|skip\|retry\|timeout" apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
grep -n "abort\|skip\|retry\|timeout" apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts
```

| 判定     | 条件                          | 対応                                   |
| -------- | ----------------------------- | -------------------------------------- |
| 未実装   | abort/skip/retry フロー未実装 | Phase 4-5 で新規実装                   |
| 部分実装 | 一部フローのみ実装済み        | Phase 4-5 を「補完」モードに切替       |
| 実装済み | 全フロー実装済み・テスト PASS | Phase 4-5 を「検証・補完」モードに切替 |

### ステップ1: 機能要件（FR）の抽出

以下の4つのフォールバックフローについて機能要件を定義する:

#### FR-1: abort フロー（Permission 拒否 → 安全停止）

| 項目      | 内容                                                           |
| --------- | -------------------------------------------------------------- |
| トリガー  | Permission リクエストが明示的に拒否された場合                  |
| 4ステップ | 1. `cancelAll()` - 全pending permissionリクエストをキャンセル  |
|           | 2. `revokeSessionEntries()` - セッション内の一時許可を取り消し |
|           | 3. `log` - abort イベントをログに記録                          |
|           | 4. `IPC` - Renderer に abort 通知を送信                        |
| 後続処理  | スキル実行を完全に停止。ExecutionState を `aborted` に遷移     |
| 冪等性    | 二重 abort でエラーにならないこと                              |

#### FR-2: skip フロー（Permission 拒否 → 後続継続）

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| トリガー | Permission レスポンスが `{ approved: false, skip: true }` |
| 動作     | 現在のツール実行をスキップし、次のツール実行に進む        |
| 後続処理 | スキル実行は継続。ExecutionState は `running` のまま      |
| ログ     | skip イベントをログに記録                                 |

#### FR-3: retry フロー（Permission 拒否 → リトライ → abort）

| 項目      | 内容                                             |
| --------- | ------------------------------------------------ |
| トリガー  | Permission リクエストが拒否され、skip でない場合 |
| 最大回数  | 3回                                              |
| 動作      | 同一 Permission リクエストを再送信               |
| 3回目失敗 | abort フロー（FR-1）に遷移                       |
| カウンタ  | リクエストIDごとに管理                           |

#### FR-4: timeout → abort 遷移

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| トリガー | Permission リクエストが 300000ms（5分）以内に応答なし    |
| 動作     | retry を経由せず直接 abort フロー（FR-1）に遷移          |
| 理由     | タイムアウトは回復不能な状態とみなし、即座に安全停止する |

### ステップ2: 非機能要件（NFR）の抽出

| ID    | カテゴリ       | 要件                                                     | 優先度 |
| ----- | -------------- | -------------------------------------------------------- | ------ |
| NFR-1 | セキュリティ   | fail-closed: 不明なエラー時は abort に遷移               | 高     |
| NFR-2 | パフォーマンス | abort 4ステップは 100ms 以内に完了                       | 中     |
| NFR-3 | 信頼性         | 冪等性: 同一リクエストへの二重 abort/skip でエラー非発生 | 高     |
| NFR-4 | 可観測性       | 全フロー遷移をログに記録（electron-log 使用）            | 中     |
| NFR-5 | テスト容易性   | DI パターンで全依存をモック可能に設計                    | 高     |

### ステップ3: 受け入れ基準の定義

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

## 統合テスト連携【必須】

Permission拒否フローの要件をabort/skip/retry/timeoutで明記し、SkillExecutor-PermissionResolver-PermissionStore間の統合ポイントを特定する。

| 統合ポイント                       | 確認内容                                    |
| ---------------------------------- | ------------------------------------------- |
| SkillExecutor → PermissionResolver | waitForResponse の abort/timeout 処理       |
| SkillExecutor → PermissionStore    | revokeSessionEntries の呼び出し契約         |
| SkillExecutor → IPC                | abort/skip 通知の Renderer への配信         |
| PermissionResolver → timeout       | 300000ms タイムアウト後の Promise rejection |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                                         |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------ |
| セキュリティ       | fail-closed 原則の適用が必要       | `aiworkflow-requirements: security-skill-execution.md`             |
| エラーハンドリング | abort/timeout のエラー分類が必要   | `aiworkflow-requirements: error-handling.md`                       |
| アーキテクチャ     | SkillExecutor の状態遷移設計が関係 | `aiworkflow-requirements: architecture-implementation-patterns.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                 | 仕様参照先                                               |
| -------------------- | ---------------------------------------- | -------------------------------------------------------- |
| バックエンド（Main） | abort/skip/retry/timeout ロジックの定義  | `aiworkflow-requirements: security-skill-execution.md`   |
| IPC通信              | abort/skip 通知の Renderer 配信要件      | `aiworkflow-requirements: security-skill-ipc.md`         |
| Preload Bridge       | IPC チャンネルの型安全性・ホワイトリスト | `aiworkflow-requirements: interfaces-agent-sdk-skill.md` |

## 成果物

| 成果物          | パス                                  | 説明                 |
| --------------- | ------------------------------------- | -------------------- |
| 要件定義書      | `outputs/phase-1/requirements.md`     | FR/NFR/受入基準      |
| P50チェック結果 | `outputs/phase-1/p50-check-result.md` | 既実装状態の調査結果 |

## 完了条件

- [ ] P50チェック（既実装状態の調査）が完了している
- [ ] 機能要件（FR-1〜FR-4）が定義されている
- [ ] 非機能要件（NFR-1〜NFR-5）が定義されている
- [ ] 受け入れ基準（AC-01〜AC-12）が定義されている
- [ ] 統合テストポイントが特定されている
- [ ] 既存テスト（permission, retry）の状態が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. P50チェック実施
2. 機能要件（FR）の抽出
3. 非機能要件（NFR）の抽出
4. 受け入れ基準の定義
5. 統合テスト連携ポイントの特定
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 1
```

## 次のPhase

Phase 2: 設計
