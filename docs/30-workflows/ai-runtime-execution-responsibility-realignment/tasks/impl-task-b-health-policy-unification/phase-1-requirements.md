# Phase 1: 要件定義

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 1                         |
| 機能名 | health-policy-unification |
| 作成日 | 2026-03-24                |

## 目的

`HealthPolicy` 統一のスコープ、受入基準、現行コードのインベントリを固定し、Phase 2 設計の前提を確立する。

## 実行タスク

- Task 1: 現行 health check 関連コード 37 ファイルのインベントリ作成
- Task 2: `HealthPolicy` インターフェース要件の確定
- Task 3: `HealthPolicyResolver` の入出力契約定義
- Task 4: 移行対象フラグ（`apiKeyDegraded`）の利用箇所確定
- Task 5: 受入基準（AC-1〜AC-7）の検証方法定義

## 参照資料

| 資料名                    | パス                                                                                           | 内容                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ |
| Central Policy 仕様       | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md` | Task02 の policy centralization 仕様 |
| 現行 execution-capability | `packages/shared/src/types/execution-capability.ts`                                            | `apiKeyDegraded` フラグの現行定義    |
| HealthCheckResult 型      | `packages/shared/src/types/llm/schemas/health.ts`                                              | 現行の HealthCheckResult Zod schema  |
| RuntimePolicyResolver     | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                              | 中央ポリシー resolver                |
| mainlineAccess            | `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts`                         | Renderer 側の health 消費            |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容                        |
| ---------------- | --------------------------------------------------------------------------------- | --------------------------- |
| API/IPC core     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`        | IPC envelope / handler 契約 |
| State management | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Renderer selector 境界      |

## 実行手順

### ステップ 0: P50 チェック（既実装状態の調査）

Phase 4 開始前に、対象ファイルの現在の実装状態を調査し、既に実装済みでないかを確認する。

| 判定     | 条件                                                                               | 対応                                                  |
| -------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 未実装   | `health-policy.ts` が存在しない                                                    | Phase 2 以降を通常実行                                |
| 部分実装 | `HealthPolicy` 型は存在するが `resolveHealthPolicy()` が未実装                     | 既存実装を確認し Phase 4 を「検証・補完」モードに切替 |
| 実装済み | `HealthPolicy` + `resolveHealthPolicy()` + RuntimePolicyResolver DI が全て実装済み | Phase 4-5 を「検証・補完」モードに切替（P50 準拠）    |

```bash
# HealthPolicy の現在の実装状態を確認
find packages/shared/src/types/ -name "health-policy*" -type f
grep -rn "HealthPolicy" packages/shared/src/ apps/desktop/src/ --include="*.ts" | head -10
```

### ステップ 1: 現行 health check 関連コードのインベントリ

以下のコマンドで全利用箇所を特定する:

```bash
grep -rn "HealthCheckResult\|healthCheck\|apiKeyDegraded\|isConnectionAvailable\|ConnectionStatus" \
  packages/shared/src/ apps/desktop/src/ \
  --include="*.ts" --include="*.tsx"
```

インベントリの記録先: `outputs/phase-1/health-inventory.md`

記録内容:

- ファイルパス
- 利用形態（型定義 / 型参照 / ロジック分岐 / UI 表示）
- 変更影響度（high / medium / low）
- HealthPolicy 統一での対応方針（統合 / 移行 / 非対象）

### ステップ 2: HealthPolicy インターフェース要件

```typescript
/**
 * 統一 HealthPolicy インターフェース
 *
 * 接続状態・API key 有効性・レート制限状態を一元管理する。
 * RuntimePolicyResolver と mainlineAccess が共通して消費する。
 */
export interface HealthPolicy {
  /** 接続が利用可能か（health check 成功 + timeout なし） */
  isConnectionAvailable: boolean;
  /** API key が有効だが品質低下しているか（degraded 状態） */
  isDegraded: boolean;
  /** レート制限中か */
  isRateLimited: boolean;
  /** 総合ヘルスステータス */
  healthStatus: HealthStatus;
  /** 最終チェック日時 */
  lastCheckedAt: Date | null;
  /** エラー詳細（unhealthy 時） */
  errorDetail?: string;
}

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";
```

### ステップ 3: HealthPolicyResolver 入出力契約

```typescript
export interface HealthPolicyInput {
  /** プロバイダーの接続状態 */
  connectionStatus: ConnectionStatus; // "connected" | "disconnected" | "error"
  /** API key の有効性 */
  isApiKeyValid: boolean;
  /** API key の degraded フラグ（既存互換） */
  apiKeyDegraded: boolean;
  /** レート制限状態 */
  isRateLimited: boolean;
  /** 最終ヘルスチェック結果 */
  lastHealthCheck: HealthCheckResult | null;
}

/**
 * HealthPolicyInput から HealthPolicy を導出する pure function
 */
export function resolveHealthPolicy(input: HealthPolicyInput): HealthPolicy;
```

導出ルール:

| 条件                                                | healthStatus | isConnectionAvailable | isDegraded |
| --------------------------------------------------- | ------------ | --------------------- | ---------- |
| connectionStatus === "connected" && !apiKeyDegraded | healthy      | true                  | false      |
| connectionStatus === "connected" && apiKeyDegraded  | degraded     | true                  | true       |
| connectionStatus === "disconnected"                 | unhealthy    | false                 | false      |
| connectionStatus === "error"                        | unhealthy    | false                 | false      |
| isRateLimited === true                              | degraded     | true                  | true       |
| lastHealthCheck === null                            | unknown      | false                 | false      |

### ステップ 4: apiKeyDegraded 利用箇所確定

現行の `apiKeyDegraded` フラグは以下の箇所で使用されている:

| ファイル                                                               | 利用形態     | 移行方針                                             |
| ---------------------------------------------------------------------- | ------------ | ---------------------------------------------------- |
| `packages/shared/src/types/execution-capability.ts`                    | 型定義       | `@deprecated` マーク、HealthPolicy.isDegraded へ移行 |
| `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts` | ロジック分岐 | HealthPolicy から isDegraded を取得                  |
| `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts`        | 値渡し       | HealthPolicy を DI で渡す形に変更                    |

### ステップ 5: AC-1〜AC-7 検証方法

| AC   | 検証方法                                                    | 自動/手動 |
| ---- | ----------------------------------------------------------- | --------- |
| AC-1 | `grep "HealthPolicy" packages/shared/src/types/` で存在確認 | 自動      |
| AC-2 | `resolveHealthPolicy` のユニットテスト（全導出ルール網羅）  | 自動      |
| AC-3 | `@deprecated` JSDoc タグの存在確認                          | 自動      |
| AC-4 | `RuntimePolicyResolver` のコンストラクタ引数型確認          | 自動      |
| AC-5 | `mainlineAccess.ts` の import 確認 + テスト                 | 自動      |
| AC-6 | `pnpm test` 全テスト PASS                                   | 自動      |
| AC-7 | `pnpm typecheck && pnpm lint` PASS                          | 自動      |

## 成果物

| 成果物              | パス                                            | 内容                              |
| ------------------- | ----------------------------------------------- | --------------------------------- |
| Health インベントリ | `outputs/phase-1/health-inventory.md`           | 37 ファイルの利用箇所と影響度     |
| HealthPolicy 要件   | `outputs/phase-1/health-policy-requirements.md` | インターフェース要件と導出ルール  |
| 移行対象一覧        | `outputs/phase-1/migration-targets.md`          | apiKeyDegraded 利用箇所と移行方針 |
| 要件定義書          | `outputs/phase-1/requirements-definition.md`    | AC-1〜AC-7 の検証方法             |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                                  | 確認方法                                                                     | 判定基準      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| 既存テスト（apiKeyDegraded 関連）への影響 | `pnpm --filter @repo/shared vitest run`                                      | 全テスト PASS |
| Task A（UiState）との型整合               | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 の CapabilityContext.isDegraded 消費 | 型定義が一致  |
| RuntimePolicyResolver 既存テスト          | `pnpm --filter @repo/desktop vitest run RuntimePolicyResolver`               | 全テスト PASS |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] health check 関連コードのインベントリが作成されている
- [ ] `HealthPolicy` インターフェースの要件が確定している
- [ ] `HealthPolicyResolver` の入出力契約が定義されている
- [ ] `apiKeyDegraded` の全利用箇所が特定され、移行方針が付与されている
- [ ] AC-1〜AC-7 の各検証方法が定義されている

## 次Phase

Phase 2: [phase-2-design.md](./phase-2-design.md)
