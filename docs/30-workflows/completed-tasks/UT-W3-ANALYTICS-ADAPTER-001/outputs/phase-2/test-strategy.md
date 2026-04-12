# Phase 2: テスト戦略

## タスクID: UT-W3-ANALYTICS-ADAPTER-001

## 1. テストカテゴリ

### analyticsAdapter.test.ts

| カテゴリ               | テストケース                                                |
| ---------------------- | ----------------------------------------------------------- |
| 初期化                 | 正常初期化・失敗時no-opフォールバック                       |
| 送信（通常）           | オンライン時に `window.analyticsAPI.send` が呼ばれること    |
| 送信（オプトアウト）   | `isOptedOut()=true` 時は送信しないこと                      |
| オフラインキューイング | オフライン時はキューに積まれること                          |
| キュードレイン         | `flush()` でキューのイベントが順に送信されること            |
| フォールバック         | `window.analyticsAPI.send` 失敗時もエラーをスローしないこと |
| API シグネチャ         | `trackEvent` 公開APIシグネチャが変更されていないこと        |

### analyticsHandler.test.ts

| カテゴリ     | テストケース                                        |
| ------------ | --------------------------------------------------- |
| IPC受信      | `analytics:send` チャネルでイベントを受信できること |
| 正常処理     | 受信したイベントをログ記録すること                  |
| オプトアウト | `analyticsOptOut=true` 時はスキップすること         |
| エラー処理   | 不正なリクエスト時に `success: false` を返すこと    |

## 2. モック設計方針

### window.analyticsAPI のモック

```typescript
// 正しいアプローチ（vi.stubGlobal("window") は禁止）
Object.defineProperty(window, "analyticsAPI", {
  value: {
    send: vi.fn().mockResolvedValue({ success: true }),
  },
  writable: true,
  configurable: true,
});
```

### navigator.onLine のモック

```typescript
Object.defineProperty(navigator, "onLine", {
  get: vi.fn().mockReturnValue(false),
  configurable: true,
});
```

### electronStore のモック（analyticsHandler.test.ts）

```typescript
vi.mock("electron-store");
```

## 3. カバレッジ目標

| ファイル            | Line | Branch | Function |
| ------------------- | ---- | ------ | -------- |
| analyticsAdapter.ts | 90%+ | 80%+   | 90%+     |
| trackEvent.ts       | 100% | 100%   | 100%     |
| analyticsHandler.ts | 90%+ | 80%+   | 90%+     |

---

_生成日: 2026-04-11 / Phase 2 完了_
