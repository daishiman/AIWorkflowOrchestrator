# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 8                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

Phase 5 の実装コードをリファクタリングし、命名・責務整理・不要コードの除去を行う。
本タスクは変更範囲が小さいため、リファクタリング範囲も限定的である。

---

## 実行タスク

- **タスク1**: `RuntimeSkillCreatorFacade.ts` の命名・コメント確認
- **タスク2**: `index.ts` の `healthPolicy` 生成コードの整理
- **タスク3**: リファクタ後の統合テスト継続成功を確認
- **タスク4**: Phase 5 先行実施の確認（本タスクのスコープで対応済みの項目を記録）

---

## 参照資料

| 資料名                         | パス                                                                  | 説明           |
| ------------------------------ | --------------------------------------------------------------------- | -------------- |
| Phase 7 カバレッジレポート     | `outputs/phase-7/coverage-report.md`                                  | PASS 判定確認  |
| Phase 2 設計決定記録           | `outputs/phase-2/design-decisions.md`                                 | 設計意図の確認 |
| RuntimeSkillCreatorFacade 実装 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | リファクタ対象 |
| IPC index.ts                   | `apps/desktop/src/main/ipc/index.ts`                                  | リファクタ対象 |

---

## 実行手順

### ステップ1: リファクタリング対象の特定

本タスクは変更範囲が小さく、リファクタリングの主な対象は限定される:

**確認項目**:

```bash
# 1. コメントの整合性確認（healthPolicy DI の意図を示すコメントがあるか）
grep -n "healthPolicy\|HealthPolicy" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 2. index.ts の healthPolicy 生成コードの可読性確認
grep -n "healthPolicy\|resolveHealthPolicy" \
  apps/desktop/src/main/ipc/index.ts

# 3. 不要な import が残っていないか確認
grep -n "^import" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -20
```

### ステップ2: コメント・命名の整理

**`RuntimeSkillCreatorFacade.ts` の確認事項**:

1. `RuntimeSkillCreatorFacadeDeps.healthPolicy` にコメントを追加する（必要な場合）:

```typescript
export interface RuntimeSkillCreatorFacadeDeps {
  // ... 既存フィールド
  /**
   * HealthPolicy for runtime policy resolution.
   * When undefined, falls back to auth-based policy (backward compatible).
   * Injected from index.ts via resolveHealthPolicy().
   */
  healthPolicy?: HealthPolicy;
}
```

2. コンストラクタの `deps.healthPolicy` 渡しにコメントが不要であることを確認
   （シンプルな DI 渡しはコメント不要）

**`index.ts` の確認事項**:

1. `resolveHealthPolicy({...})` の呼び出しが可読か確認
2. `lastHealthCheck: null` の意図をコメントで補足する（必要な場合）:

```typescript
healthPolicy: resolveHealthPolicy({
  connectionStatus: "connected",
  isApiKeyValid: true,
  apiKeyDegraded: false,
  isRateLimited: false,
  // Initial call: no health check performed yet.
  // healthStatus will be "unknown", isDegraded will be false.
  lastHealthCheck: null,
}),
```

### ステップ3: Phase 5 先行実施の確認

Phase 5 のファイル分離先行実施判断基準を確認し、本タスクでの実施済み項目を記録:

| Phase 8 リファクタ項目            | Phase 5 で対応 | 備考                      |
| --------------------------------- | -------------- | ------------------------- |
| ファイル分離（新規ファイル追加）  | 不要           | 変更範囲が小さく分離不要  |
| `HealthCheckCache` の導入         | 不採用         | アプローチB採用のため不要 |
| Setter Injection パターンへの変更 | 不採用         | 将来タスクとして記録済み  |

### ステップ4: リファクタ後の統合テスト確認

```bash
# リファクタ後も全テストが GREEN であることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts

# typecheck も再確認
pnpm --filter @repo/desktop typecheck
```

---

## 統合テスト連携

- リファクタ後の統合テスト継続成功を確認
- コメント追加のみであればテスト動作に影響なし

---

## サブタスク管理

| ID     | タスク名                     | ステータス |
| ------ | ---------------------------- | ---------- |
| T-08-1 | リファクタ対象の特定         | 未実施     |
| T-08-2 | コメント・命名の整理         | 未実施     |
| T-08-3 | Phase 5 先行実施の確認       | 未実施     |
| T-08-4 | リファクタ後の統合テスト確認 | 未実施     |

---

## 成果物

| 成果物         | 配置先                                  | 形式     |
| -------------- | --------------------------------------- | -------- |
| リファクタ結果 | `outputs/phase-8/refactoring-result.md` | Markdown |

---

## 完了条件

- [ ] `RuntimeSkillCreatorFacade.ts` の命名・コメントが整理されていること
- [ ] `index.ts` の `resolveHealthPolicy({...})` 生成コードが可読であること
- [ ] 不要な import が存在しないこと
- [ ] リファクタ後も全テスト3種が GREEN であること
- [ ] リファクタ後も `pnpm --filter @repo/desktop typecheck` が PASS であること
- [ ] `outputs/phase-8/refactoring-result.md` に作業内容が記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-08-1: リファクタ対象を特定し記録済み
- [ ] T-08-2: コメント・命名の整理を完了済み
- [ ] T-08-3: Phase 5 先行実施の確認結果を `outputs/phase-8/refactoring-result.md` に記録済み
- [ ] T-08-4: リファクタ後の統合テスト（全 GREEN・typecheck PASS）を確認済み

---

## 次Phase

**Phase 9: 品質保証** — typecheck / lint / 全テスト実行の最終品質チェックを行う。

**Phase 9 開始条件**: Phase 8 の全完了条件を満たすこと。
