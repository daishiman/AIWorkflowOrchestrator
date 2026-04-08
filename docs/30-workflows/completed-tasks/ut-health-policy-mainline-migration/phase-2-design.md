# Phase 2: 設計 - UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| Phase    | 2                                            |
| タスクID | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001      |
| 機能名   | useMainlineExecutionAccess healthPolicy 移行 |
| 作成日   | 2026-04-07                                   |

## 目的

Phase 1 で確定した要件・状態変数マッピングに基づき、`useMainlineExecutionAccess.ts` の具体的な変更内容を設計する。新規実装ゼロ（既存 API の呼び出し追加のみ）であることを明示する。

---

## 参照資料

| 資料名             | パス                                         | 内容                                |
| ------------------ | -------------------------------------------- | ----------------------------------- |
| 要件定義           | `phase-1-requirements.md`                    | FR/NFR/AC 定義                      |
| 状態変数マッピング | `outputs/phase-1/state-mapping.md`           | HealthPolicyInput マッピング        |
| 型定義             | `packages/shared/src/types/health-policy.ts` | HealthPolicy / HealthPolicyInput 型 |

---

## 既存コンポーネント再利用可否

本タスクは**新規実装ゼロ**である。以下の既存 API をそのまま呼び出すだけで移行が完了する。

| 既存 API                                 | 提供元                           | 利用方法                          |
| ---------------------------------------- | -------------------------------- | --------------------------------- |
| `resolveHealthPolicy(input)`             | `@repo/shared/types`             | そのまま呼び出す                  |
| `buildMainlineExecutionAccessState(...)` | （同ファイル内 or 同パッケージ） | `healthPolicy` 引数を追加するだけ |

---

## 移行設計の詳細

### 変更対象ファイル

```
apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts
```

### 変更の全体像（4ステップ）

| ステップ | 操作                                                                 | 場所                   |
| -------- | -------------------------------------------------------------------- | ---------------------- |
| 1        | `resolveHealthPolicy` をインポートに追加                             | ファイル先頭 import 文 |
| 2        | `resolveHealthPolicy()` 呼び出しを追加                               | L117-120 の直前        |
| 3        | `buildMainlineExecutionAccessState()` の引数に `healthPolicy` を追加 | 既存呼び出し箇所       |
| 4        | L117-120 の独自 `apiKeyDegraded` 算出ロジックを削除                  | L117-120               |

---

### Step 1: インポート追加

**変更前**（例）:

```typescript
import { buildMainlineExecutionAccessState } from "@repo/shared/types";
```

**変更後**:

```typescript
import {
  buildMainlineExecutionAccessState,
  resolveHealthPolicy,
} from "@repo/shared/types";
```

> 既存の import 文のスタイル（シングル/ダブルクォート、named import の並び順）に合わせること。Phase 1 の命名規則確認結果に従う。

---

### Step 2: resolveHealthPolicy() 呼び出しの追加

L117-120 の独自ロジックを削除する**前**の箇所に、以下の呼び出しを追加する：

```typescript
// HealthPolicyInput を組み立てて resolveHealthPolicy で統一ポリシーを取得
const healthPolicy = resolveHealthPolicy({
  connectionStatus:
    (selectedHealthStatus?.status as "connected" | "disconnected" | "error") ??
    "disconnected",
  isApiKeyValid: credentials.apiKeyValid,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: selectedHealthStatus ?? null,
});
```

**設計判断**:

| 判断事項                        | 決定                                                 | 根拠                                                                                                                  |
| ------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `connectionStatus` の型キャスト | `as "connected" \| "disconnected" \| "error"` を使用 | `selectedHealthStatus?.status` は `string` 型の可能性があるため。Phase 1 調査で型が確定したら適切な型ガードに変更する |
| `apiKeyDegraded` の値           | `false` を渡す                                       | `resolveHealthPolicy` 内部で `isApiKeyValid` と `connectionStatus` から導出されるため                                 |
| `isRateLimited` の値            | `false` を渡す（Phase 1 調査結果次第）               | レートリミット情報が Hook 内に存在しない場合は `false`。存在する場合は Phase 1 調査結果に従う                         |
| `lastHealthCheck` の値          | `selectedHealthStatus ?? null`                       | `HealthCheckResult \| undefined` を `HealthCheckResult \| null` に変換                                                |

---

### Step 3: buildMainlineExecutionAccessState() への healthPolicy 追加

**変更前**（例）:

```typescript
const accessState = buildMainlineExecutionAccessState({
  credentials,
  selectedHealthStatus,
  apiKeyDegraded,
  // ... 他の引数
});
```

**変更後**:

```typescript
const accessState = buildMainlineExecutionAccessState({
  credentials,
  selectedHealthStatus,
  healthPolicy, // 追加
  // apiKeyDegraded は削除（healthPolicy 経由に移行）
  // ... 他の引数（変更なし）
});
```

> `buildMainlineExecutionAccessState()` の正確なシグネチャは Phase 1 調査で確認すること。引数がオブジェクト形式でない場合は実際の呼び出し形式に合わせて調整する。

---

### Step 4: 削除されるロジック（L117-120）

以下の4行を完全に削除する：

```typescript
// 削除対象（L117-120）
const apiKeyDegraded =
  credentials.apiKeyValid &&
  (selectedHealthStatus?.status === "disconnected" ||
    selectedHealthStatus?.status === "error");
```

削除後、`apiKeyDegraded` 変数への参照が他に残っていないことを確認すること：

```bash
grep -n "apiKeyDegraded" apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts
# → 0件になるべき
```

---

## 変更後のコード全体像（before/after サマリ）

### Before（変更前の概略）

```typescript
import { buildMainlineExecutionAccessState } from "@repo/shared/types";
// ...

// L117-120: 独自算出ロジック
const apiKeyDegraded =
  credentials.apiKeyValid &&
  (selectedHealthStatus?.status === "disconnected" ||
    selectedHealthStatus?.status === "error");

const accessState = buildMainlineExecutionAccessState({
  // ...
  apiKeyDegraded,
  // ...
});
```

### After（変更後の概略）

```typescript
import {
  buildMainlineExecutionAccessState,
  resolveHealthPolicy,
} from "@repo/shared/types";
// ...

// resolveHealthPolicy 経由で統一 HealthPolicy を取得
const healthPolicy = resolveHealthPolicy({
  connectionStatus:
    (selectedHealthStatus?.status as "connected" | "disconnected" | "error") ??
    "disconnected",
  isApiKeyValid: credentials.apiKeyValid,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: selectedHealthStatus ?? null,
});

const accessState = buildMainlineExecutionAccessState({
  // ...
  healthPolicy, // healthPolicy 経由に移行
  // apiKeyDegraded は削除
  // ...
});
```

---

## リスクと対策

| リスク                                                         | 影響度 | 対策                                                                                       |
| -------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `connectionStatus` の型キャストが不正な値を許容してしまう      | 中     | Phase 1 調査で `selectedHealthStatus?.status` の実際の型を確認し、型ガード関数に置き換える |
| `buildMainlineExecutionAccessState()` の引数形式が想定と異なる | 中     | Phase 1 調査で実際のシグネチャを確認し、設計を調整する                                     |
| `isRateLimited` が実際には Hook 内に存在する                   | 低     | Phase 1 調査で変数の有無を確認し、存在する場合は適切な値を渡す                             |
| 既存テストが `apiKeyDegraded` をモックしている                 | 中     | Phase 4 テスト作成時に既存テストの修正が必要な場合は合わせて対応する                       |

---

## 成果物

| 成果物               | パス                             | 説明         |
| -------------------- | -------------------------------- | ------------ |
| 設計書（本ファイル） | `phase-2-design.md`              | 移行設計詳細 |
| 設計詳細             | `outputs/phase-2/design-spec.md` | 最終設計仕様 |

---

## 完了条件

- [ ] 4ステップの変更内容が具体的なコード例として記載されている
- [ ] 削除されるロジック（L117-120）が明示されている
- [ ] 既存コンポーネント再利用のみで新規実装ゼロであることが確認されている
- [ ] リスクと対策が定義されている
- [ ] `outputs/phase-2/design-spec.md` に最終設計仕様が記録されている

## 次の Phase

Phase 3（設計レビューゲート）へ進む。レビュアーは本ファイルと `phase-1-requirements.md` を参照してレビューを実施する。
