# TASK-RT-02 実装ガイド

## Part 1: まず何のために必要か

APIキーを登録しただけでは、そのサービスが本当に使えるかはまだ分かりません。  
たとえば、家の鍵を持っていても、実際にドアが開くかは一度試さないと分からないのと同じです。

この変更は、APIキー管理画面で「登録できている」と「今つながる」を分けて見えるようにするためのものです。  
画面を開くと、登録済みのサービスだけ接続確認を行い、確認中・使える・再確認が必要の3状態で見せます。

失敗したときは、そのサービスの行だけもう一度試せます。  
他のサービスまで巻き込まないので、どこで問題が起きているかが分かりやすくなります。

## Part 2: 技術者向け詳細

### 実装方針

- `window.electronAPI.apiKey.list()` で provider 一覧を取得
- `status === "registered"` の provider にだけ `window.electronAPI.llm.checkHealth(providerId)` を実行
- `ApiKeysSection` の局所 state で `adapterStatusMap` と `adapterIsRetrying` を保持
- `failed` のときだけ `RetryButton` を表示し、対象 provider のみ再確認

### 型

```ts
type AdapterUiStatus = "initializing" | "ready" | "failed";

interface AdapterStatusEntry {
  status: AdapterUiStatus;
  failureReason?: string | null;
}
```

```ts
type ProviderStatus = {
  provider: "openai" | "anthropic" | "google" | "xai";
  displayName: string;
  status: "registered" | "not_registered";
  lastValidatedAt: string | null;
};
```

### API シグネチャ

```ts
window.electronAPI.apiKey.list(): Promise<{
  success: boolean;
  data?: { providers: ProviderStatus[] };
  error?: { message?: string };
}>;

window.electronAPI.llm.checkHealth(
  providerId: "openai" | "anthropic" | "google" | "xai",
): Promise<HealthCheckResult>;
```

### 状態正規化

- 未登録: adapter status を持たない
- 登録済みで確認開始直後: `initializing`
- `HealthCheckResult.status === "connected"`: `ready`
- `disconnected` / `error` / 例外: `failed`

### エッジケース

- `apiKey.list()` が失敗した場合は一覧全体を error 表示にする
- `llm.checkHealth()` が失敗した場合は対象 provider を `failed` に落とす
- retry は対象 provider のみ `initializing` に戻して再実行する
- `llm.checkHealth` が使えない環境では status 表示を更新できない

### 証跡

- 画面変更のため `outputs/phase-11/screenshots/` を参照すべきだが、現時点では実スクリーンショット未取得
- 手動テストの暫定記録: `outputs/phase-11/manual-test-result.md`
