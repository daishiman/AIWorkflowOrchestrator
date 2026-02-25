# SubAgent-B 実行エビデンス (2026-02-25)

## Step 1: Date境界型（ISO 8601）抽出

- task-022-task-9f-skill-share.md
  87: /** @format ISO 8601 — IPC経由では string として送受信。バックエンド内部では Date を使用し、ハンドラ戻り値で .toISOString() に変換する \*/
  88: importedAt: string; // ISO 8601 (例: "2026-02-24T12:00:00.000Z")
  125:本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。
  128:- **IPC 境界（ハンドラ戻り値）\*\*: `.toISOString()` で ISO 8601 文字列に変換
  134:2. ISO 8601 文字列であれば `new Date()` で確実に復元可能
- task-023a-task-9g-skill-schedule.md
  71: /** @format ISO 8601 — IPC経由では string として送受信 \*/
  72: lastRun?: string | null; // ISO 8601
  73: /** @format ISO 8601 _/
  74: nextRun?: string | null; // ISO 8601
  83: /\*\* @format ISO 8601 _/
  84: runAt?: string | null; // ISO 8601
  97: /** @format ISO 8601 \*/
  98: startedAt: string; // ISO 8601
  99: /** @format ISO 8601 \*/
  100: completedAt?: string | null; // ISO 8601
  109:本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。
  112:- **IPC 境界（ハンドラ戻り値）**: `.toISOString()` で ISO 8601 文字列に変換
  118:2. ISO 8601 文字列であれば `new Date()` で確実に復元可能
- task-023b-task-9h-skill-debug.md
  72: /** @format ISO 8601 — IPC経由では string として送受信 \*/
  73: startedAt: string; // ISO 8601
  92: /** @format ISO 8601 _/
  93: timestamp: string; // ISO 8601
  100: /\*\* @format ISO 8601 _/
  101: startTime: string; // ISO 8601
  115:本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。
  118:- **IPC 境界（ハンドラ戻り値）**: `.toISOString()` で ISO 8601 文字列に変換
  124:2. ISO 8601 文字列であれば `new Date()` で確実に復元可能
- task-023c-task-9i-skill-docs.md
  76: /** @format ISO 8601 — IPC経由では string として送受信 \*/
  77: generatedAt: string; // ISO 8601
  105:本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。
  108:- **IPC 境界（ハンドラ戻り値）\*\*: `.toISOString()` で ISO 8601 文字列に変換
  114:2. ISO 8601 文字列であれば `new Date()` で確実に復元可能
- task-023d-task-9j-skill-analytics.md
  69: /** @format ISO 8601 — IPC経由では string として送受信 \*/
  70: timestamp: string; // ISO 8601
  83: /** @format ISO 8601 _/
  84: lastUsed?: string | null; // ISO 8601
  97: /\*\* @format ISO 8601 — Renderer から送信時も ISO 8601 文字列を使用 _/
  98: start: string; // ISO 8601
  99: /** @format ISO 8601 \*/
  100: end: string; // ISO 8601
  110: /** @format ISO 8601 _/
  111: timestamp: string; // ISO 8601
  128: /\*\* @format ISO 8601 _/
  129: lastUsed: string; // ISO 8601
  135:本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。
  138:- **IPC 境界（ハンドラ戻り値）**: `.toISOString()` で ISO 8601 文字列に変換
  144:2. ISO 8601 文字列であれば `new Date()` で確実に復元可能
  241: timestamp: new Date(),
  253: timestamp: new Date(),
- task-023e-task-9d-skill-chain.md
  72: createdAt: string;
  73: updatedAt: string;
- task-023f-task-9e-skill-fork.md

## Step 2: イベントpayload定義の存在確認

169: private emitDebugEvent(event: DebugEvent): void;
195:- `skill:debug:event` - デバッグイベント通知（breakpoint hit, step completed等）

## Step 3: 補助型の欠落確認

- ForkMetadata:
  61:`ForkOptions` / `ForkResult` / `ForkMetadata` は `packages/shared/src/types/skill/fork.ts` に定義し、`SkillForker.ts` から import して利用する。
  90: private writeForkMetadata(
  92: metadata: ForkMetadata,

## Step 4: 出力成果物突合

- OK: ipc-date-boundary-rules.md ( 134 lines)
- OK: event-payload-consistency.md ( 179 lines)
