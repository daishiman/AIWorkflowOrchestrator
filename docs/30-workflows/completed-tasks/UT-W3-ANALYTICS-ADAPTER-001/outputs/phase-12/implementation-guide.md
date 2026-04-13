# Implementation Guide: UT-W3-ANALYTICS-ADAPTER-001

## Part 1（中学生レベル）

### この変更は何のためか

`trackEvent` は「アプリ内で起きた出来事を記録する仕組み」です。  
たとえば、お店の入口にある人数カウンターのように、「いつ・何が起きたか」を後で確認できるようにします。

今回の差し替えで、以下の動きになりました。

- 開発環境（`NODE_ENV !== "production"`）: `console.info` で表示だけする
- 本番環境（`NODE_ENV === "production"`）: `analyticsAdapter` 経由で Main プロセスに送る

### どこを通って送られるか

たとえば「受付窓口 → 内線電話 → バックオフィス」の流れです。

1. 受付窓口: `trackEvent.ts`
2. 内線電話: `analyticsAPI.send()`（Preload が公開する API）
3. バックオフィス: `analyticsHandler.ts`（Main IPC ハンドラー）

この経路を使うことで、Renderer から直接ネットワーク処理を持たずにイベントを扱えます。

## Part 2（技術者レベル）

### 変更対象（current facts）

| 種別 | ファイル                                              | 役割                                                          |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/utils/trackEvent.ts`       | 開発環境 `console.info` / 本番 `getAnalyticsAdapter().send()` |
| 新規 | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | オフラインキュー・opt-out 判定・IPC 送信                      |
| 新規 | `apps/desktop/src/main/ipc/analyticsHandler.ts`       | `analytics:send` 受信・バリデーション・opt-out 最終判定       |
| 修正 | `apps/desktop/src/preload/channels.ts`                | `ANALYTICS_SEND: "analytics:send"` と whitelist               |
| 修正 | `apps/desktop/src/preload/index.ts`                   | `analyticsAPI.send()` を `contextBridge` 公開                 |
| 修正 | `apps/desktop/src/main/ipc/index.ts`                  | `registerAnalyticsHandlers()` 登録                            |

### 公開 API シグネチャ

```ts
// apps/desktop/src/renderer/utils/trackEvent.ts
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void;
```

`trackEvent` のシグネチャは変更なしです（呼び出し側互換維持）。

### IPC 契約

```ts
// apps/desktop/src/preload/channels.ts
ANALYTICS_SEND: "analytics:send";
```

```ts
// apps/desktop/src/preload/index.ts
export interface AnalyticsAPI {
  send: (request: {
    eventName: string;
    payload: Record<string, unknown>;
    timestamp: number;
    optedOut?: boolean;
  }) => Promise<{ success: boolean; skipped?: boolean; error?: string }>;
}
```

```ts
// apps/desktop/src/main/ipc/analyticsHandler.ts
ipcMain.handle(IPC_CHANNELS.ANALYTICS_SEND, async (_event, body) => { ... })
```

### analyticsAdapter の動作仕様

| 項目             | 値                                                                              |
| ---------------- | ------------------------------------------------------------------------------- |
| キュー上限       | `QUEUE_MAX_SIZE = 500`                                                          |
| キューTTL        | `QUEUE_TTL_MS = 7 * 24 * 60 * 60 * 1000`（7日）                                 |
| opt-out 参照     | `window.electronAPI.store.get({ key: "analyticsOptOut", defaultValue: false })` |
| opt-out 失敗時   | safe-side で送信抑止                                                            |
| オンライン復帰時 | `window.addEventListener("online", ...)` で `flush()`                           |

### 開発/本番での振る舞い

| 環境     | 挙動                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 開発環境 | `console.info("[trackEvent]", ...)` のみ。adapter送信は行わない         |
| 本番環境 | `trackEvent -> analyticsAdapter -> analyticsAPI.send -> analytics:send` |

### Phase 11 証跡との整合

- 本タスクは `NON_VISUAL` 判定（UIコンポーネント変更なし）
- スクリーンショット参照は N/A
- 代替証跡: `outputs/phase-11/manual-test-result.md`

### validator / 実行要件

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-W3-ANALYTICS-ADAPTER-001 --phase 12
```

合格条件:

- `outputs/phase-12/` の canonical 6成果物が存在すること
- `artifacts.json` と `outputs/artifacts.json` の status / phase artifact 名が一致すること
- 将来表現監査のヒット件数が 0 件であること

---

_更新日: 2026-04-12_
