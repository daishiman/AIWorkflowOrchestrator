# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 2                               |
| Phase名    | 設計                            |
| カテゴリ   | fix                             |
| ステータス | pending                         |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |

## 目的

`safeInvoke` のタイムアウト機構を `Promise.race` パターンで設計する。エラーメッセージ形式、定数設計、メモリリーク対策を含む詳細設計を行う。

## 実行タスク

### タスク1: アーキテクチャ設計

**目的**: タイムアウト機構の全体構造を設計する

**設計方針**:

```
Renderer → contextBridge → safeInvoke (+ timeout) → ipcRenderer.invoke → Main Process
                                ↓ timeout
                          reject(TimeoutError)
```

- 変更は `safeInvoke` 関数内部のみに閉じる
- 外部インターフェース（引数・戻り値の型）は変更しない
- 呼び出し元は変更不要（透過的なタイムアウト追加）

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

#### 2-2: `safeInvoke` 修正設計

```typescript
const IPC_TIMEOUT_MS = 5000;

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
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

#### 2-3: エラーメッセージ設計

**タイムアウトエラー形式**:

```
IPC timeout: {channel} did not respond within {IPC_TIMEOUT_MS}ms
```

**設計判断**:

- channel 名を含める: デバッグ時にどのIPC呼び出しがタイムアウトしたか特定可能
- タイムアウト値を含める: 設定値の確認が容易
- 内部パス・スタックトレースは含めない: セキュリティ考慮（Preload → Renderer に露出するため）
- `IPC timeout:` プレフィックス: 呼び出し元でタイムアウトエラーを判別可能

#### 2-4: メモリリーク対策

**`Promise.race` のメモリリーク特性**:

`Promise.race` は最初に settle した Promise の結果を返すが、他の Promise はキャンセルされない。

- **正常応答が先**: `setTimeout` のコールバックは後から実行されるが、`reject` は無視される（Promise は既に resolved）。Timer は GC 対象にならないが、5秒後に自動解放される
- **タイムアウトが先**: `ipcRenderer.invoke` の Promise は後から resolve されるが、結果は無視される。IPC 応答のメモリは GC で回収される

**結論**: `setTimeout` の Timer は最大 IPC_TIMEOUT_MS 後に解放されるため、実用上のメモリリークは発生しない。`clearTimeout` による明示的なクリーンアップは複雑さに対してメリットが小さいため、シンプルな `Promise.race` パターンを採用する。

**代替案（不採用）**: `clearTimeout` パターン

```typescript
// 不採用: 複雑さに対してメリットが小さい
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(...)), IPC_TIMEOUT_MS);
    ipcRenderer.invoke(channel, ...args)
      .then((result) => { clearTimeout(timer); resolve(result); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}
```

### タスク3: インターフェース影響分析

**目的**: 既存のインターフェースへの影響がないことを確認する

| 項目                 | 変更前                                        | 変更後                      | 影響     |
| -------------------- | --------------------------------------------- | --------------------------- | -------- |
| 関数シグネチャ       | `safeInvoke<T>(channel, ...args): Promise<T>` | 同一                        | なし     |
| 正常応答の戻り値     | `T`                                           | `T`                         | なし     |
| チャンネル拒否エラー | `Error("Channel X is not allowed")`           | 同一                        | なし     |
| タイムアウトエラー   | なし（永遠に pending）                        | `Error("IPC timeout: ...")` | **新規** |

- 呼び出し元は既に `try-catch` または `.catch()` でエラーハンドリングしている前提
- タイムアウトエラーは新規の reject パターンだが、既存のエラーハンドリングで捕捉される

### タスク4: テスト設計方針

**目的**: Phase 4 に向けたテスト設計方針を定義する

**テスト戦略**:

1. **正常応答テスト**: IPC が即座に応答 → タイムアウトなしで resolve
2. **タイムアウトテスト**: IPC が応答しない → IPC_TIMEOUT_MS 後に reject
3. **チャンネル拒否テスト**: 既存テストの維持
4. **タイムアウト直前応答テスト**: IPC_TIMEOUT_MS - 1ms で応答 → 正常 resolve
5. **エラーメッセージ検証**: channel 名とタイムアウト値がメッセージに含まれる

**タイマーテスト方針（P13 準拠）**:

- `vi.useFakeTimers()` を使用
- `vi.advanceTimersByTime(IPC_TIMEOUT_MS)` で1ステップずつ進める
- `vi.runAllTimers()` は使用しない（無限ループ防止）

## 参照資料

| 参照資料                      | パス                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| Phase 1 成果物                | `docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-1-requirements.md` |
| 対象ファイル                  | `apps/desktop/src/preload/index.ts` (L113-117)                              |
| P13: タイマーテスト無限ループ | `.claude/rules/06-known-pitfalls.md#P13`                                    |
| セキュリティルール            | `.claude/rules/04-electron-security.md`                                     |

## 統合テスト連携

- Phase 4 で本設計に基づくテストケースを作成
- Phase 5 で本設計に基づく実装を行う
- Phase 8 で `clearTimeout` パターンへの変更を再検討（メトリクスに基づく判断）

## 成果物

| 成果物           | パス                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| 設計書（本文書） | `docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md` |

## 完了条件

- [ ] `Promise.race` パターンの詳細設計が完了
- [ ] エラーメッセージ形式が決定
- [ ] メモリリーク対策の分析が完了
- [ ] インターフェース影響分析が完了
- [ ] テスト設計方針が定義
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 3: 設計レビューへ進む。要件・設計の妥当性を検証する。
