# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 1                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

`RuntimeSkillCreatorFacade` が `RuntimePolicyResolver` に `healthPolicy` を渡していないことで発生する
デッドコード問題の要件を定義し、修正範囲・受入基準・依存関係を確定する。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態を確認し、既実装コードとの重複・齟齬を防止する。

```bash
# RuntimePolicyResolver の現在の引数構造を確認
grep -n "constructor\|healthPolicy\|HealthPolicy" \
  apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts

# RuntimeSkillCreatorFacade の現在のコンストラクタ呼び出しを確認
grep -n "new RuntimePolicyResolver\|RuntimeSkillCreatorFacadeDeps\|healthPolicy" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# index.ts での RuntimeSkillCreatorFacade 生成箇所を確認
grep -n "new RuntimeSkillCreatorFacade\|RuntimeSkillCreatorFacade" \
  apps/desktop/src/main/ipc/index.ts

# HealthPolicy 型の定義を確認
grep -n "HealthPolicy\|resolveHealthPolicy\|isDegraded" \
  packages/shared/src/types/health-policy.ts

# 既存テストの状態確認
grep -n "healthPolicy\|mockHealthPolicy\|isDegraded" \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

**確認事項**:

- [ ] `RuntimePolicyResolver.ts:43` に `healthPolicy?: HealthPolicy` が存在すること
- [ ] `RuntimeSkillCreatorFacade.ts:72-75` が2引数で `RuntimePolicyResolver` を呼んでいること（デッドコード状態）
- [ ] `packages/shared/src/types/health-policy.ts` に `HealthPolicy` 型と `resolveHealthPolicy()` が存在すること
- [ ] 既存テストに `mockHealthPolicy` が存在しないこと（未実装の証拠）

---

## 実行タスク

- **タスク1**: P50チェック — 対象ファイルの現状実装状態を確認
- **タスク2**: 問題の根本原因を特定・文書化
- **タスク3**: 修正スコープの確定（変更ファイル一覧・変更種別）
- **タスク4**: 受入基準（AC-1〜AC-7）の定義
- **タスク5**: 依存関係・前提条件の整理

---

## 参照資料

| 資料名                                  | パス                                                                                           | 説明                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------- |
| RuntimePolicyResolver 実装              | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                              | 3番目引数受け取り側                      |
| RuntimeSkillCreatorFacade 実装          | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                          | 修正対象: 2引数→3引数                    |
| IPC index.ts                            | `apps/desktop/src/main/ipc/index.ts`                                                           | 修正対象: healthPolicy 生成・注入        |
| HealthPolicy 型定義                     | `packages/shared/src/types/health-policy.ts`                                                   | `HealthPolicy` / `resolveHealthPolicy()` |
| health-policy テスト（参照元）          | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` | モック構築パターン参照                   |
| システム仕様（aiworkflow-requirements） | `.claude/skills/aiworkflow-requirements/references/`                                           | DI設計・アーキテクチャ整合確認           |

---

## 実行手順

### ステップ1: 問題の現状確認

```bash
# 1. RuntimePolicyResolver の引数定義を確認
cat apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts | head -60

# 2. RuntimeSkillCreatorFacade の問題箇所を確認
sed -n '60,100p' apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 3. index.ts の呼び出し箇所を確認
sed -n '895,920p' apps/desktop/src/main/ipc/index.ts
```

**確認すべき事実**:

- `RuntimePolicyResolver` コンストラクタの第3引数が `healthPolicy?: HealthPolicy` であること
- `RuntimeSkillCreatorFacade` が `new RuntimePolicyResolver(authKey, subscriptionAuth)` と2引数のみで呼んでいること
- `isDegraded` チェックロジックが `RuntimePolicyResolver` 内に存在すること

### ステップ2: HealthPolicy 型の把握

```bash
# HealthPolicy 型の全フィールドを確認
cat packages/shared/src/types/health-policy.ts

# resolveHealthPolicy 関数のシグネチャを確認
grep -n "resolveHealthPolicy\|HealthCheckInput" packages/shared/src/types/health-policy.ts
```

**把握すべき情報**:

- `HealthPolicy` の全フィールド（`isConnectionAvailable`, `isDegraded`, `isRateLimited`, `healthStatus`, `lastCheckedAt`）
- `resolveHealthPolicy()` の引数型（`HealthCheckInput`）と戻り値型（`HealthPolicy`）
- `lastHealthCheck: null` を渡した場合の挙動（`healthStatus: "unknown"`, `isDegraded: false` となること）

### ステップ3: 受入基準の確定

以下の受入基準を確定し、成果物として `outputs/phase-1/acceptance-criteria.md` に記録する。

**受入基準（AC-1〜AC-7）**:

| AC番号 | 基準                                                                                                                                         | 検証方法              |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| AC-1   | `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` が追加されている                                                            | コードレビュー / grep |
| AC-2   | `RuntimeSkillCreatorFacade` のコンストラクタが `RuntimePolicyResolver` に3番目引数を渡している                                               | コードレビュー        |
| AC-3   | `apps/desktop/src/main/ipc/index.ts` で `healthPolicy` が生成・渡されている（`undefined` 不可）                                              | コードレビュー        |
| AC-4   | `isDegraded: true` の `healthPolicy` を渡した `RuntimeSkillCreatorFacade.plan()` が `terminal_handoff` 系のレスポンス（guidance 含む）を返す | テスト PASS           |
| AC-5   | `healthPolicy` を渡さない（`undefined`）場合の後方互換性が保たれており、既存テストが全PASS                                                   | `pnpm test` PASS      |
| AC-6   | `pnpm --filter @repo/desktop typecheck` が通る                                                                                               | typecheck PASS        |
| AC-7   | 関連テストファイル3種が全PASS（`.test.ts`, `.plan.test.ts`, `.improve.test.ts`）                                                             | `pnpm test` PASS      |

### ステップ4: スコープ確定

**変更ファイル（コード）**:

| ファイル                                                              | 変更種別 | 変更内容                                      |
| --------------------------------------------------------------------- | -------- | --------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正     | `Deps` に `healthPolicy?` 追加、3番目引数渡し |
| `apps/desktop/src/main/ipc/index.ts`                                  | 修正     | `healthPolicy` を生成して `Facade` に渡す     |

**変更ファイル（テスト）**:

| ファイル                                                                                     | 変更種別 | 変更内容                                     |
| -------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`         | 修正     | `mockHealthPolicy` 追加、DI テストケース追加 |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`    | 修正     | `isDegraded: true` シナリオテスト追加        |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | 修正     | 必要に応じて `mockHealthPolicy` モック追加   |

**スコープ外（変更しない）**:

- `RuntimePolicyResolver.ts` — 修正不要（3番目引数受け取り済み）
- `packages/shared/src/types/health-policy.ts` — 修正不要（型定義済み）
- Renderer 側のコード — 本タスクのスコープ外

---

## 統合テスト連携

- `RuntimePolicyResolver` の `healthPolicy` 引数受け取り仕様を要件書に明記済み
- DI 接続の型契約（`RuntimeSkillCreatorFacadeDeps`）を Phase 2 設計に引き継ぐ
- `isDegraded: true` → `terminal_handoff` 系レスポンス（guidance 含む）の動作を Phase 4 統合テストシナリオとして記録

---

## 多角的チェック観点（AIが判断）

### システム系

- **因果ループ**: `healthPolicy` 未注入 → `isDegraded` 常時 false → ヘルスチェック機能デッドコード → LLMヘルス劣化時も正常フロー継続（強化ループ：デッドコードの固定化）
- **責務境界**: `healthPolicy` の生成責務は `index.ts`（DI組み立て層）、保持責務は `RuntimePolicyResolver`（ポリシー判断層）
- **状態所有権**: `HealthPolicy` の状態は `RuntimePolicyResolver` が所有。`Facade` は DI 経由で渡すのみ

### 価値・コスト系

- **価値**: LLMヘルスチェック機能（D-4）が実際に動作するようになる。既存の `isDegraded` チェックが有効化される
- **コスト**: 変更ファイル数は少ない（2コード + 3テスト）。影響範囲は明確に限定されている
- **トレードオン**: 初期実装は `resolveHealthPolicy` の初期入力（`lastHealthCheck: null` を含む）で `isDegraded: false` を返す（無害な初期値）。動的更新は別タスク

### 問題解決系

- **優先順位**: AC-4（`isDegraded: true` テスト）が最も重要。これで「デッドコード解消」を証明できる
- **リスク**: Setter Injection vs Constructor Injection の設計選択が Phase 2 の核心。誤選択は Phase 8 リファクタを要する

---

## サブタスク管理

| ID     | タスク名             | 担当 | ステータス |
| ------ | -------------------- | ---- | ---------- |
| T-01-1 | P50チェック          | -    | 未実施     |
| T-01-2 | 問題の根本原因文書化 | -    | 未実施     |
| T-01-3 | スコープ確定         | -    | 未実施     |
| T-01-4 | 受入基準定義         | -    | 未実施     |
| T-01-5 | 依存関係整理         | -    | 未実施     |

---

## 成果物

| 成果物               | 配置先                                   | 形式     |
| -------------------- | ---------------------------------------- | -------- |
| 受入基準ドキュメント | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`    | Markdown |
| スコープ定義書       | `outputs/phase-1/scope-definition.md`    | Markdown |

---

## 完了条件

- [ ] P50チェックを実行し、対象ファイルの現状実装状態が確認済みであること
- [ ] `RuntimePolicyResolver.ts` に `healthPolicy?: HealthPolicy` の3番目引数が存在することを確認済みであること
- [ ] `RuntimeSkillCreatorFacade.ts` が2引数でのみ `RuntimePolicyResolver` を呼んでいることを確認済みであること
- [ ] 受入基準 AC-1〜AC-7 が全て定義・文書化されていること
- [ ] 変更対象ファイル一覧（コード2種 + テスト3種）が確定していること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェック実行済み
- [ ] T-01-2: 問題の根本原因を `outputs/phase-1/p50-check-result.md` に記録済み
- [ ] T-01-3: スコープを `outputs/phase-1/scope-definition.md` に記録済み
- [ ] T-01-4: 受入基準 AC-1〜AC-7 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [ ] T-01-5: 依存関係（前提タスク完了確認）を記録済み

---

## 次Phase

**Phase 2: 設計** — `RuntimeSkillCreatorFacadeDeps` への `healthPolicy` 追加設計と、`index.ts` での `healthPolicy` 生成アプローチを設計する。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
