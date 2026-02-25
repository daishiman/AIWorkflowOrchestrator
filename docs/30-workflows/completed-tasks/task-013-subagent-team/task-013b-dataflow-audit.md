---
id: TASK-013B-DATAFLOW-AUDIT
tier: 2
title: task-013B データフロー監査
phase: 1
depends_on: [TASK-013]
parallel_with: [TASK-013A-CONTRACT-AUDIT, TASK-013C-UI-BOUNDARY-AUDIT]
blocks: [TASK-013D-SEQUENCE-REDESIGN]
status: completed
priority: high
estimated_complexity: small
tags: [docs, ipc, dataflow, iso8601, date-boundary, event-payload]

execution:
  mode: sequential
  timeout_minutes: 30
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: false
  require_typecheck: false

artifacts:
  creates:
    - docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/ipc-date-boundary-rules.md
    - docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/event-payload-consistency.md
  modifies: []
---

# task-013B データフロー監査

## メタ情報

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 監査対象 | task-9D〜9J（7タスク仕様書）                                 |
| 監査観点 | Date境界型、イベントpayload、DTO/Props型整合                 |
| 正本参照 | S19（IPC Date型シリアライズ）、S21（仕様書間型ギャップ検出） |
| 監査日   | 2026-02-25                                                   |
| 担当     | SubAgent-B                                                   |

## 目的

task-9D〜9J の全仕様書を横断し、以下の3点を検証する：

1. **Date境界統一**: IPC境界を越える全Dateフィールドが `string; // ISO 8601` 方針（S19準拠）に従っているか
2. **イベントpayload整合**: `skill:debug:event` 等のイベントチャネルのpayloadスキーマが定義されているか
3. **DTO/Props型整合**: バックエンド型定義と正本（`interfaces-agent-sdk-skill.md`）の間に型ギャップがないか

## 実行タスク

| #   | タスク名               | 説明                                                                  |
| --- | ---------------------- | --------------------------------------------------------------------- |
| 1   | Dateフィールド全量抽出 | 7仕様書の全Dateフィールドを抽出しISO 8601準拠を確認                   |
| 2   | イベントpayload検証    | 全イベントチャネルのpayloadスキーマ定義有無を確認                     |
| 3   | 正本との型ギャップ検出 | `interfaces-agent-sdk-skill.md` のDate型フィールドとの整合確認        |
| 4   | safeOn購読パターン確認 | useEffect cleanup統合の記載有無を確認                                 |
| 5   | 統一ルール文書作成     | `ipc-date-boundary-rules.md` と `event-payload-consistency.md` を作成 |

## 参照資料

| 参照資料                            | パス                                                                                                    | 参照セクション                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| S19: IPC Date型シリアライズパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` L2315-L2367 | 適用基準・仕様書での型注記                                                             |
| S21: 仕様書間型ギャップ検出パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` L2424-L2465 | 検出手順・検証コマンド                                                                 |
| 型定義正本                          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                       | Skill型・SkillRunResult型・BackupInfo型                                                |
| タスク台帳                          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                    | task-9系是正履歴（UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001）                    |
| task-9F                             | `task-022-task-9f-skill-share.md`                                                                       | ImportResult・ExportResult型                                                           |
| task-9G                             | `task-023a-task-9g-skill-schedule.md`                                                                   | ScheduledSkill・ScheduledRunResult型                                                   |
| task-9H                             | `task-023b-task-9h-skill-debug.md`                                                                      | DebugSession・DebugStep・CallStackEntry型                                              |
| task-9I                             | `task-023c-task-9i-skill-docs.md`                                                                       | GeneratedDoc型                                                                         |
| task-9J                             | `task-023d-task-9j-skill-analytics.md`                                                                  | SkillUsageEvent・SkillStatistics・AnalyticsPeriod・TrendDataPoint・SkillUsageSummary型 |
| task-9D                             | `task-023e-task-9d-skill-chain.md`                                                                      | SkillChainDefinition型                                                                 |
| task-9E                             | `task-023f-task-9e-skill-fork.md`                                                                       | ForkOptions・ForkResult型                                                              |

## 実行手順

### Step 1: 全Dateフィールド抽出と準拠判定

7仕様書の全Dateフィールドを抽出し、S19の3要件（①型が`string`、②`@format ISO 8601` JSDoc付与、③`// ISO 8601`コメント付与）への準拠を確認する。

#### 監査結果: Dateフィールド全量テーブル（18フィールド）

| #   | フィールド名  | 仕様書  | 所属インターフェース   | 現在の型         | `@format` JSDoc | `// ISO 8601` | nullable | 差分                      |
| --- | ------------- | ------- | ---------------------- | ---------------- | --------------- | ------------- | -------- | ------------------------- |
| 1   | `importedAt`  | TASK-9F | `ImportResult`         | `string`         | ✅              | ✅            | No       | なし                      |
| 2   | `lastRun`     | TASK-9G | `ScheduledSkill`       | `string \| null` | ✅              | ✅            | Yes      | なし                      |
| 3   | `nextRun`     | TASK-9G | `ScheduledSkill`       | `string \| null` | ✅              | ✅            | Yes      | なし                      |
| 4   | `runAt`       | TASK-9G | `SkillSchedule`        | `string \| null` | ✅              | ✅            | Yes      | なし                      |
| 5   | `startedAt`   | TASK-9G | `ScheduledRunResult`   | `string`         | ✅              | ✅            | No       | なし                      |
| 6   | `completedAt` | TASK-9G | `ScheduledRunResult`   | `string \| null` | ✅              | ✅            | Yes      | なし                      |
| 7   | `startedAt`   | TASK-9H | `DebugSession`         | `string`         | ✅              | ✅            | No       | なし                      |
| 8   | `timestamp`   | TASK-9H | `DebugStep`            | `string`         | ✅              | ✅            | No       | なし                      |
| 9   | `startTime`   | TASK-9H | `CallStackEntry`       | `string`         | ✅              | ✅            | No       | なし                      |
| 10  | `generatedAt` | TASK-9I | `GeneratedDoc`         | `string`         | ✅              | ✅            | No       | なし                      |
| 11  | `timestamp`   | TASK-9J | `SkillUsageEvent`      | `string`         | ✅              | ✅            | No       | なし                      |
| 12  | `lastUsed`    | TASK-9J | `SkillStatistics`      | `string \| null` | ✅              | ✅            | Yes      | なし                      |
| 13  | `start`       | TASK-9J | `AnalyticsPeriod`      | `string`         | ✅              | ✅            | No       | なし                      |
| 14  | `end`         | TASK-9J | `AnalyticsPeriod`      | `string`         | ✅              | ✅            | No       | なし                      |
| 15  | `timestamp`   | TASK-9J | `TrendDataPoint`       | `string`         | ✅              | ✅            | No       | なし                      |
| 16  | `lastUsed`    | TASK-9J | `SkillUsageSummary`    | `string`         | ✅              | ✅            | **No**   | **nullable不整合（M-1）** |
| 17  | `createdAt`   | TASK-9D | `SkillChainDefinition` | `string`         | ❌              | ❌            | No       | **注記欠落（M-2）**       |
| 18  | `updatedAt`   | TASK-9D | `SkillChainDefinition` | `string`         | ❌              | ❌            | No       | **注記欠落（M-3）**       |

#### 差分詳細

##### M-1: SkillUsageSummary.lastUsed のnullable不整合

- **現状**: `SkillUsageSummary.lastUsed: string`（non-nullable）
- **問題**: 同仕様書内の `SkillStatistics.lastUsed` は `string | null`（nullable）。スキルが一度も使用されていない場合 `lastUsed` は `null` であるべき
- **期待**: `string | null; // ISO 8601`
- **既存追跡**: UT-IPC-DATA-FLOW-NULLABLE-CONSISTENCY-001（未タスク登録済み）

##### M-2/M-3: SkillChainDefinition の ISO 8601 注記欠落

- **現状**: `createdAt: string;` / `updatedAt: string;` — `@format` JSDocと `// ISO 8601` コメントの両方が欠落
- **問題**: TASK-9D には「IPC シリアライズ方針（Date 型）」セクション自体が存在しない。他の6タスク（9F/9G/9H/9I/9J/9E）はすべて同セクションを持つが、TASK-9D のみ欠落
- **期待**: `@format ISO 8601` JSDocと `// ISO 8601` コメントを追加し、IPCシリアライズ方針セクションを他タスクと同形式で追記
- **修正方針**: TASK-9Dのcreated/updatedAtを以下に変更

```typescript
// 修正前
export interface SkillChainDefinition {
  // ...
  createdAt: string;
  updatedAt: string;
}

// 修正後
export interface SkillChainDefinition {
  // ...
  /** @format ISO 8601 — IPC経由では string として送受信 */
  createdAt: string; // ISO 8601
  /** @format ISO 8601 — IPC経由では string として送受信 */
  updatedAt: string; // ISO 8601
}
```

### Step 2: イベントpayloadスキーマ検証

task-9系仕様書で定義されたイベントチャネル（`safeOn`で購読するチャネル）のpayload型定義を確認する。

#### イベントチャネル一覧

| #   | チャネル名          | 仕様書  | payloadの型定義            | 差分                |
| --- | ------------------- | ------- | -------------------------- | ------------------- |
| 1   | `skill:debug:event` | TASK-9H | `DebugEvent`（**未定義**） | **E-1: 型定義欠落** |

##### E-1: DebugEvent型未定義

- **現状**: `SkillDebugger.emitDebugEvent(event: DebugEvent)` で参照されているが、`DebugEvent` インターフェースが `debug.ts` 型定義セクションに存在しない
- **問題**: Renderer側で `safeOn('skill:debug:event', callback)` を購読する際、callbackの引数型が不明確。DebugEvent が breakpoint hit / step completed / session ended のどれを運ぶか判別できない
- **期待する型定義**:

```typescript
export type DebugEvent =
  | {
      type: "breakpoint_hit";
      sessionId: string;
      step: DebugStep;
      breakpointId: string;
    }
  | { type: "step_completed"; sessionId: string; step: DebugStep }
  | { type: "session_paused"; sessionId: string }
  | { type: "session_resumed"; sessionId: string }
  | {
      type: "session_completed";
      sessionId: string;
      /** @format ISO 8601 */ completedAt: string;
    }
  | { type: "session_error"; sessionId: string; error: string }
  | {
      type: "variable_changed";
      sessionId: string;
      path: string;
      value: unknown;
    };
```

- **修正方針**: TASK-9H の `debug.ts` 型定義セクションに `DebugEvent` Discriminated Union型を追加

### Step 3: 正本（interfaces-agent-sdk-skill.md）との型ギャップ

#### 正本のDate型フィールド

| #   | フィールド                   | 所属型           | 正本での型 | IPC境界での期待型     | 備考                                  |
| --- | ---------------------------- | ---------------- | ---------- | --------------------- | ------------------------------------- |
| 1   | `Skill.lastModified`         | `Skill`          | `Date`     | `string; // ISO 8601` | 正本はバックエンド型、IPC型は別途定義 |
| 2   | `SkillRunResult.startedAt`   | `SkillRunResult` | `Date`     | `string; // ISO 8601` | 同上                                  |
| 3   | `SkillRunResult.completedAt` | `SkillRunResult` | `Date`     | `string; // ISO 8601` | 同上                                  |
| 4   | `BackupInfo.createdAt`       | `BackupInfo`     | `Date`     | `string; // ISO 8601` | 同上                                  |
| 5   | `BackupInfo.timestamp`       | `BackupInfo`     | `number`   | `number`（ミリ秒）    | **Date型ではなくミリ秒のため例外**    |

#### ギャップ判定

正本 `interfaces-agent-sdk-skill.md` はバックエンド内部の型定義（Main Process内）であり、IPC境界型ではない。S19の適用基準「同一プロセス内のDate型 → 不要（Date型のまま使用）」に該当する。task-9系仕様書のIPC境界型（`string; // ISO 8601`）と正本の内部型（`Date`）は矛盾しない。

**例外フィールド**: `BackupInfo.timestamp` はミリ秒（`number`）であり、ISO 8601対象外。バックアップファイル名生成（`{filename}.backup.{timestamp}`）に使用するためnumber型が適切。

### Step 4: コード例と型定義の整合確認

#### TASK-9Jコード例の型不整合

TASK-9J「スキル実行時の自動記録」セクションのコード例:

```typescript
// コード例（L241-242）
await this.analytics.recordEvent({
  // ...
  timestamp: new Date(), // ← Date オブジェクトを渡している
});
```

型定義:

```typescript
export interface SkillUsageEvent {
  timestamp: string; // ISO 8601
}
```

- **問題**: コード例が `new Date()` を渡しているが、型定義は `string` を要求。`recordEvent` の引数型は `Omit<SkillUsageEvent, "id">` のため `timestamp: string` が期待される
- **修正方針**: コード例を `timestamp: new Date().toISOString()` に修正

### Step 5: 未定義型の検出

#### TASK-9E: ForkMetadata型未定義

- **現状**: `SkillForker.writeForkMetadata(destPath: string, metadata: ForkMetadata)` で参照されているが、`ForkMetadata` インターフェースが `fork.ts` 型定義セクションに存在しない
- **期待する型定義**:

```typescript
export interface ForkMetadata {
  forkedFrom: string; // 元スキル名
  /** @format ISO 8601 — IPC経由では string として送受信 */
  forkedAt: string; // ISO 8601
  originalDescription?: string;
}
```

- **影響**: ForkMetadata に Date型フィールド（`forkedAt`）を追加する場合、ISO 8601方針への準拠が必要

### Step 6: safeOn + cleanup パターン確認

| #   | チャネル            | 仕様書  | safeOn使用                 | cleanup記載                | 判定                         |
| --- | ------------------- | ------- | -------------------------- | -------------------------- | ---------------------------- |
| 1   | `skill:debug:event` | TASK-9H | 明示なし（UI仕様移管済み） | 明示なし（UI仕様移管済み） | **要確認**（UIタスクで定義） |

task-9系バックエンド仕様書ではUI実装が全て移管済み（task-030/031/032）のため、safeOn購読パターンはUIタスク側で定義されている。バックエンド仕様書にはイベント発行側（`emitDebugEvent`）のみ記載。

### Step 7: DebugSession.status値セット統一確認

| 定義箇所                                         | 値セット                                                    | 一致 |
| ------------------------------------------------ | ----------------------------------------------------------- | ---- |
| TASK-9H `DebugSession.status`                    | `"idle" \| "running" \| "paused" \| "completed" \| "error"` | —    |
| TASK-9H「idle状態の定義」セクション              | `"idle" \| "running" \| "paused" \| "completed" \| "error"` | ✅   |
| task-031b (05B DebugControlsProps.sessionStatus) | `"idle" \| "running" \| "paused" \| "completed" \| "error"` | ✅   |

値セットは3箇所で完全一致。

**参考**: 正本 `AgentExecutionStatus` は `"idle" \| "executing" \| "completed" \| "error" \| "aborted"` であり、DebugSessionの値セットとは異なる。これはDebugSession固有の状態（`running`/`paused`）があるため意図的な差異。

## 成果物

| 成果物                | パス                                        | 内容                                                                |
| --------------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| IPC Date境界ルール    | `outputs/ipc-date-boundary-rules.md`        | 全Dateフィールドの準拠状況・違反一覧・修正方針                      |
| イベントpayload整合性 | `outputs/event-payload-consistency.md`      | 全イベントチャネルのpayloadスキーマ・safeOnパターン・status値セット |
| 本仕様書              | `task-013b-dataflow-audit.md`（本ファイル） | 監査結果の完全記録                                                  |

## 完了条件

- [x] 7仕様書の全Dateフィールド（18件）が抽出され、ISO 8601準拠が判定されている
- [x] 差分フィールド（3件: M-1/M-2/M-3）が特定され、修正方針が記載されている
- [x] イベントpayloadの型定義欠落（1件: E-1）が特定され、期待型が記載されている
- [x] 正本（interfaces-agent-sdk-skill.md）との型ギャップ分析が完了し、例外が明記されている
- [x] コード例と型定義の不整合（TASK-9J timestamp）が特定されている
- [x] 未定義型（ForkMetadata）が検出され、期待型が記載されている
- [x] DebugSession.status値セットの統一が確認されている
- [x] `ipc-date-boundary-rules.md` が作成されている
- [x] `event-payload-consistency.md` が作成されている

## 検出差分サマリ（SubAgent-D連携用）

| ID  | カテゴリ       | 対象                                     | 重要度 | 修正方針                                                                                            |
| --- | -------------- | ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| M-1 | nullable不整合 | TASK-9J `SkillUsageSummary.lastUsed`     | 低     | `string` → `string \| null` に変更（既存未タスクUT-IPC-DATA-FLOW-NULLABLE-CONSISTENCY-001で追跡中） |
| M-2 | 注記欠落       | TASK-9D `SkillChainDefinition.createdAt` | 中     | `@format ISO 8601` JSDocと `// ISO 8601` コメントを追加                                             |
| M-3 | 注記欠落       | TASK-9D `SkillChainDefinition.updatedAt` | 中     | M-2と同様                                                                                           |
| E-1 | 型定義欠落     | TASK-9H `DebugEvent` Discriminated Union | 高     | 7バリアントのDiscriminated Union型を `debug.ts` に追加                                              |
| C-1 | コード例不整合 | TASK-9J recordEvent コード例             | 低     | `new Date()` → `new Date().toISOString()` に修正                                                    |
| T-1 | 型定義欠落     | TASK-9E `ForkMetadata`                   | 中     | `fork.ts` に ForkMetadata インターフェースを追加                                                    |
| S-1 | セクション欠落 | TASK-9D IPCシリアライズ方針セクション    | 中     | 他6タスクと同形式の方針セクションを追加                                                             |

## 次Phase

SubAgent-Dが本監査結果を取り込み、差分修正の実行順序を決定する。
