# Phase 2 成果物: 設計ドキュメント

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 2                               |
| 成果物種別 | 設計ドキュメント                |
| 作成日     | 2026-03-10                      |
| ステータス | 完了                            |

## 1. アーキテクチャ設計

### 1-1. 解法比較

| 案  | 内容                                           | 利点                                            | 欠点                                                   | 判定     |
| --- | ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------ | -------- |
| A   | `index.ts` の `safeInvoke` だけ修正            | 差分最小                                        | `skill-api.ts` / `skill-creator-api.ts` にドリフト残存 | 不採用   |
| B   | Preload 共通 helper を抽出し3 wrapper で再利用 | 関心ごと分離、一貫した timeout 契約、テスト集約 | helper 追加分の差分が増える                            | **採用** |
| C   | `authSlice` 等 consumer 側で個別 timeout       | 局所症状には効く                                | 呼び出し側ごとに責務分散、再利用不可                   | 不採用   |

### 1-2. 採用案（案B）のアーキテクチャ

```
Renderer → contextBridge / preload API
                    |
          safeInvoke wrapper（各公開 API ファイル）
                    |
        invokeWithTimeout helper（ipc-utils.ts）
                    |
             ipcRenderer.invoke
                    |
               Main Process
```

**設計原則**:

- timeout / allowlist / エラーメッセージ責務は helper（`ipc-utils.ts`）に集約する
- 外部インターフェース（引数・戻り値の型）は変更しない
- 呼び出し元（Renderer 側）は変更不要（透過的なタイムアウト追加）
- `safeInvokeUnwrap` は既存どおり wrapper 展開責務のみを維持する

### 1-3. ファイル構成

| ファイル                           | 役割               | 変更内容                                         |
| ---------------------------------- | ------------------ | ------------------------------------------------ |
| `preload/ipc-utils.ts`（**新規**） | 共通 helper + 定数 | `IPC_TIMEOUT_MS` 定数 + `invokeWithTimeout` 関数 |
| `preload/index.ts`                 | メイン preload API | `safeInvoke` を `invokeWithTimeout` に委譲       |
| `preload/skill-api.ts`             | スキル管理 API     | `safeInvoke` を `invokeWithTimeout` に委譲       |
| `preload/skill-creator-api.ts`     | スキル作成 API     | `safeInvoke` を `invokeWithTimeout` に委譲       |

## 2. 詳細設計

### 2-1. 定数設計

```typescript
// apps/desktop/src/preload/ipc-utils.ts

/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
export const IPC_TIMEOUT_MS = 5000;
```

**タイムアウト値 5000ms の根拠**:

| シナリオ                   | 典型的な応答時間 | 5000ms との関係       |
| -------------------------- | ---------------- | --------------------- |
| ローカル IPC 処理          | 10-100ms         | 十分な余裕            |
| 外部 API 呼び出し（LLM等） | 1000-3000ms      | 余裕あり              |
| Supabase `getSession()`    | 2000-3000ms      | タイムアウトより短い  |
| ネットワーク障害時         | 無応答           | 5秒で検出、ハング防止 |

### 2-2. 共通 helper 設計

```typescript
// apps/desktop/src/preload/ipc-utils.ts

import { ipcRenderer } from "electron";

export const IPC_TIMEOUT_MS = 5000;

/**
 * タイムアウト付き IPC invoke wrapper
 *
 * allowedChannels に含まれないチャンネルは即座に reject する。
 * IPC_TIMEOUT_MS 以内に Main Process が応答しない場合、
 * タイムアウトエラーで reject する。
 *
 * @param allowedChannels - 許可チャンネルのホワイトリスト
 * @param channel - IPC チャンネル名
 * @param args - IPC ハンドラに渡す引数
 * @returns Main Process からの応答
 * @throws channel が allowedChannels に含まれない場合
 * @throws IPC_TIMEOUT_MS 以内に応答がない場合
 */
export function invokeWithTimeout<T>(
  allowedChannels: readonly string[],
  channel: string,
  ...args: unknown[]
): Promise<T> {
  if (!allowedChannels.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return Promise.race([
    ipcRenderer.invoke(channel, ...args),
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
            ),
          ),
        IPC_TIMEOUT_MS,
      ),
    ),
  ]);
}
```

### 2-3. 各 wrapper への適用

3ファイルとも同一パターンで `safeInvoke` を `invokeWithTimeout` に委譲する。

```typescript
// apps/desktop/src/preload/index.ts (L113-118 を置換)
import { invokeWithTimeout } from "./ipc-utils";

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}
```

```typescript
// apps/desktop/src/preload/skill-api.ts (L374-379 を置換)
import { invokeWithTimeout } from "./ipc-utils";

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}
```

```typescript
// apps/desktop/src/preload/skill-creator-api.ts (L177-182 を置換)
import { invokeWithTimeout } from "./ipc-utils";

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}
```

**変更の影響**:

- 各ファイルの `safeInvoke` 関数シグネチャは変更なし
- `safeInvokeUnwrap` は `safeInvoke` を呼び出しているため、自動的にタイムアウトが適用される
- 呼び出し元（Renderer 側）の変更は不要

### 2-4. エラーメッセージ設計

**タイムアウトエラー形式**:

```
IPC timeout: {channel} did not respond within {IPC_TIMEOUT_MS}ms
```

**実例**:

```
IPC timeout: auth:get-session did not respond within 5000ms
IPC timeout: llm:get-providers did not respond within 5000ms
IPC timeout: skill:list did not respond within 5000ms
```

**設計判断**:

| 判断項目                      | 決定                             | 理由                                              |
| ----------------------------- | -------------------------------- | ------------------------------------------------- |
| channel 名を含める            | 含める                           | デバッグ時にどの IPC がタイムアウトしたか特定可能 |
| タイムアウト値を含める        | 含める                           | 設定値の確認が容易                                |
| `IPC timeout:` プレフィックス | 使用する                         | 呼び出し元でタイムアウトエラーを判別可能          |
| 内部パス・スタックトレース    | 含めない                         | Preload → Renderer に露出するためセキュリティ考慮 |
| チャンネル拒否エラー形式      | 変更なし（既存メッセージを維持） | 後方互換性の維持                                  |

### 2-5. メモリリーク分析

timeout error 自体に加えて timer cleanup を入れ、正常応答・reject の両方で `clearTimeout(timeoutId)` を実行する。

#### 正常応答が先の場合

```
[IPC応答 Promise] → resolve (採用)
[setTimeout Promise] → 5秒後に reject (無視)
```

- `setTimeout` のコールバックは5秒後に実行されるが、Promise は既に resolved のため `reject` は無視される
- Timer は最大 `IPC_TIMEOUT_MS` 後に自動解放される

#### タイムアウトが先の場合

```
[setTimeout Promise] → reject (採用)
[IPC応答 Promise] → 後から resolve (無視)
```

- `ipcRenderer.invoke` の Promise は後から resolve されるが、結果は無視される
- IPC 応答のメモリは GC で回収される
- Renderer の状態を再遷移させるリスクはない（Promise が既に settled のため `.then()` は実行されない）

#### 結論

最終実装では cleanup を採用し、`vi.getTimerCount() === 0` を success/reject の両ケースで固定した。

**採用した cleanup パターン**:

```typescript
function invokeWithTimeout<T>(
  allowedChannels: readonly string[],
  channel: string,
  ...args: unknown[]
): Promise<T> {
  if (!allowedChannels.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          new Error(
            `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
          ),
        ),
      IPC_TIMEOUT_MS,
    );
    ipcRenderer
      .invoke(channel, ...args)
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
```

Phase 8（リファクタリング）では、この cleanup 実装のままで過剰抽象化不要と判定した。

### 2-6. インターフェース影響分析

| 項目                 | 変更前                                        | 変更後                            | 影響     |
| -------------------- | --------------------------------------------- | --------------------------------- | -------- |
| 関数シグネチャ       | `safeInvoke<T>(channel, ...args): Promise<T>` | 同一                              | なし     |
| 正常応答の戻り値     | `T`                                           | `T`                               | なし     |
| チャンネル拒否エラー | `Error("Channel X is not allowed")`           | 同一                              | なし     |
| タイムアウトエラー   | なし（永遠に pending）                        | `Error("IPC timeout: ...")`       | **新規** |
| `safeInvokeUnwrap`   | `safeInvoke` の戻り値を展開                   | 同一（safeInvoke 経由で自動適用） | なし     |
| 実装配置             | 各ファイルに重複                              | 共通 helper + 薄い wrapper        | **改善** |

## 3. テスト設計方針

### 3-1. テスト対象と戦略

| テストカテゴリ       | テスト内容                                                           | テストファイル                       |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| helper 単体テスト    | `invokeWithTimeout` の正常応答、タイムアウト、拒否チャンネル、エラー | `preload/ipc-utils.test.ts`          |
| wrapper 回帰テスト   | 3ファイルの `safeInvoke` が helper を経由して同じ契約を守る          | 既存テストファイル（変更不要の想定） |
| エッジケーステスト   | タイムアウト直前応答、複数同時呼び出し                               | `preload/ipc-utils.test.ts`          |
| エラーメッセージ検証 | channel 名とタイムアウト値の含有                                     | `preload/ipc-utils.test.ts`          |

### 3-2. タイマーテスト方針（P13 準拠）

```typescript
// P13 準拠: advanceTimersByTime を使用（runAllTimers 禁止）
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("IPC_TIMEOUT_MS 経過後にタイムアウトエラーで reject する", async () => {
  // ipcRenderer.invoke が解決しない Promise を返す
  vi.mocked(ipcRenderer.invoke).mockReturnValue(new Promise(() => {}));

  const promise = invokeWithTimeout(ALLOWED_CHANNELS, "test:channel");

  // タイムアウト時間を進める
  vi.advanceTimersByTime(IPC_TIMEOUT_MS);

  await expect(promise).rejects.toThrow(
    "IPC timeout: test:channel did not respond within 5000ms",
  );
});
```

### 3-3. AC カバレッジマッピング

| AC   | テストケース                                              | カバー |
| ---- | --------------------------------------------------------- | ------ |
| AC-1 | タイムアウト後に reject されることを検証                  | [x]    |
| AC-2 | エラーメッセージに channel 名と ms 値が含まれることを検証 | [x]    |
| AC-3 | 正常応答が IPC_TIMEOUT_MS 前に resolve されることを検証   | [x]    |
| AC-4 | 拒否チャンネルが即座に reject されることを検証            | [x]    |
| AC-5 | `IPC_TIMEOUT_MS` が export されており定数であることを検証 | [x]    |
| AC-6 | 既存テスト全 PASS（CI 実行で検証）                        | [x]    |

## 完了条件チェックリスト

- [x] `Promise.race` パターンの詳細設計が完了
- [x] エラーメッセージ形式が決定（`IPC timeout: {channel} did not respond within {IPC_TIMEOUT_MS}ms`）
- [x] メモリリーク対策の分析が完了（シンプルな `Promise.race` で十分）
- [x] インターフェース影響分析が完了（外部インターフェース変更なし）
- [x] テスト設計方針が定義（P13 準拠、fake timer 使用）
- [x] 本 Phase 内の全タスクを100%実行完了
