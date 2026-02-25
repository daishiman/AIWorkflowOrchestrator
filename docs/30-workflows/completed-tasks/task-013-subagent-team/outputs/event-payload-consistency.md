# Event Payload Consistency

> 作成日: 2026-02-25 | 監査元: task-013B データフロー監査（SubAgent-B）

## 監査対象

task-9D〜9Jで定義されたイベントチャネル（`ipcMain.on` / `webContents.send` によるプッシュ型通信）のpayloadスキーマ整合を検証する。

## 全イベントチャネル一覧

| #   | チャネル名          | 仕様書  | 方向          | payload型    | 定義状況          |
| --- | ------------------- | ------- | ------------- | ------------ | ----------------- |
| 1   | `skill:debug:event` | TASK-9H | Main→Renderer | `DebugEvent` | **未定義（E-1）** |

task-9D/9E/9F/9G/9I/9Jはイベントチャネル（プッシュ型）を定義していない。すべてrequest-response型（`ipcMain.handle`/`ipcRenderer.invoke`）のみ。

## E-1: DebugEvent型の詳細分析

### 現状

- `SkillDebugger.emitDebugEvent(event: DebugEvent)` メソッドが TASK-9H L169 で宣言されている
- `DebugEvent` 型は `debug.ts` の型定義セクション（L63-L111）に存在しない
- TASK-9H の Hooks 統合コード例（L218-L234）では `emitBreakpointHit` / `recordStepOutput` 関数が使用されているが、これらの戻り値型/引数型も未定義

### DebugEventに必要なバリアント（推定）

TASK-9H のデバッグ操作フロー（L142-L170）とHooks統合コード例（L218-L234）から推定：

| バリアント          | トリガー                 | 含まれるDateフィールド                               |
| ------------------- | ------------------------ | ---------------------------------------------------- |
| `breakpoint_hit`    | ブレークポイントでの停止 | `step.timestamp`（DebugStep由来、ISO 8601準拠済み）  |
| `step_completed`    | ステップ実行完了         | `step.timestamp`（同上）                             |
| `session_paused`    | セッション一時停止       | なし                                                 |
| `session_resumed`   | セッション再開           | なし                                                 |
| `session_completed` | デバッグセッション完了   | `completedAt: string; // ISO 8601`（新規フィールド） |
| `session_error`     | エラー発生               | なし                                                 |
| `variable_changed`  | 変数値の変更             | なし                                                 |

### 推奨型定義

```typescript
/**
 * デバッグイベント（skill:debug:event チャネルのpayload）
 * Discriminated Union で type フィールドによりバリアントを判別する
 */
export type DebugEvent =
  | {
      type: "breakpoint_hit";
      sessionId: string;
      step: DebugStep;
      breakpointId: string;
    }
  | {
      type: "step_completed";
      sessionId: string;
      step: DebugStep;
    }
  | {
      type: "session_paused";
      sessionId: string;
    }
  | {
      type: "session_resumed";
      sessionId: string;
    }
  | {
      type: "session_completed";
      sessionId: string;
      /** @format ISO 8601 */
      completedAt: string; // ISO 8601
    }
  | {
      type: "session_error";
      sessionId: string;
      error: string;
    }
  | {
      type: "variable_changed";
      sessionId: string;
      path: string;
      value: unknown;
    };
```

### Dateフィールド準拠確認

| DebugEventバリアント | Dateフィールド   | 型       | ISO 8601準拠                     |
| -------------------- | ---------------- | -------- | -------------------------------- |
| `breakpoint_hit`     | `step.timestamp` | `string` | ✅（DebugStep由来）              |
| `step_completed`     | `step.timestamp` | `string` | ✅（DebugStep由来）              |
| `session_completed`  | `completedAt`    | `string` | ✅（新規追加時にISO 8601を付与） |
| その他               | なし             | —        | 対象外                           |

## safeOn購読パターンの適用状況

| #   | チャネル            | safeOn使用                      | cleanup記載        | StrictMode対策     | 判定                             |
| --- | ------------------- | ------------------------------- | ------------------ | ------------------ | -------------------------------- |
| 1   | `skill:debug:event` | UI仕様書（task-031b）に移管済み | UI仕様書に移管済み | UI仕様書に移管済み | **バックエンド仕様書に記載不要** |

### 理由

task-9系仕様書はバックエンドサービス・IPC契約・型定義のみを定義する方針。UI実装（safeOn購読、useEffect cleanup、React StrictMode対策）は task-030/031/032 のUIタスクで定義される。

### UIタスク側での確認ポイント

task-031b（05B-skill-advanced-views.md#3C DebugPanel）で以下が定義されていることを確認すべき：

- [ ] `safeOn('skill:debug:event', callback)` の購読コード
- [ ] `useEffect` の cleanup で購読解除関数を呼び出すコード
- [ ] React StrictMode での二重購読防止（P5対策）

## DebugSession.status 値セット統一

### 比較テーブル

| 定義箇所                                         | 値セット                                                    | ソース                |
| ------------------------------------------------ | ----------------------------------------------------------- | --------------------- |
| `DebugSession.status`（TASK-9H L67）             | `"idle" \| "running" \| "paused" \| "completed" \| "error"` | バックエンド型定義    |
| TASK-9H「idle状態の定義」セクション（L127-L134） | `"idle" \| "running" \| "paused" \| "completed" \| "error"` | 仕様説明              |
| task-031b `DebugControlsProps.sessionStatus`     | `"idle" \| "running" \| "paused" \| "completed" \| "error"` | UIコンポーネントProps |

**判定**: 3箇所で完全一致。差分なし。

### AgentExecutionStatus との差異

正本 `AgentExecutionStatus` は `"idle" | "executing" | "completed" | "error" | "aborted"` を定義する。DebugSession.status との差異：

| 値          | AgentExecutionStatus | DebugSession.status | 理由                                 |
| ----------- | -------------------- | ------------------- | ------------------------------------ |
| `idle`      | ✅                   | ✅                  | 共通                                 |
| `executing` | ✅                   | ❌                  | Debug では `running` を使用          |
| `running`   | ❌                   | ✅                  | Debug 固有（実行中）                 |
| `paused`    | ❌                   | ✅                  | Debug 固有（ブレークポイント停止中） |
| `completed` | ✅                   | ✅                  | 共通                                 |
| `error`     | ✅                   | ✅                  | 共通                                 |
| `aborted`   | ✅                   | ❌                  | Debug では `error` に包含            |

この差異はDebugSession固有の操作（ステップ実行、ブレークポイント停止）を表現するために意図的に設計されたもの。統一の必要はない。

## onExport引数の整合確認

### TASK-9F ExportResult の変換

`ExportResult` はIPC境界でのDate型フィールドを含まないため、DTO→Props変換時のDate処理は不要。

```typescript
// ExportResult（Date型なし）
export interface ExportResult {
  success: boolean;
  destination: ShareTarget;
  exportedFiles: string[];
  shareUrl?: string;
}
```

### TASK-9J exportData メソッドの引数

`SkillAnalytics.exportData(format, period?)` の `period` は `AnalyticsPeriod` 型。`AnalyticsPeriod.start` / `.end` はISO 8601文字列（Renderer→Main方向の送信）であり、準拠済み。

```typescript
// AnalyticsPeriod（Renderer→Main送信時もISO 8601文字列）
export interface AnalyticsPeriod {
  /** @format ISO 8601 — Renderer から送信時も ISO 8601 文字列を使用 */
  start: string; // ISO 8601
  /** @format ISO 8601 */
  end: string; // ISO 8601
  granularity: "hour" | "day" | "week" | "month";
}
```

## 監査サマリ

| 観点                   | 件数 | 結果                                                |
| ---------------------- | ---- | --------------------------------------------------- |
| イベントチャネル総数   | 1    | `skill:debug:event` のみ                            |
| payload型定義欠落      | 1    | E-1: `DebugEvent` 未定義                            |
| safeOn購読パターン     | 0    | バックエンド仕様書の対象外（UIタスクで定義）        |
| status値セット不一致   | 0    | 3箇所で完全一致                                     |
| onExport引数のDate処理 | 0    | ExportResultにDate型なし、AnalyticsPeriodは準拠済み |
