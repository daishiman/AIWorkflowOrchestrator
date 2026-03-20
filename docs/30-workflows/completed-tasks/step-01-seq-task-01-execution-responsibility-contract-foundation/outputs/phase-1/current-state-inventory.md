# Phase 1: 現状棚卸しインベントリ (P50 チェック)

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 1                                                         |
| 作成日   | 2026-03-20                                                |

## 調査対象ファイル

| ファイル               | パス                                                               | 役割                               |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------- |
| RuntimePolicyResolver  | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`  | runtime 実行経路の判定（2択）      |
| auth-mode.ts           | `packages/shared/src/types/auth-mode.ts`                           | AuthMode 型・AuthModeStatus DTO    |
| RuntimeResolver        | `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`        | runtime 解決（integrated/handoff） |
| TerminalHandoffBuilder | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts` | terminal handoff bundle 構築       |

## gap-capability: コード上の判定結果と capability 4 状態の対応

### 現状

RuntimePolicyResolver.resolve() は `authMode` と `apiKey` を入力とし、以下の **2 状態** のみを出力する:

| 条件                                  | 出力               |
| ------------------------------------- | ------------------ |
| `authMode === "api-key"` かつ有効 key | `integrated_api`   |
| それ以外                              | `terminal_handoff` |

RuntimeResolver.resolve() も同様に `integrated` / `handoff` の **2 状態** を返す。

### gap

| gap ID  | 内容                                                                                                                                                 | severity |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| GAP-C-1 | `both` 状態が存在しない。subscription と api-key の両方が有効な場合でも、authMode の値に基づいて単一 lane に確定される                               | High     |
| GAP-C-2 | `none` 状態が明示的に定義されていない。api-key モードで key が空の場合は `terminal_handoff` にフォールバックする                                     | High     |
| GAP-C-3 | capability の語彙が `integrated_api` / `terminal_handoff` であり、contract 要求の `integratedRuntime` / `terminalSurface` / `both` / `none` と不一致 | Medium   |
| GAP-C-4 | RuntimePolicyResolver と RuntimeResolver が並存し、同じ判定を別の型名（`RuntimeDecision` vs `RuntimeResolution`）で返している                        | Medium   |

### 既存コード抜粋

```typescript
// RuntimePolicyResolver.ts:31-40
export type RuntimeDecision =
  | {
      type: "integrated_api";
      apiKey: string;
      permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
    }
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle };

// RuntimeResolver.ts:13-15
export type RuntimeResolution =
  | { type: "integrated" }
  | { type: "handoff"; reason: string };
```

## gap-state: UI 状態語彙（ready / blocked / unavailable）の統一状況

### 現状

`AuthModeStatus` DTO は以下のフィールドを持つ:

```typescript
// auth-mode.ts:78-86
export interface AuthModeStatus {
  mode: AuthMode; // "subscription" | "api-key"
  isValid: boolean; // 認証が有効か
  hasCredentials: boolean; // 認証情報が存在するか
  message: string; // 表示メッセージ
  errorCode?: AuthModeErrorCode;
  guidance?: string; // ガイダンステキスト
  lastCheckedAt: number;
}
```

### gap

| gap ID  | 内容                                                                                                                                              | severity |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| GAP-S-1 | `ready` / `blocked` / `unavailable` の UI 状態語彙が DTO に存在しない。`isValid` と `hasCredentials` の組み合わせで Renderer が間接判定している   | High     |
| GAP-S-2 | `blocked` 時の「理由テキスト + 解決 action」の同時提示契約がない。`guidance` フィールドは任意（`?`）であり、blocked 時でも省略可能                | High     |
| GAP-S-3 | `unavailable` 状態を表す明示的なフラグがない。`isValid === false && hasCredentials === false` が暗黙的に unavailable を意味するが、DTO 上で不明確 | Medium   |
| GAP-S-4 | 状態遷移中（loading）の表現がない。AuthMode 変更中の中間状態を Renderer が独自に管理する必要がある                                                | Low      |

## gap-prohibition: 禁止事項ガードの存在確認

### silent fallback

| 確認箇所              | 結果                                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RuntimePolicyResolver | api-key モードで key が空 → `terminal_handoff` を返す。`integrated_api` への暗黙 fallback はない。ただし `none` を返す代わりに `terminal_handoff` を返す点が GAP-C-2 に該当 |
| RuntimeResolver       | subscription モード → `handoff` を返す。integrated への暗黙 fallback はない                                                                                                 |
| DEFAULT_AUTH_MODE     | `"subscription"` がデフォルト値。初期状態で terminal_handoff になるが、これは設計意図であり silent fallback ではない                                                        |

### auto-send

| 確認箇所               | 結果                                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| TerminalHandoffBuilder | `build()` は bundle を構築するだけで、送信処理を含まない。auto-send を防ぐ **明示的ガード** はないが、構造的に分離されている |
| IPC handlers           | terminal handoff 時にコマンドを自動送信する処理は確認されなかった                                                            |

### hidden prompt injection

| 確認箇所               | 結果                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TerminalHandoffBuilder | `sanitizePrompt()` で shell injection 対策あり（`"`, `$`, `` ` ``, `\` をエスケープ）。ただし「UI に表示されないプロンプトを追加しない」という明示的ガードはない           |
| buildForAgentExecution | request.prompt が空の場合、デフォルトプロンプト「現在のコンテキストからエージェント実行を続けてください」を注入する。これが hidden injection に該当するかは Phase 2 で判定 |

### gap

| gap ID  | 内容                                                                                                                                                                 | severity |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| GAP-P-1 | capability = none が存在しないため、silent fallback 禁止の境界が不明確。api-key + no-key で terminal_handoff に遷移する動作が silent fallback か否かの判定基準がない | Medium   |
| GAP-P-2 | auto-send 防止が構造的分離に依存しており、明示的なガード（assertion / runtime check）がない                                                                          | Medium   |
| GAP-P-3 | `buildForAgentExecution` / `buildForSkillExecution` のデフォルトプロンプト注入が hidden injection に該当する可能性。UI 表示との一致を保証する仕組みがない            | Medium   |

## 追加発見事項

### BUG-1: RuntimeResolver.ts L24 の await 漏れ

`RuntimeResolver.ts` の L24 で `this.authModeService.getMode()` が `await` されていない。`getMode()` は `Promise<AuthMode>` を返すため、`authMode` 変数に Promise オブジェクトが代入され、L26 の `authMode === "subscription"` 比較が常に `false` になる。

```typescript
// RuntimeResolver.ts L24（バグ）
const authMode = this.authModeService.getMode(); // await が欠落

// 修正案
const authMode = await this.authModeService.getMode();
```

severity: **High**（subscription モードが正しく判定されず、常に api-key パスに fallback する可能性）

### 追加情報: AccessCapability 型の存在

`arch-state-management-core.md` の ChatPanel Real AI Chat 配線セクションに `AccessCapability` 型が `spec_created` として既に定義されている:

```typescript
type AccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";
```

RuntimePolicyResolver はこの型を使用しておらず、独自の `"integrated_api"` / `"terminal_handoff"` 2 値を返している。Task02 でこの gap を解消する。

## 調査結果サマリー

| 軸              | gap 件数 | 最高 severity | Phase 2 への主要論点                                              |
| --------------- | -------- | ------------- | ----------------------------------------------------------------- |
| gap-capability  | 4 件     | High          | 4 状態への拡張方法と既存 2 状態との互換性                         |
| gap-state       | 4 件     | High          | DTO への UI 状態語彙追加と blocked 時の理由 + action 同時提示契約 |
| gap-prohibition | 3 件     | Medium        | デフォルトプロンプト注入の hidden injection 判定基準              |
| バグ            | 1 件     | High          | RuntimeResolver.ts の await 漏れ（BUG-1）                         |
