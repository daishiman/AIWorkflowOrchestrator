# 設計判断記録

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13
**フェーズ**: Phase 2 - 設計

---

## 設計決定テーブル

| 決定事項                    | 選択                         | 理由                                                                               |
| --------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| 状態管理アプローチ          | renderer-local direct read   | `getAnalyticsAdapter()` の同期 API で完結。IPC/Store/Preload 追加不要              |
| `NODE_ENV` チェック実装箇所 | `AnalyticsDashboardPanel` 内 | 最小複雑性。dev-only ロジックをコンポーネントに閉じ込め、SettingsView を汚染しない |
| 診断表示の扱い              | 内部 dev-only 診断ブロック   | 実ログ保存先を増やさず AC-3 を満たす                                               |
| IPC チャンネル追加要否      | 追加しない                   | `analyticsAdapter` だけで要件を満たす                                              |
| Props 注入 vs 直接呼び出し  | 直接呼び出し                 | シングルトンのため Props 不要。テストは `vi.mock` でモック制御                     |
| データ更新戦略              | 初回マウント時のみ読み取り   | リアルタイム更新不要。状態確認用 UI のため静的表示で十分                           |

---

## コンポーネント階層設計

```
SettingsView (既存)
└── section[aria-labelledby="analytics-settings-heading"]  ← 追加
    └── SettingsCard (既存パターン)
        └── AnalyticsDashboardPanel (新規)
            ├── オプトアウト状態表示 [data-testid="analytics-opt-out-status"]
            ├── キューサイズ表示 [data-testid="analytics-queue-size"]
            └── (NODE_ENV !== "production" のみ)
                └── 診断ブロック [data-testid="event-log-viewer"]
```

---

## 状態管理設計

### Renderer-local direct read 方針

```typescript
// コンポーネント内で直接呼び出す
import { getAnalyticsAdapter } from "../../utils/analyticsAdapter";

// マウント時に一度読み取る
const adapter = getAnalyticsAdapter();
const isOptedOut = adapter.isOptedOut(); // boolean（同期）
const queueSize = adapter.getQueueSize(); // number（同期）
```

**理由**: `isOptedOut()` と `getQueueSize()` は同期的に現在値を返すため、React state や useEffect 不要。useState で初期値を取得して表示するシンプルな実装。

### 状態の更新タイミング

| 状態         | 更新タイミング | 理由                                                      |
| ------------ | -------------- | --------------------------------------------------------- |
| `isOptedOut` | マウント時のみ | store の非同期読み込みが完了した `lastKnownOptOut` を返す |
| `queueSize`  | マウント時のみ | ダッシュボードはスナップショット表示で十分                |

---

## NODE_ENV 分岐設計

```typescript
// AnalyticsDashboardPanel 内に閉じ込める
const isDevMode = process.env.NODE_ENV !== "production";

return (
  <div data-testid="analytics-dashboard-panel">
    {/* 常時表示 */}
    <OptOutStatus isOptedOut={isOptedOut} />
    <QueueSize count={queueSize} />

    {/* 開発モードのみ */}
    {isDevMode && (
      <div data-testid="event-log-viewer">
        {/* dev-only 診断ブロック */}
      </div>
    )}
  </div>
);
```

**テスト戦略**: `vi.stubEnv("NODE_ENV", "development")` / `vi.stubEnv("NODE_ENV", "production")` で分岐を制御。

---

## テスト可能性設計

### モック境界

```typescript
// テストファイルで以下をモック
vi.mock("../../utils/analyticsAdapter", () => ({
  getAnalyticsAdapter: vi.fn(() => ({
    isOptedOut: vi.fn(() => false), // テストで上書き可能
    getQueueSize: vi.fn(() => 0), // テストで上書き可能
  })),
}));
```

### NODE_ENV 制御

```typescript
// dev ブランチのテスト
vi.stubEnv("NODE_ENV", "development");

// prod ブランチのテスト
vi.stubEnv("NODE_ENV", "production");
```

---

## セキュリティ設計

| リスク        | 対策                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| PII 漏洩      | キューサイズ（件数）のみ表示。イベント内容・ペイロードは非表示                                      |
| XSS           | 数値・boolean のみ表示。外部入力なし                                                                |
| dev-only 漏洩 | `process.env.NODE_ENV !== "production"` で本番ビルドから完全除外（Webpack/Vite のデッドコード削除） |
