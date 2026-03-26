# [#1608] "[UT-HEALTH-POLICY-HEALTHINDICATOR-TEST-001] 未タスク仕様書: UT"

## メタ情報

```yaml
task_id: UT-HEALTH-POLICY-HEALTHINDICATOR-TEST-001
task_name: 未タスク仕様書: UT
category: -
target_feature: -
priority: LOW
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-HEALTHINDICATOR-TEST-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | LOW        |
| 規模       | -          |
| ステータス | unassigned |

---

## 背景・目的

`apps/desktop/src/renderer/components/llm/HealthIndicator.tsx` に D-6 対応が実装済みである。具体的には以下の変更が加えられている。

- `HealthPolicy` 型の props（`healthPolicy?: HealthPolicy`）の追加
- `healthPolicyDisplayMap`（`HealthStatus` → 色・テキストのマッピング定数）の追加
- `getStatusDisplay()` 関数内への HealthPolicy 優先パス（既存の `HealthCheckResult` ベースの後方互換パスより先に評価）

しかし、これらの実装に対応するテストケースが `HealthIndicator.test.tsx` に追加されていない。既存テストは `HealthCheckResult` ベースの後方互換パスのみを検証しており、`HealthPolicy` 経由の表示ロジックがテストカバレッジから抜け落ちている。

本タスクの目的は、D-6 実装に対応するテストケースを追加し、`HealthPolicy` を渡した場合の全ケースが正しく動作することを自動検証可能にすることである。

## 対象ファイル

| ファイル                                                                      | 種別                       |
| ----------------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`                | 実装済み（変更不要）       |
| `apps/desktop/src/renderer/components/llm/__tests__/HealthIndicator.test.tsx` | 既存テストファイルへの追記 |

実装ファイルのパス（絶対）:

- `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`
- `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/apps/desktop/src/renderer/components/llm/__tests__/HealthIndicator.test.tsx`

## テスト観点

### 観点 1: HealthPolicy の4値で色・テキストが正しく表示される

`healthPolicyDisplayMap` の定義に従い、`healthPolicy.healthStatus` の各値が正しい色クラスとテキストに対応することを検証する。

| healthStatus | 期待する色クラス | 期待するテキスト |
| ------------ | ---------------- | ---------------- |
| `healthy`    | `bg-green-500`   | 接続良好         |
| `degraded`   | `bg-yellow-500`  | 品質低下         |
| `unhealthy`  | `bg-red-500`     | 接続不可         |
| `unknown`    | `bg-gray-400`    | 未確認           |

### 観点 2: HealthPolicy.errorDetail が設定されている場合のテキスト上書き

`healthPolicy.errorDetail` が存在する場合、`healthPolicyDisplayMap` のデフォルトテキストではなく `errorDetail` の値が表示テキストとして使用されることを検証する。

実装では `text: healthPolicy.errorDetail ?? display.text` として処理されている。

### 観点 3: HealthPolicy 未渡し時の後方互換動作

`healthPolicy` prop を渡さない場合、既存の `HealthCheckResult` ベースの表示ロジック（後方互換パス）が引き続き動作することを確認する。この観点は既存テストで一部カバーされているが、明示的に「HealthPolicy 未渡し」のケースとして記述することが望ましい。

### 観点 4: HealthPolicy と HealthCheckResult の両方渡し時に HealthPolicy が優先される

`healthPolicy` と `healthStatus`（`HealthCheckResult`）の両方が渡された場合、`HealthPolicy` の表示が優先されることを検証する。`getStatusDisplay()` の実装では `if (healthPolicy)` ブロックが `HealthCheckResult` の switch 分岐より先に評価されている。

### 観点 5: HealthPolicy 渡し時も aria-label が更新される

`healthPolicy` を使用した場合でも、インジケーター要素の `aria-label` が `Connection status: <text>` 形式で正しく設定されることを検証する。アクセシビリティ属性が後方互換パスと同様に機能することを保証する。

## 受入基準

1. 以下のテストケースがすべて PASS する:
   - `healthPolicy.healthStatus === "healthy"` のとき `bg-green-500` クラスが付与される
   - `healthPolicy.healthStatus === "degraded"` のとき `bg-yellow-500` クラスが付与される
   - `healthPolicy.healthStatus === "unhealthy"` のとき `bg-red-500` クラスが付与される
   - `healthPolicy.healthStatus === "unknown"` のとき `bg-gray-400` クラスが付与される
   - `healthPolicy.errorDetail` が設定されているとき aria-label に errorDetail のテキストが使われる
   - `healthPolicy` と `healthStatus` 両方渡し時に `healthPolicy` の色・テキストが優先される
   - `healthPolicy` を渡さない場合は既存の `HealthCheckResult` 表示が維持される

2. 追加したテストケースが既存テスト（UI-012〜UI-016、Disconnected、Accessibility）と共存し、すべて PASS する

3. テストコマンド `pnpm --filter @repo/desktop exec vitest run src/renderer/components/llm/__tests__/HealthIndicator.test.tsx` が 0 errors で終了する

## 苦戦箇所（ナレッジ）

### P39: happy-dom 環境での userEvent 非互換

既存の `HealthIndicator.test.tsx` には `userEvent.hover()` を使用したツールチップ検証テストが存在する（UI-012、UI-013、UI-014、UI-016 の一部）。これらは P39 の既知問題に該当する可能性がある。

**新規追加テストでは `userEvent` を使用しないこと。**

- ツールチップ表示の検証が必要な場合は `fireEvent.mouseEnter()` / `fireEvent.mouseLeave()` を使用する
- 非同期ハンドラを伴う場合は `await act(async () => { fireEvent.mouseEnter(el); })` で包む
- 色クラスの検証（`toHaveClass`）はホバー不要で確認できるため、優先的にこちらで観点 1 〜 4 を検証する

```typescript
// 非推奨（happy-dom で失敗する可能性あり）
await userEvent.hover(indicator);

// 推奨
fireEvent.mouseEnter(indicator);
// または
await act(async () => {
  fireEvent.mouseEnter(indicator);
});
```

### テスト実行ディレクトリ（P40 準拠）

テストは必ず `apps/desktop/` ディレクトリから実行すること。プロジェクトルートから実行すると `vitest.config.ts` の `environment` 設定（happy-dom）と `resolve.alias`（`@` エイリアス）が読み込まれず、`document is not defined` エラーが発生する。

```bash
# 正しい実行方法
cd apps/desktop
pnpm vitest run src/renderer/components/llm/__tests__/HealthIndicator.test.tsx

# または
pnpm --filter @repo/desktop exec vitest run src/renderer/components/llm/__tests__/HealthIndicator.test.tsx
```

### HealthPolicy 型のインポートパス

`HealthPolicy` および `HealthStatus` は `@repo/shared/types` からインポートする（`HealthIndicator.tsx` の実装と同じパス）。

```typescript
import type { HealthPolicy, HealthStatus } from "@repo/shared/types";
```

`HealthCheckResult` は `@repo/shared/types/llm` からインポートする（既存テストと同じパス）。

```typescript
import type { HealthCheckResult } from "@repo/shared/types/llm";
```

### テストデータの構築

`HealthPolicy` オブジェクトを構築する際は、必須フィールドをすべて含めること（`isConnectionAvailable`, `isDegraded`, `isRateLimited`, `healthStatus`, `lastCheckedAt`）。

```typescript
const healthyPolicy: HealthPolicy = {
  isConnectionAvailable: true,
  isDegraded: false,
  isRateLimited: false,
  healthStatus: "healthy",
  lastCheckedAt: new Date(),
};

const degradedPolicy: HealthPolicy = {
  isConnectionAvailable: true,
  isDegraded: true,
  isRateLimited: false,
  healthStatus: "degraded",
  lastCheckedAt: new Date(),
};

const unhealthyPolicy: HealthPolicy = {
  isConnectionAvailable: false,
  isDegraded: false,
  isRateLimited: false,
  healthStatus: "unhealthy",
  lastCheckedAt: new Date(),
  errorDetail: "接続に失敗しました",
};

const unknownPolicy: HealthPolicy = {
  isConnectionAvailable: false,
  isDegraded: false,
  isRateLimited: false,
  healthStatus: "unknown",
  lastCheckedAt: null,
};
```

## 依存関係

- 前提: TASK-IMP-HEALTH-POLICY-UNIFICATION-001 完了（D-6 実装済み）
- 関連型定義: `packages/shared/src/types/health-policy.ts`（`HealthPolicy`, `HealthStatus` の定義元）
- 関連実装: `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`（テスト対象コンポーネント）
- 既存テスト: `apps/desktop/src/renderer/components/llm/__tests__/HealthIndicator.test.tsx`（追記先）
