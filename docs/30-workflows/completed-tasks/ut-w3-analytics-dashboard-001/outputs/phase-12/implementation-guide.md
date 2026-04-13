# 実装ガイド

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13

---

## Part 1: 中学生レベルの説明

### なぜ Analytics ダッシュボードが必要なの？

アプリを使うとき、バックグラウンドでアプリの動作情報（どの機能をよく使うか など）が収集されていることがあります。これを「アナリティクス（分析データの収集）」と言います。

でも、「本当に収集されているの？」「収集を止めたはずなのに動いてる？」と不安になることがあります。

そこで、設定画面に **「Analytics ダッシュボード」** というパネルを追加しました。このパネルを見るだけで、今データ収集が「有効」なのか「止まっている（オプトアウト中）」なのかが一目でわかります。

### たとえ話

スマートフォンの「データ通信量」画面を想像してください。「今月どれだけデータを使ったか」が数字で見えますよね。それと同じように、「何件のデータが送信待ちになっているか」「収集がオンかオフか」が見えるようになりました。

### 専門用語の説明

| 用語         | 意味                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| オプトアウト | 「やめる・拒否する」という意味。オプトアウト中 = 収集を止めている状態  |
| キュー       | 「順番待ちの列」。送信待ちのデータが並んでいる場所                     |
| 診断ブロック | 開発者だけに見える詳細情報のエリア（ふつうのユーザーには表示されない） |
| NODE_ENV     | アプリが「開発用モード」か「本番用モード」かを示す設定値               |

---

## Part 2: 技術者向け詳細

### 追加コンポーネント

**`AnalyticsDashboardPanel`**（`apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx`）

```typescript
export interface AnalyticsDashboardPanelProps {
  className?: string;
}

export const AnalyticsDashboardPanel: React.FC<AnalyticsDashboardPanelProps>;
```

### `getAnalyticsAdapter()` 直接呼び出し方針

```typescript
// renderer-local direct read — IPC / Store / Preload 追加なし
const adapter = getAnalyticsAdapter();
const isOptedOut = adapter.isOptedOut(); // boolean（同期）
const queueSize = adapter.getQueueSize(); // number（同期）
```

シングルトンの `AnalyticsAdapter` を直接参照するため、追加の状態管理不要。
`isOptedOut()` は `lastKnownOptOut`（非同期 store 取得完了後の値）を返す。

### dev-only 診断ブロックの条件分岐

```typescript
const isDevMode = process.env.NODE_ENV !== "production";

{isDevMode && (
  <div data-testid="event-log-viewer">
    診断情報（開発モード）
  </div>
)}
```

Vite/Webpack はビルド時に `process.env.NODE_ENV` を文字列リテラルに置換し、
production ビルドではこのブロックがデッドコードとして除去される。
`window.__analyticsDashboardDevMode` を先に設定すると、E2E / スクリーンショット取得時に
dev / prod 表示を切り替えられる。未設定時は通常の NODE_ENV 判定を使う。

### 設定画面への統合方法

```typescript
// SettingsView/index.tsx
import { AnalyticsDashboardPanel } from "../../components/analytics/AnalyticsDashboardPanel";

// RAG設定セクションの直後
<section role="region" aria-labelledby="analytics-settings-heading">
  <SettingsCard
    title="Analytics ダッシュボード"
    description="分析データの収集状態を確認します"
    id="analytics-settings-heading"
  >
    <AnalyticsDashboardPanel />
  </SettingsCard>
</section>
```

### data-testid 一覧

| testid                      | 表示条件                         | 内容                         |
| --------------------------- | -------------------------------- | ---------------------------- |
| `analytics-dashboard-panel` | 常時                             | パネルルート                 |
| `analytics-opt-out-status`  | 常時                             | 「有効」/ 「オプトアウト中」 |
| `analytics-queue-size`      | 常時                             | キューサイズ（件数）         |
| `event-log-viewer`          | `NODE_ENV !== "production"` のみ | 診断ブロック                 |

### テスト戦略

```typescript
// analyticsAdapter のモック
vi.mock("../../utils/analyticsAdapter", () => ({
  getAnalyticsAdapter: vi.fn(() => ({
    isOptedOut: vi.fn(() => false),
    getQueueSize: vi.fn(() => 0),
  })),
}));

// NODE_ENV 制御
vi.stubEnv("NODE_ENV", "development");
afterEach(() => vi.unstubAllEnvs());
```

### エラーケースとフォールバック

- `getAnalyticsAdapter()` は必ず有効なアダプターを返す（初期化失敗時も no-op アダプター）
- `isOptedOut()` は同期的に `lastKnownOptOut` を返す。store API が未取得/失敗の場合は安全側に倒して `true`
- 表示エラーは発生しない（boolean / number のみレンダリング、外部入力なし）
