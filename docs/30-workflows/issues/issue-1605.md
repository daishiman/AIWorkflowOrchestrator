# [#1605] "[UT-HEALTH-POLICY-MAINLINE-MIGRATION-001] 未タスク仕様書: UT"

## メタ情報

```yaml
task_id: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
task_name: 未タスク仕様書: UT
category: -
target_feature: -
priority: HIGH
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-MAINLINE-MIGRATION-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | HIGH       |
| 規模       | -          |
| ステータス | unassigned |

---

## 背景・目的

`apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` の L117-120 では、`apiKeyDegraded` フラグを独自ロジックで算出している。

この実装は TASK-IMP-HEALTH-POLICY-UNIFICATION-001 で導入された `resolveHealthPolicy()` / `buildMainlineExecutionAccessState()` の統一ポリシー機構を経由しておらず、HealthPolicy の判定が二重管理になっている。

本タスクでは、独自算出ロジックを削除し、`resolveHealthPolicy()` で生成した `HealthPolicy` を `buildMainlineExecutionAccessState()` に渡す形に統一することで、ポリシー判定の一元化を完成させる。

## 対象ファイル

| ファイルパス                                                    | 変更種別 |
| --------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` | 変更     |

## 変更内容

### 手順 1: `resolveHealthPolicy` を import する

`@repo/shared/types` の barrel export 経由で `resolveHealthPolicy` を import する。

```typescript
import { resolveHealthPolicy } from "@repo/shared/types";
```

> 注意: `@repo/shared/types/health-policy` という直接パスは barrel export の設定によりモノレポ内で解決できない場合がある。必ず `@repo/shared/types` 経由でインポートすること（苦戦箇所参照）。

### 手順 2: `resolveHealthPolicy()` を呼び出して `HealthPolicy` を生成する

`useMainlineExecutionAccess` フック内で、既存の状態変数（プロバイダー情報・APIキー状態など）を引数として `resolveHealthPolicy()` を呼び出し、`healthPolicy` を取得する。

```typescript
const healthPolicy = resolveHealthPolicy(/* 既存の状態変数を引数に渡す */);
```

### 手順 3: `buildMainlineExecutionAccessState()` の引数に `healthPolicy` を渡す

`buildMainlineExecutionAccessState()` の呼び出し箇所を修正し、生成した `healthPolicy` を引数として渡す。

```typescript
const accessState = buildMainlineExecutionAccessState(
  healthPolicy /* その他の引数 */,
);
```

### 手順 4: 独自算出ロジック（L117-120）を削除する

`apiKeyDegraded` を独自に計算していた L117-120 のコードブロックを削除する。`healthPolicy` への移行により、当該ロジックは不要になる。

## 受入基準

| ID   | 条件                                                                                          | 検証方法                           |
| ---- | --------------------------------------------------------------------------------------------- | ---------------------------------- |
| AC-1 | `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている                  | コードレビュー                     |
| AC-2 | `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている                        | コードレビュー                     |
| AC-3 | L117-120 の `apiKeyDegraded` 独自算出ロジックが削除されている                                 | コードレビュー / `git diff`        |
| AC-4 | `@repo/shared/types/health-policy` 直接パスは使用せず、barrel export 経由でインポートしている | コードレビュー                     |
| AC-5 | 既存のユニットテストがすべて PASS する                                                        | `pnpm --filter @repo/desktop test` |
| AC-6 | TypeScript の型チェックがエラーなく通過する                                                   | `pnpm typecheck`                   |

## 苦戦箇所（ナレッジ）

### モノレポの import パス解決

`@repo/shared/types/health-policy` というサブパス指定は、`@repo/shared` の `package.json` の `exports` フィールド設定によってはモノレポ内で解決できない場合がある。

この場合、barrel export（`@repo/shared/types` の index ファイル）経由でのインポートに切り替えることで解決する。

```typescript
// NG: サブパス直接指定（解決できない場合がある）
import { resolveHealthPolicy } from "@repo/shared/types/health-policy";

// OK: barrel export 経由
import { resolveHealthPolicy } from "@repo/shared/types";
```

## 依存関係

- 前提: TASK-IMP-HEALTH-POLICY-UNIFICATION-001 完了（`resolveHealthPolicy()` および `buildMainlineExecutionAccessState()` の実装が存在すること）
- 関連: UT-HEALTH-POLICY-RUNTIME-INJECTION-001
