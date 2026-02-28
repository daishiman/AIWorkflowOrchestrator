# Phase 2 ステートマシン設計 - TASK-9H-SKILL-DEBUG

## セッションステート

```
  ┌──────┐
  │ idle │───start()──→┌─────────┐
  └──────┘              │ running │←──continue()──┐
                        └────┬────┘               │
                   pause() ↓    ↑ continue()      │
                        ┌────┴────┐               │
                        │ paused  │───────────────┘
                        └────┬────┘
                             │ stop()
                             ↓
         ┌───────────┐   ┌───────┐
         │ completed │   │ error │
         └───────────┘   └───────┘
              (終端)        (終端)
```

## 状態遷移テーブル

| 現在の状態 | 遷移先    | トリガー                                          |
| ---------- | --------- | ------------------------------------------------- |
| idle       | running   | start()                                           |
| running    | paused    | pause コマンド / ブレークポイントヒット           |
| running    | completed | スキル実行完了                                    |
| running    | error     | 実行エラー / タイムアウト                         |
| paused     | running   | continue / stepOver / stepInto / stepOut コマンド |
| paused     | completed | stop コマンド（正常終了扱い）                     |
| paused     | error     | 内部エラー                                        |
| completed  | （なし）  | 終端状態                                          |
| error      | （なし）  | 終端状態                                          |

## DebugCommand → 状態遷移マッピング

| コマンド | 有効な状態      | 遷移先    | 説明                             |
| -------- | --------------- | --------- | -------------------------------- |
| continue | paused          | running   | 次のブレークポイントまで実行継続 |
| stepOver | paused          | running   | 現在のステップを実行し次で停止   |
| stepInto | paused          | running   | 関数内部に入って停止             |
| stepOut  | paused          | running   | 現在の関数を抜けて停止           |
| pause    | running         | paused    | 実行を一時停止                   |
| stop     | running, paused | completed | セッションを終了                 |

## 遷移バリデーション

```typescript
const VALID_DEBUG_TRANSITIONS: Record<
  DebugSessionStatus,
  readonly DebugSessionStatus[]
> = {
  idle: ["running"],
  running: ["paused", "completed", "error"],
  paused: ["running", "completed", "error"],
  completed: [],
  error: [],
} as const;
```

不正な遷移（例: `idle` → `paused`）は `InvalidStateTransitionError` をスローする。
