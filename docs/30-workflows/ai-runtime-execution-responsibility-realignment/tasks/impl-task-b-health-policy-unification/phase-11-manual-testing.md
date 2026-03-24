# Phase 11: 手動テスト

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 11 - 手動テスト                        |
| 機能名   | health-policy-unification              |
| タスクID | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |
| 作成日   | 2026-03-24                             |

## 目的

HealthPolicy 型の IDE 補完、@deprecated 警告の IDE 表示、RuntimePolicyResolver の degraded 動作を手動で確認する。CLI 環境での制約を考慮し、自動テスト結果と IDE シミュレーションで検証を代替する（P53 準拠）。

## 前提成果物

| Phase | 成果物                                                 |
| ----- | ------------------------------------------------------ |
| 10    | [phase-10-final-review.md](./phase-10-final-review.md) |

## 参照資料

| 資料名                     | パス / 参照先                                 |
| -------------------------- | --------------------------------------------- |
| P53 スクリーンショット制約 | `.claude/rules/06-known-pitfalls.md#P53`      |
| タスク実行ワークフロー     | `.claude/rules/05-task-execution.md#Phase 11` |

## 実行タスク

### Task 1: HealthPolicy 型の IDE 補完確認

#### 1-1. TypeScript Language Server による型補完検証

```bash
# 型定義の存在確認
cd packages/shared && pnpm tsc --noEmit --listFiles 2>&1 | grep "health-policy"

# エクスポートの確認
grep -n "export.*HealthPolicy\|export.*HealthStatus\|export.*HealthPolicyInput\|export.*resolveHealthPolicy" packages/shared/src/types/health-policy.ts
grep -n "export.*HealthPolicy\|export.*HealthStatus\|export.*HealthPolicyInput\|export.*resolveHealthPolicy" packages/shared/src/types/index.ts
```

#### 確認チェックリスト

- [ ] `HealthPolicy` 型がエクスポートされている
- [ ] `HealthStatus` 型がエクスポートされている
- [ ] `HealthPolicyInput` 型がエクスポートされている
- [ ] `resolveHealthPolicy` 関数がエクスポートされている
- [ ] `@repo/shared` からインポート可能であることが型チェックで確認済み

### Task 2: @deprecated 警告の IDE 表示確認

#### 2-1. @deprecated マークの構文確認

```bash
# @deprecated コメントの存在確認
grep -n "@deprecated" packages/shared/src/types/execution-capability.ts
```

#### 2-2. TypeScript コンパイラによる警告確認

```bash
# deprecated フィールドを使用するテストコードで警告が出ることを確認
cd packages/shared && pnpm tsc --noEmit 2>&1 | grep -i "deprecated\|apiKeyDegraded" || echo "警告なし（TypeScriptは@deprecatedを型エラーとして報告しない）"
```

#### 確認チェックリスト

- [ ] `@deprecated` コメントが `apiKeyDegraded` フィールドに付与されている
- [ ] `@deprecated` コメントに移行先（`resolveHealthPolicy()` の `isDegraded`）が明記されている
- [ ] `@deprecated` コメントに削除予定バージョン（`v2.0.0`）が明記されている

### Task 3: RuntimePolicyResolver の degraded 動作確認

#### 3-1. テストによる動作検証

```bash
# RuntimePolicyResolver の HealthPolicy 関連テスト実行
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts --reporter=verbose
```

#### 3-2. degraded 分岐の確認項目

以下のシナリオが正しく動作することをテスト出力で確認する。

| シナリオ                | 期待結果                                           | テスト名                                            |
| ----------------------- | -------------------------------------------------- | --------------------------------------------------- |
| HealthPolicy: healthy   | isDegraded=false, isConnectionAvailable=true       | "DI あり + healthy: 正常状態"                       |
| HealthPolicy: degraded  | isDegraded=true, isConnectionAvailable=true        | "HealthPolicy が degraded の場合、実行モードを制限" |
| HealthPolicy: unhealthy | isDegraded=true, isConnectionAvailable=false       | "HealthPolicy が unhealthy の場合、実行を拒否"      |
| HealthPolicy: unknown   | healthStatus="unknown", isConnectionAvailable=true | "DI あり + unknown: 未確認状態"                     |
| HealthPolicy: 未指定    | 既存動作維持                                       | "HealthPolicy 未指定時は既存の動作を維持"           |

#### 確認チェックリスト

- [ ] healthy シナリオが正しく動作する
- [ ] degraded シナリオが正しく動作する
- [ ] unhealthy シナリオが正しく動作する
- [ ] unknown シナリオが正しく動作する
- [ ] 未指定シナリオが既存動作を維持する

### Task 4: mainlineAccess.ts の HealthPolicy 消費確認

```bash
# mainlineAccess の HealthPolicy テスト実行
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts --reporter=verbose
```

#### 確認チェックリスト

- [ ] HealthPolicy 指定時に UI 状態が正しく導出される
- [ ] HealthPolicy 未指定時に fallback で動作する

### Task 5: 全体統合確認

```bash
# packages/shared ビルド
cd packages/shared && pnpm build

# apps/desktop 型チェック（ビルド依存の確認）
cd apps/desktop && pnpm typecheck
```

#### 確認チェックリスト

- [ ] `packages/shared` のビルドが成功する
- [ ] `apps/desktop` の型チェックが成功する（`@repo/shared` からのインポートが解決される）

### Task 6: 手動テスト結果記録

```
## 手動テスト結果

### Task 1: IDE 補完確認
- HealthPolicy 型エクスポート: [PASS/FAIL]
- HealthStatus 型エクスポート: [PASS/FAIL]
- HealthPolicyInput 型エクスポート: [PASS/FAIL]
- resolveHealthPolicy エクスポート: [PASS/FAIL]

### Task 2: @deprecated 警告確認
- @deprecated コメント存在: [PASS/FAIL]
- 移行先記載: [PASS/FAIL]
- 削除予定バージョン記載: [PASS/FAIL]

### Task 3: RuntimePolicyResolver degraded 動作
- healthy: [PASS/FAIL]
- degraded: [PASS/FAIL]
- unhealthy: [PASS/FAIL]
- unknown: [PASS/FAIL]
- 未指定（後方互換）: [PASS/FAIL]

### Task 4: mainlineAccess HealthPolicy 消費
- 指定時: [PASS/FAIL]
- 未指定時 fallback: [PASS/FAIL]

### Task 5: 全体統合
- packages/shared ビルド: [PASS/FAIL]
- apps/desktop 型チェック: [PASS/FAIL]
```

## 成果物

| 成果物                 | パス                                     |
| ---------------------- | ---------------------------------------- |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-report.md` |

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

- [ ] HealthPolicy 型の IDE 補完が確認済み
- [ ] @deprecated 警告が適切に設定されている
- [ ] RuntimePolicyResolver の全 5 シナリオが正しく動作する
- [ ] mainlineAccess.ts の HealthPolicy 消費が正しく動作する
- [ ] packages/shared のビルドが成功する
- [ ] apps/desktop の型チェックが成功する
- [ ] 手動テスト結果がレポートとして記録されている

## 次 Phase

[Phase 12: ドキュメント](./phase-12-documentation.md)
