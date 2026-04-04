# Phase 1: 要件抽出マップ (Spec Extraction Map)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 1                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

## 1. 抽出元スキル定義

| スキル名                     | 役割                                   | 抽出対象                                                           |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| `task-specification-creator` | Phase 構造・必須成果物・完了条件の正本 | Phase ゲート構造、成果物命名規則、完了条件パターン                 |
| `aiworkflow-requirements`    | 仕様正本・canonical reference の正本   | canonical path、spec sync ルール、quality / lesson / workflow 正本 |

## 2. Phase 別 Tool Policy 定義

### 2.1 policy 一覧

| Phase     | permissionMode  | allowedTools                                  | disallowedTools                               | canUseTool 判断ロジック                           |
| --------- | --------------- | --------------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| `plan`    | `"default"`     | `Read`, `Glob`, `Grep`, `WebSearch`           | `Write`, `Edit`, `Bash`, `Execute`            | 変更を伴う tool は全て拒否。読取系のみ許可        |
| `execute` | `"acceptEdits"` | `Read`, `Write`, `Edit`, `Bash`               | repo-wide destructive (`rm -rf`, `git reset`) | 生成対象 skill dir への provenance 一致時のみ許可 |
| `verify`  | `"default"`     | `Read`, `Glob`, `Grep`, `Bash`(test/lint限定) | `Write`, `Edit`                               | 読取と検証コマンドのみ許可。書込系は全拒否        |
| `improve` | `"acceptEdits"` | `Read`, `Edit`                                | `Write`(新規作成), destructive, unrelated     | 改善対象ファイルのみ Edit 許可。対象外パスは拒否  |

### 2.2 permissionMode / allowedTools / disallowedTools 要件

```typescript
/**
 * skill-creator lane の各 phase を表す型。
 * plan / execute / verify / improve の 4 phase で構成される。
 */
type SkillCreatorPhase = "plan" | "execute" | "verify" | "improve";

/**
 * Claude Code SDK の permissionMode に対応する値。
 * - "default": デフォルト権限（tool 実行前に確認を行う）
 * - "acceptEdits": ファイル編集を自動承認する
 * - "bypassPermissions": 全 tool を自動承認する（本タスクでは使用しない）
 */
type SdkPermissionMode = "default" | "acceptEdits" | "bypassPermissions";
```

**制約事項**:

- `bypassPermissions` は skill-creator lane では使用禁止（AC-2 準拠）
- `execute` phase の `acceptEdits` は生成対象 skill ディレクトリに限定する
- `improve` phase の `acceptEdits` は既存ファイルの Edit のみに限定する

### 2.3 canUseTool 判断要件

`canUseTool` コールバックは以下の判断基準で構成する:

1. **phase 判定**: 現在の phase に基づき、base policy を取得する
2. **tool 名チェック**: `allowedTools` / `disallowedTools` によるホワイトリスト/ブラックリスト判定
3. **パス制約チェック** (execute/improve): tool の対象パスが許可された scope 内にあるか判定
4. **provenance 一致チェック** (execute): `sourceProvenance.resolvedSkillCreatorRoot` と tool の対象パスの prefix が一致するか判定
5. **denial 記録**: 拒否時は `reason` を構造化して audit sink に記録する

```typescript
interface CanUseToolInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
}

interface CanUseToolResult {
  allowed: boolean;
  reason?: string;
}
```

## 3. Hooks 要件定義

### 3.1 Hook ライフサイクル

```
SessionStart → [PreToolUse → PostToolUse]* → SessionEnd
```

### 3.2 Hook 別要件

| Hook           | 発火タイミング     | 責務                                    | 記録項目                                                          |
| -------------- | ------------------ | --------------------------------------- | ----------------------------------------------------------------- |
| `SessionStart` | SDK session 開始時 | provenance 記録、phase 初期化情報の記録 | `sessionId`, `phase`, `sourceProvenance`, `timestamp`             |
| `PreToolUse`   | tool 実行前        | policy 判定、denial 時の早期拒否        | `toolName`, `phase`, `decision`(allow/deny), `reason`             |
| `PostToolUse`  | tool 実行後        | 実行結果の記録、副作用の追跡            | `toolName`, `phase`, `result`(success/error), `duration`          |
| `SessionEnd`   | SDK session 終了時 | session summary の記録、audit 確定      | `sessionId`, `phase`, `totalToolCalls`, `denialCount`, `duration` |

### 3.3 Hooks の不変条件

- Hooks は監査（audit）のみを担い、**主処理（plan/execute/verify/improve）のロジックを固定化しない**
- Hooks は `.claude/skills/skill-creator/` の動的読込を制限・変更しない
- PreToolUse の deny 判定は canUseTool と同一ポリシーに基づくが、audit 記録を追加する

## 4. Provenance / Audit / Denial 記録要件

### 4.1 Provenance 要件

| 項目                       | 要件                                        |
| -------------------------- | ------------------------------------------- |
| `resolvedSkillCreatorRoot` | 動的に解決された skill-creator のルートパス |
| `resourceDescriptorHash`   | manifest の resource descriptor の hash 値  |
| `manifestPath`             | 使用された manifest ファイルのパス          |
| `manifestCacheKey`         | manifest の cache key（変更検知用）         |
| `candidateRoots`           | 解決候補として検出されたルートパス一覧      |
| `selectedRoots`            | 最終的に選択されたルートパス一覧            |

### 4.2 Audit Event 要件

```typescript
interface GovernanceAuditEvent {
  eventId: string;
  timestamp: string;
  sessionId: string;
  phase: SkillCreatorPhase;
  hookType: "SessionStart" | "PreToolUse" | "PostToolUse" | "SessionEnd";
  toolName?: string;
  decision?: "allow" | "deny";
  reason?: string;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  durationMs?: number;
  errorMessage?: string;
}
```

### 4.3 Denial 記録要件

- permission denial 発生時、以下を必ず記録する:
  - 拒否された tool 名
  - 拒否理由（human-readable）
  - 拒否時の phase
  - 拒否時の provenance
- denial 記録は UI 表示用 payload にも含める（AC-4 準拠）

## 5. Canonical Path 一覧

| ファイル                                                              | 現状の役割                  | TASK-P0-09 での扱い                            |
| --------------------------------------------------------------------- | --------------------------- | ---------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | SDK 呼び出しの orchestrator | phase 別 permission option 注入                |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | renderer bridge             | governance 状態の公開                          |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | preload API                 | audit / permission 表示用 payload 公開         |
| `packages/shared/src/types/skillCreator.ts`                           | 共通型                      | governance / audit event 型追加                |
| `.claude/skills/skill-creator/`                                       | 動的読込対象の正本          | provenance と resource root を監査対象へ含める |

### 5.1 新規追加予定ファイル

| ファイル（予定）                                                         | 責務                        |
| ------------------------------------------------------------------------ | --------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorGovernancePolicy.ts` | phase 別 policy resolver    |
| `apps/desktop/src/main/services/runtime/SkillCreatorHooksFactory.ts`     | hooks 生成・audit sink 接続 |
| `apps/desktop/src/main/services/runtime/SkillCreatorAuditSink.ts`        | audit event の一元記録      |

## 6. Dependency Edge

```
TASK-RT-06 (SDK message 正規化)
    ↓
TASK-P0-03 (動的 skill-creator manifest 配置)
    ↓
TASK-P0-04 (dynamic pipeline 有効化)
    ↓
TASK-P0-09 (permission / hooks / governance)  ← 本タスク
```

**依存先の確認結果**:

- TASK-RT-06: `normalizeSdkMessage()` / `normalizeSdkStream()` が `RuntimeSkillCreatorFacade` に実装済み
- TASK-P0-03: `ManifestLoader` / `SkillCreatorSourceResolver` が配置済み
- TASK-P0-04: `PhaseResourcePlanner` / `ResolvedResourceReader` による dynamic pipeline が動作可能

## 7. 既存実装との整合確認

### 7.1 破棄対象: なし

既存の `RuntimeSkillCreatorFacade` の `plan()` / `execute()` / `improve()` メソッドはそのまま維持する。本タスクは既存メソッドに governance layer を**追加注入**するのみであり、既存ロジックの破棄・置換は行わない。

### 7.2 拡張対象

- `RuntimeSkillCreatorFacade.plan()`: SDK `query()` option に `permissionMode` / `allowedTools` を注入
- `RuntimeSkillCreatorFacade.execute()`: SDK `query()` option に `permissionMode` / `canUseTool` を注入
- `creatorHandlers.ts`: governance audit event を renderer に push する channel 追加
- `skill-creator-api.ts`: governance / audit 読取 API 追加
- `skillCreator.ts`: `GovernanceAuditEvent` / `SkillCreatorSdkPolicy` 型追加

## 8. 抽出完了チェック

- [x] phase 別 tool policy が列挙されている
- [x] permissionMode / allowedTools / disallowedTools / canUseTool の要件が定義されている
- [x] Hooks と audit payload の要件が定義されている
- [x] 2 つの skill 定義（task-specification-creator / aiworkflow-requirements）から抽出すべき項目が固定されている
- [x] canonical path と dependency edge が明記されている
- [x] 既存実装を破棄すべき前提が紛れ込んでいないことを確認済み
