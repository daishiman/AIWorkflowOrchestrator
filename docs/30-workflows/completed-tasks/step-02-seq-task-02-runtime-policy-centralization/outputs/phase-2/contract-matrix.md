# Phase 2: 契約マトリクス - Runtime Policy Centralization

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| タスク種別   | design（設計タスク）                       |
| 作成日       | 2026-03-21                                 |
| ステータス   | Phase 2 完了                               |
| 受入基準対応 | AC-1 / AC-2 / AC-4                         |
| 後続フェーズ | Phase 3（設計レビュー）                    |

---

## 1. Ownership Table（AC-1 対応）

以下の 4 カテゴリについて、所有層・入力・出力・禁止事項を定義する。

### 1-1. runtime 実行可否（integrated / handoff）

| 項目     | 内容                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| 判定主体 | Main Process（`IRuntimePolicyResolver.resolve()`）                                                |
| 所有層   | Main Process のみ                                                                                 |
| 入力     | `authMode`（AuthMode）、`apiKey`（string \| null）— いずれも Main Process 内部からのみ取得        |
| 出力型   | `RuntimeDecision`（`{ type: "integrated_api" }` または `{ type: "terminal_handoff"; bundle }`）   |
| 呼出元   | 各 surface の IPC ハンドラー（aiHandlers / agentHandlers / skillHandlers / skillCreatorHandlers） |
| 禁止層   | **Renderer**（authMode を参照して integrated / handoff を自ら判定することを禁止）                 |
| 禁止事項 | Renderer で `authMode === "subscription"` 等の分岐を行い実行経路を切り替えること                  |
| 移行注記 | `RuntimeResolver.resolve()` は deprecated。Task03-09 の実装移行後に削除する                       |

---

### 1-2. health check の実行主体

| 項目     | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 判定主体 | Main Process（`llm:check-health` IPC ハンドラー）                                     |
| 所有層   | Main Process（実行）/ Renderer Store `llmSlice.healthStatus`（表示キャッシュのみ）    |
| 入力     | `providerId`（string）                                                                |
| 出力型   | `HealthCheckResult`（`status` / `providerId` / `errorMessage` / `checkedAt`）         |
| 呼出元   | `llmSlice.checkHealth()` → `window.electronAPI.llm.checkHealth()`                     |
| 禁止層   | **Renderer**（`healthStatus` を参照して実行可否を判定することを禁止）                 |
| 禁止事項 | `healthStatus.status === "healthy"` 等を条件に runtime 実行経路を切り替えること       |
| 表示許容 | `healthStatus` を参照してプロバイダーの接続状態をアイコンや色で「表示する」ことは許容 |

---

### 1-3. handoff bundle の構築

| 項目     | 内容                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| 判定主体 | Main Process（`TerminalHandoffBuilder.buildForSurface()`）                                                           |
| 所有層   | Main Process（`TerminalHandoffBuilder`）                                                                             |
| 入力     | `prompt`（string）、`cwd`（string）、`surfaceType`（SurfaceType）、`reason`（string）                                |
| 出力型   | `HandoffGuidance`（`terminalCommand` / `contextSummary` / `reason`）— IPC 経由で Renderer に送信可能                 |
| 呼出元   | 各 surface の IPC ハンドラー（`RuntimeDecision.type === "terminal_handoff"` の分岐内）                               |
| 禁止層   | **Renderer**（`TerminalHandoffBundle` を直接生成・参照することを禁止）                                               |
| 禁止事項 | Renderer が `TerminalHandoffBundle`（Main 内部型）を受け取り、表示用テキストを自前で組み立てること                   |
| 移行注記 | `buildForAgentExecution` / `buildForSkillExecution` は deprecated。`buildForSurface` への統一移行を Task03-09 で実施 |

---

### 1-4. authMode の参照権限

| 項目     | 内容                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------- |
| 判定主体 | Main Process（`IAuthModeService.getMode()`）                                                         |
| 所有層   | Main Process（生値）/ Renderer Store `authModeSlice.mode`（表示・ラベル用）                          |
| 入力     | なし（サービス内部で取得）                                                                           |
| 出力型   | `AuthMode`（`"api-key"` / `"subscription"` 等）                                                      |
| 禁止層   | **Renderer**（`authMode` を参照して runtime 判定を行うことを禁止）                                   |
| 禁止事項 | `authModeSlice.mode === "api-key"` 等を条件に、AI 実行を integrated または handoff に分岐させること  |
| 表示許容 | `authModeSlice.mode` を参照して UI ラベル（「API Key モード」など）を表示することは許容              |
| 特記事項 | `createFallbackStatus(mode, overrides)` による Renderer 側での状態生成も、実行可否判定への流用は禁止 |

---

## 2. 型契約テーブル（AC-3 対応）

### 警告

> 以下の型定義を変更する場合は、Step 03-09 の全 surface（AI Chat / Agent / Skill / Skill Creator）に影響する。変更前に全 surface のハンドラーとの整合確認が必須。

| 型名                    | 所有層          | IPC 通過可否 | 必須フィールド                                                                      | Renderer 参照可否 |
| ----------------------- | --------------- | ------------ | ----------------------------------------------------------------------------------- | ----------------- |
| `RuntimeDecision`       | packages/shared | 条件付き可   | `type`（`"integrated_api"` \| `"terminal_handoff"`）                                | 可（表示用）      |
|                         |                 |              | ※ `integrated_api` の場合: `apiKey` は IPC 送信前に除外                             |                   |
|                         |                 |              | ※ `terminal_handoff` の場合: `bundle`（`TerminalHandoffBundle`）は IPC 送信前に除外 |                   |
| `HandoffGuidance`       | packages/shared | 可           | `terminalCommand`（string）                                                         | 可（表示・CTA）   |
|                         |                 |              | `contextSummary`（string）                                                          |                   |
|                         |                 |              | `reason`（string）                                                                  |                   |
| `HealthCheckResult`     | packages/shared | 可           | `status`（`"healthy"` \| `"unhealthy"` \| `"unknown"`）                             | 可（表示のみ）    |
|                         |                 |              | `providerId`（string）                                                              |                   |
|                         |                 |              | `errorMessage`（string \| null）                                                    |                   |
|                         |                 |              | `checkedAt`（number — Unix timestamp）                                              |                   |
| `RuntimeResolution`     | apps/desktop    | 不可         | `type`（`"integrated"` \| `"handoff"`）                                             | 禁止              |
|                         | （deprecated）  |              | `reason`（string、handoff の場合のみ）                                              |                   |
| `TerminalHandoffBundle` | apps/desktop    | 不可         | `launcher`、`promptBundle`、`cwd`、`suggestedCommand`                               | 禁止              |
|                         | （Main 内部型） |              | `manualRetryRule`、`runbook?`                                                       |                   |
| `SurfaceType`           | packages/shared | 不要         | `"agent"` \| `"skill"` \| `"chat"` \| `"skill-creator"`（string literal union）     | 可（DI 引数）     |

---

## 3. Health Route Ownership（AC-2 対応）

| route                 | status          | 所有層                           | 新規利用 | 廃止条件                                     |
| --------------------- | --------------- | -------------------------------- | -------- | -------------------------------------------- |
| `llm:check-health`    | **primary**     | Main Process（`llmHandlers.ts`） | 必須     | N/A（primary のため廃止しない）              |
| `AI_CHECK_CONNECTION` | **legacy 残置** | Main Process（`aiHandlers.ts`）  | **禁止** | Step 03-09 の全 surface 移行完了後に削除可能 |

### legacy route の残置条件詳細

| 条件項目           | 内容                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| 残置理由           | 後方互換性のため。既存の呼び出し元がゼロであることが確認されるまで削除しない               |
| 残置期間           | Task03（AI Chat）〜 Task09 の全 surface 移行が完了するまで                                 |
| 新規コードでの使用 | 禁止。`AI_CHECK_CONNECTION` を import・参照する新規コードを追加してはならない              |
| 廃止トリガー       | `grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/` の結果が 0 件になった時点      |
| 廃止手続き         | 廃止トリガー成立後、専用の cleanup タスクを作成し `aiHandlers.ts` から当該ハンドラーを削除 |
| 現行の動作         | `{ status: "disconnected" }` を固定返却。実際の接続テストは行わない                        |

---

## 4. Policy Consumption Contract（AC-4 対応）

### 概要

Step 03-09 の各 surface（AI Chat / Agent / Skill / Skill Creator）の IPC ハンドラーが従うべき 4 原則を定義する。

> **警告**: この contract を変更する場合は、Step 03-09 の全 surface に影響する。変更前に ownership table および型定義との整合を確認すること。

---

### 原則 1: runtime 判定は IRuntimePolicyResolver.resolve() 経由のみ

```
[禁止] ハンドラー内で authMode や apiKey を参照して integrated / handoff を自ら決定する
[必須] IRuntimePolicyResolver.resolve(authMode, apiKey) の返り値で経路を決定する
[必須] authMode / apiKey は Main Process 内部（IAuthModeService / IAuthKeyService）から取得する
[禁止] IPC の引数から authMode / apiKey を受け取ってはならない
```

**契約型**:

```typescript
// ハンドラーが参照する型（packages/shared から import）
import type { RuntimeDecision } from "@repo/shared/types";

const decision: RuntimeDecision = await runtimePolicyResolver.resolve(
  authMode,
  apiKey,
);

if (decision.type === "integrated_api") {
  // LLM 直接実行
  // ※ decision.apiKey は内部でのみ使用し、IPC レスポンスに含めない
} else {
  // terminal_handoff: HandoffGuidance を Renderer に返す
}
```

---

### 原則 2: health check は llm:check-health 経由のみ

```
[禁止] AI_CHECK_CONNECTION チャンネルを新規コードから呼び出す
[必須] window.electronAPI.llm.checkHealth(providerId) を使用する
[必須] 結果は HealthCheckResult 型（packages/shared から import）として受け取る
[禁止] health 結果を runtime 実行可否の判定に使用する（表示目的のみ許容）
```

**契約型**:

```typescript
import type { HealthCheckResult } from "@repo/shared/types";

const result: HealthCheckResult =
  await window.electronAPI.llm.checkHealth(providerId);
// result.status を UI 表示目的で参照することは可
// result.status を使って integrated / handoff を決定することは禁止
```

---

### 原則 3: handoff は TerminalHandoffBuilder.buildForSurface() 経由のみ

```
[禁止] TerminalHandoffBundle を Renderer に直接送信する
[禁止] buildForAgentExecution / buildForSkillExecution を新規コードで使用する（deprecated）
[必須] buildForSurface(request, surfaceType, reason) を使用する
[必須] Renderer には HandoffGuidance 型（packages/shared から import）を返す
```

**契約型**:

```typescript
import type { HandoffGuidance, SurfaceType } from "@repo/shared/types";

const guidance: HandoffGuidance = terminalHandoffBuilder.buildForSurface(
  { prompt, cwd },
  "agent" satisfies SurfaceType,
  reason,
);
// IPC レスポンスに guidance を含めて Renderer に送信可
```

---

### 原則 4: 型は packages/shared から import のみ

```
[禁止] apps/desktop/src/main/ 内の型を Renderer 側コードから直接 import する
[必須] IPC 境界を越える全ての型を packages/shared/src/types/ に配置する
[必須] RuntimeDecision / HandoffGuidance / HealthCheckResult / SurfaceType は
       packages/shared からのみ参照する
[禁止] TerminalHandoffBundle / RuntimeResolution を Renderer から参照する
```

**import パターン**:

```typescript
// 正しい（Renderer / Main 両方で使用可）
import type {
  RuntimeDecision,
  HandoffGuidance,
  HealthCheckResult,
  SurfaceType,
} from "@repo/shared/types";

// 禁止（Main 内部型を直接参照）
import type { TerminalHandoffBundle } from "../../main/services/runtime/RuntimePolicyResolver";
import type { RuntimeResolution } from "../../main/services/runtime/RuntimeResolver";
```

---

## 5. RuntimeResolver 移行計画

| 項目            | 内容                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| 現行の使用箇所  | Task03-09 の対象ファイルで `RuntimeResolver.resolve()` を呼び出している箇所（調査中） |
| 移行先          | `IRuntimePolicyResolver.resolve(authMode, apiKey)`                                    |
| 移行タイミング  | 各 surface の Task 実装フェーズ（Task03: AI Chat から順次）                           |
| deprecated 宣言 | Phase 5 実装開始時に `RuntimeResolver.ts` に `@deprecated` JSDoc を追加               |
| 削除条件        | 全 surface の移行完了後（`grep -rn "RuntimeResolver" apps/desktop/src/` が 0 件）     |
| 削除担当        | 専用 cleanup タスクを作成して対応                                                     |
