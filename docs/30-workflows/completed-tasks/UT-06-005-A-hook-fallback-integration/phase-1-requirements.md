# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 1                                     |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## 目的

PreToolUse Hook フォールバック統合の要件を抽出し、受け入れ基準を定義する。UT-06-005 で実装済みの `processPermissionFallback` / `executeAbortFlow` / `executeSkipFlow` を PreToolUse Hook 実行フローに接続するための詳細要件を明文化する。

## 実行タスク

- 要件抽出: UT-06-005 の実装済みメソッドと PreToolUse Hook の接続ポイントを特定し、機能要件・非機能要件を抽出する
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義する
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定する

## 参照資料

| 資料名                        | パス                                                                                         | 説明                                |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------- |
| タスク指示書（completed）     | `docs/30-workflows/completed-tasks/task-ut-06-005-a-hook-fallback-integration.md`            | 元タスク指示書（移行先）            |
| Permission フォールバック仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | Permission フォールバックフロー詳細 |
| セキュリティ要件              | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed セキュリティ要件        |
| UT-06-005 成果物              | `docs/30-workflows/completed-tasks/task-ut-06-005-a-hook-fallback-integration.md`            | 親タスクの移行先成果物              |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                            | パス                                                                                         | 内容                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Permission フォールバックフロー詳細 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry の分岐ロジックと型定義 |
| fail-closed セキュリティ要件        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | フォールバック失敗時の安全側倒し原則    |
| IPC ハンドラ登録                    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                 | SkillExecutor の IPC 統合ポイント       |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/main/services/skill/SkillExecutor.ts

# PreToolUse Hook の現在の実装を確認
grep -n "PreToolUse\|processPermissionFallback\|sendPermissionRequest" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts
```

| 判定     | 条件                                                          | 対応                                       |
| -------- | ------------------------------------------------------------- | ------------------------------------------ |
| 未実装   | PreToolUse Hook 内に processPermissionFallback 呼び出しなし   | Phase 4-5 で通常実装                       |
| 部分実装 | 接続コードはあるが不完全                                      | Phase 4-5 で不足分を補完                   |
| 実装済み | PreToolUse Hook から processPermissionFallback が呼ばれている | Phase 4-5 を「検証・補完」モードに切り替え |

### ステップ1: 統合ポイント分析

`SkillExecutor.ts` の PreToolUse Hook（L1127-L1185）の処理フローを分析する:

1. 現在の PreToolUse Hook のフロー:
   - L1133-1150: 危険コマンドチェック（FR-001）
   - L1153-1170: 保護パスチェック（FR-002）
   - L1173-1182: ツール実行開始通知（FR-003）
   - L1184: `{ proceed: true }` を返す

2. 統合が必要な箇所:
   - FR-003 の後、`{ proceed: true }` の前に Permission チェックフローを挿入する
   - `sendPermissionRequest` を呼び出し、拒否時に `processPermissionFallback` を実行する

### ステップ2: sendPermissionRequest の分析

`sendPermissionRequest`（L1481-L1517）の戻り値と型定義を分析する:

- 戻り値: `Promise<SkillPermissionResponse>`
- `SkillPermissionResponse` には `approved: boolean`, `requestId: string`, `rememberChoice?: boolean`, `skip?: boolean` フィールドがある
- 現在タイムアウト機構はない（`permissionResolver.waitForResponse` に委譲しているのみ）

### ステップ3: 機能要件の定義

| FR-ID  | 要件                                                                                                                    | 優先度 |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-101 | PreToolUse Hook で Permission 拒否時に `processPermissionFallback` が呼ばれること                                       | 必須   |
| FR-102 | `sendPermissionRequest` のタイムアウト（`DEFAULT_TIMEOUT_MS=30000ms`）時に `executeAbortFlow("timeout")` が呼ばれること | 必須   |
| FR-103 | retry フォールバック（`retryCount < maxRetries`）時に `sendPermissionRequest` が再発行されること（最大3回）             | 必須   |
| FR-104 | skip フォールバック時にツール実行がスキップされ、後続処理が継続すること                                                 | 必須   |
| FR-105 | abort フォールバック時にスキル実行が安全に停止すること                                                                  | 必須   |
| FR-106 | max_retries 到達（`retryCount >= maxRetries`）時に `executeAbortFlow("max_retries")` が呼ばれること                     | 必須   |

### ステップ4: 非機能要件の定義

| NFR-ID  | 要件                                                                    | 優先度 |
| ------- | ----------------------------------------------------------------------- | ------ |
| NFR-101 | フォールバック処理自体の例外は fail-closed（abort）に倒すこと           | 必須   |
| NFR-102 | タイムアウト値は `DEFAULT_TIMEOUT_MS=30000ms`（30秒）で初期化されること | 必須   |
| NFR-103 | abort フローは冪等であること（二重 abort でエラー非発生）               | 必須   |
| NFR-104 | 既存テスト 275+ ケースが全 PASS 維持されること                          | 必須   |
| NFR-105 | 既存の FR-001〜FR-003 の動作に影響を与えないこと                        | 必須   |

### ステップ5: 受け入れ基準の定義

| AC-ID  | 受け入れ基準                                                  | 検証方法                                      |
| ------ | ------------------------------------------------------------- | --------------------------------------------- |
| AC-001 | Permission 拒否時に `processPermissionFallback` が1回呼ばれる | ユニットテスト: モック検証                    |
| AC-002 | timeout 発生時に `executeAbortFlow("timeout")` が呼ばれる     | ユニットテスト: タイマー制御                  |
| AC-003 | retry 時に `sendPermissionRequest` が再度呼ばれる（最大3回）  | ユニットテスト: 呼び出し回数検証              |
| AC-004 | skip 時に `{ proceed: false, message: "..." }` が返される     | ユニットテスト: 戻り値検証                    |
| AC-005 | abort 時にスキル実行が停止し、エラーがスローされる            | ユニットテスト: 例外検証                      |
| AC-006 | フォールバック処理の例外時に abort に遷移する（fail-closed）  | ユニットテスト: 例外注入テスト                |
| AC-007 | 既存テスト 275+ ケースが全 PASS である                        | `pnpm --filter @repo/desktop exec vitest run` |

## 統合テスト連携（Phase 1〜11は必須）

Phase 1 では統合テストの対象範囲を定義する:

- `SkillExecutor.ts` の PreToolUse Hook 統合テスト
- `sendPermissionRequest` のタイムアウトテスト
- 既存 `SkillExecutor.*.test.ts` の回帰テスト

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                       | 仕様参照先                                                          |
| -------------- | ------------------------------ | ------------------------------------------------------------------- |
| セキュリティ   | 認証・認可・入力検証が関係する | `aiworkflow-requirements: security-skill-execution.md`              |
| アーキテクチャ | 設計・構造変更の場合           | `aiworkflow-requirements: architecture-overview.md`                 |
| API設計        | API実装・変更の場合            | `aiworkflow-requirements: interfaces-agent-sdk-executor-details.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                    | 仕様参照先                                                          |
| -------------------- | --------------------------- | ------------------------------------------------------------------- |
| バックエンド（Main） | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-overview.md`                 |
| IPC通信              | Main-Renderer連携の場合     | `aiworkflow-requirements: interfaces-agent-sdk-executor-details.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. P50チェック（既実装状態の調査）
3. 統合ポイント分析
4. 機能要件・非機能要件の定義
5. 受け入れ基準の定義
6. 成果物の作成・配置
7. 完了条件の検証

## 成果物

| 成果物       | パス                                         | 説明                       |
| ------------ | -------------------------------------------- | -------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件       |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲の明確化           |

## 完了条件

- [ ] P50チェックで既実装状態を確認済み
- [ ] 統合ポイントが特定され、分岐条件が明文化されている
- [ ] FR-101〜FR-106 の機能要件が定義されている
- [ ] NFR-101〜NFR-105 の非機能要件が定義されている
- [ ] AC-001〜AC-007 の受け入れ基準が検証可能な形式で定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 1
```

## 次のPhase

Phase 2: 設計
