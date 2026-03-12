# Phase 12 成果物: 実装ガイド

## Part 1

### なぜこの修正が必要だったか

ライトモードは白い紙に近い見た目になるので、文字や枠線まで白っぽいままだと目が滑って読みづらくなります。今回の修正は、画面全体を派手に変えることではなく、「白い紙の上で読めるインクの濃さにそろえる」ための作業でした。

たとえば、ノートに薄い鉛筆で見出しも本文も全部書くと、どこが大事か分かりません。そこで、見出しは濃く、説明文は少し薄く、注意は赤く、と役割ごとに色を決めます。今回の light theme migration も同じで、`text-white` のようなその場しのぎの色をやめて、「見出し用」「説明用」「警告用」の決まった色へそろえました。

### 何をしたか

- Settings / Auth / WorkspaceSearch の文字色を semantic token にそろえた
- panel 背景と border を light theme でも見える強さへ揃えた
- dropdown / dialog / menu / alert の state color を semantic status token へ寄せた
- current build を直接確認できる Phase 11 harness と screenshot command を追加した

## Part 2

### 主要型定義

```ts
type ReviewSurface = "settings" | "auth" | "workspace-search" | "dashboard";
type ReviewTheme = "light" | "dark" | "system" | "kanagawa-dragon";

interface Phase11CaptureSpec {
  tcId: string;
  surface: ReviewSurface;
  state: string;
  theme: ReviewTheme;
  output: string;
  viewport: {
    width: number;
    height: number;
  };
}
```

### API / UI シグネチャ

- `LightThemeSharedColorMigrationReviewHarness(props: { surface: ReviewSurface; theme: ReviewTheme })`
- `pnpm --filter @repo/desktop screenshot:light-theme-shared-color-migration`
- `apps/desktop/src/renderer/main.tsx`
  - `?phase11Harness=light-theme-shared-color-migration&surface=settings&theme=light`

### 実装の要点

| 対象                                  | 方針                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `ThemeSelector`                       | unselected / selected / focus-visible を `--text-*`, `--bg-*`, `--status-primary`, `--border-*` へ移行 |
| `AccountSection`                      | unauthenticated / avatar menu / linked providers / dialog の副次テキストと border を token 化          |
| `LocaleSelector` / `TimezoneSelector` | closed / open / selected / hover / search field の contrast を token 化                                |
| `AuthView` / `AuthTimeoutFallback`    | gradient 背景でも heading / helper / CTA inverse text が読めるように調整                               |
| `WorkspaceSearchPanel`                | search / replace / advanced / result / alert / mark を semantic token へ寄せた                         |

### 使用例

```tsx
<LightThemeSharedColorMigrationReviewHarness
  surface="workspace-search"
  theme="light"
/>
```

```bash
pnpm --filter @repo/desktop screenshot:light-theme-shared-color-migration
```

### エラーハンドリング

- worktree path に `#` を含むため、通常の Vite dev server / Vitest runtime が不安定な場合は safe temp build + static serve にフォールバックする
- capture script は `packages/shared` を safe temp へ複製し、必要 alias を build config 側で補正する
- `happy-dom` や `/@vite/env` 解決失敗は product bug ではなく test runtime blind spot として分離記録する

### エッジケース

- `DashboardView` は今回コード変更なしだが、shared migration の副作用確認面として screenshot に含める
- destructive dialog、dropdown open、menu open は通常 state と見え方が変わるため別 TC として capture する
- light theme だけが current scope なので、dark/system capture は N/A 理由を残して省略する

### 設定項目

| 項目                   | 値                                                           | 用途                               |
| ---------------------- | ------------------------------------------------------------ | ---------------------------------- |
| query `phase11Harness` | `light-theme-shared-color-migration`                         | dedicated harness 起動             |
| query `surface`        | `settings`, `auth`, `workspace-search`, `dashboard`          | capture surface 切り替え           |
| query `theme`          | `light`                                                      | current task の target theme       |
| screenshot port        | `4286`                                                       | static serve 時の capture base URL |
| capture metadata       | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | 証跡時刻の正本                     |
