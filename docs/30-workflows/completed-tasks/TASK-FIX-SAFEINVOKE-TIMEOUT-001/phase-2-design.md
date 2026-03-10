# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 2                               |
| Phase名    | 設計                            |
| カテゴリ   | fix                             |
| ステータス | completed                       |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |

## 目的

`safeInvoke` 系 wrapper のタイムアウト機構を `Promise.race` パターンで設計する。局所修正ではなく Preload 共通 helper 抽出を採用し、エラーメッセージ形式、定数設計、メモリリーク対策、既存 wrapper への適用方法を含む詳細設計を行う。

## 実行タスク

- タスク1: 解法比較を行い、Preload 共通 helper 抽出案を採用する
- タスク2: timeout-aware helper の API / 定数 / エラーメッセージを設計する
- タスク3: `index.ts` / `skill-api.ts` / `skill-creator-api.ts` への適用方法を定義する
- タスク4: テスト戦略と回帰確認範囲を定義する

### タスク1: アーキテクチャ設計

**目的**: タイムアウト機構の全体構造を設計する

**比較した案**:

| 案  | 内容                                            | 利点                                            | 欠点                                                   | 判定   |
| --- | ----------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------ | ------ |
| A   | `index.ts` の `safeInvoke` だけ修正             | 差分最小                                        | `skill-api.ts` / `skill-creator-api.ts` にドリフト残存 | 不採用 |
| B   | Preload 共通 helper を抽出し 3 wrapper で再利用 | 関心ごと分離、一貫した timeout 契約、テスト集約 | helper 追加分の差分が増える                            | 採用   |
| C   | `authSlice` 等 consumer 側で個別 timeout        | 局所症状には効く                                | 呼び出し側ごとに責務分散、再利用不可                   | 不採用 |

**採用方針**:

```
Renderer → contextBridge / preload API
                    ↓
          safeInvoke wrapper (各公開 API)
                    ↓
        shared invoke helper (+ timeout)
                    ↓
             ipcRenderer.invoke
                    ↓
               Main Process
```

- timeout / allowlist / エラーメッセージ責務は helper に集約する
- 外部インターフェース（引数・戻り値の型）は変更しない
- 呼び出し元は変更不要（透過的なタイムアウト追加）
- `safeInvokeUnwrap` は既存どおり wrapper 展開責務のみを維持する

### タスク2: 詳細設計

**目的**: 実装レベルの詳細設計を行う

#### 2-1: 定数設計

```typescript
/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
const IPC_TIMEOUT_MS = 5000;
```

**タイムアウト値の根拠**:

- 通常のIPC応答: 10-100ms（ローカル処理）
- 外部API呼び出し: 1000-3000ms（ネットワーク遅延含む）
- 5000ms: 外部APIの遅延を許容しつつ、ハングを早期検出するバランス
- Supabase `getSession()` のタイムアウト（通常2-3秒）を超える余裕

#### 2-2: 共通 helper 設計

```typescript
const IPC_TIMEOUT_MS = 5000;

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

#### 2-3: 各 wrapper への適用

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}
```

`index.ts` / `skill-api.ts` / `skill-creator-api.ts` はこの薄い wrapper だけを持ち、timeout 実装詳細は持たない。

#### 2-4: エラーメッセージ設計

**タイムアウトエラー形式**:

```
IPC timeout: {channel} did not respond within {IPC_TIMEOUT_MS}ms
```

**設計判断**:

- channel 名を含める: デバッグ時にどのIPC呼び出しがタイムアウトしたか特定可能
- タイムアウト値を含める: 設定値の確認が容易
- 内部パス・スタックトレースは含めない: セキュリティ考慮（Preload → Renderer に露出するため）
- `IPC timeout:` プレフィックス: 呼び出し元でタイムアウトエラーを判別可能

#### 2-5: メモリリーク対策

**cleanup 方針**:

- **正常応答が先**: `clearTimeout(timeoutId)` を実行して timeout timer を残さない
- **Main reject が先**: 同じく `clearTimeout(timeoutId)` を実行し、IPC エラーをそのまま返す
- **タイムアウトが先**: Promise は reject 済みとなり、後続の遅延 resolve は無視される

**結論**: timeout error と同時に timer cleanup まで実装する。これにより fake timer テストで `vi.getTimerCount() === 0` を保証でき、実運用でも短命 timer の残留を避けられる。

### タスク3: インターフェース影響分析

**目的**: 既存のインターフェースへの影響がないことを確認する

| 項目                 | 変更前                                        | 変更後                      | 影響     |
| -------------------- | --------------------------------------------- | --------------------------- | -------- |
| 関数シグネチャ       | `safeInvoke<T>(channel, ...args): Promise<T>` | 同一                        | なし     |
| 正常応答の戻り値     | `T`                                           | `T`                         | なし     |
| チャンネル拒否エラー | `Error("Channel X is not allowed")`           | 同一                        | なし     |
| タイムアウトエラー   | なし（永遠に pending）                        | `Error("IPC timeout: ...")` | **新規** |
| 実装配置             | 各 file に重複                                | 共通 helper + 薄い wrapper  | **改善** |

- 呼び出し元は既に `try-catch` または `.catch()` でエラーハンドリングしている前提
- タイムアウトエラーは新規の reject パターンだが、既存のエラーハンドリングで捕捉される

### タスク4: テスト設計方針

**目的**: Phase 4 に向けたテスト設計方針を定義する

**テスト戦略**:

1. **helper 単体テスト**: IPC が即座に応答 / 無応答 / エラー / 許可外チャンネル
2. **wrapper 回帰テスト**: `index.ts` / `skill-api.ts` / `skill-creator-api.ts` が helper を経由して同じ契約を守る
3. **タイムアウト直前応答テスト**: IPC_TIMEOUT_MS - 1ms で応答 → 正常 resolve
4. **エラーメッセージ検証**: channel 名とタイムアウト値がメッセージに含まれる

**タイマーテスト方針（P13 準拠）**:

- `vi.useFakeTimers()` を使用
- `vi.advanceTimersByTime(IPC_TIMEOUT_MS)` で1ステップずつ進める
- `vi.runAllTimers()` は使用しない（無限ループ防止）

## 参照資料

| 参照資料                      | パス                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 成果物                | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-1-requirements.md`                                                                            |
| 対象ファイル                  | `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/skill-api.ts`, `apps/desktop/src/preload/skill-creator-api.ts`, `apps/desktop/src/preload/ipc-utils.ts` |
| P13: タイマーテスト無限ループ | `.claude/rules/06-known-pitfalls.md#P13`                                                                                                                               |
| セキュリティルール            | `.claude/rules/04-electron-security.md`                                                                                                                                |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                           |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Electron IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Preload層の制約確認                            |
| 実装パターン集            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Promise.race、safeInvokeパターン               |
| 認証 IPC 契約             | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                         | `auth:get-session` / `check-online` の影響確認 |
| 認証アーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | AuthGuard 停滞との因果確認                     |
| 状態管理                  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | timeout 後の state 終了条件                    |

## 統合テスト連携

- Phase 4 で本設計に基づくテストケースを作成
- Phase 5 で本設計に基づく実装を行う
- Phase 8 では timer cleanup 採用後のコード品質確認を行い、追加抽象化は不要と判断する

## 成果物

| 成果物           | パス                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| 設計書（本文書） | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md` |

## 完了条件

- [ ] `Promise.race` パターンの詳細設計が完了
- [ ] エラーメッセージ形式が決定
- [ ] メモリリーク対策の分析が完了
- [ ] インターフェース影響分析が完了
- [ ] テスト設計方針が定義
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 3: 設計レビューへ進む。要件・設計の妥当性を検証する。
