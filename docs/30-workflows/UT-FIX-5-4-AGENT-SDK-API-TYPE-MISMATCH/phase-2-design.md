# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-02-10                             |
| 機能名     | ut-fix-5-4-agent-sdk-api-type-mismatch |
| タスクID   | UT-FIX-5-4                             |

---

## 目的

Phase 1で定義した要件を実現する型修正設計を行う。`abort()` メソッドの型を `void` から `Promise<void>` に変更する設計を策定する。

## 背景

型定義と実装の不一致を解消するため、以下の2ファイルの型定義を修正する設計が必要：

1. `apps/desktop/src/preload/types.ts`
2. `packages/shared/src/agent/types.ts`

---

## 実行タスク

### タスク1: 型定義修正設計

**目的**: `abort()` メソッドの型定義変更を設計する

**実行手順**:

1. 現在の型定義を確認する
2. 修正後の型定義を設計する
3. 変更箇所を特定する

**設計詳細**:

#### 修正対象1: `apps/desktop/src/preload/types.ts` (行1289付近)

```typescript
// 修正前
export interface AgentSDKAPI {
  // ...
  abort: () => void;
  // ...
}

// 修正後
export interface AgentSDKAPI {
  // ...
  abort: () => Promise<void>;
  // ...
}
```

#### 修正対象2: `packages/shared/src/agent/types.ts` (行236付近)

```typescript
// 修正前
interface AgentSDK {
  // ...
  /**
   * 実行中のクエリを中断する
   */
  abort(): void;
  // ...
}

// 修正後
interface AgentSDK {
  // ...
  /**
   * 実行中のクエリを中断する
   */
  abort(): Promise<void>;
  // ...
}
```

**期待される成果物**:

- 型定義変更仕様書

---

### タスク2: 呼び出し箇所分析

**目的**: `abort()` メソッドの呼び出し箇所を分析し、修正影響を評価する

**実行手順**:

1. `abort()` メソッドの呼び出し箇所を検索する
2. 各呼び出し箇所の現在のパターンを確認する
3. `Promise<void>` への変更による影響を評価する

**分析観点**:

| 観点             | 確認内容                                                          |
| ---------------- | ----------------------------------------------------------------- |
| 同期呼び出し     | `abort()` を `await` なしで呼び出している箇所                     |
| 非同期呼び出し   | 既に `await abort()` パターンで呼び出している箇所                 |
| イベントハンドラ | onClick等で直接呼び出している箇所                                 |
| 破壊的変更       | 戻り値を使用している箇所（`void` → `Promise<void>` は互換性あり） |

**期待される成果物**:

- 呼び出し箇所分析レポート

---

### タスク3: 互換性評価

**目的**: 型変更による破壊的変更の有無を評価する

**実行手順**:

1. `void` から `Promise<void>` への変更の互換性を確認する
2. 既存コードへの影響を評価する

**互換性分析**:

| 呼び出しパターン   | 変更前動作                   | 変更後動作            | 互換性 |
| ------------------ | ---------------------------- | --------------------- | ------ |
| `abort()`          | 即時実行                     | Promise返却（無視可） | 互換   |
| `await abort()`    | エラー（void は await 不可） | 正常動作              | 改善   |
| `.then(() => ...)` | エラー                       | 正常動作              | 改善   |

**結論**: `void` → `Promise<void>` は後方互換性があり、破壊的変更ではない

**期待される成果物**:

- 互換性評価レポート

---

## 参照資料

| 参照資料         | パス                                                                                        | 内容                   |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                                                | Phase 1成果物          |
| Agent IPC API    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | Agent SDK IPC定義      |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集         |
| TypeScript型安全 | `.claude/rules/02-code-quality.md`                                                          | 型安全ルール           |
| IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | safeInvokeパターン根拠 |

---

## 成果物

| 成果物             | パス                                     | 内容           |
| ------------------ | ---------------------------------------- | -------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | システム構造   |
| 型変更仕様         | `outputs/phase-2/type-change-spec.md`    | 型定義変更詳細 |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント | 契約定義                                                        |
| ------------ | --------------------------------------------------------------- |
| IPC契約      | `agent:abort` チャンネルの戻り値型を `Promise<void>` に統一     |
| Preload API  | `window.electronAPI.agentSDK.abort()` が `Promise<void>` を返す |
| 共有型       | `@repo/shared` の AgentSDK.abort が `Promise<void>` を返す      |

---

## アーキテクチャ層別設計

| 層                  | 設計観点                                            | 仕様参照先         |
| ------------------- | --------------------------------------------------- | ------------------ |
| Preload（types.ts） | AgentSDKAPI.abort 型を `() => Promise<void>` に変更 | `api-ipc-agent.md` |
| Shared（types.ts）  | AgentSDK.abort 型を `Promise<void>` に変更          | `api-ipc-agent.md` |
| Main（実装）        | 変更なし（既に `Promise<void>` を返している）       | -                  |
| Renderer            | `await abort()` パターンが使用可能になる            | -                  |

---

## P23パターン対応設計

2箇所の型定義を同時更新する必要がある:

| 修正対象                | 現在の型             | 修正後の型                    | 根拠                      |
| ----------------------- | -------------------- | ----------------------------- | ------------------------- |
| `preload/types.ts`      | `abort: () => void;` | `abort: () => Promise<void>;` | safeInvokeがPromiseを返す |
| `shared/agent/types.ts` | `abort(): void;`     | `abort(): Promise<void>;`     | 正本として一致が必要      |

> 参照: `.claude/rules/06-known-pitfalls.md` P23

---

## 完了条件

- [ ] 型定義変更仕様が策定されている
- [ ] 呼び出し箇所分析が完了している
- [ ] 互換性評価が完了している
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/phase-3-review-gate.md`
