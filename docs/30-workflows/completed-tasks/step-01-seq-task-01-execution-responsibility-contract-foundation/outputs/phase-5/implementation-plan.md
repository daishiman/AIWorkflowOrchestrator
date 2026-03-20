# Phase 5: 実装計画 (Implementation Plan)

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 5                                                         |
| 作成日   | 2026-03-20                                                |

## 概要

capability / state 語彙 / CTA 契約の正本を確定する変更を、packages/shared → apps/desktop/main → apps/desktop/renderer の順で適用する。順序を変えると後続ステップの型参照が壊れるため、必ずこの順に従うこと。

---

## 実装ステップ一覧

### ステップ 1: canonical capability 語彙の確認と既存契約の再利用判定

| 項目             | 内容                                                                                                                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象             | `.claude` canonical ドキュメント群 / `packages/shared/src/types/`                                                                                                                                     |
| 変更前の状態     | `AccessCapability` / `AuthModeStatus` などの既存型が存在するが、capability 4 状態（integratedRuntime / terminalSurface / both / none）および uiState（ready / blocked / unavailable）が型として未定義 |
| 変更後の状態     | 既存型の再利用可否を確認し、新規型追加が必要な場合のみ最小差分で追加する。既存 `AuthModeStatus` への optional フィールド追加が基本方針                                                                |
| 依存するステップ | なし（起点）                                                                                                                                                                                          |
| 検証方法         | Phase 4 CA-1〜CA-5 のテストが型エラーなく記述できること                                                                                                                                               |

**確認チェックリスト:**

- [ ] `packages/shared/src/types/auth-mode.ts` の `AuthModeStatus` に capability / uiState フィールドが存在するか確認
- [ ] `packages/shared/src/types/` 配下に capability 4 状態の既存型定義があるか確認
- [ ] 既存型で賄える場合は新規型を追加しない（再利用優先）

---

### ステップ 2: packages/shared/src/types/auth-mode.ts への最小差分追加

| 項目             | 内容                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象             | `packages/shared/src/types/auth-mode.ts`                                                                                                           |
| 変更前の状態     | `AuthModeStatus` は `mode / isValid / hasCredentials / message / errorCode / guidance / lastCheckedAt` のみを持ち、capability / uiState を持たない |
| 変更後の状態     | `AuthModeStatus` に capability / uiState / blockedReason / blockedAction を optional で追加。既存フィールドは変更なし                              |
| 依存するステップ | ステップ 1（既存型再利用判定の完了後）                                                                                                             |
| 検証方法         | TypeScript コンパイルエラーなし。既存コードへの影響がゼロであること（optional 追加のみ）                                                           |

**追加する型定義（最小差分）:**

```typescript
// packages/shared/src/types/auth-mode.ts への追加

/** capability 4 状態 */
export type RuntimeCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";

/** UI 状態語彙 */
export type RuntimeUiState = "ready" | "blocked" | "unavailable";

/** blocked 状態で提示する解決 action */
export interface BlockedAction {
  /** CTA ラベル（例: "設定を修正する"） */
  label: string;
  /** 遷移先ルート（例: "settings/auth"） */
  targetRoute: string;
}

// AuthModeStatus への optional フィールド追加（既存フィールドは変更なし）
export interface AuthModeStatus {
  // --- 既存フィールド（変更なし） ---
  mode: AuthMode;
  isValid: boolean;
  hasCredentials: boolean;
  message: string;
  errorCode?: AuthModeErrorCode;
  guidance?: string;
  lastCheckedAt: number;

  // --- 新規フィールド（capability 契約） ---
  /** capability 判定結果（RuntimePolicyResolver が設定） */
  capability?: RuntimeCapability;
  /** UI 状態語彙（Renderer selector が導出） */
  uiState?: RuntimeUiState;
  /** uiState === "blocked" のとき必須: 理由テキスト */
  blockedReason?: string;
  /** uiState === "blocked" のとき必須: 解決 action */
  blockedAction?: BlockedAction;
}
```

**変更しないこと:**

- 既存フィールド（mode / isValid / hasCredentials / message / errorCode / guidance / lastCheckedAt）の型・名前・必須/optional 区分を変更しない
- `AuthMode` 型（"subscription" | "api-key"）を変更しない
- `IPCResponse<T>` envelope の構造を変更しない

---

### ステップ 3: RuntimePolicyResolver.ts への capability 判定集約

| 項目             | 内容                                                                                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 対象             | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                                                                                                                                                                         |
| 変更前の状態     | `resolve(authMode, apiKey)` が `RuntimeDecision`（integrated_api / terminal_handoff の 2 択）を返す。capability 4 状態は存在せず、surface-local な追加判定が各呼び出し元に分散する可能性がある                                            |
| 変更後の状態     | `resolveCapability(inputs)` メソッドを追加し、capability 4 状態（integratedRuntime / terminalSurface / both / none）を返す唯一の authority とする。既存 `resolve()` は後方互換のため残すが、新規呼び出し元は `resolveCapability()` を使う |
| 依存するステップ | ステップ 2（`RuntimeCapability` 型の定義後）                                                                                                                                                                                              |
| 検証方法         | Phase 4 CA-1〜CA-5 のテストが PASS すること。他ファイルに capability 判定ロジックが存在しないこと（`grep -rn "integratedRuntime\|terminalSurface" apps/desktop/src/ --include="\*.ts"                                                     | grep -v RuntimePolicyResolver`） |

**追加するメソッドのシグネチャ:**

```typescript
// apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts への追加

import type { RuntimeCapability } from "@repo/shared/types/auth-mode";

export interface RuntimePolicyInputs {
  /** API key が有効か（非空文字列） */
  apiKeyValid: boolean;
  /** subscription（Claude Code CLI トークン）が有効か */
  subscriptionValid: boolean;
}

// IRuntimePolicyResolver インターフェースへの追加
export interface IRuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
  /** capability 4 状態を返す唯一の authority */
  resolveCapability(inputs: RuntimePolicyInputs): RuntimeCapability;
}

// 判定ロジック（仕様書 Phase 2 contract-matrix 準拠）
resolveCapability(inputs: RuntimePolicyInputs): RuntimeCapability {
  const { apiKeyValid, subscriptionValid } = inputs;
  if (apiKeyValid && subscriptionValid) return "both";
  if (apiKeyValid && !subscriptionValid) return "integratedRuntime";
  if (!apiKeyValid && subscriptionValid) return "terminalSurface";
  return "none"; // 暗黙 fallback 禁止: none を明示的に返す
}
```

**変更しないこと:**

- 既存 `resolve(authMode, apiKey)` メソッドのシグネチャと動作を変更しない（後方互換維持）
- `RuntimeDecision` 型の構造を変更しない
- `TerminalHandoffBundle` の構造を変更しない

---

### ステップ 4: apps/desktop/src/main/handlers/ の IPC envelope 整列

| 項目             | 内容                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象             | `apps/desktop/src/main/handlers/`（auth-mode 関連の IPC ハンドラ、例: auth-mode ハンドラ）                                                                 |
| 変更前の状態     | IPC ハンドラが `AuthModeStatus` を返す際に capability / uiState フィールドを設定しない。capability 情報が Renderer に届かない                              |
| 変更後の状態     | auth-mode:status / auth-mode:validate 等の IPC ハンドラが `RuntimePolicyResolver.resolveCapability()` を呼び出し、capability フィールドを DTO に載せて返す |
| 依存するステップ | ステップ 2（`AuthModeStatus` 拡張後）、ステップ 3（`resolveCapability()` 実装後）                                                                          |
| 検証方法         | Phase 4 IPC response envelope mock が実装と一致すること。`IPCResponse<AuthModeStatus>` の capability フィールドが非 undefined であること                   |

**IPC ハンドラ変更のパターン:**

```typescript
// apps/desktop/src/main/handlers/ 内の auth-mode ハンドラへの変更

// 変更前（capability なし）
ipcMain.handle("auth-mode:status", async (event) => {
  const status = await authModeService.getStatus();
  return { success: true, data: status };
});

// 変更後（capability を設定して返す）
ipcMain.handle("auth-mode:status", async (event) => {
  const status = await authModeService.getStatus();
  const apiKeyValid =
    status.mode === "api-key" && status.isValid && status.hasCredentials;
  const subscriptionValid =
    status.mode === "subscription" && status.isValid && status.hasCredentials;
  const capability = runtimePolicyResolver.resolveCapability({
    apiKeyValid,
    subscriptionValid,
  });
  return {
    success: true,
    data: { ...status, capability },
  };
});
```

**変更しないこと:**

- IPC チャンネル名（`IPC_CHANNELS` 定数で管理されているもの）を変更しない
- `IPCResponse<T>` の `success / data / error` 構造を変更しない（P60 対策）
- IPC ハンドラの引数バリデーション（P42 対策）ロジックを削除しない

---

### ステップ 5: apps/desktop/src/renderer/store/ への selector / hook 追加

| 項目             | 内容                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象             | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`（および関連 selector ファイル）                                                                                                          |
| 変更前の状態     | Zustand store が `AuthModeStatus` を保持するが、capability / uiState を導出する専用 selector が存在しない。consumer コンポーネントが直接 mode / isValid 等を参照して UI を決定している可能性がある |
| 変更後の状態     | `useRuntimeCapabilityStatus()` hook と `selectUiState(status)` selector を追加し、Renderer 内で capability / uiState の導出責務を 1 箇所に集約する                                                 |
| 依存するステップ | ステップ 2（`RuntimeCapability` / `RuntimeUiState` 型の定義後）、ステップ 4（IPC で capability を受信できるようになった後）                                                                        |
| 検証方法         | Phase 4 CB-1〜CB-5 のテストが PASS すること。P31 / P48 に従い `useShallow` を適用していること                                                                                                      |

**追加する selector / hook のシグネチャ:**

```typescript
// apps/desktop/src/renderer/store/slices/authModeSlice.ts への追加

import type {
  RuntimeCapability,
  RuntimeUiState,
  BlockedAction,
} from "@repo/shared/types/auth-mode";

/** Renderer 内で capability → uiState を導出する selector */
export function selectUiState(status: AuthModeStatus): RuntimeUiState {
  const cap = status.capability;
  if (!cap || cap === "none") {
    // blockedAction があれば blocked、なければ unavailable
    return status.blockedAction ? "blocked" : "unavailable";
  }
  // integratedRuntime / terminalSurface / both の場合
  return status.isValid && status.hasCredentials ? "ready" : "blocked";
}

/** capability status を取得する hook（個別セレクタパターン: P31 対策） */
export const useRuntimeCapabilityStatus = () =>
  useAppStore(
    useShallow((state) => ({
      capability: state.authMode.status?.capability ?? "none",
      uiState: state.authMode.status
        ? selectUiState(state.authMode.status)
        : "unavailable",
      blockedReason: state.authMode.status?.blockedReason,
      blockedAction: state.authMode.status?.blockedAction,
    })),
  );
```

**変更しないこと:**

- `ViewType` / `renderView()` は consumer に留める。store selector に route 判定を持ち込まない
- 既存の `useAuthMode()` / `useSetAuthMode()` 等の個別セレクタのシグネチャを変更しない
- 合成 Hook（`useAuthModeStore()` 等）の `@deprecated` タグを外さない（P31 対策）

---

### ステップ 6: apps/desktop/src/renderer/components/ の CTA consumer 整列

| 項目             | 内容                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象             | `apps/desktop/src/renderer/components/` 配下の CTA consumer（settings shell / main chat / workspace / terminal handoff 等）                                                                     |
| 変更前の状態     | 各コンポーネントが `authMode` / `isValid` 等を個別に参照し、capability × state の導出ロジックをコンポーネント内部に持つ可能性がある。no-op CTA（disabled ボタン）が混在している可能性がある     |
| 変更後の状態     | 全 CTA consumer が `useRuntimeCapabilityStatus()` hook のみを参照し、contract-matrix の表示条件に従って CTA を描画する。コンポーネント内部に追加の capability / state 判定ロジックを持たない    |
| 依存するステップ | ステップ 5（`useRuntimeCapabilityStatus()` hook の実装後）                                                                                                                                      |
| 検証方法         | Phase 4 CC-1〜CC-5 のテストが実行可能な状態になること。`grep -rn "authMode\|isValid" apps/desktop/src/renderer/components/` で contract-matrix を経由しない直接参照が残っていないことを確認する |

**CTA consumer の実装パターン（contract-matrix 準拠）:**

```typescript
// CTA consumer コンポーネントの実装パターン

const MyChatActionPanel: React.FC = () => {
  const { capability, uiState, blockedReason, blockedAction } =
    useRuntimeCapabilityStatus();

  // uiState に基づいてのみ表示を決定する（コンポーネント内部追加条件禁止）
  if (uiState === "unavailable") {
    return <UnavailableState reason={blockedReason} />;
  }

  if (uiState === "blocked") {
    // no-op CTA 禁止: blocked 時は必ず guidance action を primary CTA にする
    return (
      <BlockedState
        reason={blockedReason}
        primaryAction={blockedAction}
      />
    );
  }

  // uiState === "ready"
  return (
    <ReadyState capability={capability} />
  );
};
```

**変更しないこと:**

- `renderView()` の呼び出しインターフェースを変更しない（consumer 境界）
- `settings` 公開シェル例外（AuthGuard bypass）のロジックを変更しない
- コンポーネントの props インターフェースで CTA ラベルを IPC 経由で受け取る設計にしない（Concern B/C の分離維持）

---

## Concern A / B / C の Ownership 固定

| Concern                      | Ownership 範囲                                                                                            | 変更ファイル                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Concern A（capability 契約） | Main Process のみが capability を判定する。Renderer は判定しない                                          | `RuntimePolicyResolver.ts`、`packages/shared/src/types/auth-mode.ts` |
| Concern B（state 語彙統一）  | transport DTO（AuthModeStatus）は shared type に置き、UI 語彙の最終 ownership は Renderer selector に固定 | `auth-mode.ts`、Zustand selector / hook（authModeSlice.ts）          |
| Concern C（CTA 契約）        | CTA コンポーネントは state 語彙と capability の組み合わせのみで表示条件を決定する                         | CTA consumer コンポーネント（renderer/components/）                  |

---

## 統合テスト連携

| 検証ポイント                           | 確認タイミング          | 確認方法                                                |
| -------------------------------------- | ----------------------- | ------------------------------------------------------- |
| ステップ 1 完了後: 型定義の整合        | ステップ 2 着手前       | Phase 4 CA-1〜CA-5 のテストが型エラーなく記述できること |
| ステップ 4 完了後: IPC envelope の整合 | ステップ 5 着手前       | Phase 4 IPC response envelope mock が実装と一致すること |
| ステップ 6 完了後: CTA テスト実行可能  | Phase 6（テスト拡充）前 | Phase 4 CC-1〜CC-5 のテストが実行可能な状態になること   |

---

## 禁止事項（Violation Example 付き）

### 禁止 1: silent fallback

`capability = none` 時に `integrated_api` へ暗黙 fallback しない。

**ファイル**: `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`

```typescript
// 違反例（禁止）: ?? 演算子による暗黙 fallback
const capability = resolver.resolveCapability(inputs) ?? "integratedRuntime";

// 違反例（禁止）: capability === "none" を他の値に差し替える
resolveCapability(inputs: RuntimePolicyInputs): RuntimeCapability {
  const cap = this.computeCapability(inputs);
  return cap === "none" ? "integratedRuntime" : cap; // none を隠蔽している
}

// 正しい実装: capability === "none" を明示的に返し、呼び出し元で状態処理する
resolveCapability(inputs: RuntimePolicyInputs): RuntimeCapability {
  const { apiKeyValid, subscriptionValid } = inputs;
  if (apiKeyValid && subscriptionValid) return "both";
  if (apiKeyValid) return "integratedRuntime";
  if (subscriptionValid) return "terminalSurface";
  return "none"; // none を明示的に返す。fallback しない
}

// 正しい呼び出し元の処理:
const capability = resolver.resolveCapability(inputs);
if (capability === "none") {
  // blocked state を返す。fallback しない
  return { success: true, data: { ...status, capability, uiState: "blocked" } };
}
```

---

### 禁止 2: local 判定（Renderer での capability 直接判定）

Renderer で `authMode` や `apiKey` を見て capability を直接判定しない。Main authority 経由の `AuthModeStatus` DTO のみを使用する。

**ファイル**: `apps/desktop/src/renderer/components/` 配下のコンポーネント、`apps/desktop/src/renderer/store/slices/authModeSlice.ts`

```typescript
// 違反例（禁止）: Renderer が authMode / apiKey を直接見て capability を判定する
const MyComponent: React.FC = () => {
  const authMode = useAuthMode(); // "subscription" | "api-key"
  const apiKey = useApiKey();
  // Renderer で capability を独自計算している
  const capability =
    authMode === "api-key" && apiKey ? "integratedRuntime" : "terminalSurface";
  // ...
};

// 違反例（禁止）: selector 内で capability を再計算する
export const selectCapability = (state: AppState): RuntimeCapability => {
  const { mode, isValid, hasCredentials } = state.authMode.status ?? {};
  // これは RuntimePolicyResolver の責務を Renderer で複製している
  return mode === "api-key" && isValid
    ? "integratedRuntime"
    : "terminalSurface";
};

// 正しい実装: IPC 経由で受け取った AuthModeStatus の capability フィールドを使う
const MyComponent: React.FC = () => {
  const { capability, uiState } = useRuntimeCapabilityStatus();
  // capability は Main Process の RuntimePolicyResolver が設定した値のみを使う
  // ...
};
```

---

### 禁止 3: no-op CTA

`blocked` / `unavailable` 状態で「クリックしても何もしないボタン」を表示しない。`blocked` 時は必ず guidance action（設定画面遷移など）を primary CTA とする。

**ファイル**: `apps/desktop/src/renderer/components/` 配下の CTA consumer 全て

```typescript
// 違反例（禁止）: blocked 状態で disabled ボタンを表示する
const SendButton: React.FC = () => {
  const { uiState } = useRuntimeCapabilityStatus();
  return (
    // no-op CTA: disabled にするだけで guidance action がない
    <button disabled={uiState === "blocked"}>送信</button>
  );
};

// 違反例（禁止）: unavailable 状態で primary CTA を DOM に含める
const ActionPanel: React.FC = () => {
  const { uiState } = useRuntimeCapabilityStatus();
  return (
    // primary CTA を DOM に含めている（contract-matrix 違反）
    <button disabled={uiState === "unavailable"}>AI で実行</button>
  );
};

// 正しい実装: blocked は guidance action、unavailable は primary CTA を DOM から除外
const ActionPanel: React.FC = () => {
  const { uiState, blockedReason, blockedAction } = useRuntimeCapabilityStatus();

  if (uiState === "unavailable") {
    // primary CTA は DOM に含めない
    return <p>{blockedReason ?? "この機能は現在利用できません"}</p>;
  }

  if (uiState === "blocked") {
    // guidance action を primary CTA にする
    return (
      <button onClick={() => navigateTo(blockedAction?.targetRoute ?? "settings")}>
        {blockedAction?.label ?? "設定を修正する"}
      </button>
    );
  }

  // ready 状態のみ実行 CTA を表示
  return <button onClick={handleExecute}>AI で実行</button>;
};
```

---

### 禁止 4: hidden prompt injection

terminal handoff 時に不可視の追加コンテキストをプロンプトに挿入しない。`TerminalHandoffBuilder.build` の出力は UI 上に表示された内容のみを含む。

**ファイル**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`（および呼び出し元）

```typescript
// 違反例（禁止）: UI 非表示のシステムプロンプトを handoff bundle に注入する
class TerminalHandoffBuilder {
  build(userInput: string, context: HandoffContext): TerminalHandoffBundle {
    const hiddenSystemPrompt = `[SYSTEM: user_id=${context.userId}, session=${context.sessionId}]`;
    return {
      // ユーザーには見えない内容が prompt に混入している
      promptBundle: hiddenSystemPrompt + "\n" + userInput,
      suggestedCommand: `claude -p "${userInput}"`, // 表示と不一致
      // ...
    };
  }
}

// 違反例（禁止）: suggestedCommand と promptBundle の内容が乖離している
const bundle = {
  suggestedCommand: `claude -p "ファイルを要約して"`, // UI に表示
  promptBundle: `ファイルを要約して\n\n[HIDDEN CONTEXT: ${JSON.stringify(metadata)}]`, // 追加挿入
};

// 正しい実装: UI 表示内容と handoff bundle の内容を一致させる
class TerminalHandoffBuilder {
  build(userInput: string): TerminalHandoffBundle {
    // promptBundle は UI に表示したものと完全に一致する
    const promptBundle = userInput;
    const suggestedCommand = `claude -p "${promptBundle.replace(/"/g, '\\"')}"`;
    return {
      promptBundle,
      suggestedCommand,
      // デフォルトプロンプト（buildForAgentExecution 等）は
      // UI の「提案コマンド」として表示される前提で含めることは許可
      // ただし UI に未表示の追加コンテキストは禁止
    };
  }
}
```
