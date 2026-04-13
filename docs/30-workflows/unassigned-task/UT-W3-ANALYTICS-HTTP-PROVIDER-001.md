# UT-W3-ANALYTICS-HTTP-PROVIDER-001: 本番 analytics HTTP 送信実装

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                |
| 優先度     | 高                                               |
| 依存       | UT-W3-ANALYTICS-ADAPTER-001（Phase 12 完了済み） |
| 関連タスク | UT-W3-ANALYTICS-DASHBOARD-001                    |
| 作成日     | 2026-04-12                                       |
| issue番号  | #2097                                            |

---

## 目的

`analyticsHandler.ts` Line 106 の TODO を実装し、Renderer からの analytics イベントを外部分析基盤（HTTP エンドポイント）へ実際に送信する。

---

## 背景

UT-W3-ANALYTICS-ADAPTER-001 で analytics の IPC パイプライン（Renderer → preload → Main）は完成した。
しかし Main プロセス側の `analyticsHandler.ts` では、オプトアウトをパスしたイベントをコンソール出力のみ行い、実際の外部送信は未実装（TODO コメント残存）。

```ts
// apps/desktop/src/main/ipc/analyticsHandler.ts:106
// TODO: 本番環境での HTTP 送信実装（外部分析基盤への接続）
// await sendToAnalyticsProvider({ eventName, payload, timestamp });
```

---

## スコープ

### 含む

- `analyticsHandler.ts` への HTTP 送信関数実装
- リトライ・タイムアウト・エラーハンドリング設計
- 外部エンドポイント URL の設定（環境変数 or electron-store）
- ユニットテスト拡充（HTTP 送信パスのモック）

### 含まない

- 外部分析基盤自体の構築（バックエンドサービス側）
- analytics ダッシュボード UI（→ UT-W3-ANALYTICS-DASHBOARD-001）

---

## 受入基準

- [ ] `NODE_ENV === "production"` のとき、オプトアウトしていないイベントが HTTP POST で送信されること
- [ ] HTTP 送信に失敗した場合、エラーをスローせず `{ success: false, error: ... }` を返すこと
- [ ] タイムアウト（例: 5秒）を設定し、応答待ちで Main プロセスをブロックしないこと
- [ ] エンドポイント URL が環境変数（例: `ANALYTICS_ENDPOINT_URL`）で設定可能なこと
- [ ] ユニットテストが `pnpm test` で PASS すること
- [ ] `pnpm typecheck && pnpm lint` が PASS すること

---

## 苦戦箇所（UT-W3-ANALYTICS-ADAPTER-001 からの教訓）

- **IPC 型契約の保守**: `AnalyticsSendRequest` / `AnalyticsSendResponse` の型定義は変更せず拡張すること（呼び出し側に影響を与えない）
- **エラー非伝播設計**: HTTP エラーが analytics の IPC 呼び出し全体を壊さないよう、catch で握り潰す設計を維持すること
- **オプトアウト二重防衛**: Renderer 側と Main 側の両方でオプトアウトを確認する既存の構造を破らないこと

---

## 実装ヒント

```ts
// sendToAnalyticsProvider の骨格例
async function sendToAnalyticsProvider(
  event: AnalyticsSendRequest,
): Promise<void> {
  const endpoint = process.env.ANALYTICS_ENDPOINT_URL;
  if (!endpoint) return; // 未設定なら静かに skip

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
  } catch {
    // エラーを呑み込む（analytics 失敗はアプリ動作に影響させない）
  } finally {
    clearTimeout(timer);
  }
}
```

---

## 完了条件

- [ ] `analyticsHandler.ts` の TODO コメントが実装に置き換えられていること
- [ ] 関連するテストが更新・追加されていること
- [ ] 全テストが PASS すること
