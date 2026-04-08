# Phase 1: 要件定義 - UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## メタ情報

| 項目       | 値                                           |
| ---------- | -------------------------------------------- |
| Phase      | 1                                            |
| タスクID   | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001      |
| 機能名     | useMainlineExecutionAccess healthPolicy 移行 |
| タスク分類 | 非UIタスク（NON_VISUAL）                     |
| 作成日     | 2026-04-07                                   |

## 目的

`useMainlineExecutionAccess` フック内の独自 `apiKeyDegraded` 算出ロジックを削除し、統一 HealthPolicy 機構経由に移行するための要件を明文化し、受入基準（AC）を定義する。

---

## P50チェック: 既存コードの調査手順

Phase 1 実行時に以下のコマンドで現状を確認すること：

```bash
# 対象ファイルの現状確認
cat apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts | grep -n "apiKeyDegraded"

# L117-120 付近を確認
sed -n '110,130p' apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts

# buildMainlineExecutionAccessState の呼び出し箇所
grep -n "buildMainlineExecutionAccessState" apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts

# resolveHealthPolicy の現在のimport状況
grep -rn "resolveHealthPolicy" apps/desktop/src/renderer/hooks/

# @repo/shared/types の barrel export 確認
grep -n "resolveHealthPolicy" packages/shared/src/types/index.ts

# HealthPolicyInput 型定義確認
cat packages/shared/src/types/health-policy.ts

# 既存テストの確認
cat apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts
```

**調査観点**:

- `apiKeyDegraded` の算出に使用している状態変数（`credentials`, `selectedHealthStatus`）の型を確認する
- `buildMainlineExecutionAccessState()` のシグネチャを確認し、`healthPolicy` パラメータの位置・型を把握する
- 既存テストがモックしている関数・状態を把握する（移行後も維持すべき）

---

## HealthPolicyInput への状態変数マッピング定義

### 現在の状態変数

| 変数名                         | 型                    | 使用箇所（L117-120）                                          |
| ------------------------------ | --------------------- | ------------------------------------------------------------- |
| `credentials.apiKeyValid`      | `boolean`             | `apiKeyDegraded` 算出の条件（APIキーが有効であること）        |
| `selectedHealthStatus?.status` | `string \| undefined` | `"disconnected"` / `"error"` の場合に `apiKeyDegraded = true` |

### HealthPolicyInput へのマッピング

```typescript
// 移行前（L117-120 の独自ロジック）
const apiKeyDegraded =
  credentials.apiKeyValid &&
  (selectedHealthStatus?.status === "disconnected" ||
    selectedHealthStatus?.status === "error");

// 移行後（resolveHealthPolicy 経由）
const healthPolicyInput: HealthPolicyInput = {
  connectionStatus: selectedHealthStatus?.status ?? "disconnected",
  isApiKeyValid: credentials.apiKeyValid,
  apiKeyDegraded: false, // resolveHealthPolicy に委譲するため初期値
  isRateLimited: false, // レートリミット情報がある場合は適切な値を設定
  lastHealthCheck: selectedHealthStatus ?? null,
};
const healthPolicy = resolveHealthPolicy(healthPolicyInput);
```

### 型マッピング詳細

| HealthPolicyInput フィールド | マッピング元                         | 変換方法                                                                                     |
| ---------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `connectionStatus`           | `selectedHealthStatus?.status`       | `?? "disconnected"` でフォールバック。型は `"connected" \| "disconnected" \| "error"` に絞る |
| `isApiKeyValid`              | `credentials.apiKeyValid`            | そのまま渡す（型一致）                                                                       |
| `apiKeyDegraded`             | （削除される独自ロジックから移行）   | `false` を渡す（resolveHealthPolicy 内部で算出される）                                       |
| `isRateLimited`              | （既存ロジックに対応する変数を調査） | Phase 1 調査で確認する。なければ `false`                                                     |
| `lastHealthCheck`            | `selectedHealthStatus`               | `HealthCheckResult \| null` に変換                                                           |

> **注意**: `connectionStatus` の型キャストが必要な場合は Phase 2 設計で型安全な変換を定義する。

---

## 機能要件 (FR)

### FR-01: resolveHealthPolicy の呼び出し追加

`useMainlineExecutionAccess` フック内で `resolveHealthPolicy()` を呼び出し、`HealthPolicy` オブジェクトを生成すること。

- インポートは `@repo/shared/types` の barrel export 経由とすること
- サブパス直接指定（例：`@repo/shared/types/health-policy`）は禁止
- 呼び出しは既存の `buildMainlineExecutionAccessState()` の直前に配置すること

### FR-02: buildMainlineExecutionAccessState への healthPolicy 引き渡し

`buildMainlineExecutionAccessState()` の呼び出し引数に `healthPolicy` を追加すること。

- `healthPolicy` はオプション引数として既に型定義に存在している
- 既存の他の引数は変更しないこと

### FR-03: 独自 apiKeyDegraded ロジックの削除

L117-120 の独自算出ロジックを完全に削除すること。

- `const apiKeyDegraded = ...` の4行を削除する
- `apiKeyDegraded` 変数への参照が `buildMainlineExecutionAccessState()` 引数に残っている場合は合わせて削除する

---

## 非機能要件 (NFR)

### NFR-01: 型安全性

- `HealthPolicyInput` の全フィールドに対して型安全な値を渡すこと
- 型キャストを使用する場合は `as` ではなく型ガード関数を使用すること
- `pnpm typecheck` が PASS すること

### NFR-02: 後方互換性

- 既存のテストケースが全て PASS すること（テストの削除・スキップは禁止）
- 既存の `buildMainlineExecutionAccessState()` の呼び出しセマンティクスを変えないこと

### NFR-03: インポート規則

- `resolveHealthPolicy` は `@repo/shared/types` からインポートすること
- プロジェクト全体のインポートパターンと統一すること

---

## 受入基準 (AC) の詳細定義と検証方法

| AC   | 内容                                                                         | 検証方法                                                                                               |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| AC-1 | `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている | `grep "resolveHealthPolicy" apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` で存在確認  |
| AC-2 | `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている       | 関数呼び出し箇所で `healthPolicy` キーが引数に含まれていることを確認                                   |
| AC-3 | L117-120 の `apiKeyDegraded` 独自算出ロジックが削除されている                | `grep "apiKeyDegraded" apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` が0件になること  |
| AC-4 | `@repo/shared/types` 経由でインポートしている                                | `grep "from.*@repo/shared/types" apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` で確認 |
| AC-5 | 既存のユニットテストがすべて PASS する                                       | `pnpm --filter @repo/desktop test` が全 PASS                                                           |
| AC-6 | TypeScript の型チェックがエラーなく通過する                                  | `pnpm typecheck` が PASS（エラー0件）                                                                  |

---

## 命名規則の確認

Phase 1 実行時に、プロジェクト既存のインポートパターンを確認すること：

```bash
# @repo/shared/types からの既存インポートパターン
grep -rn "from \"@repo/shared/types\"" apps/desktop/src/renderer/hooks/

# resolveHealthPolicy の既存利用例（他ファイル）
grep -rn "resolveHealthPolicy" apps/desktop/src/
grep -rn "resolveHealthPolicy" packages/
```

**確認観点**:

- インポート文のスタイル（named import / default import）
- シングルクォートかダブルクォートか
- import文の並び順ルール（外部→内部、アルファベット順等）

---

## スコープ

### 含む

- `useMainlineExecutionAccess.ts` の以下の変更：
  - `resolveHealthPolicy` のインポート追加
  - `resolveHealthPolicy()` の呼び出し追加
  - `buildMainlineExecutionAccessState()` への `healthPolicy` 引き渡し
  - L117-120 の独自算出ロジック削除
- ユニットテストへの TC-01〜TC-05 追加

### 含まない

- `resolveHealthPolicy()` の実装変更（実装済み）
- `buildMainlineExecutionAccessState()` の実装変更（実装済み）
- 他の Hook や Component への同様の移行（別タスク）
- E2E テストの追加

---

## 成果物

| 成果物                           | パス                                         | 説明                         |
| -------------------------------- | -------------------------------------------- | ---------------------------- |
| 要件定義書（本ファイル）         | `phase-1-requirements.md`                    | FR/NFR/AC 定義               |
| 状態変数マッピング定義           | `outputs/phase-1/requirements-definition.md` | 調査結果・最終マッピング定義 |
| HealthPolicyInput マッピング詳細 | `outputs/phase-1/state-mapping.md`           | 型変換ルール詳細             |

---

## 完了条件

- [ ] 既存コードの調査コマンドを全て実行し、結果を `outputs/phase-1/requirements-definition.md` に記録した
- [ ] `HealthPolicyInput` への状態変数マッピングが確定し、`outputs/phase-1/state-mapping.md` に記録した
- [ ] AC-1〜AC-6 の検証方法が定義されている
- [ ] 命名規則（インポートパターン）が確認されている

## 次の Phase

Phase 2（設計）へ進む。`outputs/phase-1/state-mapping.md` の内容を Phase 2 の設計インプットとする。
