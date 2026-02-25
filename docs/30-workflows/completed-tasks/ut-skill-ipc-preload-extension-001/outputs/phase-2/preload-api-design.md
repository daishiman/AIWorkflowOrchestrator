# Phase 2 Preload API設計書

## skillAPIサブネームスペース設計

```ts
skillAPI = {
  chain: { list, get, save, delete, execute },
  fork: { execute },
  share: { importFromSource, export, validateSource },
  schedule: { list, add, update, delete, toggle },
  debug: { start, command, addBreakpoint, removeBreakpoint, inspect, evaluate, onEvent },
  docs: { generate, preview, export, templates },
  analytics: { record, statistics, summary, trend, export },
}
```

## safeInvoke / safeOn 境界（Task 2-2）

| API                       | チャネル種別     | 方式         | 返却         |
| ------------------------- | ---------------- | ------------ | ------------ |
| `chain.*`                 | request/response | `safeInvoke` | Promise      |
| `fork.execute`            | request/response | `safeInvoke` | Promise      |
| `share.*`                 | request/response | `safeInvoke` | Promise      |
| `schedule.*`              | request/response | `safeInvoke` | Promise      |
| `debug.start/command/...` | request/response | `safeInvoke` | Promise      |
| `debug.onEvent`           | push event       | `safeOn`     | `() => void` |
| `docs.*`                  | request/response | `safeInvoke` | Promise      |
| `analytics.*`             | request/response | `safeInvoke` | Promise      |

## `debug.onEvent` 解除契約

- 返却型は必ず `() => void`。
- React利用時は `useEffect` cleanupで実行する。
- リスナー解除漏れはP5再発要因として禁止。

## セキュリティ要件

- `ALLOWED_INVOKE_CHANNELS` と `ALLOWED_ON_CHANNELS` に個別登録する。
- 文字列ハードコードを禁止し `IPC_CHANNELS` 定数のみ利用する。
- `window.electronAPI.skill` 公開を維持し、直接グローバル公開を禁止する。

## SubAgentレビュー

- SubAgent-B主担当: 方式境界を策定。
- SubAgent-A: チャネル名対応の整合チェック。
- SubAgent-C: 型戻り値の責務境界チェック。
- SubAgent-D: 統合判定 PASS。

## 完了状態

- Phase 2 Task 2-2: Completed
