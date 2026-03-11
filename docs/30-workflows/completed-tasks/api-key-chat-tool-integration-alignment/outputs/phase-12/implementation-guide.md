# TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 実装ガイド

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001            |
| 対象       | APIキー保存連動 / チャット実行経路 / AuthKey表示契約 |
| 作成日     | 2026-03-11                                           |
| 関連成果物 | Phase 5 / 6 / 11 / 12                                |

## Part 1: 中学生向けの説明

### なぜ必要か

設定画面でAPIキーを入れても、実際のチャット実行が別の保管場所を見ていると、
「入れたはずなのに使えない」という状態が起きます。
今回の修正は、この食い違いをなくして「設定した情報がそのまま使われる」状態にするために必要でした。

### たとえば（教室の鍵管理の例え）

たとえば教室の鍵を、先生は職員室の棚Aに置くのに、見回り担当は棚Bを見に行くとします。
このままだと鍵があるのに「鍵がない」と判定されます。
今回やったのは、鍵を置く棚と取りに行く棚をそろえ、
さらに「いまどの棚を見たか」まで表示できるようにしたイメージです。

### 何をしたか

- APIキー保存後に、実行側アダプタのキャッシュを必ずクリアして最新キーを再読込するようにした
- Rendererで選んだ provider/model を Main に同期する `llm:set-selected-config` を追加した
- `auth-key:exists` の戻り値に `source` を追加し、画面で「saved / env-fallback / not-set」を明確表示した
- Settings で `authMode === "api-key"` のときだけ AuthKeySection を表示する契約に統一した

### どう確認したか

- 自動テスト: 6ファイル、133 passed / 1 skipped
- 手動テスト: TC-11-01〜03 の実画面スクリーンショットを再取得
- 視覚レビュー: Apple UI/UX観点（視覚階層、状態認知、フィードバック、一貫性、可読性）で全PASS

## Part 2: 技術者向け実装詳細

### 主要型定義（TypeScript）

```ts
type AuthKeySource = "saved" | "env-fallback" | "not-set";

export interface AuthKeyExistsResponse {
  exists: boolean;
  source?: AuthKeySource;
}

export interface AIChatRequest {
  prompt: string;
  providerId?: LLMProviderId;
  modelId?: string;
}

export interface LLMSetSelectedConfigRequest {
  providerId: LLMProviderId;
  modelId: string;
}
```

### APIシグネチャ

```ts
window.electronAPI.llm.setSelectedConfig(
  request: { providerId: LLMProviderId; modelId: string }
): Promise<{ success: boolean; error?: string }>;

window.electronAPI.ai.chat(
  request: { prompt: string; providerId?: LLMProviderId; modelId?: string }
): Promise<AIChatResponse>;

window.electronAPI.authKey.exists(): Promise<{
  exists: boolean;
  source?: "saved" | "env-fallback" | "not-set";
}>;
```

### 実行フロー

1. Renderer の LLM選択変更時に `llm:set-selected-config` で Mainへ同期
2. `ai.chat` 実行時は request指定（provider/model）があれば最優先で採用
3. request指定がなければ Main 側の選択状態を使う
4. APIキー保存/削除時は `LLMAdapterFactory.clearInstance(provider)` で stale cache を除去
5. AuthKey表示は `auth-key:exists` の `source` を優先してUI反映

### エラーハンドリング

- `providerId` のみ、または `modelId` のみの片指定は `INVALID_INPUT` として拒否
- 許可されない provider 指定は `INVALID_PROVIDER` として拒否
- `auth-key:exists` で取得失敗した場合は `exists=false, source="not-set"` を返し、秘密情報は返さない

### エッジケース

- 環境変数のみでAuthKeyがある場合: `exists=true, source="env-fallback"`
- 保存済みAuthKeyがある場合: `exists=true, source="saved"`
- APIキー更新直後のチャット送信: cache clearにより旧キーでの送信を回避
- `ai.chat` に provider/model未指定: Mainの最新選択値へフォールバック

### 設定項目と定数

| 項目                      | 値 / 役割                            |
| ------------------------- | ------------------------------------ |
| `authMode`                | `"subscription"` / `"api-key"`       |
| `AuthKeySource`           | `saved` / `env-fallback` / `not-set` |
| `llm:set-selected-config` | Renderer選択状態をMainへ同期するIPC  |
| `AI_CHAT` request優先順位 | `request指定 > Main選択状態`         |

### 使用例

```ts
await window.electronAPI.llm.setSelectedConfig({
  providerId: "anthropic",
  modelId: "claude-3-5-sonnet",
});

const chatRes = await window.electronAPI.ai.chat({
  prompt: "現在の設定状態を要約して",
});

const authKeyState = await window.electronAPI.authKey.exists();
// => { exists: true, source: "env-fallback" }
```

### 実装差分（主要ファイル）

- Main: `apps/desktop/src/main/ipc/aiHandlers.ts`, `apiKeyHandlers.ts`, `authKeyHandlers.ts`, `handlers/llm.ts`, `services/secureStorage.ts`
- Preload: `apps/desktop/src/preload/channels.ts`, `index.ts`, `types.ts`
- Renderer: `apps/desktop/src/renderer/store/slices/llmSlice.ts`, `chatSlice.ts`, `views/SettingsView/index.tsx`, `components/settings/AuthKeySection/index.tsx`
- Specs: `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md` ほか
