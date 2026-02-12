# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目      | 値                                     |
| --------- | -------------------------------------- |
| Phase     | 5                                      |
| タスクID  | UT-FIX-5-4                             |
| タスク名  | AgentSDKAPI型定義不一致修正            |
| 機能名    | ut-fix-5-4-agent-sdk-api-type-mismatch |
| 作成日    | 2026-02-10                             |
| 前提Phase | Phase 4（テスト作成）                  |

## 目的

Phase 4 で作成したテストをすべて通過させる最小限の型定義修正を行う（Green状態）。

---

## 実行タスク

### Task 1: 正本型定義の修正

**対象ファイル**: `packages/shared/src/agent/types.ts`

**修正箇所**: `AgentAPI` インターフェースの `abort` メソッド

**現在の定義** (L236付近):

```typescript
export interface AgentAPI {
  // ... 他のメソッド
  abort(): void;
  // ... 他のメソッド
}
```

**修正後の定義**:

```typescript
export interface AgentAPI {
  // ... 他のメソッド
  abort(): Promise<void>;
  // ... 他のメソッド
}
```

**設計ポイント**:

| ポイント       | 説明                                                      |
| -------------- | --------------------------------------------------------- |
| 戻り値型変更   | `void` → `Promise<void>` に変更                           |
| 実装との整合性 | `safeInvoke()` が `Promise<unknown>` を返すため一致       |
| 一貫性確保     | 他の非同期メソッド（`startExecution` 等）と同じ型パターン |

### Task 2: Preload型定義の修正

**対象ファイル**: `apps/desktop/src/preload/types.ts`

**修正箇所**: `AgentSDKAPI` インターフェースの `abort` プロパティ

**現在の定義** (L1289付近):

```typescript
export interface AgentSDKAPI {
  // ... 他のプロパティ
  abort: () => void;
  // ... 他のプロパティ
}
```

**修正後の定義**:

```typescript
export interface AgentSDKAPI {
  // ... 他のプロパティ
  abort: () => Promise<void>;
  // ... 他のプロパティ
}
```

**設計ポイント**:

| ポイント       | 説明                                               |
| -------------- | -------------------------------------------------- |
| 型同期         | `packages/shared` の正本型と一致させる             |
| P23対策        | 2箇所の型定義を同時更新（既知の落とし穴 P23 回避） |
| Renderer互換性 | 呼び出し元で `await` や `.then()` が使用可能になる |

### Task 3: 呼び出し箇所の確認

**目的**: 型変更による影響を受けるコードを特定し、必要に応じて修正

**確認コマンド**:

```bash
# abort()の呼び出し箇所を検索
grep -rn "\.abort()" apps/desktop/src/renderer/
grep -rn "agentSDKAPI\.abort" apps/desktop/src/
```

**想定される影響**:

| 呼び出しパターン    | 影響                       | 対応             |
| ------------------- | -------------------------- | ---------------- |
| `abort()`           | なし（戻り値未使用）       | 変更不要         |
| `await abort()`     | なし（既に非同期処理想定） | 変更不要         |
| `abort().then(...)` | なし（Promise期待）        | 変更不要         |
| `const x = abort()` | 型変更（void → Promise）   | 必要に応じて修正 |

**注意事項**:

- 多くの場合、`abort()` は「呼び出すだけ」で戻り値を使用しないため、影響は最小限
- TypeScriptコンパイラがエラーを検出した箇所のみ修正

### Task 4: 実装確認チェックリスト

| No  | 確認項目                                              | 期待結果                      |
| --- | ----------------------------------------------------- | ----------------------------- |
| 1   | `packages/shared/src/agent/types.ts` が更新されている | `abort(): Promise<void>;`     |
| 2   | `apps/desktop/src/preload/types.ts` が更新されている  | `abort: () => Promise<void>;` |
| 3   | 2箇所の型定義が一致している                           | 同じ戻り値型                  |
| 4   | TypeScriptコンパイルエラーがない                      | `pnpm typecheck` PASS         |
| 5   | 実装コード（`agentSDKAPI.ts`）の変更は不要            | 実装は既にPromiseを返している |

---

## 参照資料

| 資料名          | パス                                                                         | 説明                     |
| --------------- | ---------------------------------------------------------------------------- | ------------------------ |
| タスク指示書    | `docs/30-workflows/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/index.md`          | タスク仕様               |
| Phase 4成果物   | `docs/30-workflows/UT-FIX-5-4/phase-4-test-creation.md`                      | テスト仕様               |
| 正本型定義      | `packages/shared/src/agent/types.ts`                                         | 修正対象                 |
| Preload型定義   | `apps/desktop/src/preload/types.ts`                                          | 修正対象                 |
| 既知の落とし穴  | `.claude/rules/06-known-pitfalls.md`                                         | P23: API二重定義の型管理 |
| Agent IPC仕様   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         | IPCチャネル設計          |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | safeInvokeパターン       |

---

## 統合テスト連携【必須】

IPC通信の型契約を検証する:

| 統合ポイント | 確認項目                           |
| ------------ | ---------------------------------- |
| IPC契約      | `agent:abort` チャンネルの型一貫性 |
| 型安全性     | Preload/Shared 間の型契約維持      |
| safeInvoke   | Promise<void> 戻り値型の検証       |

---

## アーキテクチャ層別実装観点

| 層      | 実装観点                              | 仕様参照先                      |
| ------- | ------------------------------------- | ------------------------------- |
| Preload | `abort: () => Promise<void>` に型修正 | `security-api-electron.md`      |
| Shared  | `abort(): Promise<void>` に型修正     | `interfaces-agent-sdk-skill.md` |
| IPC     | safeInvokeパターン準拠確認            | `security-electron-ipc.md`      |

---

## 型修正の比較

**修正前と修正後の比較**:

| ファイル                             | 修正前               | 修正後                        |
| ------------------------------------ | -------------------- | ----------------------------- |
| `packages/shared/src/agent/types.ts` | `abort(): void;`     | `abort(): Promise<void>;`     |
| `apps/desktop/src/preload/types.ts`  | `abort: () => void;` | `abort: () => Promise<void>;` |

**実装との整合性**:

```typescript
// apps/desktop/src/preload/agentSDKAPI.ts (変更不要)
export const agentSDKAPI = {
  // ...
  abort: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT),
  // safeInvoke は Promise<unknown> を返す
  // 型定義を Promise<void> に変更することで整合性が取れる
};
```

---

## 成果物

| 成果物                  | パス                                         | 説明                          |
| ----------------------- | -------------------------------------------- | ----------------------------- |
| 正本型定義（修正後）    | `packages/shared/src/agent/types.ts`         | `abort(): Promise<void>;`     |
| Preload型定義（修正後） | `apps/desktop/src/preload/types.ts`          | `abort: () => Promise<void>;` |
| 実装仕様書              | `outputs/phase-05/implementation-summary.md` | 本ドキュメント                |

---

## 完了条件

- [ ] `packages/shared/src/agent/types.ts` の `abort` が `Promise<void>` を返すよう修正されている
- [ ] `apps/desktop/src/preload/types.ts` の `abort` が `Promise<void>` を返すよう修正されている
- [ ] 2箇所の型定義が一致している（P23回避）
- [ ] TypeScriptコンパイルが成功する（`pnpm typecheck`）
- [ ] Phase 4 の全テストが通過する（Green状態）
- [ ] 既存の他テストに影響がない
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

```bash
# 型チェック実行
pnpm typecheck

# テスト実行
pnpm --filter @repo/desktop test -- --grep "agentSDKAPI.abort"

# 確認項目
# - [ ] ASDT-01 〜 ASDT-05 がすべて PASS
# - [ ] ASDT-TYPE-01 〜 02 がすべて PASS
# - [ ] 既存テストが影響を受けていない
```

---

## 次のPhase

Phase 6: テスト拡充
