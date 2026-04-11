# Phase 1: 要件定義 — UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## 実施日時

2026-04-08

## 目的

`useMainlineExecutionAccess` フック内の独自 `apiKeyDegraded` 算出ロジックを削除し、`resolveHealthPolicy()` / `buildMainlineExecutionAccessState()` を経由する形へ統一するための要件を定義する。

## 対象

- `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts`

## 要件サマリー

| 項目           | 内容                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| タスク分類     | NON_VISUAL / refactor                                                                                        |
| 変更対象       | 1 hook + 1 test file                                                                                         |
| 期待結果       | `healthPolicy` を生成して `buildMainlineExecutionAccessState()` に渡し、独自 `apiKeyDegraded` 算出を削除する |
| インポート規則 | `resolveHealthPolicy` は `@repo/shared/types` から import する                                               |

## 調査結果

| 観点                                           | 結果                                                            |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `selectedHealthStatus` の導出                  | `selectedProviderId` と `llmHealthStatus` から導出              |
| `buildMainlineExecutionAccessState()` の受け口 | `healthPolicy?: HealthPolicy` を受け取れる                      |
| `resolveHealthPolicy` の export                | `packages/shared/src/types/index.ts` から barrel export 済み    |
| `apiKeyDegraded` の扱い                        | hook 内の独自算出は削除対象、shared 側の型/関数では継続利用あり |

## HealthPolicyInput へのマッピング

| HealthPolicyInput フィールド | マッピング元                   | 変換方法                   |
| ---------------------------- | ------------------------------ | -------------------------- |
| `connectionStatus`           | `selectedHealthStatus?.status` | `?? "disconnected"` で補完 |
| `isApiKeyValid`              | `credentials.apiKeyValid`      | そのまま渡す               |
| `apiKeyDegraded`             | 独自算出ロジックの代替         | `false` を渡す             |
| `isRateLimited`              | hook 内に該当変数なし          | `false` を渡す             |
| `lastHealthCheck`            | `selectedHealthStatus`         | `?? null` で補完           |

## 受入基準

| AC   | 内容                                                                         | 確認方法                                                                                                      |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| AC-1 | `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている | hook で `resolveHealthPolicy` の import と呼び出しを確認                                                      |
| AC-2 | `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている       | hook の呼び出し引数を確認                                                                                     |
| AC-3 | `apiKeyDegraded` 独自算出ロジックが削除されている                            | hook 内の `const apiKeyDegraded = ...` が存在しないことを確認                                                 |
| AC-4 | `@repo/shared/types` 経由でインポートしている                                | import 文を確認                                                                                               |
| AC-5 | 既存ユニットテストが PASS する                                               | `pnpm --filter @repo/desktop exec vitest run src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts` |
| AC-6 | TypeScript 型チェックが PASS する                                            | `pnpm --filter @repo/shared typecheck` / `pnpm --filter @repo/desktop typecheck`                              |

## スコープ

### 含む

- `resolveHealthPolicy` の import 追加
- `resolveHealthPolicy()` の呼び出し追加
- `buildMainlineExecutionAccessState()` への `healthPolicy` 引き渡し
- `apiKeyDegraded` の独自算出削除
- フック用ユニットテストの更新

### 含まない

- `resolveHealthPolicy()` の実装変更
- `buildMainlineExecutionAccessState()` の実装変更
- UI 変更
- スクリーンショット取得

## 成果物

| 成果物             | パス                                         | 説明                               |
| ------------------ | -------------------------------------------- | ---------------------------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | 調査結果・要件定義                 |
| 状態変数マッピング | `outputs/phase-1/state-mapping.md`           | HealthPolicyInput の詳細マッピング |

## 結論

Phase 2 へ進行可能。`outputs/phase-1/state-mapping.md` のマッピングを設計インプットとして使用する。
