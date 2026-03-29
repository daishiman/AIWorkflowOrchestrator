# Phase 2: Design

## 設計結論

TASK-RT-02 は新規 IPC を足さず、既存の public surface を再利用して実装する。

- provider 一覧: `apiKey.list()`
- 接続確認: `llm.checkHealth(providerId)`
- 状態保持: `ApiKeysSection` の局所 state
- 表示: `AdapterStatusBadge`, `RetryButton`

## コンポーネント責務

| 層                   | 責務                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| `ApiKeysSection`     | provider 一覧取得、登録済み provider の接続確認、retry 実行、局所 state 管理 |
| `AdapterStatusBadge` | `initializing / ready / failed` の視覚表示                                   |
| `RetryButton`        | failed provider の再確認導線                                                 |

## 状態モデル

```ts
type AdapterUiStatus = "initializing" | "ready" | "failed";

interface AdapterStatusEntry {
  status: AdapterUiStatus;
  failureReason?: string | null;
}
```

## フロー

```text
mount
  ↓
apiKey.list()
  ↓
registered provider 抽出
  ↓
llm.checkHealth(providerId) を provider ごとに実行
  ↓
adapterStatusMap 更新
  ↓
failed のみ RetryButton 表示
```

## 採用理由

1. `llm.checkHealth()` は既に canonical contract として存在する
2. Settings 固有の状態を global store に広げる必要がない
3. Runtime Skill Creator private 状態を Settings へ昇格させずに済む
