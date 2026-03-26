# [#1607] "[UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001] 未タスク仕様書: UT"

## メタ情報

```yaml
task_id: UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001
task_name: 未タスク仕様書: UT
category: -
target_feature: -
priority: MEDIUM
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | MEDIUM     |
| 規模       | -          |
| ステータス | unassigned |

---

## 背景・目的

`ExecutionCapabilityInput.apiKeyDegraded` および `MainlineExecutionAccessInput.apiKeyDegraded` は、HealthPolicy 統一化（TASK-IMP-HEALTH-POLICY-UNIFICATION-001）の一環として `@deprecated` マークが付与された。

これらのフィールドは `HealthPolicy.isDegraded` への移行を前提に残存しているが、実際の除去は実施されていない。v0.8.0 リリースに向けて deprecated フィールドを完全に除去し、全参照箇所を `HealthPolicy.isDegraded` 経由に統一することで、型定義の整合性を確保する。

## 対象ファイル

apiKeyDegraded が残存する 9 ファイル:

| #   | ファイルパス                                                                                        | 種別                               |
| --- | --------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | `packages/shared/src/types/execution-capability.ts`                                                 | 型定義（ExecutionCapabilityInput） |
| 2   | `packages/shared/src/types/health-policy.ts`                                                        | 型定義（HealthPolicyInput 内）     |
| 3   | `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts`                              | 実装                               |
| 4   | `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts`                                     | 実装（Hook）                       |
| 5   | `packages/shared/src/types/__tests__/health-policy.test.ts`                                         | テスト                             |
| 6   | `packages/shared/src/types/__tests__/execution-capability-regression.test.ts`                       | テスト                             |
| 7   | `packages/shared/src/types/__tests__/execution-capability-contract.test.ts`                         | テスト                             |
| 8   | `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.test.ts`                         | テスト                             |
| 9   | `apps/desktop/src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts` | テスト                             |

## 変更内容

### 1. ExecutionCapabilityInput から apiKeyDegraded を削除

`packages/shared/src/types/execution-capability.ts` にて、`@deprecated` が付与された `apiKeyDegraded` フィールドを型定義から完全に除去する。

### 2. MainlineExecutionAccessInput から apiKeyDegraded を削除

`packages/shared/src/types/health-policy.ts` の `HealthPolicyInput` または関連する `MainlineExecutionAccessInput` 内の `apiKeyDegraded` フィールドを除去する。

### 3. resolveCapability() の apiKeyDegraded 分岐を HealthPolicy.isDegraded 経由に変更

`mainlineAccess.ts` 内の `resolveCapability()` にて、`input.apiKeyDegraded` を参照している分岐を `HealthPolicy.isDegraded` を経由した評価ロジックに差し替える。

### 4. resolveHealthPolicy() の HealthPolicyInput.apiKeyDegraded を直接 isDegraded に変更

`resolveHealthPolicy()` にて `HealthPolicyInput.apiKeyDegraded` を受け取っている箇所を削除し、`isDegraded` を直接使用するように変更する。

### 5. 全テストファイルの apiKeyDegraded 参照を更新

上記 5 つのテストファイル（No.5〜9）について、`apiKeyDegraded` を使用しているすべての箇所を `isDegraded`（または対応する HealthPolicy 経由のアサーション）に置き換える。

### 6. useMainlineExecutionAccess.ts の独自 apiKeyDegraded 算出を削除

`useMainlineExecutionAccess.ts` にて独自に行っている `apiKeyDegraded` の算出ロジックを削除し、`HealthPolicy.isDegraded` を参照する形に統一する。

## 受入基準

- [ ] `ExecutionCapabilityInput` に `apiKeyDegraded` フィールドが存在しない
- [ ] `MainlineExecutionAccessInput`（または `HealthPolicyInput`）に `apiKeyDegraded` フィールドが存在しない
- [ ] 対象 9 ファイル内に `apiKeyDegraded` の文字列が残存しない（`grep -rn "apiKeyDegraded"` でヒットなし）
- [ ] `resolveCapability()` および `resolveHealthPolicy()` が `HealthPolicy.isDegraded` 経由で劣化状態を評価している
- [ ] `useMainlineExecutionAccess.ts` の独自 `apiKeyDegraded` 算出ロジックが除去されている
- [ ] 全テストファイルが `isDegraded` ベースのアサーションに更新されており、すべて PASS する
- [ ] `pnpm typecheck` がエラーなしで通る
- [ ] `pnpm --filter @repo/shared test` および `pnpm --filter @repo/desktop test` が PASS する

## 苦戦箇所（ナレッジ）

### P32: 型定義の二箇所同時更新必須

本タスクは P32 パターン（型定義の二箇所同時更新必須）に該当する。`packages/shared/src/types/execution-capability.ts` と `packages/shared/src/types/health-policy.ts` の両ファイルに型定義の変更が必要であり、片方だけ更新すると型不整合が発生する。

**対策**: 両ファイルを同一コミットで更新し、変更後に `pnpm typecheck` で整合性を確認すること。

### テストファイルの一括置換

5 つのテストファイルに `apiKeyDegraded` 参照が分散している。手動で一件ずつ修正すると漏れが発生しやすいため、以下のコマンドで残存箇所を確認してから修正すること。

```bash
grep -rn "apiKeyDegraded" packages/shared/src/types/__tests__/ apps/desktop/src/renderer/
```

### useMainlineExecutionAccess.ts の算出ロジック除去

Hook 内の `apiKeyDegraded` 算出ロジックを除去する際、Hook の返却値（インターフェース）から `apiKeyDegraded` が消えることで、呼び出し元 Renderer コンポーネントにも修正が波及する可能性がある。事前に以下で参照箇所を調査すること。

```bash
grep -rn "apiKeyDegraded\|useMainlineExecutionAccess" apps/desktop/src/renderer/
```

## 依存関係

- **前提**: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 が完了していること
- **前提**: UT-HEALTH-POLICY-RUNTIME-INJECTION-001 が完了していること
- **関連**: TASK-IMP-HEALTH-POLICY-UNIFICATION-001（親タスク）
