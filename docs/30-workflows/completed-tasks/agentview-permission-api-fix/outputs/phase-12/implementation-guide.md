# AgentView Permission API 修正 実装ガイド

## Part 1

### なぜ必要か

AgentView は「許可済みツール」の情報を読むために、存在しない窓口 `window.electronAPI.permissions` を見ていました。存在しない住所へ荷物を送ると届かないのと同じで、画面を開いた瞬間に `TypeError` が出ていました。正しい窓口は preload が公開している `window.permissionAPI` です。

### 何をするか

1. AgentView の参照先を `window.permissionAPI` に直す
2. 件数取得を `getAllowedTools().tools.length` へ揃える
3. リセットを `clearAll()` に揃える
4. `AgentPermissionMode` は IPC に頼らず画面内 local state として扱う

### 日常の例え

たとえば: マンションの管理室に荷物の問い合わせをしたいのに、存在しない「別館の受付」を探していた状態です。受付そのものを新設するより、正しい管理室の窓口番号を見る方が早くて安全です。

### 今回作ったもの

| 日本語          | 英語                  | 役割                                         |
| --------------- | --------------------- | -------------------------------------------- |
| 許可API取得関数 | `getPermissionApi`    | Renderer から preload 公開面へ安全に到達する |
| 許可件数表示    | `rememberedCount`     | 許可済みツール数を UI に表示する             |
| 許可モード      | `AgentPermissionMode` | 画面内だけで保持する local state             |

## Part 2

### 型定義

```ts
interface PermissionAPI {
  getAllowedTools: () => Promise<{ tools: AllowedToolEntry[] }>;
  revokeTool: (toolName: string) => Promise<{ success: boolean }>;
  clearAll: () => Promise<{ success: boolean; clearedCount: number }>;
}

type AgentPermissionMode =
  | "default"
  | "acceptEdits"
  | "bypassPermissions"
  | "plan";
```

### APIシグネチャ

```ts
function getPermissionApi(): typeof window.permissionAPI | undefined {
  try {
    return window.permissionAPI;
  } catch {
    return undefined;
  }
}

async function loadRememberedPermissions(): Promise<void>;
async function handleResetRemembered(): Promise<void>;
```

### 使用例

```ts
const api = getPermissionApi();
if (!api) {
  return;
}

const result = await api.getAllowedTools();
setRememberedCount(result.tools.length);

const clearResult = await api.clearAll();
if (clearResult.success) {
  await loadRememberedPermissions();
}
```

### エラーハンドリング

| 関数                           | エラー時の挙動                                  |
| ------------------------------ | ----------------------------------------------- |
| `getPermissionApi()`           | preload 未初期化時は `undefined` を返す         |
| `loadPermissions()`            | 件数取得失敗でも既定値表示を維持する            |
| `handlePermissionModeChange()` | local state のみなので IPC エラーを持ち込まない |
| `handleResetRemembered()`      | `clearAll()` 失敗時は error toast を表示する    |

### エッジケース

- `window.permissionAPI` が存在しない環境
- `getAllowedTools()` が reject する環境
- `clearAll()` が reject する環境
- 許可済みツールが 0 件の環境

### 設定項目と定数一覧

| 項目                  | 値 / 扱い                             |
| --------------------- | ------------------------------------- |
| `AgentPermissionMode` | local state のみ。永続化しない        |
| remembered count      | `getAllowedTools().tools.length` 由来 |
| reset action          | `clearAll()` 固定                     |
| follow-up             | `TASK-AGENT-PERM-MODE` で永続化を分離 |

### テスト構成

- `AgentView.test.tsx`: 基本レンダリング、Permission API 統合、fallback
- `AgentView.coverage.test.tsx`: 異常系・未到達分岐
- `AgentView.cta.test.tsx`: CTA 導線と Permission API モック追従

### スクリーンショット参照

- 対象パス: `docs/30-workflows/agentview-permission-api-fix/outputs/phase-11/screenshots/`
- 現状: 実画面キャプチャは未取得。worktree の `esbuild` platform mismatch により screenshot 実行が blocked
- 次回実施時: `apps/desktop/src/renderer/phase11-agent-view.tsx` を current contract（`window.permissionAPI`）で起動し直して再撮影する
