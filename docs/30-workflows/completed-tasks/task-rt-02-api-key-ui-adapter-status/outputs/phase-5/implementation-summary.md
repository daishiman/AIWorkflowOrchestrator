# Phase 5: Implementation Summary

## TASK-RT-02: APIキー管理画面 adapterStatus UI連携

### 実装済みファイル一覧

| #   | Layer       | File                                                                      | 変更内容                                                                                                       |
| --- | ----------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | UI Atom     | `apps/desktop/src/renderer/components/atoms/AdapterStatusBadge/index.tsx` | `ready / initializing / failed` を表示する status badge を追加                                                 |
| 2   | UI Atom     | `apps/desktop/src/renderer/components/atoms/RetryButton/index.tsx`        | failed 行に限定した再接続 CTA を追加                                                                           |
| 3   | UI Atom     | `apps/desktop/src/renderer/components/atoms/index.ts`                     | 2 コンポーネントを export                                                                                      |
| 4   | UI Organism | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` | `apiKey.list()` 後に登録済み provider へ `llm.checkHealth()` を実行し、局所 state で status / retry 状態を管理 |

### データフロー

```text
Renderer (ApiKeysSection)
  ↓ apiKey.list()
登録済み provider 抽出
  ↓ llm.checkHealth(providerId)
局所 state (adapterStatusMap / adapterIsRetrying)
  ↓
AdapterStatusBadge / RetryButton
```

### 設計判断

1. 新規 public IPC は追加しない。既存 `llm.checkHealth()` を再利用する。
2. Settings 画面固有の関心なので global store ではなく `ApiKeysSection` 局所 state に閉じる。
3. retry は対象 provider のみ `initializing` に戻して再確認し、他行へ波及させない。
4. `HealthCheckResult.status === "connected"` を `ready`、それ以外を `failed` として UI 表示へ正規化する。

### 検証メモ

- 自動テスト実行は未完了
- 理由: 現環境の `esbuild` バイナリが `darwin-arm64` と `darwin-x64` で不整合を起こし、Vitest 起動前に失敗した
