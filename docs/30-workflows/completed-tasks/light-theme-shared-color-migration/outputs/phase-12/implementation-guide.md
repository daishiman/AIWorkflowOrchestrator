# Phase 12 Output: Implementation Guide

## Part 1: なぜこの migration が必要か

この変更は、ライトテーマで一部の UI だけが昔の色指定を持ち続けていた問題をなくすために必要だった。  
semantic token を使っている画面と、`text-white` や `bg-green-50` のような直書きを持つ画面が混ざると、同じアプリなのに「一部だけ別のデザイン言語」で描かれたように見える。

たとえば学校の本棚で、本の分類ラベルだけが教室ごとに勝手な色で貼られている状態を想像すると分かりやすい。  
理科室では青、職員室では薄緑、図書室では手書きの赤になっていると、利用者は「どれが注意」「どれが成功」「どれが選択中」なのかを毎回読み直す必要がある。  
semantic token は、そのラベル色を学校全体で共通化する台帳に近い。

何が変わるかというと、component は「白や緑を直接書く場所」ではなく、「success なら success token を使う場所」に戻る。  
これにより、見た目の統一と将来テーマ変更のしやすさを同時に得られる。

今回の task では token 台帳そのものを作り直したのではなく、component 側に残っていた古いラベル貼りを張り替えた。  
そのため、目的は「新しい色を増やすこと」ではなく「既にある semantic token を一貫して使うこと」にある。

この方針にすると、light / dark / 将来のテーマ追加でも component の責務が単純になる。  
色の意味は token 側、component は意味に応じた token を選ぶだけ、という分担に戻せるからである。

## Part 2: 実装詳細

### 型定義

```ts
type HarnessSurface = "settings" | "auth" | "workspace";
type HarnessTheme = "light" | "dark";
type HarnessAuthMode = "subscription" | "api-key";
type HarnessWorkspaceScenario = "success" | "error";

interface ScreenshotState {
  id: string;
  label: string;
  theme: HarnessTheme;
  selector: string;
}
```

### APIシグネチャ / CLIシグネチャ

```ts
async function setThemeMode(
  nextMode: "kanagawa-dragon" | HarnessTheme | "system",
): Promise<void>

async function setAuthMode(nextMode: HarnessAuthMode): Promise<void>

window.electronAPI.invoke<T>(channel: string, payload?: unknown): Promise<T>
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/styles/light-theme-shared-color-migration.guard.test.ts \
  src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx

node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/completed-tasks/light-theme-shared-color-migration \
  --plan outputs/phase-11/screenshot-plan.json \
  --url http://127.0.0.1:5173 \
  --wait 1500
```

### 使用例

```ts
useAppStore.setState({
  mode: "api-key",
  status: {
    mode: "api-key",
    isValid: true,
    hasCredentials: true,
    message: "Anthropic APIキーを利用できます",
    lastCheckedAt: Date.now(),
  },
} as never);
```

### 実装ポイント

1. guard test で hardcoded color class / hex を禁止し、token migration の回帰を機械化した
2. Batch A-D の product code では semantic token 置換だけに止め、IPC / preload / token baseline は変更しなかった
3. `SettingsView` の blind spot は verification-only ではなく current scope と再判定して修正した
4. Phase 11 は本番 route を汚さないよう、`phase11-light-theme-shared-color-migration.tsx` に harness を分離した

### エラーハンドリング

- `WorkspaceSearchPanel` harness では `search:workspace:execute` を success / error の 2 パターンで返し、error banner 表示も証跡化した
- `AuthView` は `authError` を store state で注入し、error banner の可読性を確認した
- `ApiKeysSection` と `AuthKeySection` は mock `electronAPI` で secure-storage 系の API shape を保った

### エッジケース

- verification-only と見なしていた `SettingsView` に hardcoded status color が残っていた
- Playwright は root script からの ESM import 解決に注意が必要で、workspace root `node_modules/playwright` の解決経路が必要だった
- screenshot plan は state 単位の route override を読まないため、route が異なる state は component entry を分ける必要があった

### 設定可能なパラメータ / 定数一覧

| 項目                      | 値                         | 用途                                        |
| ------------------------- | -------------------------- | ------------------------------------------- |
| `PERSIST_KEY`             | `knowledge-studio-store`   | harness 起動時の stale persisted state 排除 |
| `WORKSPACE_PATH`          | repo root path             | workspace search screenshot 用の固定 root   |
| `--wait`                  | `1500`                     | screenshot capture 前の安定待機             |
| `theme` query             | `light` / `dark`           | screenshot theme 切替                       |
| `authMode` query          | `api-key` / `subscription` | SettingsView 表示状態の固定                 |
| `workspaceScenario` query | `success` / `error`        | WorkspaceSearchPanel state の固定           |
