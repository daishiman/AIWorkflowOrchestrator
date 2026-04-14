# Phase 5: 実装

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 5                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

Phase 4 で RED にしたテストを GREEN に変えるための実装を行う。
`RuntimeSkillCreatorFacade.ts` と `index.ts` を修正し、`healthPolicy` の DI チェーンを完成させる。

---

## 実行タスク

- **タスク1**: 実装前の既存テスト baseline 確認
- **タスク2**: `RuntimeSkillCreatorFacade.ts` の修正（`Deps` 型追加 + コンストラクタ修正）
- **タスク3**: `index.ts` の修正（`healthPolicy` 生成・注入）
- **タスク4**: GREEN 確認（Phase 4 追加テストが PASS になること）
- **タスク5**: 既存テスト回帰確認（既存テストが引き続き PASS であること）

---

## 参照資料

| 資料名                         | パス                                                                  | 説明                            |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------- |
| Phase 2 設計決定記録           | `outputs/phase-2/design-decisions.md`                                 | 実装方針（アプローチB）         |
| Phase 4 テストマトリクス       | `outputs/phase-4/test-matrix.md`                                      | GREEN にすべき TC-H-01〜04      |
| RuntimeSkillCreatorFacade 実装 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正対象（L72-75 付近）         |
| IPC index.ts                   | `apps/desktop/src/main/ipc/index.ts`                                  | 修正対象（L904-911 付近）       |
| RuntimePolicyResolver 実装     | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`     | 3番目引数受け取り側（参照のみ） |
| HealthPolicy 型定義            | `packages/shared/src/types/health-policy.ts`                          | `resolveHealthPolicy()` 参照    |

---

## 実行手順

### ステップ0: 既存テスト baseline 確認【必須】

```bash
# 変更対象ファイルに関連する既存テストを先行実行して baseline を確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts

# baseline 結果を outputs/phase-5/baseline-test-result.md に記録する
```

- [ ] 既存テストが全て GREEN であることを確認済み（baseline 確認）

### ステップ1: `RuntimeSkillCreatorFacade.ts` の修正

**実装内容**（設計書 Phase 2 のアプローチB に従う）:

1. `HealthPolicy` の import を追加:

```typescript
import type { HealthPolicy } from "@repo/shared/types";
```

2. `RuntimeSkillCreatorFacadeDeps` インターフェースに `healthPolicy?` を追加:

```typescript
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
  skillFileManager?: SkillFileManager;
  skillFileWriter?: SkillFileWriter;
  healthPolicy?: HealthPolicy; // 追加
}
```

3. コンストラクタ（L72-75 付近）を修正:

```typescript
// 変更前
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
);

// 変更後
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  deps.healthPolicy, // 追加: 3番目引数として渡す
);
```

**実装後の確認**:

```bash
# 型チェック（修正ファイルのみ先行確認）
pnpm --filter @repo/desktop exec tsc --noEmit \
  --project apps/desktop/tsconfig.json 2>&1 | grep RuntimeSkillCreatorFacade
```

### ステップ2: `index.ts` の修正

**実装内容**:

1. `resolveHealthPolicy` の import を追加（既存の shared import 行に追記または新規追加）:

```typescript
import { resolveHealthPolicy } from "@repo/shared/types";
```

2. `RuntimeSkillCreatorFacade` の生成箇所（L904-911 付近）を修正:

```typescript
// 変更前
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
    })
  : undefined;

// 変更後
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
      healthPolicy: resolveHealthPolicy({
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: null, // 初回 → healthStatus: "unknown", isDegraded: false
      }),
    })
  : undefined;
```

**実装後の確認**:

```bash
# typecheck 全体
pnpm --filter @repo/desktop typecheck
```

### ステップ3: GREEN 確認

```bash
# Phase 4 で追加したテスト（TC-H-01〜04）が GREEN になっていることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
```

**期待される結果**:

- TC-H-01: PASS（`healthPolicy` DI 確認）
- TC-H-02: PASS（後方互換確認）
- TC-H-03: PASS（`isDegraded: true` → `terminal_handoff`）
- TC-H-04: PASS（`isDegraded: false` → 正常レスポンス）

### ステップ4: 既存テスト回帰確認

```bash
# 3テストファイル全て実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

- [ ] 既存テストが全て GREEN であること（回帰なし）

### ステップ5: IPC ハンドラ register/unregister 確認

本タスクは IPC ハンドラの新規追加を行わないため、register/unregister の確認はスキップ可。
ただし `index.ts` の修正が他の IPC ハンドラ登録に影響していないことを確認:

```bash
# index.ts の変更が IPC ハンドラ登録に影響していないことを確認
grep -n "ipcMain.handle\|registerHandlers" apps/desktop/src/main/ipc/index.ts | head -20
```

---

## 統合テスト連携

- DI チェーン実装後に `pnpm typecheck` で型整合を確認済み
- Phase 4 追加テスト（TC-H-01〜04）が GREEN であることが実装完了の証拠

---

## 多角的チェック観点（AIが判断）

### 定数・型・インターフェースの変更による波及

`RuntimeSkillCreatorFacadeDeps` への `healthPolicy?` 追加は optional なため、既存の呼び出し側に影響しない。
ただし以下を確認:

```bash
# RuntimeSkillCreatorFacadeDeps を利用している他の箇所を確認
grep -rn "RuntimeSkillCreatorFacadeDeps" apps/ packages/
```

### `resolveHealthPolicy` の import 確認

```bash
# index.ts で resolveHealthPolicy がすでに import されていないか確認
grep -n "resolveHealthPolicy" apps/desktop/src/main/ipc/index.ts
```

重複 import がある場合は既存の import 行に追記する（新規 import 行を追加しない）。

---

## サブタスク管理

| ID     | タスク名                            | ステータス |
| ------ | ----------------------------------- | ---------- |
| T-05-1 | baseline 確認                       | 未実施     |
| T-05-2 | `RuntimeSkillCreatorFacade.ts` 修正 | 未実施     |
| T-05-3 | `index.ts` 修正                     | 未実施     |
| T-05-4 | GREEN 確認                          | 未実施     |
| T-05-5 | 既存テスト回帰確認                  | 未実施     |

---

## 成果物

| 成果物                 | 配置先                                                                | 形式       |
| ---------------------- | --------------------------------------------------------------------- | ---------- |
| 修正コード（Facade）   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | TypeScript |
| 修正コード（index.ts） | `apps/desktop/src/main/ipc/index.ts`                                  | TypeScript |
| baseline テスト結果    | `outputs/phase-5/baseline-test-result.md`                             | Markdown   |
| GREEN 確認結果         | `outputs/phase-5/green-confirmation.md`                               | Markdown   |
| 実装結果サマリ         | `outputs/phase-5/implementation-result.md`                            | Markdown   |

---

## 完了条件

- [ ] `RuntimeSkillCreatorFacade.ts` に `healthPolicy?: HealthPolicy` が追加されていること
- [ ] コンストラクタが `new RuntimePolicyResolver(..., deps.healthPolicy)` と3引数で呼んでいること
- [ ] `index.ts` で `resolveHealthPolicy({...})` が生成され `RuntimeSkillCreatorFacade` に渡されていること
- [ ] TC-H-01〜TC-H-04 が全て GREEN であること
- [ ] 既存テスト3種が全て GREEN であること（回帰なし）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS であること
- [ ] `outputs/phase-5/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-05-1: baseline 確認を実行し `outputs/phase-5/baseline-test-result.md` に記録済み
- [ ] T-05-2: `RuntimeSkillCreatorFacade.ts` 修正完了（`Deps` 型追加 + コンストラクタ修正）
- [ ] T-05-3: `index.ts` 修正完了（`healthPolicy` 生成・渡し）
- [ ] T-05-4: GREEN 確認を実行し `outputs/phase-5/green-confirmation.md` に記録済み
- [ ] T-05-5: 既存テスト回帰確認を実行し `outputs/phase-5/implementation-result.md` に記録済み

---

## 次Phase

**Phase 6: テスト拡充** — `RuntimeSkillCreatorFacade.improve.test.ts` への `mockHealthPolicy` 追加と、
後方互換性テストの拡充を行う。

**Phase 6 開始条件**: Phase 5 の全完了条件を満たし、TC-H-01〜04 が全て GREEN であること。
