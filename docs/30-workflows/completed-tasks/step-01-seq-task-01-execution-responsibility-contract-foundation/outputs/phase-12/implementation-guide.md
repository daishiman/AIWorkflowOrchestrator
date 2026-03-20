# Phase 12: 実装ガイド

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 12                                                        |
| 作成日   | 2026-03-20                                                |
| 最終更新 | 2026-03-20                                                |

---

## Part 1: 中学生レベルの概念説明

### なぜこれが必要か

AI アプリを使うとき、「どこに頼めば AI が動いてくれるか」が画面ごとにバラバラだと、ユーザーは戸惑います。たとえば同じアプリなのに、ある画面ではボタンを押したら AI がすぐ動き、別の画面ではボタンを押しても何も起きない、さらに別の画面では気づかないうちに「ターミナル（黒い画面）」に切り替わっていた、という状態が実際に起きていました。

このタスクでは「入口ルール」を1か所に集めて、全ての画面が同じルールで動くようにする「お品書き」を作りました。

---

### 何をするか

この機能でできることは 3 つです。

1. AI の入口を `integratedRuntime` / `terminalSurface` / `both` / `none` の 4パターンで固定する
2. 画面の状態を `ready` / `blocked` / `unavailable` の 3語彙で固定する
3. ボタン表示を primary 1件 + secondary 1件へ統一し、勝手な切り替えを禁止する

---

### capability = 「お店で何ができるか」の4パターン

あなたは「AI お店」の入口に立っています。このお店には4種類の状態があります。

| capability          | お店のたとえ                                             | 技術的な意味                                                     |
| ------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| `integratedRuntime` | お店の中にロボット店員がいて、直接注文を受けてくれる     | API キーが有効で、アプリ内で AI を直接実行できる                 |
| `terminalSurface`   | お店の窓口で「注文書」を受け取り、自分で工場に持っていく | サブスクリプション認証のみ有効で、ターミナルへの引き渡しのみ可能 |
| `both`              | ロボット店員も窓口もある。好きな方を選べる               | API キーもサブスクリプションも両方有効                           |
| `none`              | お店が閉まっている。「準備中」の看板が出ている           | 認証情報が一切なく、AI を実行できない                            |

---

### uiState = 「お店が今使えるか」の3段階

お店の「capability」が分かっても、「今日は使えるか？」を別に確認しないといけません。

| uiState       | お店のたとえ                                                   | 技術的な意味                                         |
| ------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| `ready`       | お店が開いていて、すぐに使える                                 | 実行条件が全て整っている                             |
| `blocked`     | お店はあるが、会員カードや鍵が足りない。受付に聞けば解決できる | 設定が不足しているが、操作すれば回復できる           |
| `unavailable` | そのお店はこの場所から利用できない                             | 設定画面への誘導もなく、この画面では何も解決できない |

---

### CTA = 「入口の案内板」（何をクリックすれば良いか）

`CTA`（Call To Action）とは「次に何をすれば良いかを示すボタン」のことです。

| uiState       | 案内板の内容                                                             |
| ------------- | ------------------------------------------------------------------------ |
| `ready`       | 「AI で実行」「ターミナルで実行」など、今すぐできる操作を表示する        |
| `blocked`     | 「設定を開く」など、問題を解決できる操作を表示する                       |
| `unavailable` | 実行ボタンは**表示しない**。「セットアップガイド」など案内だけを表示する |

---

### silent fallback = 「案内板なしで勝手に別の入口に誘導すること」の禁止

たとえば「AI 実行」を選んだはずなのに、こっそりターミナルに切り替わっていた——これが「silent fallback（黙ったすり替え）」です。

**これは絶対に禁止です。**

ユーザーが知らないうちに実行経路が変わると、何が動いたか分からなくなります。必ず画面に「今は何ができるか」と「次に何をすればよいか」を明示しなければなりません。

- `capability === "none"` のとき、勝手に `integratedRuntime` へ切り替えない
- `terminalSurface` が失敗しても、自動で `integratedRuntime` に切り替えない
- `blocked` のとき、空のボタン（押しても何も起きないボタン）を表示しない

---

## Part 2: 技術者向け実装詳細

### 1. 実装ファイル

このタスクで新規作成された型定義・pure function・ガード関数は次のファイルに集約されています。

| ファイル                                            | 役割                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/execution-capability.ts` | 全ての型定義・resolveCapability / resolveUiState / resolveCtaContract / assertNoSilentFallback / assertNoPrimaryCta |
| `packages/shared/src/types/auth-mode.ts`            | AuthModeStatus DTO に capability/uiState/blockedReason/blockedAction optional フィールドを追加済み                  |

---

### 2. API リファレンス

#### APIシグネチャ

```typescript
resolveCapability(input: ExecutionCapabilityInput): AccessCapability
resolveUiState(context: CapabilityContext): UiStateResult
resolveUiState(capability: AccessCapability, conditions: { hasCredentialPath: boolean }): UiState
resolveCtaContract(input: CtaInput): CtaContract
resolveCtaContract(capability: AccessCapability, uiState: UiState): CtaContract
assertNoSilentFallback(capability: AccessCapability): void
assertNoPrimaryCta(uiState: UiState, ctaContract: CtaContract): void
```

#### `AccessCapability` 型

```typescript
export type AccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";

export const CAPABILITY_VALUES = [
  "integratedRuntime",
  "terminalSurface",
  "both",
  "none",
] as const satisfies readonly AccessCapability[];
```

#### `UiState` 型

```typescript
export type UiState = "ready" | "blocked" | "unavailable";

export const UI_STATE_VALUES = [
  "ready",
  "blocked",
  "unavailable",
] as const satisfies readonly UiState[];
```

#### `CtaContract` 型

```typescript
export interface CtaContract {
  /** メインアクション。unavailable のときは null（DOM に含めない） */
  primary: { label: string; action: string } | null;
  /** サブアクション（常に存在する） */
  secondary: { label: string; action: string };
}
```

---

### 3. resolveCapability / resolveUiState / resolveCtaContract の使い方

#### 使用例

```typescript
const capability = resolveCapability({
  apiKeyValid: true,
  subscriptionValid: true,
});

const ui = resolveUiState({
  capability,
  isConnectionAvailable: true,
  isTerminalAvailable: true,
  hasResolutionAction: false,
});

const cta = resolveCtaContract({
  capability,
  uiState: ui.uiState,
  blockedAction: ui.blockedAction,
});
```

#### resolveCapability（Concern A: capability 判定）

ownership: `RuntimePolicyResolver.ts`（Main Process）

```typescript
import { resolveCapability } from "@repo/shared";

const capability = resolveCapability({
  apiKeyValid: true,
  subscriptionValid: false,
  apiKeyDegraded: false,
});
// => "integratedRuntime"
```

| 入力条件                                     | capability                             |
| -------------------------------------------- | -------------------------------------- |
| apiKeyValid=true, subscriptionValid=false    | `integratedRuntime`                    |
| apiKeyValid=false, subscriptionValid=true    | `terminalSurface`                      |
| apiKeyValid=true, subscriptionValid=true     | `both`                                 |
| apiKeyValid=false, subscriptionValid=false   | `none`                                 |
| apiKeyDegraded=true, subscriptionValid=true  | `terminalSurface`（degraded fallback） |
| apiKeyDegraded=true, subscriptionValid=false | `none`                                 |

#### resolveUiState（Concern B: UI state 導出）

ownership: Renderer selector / hook

```typescript
import { resolveUiState } from "@repo/shared";

// CapabilityContext を渡す形式（詳細版）
const result = resolveUiState({
  capability: "none",
  isConnectionAvailable: true,
  isTerminalAvailable: false,
  hasResolutionAction: true,
});
// => { uiState: "blocked", blockedReason: "認証情報が設定されていません", blockedAction: { label: "設定を開く", targetRoute: "/settings" } }

// 簡略版（後方互換）
const state = resolveUiState("integratedRuntime", { hasCredentialPath: true });
// => "ready"
```

#### resolveCtaContract（Concern C: CTA 契約導出）

ownership: CTA コンポーネント

```typescript
import { resolveCtaContract } from "@repo/shared";

const cta = resolveCtaContract("both", "ready");
// => { primary: { label: "AI で実行", action: "executeIntegrated" }, secondary: { label: "ターミナルで実行", action: "executeTerminalHandoff" } }

const ctaUnavailable = resolveCtaContract("none", "unavailable");
// => { primary: null, secondary: { label: "セットアップガイド", action: "openSetupGuide" } }
```

---

### 4. contract-matrix と関数の対応表

`outputs/phase-2/contract-matrix.md` の全 8 セルが次の対応で実装されています。

| capability          | uiState       | resolveCtaContract の返り値                                 |
| ------------------- | ------------- | ----------------------------------------------------------- |
| `integratedRuntime` | `ready`       | primary: "AI で実行" / secondary: "設定を開く"              |
| `integratedRuntime` | `blocked`     | primary: "設定を開く" / secondary: "ヘルプを表示"           |
| `terminalSurface`   | `ready`       | primary: "ターミナルで実行" / secondary: "コマンドをコピー" |
| `terminalSurface`   | `blocked`     | primary: "設定を開く" / secondary: "ヘルプを表示"           |
| `both`              | `ready`       | primary: "AI で実行" / secondary: "ターミナルで実行"        |
| `both`              | `blocked`     | primary: "設定を開く" / secondary: "ヘルプを表示"           |
| `none`              | `blocked`     | primary: "設定を開く" / secondary: "ヘルプを表示"           |
| `none`              | `unavailable` | primary: **null** / secondary: "セットアップガイド"         |

---

### 5. AuthModeStatus DTO の拡張フィールド

`packages/shared/src/types/auth-mode.ts` の `AuthModeStatus` インターフェースに以下の optional フィールドが追加されています。後方互換を維持しつつ、capability 契約を transport DTO で運べます。

```typescript
interface AuthModeStatus {
  // --- 既存フィールド（変更なし） ---
  mode: AuthMode;
  isValid: boolean;
  hasCredentials: boolean;
  message: string;
  errorCode?: AuthModeErrorCode;
  guidance?: string;
  lastCheckedAt: number;

  // --- Task01 で追加された optional フィールド ---
  capability?: AccessCapability; // 実行能力 4 状態
  uiState?: UiState; // UI 表示状態 3 値
  blockedReason?: string; // uiState === "blocked" のときのみ付帯
  blockedAction?: {
    label: string;
    targetRoute: string;
  };
}
```

Renderer 側では `uiState` が未搬送でも後方互換で導出できます。

```typescript
function selectUiState(status: AuthModeStatus): UiState {
  if (status.uiState) return status.uiState;
  if (status.isValid && status.hasCredentials) return "ready";
  if (!status.isValid && status.hasCredentials) return "blocked";
  return "unavailable";
}
```

---

### 6. 禁止事項（assertNoSilentFallback / assertNoPrimaryCta）の enforcement

#### エラーハンドリング

- `assertNoSilentFallback("none")` は `throw Error` で異常系を即座に停止する
- `assertNoPrimaryCta("unavailable", ctaContract)` は primary CTA が `null` でない場合に `throw Error` する
- `resolveUiState()` は `blockedReason` と `blockedAction` を返し、UI 側が no-op CTA を描画しないようにする
- degraded input（`apiKeyDegraded=true`）では `resolveCapability()` が `integratedRuntime` を返さず、誤実行を防ぐ

これらのガード関数は、禁止事項違反を**実行時エラー**として検出します。テストコードでの invariant 確認と本番コードでの防衛に使用します。

#### assertNoSilentFallback

`capability === "none"` のとき `integratedRuntime` への暗黙遷移を禁止します（P62 対策）。

```typescript
import { assertNoSilentFallback } from "@repo/shared";

// RuntimePolicyResolver で capability を決定する前に呼ぶ
assertNoSilentFallback(resolvedCapability);
// capability === "none" のとき throw Error
```

#### assertNoPrimaryCta

`uiState === "unavailable"` のとき primary CTA が null であることを検証します。

```typescript
import { assertNoPrimaryCta } from "@repo/shared";

// CTA コンポーネントの render 前に呼ぶ
assertNoPrimaryCta(uiState, ctaContract);
// uiState === "unavailable" かつ primary !== null のとき throw Error
```

---

### 7. 現行コード語彙との対応（legacy literal 写像表）

現行コードや既存仕様に残っている legacy literal を読む際は次の対応で解釈します。

| execution-capability.ts の canonical 語彙 | legacy / current spec 上の表現     |
| ----------------------------------------- | ---------------------------------- |
| `integratedRuntime`                       | `integrated_api`                   |
| `terminalSurface`                         | `terminal_handoff`                 |
| `both`                                    | 明示値なし（両 lane 同時利用可能） |
| `none`                                    | 明示値なし（実行 lane 一切なし）   |

---

### 8. 禁止事項と enforcement レイヤー

| 禁止事項                | enforcement レイヤー                                                      | 期待される振る舞い                                        |
| ----------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| silent fallback         | `RuntimePolicyResolver.ts`（capability 判定）+ `assertNoSilentFallback()` | `none` 条件で別 lane を勝手に選ばない                     |
| auto-send               | TerminalHandoffBuilder / Main IPC handler                                 | ユーザー操作なしで terminal 実行しない                    |
| hidden prompt injection | TerminalHandoffBuilder                                                    | UI に出ていない prompt を裏で送らない                     |
| no-op CTA               | CTA コンポーネント + `assertNoPrimaryCta()`                               | `blocked` / `unavailable` で空クリックを作らない          |
| disabled CTA            | CTA コンポーネント                                                        | `unavailable` で disabled ボタンを出さず DOM から除外する |

---

### 9. 実装時の読み順

下流 Task（Task02-09）の実装者はこの順に読んでください。

1. `outputs/phase-2/contract-matrix.md` — capability x state x CTA の全組み合わせ契約
2. `outputs/phase-2/validation-matrix.md` — 検証観点マトリクス
3. `outputs/phase-2/design-summary.md` — 3 concern 分解と ownership 表
4. `packages/shared/src/types/execution-capability.ts` — 型定義と pure function の実装正本
5. `packages/shared/src/types/auth-mode.ts` — AuthModeStatus DTO 拡張フィールド
6. `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` — current canonical entrypoint
7. `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md` — transport 境界
8. `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md` — IPC 契約参照
9. `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` — terminal lane の禁止事項根拠

---

### 10. エッジケース

- `both` では primary CTA は `integratedRuntime`（AI で実行）、secondary は `terminalSurface`（ターミナルで実行）。片方が失敗しても自動切り替えしない
- `none` では disabled button を見せず、理由 + 解決 action の組を見せる（`blocked`）か、実行 CTA を DOM から除外する（`unavailable`）
- `blockedReason` がある場合は CTA の visible state とセットで扱い、空 action を許可しない
- terminal lane がある場合でも、background AI job を terminal に自動置換しない
- `apiKeyDegraded=true` のとき、subscriptionValid が true なら `terminalSurface` に降格する（`integratedRuntime` を返さない）

---

### 11. 設定と定数

| 種別                         | 名前                | 値 / 内容                                                  |
| ---------------------------- | ------------------- | ---------------------------------------------------------- |
| capability 定数一覧          | `CAPABILITY_VALUES` | `["integratedRuntime", "terminalSurface", "both", "none"]` |
| uiState 定数一覧             | `UI_STATE_VALUES`   | `["ready", "blocked", "unavailable"]`                      |
| blockedAction 既定 label     | `label`             | `"設定を開く"`                                             |
| blockedAction 既定 route     | `targetRoute`       | `"/settings"`                                              |
| unavailable secondary action | `action`            | `"openSetupGuide"`                                         |
