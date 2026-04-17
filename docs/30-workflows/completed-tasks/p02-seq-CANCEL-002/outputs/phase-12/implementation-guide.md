# 実装ガイド: TASK-SW-CANCEL-002 (skill-creator-cancel-preload-api)

## メタ情報

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| タスクID | TASK-SW-CANCEL-002                                      |
| 機能名   | skill-creator-cancel-preload-api                        |
| Phase    | 12（ドキュメント更新）                                  |
| 作成日   | 2026-04-15                                              |
| 対象層   | IPC 4層のうち 層2（ホワイトリスト）・層4（Preload API） |

---

## 中学生レベルの概念説明

### 「電話番号」と「電話機」の比喩

スキル生成のキャンセルを実現するには、4つの部品が必要です。

1. **電話番号の登録（CANCEL-001: IPC_CHANNELS への追加）**
   - `skill-creator:cancel` という「電話番号」（チャンネル定数 `SKILL_CREATOR_CANCEL`）を住所録（`IPC_CHANNELS` オブジェクト）に登録しました。
   - これは「どの番号に電話をかければキャンセルできるか」を決めるステップです。

2. **電話してもいいリストへの登録（CANCEL-002: ホワイトリスト追加）**
   - セキュリティ上、すべての電話番号に勝手に電話することは禁止されています。
   - `ALLOWED_INVOKE_CHANNELS`（「電話してもいいよ」リスト）に `SKILL_CREATOR_CANCEL` を追加しました。
   - これで「この番号には電話してもいいよ」という許可が得られました。

3. **電話機の設置（CANCEL-002: cancelGeneration メソッド追加）**
   - `skillCreatorAPI.cancelGeneration()` という「電話機」（Preload API メソッド）を用意しました。
   - ボタンを押すと（メソッドを呼び出すと）、登録した電話番号に自動的に電話をかけます。

4. **相手が電話を受け取る準備（CANCEL-003: Main ハンドラー追加）**
   - 現時点では、電話をかけても相手（Mainプロセス）がまだ受話器を持っていません（CANCEL-003 で実装予定）。
   - CANCEL-003 が完了すると、はじめてキャンセルが機能します。

---

## IPC 4層における役割

Electron の IPC 通信は、セキュリティと責務分離のために 4 つの層に分かれています。

```
層1（型定義）     shared/src/ipc/channels.ts
                  ↓ チャンネル文字列の正本定義
層2（ホワイトリスト）  preload/channels.ts
                  ↓ ALLOWED_INVOKE_CHANNELS への登録（CANCEL-002 担当）
層3（Mainハンドラー）  main/ipc/skillCreatorHandlers.ts
                  ↓ ipcMain.handle() で受信・処理（CANCEL-003 担当）
層4（Preload API）  preload/skill-creator-api.ts
                  ↓ cancelGeneration() メソッドの実装（CANCEL-002 担当）
```

### CANCEL-002 が担当した層

| 層  | ファイル                                        | 変更内容                                                                |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| 層2 | `apps/desktop/src/preload/channels.ts`          | `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を追加 |
| 層4 | `apps/desktop/src/preload/skill-creator-api.ts` | `cancelGeneration: () => Promise<IpcResult<void>>` メソッドを追加       |

---

## cancelGeneration メソッドの実装パターン

### インターフェース定義（SkillCreatorAPI）

`apps/desktop/src/preload/skill-creator-api.ts` の `SkillCreatorAPI` インターフェースに以下を追加しました。

```typescript
/**
 * TASK-SW-CANCEL-002: スキル生成をキャンセルする
 * Main プロセスの cancelCurrentOperation() を IPC 経由で呼び出す
 */
cancelGeneration: () => Promise<IpcResult<void>>;
```

**追加場所**: `onApprovalRequest` メソッドの直後（ファイル末尾付近）

### 実装本体（skillCreatorAPI オブジェクト）

```typescript
// TASK-SW-CANCEL-002: スキル生成キャンセル
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

### 実装のポイント

- 引数なし（`cancelGeneration()` は何も送信しない）
- 戻り値は `IpcResult<void>`（成功/失敗の結果のみ返す）
- `safeInvoke` を通じて呼び出すことでセキュリティを担保

---

## ホワイトリスト登録の説明

### 追加した箇所

`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` 配列：

```typescript
// TASK-SW-CANCEL-002: キャンセルチャンネルをホワイトリストに追加
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

**追加場所**: `IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA` の直後（Skill Creator channels グループ内）

### なぜホワイトリストが必要か

Electron の `contextBridge` + `ipcRenderer` は、すべての IPC チャンネルへのアクセスを無条件に許可しません。
`safeInvoke` は内部で `invokeWithTimeout` を呼び出し、`ALLOWED_INVOKE_CHANNELS` に含まれないチャンネルへの呼び出しをブロックします。
これにより、悪意あるコードが任意の IPC チャンネルを呼び出すリスクを防ぎます。

---

## safeInvoke パターンの概説

```
Renderer ─[cancelGeneration()]─→ safeInvoke("skill-creator:cancel")
                                    │
                                    ├─ ALLOWED_INVOKE_CHANNELS に含まれるか確認
                                    │   ✓ 含まれる（CANCEL-002 で追加済み）
                                    │
                                    └─ invokeWithTimeout() で ipcRenderer.invoke() を呼び出す
                                        │
                                        ↓ タイムアウト付き（デフォルト: 30秒）
                                       Main ─ ipcMain.handle("skill-creator:cancel", ...)
                                              ※ CANCEL-003 で実装予定
```

`safeInvoke` の実装は `apps/desktop/src/preload/skill-creator-api.ts` の以下の部分です。

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}
```

---

## CANCEL-003 への引き継ぎ情報

CANCEL-002 完了時点の状態:

| 層  | 状態     | タスク     |
| --- | -------- | ---------- |
| 層1 | 完了     | CANCEL-001 |
| 層2 | **完了** | CANCEL-002 |
| 層3 | 未完了   | CANCEL-003 |
| 層4 | **完了** | CANCEL-002 |

### CANCEL-003 が実装すべき内容

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts` に以下を追加する必要があります。

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL, async () => {
  try {
    await skillCreatorService.cancelCurrentOperation();
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});
```

また、`apps/desktop/src/main/services/skill/SkillCreatorService.ts` に `cancelCurrentOperation()` メソッドの実装が必要です（CANCEL-003 の担当）。

### 現時点の動作

- `skillCreatorAPI.cancelGeneration()` を呼び出すと、IPC メッセージは送信される
- しかし Main プロセス側にハンドラーがないため、応答なしでタイムアウトする
- CANCEL-003 完了後に初めてキャンセルが機能する

---

## まとめ

CANCEL-002 では「電話機の設置」と「電話してもいいリストへの登録」を行いました。
CANCEL-003 で「相手が電話を受け取る準備」が完了すると、スキル生成のキャンセル機能が動作するようになります。
