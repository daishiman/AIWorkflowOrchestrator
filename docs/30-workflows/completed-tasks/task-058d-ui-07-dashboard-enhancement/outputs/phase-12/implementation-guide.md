# Phase 12 成果物: 実装ガイド

## Part 1: なぜこのホームが必要か

ホーム画面は、アプリの玄関です。玄関に入った瞬間に「次にどこへ行くか」が分からないと、部屋は多くても迷います。今回の変更は、旧ダッシュボードのように数字を並べるのではなく、玄関に「今やると良いこと」を短く置くためのものです。

たとえば学校の朝に、教室の黒板へ「今日やること」が 3 つだけ書かれていると、全員がすぐ動けます。このホームも同じで、挨拶、次のステップ、最近の動きだけを先に見せています。

### 何が変わるか

- h1 は `ダッシュボード` ではなく `ホーム`
- suggestion card で次の導線を 3 件に圧縮
- timeline は最新 5 件だけ表示
- 履歴が空でも welcoming EmptyState で詰まらない

## Part 2: 実装の詳細

### TypeScript の型定義

```ts
export interface DashboardSuggestion {
  id: string;
  title: string;
  description: string;
  view: "workspace" | "skillCenter" | "agent" | "historySearch";
  icon: IconName;
  accent: "primary" | "info" | "success";
}

export interface DashboardTimelineEntry {
  id: string;
  title: string;
  timestamp: string;
  icon: IconName;
  statusLabel: string;
}
```

### APIシグネチャ / UIシグネチャ

- `DashboardView(props: { className?: string; now?: Date })`
- `getDashboardSuggestions({ activityCount, pendingCount })`
- `getTimelineEntries(activityFeed)`
- `pnpm --filter @repo/desktop screenshot:dashboard-home`

### 構成

| パーツ                           | 役割                                          |
| -------------------------------- | --------------------------------------------- |
| `DashboardView/index.tsx`        | state 読み取り、branching、navigation handoff |
| `GreetingHeader.tsx`             | h1 / greeting / overview cards                |
| `DashboardSuggestionSection.tsx` | 3 card の並び                                 |
| `RecentTimeline.tsx`             | timeline 5件 + `もっと見る`                   |
| `dashboardContent.ts`            | greeting / suggestion / timeline helper       |

### 使用例

```tsx
<DashboardView now={new Date("2026-03-11T10:15:00+09:00")} />
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/DashboardView/DashboardView.test.tsx \
  src/renderer/views/DashboardView/components/dashboardContent.test.ts
```

### エラーハンドリング

- invalid timestamp は `RelativeTime` の fallback (`—`) に委譲する。
- `activityFeed=[]` は error ではなく welcoming empty として扱う。
- loading は skeleton panel に切り替え、card 密度を崩さない。

### エッジケース

- `displayName` が `User` のような汎用値でも自然な挨拶へ落とす。
- `pendingCount > 0` のときは `agent` を最優先にする。
- `activityFeed.length > 5` でも timeline は 5 件で止める。
- mobile では 3 card を 1 列に積み、優先順位を保持する。

### 設定項目と定数一覧

| 項目                 | 値                                 | 用途                          |
| -------------------- | ---------------------------------- | ----------------------------- |
| `MAX_TIMELINE_ITEMS` | `5`                                | timeline 表示上限             |
| screenshot port      | `4281`                             | Phase 11 harness の Vite port |
| themes               | `light`, `dark`, `kanagawa-dragon` | 視覚確認対象                  |
