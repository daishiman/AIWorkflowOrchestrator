# Phase 2: アーキテクチャ設計書

## タスクID: UT-W3-ANALYTICS-ADAPTER-001

## 1. 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│ Renderer Process                                         │
│                                                          │
│  SkillCreateWizard.tsx                                   │
│    └─ trackEvent("skill_wizard_started", {})             │
│         │                                                │
│  trackEvent.ts (公開APIシグネチャ不変)                     │
│    └─ analyticsAdapter.send(eventName, payload)          │
│         │                                                │
│  analyticsAdapter.ts                                     │
│    ├─ isOptedOut() → Storeから設定取得                    │
│    ├─ オフライン時: queue に積む                           │
│    └─ オンライン時: window.analyticsAPI.send() 呼出       │
│              │ (contextBridge 経由)                      │
└──────────────┼──────────────────────────────────────────┘
               │ IPC: "analytics:send"
┌──────────────┼──────────────────────────────────────────┐
│ Main Process │                                           │
│              ▼                                           │
│  analyticsHandler.ts                                     │
│    ├─ ipcMain.handle("analytics:send", ...)              │
│    ├─ オプトアウト確認 (electronStore経由)                 │
│    ├─ イベント受信・ログ記録                               │
│    └─ 将来: HTTP送信 → 外部分析基盤                        │
└─────────────────────────────────────────────────────────┘
```

## 2. AnalyticsAdapter インターフェース設計

```typescript
// apps/desktop/src/renderer/utils/analyticsAdapter.ts

export interface AnalyticsEventPayload {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
  sessionId?: string;
}

export interface AnalyticsAdapter {
  send(eventName: string, payload: Record<string, unknown>): void;
  flush(): Promise<void>;
  isOptedOut(): boolean;
}

// シングルトンファクトリ
export function createAnalyticsAdapter(): AnalyticsAdapter;
export function getAnalyticsAdapter(): AnalyticsAdapter;
```

## 3. オフラインキュー設計

| 項目             | 仕様                                           |
| ---------------- | ---------------------------------------------- |
| ストレージ方式   | in-memory（Renderer側）                        |
| 上限件数         | 500件                                          |
| TTL              | 7日（604800000ms）                             |
| ドレイン方式     | `navigator.onLine` イベント監視 + 手動 flush() |
| 古いイベント破棄 | 上限到達時は最も古いものを削除（FIFO）         |

### オンライン復帰検知

```typescript
window.addEventListener("online", () => adapter.flush());
window.addEventListener("offline", () => {
  /* キューモードへ */
});
```

## 4. オプトアウト連動設計

- **設定キー**: `analyticsOptOut` (boolean)
- **取得方法**: `window.electronAPI.store.get({ key: "analyticsOptOut" })` 経由
- **デフォルト**: `false`（送信許可）
- **動的反映**: `send()` 呼出ごとにチェック（設定変更即時反映）
- **未整備フォールバック**: Store 取得失敗時は no-op（送信しない・安全側）

## 5. フォールバック設計（AC-9）

```typescript
// 初期化失敗時の no-op フォールバック
const noopAdapter: AnalyticsAdapter = {
  send: () => {},
  flush: async () => {},
  isOptedOut: () => false,
};
```

初期化失敗時はエラーをスローせず、no-op アダプターで継続する。

## 6. state ownership テーブル

| State            | Owner                        | 理由                            |
| ---------------- | ---------------------------- | ------------------------------- |
| イベントキュー   | Renderer（analyticsAdapter） | Rendererのオフライン状態と連動  |
| オプトアウト設定 | Main（electronStore）        | 設定ストアはMainが管理          |
| オンライン状態   | Renderer                     | `navigator.onLine` はRenderer側 |
| IPC送信状態      | Main（analyticsHandler）     | HTTP送信の責務はMainに集約      |

---

_生成日: 2026-04-11 / Phase 2 完了_
