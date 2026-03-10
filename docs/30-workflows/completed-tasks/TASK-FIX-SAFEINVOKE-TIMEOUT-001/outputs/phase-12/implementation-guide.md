# 実装ガイド - TASK-FIX-SAFEINVOKE-TIMEOUT-001

## メタ情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| タスクID | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| 作成日   | 2026-03-10                      |
| Phase    | 12                              |

---

## Part 1: やさしい解説（中学生レベル）

### なぜ必要だったか

電話をかけたのに相手がずっと出なかったら、いつまでも待ち続けるのは困ります。画面の中でも同じで、返事が来ない処理を待ち続けると、先に進めなくなります。

### 何をしたか

`safeInvoke` に「5秒待っても返事がなければ失敗として終わらせる」仕組みを入れました。さらに、返事が早く来たときは待機用タイマーを片付けるようにして、余計な待機が残らないようにしました。

### イメージ

1. 呼び出しを始める
2. 同時に 5 秒タイマーを始める
3. 先に返事が来たら成功して終わる
4. 5 秒たっても返事がなければ timeout エラーで終わる
5. 成功でも失敗でもタイマーは片付ける

### どんな効果があるか

- 返事が来ない処理で画面全体が止まりにくくなる
- エラー時に「どの呼び出しが止まったか」を追いやすくなる
- テストでタイマーが残らないことまで確認できる

---

## Part 2: 開発者向け実装詳細

### 1. 変更対象

| ファイル                                        | 役割                         |
| ----------------------------------------------- | ---------------------------- |
| `apps/desktop/src/preload/ipc-utils.ts`         | timeout + cleanup 契約の正本 |
| `apps/desktop/src/preload/index.ts`             | 共通 helper への委譲         |
| `apps/desktop/src/preload/skill-api.ts`         | 共通 helper への委譲         |
| `apps/desktop/src/preload/skill-creator-api.ts` | 共通 helper への委譲         |

### 2. 実装コード

#### TypeScript の型定義

```typescript
type SafeInvoke = <T>(channel: string, ...args: unknown[]) => Promise<T>;

interface InvokeWithTimeout {
  <T>(
    allowedChannels: readonly string[],
    channel: string,
    ...args: unknown[]
  ): Promise<T>;
}
```

```typescript
import { ipcRenderer } from "electron";

export const IPC_TIMEOUT_MS = 5000;

export function invokeWithTimeout<T>(
  allowedChannels: readonly string[],
  channel: string,
  ...args: unknown[]
): Promise<T> {
  if (!allowedChannels.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }

  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
        ),
      );
    }, IPC_TIMEOUT_MS);

    ipcRenderer
      .invoke(channel, ...args)
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result as T);
      })
      .catch((error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
```

### 3. API シグネチャ

```typescript
export const IPC_TIMEOUT_MS: 5000;

export function invokeWithTimeout<T>(
  allowedChannels: readonly string[],
  channel: string,
  ...args: unknown[]
): Promise<T>;

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T>;
```

### 4. 契約

| 項目          | 内容                                                      |
| ------------- | --------------------------------------------------------- |
| timeout 値    | `IPC_TIMEOUT_MS = 5000`                                   |
| fail-fast     | 許可外チャンネルは `ipcRenderer.invoke()` 前に即時 reject |
| timeout error | `IPC timeout: {channel} did not respond within 5000ms`    |
| cleanup       | resolve / reject の両分岐で `clearTimeout(timeoutId)`     |
| 後方互換      | `safeInvoke<T>(channel, ...args): Promise<T>` を維持      |

### 5. エラーハンドリング

```typescript
try {
  const session = await window.electronAPI.auth.getSession();
  return session;
} catch (error) {
  console.warn("[AuthSlice] getSession failed:", error);
  return null;
}
```

- timeout も Main reject も `catch` で一元処理できる
- エラーメッセージは channel 名と timeout 値のみを露出する

### 6. 使用例

```typescript
const session = await window.electronAPI.auth.getSession();
const imported = await window.skillAPI.list();
const report = await window.skillCreatorAPI.executeTasks(options);
```

### 7. cleanup を採用した理由

| 観点   | 理由                                                        |
| ------ | ----------------------------------------------------------- |
| 再現性 | fake timer テストで `vi.getTimerCount() === 0` を保証できる |
| 保守性 | timeout の責務と cleanup の責務を 1 関数に閉じ込められる    |
| 安全性 | 正常応答後や reject 後に不要な timer を残さない             |

### 8. エッジケース

- 許可外チャンネルは timeout 待機に入る前に即時 reject する
- Main Process 側の reject は timeout error へ変換せず、そのまま返す
- timeout 後に遅延 resolve が来ても状態再遷移は起こさない
- 複数の invoke が同時に走っても各 timer は独立して管理される

### 9. 設定と定数

| 項目               | 値                                                     | 説明                          |
| ------------------ | ------------------------------------------------------ | ----------------------------- |
| `IPC_TIMEOUT_MS`   | `5000`                                                 | Preload invoke の最大待機時間 |
| timeout error 形式 | `IPC timeout: <channel> did not respond within <ms>ms` | ログ検索しやすい固定文言      |

### 10. テスト観点

| 観点                | 結果 |
| ------------------- | ---- |
| timeout 発火        | PASS |
| エラーメッセージ    | PASS |
| allowlist fail-fast | PASS |
| 直前応答            | PASS |
| 遅延応答無視        | PASS |
| success 後 cleanup  | PASS |
| reject 後 cleanup   | PASS |

### 8. 検証結果

| コマンド                                                                                                                                                                       | 結果                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `cd apps/desktop && pnpm vitest run src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts`                                                                                | PASS（15 tests）             |
| `cd apps/desktop && pnpm vitest run src/preload`                                                                                                                               | PASS（19 files / 551 tests） |
| `cd apps/desktop && pnpm typecheck`                                                                                                                                            | PASS                         |
| `node apps/desktop/scripts/capture-task-fix-safeinvoke-timeout-phase11.mjs`                                                                                                    | PASS（4 screenshots）        |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` | PASS                         |

### 11. UI 影響面

本タスクは Preload 実装だが、timeout の影響は AuthGuard timeout fallback と Settings 公開シェルに現れるため、Phase 11 で screenshot 4 件を取得した。

### 12. 未タスク

| タスクID                                                | 内容                                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `UT-IMP-AUTH-TIMEOUT-FALLBACK-LIGHT-CONTRAST-GUARD-001` | light theme の `AuthTimeoutFallback` で `リトライ` の視認性が低い問題を改善する |
