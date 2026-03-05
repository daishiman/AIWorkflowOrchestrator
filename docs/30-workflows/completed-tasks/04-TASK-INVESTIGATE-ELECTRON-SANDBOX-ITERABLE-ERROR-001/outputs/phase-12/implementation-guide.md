# Phase 12 実装ガイド

## Part 1（中学生向け）

今回の不具合は、「渡ってくるデータの形が想定と違ったときに、アプリがびっくりして止まる」問題です。

- なぜ必要か: 認証連携の解除後に、画面が更新される途中でデータの形が崩れると、利用者が操作できなくなるため。
- 何をしたか: Main で送信データをそろえ、Renderer でも受信データを安全な形に直す二重防御を入れた。
- Main側では、送る前にデータの形をそろえる。
- Renderer側では、受け取ったあとにもう一度安全確認する。
- こうすると、どちらか一方でミスがあっても止まりにくくなる。

日常の例でいうと、荷物を送る人が中身チェックし、受け取る人も開封時チェックする二重確認です。

## Part 2（技術者向け）

### 変更点

- `profileHandlers.ts`
  - `toAuthUser(updatedUser)` を適用し、`AUTH_STATE_CHANGED` payload の `user` を正規化。
- `authSlice.ts`
  - `isLinkedProvider` / `normalizeLinkedProviders` を追加。
  - `fetchLinkedProviders`, `linkProvider`, `unlinkProvider`, `useProviderAvatar` へ適用。

### API/型シグネチャ影響

- 新規IPCチャンネル追加: なし
- 既存IPC request/response 型名変更: なし
- 契約上の意味変更: なし（ランタイム整合のみ強化）

### 型定義（TypeScript）

```ts
type LinkedProvider = {
  provider: string;
  providerUserId?: string;
  linkedAt?: string;
};

function isLinkedProvider(value: unknown): value is LinkedProvider;
function normalizeLinkedProviders(
  source: unknown,
  context: string,
): LinkedProvider[];
```

### APIシグネチャと使用例

```ts
// preload public API
profile.getProviders(): Promise<{ success: true; data: unknown } | { success: false; error: string }>;
profile.linkProvider(provider: string): Promise<{ success: boolean; data?: unknown; error?: string }>;
profile.unlinkProvider(provider: string): Promise<{ success: boolean; data?: unknown; error?: string }>;
```

```ts
const res = await window.electronAPI.profile.getProviders();
const linkedProviders = res.success
  ? normalizeLinkedProviders(res.data, "profile.getProviders")
  : [];
```

### エッジケース

- `response.data` が非配列 → `[]` へフォールバック
- `linkedProviders` に不正要素混入 → valid要素のみ採用
- state破損状態で `linkProvider` 実行 → 正常配列へ回復

### エラーハンドリング

| ケース                | 対応                                       |
| --------------------- | ------------------------------------------ |
| `getProviders` が失敗 | `linkedProviders=[]` とし、画面継続        |
| 配列以外の payload    | 契約違反ログを出しつつ `[]` へ正規化       |
| 既存 state が破損     | 操作前に `normalizeLinkedProviders` で復旧 |

### 設定可能パラメータ / 定数

| 項目               | 値                                           |
| ------------------ | -------------------------------------------- |
| 新規設定パラメータ | なし                                         |
| 新規定数追加       | なし                                         |
| 補足               | 既存契約の防御強化のため、設定追加なしで適用 |

### 実行コマンド

- `pnpm --filter @repo/desktop test:run src/renderer/store/slices/authSlice.test.ts src/main/ipc/profileHandlers.test.ts src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx`
- `pnpm --filter @repo/desktop typecheck`
