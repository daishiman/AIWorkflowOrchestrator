# Phase 2: 設計

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

`healthPolicy` DI 追加の設計を確定する。
Constructor Injection vs Setter Injection の設計選択を行い、
`index.ts` での `healthPolicy` 生成方針（アプローチA/B）を決定する。

---

## 実行タスク

- **タスク1**: `RuntimeSkillCreatorFacadeDeps` への `healthPolicy?` 追加設計
- **タスク2**: コンストラクタ修正設計（L72-75）
- **タスク3**: `index.ts` での `healthPolicy` 生成方針確定（即時生成を採用）
- **タスク4**: 型配置判断（`HealthPolicy` の import 先確認）
- **タスク5**: DI境界の型互換性検証テーブル作成

---

## 参照資料

| 資料名                         | パス                                                                                           | 説明                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 受入基準               | `outputs/phase-1/acceptance-criteria.md`                                                       | AC-1〜AC-7                             |
| RuntimeSkillCreatorFacade 実装 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                          | 修正対象                               |
| RuntimePolicyResolver 実装     | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                              | 3番目引数の受け取り側                  |
| HealthPolicy 型                | `packages/shared/src/types/health-policy.ts`                                                   | `HealthPolicy` / `resolveHealthPolicy` |
| IPC index.ts                   | `apps/desktop/src/main/ipc/index.ts`                                                           | healthPolicy 生成・渡し箇所            |
| health-policy テスト（参照元） | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` | モック構築パターン参照                 |
| DI境界設計ガイド               | `.claude/skills/task-specification-creator/references/phase-template-core.md`                  | DI境界の型配置判断フロー               |

---

## 実行手順

### ステップ1: `RuntimeSkillCreatorFacadeDeps` への型追加設計

**変更内容**（`RuntimeSkillCreatorFacade.ts`）:

```typescript
import type { HealthPolicy } from "@repo/shared/types";

export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
  skillFileManager?: SkillFileManager;
  skillFileWriter?: SkillFileWriter;
  healthPolicy?: HealthPolicy; // 追加: RuntimePolicyResolver の3番目引数へ渡すため
}
```

**型配置判断**:

- `HealthPolicy` は `packages/shared/src/types/health-policy.ts` に定義済み
- `RuntimeSkillCreatorFacade` は `apps/desktop/src/main/` に存在
- 既存の `import type { HealthPolicy } from "@repo/shared/types"` パターンで import 可能か確認

```bash
# 既存の shared types import パターン確認
grep -n "from \"@repo/shared" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

### ステップ2: コンストラクタ修正設計（L72-75）

**変更前（現状）**:

```typescript
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
);
```

**変更後**:

```typescript
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  deps.healthPolicy, // 追加: 3番目引数として渡す
);
```

**後方互換性**: `healthPolicy` は `optional` (`?`) のため、渡さない場合は `undefined` として動作し、既存の API Key / Subscription ベースのロジックは維持される。

### ステップ3: `healthPolicy` 生成アプローチの選定

| アプローチ                                       | 結論   | 理由                                                    |
| ------------------------------------------------ | ------ | ------------------------------------------------------- |
| `resolveHealthPolicy()` を `index.ts` で即時生成 | 採用   | 新規ファイル不要、状態を持たない、テストが単純          |
| `HealthCheckCache` シングルトンで動的更新        | 不採用 | 新規ファイルと共有 state が増え、今回の目的に対して重い |
| Setter Injection へ寄せる                        | 不採用 | 既存の `Deps` パターンを崩し、初回スコープが広がる      |

**採用案の実装イメージ**:

```typescript
import { resolveHealthPolicy } from "@repo/shared/types";

const initialHealthPolicy = resolveHealthPolicy({
  connectionStatus: "connected",
  isApiKeyValid: true,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: null, // 未実施 → healthStatus: "unknown", isDegraded: false
});

const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
      healthPolicy: initialHealthPolicy,
    })
  : undefined;
```

**採用理由**:

1. 本タスクの目的は DI チェーンの接続であり、動的更新は別タスクに切り分ける
2. `lastHealthCheck: null` により既存動作を壊さず、`isDegraded` を既定で false に保てる
3. 追加ファイルが不要で、後続の Phase 6/8/12 の再検証コストが低い

### ステップ4: 型互換性検証テーブル（下書き）

Phase 3 で検証する型互換性の下書き:

| Factory/DI                                   | 渡す具象型                  | 受け取り先 Interface / 引数型                                 | 互換性（Phase 3 で確認） |
| -------------------------------------------- | --------------------------- | ------------------------------------------------------------- | ------------------------ |
| `resolveHealthPolicy()`                      | `HealthPolicy`              | `RuntimePolicyResolver` 第3引数 `healthPolicy?: HealthPolicy` | TBD                      |
| `RuntimeSkillCreatorFacadeDeps.healthPolicy` | `HealthPolicy \| undefined` | `RuntimePolicyResolver` 第3引数 `healthPolicy?: HealthPolicy` | TBD                      |

```bash
# RuntimePolicyResolver の第3引数型を確認
grep -n "healthPolicy" \
  apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts

# HealthPolicy の export 確認
grep -n "export.*HealthPolicy\|export.*resolveHealthPolicy" \
  packages/shared/src/types/health-policy.ts \
  packages/shared/src/types/index.ts
```

### ステップ5: IPC ハンドラ変更確認

本タスクは IPC チャンネルの追加・変更を行わない。
変更対象は Main Process 内の DI 配線のみ（Renderer からは不可視）。

**確認**:

- [ ] IPC 4層整合性チェック: 本タスクでは IPC チャンネル変更なし（スキップ可）
- [ ] Preload API 変更なし
- [ ] Renderer 側コード変更なし

---

## 設計判断記録

| 決定事項                    | 選択                    | 理由                                   |
| --------------------------- | ----------------------- | -------------------------------------- |
| DI方式                      | Constructor Injection   | 既存の `Deps` パターンに合わせる       |
| `healthPolicy` 生成方法     | アプローチB（即時生成） | スコープ最小化・後方互換性優先         |
| Setter Injection採用        | 不採用                  | 本タスクのスコープ外。後続タスクで検討 |
| `HealthCheckCache` 新規作成 | 不採用                  | 本タスクのスコープ外。後続タスクで検討 |

---

## 統合テスト連携

- DI 接続の型契約（`RuntimeSkillCreatorFacadeDeps`）を設計に反映済み
- `resolveHealthPolicy` の初期入力（`lastHealthCheck: null` を含む）を使用した場合の動作（`isDegraded: false`）を設計書に記録
- 型互換性検証テーブル（下書き）を Phase 3 のレビューインプットとして提供

---

## 多角的チェック観点（AIが判断）

### DI境界の型配置判断フロー

```
RuntimeSkillCreatorFacadeDeps の healthPolicy?: HealthPolicy を使用する注入先は
RuntimePolicyResolver (apps/desktop/src/main/) のみか？
  ├─ YES → 型配置: packages/shared (HealthPolicy は既に shared にある)
  └─ RuntimeSkillCreatorFacadeDeps 自体は apps/desktop 内に閉じる
```

### concern 数による設計書分割基準

本タスクは 1 concern（DI チェーン接続）のみ → 単一 `phase-2-design.md` に全記述（分割不要）

### 後方互換性の確認

- `healthPolicy?: HealthPolicy` は optional なため、既存の `new RuntimeSkillCreatorFacade({ skillExecutor, ... })` のような呼び出しは修正不要
- `undefined` の場合、`RuntimePolicyResolver` は `healthPolicy` 未指定と同等に動作（`isDegraded: false`）

---

## サブタスク管理

| ID     | タスク名                       | ステータス |
| ------ | ------------------------------ | ---------- |
| T-02-1 | Deps型追加設計                 | 未実施     |
| T-02-2 | コンストラクタ修正設計         | 未実施     |
| T-02-3 | healthPolicy生成アプローチ選定 | 未実施     |
| T-02-4 | 型配置判断                     | 未実施     |
| T-02-5 | 型互換性検証テーブル作成       | 未実施     |

---

## 成果物

| 成果物                         | 配置先                                  | 形式     |
| ------------------------------ | --------------------------------------- | -------- |
| 設計決定記録                   | `outputs/phase-2/design-decisions.md`   | Markdown |
| 型互換性検証テーブル（下書き） | `outputs/phase-2/type-compatibility.md` | Markdown |
| コード変更差分イメージ         | `outputs/phase-2/code-diff-preview.md`  | Markdown |

---

## 完了条件

- [ ] `RuntimeSkillCreatorFacadeDeps` への `healthPolicy?: HealthPolicy` 追加設計が確定していること
- [ ] コンストラクタ修正（L72-75）の変更内容が確定していること
- [ ] `index.ts` での `healthPolicy` 生成方針（アプローチB）が確定していること
- [ ] 型互換性検証テーブル（下書き）が `outputs/phase-2/type-compatibility.md` に記録されていること
- [ ] 設計判断記録（DI方式・生成方法）が `outputs/phase-2/design-decisions.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-02-1: `RuntimeSkillCreatorFacadeDeps` への型追加設計を `outputs/phase-2/design-decisions.md` に記録済み
- [ ] T-02-2: コンストラクタ修正設計を記録済み
- [ ] T-02-3: アプローチB（即時生成）の採用を記録・理由付けで確定済み
- [ ] T-02-4: `HealthPolicy` の import パスを確認済み（`@repo/shared/types`）
- [ ] T-02-5: 型互換性検証テーブルを `outputs/phase-2/type-compatibility.md` に記録済み

---

## 次Phase

**Phase 3: 設計レビューゲート** — 設計の整合性・後方互換性・型安全性をレビューし、PASS/MINOR/MAJOR を判定する。

**ゲート条件**: Phase 1-2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。
